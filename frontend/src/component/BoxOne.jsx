import React, { useState, useEffect, useRef } from 'react';
import "../style/one.css";
import "../style/canvas.css";
import { Offcanvas } from 'bootstrap';
import Sign from '../component/Sign';

const BoxOne = ({ ...propsToChild }) => {
    const offcanvasRef = useRef(null);

    const handleOnClick = () => {
        const bsOffcanvas = new Offcanvas(offcanvasRef.current);
        bsOffcanvas.show();
    };

    return (
        <div>
            <div className="scene">
                <div className="cube">
                    <div className="face-1 front">
                        <button onClick={handleOnClick}>
                            Ký văn bản
                        </button>
                    </div>
                    <div className="face-1 back"></div>
                    <div className="face-1 right"></div>
                    <div className="face-1 left"></div>
                    <div className="face-1 top"></div>
                    <div className="face-1 bottom"></div>
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
                    <h5 className="offcanvas-title" id="myOffcanvasLabel">Ký văn bản</h5>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Đóng"
                    ></button>
                </div>
                <div className="offcanvas-body my-canvas-body">

                    <div className='file-container'>
                        <Sign {...propsToChild} />
                    </div>

                    <div className='captcha-container'></div>

                </div>
            </div>
        </div>
    )
}

export default BoxOne
