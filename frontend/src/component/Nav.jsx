import React from 'react';
import "../style/Nav.css"

const Nav = () => {
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-dark fixed-top my-nav">
                <div className="container-fluid">
                    <button className="navbar-toggler custom-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation" style={{ color: 'white' }}>
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <a className="navbar-brand" href="#" style={{ color: 'white' }}>En2Decyrpt</a>
                    <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 my-ul">
                            <li className="nav-item my-li">
                                <a className="nav-link" aria-current="page" href="#" style={{ color: 'white' }}>Ký văn bản</a>
                            </li>
                            <li className="nav-item my-li">
                                <a className="nav-link" href="#" style={{ color: 'white' }}>Kiểm tra văn bản</a>
                            </li>
                            <li className="nav-item my-li">
                                <a className="nav-link" href="#" tabindex="-1" aria-disabled="true" style={{ color: 'white' }}>Chỉnh sửa thông tin chữ ký</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Nav
