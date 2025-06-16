const express = require('express');
const sql = require('mssql');
const dbConfig = require('./src/database/dbConfig.js');
const api = require('./src/api/api.js');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { readFileSync, writeFileSync, unlinkSync } = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { SignPdf, plainAddPlaceholder } = require('node-signpdf');
const signer = new SignPdf();
const fontkit = require('@pdf-lib/fontkit');
const tmp = require('tmp');
const { execSync } = require('child_process');


// Init server
const app = express();
const port = 3000;

// Init middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.post('/sign', upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), async (req, res) => {
    try {
        // 1. Load file PDF gốc
        const originalPdfBuffer = req.files['pdf'][0].buffer;
        const imageFile = req.files['image']?.[0];
        const x = parseFloat(req.body.x);
        const yClient = parseFloat(req.body.y);
        const pageNumber = parseInt(req.body.page, 10);
        const name = req.body.name;
        const id = req.body.id;
        const text = req.body.text;
        const filename = req.body.filename || 'signed.pdf';

        // 2. Load PDF và nhúng font
        const pdfDoc = await PDFDocument.load(originalPdfBuffer);
        pdfDoc.registerFontkit(fontkit);
        const fontBytes = readFileSync('./src/fonts/Roboto-Regular.ttf'); // hoặc font bạn muốn
        const customFont = await pdfDoc.embedFont(fontBytes);

        // 3. Tính lại tọa độ
        const pages = pdfDoc.getPages();
        const page = pages[pageNumber - 1];
        const { height } = page.getSize();
        const y = height - yClient;

        // 4. Nhúng ảnh nếu có
        let embeddedImage = null;
        if (imageFile) {
            if (imageFile.mimetype === 'image/png') {
                embeddedImage = await pdfDoc.embedPng(imageFile.buffer);
            } else if (imageFile.mimetype === 'image/jpeg') {
                embeddedImage = await pdfDoc.embedJpg(imageFile.buffer);
            } else {
                throw new Error('Unsupported image format. Only PNG and JPEG are supported.');
            }
        }

        // 5. Vẽ text, ảnh hoặc cả hai
        const signatureText = `Người ký: ${name || '---'}\nSố giấy tờ: ${id || '---'}\nThông tin khác: ${text || ''}`;

        if (embeddedImage) {
            const imgWidth = 100;
            const imgHeight = (embeddedImage.height / embeddedImage.width) * imgWidth;

            page.drawImage(embeddedImage, {
                x,
                y,
                width: imgWidth,
                height: imgHeight,
            });

            page.drawText(signatureText, {
                x,
                y: y - imgHeight + 40,
                size: 12,
                font: customFont,
                color: rgb(0, 0, 0),
                lineHeight: 14,
            });
        } else {
            page.drawText(signatureText, {
                x,
                y,
                size: 12,
                font: customFont,
                color: rgb(0, 0, 0),
                lineHeight: 14,
            });
        }

        // 6. Lưu lại file PDF đã thêm nội dung hiển thị
        const updatedPdfBuffer = Buffer.from(await pdfDoc.save({ useObjectStreams: false }));

        // 7. Thêm vùng placeholder để ký số
        const pdfWithPlaceholder = plainAddPlaceholder({
            pdfBuffer: updatedPdfBuffer,
            reason: 'Tôi đồng ý ký số tài liệu này',
            signatureLength: 8192, // đủ lớn để chứa chữ ký
        });

        // 8. Ký số bằng certificate.p12
        const p12Buffer = readFileSync('./src/certs/user.p12');
        const signedPdf = signer.sign(pdfWithPlaceholder, p12Buffer, {
            passphrase: '1235',
        });

        // 9. Gửi về kết quả
        res.json({
            filename,
            signedPdfBase64: signedPdf.toString('base64'),
            message: 'PDF đã ký thành công',
        });

    } catch (err) {
        console.error('❌ Lỗi khi ký PDF:', err);
        res.status(500).send('Có lỗi xảy ra khi ký PDF');
    }
});

app.post('/verify', upload.single('pdf'), async (req, res) => {
    try {
        const pdfBuffer = req.file.buffer;
        const pdfStr = pdfBuffer.toString('latin1');

        // 1. Tìm ByteRange trong file PDF
        const byteRangeMatch = /\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/.exec(pdfStr);
        if (!byteRangeMatch) {
            return res.status(400).json({ valid: false, message: '❌ Không tìm thấy ByteRange trong PDF' });
        }

        const [start1, len1, start2, len2] = byteRangeMatch.slice(1).map(Number);

        // 2. Ghép các phần dữ liệu chưa bị ký
        const signedData = Buffer.concat([
            pdfBuffer.slice(start1, start1 + len1),
            pdfBuffer.slice(start2, start2 + len2)
        ]);

        // 3. Trích xuất chữ ký từ PDF (định dạng hex giữa dấu < >)
        const signatureSegment = pdfBuffer.slice(start1 + len1, start2).toString('latin1');
        const hexMatch = signatureSegment.match(/<([0-9A-Fa-f\s]+)>/);
        if (!hexMatch) {
            return res.status(400).json({ valid: false, message: '❌ Không tìm thấy chữ ký hex trong PDF' });
        }

        const signatureHex = hexMatch[1].replace(/\s+/g, '').replace(/(00)+$/, '');
        const signatureBuffer = Buffer.from(signatureHex, 'hex');

        // 4. Ghi ra các file tạm
        const signedFilePath = tmp.tmpNameSync();
        const sigFilePath = tmp.tmpNameSync();
        const caCertPath = './src/certs/ca.pem';

        writeFileSync(signedFilePath, signedData);
        writeFileSync(sigFilePath, signatureBuffer);

        // 5. Dùng OpenSSL để xác minh chữ ký
        let verified = false;
        let output = '';

        try {
            output = execSync(`openssl smime -verify -in "${sigFilePath}" -inform DER -content "${signedFilePath}" -CAfile "${caCertPath}"`).toString();
            verified = true;
        } catch (err) {
            output = err.stderr ? err.stderr.toString() : err.message;
        }

        // 6. Dọn file tạm
        unlinkSync(signedFilePath);
        unlinkSync(sigFilePath);

        res.json({
            valid: verified,
            message: verified ? '✅ Chữ ký hợp lệ' : '❌ Chữ ký không hợp lệ',
            opensslOutput: output
        });

    } catch (err) {
        console.error('❌ Lỗi xác minh với OpenSSL:', err);
        res.status(500).json({ valid: false, message: '❌ Lỗi server khi xác minh' });
    }
});

app.use('/api', api);

// Listen server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}/api`);
});
