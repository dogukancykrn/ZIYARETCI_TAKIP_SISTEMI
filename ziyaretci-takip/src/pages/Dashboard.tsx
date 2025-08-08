import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Typography, Table, Tag, message } from 'antd';
import { UserOutlined, LoginOutlined, LogoutOutlined, ClockCircleOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { visitorService } from '../services';
import { Visitor } from '../types';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [activeVisitors, setActiveVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalActive: 0,
    todayVisits: 0,
    totalVisits: 0
  });
  const { admin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Hem aktif ziyaretçileri hem de tüm geçmişi çek
      const [activeVisitorsData, allVisitorsData] = await Promise.all([
        visitorService.getActiveVisitors(),
        visitorService.getVisitorHistory()
      ]);

      setActiveVisitors(activeVisitorsData);

      // İstatistikleri hesapla
      const today = new Date().toDateString();
      const todayVisits = allVisitorsData.filter(v => 
        new Date(v.enteredAt).toDateString() === today
      ).length;

      setStats({
        totalActive: activeVisitorsData.length,
        todayVisits: todayVisits,
        totalVisits: allVisitorsData.length
      });
    } catch (error) {
      message.error('Ziyaretçi bilgileri yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleExitVisitor = async (tcNumber: string) => {
    try {
      await visitorService.exitVisitorByTC(tcNumber);
      message.success('Ziyaretçi çıkışı başarıyla kaydedildi!');
      loadData(); // Listeyi yenile
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
      render: (_, record: Visitor) => (
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
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Hoş Geldiniz, {admin?.fullName}</Title>
        <Typography.Text type="secondary">
          Ziyaretçi Takip Sistemi - Ana Panel
        </Typography.Text>
      </div>

      {/* ÜST BÖLÜMDEKİ İSTATİSTİKLER */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Aktif Ziyaretçiler"
              value={stats.totalActive}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Bugünkü Ziyaretler"
              value={stats.todayVisits}
              prefix={<LoginOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Toplam Ziyaret"
              value={stats.totalVisits}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Hızlı İşlemler */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Hızlı İşlemler</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => navigate('/dashboard/visitor-registration')}
          >
            Yeni Ziyaretçi Ekle
          </Button>
          <Button 
            icon={<HistoryOutlined />} 
            size="large"
            onClick={() => navigate('/dashboard/visitor-history')}
          >
            Tüm Ziyaretçiler
          </Button>
        </Space>
      </Card>

      {/* Aktif Ziyaretçiler Tablosu */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0 }}>Aktif Ziyaretçiler</Title>
          <Button onClick={loadData} loading={loading}>
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

export default Dashboard;