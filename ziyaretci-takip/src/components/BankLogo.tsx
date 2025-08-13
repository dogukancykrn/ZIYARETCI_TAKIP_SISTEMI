// React kütüphanesini içe aktarıyoruz
import React from 'react';

// BankLogo bileşeni için props interface'i
interface BankLogoProps {
  size?: number;           // Logo boyutu (opsiyonel, varsayılan: 32)
  color?: string;          // Logo rengi (opsiyonel, varsayılan: mevcut renk)
  showText?: boolean;      // Metin gösterilsin mi? (opsiyonel, varsayılan: true)
}

// Ziraat Bankası logosu bileşeni
const BankLogo: React.FC<BankLogoProps> = ({ 
  size = 32, 
  color = 'currentColor', 
  showText = true 
}) => {
  return (
    <div style={{ 
      display: 'flex',           // Flexbox layout
      alignItems: 'center',      // Dikey ortalama
      gap: '8px',               // Logo ve metin arası boşluk
      color: color              // Dinamik renk
    }}>
      {/* Buğday emoji ile basit logo temsili */}
      <span style={{ fontSize: size }}>🌾</span>
      
      {/* Bank adı metni (showText true ise göster) */}
      {showText && (
        <span style={{ 
          fontSize: size * 0.6,    // Logo boyutuna orantılı font
          fontWeight: 'bold',      // Kalın yazı
          whiteSpace: 'nowrap'     // Satır kırılmasını engelle
        }}>
          Ziraat Bankası
        </span>
      )}
    </div>
  );
};

// BankLogo bileşenini varsayılan export olarak dışa aktarıyoruz
export default BankLogo;