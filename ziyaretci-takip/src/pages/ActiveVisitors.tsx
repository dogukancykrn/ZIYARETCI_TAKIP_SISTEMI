// React hook'ları ve bileşenleri içe aktarıyoruz
import React, { useState, useEffect } from 'react';
import { message } from 'antd';
// Ant Design UI bileşenlerini içe aktarıyoruz
import { Card, Table, Button, Tag, Typography } from 'antd';
// Ant Design icon'larını içe aktarıyoruz
import { LogoutOutlined, ReloadOutlined } from '@ant-design/icons';
// API servislerini içe aktarıyoruz
import { visitorService } from '../services/apiService';  // Ziyaretçi API servisleri
// Tip tanımlarını içe aktarıyoruz
import { Visitor } from '../types';                       // Ziyaretçi tipi

// Typography bileşenlerini destructure ediyoruz
const { Title } = Typography;

// Aktif ziyaretçiler listesi bileşeni
const ActiveVisitors: React.FC = () => {
  // Ant Design dinamik tema ile uyumlu mesaj API
  const [messageApi, contextHolder] = message.useMessage();
  // Aktif ziyaretçiler listesi state'i
  const [activeVisitors, setActiveVisitors] = useState<Visitor[]>([]);
  // Veri yükleme durumu state'i
  const [loading, setLoading] = useState(false);

  // Bileşen mount olduğunda aktif ziyaretçileri API'den tekrar yükle
  useEffect(() => {
    loadActiveVisitors();
  }, []);

  // Aktif ziyaretçileri yükleyen fonksiyon - her zaman API'den güncel veri alır
  const loadActiveVisitors = async () => {
    setLoading(true);
    try {
      const visitors = await visitorService.getActiveVisitors();
      setActiveVisitors(visitors);
    } catch (error) {
      messageApi.error('Aktif ziyaretçi bilgileri yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  // Ziyaretçi çıkışı yapma fonksiyonu
  const handleExitVisitor = async (tcNumber: string) => {
    try {
      await visitorService.exitVisitorByTC(tcNumber);
      messageApi.success('Ziyaretçi çıkışı başarıyla kaydedildi!');
      loadActiveVisitors();
    } catch (error) {
      messageApi.error('Çıkış işlemi başarısız!');
    }
  };

  // Tablo kolonları tanımı
  const columns = [
    {
      title: 'Ad Soyad',              // Kolon başlığı
      dataIndex: 'fullName',         // Veri kaynağındaki alan adı
      key: 'fullName',               // Benzersiz kolon anahtarı
    },
    {
      title: 'TC Kimlik No',         // Kolon başlığı
      dataIndex: 'tcNumber',         // Veri kaynağındaki alan adı
      key: 'tcNumber',               // Benzersiz kolon anahtarı
    },
    {
      title: 'Ziyaret Nedeni',
      dataIndex: 'visitReason',
      key: 'visitReason',
    },
    {
      title: 'Giriş Saati',
      dataIndex: 'enteredAt',
      key: 'enteredAt',
      render: (date: string) => new Date(date).toLocaleString('tr-TR'),
    },
    {
      title: 'Durum',
      key: 'status',
      render: () => <Tag color="green">Aktif</Tag>,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Visitor) => (
        <Button 
          type="primary" 
          danger 
          size="small"
          icon={<LogoutOutlined />}
          onClick={() => handleExitVisitor(record.tcNumber)}
        >
          Çıkış Yap
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Ant Design dinamik tema ile uyumlu mesaj konteyneri */}
      {contextHolder}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={3} style={{ margin: 0 }}>Aktif Ziyaretçiler</Title>
          <Button 
            icon={<ReloadOutlined />} onClick={loadActiveVisitors}
            loading={loading}
          >
            Yenile
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={activeVisitors}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Aktif ziyaretçi bulunmuyor' }}
        />
      </Card>
    </div>
  );
};

export default ActiveVisitors;


