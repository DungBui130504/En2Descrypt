import React, { useState, useEffect, useRef } from 'react';
import "../style/three.css";
import "../style/canvas.css";
import { Offcanvas } from 'bootstrap';
import axios from 'axios';

const BoxThree = ({ imageFile, setImageFile, name, setName, idNumber, setIdNumber, signType, setSignType, text, setText }) => {
    const offcanvasRef = useRef(null);
    const [signedFile, setSignedFile] = useState(null); // file pdf đã ký
    const [keyFile, setKeyFile] = useState(null);       // file khóa public key (txt)
    const [verifyResult, setVerifyResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleOnClick = () => {
        const bsOffcanvas = new Offcanvas(offcanvasRef.current);
        bsOffcanvas.show();
        setVerifyResult(null); // reset kết quả mỗi lần mở lại offcanvas
    };

    const handleSignedFileChange = (e) => {
        setSignedFile(e.target.files[0]);
    };

    const handleKeyFileChange = (e) => {
        setKeyFile(e.target.files[0]);
    };

    const handleVerify = async () => {
        if (!signedFile || !keyFile || !name || !idNumber) {
            alert("Vui lòng chọn đầy đủ file cần thiết !");
            return;
        }

        const signature = localStorage.getItem('signature');
        if (!signature) {
            alert("Không tìm thấy chữ ký trong localStorage.");
            return;
        }

        setLoading(true);
        setVerifyResult(null);

        try {
            const formData = new FormData();
            formData.append('pdf', signedFile);
            formData.append('publicKey', keyFile); // GỬI FILE CHỨ KHÔNG ĐỌC .text()
            formData.append('name', name);
            formData.append('id', idNumber);
            formData.append('text', text);
            formData.append('signature', signature); // signature từ localStorage

            const response = await axios.post('http://localhost:3000/verify', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data && response.data.valid !== undefined) {
                setVerifyResult(response.data.valid ? "Chữ ký hợp lệ ✅" : "Chữ ký bị giả mạo ❌");
            } else {
                setVerifyResult("Không nhận được kết quả hợp lệ từ server !");
            }
        } catch (error) {
            console.error(error);
            setVerifyResult("Lỗi khi xác thực chữ ký !");
        }

        setLoading(false);
    };

    return (
        <div>
            <div className="scene-3">
                <div className="cube-3">
                    <div className="face-3 front">
                        <button onClick={handleOnClick}>Xác thực chữ ký</button>
                    </div>
                    <div className="face-3 back"></div>
                    <div className="face-3 right"></div>
                    <div className="face-3 left"></div>
                    <div className="face-3 top"></div>
                    <div className="face-3 bottom"></div>
                </div>
            </div>

            {/* Offcanvas */}
            <div
                ref={offcanvasRef}
                className="offcanvas my-canvas"
                tabIndex="-1"
                id="myOffcanvas"
                aria-labelledby="myOffcanvasLabel"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="myOffcanvasLabel">Xác thực chữ ký</h5>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Đóng"
                        onClick={() => window.location.reload()}
                    ></button>
                </div>
                <div className="offcanvas-body my-canvas-body">
                    <div style={{ marginBottom: '10px' }}>
                        <label>Chọn file đã ký: </label>
                        <input
                            type="file"
                            accept="application/pdf"
                            style={{ marginLeft: '20px', marginTop: '10px' }}
                            onChange={handleSignedFileChange}
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label>Chọn file khóa: </label>
                        <input
                            type="file"
                            accept=".txt"
                            style={{ marginLeft: '20px', marginTop: '10px' }}
                            onChange={handleKeyFileChange}
                        />
                    </div>

                    <button
                        style={{ maxWidth: '50%', padding: '10px 20px' }}
                        onClick={handleVerify}
                        disabled={loading}
                    >
                        {loading ? "Đang xác thực..." : "Xác thực"}
                    </button>

                    {verifyResult && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{verifyResult}</p>}
                </div>
            </div>
        </div>
    );
};

export default BoxThree
