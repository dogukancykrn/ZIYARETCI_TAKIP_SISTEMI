// React kütüphanesini içe aktarıyoruz
import React from "react";
// React 18'in yeni createRoot API'sini içe aktarıyoruz
import {createRoot} from "react-dom/client";

// Ana uygulama bileşenini içe aktarıyoruz
import App from './App';
// Global CSS stillerini içe aktarıyoruz
import './styles/index.css';

// Root DOM elementini alıyoruz (public/index.html'deki <div id="root">)
const container = document.getElementById('root');
// React 18'in createRoot API'si ile root oluşturuyoruz
const root = createRoot(container!);
// Ana App bileşenini render ediyoruz
root.render(<App/>);
