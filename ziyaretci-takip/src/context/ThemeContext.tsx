// React hook'ları ve context API'sini içe aktarıyoruz
import React, { createContext, useContext, useState, useEffect } from "react";

// Tema context'inin sahip olacağı fonksiyon ve değerleri tanımlayan interface
interface ThemeContextType {
  isDarkMode: boolean;        // Karanlık mod aktif mi? (true/false)
  toggleDarkMode: () => void; // Karanlık modu değiştiren fonksiyon
}

// ThemeContext'i oluştur - başlangıçta undefined
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider bileşeni - tema state'ini yönetir ve çocuk bileşenlere sağlar
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Karanlık mod state'i - localStorage'dan başlangıç değerini al
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // localStorage'dan kaydedilmiş tema tercihini al
    const saved = localStorage.getItem("theme");
    // Eğer "dark" ise true döndür, değilse false
    return saved === "dark";
  });

  // isDarkMode değiştiğinde localStorage'a kaydet
  useEffect(() => {
    // Tema tercihini localStorage'a kaydet
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]); // isDarkMode dependency olarak verilmiş

  // Tema modunu değiştiren fonksiyon - mevcut durumun tersini ayarlar
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Context provider ile değerleri çocuk bileşenlere sağla
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme hook'u - ThemeContext'i kullanmak için custom hook
export const useTheme = () => {
  // Context'i al
  const context = useContext(ThemeContext);
  // Eğer context undefined ise hata fırlat (Provider dışında kullanıldığı anlamına gelir)
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  // Context'i döndür
  return context;
};
