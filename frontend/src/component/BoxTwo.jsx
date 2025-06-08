import React, { useState, useEffect, useRef } from 'react';
import { Offcanvas } from 'bootstrap';
import "../style/two.css";
import "../style/canvas.css";

const BoxTwo = ({ imageFile, setImageFile, name, setName, idNumber, setIdNumber, signType, setSignType, text, setText }) => {
    const offcanvasRef = useRef(null);

    const handleOnClick = () => {
        const bsOffcanvas = new Offcanvas(offcanvasRef.current);
        bsOffcanvas.show();
    };

    useEffect(() => {
        const fetchDefaultImage = async () => {
            try {
                const response = await fetch('/images/sign.png');
                const blob = await response.blob();
                const defaultFile = new File([blob], 'sign.png', { type: blob.type });
                setImageFile(defaultFile);
            } catch (error) {
                console.error('Không thể tải ảnh chữ ký mặc định:', error);
            }
        };

        fetchDefaultImage();
    }, []);

    return (
        <div>
            <div className="scene-2">
                <div className="cube-2">
                    <div className="face-2 front">
                        <button onClick={handleOnClick}>Tùy chỉnh thông tin</button>
                    </div>
                    <div className="face-2 back"></div>
                    <div className="face-2 right"></div>
                    <div className="face-2 left"></div>
                    <div className="face-2 top"></div>
                    <div className="face-2 bottom"></div>
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
                    <h5 className="offcanvas-title" id="myOffcanvasLabel">Tùy chỉnh thông tin</h5>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Đóng"
                    ></button>
                </div>
                <div className="offcanvas-body my-canvas-body">

                    <div className='user-infor'>
                        <p>Nội dung chữ ký</p>
                        <table className="table table-hover">
                            <tbody>
                                <tr>
                                    <td>Họ và tên</td>
                                    <td>Số giấy tờ</td>
                                </tr>
                                <tr>
                                    <td>
                                        <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} />
                                    </td>
                                    <td>
                                        <input type="text" value={idNumber} onChange={(e) => { setIdNumber(e.target.value) }} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ width: '100%' }}>
                            <p>Thông tin khác</p>
                            <textarea style={{ width: '100%', height: '100px' }}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            ></textarea>
                        </div>

                        <p>Định dạng chữ ký</p>

                        <div className='sign-option'>
                            <div>
                                {/* Chọn ảnh chữ ký */}
                                {(signType == 'image-only' || signType == 'image-text') &&
                                    <div style={{ marginBottom: '10px' }}>
                                        <label>Chọn ảnh chữ ký: </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                            style={{ marginLeft: '20px', marginTop: '10px' }}
                                        />
                                    </div>
                                }

                                {/* Lựa chọn loại ký */}
                                <div style={{ marginBottom: '10px' }}>
                                    <label>
                                        <input
                                            type="radio"
                                            name="signType"
                                            value="text-only"
                                            checked={signType === 'text-only'}
                                            onChange={(e) => setSignType(e.target.value)}
                                        />
                                        <p style={{ display: 'inline', marginLeft: '10px' }}>Chỉ ký bằng chữ</p>
                                    </label>
                                    <br />
                                    <label>
                                        <input
                                            type="radio"
                                            name="signType"
                                            value="image-only"
                                            checked={signType === 'image-only'}
                                            onChange={(e) => setSignType(e.target.value)}
                                        />
                                        <p style={{ display: 'inline', marginLeft: '10px' }}>Chỉ ký bằng hình ảnh</p>
                                    </label>
                                    <br />
                                    <label>
                                        <input
                                            type="radio"
                                            name="signType"
                                            value="image-text"
                                            checked={signType === 'image-text'}
                                            onChange={(e) => setSignType(e.target.value)}
                                        />
                                        <p style={{ display: 'inline', marginLeft: '10px' }}>Ký bằng hình ảnh + nội dung chữ ký</p>
                                    </label>

                                </div>
                            </div>


                            {/* Vùng xem trước chữ ký số */}
                            <div
                                style={{
                                    border: '1px dashed #555',
                                    padding: '10px',
                                    marginBottom: '20px',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '60%',
                                }}
                            >
                                {imageFile && (signType == 'image-only' || signType == 'image-text') &&
                                    <img src={URL.createObjectURL(imageFile)} alt="ảnh chữ ký"
                                        style={{
                                            maxWidth: '50%',
                                            maxHeight: '30%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                }

                                {(signType == 'text-only' || signType == 'image-text') &&
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <p style={{ padding: '0', margin: '0' }}>Họ và tên: {name}</p>
                                        <p>Số giấy tờ: {idNumber}</p>
                                    </div>
                                }


                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div >
    )
}

export default BoxTwo
