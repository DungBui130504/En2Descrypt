const express = require('express');
const sql = require('mssql');
const dbConfig = require('./src/database/dbConfig.js');
const api = require('./src/api/api.js');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { default: signer, plainAddPlaceholder } = require('node-signpdf');
const { readFileSync } = require('fs');
const fontBytes = fs.readFileSync('./src/fonts/Roboto-Regular.ttf');
const fontkit = require('@pdf-lib/fontkit');
const { generateKeyPairSync } = require('crypto');
const { generateKeyPair, signMessage, verifySignature } = require('./src/scrypt/rsaSIgn.js');
const { extractSignatureBase64 } = require('./src/util/base64parse.js');
const { splitStringByLength } = require('./src/helper/slpitString.js');

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

function sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '-');
}

app.post('/sign', upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), async (req, res) => {
    try {
        const originalPdfBuffer = req.files['pdf'][0].buffer;
        const imageFile = req.files['image']?.[0];

        const x = parseFloat(req.body.x);
        const yClient = parseFloat(req.body.y);
        const pageNumber = parseInt(req.body.page, 10);

        const pdfDoc = await PDFDocument.load(originalPdfBuffer);
        pdfDoc.registerFontkit(fontkit);
        const customFont = await pdfDoc.embedFont(fontBytes);

        const pages = pdfDoc.getPages();
        const page = pages[pageNumber - 1];

        const { height } = page.getSize();
        const y = height - yClient; // chuyển tọa độ từ client về PDF

        const name = req.body.name;
        const id = req.body.id;
        const text = req.body.text;

        // Tạo message
        const message = name + id + text;

        const { publicKey, privateKey } = generateKeyPair();

        const signature = signMessage(message, privateKey).toString('base64');

        // 👉 Nhúng ảnh nếu có
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

        // 👉 Nếu chỉ có text (không có ảnh)
        if (!embeddedImage && name && id) {
            page.drawText(
                `${splitStringByLength(signature.toString('base64'))}`,
                {
                    x,
                    y,
                    size: 12,
                    font: customFont,
                    color: rgb(0, 0, 0),
                    lineHeight: 14,
                }
            );
        }

        // 👉 Nếu có ảnh
        if (embeddedImage) {
            const imageWidth = 100;
            const imageHeight = (embeddedImage.height / embeddedImage.width) * imageWidth;

            // Ảnh không có text
            if (!name && !id) {
                page.drawImage(embeddedImage, {
                    x,
                    y,
                    width: imageWidth,
                    height: imageHeight,
                });
            }

            // Ảnh + thông tin
            if (name && id) {
                page.drawImage(embeddedImage, {
                    x,
                    y,
                    width: imageWidth,
                    height: imageHeight,
                });

                const textY = y - imageHeight + 40;

                page.drawText(
                    `${splitStringByLength(signature.toString('base64'))}`,
                    {
                        x,
                        y: textY,
                        size: 12,
                        font: customFont,
                        color: rgb(0, 0, 0),
                        lineHeight: 14,
                    }
                );
            }
        }

        // 🔏 Tạo buffer PDF đã chèn
        const updatedPdfBuffer = Buffer.from(await pdfDoc.save({ useObjectStreams: false }));

        // ➕ Thêm placeholder để ký số
        const pdfWithPlaceholder = plainAddPlaceholder({
            pdfBuffer: updatedPdfBuffer,
            name: name,
            id: id
        });

        // 🔐 Ký số
        const p12Buffer = readFileSync('./src/certs/certificate.p12');
        const signedPdf = signer.sign(pdfWithPlaceholder, p12Buffer, {
            passphrase: '1235',
        });

        // 📤 Gửi kết quả
        let filename = req.body.filename || 'signed.pdf';
        filename = sanitizeFilename(filename);

        const signedPdfBase64 = signedPdf.toString('base64'); // buffer => base64

        res.json({
            filename,
            signedPdfBase64,
            publicKey: publicKey,
            signature: signature.toString('base64')
        });

    } catch (err) {
        console.error('❌ Error signing PDF:', err);
        res.status(500).send('Error signing PDF');
    }
});

app.post('/verify', upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'publicKey', maxCount: 1 }
]), (req, res) => {
    try {
        const name = req.body.name;
        const id = req.body.id;
        const text = req.body.text;
        const signatureBuffer = Buffer.from(req.body.signature, 'base64');

        const pdfBuffer = req.files['pdf'][0].buffer;
        const publicKeyBuffer = req.files['publicKey'][0].buffer;
        const publicKeyPem = publicKeyBuffer.toString('utf-8');


        // Tạo message
        const message = name + id + text;

        const isValid = verifySignature(message, signatureBuffer, publicKeyPem);


        if (isValid) {
            res.json({ valid: true, message: '✔️ Chữ ký hợp lệ!' });
        } else {
            res.json({ valid: false, message: '❌ Chữ ký không hợp lệ!' });
        }

    } catch (err) {
        console.error('Error verifying signature:', err);
        res.status(500).send('Lỗi máy chủ khi kiểm tra chữ ký');
    }
});



// Import API
app.use('/api', api);

// Listen server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}/api`);
});
