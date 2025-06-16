import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function PDFViewer({ file, originalFile, imageFile, setImageFile, name, setName, idNumber, setIdNumber, signType, setSignType, text, setText }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const pageWrapperRef = useRef(null);

    // console.log(imageFile, name, idNumber, signType);

    const allowClick =
        signType === 'text-only' ||
        (imageFile && (signType === 'image-only' || signType === 'image-text'));


    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const handleClick = async (event) => {
        const wrapper = pageWrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // console.log('Toạ độ click:', x, y);

        const formData = new FormData();
        formData.append('pdf', originalFile);
        formData.append('x', x);
        formData.append('y', y);
        formData.append('page', pageNumber);
        formData.append('filename', originalFile.name);

        if (signType === 'text-only') {
            formData.append('name', name);
            formData.append('id', idNumber);
            formData.append('text', text);
        }

        if (imageFile && signType === 'image-only') {
            formData.append('image', imageFile);
        }

        if (imageFile && signType === 'image-text') {
            formData.append('image', imageFile);
            formData.append('name', name);
            formData.append('id', idNumber);
            formData.append('text', text);
        }


        try {
            const res = await axios.post('http://localhost:3000/sign', formData);

            const { signedPdfBase64, publicKey, filename } = res.data;

            // --- Giải mã PDF base64 thành Blob ---
            const byteCharacters = atob(signedPdfBase64);
            const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
            const byteArray = new Uint8Array(byteNumbers);
            const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });

            // --- Xử lý tên file PDF đã ký ---
            let newFilename = filename || 'signed.pdf';
            const dotIndex = newFilename.lastIndexOf('.');
            if (dotIndex !== -1) {
                newFilename = newFilename.slice(0, dotIndex) + '(signed)' + newFilename.slice(dotIndex);
            } else {
                newFilename += '(signed).pdf';
            }

            // --- Tải PDF ---
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const pdfLink = document.createElement('a');
            pdfLink.href = pdfUrl;
            pdfLink.setAttribute('download', newFilename);
            document.body.appendChild(pdfLink);
            pdfLink.click();
            pdfLink.remove();

        } catch (error) {
            console.error('Error signing PDF:', error);
            alert('Lỗi khi ký PDF, thử lại sau!');
        }

    };



    return (
        <>
            <div style={{ marginTop: '20px' }}>

                {/* PDF và click ký */}
                <div
                    ref={pageWrapperRef}
                    onClick={handleClick}
                    style={{
                        cursor: allowClick ? 'crosshair' : 'not-allowed',
                        border: '2px solid #333',
                        display: 'inline-block',
                        padding: '8px',
                        backgroundColor: '#fff',
                    }}
                >
                    <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                        <Page pageNumber={pageNumber} />
                    </Document>
                </div>

                {/* Điều hướng trang */}
                <p>Trang {pageNumber} / {numPages}</p>
                <button onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))} disabled={pageNumber <= 1}>
                    Trang trước
                </button>
                <button
                    onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
                    disabled={pageNumber >= numPages}
                    style={{ marginLeft: '10px' }}
                >
                    Trang sau
                </button>
            </div>
        </>
    );
}

export default PDFViewer;
