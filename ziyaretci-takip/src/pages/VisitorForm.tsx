import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd';
import { UserOutlined, IdcardOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { visitorService } from '../services/apiService';
import { VisitorFormData } from '../types';


const VisitorForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastRegisteredVisitor, setLastRegisteredVisitor] = useState<string | null>(null);

  // Form temizlendiğinde error state'ini sıfırla
  const handleReset = () => {
    setError(null);
    setSuccess(false);
    setLastRegisteredVisitor(null);
  };

  const onFinish = async (values: VisitorFormData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Form verisi gönderiliyor:', values);
      const result = await visitorService.createVisitor(values);
      console.log('API yanıtı:', result);
      // Aktif ziyaretçi cache'ini temizle
      sessionStorage.removeItem('active_visitors');
      setSuccess(true);
      setLastRegisteredVisitor(values.fullName);
      // Formu temizle
      form.resetFields();
      // 2.5 saniye sonra success state'i ve lastRegisteredVisitor'ı resetle
      setTimeout(() => {
        setSuccess(false);
        setLastRegisteredVisitor(null);
      }, 2500);
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      console.error('Hata detayı:', err.response);
      setError(err.response?.data?.message || err.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const [form] = Form.useForm();

  return (
    <div style={{ padding: '20px' }}>
      <Card title="Yeni Ziyaretçi Kaydı" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {success && lastRegisteredVisitor && (
          <Alert 
            message="Başarılı!"
            description={`${lastRegisteredVisitor} isimli ziyaretçi başarıyla kaydedildi.`}
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
