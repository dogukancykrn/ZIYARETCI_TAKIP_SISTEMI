// React hook'ları ve bileşenleri içe aktarıyoruz
import React, { useState } from 'react';
// Ant Design UI bileşenlerini içe aktarıyoruz
import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd';
// Ant Design icon'larını içe aktarıyoruz
import { UserOutlined, IdcardOutlined, SaveOutlined, ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
// API servislerini içe aktarıyoruz
import { visitorService } from '../services';        // Ziyaretçi API servisleri
// Tip tanımlarını içe aktarıyoruz
import { VisitorFormData } from '../types';          // Form veri tipi

// Typography bileşenlerini destructure ediyoruz
const { Text } = Typography;

// Ziyaretçi kayıt formu bileşeni
const VisitorForm: React.FC = () => {
  // Form yükleme durumu state'i
  const [loading, setLoading] = useState(false);
  // Hata mesajı state'i
  const [error, setError] = useState<string | null>(null);
  // Başarı durumu state'i
  const [success, setSuccess] = useState(false);
  // Son kaydedilen ziyaretçi adı state'i
  const [lastRegisteredVisitor, setLastRegisteredVisitor] = useState<string | null>(null);

  // Form sıfırlama fonksiyonu - hata ve başarı state'lerini temizler
  const handleReset = () => {
    setError(null);                    // Hata mesajını temizle
    setSuccess(false);                 // Başarı durumunu sıfırla
    setLastRegisteredVisitor(null);    // Son kayıtlı ziyaretçi bilgisini temizle
  };

  // Form submit edildiğinde çalışan fonksiyon
  const onFinish = async (values: VisitorFormData) => {
    setLoading(true);   // Yükleme durumunu aktif et
    setError(null);     // Önceki hataları temizle

    try {
      // Debug amaçlı form verisini konsola yazdır
      console.log('Form verisi gönderiliyor:', values);
      // API'ye ziyaretçi kayıt isteği gönder
      const result = await visitorService.createVisitor(values);
      console.log('API yanıtı:', result);
      
      // Cache temizleme - aktif ziyaretçi listesi güncellensin diye
      sessionStorage.removeItem('active_visitors');
      
      // Başarı durumunu ayarla
      setSuccess(true);
      setLastRegisteredVisitor(values.fullName);
      
      // Formu temizle
      form.resetFields();
      
      // 2.5 saniye sonra başarı mesajını ve ziyaretçi bilgisini temizle
      setTimeout(() => {
        setSuccess(false);
        setLastRegisteredVisitor(null);
      }, 2500);
      
    } catch (err: any) {
      // Hata durumunda detaylı log
      console.error('Kayıt hatası:', err);
      console.error('Hata detayı:', err.response);
      // Kullanıcıya gösterilecek hata mesajını ayarla
      setError(err.response?.data?.message || err.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false); // Her durumda yükleme durumunu kapat
    }
  };

  const [form] = Form.useForm();

  return (
    <div style={{ padding: '20px' }}>
      <Card title="Yeni Ziyaretçi Kaydı" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <MailOutlined style={{ color: '#8B0000', fontSize: 16, marginRight: 8 }} />
          <Text type="secondary">Her ziyaretçi kaydında sistem yöneticisine otomatik bildirim e-postası gönderilir.</Text>
        </div>
        
        {success && lastRegisteredVisitor && (
          <Alert 
            message="Başarılı!"
            description={`${lastRegisteredVisitor} isimli ziyaretçi başarıyla kaydedildi. Sistem yöneticisine otomatik olarak bildirim e-postası gönderilmiştir.`}
            type="success" 
            showIcon 
            style={{ marginBottom: 16 }} 
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onReset={handleReset}
          autoComplete="off"
          initialValues={{ fullName: '', tcNumber: '', visitReason: '' }}
        >
          <Form.Item
            name="fullName"
            label="Ad Soyad"
            rules={[{ required: true, message: 'Lütfen adınızı ve soyadınızı girin!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Ad Soyad" 
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </Form.Item>

          <Form.Item
            name="tcNumber"
            label="TC Kimlik No"
            rules={[
              { required: true, message: 'Lütfen TC kimlik numaranızı girin!' },
              { len: 11, message: 'TC kimlik numarası 11 haneli olmalıdır!' },
              { pattern: /^[0-9]+$/, message: 'TC kimlik numarası sadece rakam içermelidir!' },
              {
                validator: async (_, value) => {
                  if (!value || value.length !== 11) return;

                  // İlk hane 0 olamaz
                  if (value[0] === '0') {
                    throw new Error('TC Kimlik numarası 0 ile başlayamaz!');
                  }

                  // Tüm karakterler rakam olmalı
                  if (!/^\d{11}$/.test(value)) {
                    throw new Error('TC Kimlik numarası sadece rakamlardan oluşmalıdır!');
                  }
                }
              }
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="TC Kimlik No" 
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </Form.Item>

          <Form.Item
            name="visitReason"
            label="Ziyaret Nedeni"
            rules={[
              { required: true, message: 'Lütfen ziyaret nedeninizi girin!' },
              { min: 3, message: 'Ziyaret nedeni en az 3 karakter olmalıdır!' },
              { max: 500, message: 'Ziyaret nedeni en fazla 500 karakter olabilir!' }
            ]}
          >
           <Input.TextArea 
             placeholder="Ziyaret Nedeni" 
             rows={4} 
             autoComplete="off"
             autoCorrect="off"
             autoCapitalize="off"
             spellCheck="false"
           />
          </Form.Item>

          {error && (
            <div style={{ marginBottom: '16px' }}>
              <Typography.Text type="danger">{error}</Typography.Text>
            </div>
          )}

          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Kaydet
            </Button>
            <Button type="default" icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
              Geri
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default VisitorForm;