import React, { useState } from 'react';
import PDFViewer from './PDFViewer';

const Sign = ({ ...propsToChild }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileUrl(URL.createObjectURL(file));
        setSelectedFile(file);
    };

    return (
        <div>
            <h4>Chọn file PDF để ký</h4>
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            {fileUrl && <PDFViewer file={fileUrl} originalFile={selectedFile} {...propsToChild} />}
        </div>
    );
}

export default Sign
