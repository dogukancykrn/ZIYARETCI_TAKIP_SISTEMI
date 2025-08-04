import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Alert } from 'antd';
import { UserOutlined, IdcardOutlined, FileTextOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { visitorService } from '../services/apiService';
import { VisitorFormData } from '../types';


const { Title } = Typography;

const VisitorForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      message.success('Ziyaretçi kaydı başarıyla oluşturuldu!');
      // Formu temizle
      form.resetFields();
      setTimeout(() => setSuccess(false), 2500);
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
        {success && (
          <Alert message="Kullanıcı bilgileri başarıyla eklendi!" type="success" showIcon style={{ marginBottom: 16 }} />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
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
            { pattern: /^[0-9]+$/, message: 'TC kimlik numarası sadece rakam içermelidir!' }
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
              { min: 10, message: 'Ziyaret nedeni en az 10 karakter olmalıdır!' }
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
