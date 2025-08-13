// Excel dosya işlemleri için XLSX kütüphanesini içe aktarıyoruz
import * as XLSX from 'xlsx';
// PDF oluşturma için jsPDF kütüphanesini içe aktarıyoruz
import { jsPDF } from 'jspdf';
// PDF tabloları için autoTable eklentisini içe aktarıyoruz
import autoTable from 'jspdf-autotable';
// API servislerini içe aktarıyoruz
import { visitorService } from '../services';     // Ziyaretçi API servisleri
// Tip tanımlarını içe aktarıyoruz
import { Visitor } from '../types';               // Ziyaretçi tipi

// Ant Design UI bileşenlerini içe aktarıyoruz
import { Typography, DatePicker, message, Form, Tag, Card, Input, Col, Row, Space, Button, Dropdown, Table } from 'antd';
// Ant Design Table tipini içe aktarıyoruz
import type { TableProps } from 'antd';
// Ant Design icon'larını içe aktarıyoruz
import { ReloadOutlined, DownloadOutlined, FileExcelOutlined, FilePdfOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
// React hook'ları ve bileşenleri içe aktarıyoruz
import React, { useState, useEffect } from 'react';

// Typography ve DatePicker bileşenlerini destructure ediyoruz
const { Title } = Typography;
const { RangePicker } = DatePicker;

// Ziyaretçi geçmişi ve raporlama bileşeni
const VisitorHistory: React.FC = () => {
  // Tüm ziyaretçiler listesi state'i
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  // Filtrelenmiş ziyaretçiler listesi state'i
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  // Veri yükleme durumu state'i
  const [loading, setLoading] = useState(false);
  // Arama formu hook'u
  const [form] = Form.useForm();

  // Bileşen mount olduğunda ziyaretçi geçmişini yükle
  useEffect(() => {
    loadVisitorHistory();
  }, []); // Dependency array boş - sadece mount olduğunda çalış

  // Ziyaretçi geçmişini API'den yükleyen fonksiyon
  const loadVisitorHistory = async () => {
    setLoading(true); // Yükleme durumunu aktif et
    try {
      // API'den tüm ziyaretçi verilerini çek
      const visitorsData = await visitorService.getVisitorHistory();
      // Veriler API'de sıralanmış olabilir, burada da sıralayabiliriz
      setVisitors(visitorsData);           // Ana listeyi güncelle
      setFilteredVisitors(visitorsData);   // Filtrelenmiş listeyi de güncelle (başlangıçta aynı)
    } catch (error) {
      // Hata durumunda kullanıcıya mesaj göster
      message.error('Ziyaret geçmişi yüklenemedi!');
    } finally {
      setLoading(false); // Her durumda yükleme durumunu kapat
    }
  };

  // Arama/filtreleme fonksiyonu
  const handleSearch = (values: any) => {
    // Ana listeden kopyala (orijinal veriyi korumak için)
    let filtered = [...visitors];

    // Ad Soyad filtresi - büyük/küçük harf duyarsız arama
    if (values.fullName) {
      filtered = filtered.filter(visitor =>
        visitor.fullName.toLowerCase().includes(values.fullName.toLowerCase())
      );
    }

    // TC Kimlik No filtresi
    if (values.tcNumber) {
      filtered = filtered.filter(visitor =>
        visitor.tcNumber.includes(values.tcNumber)
      );
    }

    // Tarih aralığı filtresi
    if (values.dateRange && values.dateRange.length === 2) {
      const [startDate, endDate] = values.dateRange;
      filtered = filtered.filter(visitor => {
        const enteredDate = new Date(visitor.enteredAt);
        return enteredDate >= startDate.startOf('day').toDate() && 
               enteredDate <= endDate.endOf('day').toDate();
      });
    }

    // Ziyaretçileri tarih ve aktiflik durumuna göre sırala
    filtered.sort((a, b) => {
      // Aktif olanlar üstte
      if (!a.exitedAt && b.exitedAt) return -1;
      if (a.exitedAt && !b.exitedAt) return 1;
      
      // Aynı durumda olanları tarihe göre sırala (en yeni en üstte)
      return new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime();
    });

    setFilteredVisitors(filtered);
  };

  const handleClearFilters = () => {
    form.resetFields();
    setFilteredVisitors(visitors);
  };

  const exportToExcel = () => {
    const exportData = filteredVisitors.map(visitor => ({
      'Ad Soyad': visitor.fullName,
      'TC Kimlik No': visitor.tcNumber,
      'Ziyaret Nedeni': visitor.visitReason,
      'Giriş Saati': new Date(visitor.enteredAt).toLocaleString('tr-TR'),
      'Çıkış Saati': visitor.exitedAt ? new Date(visitor.exitedAt).toLocaleString('tr-TR') : 'Devam ediyor',
      'Durum': visitor.exitedAt ? 'Çıkış Yapıldı' : 'Aktif',
      'Süre': visitor.exitedAt ? calculateDuration(visitor.enteredAt, visitor.exitedAt) : 'Devam ediyor'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ziyaret Geçmişi');

    const fileName = `ziyaret-gecmisi-${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    message.success('Excel dosyası başarıyla indirildi!');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // UTF-8 font ayarı (Türkçe karakterler için)
    doc.setFont('helvetica');

    // Başlık
    doc.setFontSize(18);
    doc.text('Ziyaret Gecmisi Raporu', 14, 22);

    doc.setFontSize(12);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
    doc.text(`Toplam Kayit: ${filteredVisitors.length}`, 14, 40);

    // Tablo verileri
    const tableData = filteredVisitors.map(visitor => [
      visitor.fullName,
      visitor.tcNumber,
      visitor.visitReason,
      new Date(visitor.enteredAt).toLocaleDateString('tr-TR'),
      visitor.exitedAt ? new Date(visitor.exitedAt).toLocaleDateString('tr-TR') : 'Devam ediyor',
      visitor.exitedAt ? 'Cikis Yapildi' : 'Aktif'
    ]);

    autoTable(doc, {
      head: [['Ad Soyad', 'TC Kimlik', 'Ziyaret Nedeni', 'Giris Tarihi', 'Cikis Tarihi', 'Durum']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { top: 20 }
    });

    const fileName = `ziyaret-gecmisi-${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.pdf`;
    doc.save(fileName);
    message.success('PDF dosyası başarıyla indirildi!');
  };

  const calculateDuration = (enteredAt: Date | string, exitedAt: Date | string) => {
    const entered = new Date(enteredAt);
    const exited = new Date(exitedAt);
    const duration = exited.getTime() - entered.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}s ${minutes}dk`;
  };

  const exportMenuItems = [
    {
      key: 'excel',
      icon: <FileExcelOutlined />,
      label: 'Excel Dosyası',
      onClick: exportToExcel,
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: 'PDF Raporu',
      onClick: exportToPDF,
    },
  ];

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
      title: 'Çıkış Saati',
      dataIndex: 'exitedAt',
      key: 'exitedAt',
      render: (date: string | null) => 
        date ? new Date(date).toLocaleString('tr-TR') : '-',
    },
    {
      title: 'Durum',
      key: 'status',
      sorter: (a: Visitor, b: Visitor) => {
        // Aktif olanlar üstte (exitedAt=null)
        if (!a.exitedAt && b.exitedAt) return -1;
        if (a.exitedAt && !b.exitedAt) return 1;
        return 0;
      },
      defaultSortOrder: 'ascend' as const,
      render: (_, record: Visitor) => (
        record.exitedAt ? (
          <Tag color="red">Çıkış Yapıldı</Tag>
        ) : (
          <Tag color="green">Aktif</Tag>
        )
      ),
    },
    {
      title: 'Süre',
      key: 'duration',
      render: (_, record: Visitor) => {
        if (!record.exitedAt) return 'Devam ediyor';

        const enteredAt = new Date(record.enteredAt);
        const exitedAt = new Date(record.exitedAt);
        const duration = exitedAt.getTime() - enteredAt.getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}s ${minutes}dk`;
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Filtreleme Formu */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Filtrele</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="fullName" label="Ad Soyad">
                <Input placeholder="Ad Soyad ara..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tcNumber" label="TC Kimlik No">
                <Input placeholder="TC Kimlik No ara..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateRange" label="Tarih Aralığı">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              Ara
            </Button>
            <Button onClick={handleClearFilters} icon={<ClearOutlined />}>
              Temizle
            </Button>
          </Space>
        </Form>
      </Card>

      {/* Ziyaretçi Tablosu */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={3} style={{ margin: 0 }}>
            Ziyaret Geçmişi ({filteredVisitors.length} kayıt)
          </Title>
          <Space>
            <Dropdown
              menu={{ items: exportMenuItems }}
              trigger={['click']}
            >
              <Button icon={<DownloadOutlined />}>
                Dışa Aktar
              </Button>
            </Dropdown>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadVisitorHistory} 
              loading={loading}
            >
              Yenile
            </Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filteredVisitors}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            position: ['bottomCenter'],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`
          }}
          locale={{ emptyText: 'Ziyaret geçmişi bulunmuyor' }}
        />
      </Card>
    </div>
  );
};

export default VisitorHistory;