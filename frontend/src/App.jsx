import { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import Nav from './component/Nav';
import BoxOne from './component/BoxOne';
import BoxTwo from './component/BoxTwo';
import BoxThree from './component/BoxThree';
import Header from './component/Header';
import Footer from './component/Footer';

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState('Bùi Xuân Dũng');
  const [idNumber, setIdNumber] = useState(123456789);
  const [text, setText] = useState('');
  const [signType, setSignType] = useState('text-only');


  const propsToChild = {
    imageFile,
    setImageFile,
    name,
    setName,
    idNumber,
    setIdNumber,
    text,
    setText,
    signType,
    setSignType
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
    <>
      <div className='main-container'>

        <div className='block'>
          <BoxOne  {...propsToChild} />
          <BoxTwo {...propsToChild} />
          <BoxThree {...propsToChild} />
        </div>

        <div className='block-2'>
          <Header />
          <Footer />
        </div>

      </div>

    </>
  );
}

export default App;
