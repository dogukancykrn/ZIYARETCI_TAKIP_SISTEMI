// React hook'ları ve bileşenleri içe aktarıyoruz
import React, { useEffect, useState } from 'react';
// Ant Design UI bileşenlerini içe aktarıyoruz
import { Card, Row, Col, Statistic, Button, Space, Typography, Table, Tag, message } from 'antd';
// Ant Design icon'larını içe aktarıyoruz
import { UserOutlined, LoginOutlined, LogoutOutlined, ClockCircleOutlined, PlusOutlined, HistoryOutlined, BarChartOutlined } from '@ant-design/icons';
// React Router navigation hook'unu içe aktarıyoruz
import { useNavigate } from 'react-router-dom';
// API servislerini içe aktarıyoruz
import { visitorService } from '../services';        // Ziyaretçi servisleri
// Tip tanımlarını içe aktarıyoruz
import { Visitor } from '../types';                  // Ziyaretçi tipi
// Context hook'unu içe aktarıyoruz
import { useAuth } from '../context/AuthContext';   // Kimlik doğrulama context'i

// Typography'den Title bileşenini destructure ediyoruz
const { Title } = Typography;

// Dashboard ana sayfası bileşeni
const Dashboard: React.FC = () => {
  // Aktif ziyaretçiler state'i
  const [activeVisitors, setActiveVisitors] = useState<Visitor[]>([]);
  // Yükleme durumu state'i
  const [loading, setLoading] = useState(false);
  // İstatistik verileri state'i
  const [stats, setStats] = useState({
    totalActive: 0,   // Toplam aktif ziyaretçi sayısı
    todayVisits: 0,   // Bugünkü ziyaret sayısı
    totalVisits: 0    // Toplam ziyaret sayısı
  });
  // Auth context'ten admin bilgilerini al
  const { admin } = useAuth();
  // Sayfa yönlendirme hook'u
  const navigate = useNavigate();

  // Bileşen mount olduğunda veri yükle
  useEffect(() => {
    loadData();
  }, []); // Dependency array boş - sadece mount olduğunda çalış

  // Dashboard verilerini yükleyen fonksiyon
  const loadData = async () => {
    setLoading(true); // Yükleme durumunu aktif et
    try {
      // Hem aktif ziyaretçileri hem de tüm geçmişi paralel olarak çek
      const [activeVisitorsData, allVisitorsData] = await Promise.all([
        visitorService.getActiveVisitors(),    // Aktif ziyaretçiler
        visitorService.getVisitorHistory()     // Tüm ziyaretçi geçmişi
      ]);

      // Aktif ziyaretçiler state'ini güncelle
      setActiveVisitors(activeVisitorsData);

      // İstatistikleri hesapla
      const today = new Date().toDateString(); // Bugünün tarih string'i
      // Bugün giriş yapan ziyaretçileri filtrele
      const todayVisits = allVisitorsData.filter(v => 
        new Date(v.enteredAt).toDateString() === today
      ).length;

      // İstatistikleri state'e kaydet
      setStats({
        totalActive: activeVisitorsData.length, // Aktif ziyaretçi sayısı
        todayVisits: todayVisits,               // Bugünkü ziyaret sayısı
        totalVisits: allVisitorsData.length     // Toplam ziyaret sayısı
      });
    } catch (error) {
      // Hata durumunda kullanıcıya mesaj göster
      message.error('Ziyaretçi bilgileri yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleExitVisitor = async (tcNumber: string) => {
    try {
  await visitorService.exitVisitorByTC(tcNumber);
  // ActiveVisitors sayfasındaki cache’i temizle
  sessionStorage.removeItem('active_visitors');
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
          <Button 
            icon={<BarChartOutlined />} 
            size="large"
            onClick={() => navigate('/dashboard/analytics')}
            type="dashed"
          >
            Yoğunluk Analizi
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