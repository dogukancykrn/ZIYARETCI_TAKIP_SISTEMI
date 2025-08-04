import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, message, Typography } from 'antd';
import { LogoutOutlined, ReloadOutlined } from '@ant-design/icons';
import { visitorService } from '../services/apiService';
import { Visitor } from '../types';

const { Title } = Typography;

const ActiveVisitors: React.FC = () => {
  const [activeVisitors, setActiveVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActiveVisitors();
  }, []);

  const loadActiveVisitors = async () => {
    setLoading(true);
    try {
      const cached = sessionStorage.getItem("active_visitors");

      if (cached) {
        setActiveVisitors(JSON.parse(cached));
        console.log("🟢 Veri sessionStorage'tan geldi");
      } else {
        const visitors = await visitorService.getActiveVisitors();
        setActiveVisitors(visitors);
        sessionStorage.setItem("active_visitors", JSON.stringify(visitors));
        console.log("🟢 Veri API'den geldi ve cache'e yazıldı");
      }
    } catch (error) {
      message.error('Aktif ziyaretçi bilgileri yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleExitVisitor = async (tcNumber: string) => {
    try {
      await visitorService.exitVisitorByTC(tcNumber);
      sessionStorage.removeItem("active_visitors"); // 🧽 Cache'i temizle
      message.success('Ziyaretçi çıkışı başarıyla kaydedildi!');
      loadActiveVisitors(); // Listeyi yenile
    } catch (error) {
      message.error('Çıkış işlemi başarısız!');
    }
  };

  const columns = [
    {
      title: 'Ad Soyad',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'TC Kimlik No',
      dataIndex: 'tcNumber',
      key: 'tcNumber',
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
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={3} style={{ margin: 0 }}>Aktif Ziyaretçiler</Title>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              sessionStorage.removeItem("active_visitors"); // ❗️Yenile butonuna özel: Cache’i de temizlesin
              loadActiveVisitors();
            }} 
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


