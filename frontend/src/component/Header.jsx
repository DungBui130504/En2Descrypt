import React from 'react';
import "../style/Header.css";

const Header = () => {
    return (
        <div className="scene-H">
            <div className="cube-H">
                <div className="face-H front-H"></div>
                <div className="face-H back"></div>
                <div className="face-H right"></div>
                <div className="face-H left"></div>
                <div className="face-H top"></div>
                <div className="face-H bottom"></div>
            </div>
        </div>
    )
}

export default Header
