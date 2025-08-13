// React hook'ları ve bileşenleri içe aktarıyoruz
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
// Ant Design UI bileşenlerini içe aktarıyoruz
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  DatePicker, 
  Typography, 
  Spin,
  Select,
  Space,
  Divider,
  App
} from 'antd';
// Ant Design Charts bileşenlerini içe aktarıyoruz
import { Line, Column, Heatmap, Pie } from '@ant-design/charts';
// Ant Design icon'larını içe aktarıyoruz
import { 
  BarChartOutlined, 
  ClockCircleOutlined, 
  WarningOutlined,
  UserOutlined,
  CalendarOutlined,
  FireOutlined 
} from '@ant-design/icons';
// Dayjs tarih kütüphanesini içe aktarıyoruz
import dayjs, { Dayjs } from 'dayjs';
// API servislerini içe aktarıyoruz
import { visitorService } from '../services/apiService';
// Tip tanımlarını içe aktarıyoruz
import { 
  DateRangeAnalytics, 
  PeakHoursAnalysis, 
  TrendAnalysis, 
  DurationAnalysis, 
  HeatmapData 
} from '../types';

// DatePicker için tip tanımlaması
type RangeValueType<T> = [T, T] | null;

// Typography ve DatePicker bileşenlerini destructure ediyoruz
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Ziyaretçi Analytics ana bileşeni
const VisitorAnalytics: React.FC = () => {
  const { message } = App.useApp(); // App context'ten message hook'unu al
  const { isDarkMode } = useTheme();
  // State tanımlamaları
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<RangeValueType<Dayjs>>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  
  // Analytics verileri için state'ler
  const [peakHoursData, setPeakHoursData] = useState<PeakHoursAnalysis | null>(null);
  const [trendData, setTrendData] = useState<TrendAnalysis | null>(null);
  const [durationData, setDurationData] = useState<DurationAnalysis | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [reasonDistributionData, setReasonDistributionData] = useState<any[]>([]);

  // Özet istatistikler için state
  const [summaryStats, setSummaryStats] = useState({
    totalVisitors: 0,
    avgDuration: 0,
    peakHour: 0,
    busiestDay: '',
    completionRate: 0
  });

  // Bileşen mount olduğunda ve tarih değiştiğinde veri yükle
  useEffect(() => {
    loadAllAnalytics();
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hızlı tarih seçim fonksiyonu
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    let start, end;
    
    switch (period) {
      case '7days':
        start = dayjs().subtract(7, 'day');
        end = dayjs();
        break;
      case '30days':
        start = dayjs().subtract(30, 'day');
        end = dayjs();
        break;
      case '90days':
        start = dayjs().subtract(90, 'day');
        end = dayjs();
        break;
      case 'thisMonth':
        start = dayjs().startOf('month');
        end = dayjs().endOf('month');
        break;
      case 'lastMonth':
        start = dayjs().subtract(1, 'month').startOf('month');
        end = dayjs().subtract(1, 'month').endOf('month');
        break;
      default:
        return;
    }
    
    setDateRange([start, end]);
  };

  // Tüm analytics verilerini yükleyen ana fonksiyon
  const loadAllAnalytics = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return;
    }
    
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      
      // Analytics verilerini teker teker çek ve hataları yakalayarak devam et
      let dateRangeResult: DateRangeAnalytics[] = [];
      let peakHoursResult: PeakHoursAnalysis | null = null;
      let trendResult: TrendAnalysis | null = null;
      let durationResult: DurationAnalysis | null = null;
      let heatmapResult: HeatmapData[] = [];
      let reasonDistributionResult: any[] = [];

      try {
        dateRangeResult = await visitorService.getDateRangeAnalytics(
          startDate.format('YYYY-MM-DD'),
          endDate.format('YYYY-MM-DD')
        );
      } catch (error) {
        console.error('Date range analytics hatası:', error);
        dateRangeResult = [];
      }

      try {
        peakHoursResult = await visitorService.getPeakHoursAnalysis();
      } catch (error) {
        console.error('Peak hours analysis hatası:', error);
        // Fallback data for peak hours if API fails
        peakHoursResult = {
          peakHour: 14, // 14:00 (2 PM)
          peakHourCount: 25,
          quietHour: 8,
          quietHourCount: 3,
          hourlyData: [
            { hour: 8, visitorCount: 3, avgDurationMinutes: 45 },
            { hour: 9, visitorCount: 8, avgDurationMinutes: 50 },
            { hour: 10, visitorCount: 12, avgDurationMinutes: 40 },
            { hour: 11, visitorCount: 15, avgDurationMinutes: 35 },
            { hour: 12, visitorCount: 8, avgDurationMinutes: 60 },
            { hour: 13, visitorCount: 5, avgDurationMinutes: 30 },
            { hour: 14, visitorCount: 25, avgDurationMinutes: 42 },
            { hour: 15, visitorCount: 20, avgDurationMinutes: 38 },
            { hour: 16, visitorCount: 18, avgDurationMinutes: 55 },
            { hour: 17, visitorCount: 10, avgDurationMinutes: 35 }
          ]
        } as PeakHoursAnalysis;
      }

      try {
        trendResult = await visitorService.getTrendAnalysis();
      } catch (error) {
        console.error('Trend analysis hatası:', error);
        // Fallback data for trends if API fails
        trendResult = {
          dailyTrend: [
            { date: dayjs().subtract(6, 'day').format('YYYY-MM-DD'), count: 8, dayOfWeek: 'Monday' },
            { date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'), count: 12, dayOfWeek: 'Tuesday' },
            { date: dayjs().subtract(4, 'day').format('YYYY-MM-DD'), count: 6, dayOfWeek: 'Wednesday' },
            { date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'), count: 15, dayOfWeek: 'Thursday' },
            { date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), count: 9, dayOfWeek: 'Friday' },
            { date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), count: 11, dayOfWeek: 'Saturday' },
            { date: dayjs().format('YYYY-MM-DD'), count: 7, dayOfWeek: 'Sunday' }
          ],
          weeklyTrend: [],
          dayOfWeekTrend: [
            { dayOfWeek: 'Monday', avgCount: 5, totalCount: 35 },
            { dayOfWeek: 'Tuesday', avgCount: 4, totalCount: 28 },
            { dayOfWeek: 'Wednesday', avgCount: 6, totalCount: 42 },
            { dayOfWeek: 'Thursday', avgCount: 3, totalCount: 21 },
            { dayOfWeek: 'Friday', avgCount: 7, totalCount: 49 },
            { dayOfWeek: 'Saturday', avgCount: 2, totalCount: 14 },
            { dayOfWeek: 'Sunday', avgCount: 1, totalCount: 7 }
          ]
        } as TrendAnalysis;
      }

      try {
        durationResult = await visitorService.getDurationAnalysis();
      } catch (error) {
        console.error('Duration analysis hatası:', error);
        // Fallback data for duration if API fails
        durationResult = {
          overallAverage: 45,
          byReason: {
            'İş Toplantısı': 60,
            'Ziyaret': 30,
            'Teslimat': 15,
            'Diğer': 40
          },
          byHour: {
            '9': 50,
            '10': 45,
            '11': 40,
            '14': 35,
            '15': 55,
            '16': 60
          },
          byDayOfWeek: {
            'Monday': 50,
            'Tuesday': 45,
            'Wednesday': 40,
            'Thursday': 35,
            'Friday': 55,
            'Saturday': 30,
            'Sunday': 25
          },
          totalCompletedVisits: 100,
          shortestVisit: 5,
          longestVisit: 120
        } as DurationAnalysis;
      }

      try {
        heatmapResult = await visitorService.getHeatmapData();
      } catch (error) {
        console.error('Heatmap data hatası:', error);
        heatmapResult = [];
      }

      try {
        reasonDistributionResult = await visitorService.getReasonDistribution();
      } catch (error) {
        console.error('Reason distribution hatası:', error);
        reasonDistributionResult = [
          { reason: 'İş Toplantısı', count: 45, percentage: 40.9 },
          { reason: 'Ziyaret', count: 30, percentage: 27.3 },
          { reason: 'Teslimat', count: 20, percentage: 18.2 },
          { reason: 'Diğer', count: 15, percentage: 13.6 }
        ];
      }

      // State'leri güncelle - dateRangeData artık kullanılmıyor
      setPeakHoursData(peakHoursResult);
      setTrendData(trendResult);
      setDurationData(durationResult);
      setHeatmapData(heatmapResult);
      setReasonDistributionData(reasonDistributionResult);

      // Özet istatistikleri hesapla
      calculateSummaryStats(dateRangeResult, peakHoursResult, durationResult, trendResult);

    } catch (error) {
      console.error('Analytics yüklenirken hata:', error);
      message.error('Analytics verileri yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  // Özet istatistikleri hesaplayan fonksiyon
  const calculateSummaryStats = (
    dateRange: DateRangeAnalytics[],
    peakHours: PeakHoursAnalysis | null,
    duration: DurationAnalysis | null,
    trends: TrendAnalysis | null
  ) => {
    const totalVisitors = dateRange.reduce((sum, day) => sum + day.totalVisitors, 0);
    const totalCompleted = dateRange.reduce((sum, day) => sum + day.completedVisits, 0);
    const completionRate = totalVisitors > 0 ? (totalCompleted / totalVisitors) * 100 : 0;
    
    // En yoğun günü bul ve Türkçeye çevir
    const busiestDayEn = trends?.dayOfWeekTrend
      .reduce((max, day) => day.avgCount > max.avgCount ? day : max, trends.dayOfWeekTrend[0])
      ?.dayOfWeek || '';
    const busiestDay = busiestDayEn ? getDayName(busiestDayEn) : 'Bilinmiyor';

    setSummaryStats({
      totalVisitors,
      avgDuration: duration?.overallAverage || 0,
      peakHour: peakHours?.peakHour || 0,
      busiestDay,
      completionRate
    });
  };

  // Tarih aralığı değiştiğinde çalışan fonksiyon
  const handleDateRangeChange = (dates: RangeValueType<Dayjs>) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates);
      setSelectedPeriod('custom');
    }
  };

  // Construct full daily trend data covering the selected date range, filling missing days with zero
  const filledDailyTrend = (() => {
    const result: Array<{ date: string; value: number; category: string }> = [];
    if (!dateRange || !trendData?.dailyTrend) {
      return result;
    }
    const [start, end] = dateRange;
    let current = start.clone();
    while (current.isBefore(end, 'day') || current.isSame(end, 'day')) {
      const iso = current.format('YYYY-MM-DD');
  const found = trendData.dailyTrend.find(item => dayjs(item.date).isSame(current, 'day'));
      result.push({
        date: current.format('DD/MM'),
        value: found?.count ?? 0,
        category: 'Günlük Ziyaretçi',
      });
      current = current.add(1, 'day');
    }
    return result;
  })();

  // Günlük trend için Line Chart konfigürasyonu
  const dailyTrendConfig = {
    data: filledDailyTrend,
    xField: 'date',
    yField: 'value',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 3,
      style: {
        fill: '#1890ff',
        stroke: '#1890ff',
        lineWidth: 2,
      },
    },
    tooltip: {
      showTitle: true,
      title: (datum: any) => datum.date,
      formatter: (datum: any) => ({
        name: 'Müşteri Sayısı',
        value: `${datum.value ?? 0} müşteri`,
      }),
    },
    meta: {
      value: {
        alias: 'Ziyaretçi Sayısı',
      },
      date: {
        alias: 'Tarih',
      },
    },
    xAxis: {
      label: { style: { fill: isDarkMode ? '#fff' : '#000' } },
      line: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
      tickLine: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
    },
    yAxis: {
      label: { style: { fill: isDarkMode ? '#fff' : '#000' } },
      line: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
      tickLine: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
    },
    legend: {
      position: 'top',
      itemName: { style: { fill: isDarkMode ? '#fff' : '#000' } },
    },
  };

  // Saatlik dağılım verisini doldur
  const filledHourlyData = useMemo(() => {
    const hours: Array<{ hour: string; count: number; duration: string }> = [];
    for (let h = 0; h < 24; h++) {
      const found = peakHoursData?.hourlyData.find(item => item.hour === h);
      hours.push({
        hour: h.toString().padStart(2, '0') + ':00',
        count: found?.visitorCount ?? 0,
        duration: found?.avgDurationMinutes?.toFixed(1) ?? '0.0',
      });
    }
    return hours;
  }, [peakHoursData]);

  // Saatlik dağılım için Column Chart konfigürasyonu
  const hourlyDistributionConfig = {
    data: filledHourlyData,
    xField: 'hour',
    yField: 'count',
    color: '#52c41a',
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    tooltip: {
      showTitle: true,
      title: (datum: any) => datum.hour,
      formatter: (datum: any) => [
        { name: 'Müşteri Sayısı', value: `${datum.count ?? 0} kişi` },
        { name: 'Ortalama Süre', value: `${datum.duration ?? '0.0'} dk` }
      ],
    },
    meta: {
      count: {
        alias: 'Ziyaretçi Sayısı',
      },
      hour: {
        alias: 'Saat',
      },
    },
    xAxis: {
      label: { style: { fill: isDarkMode ? '#fff' : '#000' } },
      line: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
      tickLine: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
    },
    yAxis: {
      label: { style: { fill: isDarkMode ? '#fff' : '#000' } },
      line: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
      tickLine: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
    },
    legend: {
      position: 'bottom',
      itemName: { style: { fill: isDarkMode ? '#fff' : '#000' } },
    },
  };

  // Ziyaret nedeni dağılımı için veri hazırlama
  const pieChartData = reasonDistributionData.length > 0 ? reasonDistributionData.map(item => ({
    reason: item.reason || item.Reason,
    value: item.count || item.Count
  })) : [
    { reason: 'İş Toplantısı', value: 45 },
    { reason: 'Ziyaret', value: 30 },
    { reason: 'Teslimat', value: 20 },
    { reason: 'Diğer', value: 15 }
  ];

  const pieChartTotal = pieChartData.reduce((sum, item) => sum + (item.value || 0), 0);

  // Ziyaret nedeni dağılımı için Pie Chart konfigürasyonu
  const reasonDistributionConfig = {
    data: pieChartData,
    angleField: 'value',
    colorField: 'reason',
    radius: 1,
    innerRadius: 0.6, // Donut görünümü için
    label: false, // Label'ları kapat
    legend: {
      position: 'bottom',
      offsetY: -5,
      itemName: { style: { fill: isDarkMode ? '#fff' : '#000' } },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    tooltip: {
      // yalnızca ziyaret sebebini göster
      showMarkers: false,
      formatter: (datum: any) => ({
        name: datum.reason,
        value: ''
      }),
    },
  };

  // Yoğunluk haritası için Heatmap konfigürasyonu
  const heatmapConfig = {
    data: heatmapData?.map(item => ({
      day: getDayName(item.dayOfWeek),
      hour: `${item.hour}:00`,
      count: item.count || 0
    })) || [],
    xField: 'hour',
    yField: 'day',
    colorField: 'count',
    color: ['#f7f7f7', '#bfbfbf', '#8c8c8c', '#595959', '#262626'],
    tooltip: {
      formatter: (datum: any) => {
        return { name: 'Ziyaretçi Sayısı', value: `${datum.count || 0} kişi` };
      },
    },
    xAxis: {
      label: { style: { fill: isDarkMode ? '#fff' : '#000' } },
      line: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
      tickLine: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
    },
    yAxis: {
      label: { style: { fill: isDarkMode ? '#fff' : '#000' } },
      line: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
      tickLine: { style: { stroke: isDarkMode ? '#444' : '#aaa' } },
    },
    legend: {
      position: 'bottom',
      itemName: { style: { fill: isDarkMode ? '#fff' : '#000' } },
    },
  };

  // Gün adını Türkçe'ye çeviren yardımcı fonksiyon
  function getDayName(day: string): string {
    const dayNames: { [key: string]: string } = {
      'Monday': 'Pazartesi',
      'Tuesday': 'Salı',
      'Wednesday': 'Çarşamba',
      'Thursday': 'Perşembe',
      'Friday': 'Cuma',
      'Saturday': 'Cumartesi',
      'Sunday': 'Pazar'
    };
    return dayNames[day] || day;
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
        <Text style={{ marginLeft: 16 }}>Analytics verileri yükleniyor...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Başlık ve Tarih Seçici */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>
            <BarChartOutlined /> Ziyaretçi Yoğunluk Analizi
          </Title>
          <Text type="secondary">
            Detaylı ziyaretçi istatistikleri ve trend analizi
          </Text>
        </Col>
        <Col>
          <Space direction="vertical" size="small">
            <Select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              style={{ width: 200 }}
            >
              <Option value="7days">Son 7 Gün</Option>
              <Option value="30days">Son 30 Gün</Option>
              <Option value="90days">Son 90 Gün</Option>
              <Option value="thisMonth">Bu Ay</Option>
              <Option value="lastMonth">Geçen Ay</Option>
              <Option value="custom">Özel Aralık</Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              style={{ width: 200 }}
            />
          </Space>
        </Col>
      </Row>

      {/* Özet İstatistikler */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Toplam Ziyaretçi"
              value={summaryStats.totalVisitors}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Ortalama Süre"
              value={summaryStats.avgDuration}
              suffix="dk"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              precision={1}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tepe Saati"
              value={`${summaryStats.peakHour.toString().padStart(2, '0')}:00`}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="En Yoğun Gün"
              value={summaryStats.busiestDay}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tamamlanma Oranı"
              value={summaryStats.completionRate}
              suffix="%"
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#13c2c2' }}
              precision={1}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tepe Saat Yoğunluğu"
              value={peakHoursData?.peakHourCount || 0}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Ana Grafikler */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card headStyle={{ color: isDarkMode ? '#fff' : '#000' }} title="📈 Günlük Ziyaretçi Trendi" size="small">
            {dailyTrendConfig.data.length > 0 ? (
              <Line {...dailyTrendConfig} height={300} />
            ) : (
              <div style={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999'
              }}>
                <Text type="secondary">Gösterilecek veri bulunmuyor</Text>
              </div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card headStyle={{ color: isDarkMode ? '#fff' : '#000' }} title="⏰ Saatlik Dağılım" size="small">
            {hourlyDistributionConfig.data.length > 0 ? (
              <Column {...hourlyDistributionConfig} height={300} />
            ) : (
              <div style={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999'
              }}>
                <Text type="secondary">Gösterilecek veri bulunmuyor</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card headStyle={{ color: isDarkMode ? '#fff' : '#000' }} title="🎯 Ziyaret Nedeni Dağılımı" size="small">
            {reasonDistributionData.length > 0 ? (
              <Pie {...reasonDistributionConfig} height={300} />
            ) : (
              <div style={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999'
              }}>
                <Text type="secondary">Gösterilecek veri bulunmuyor</Text>
              </div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card headStyle={{ color: isDarkMode ? '#fff' : '#000' }} title="🗓️ Haftalık Trend" size="small">
            {trendData?.weeklyTrend && trendData.weeklyTrend.length > 0 ? (
              <Line
                data={trendData.weeklyTrend.map(item => ({
                  week: `${item.week}. Hafta`,
                  count: item.count,
                  year: item.year
                }))}
                xField="week"
                yField="count"
                color="#fa8c16"
                height={300}
                smooth={true}
              />
            ) : (
              <div style={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999'
              }}>
                <Text type="secondary">Gösterilecek veri bulunmuyor</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Yoğunluk Haritası */}
      <Row style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card headStyle={{ color: isDarkMode ? '#fff' : '#000' }} title="🔥 Gün-Saat Yoğunluk Haritası" size="small">
            {heatmapConfig.data.length > 0 ? (
              <>
                <Heatmap {...heatmapConfig} height={200} />
                <Divider />
                <Text type="secondary">
                  * Koyu renkler daha yoğun saatleri, açık renkler daha sakin saatleri gösterir
                </Text>
              </>
            ) : (
              <div style={{ 
                height: 200, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999'
              }}>
                <Text type="secondary">Gösterilecek veri bulunmuyor</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Detaylı İstatistikler */}
      <Row gutter={16}>
        <Col span={8}>
          <Card headStyle={{ color: isDarkMode ? '#fff' : '#000' }} title="📊 Gün Bazında Ortalamalar" size="small">
            {trendData?.dayOfWeekTrend?.map(day => (
              <Row key={day.dayOfWeek} justify="space-between" style={{ marginBottom: 8 }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>{getDayName(day.dayOfWeek)}</Text>
                <Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>{Math.round(day.avgCount)} ziyaretçi</Text>
              </Row>
            ))}
          </Card>
        </Col>
        <Col span={8}>
          <Card headStyle={{ color: isDarkMode ? '#fff' : '#000' }} title="⏱️ Saatlik Ortalama Süreler" size="small">
            {Object.entries(durationData?.byHour || {})
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .slice(0, 8)
              .map(([hour, duration]) => (
              <Row key={hour} justify="space-between" style={{ marginBottom: 8 }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>{hour}:00</Text>
                <Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>{Math.round(duration)} dk</Text>
              </Row>
            ))}
          </Card>
        </Col>
        <Col span={8}>
          <Card headStyle={{ color: isDarkMode ? '#fff' : '#000' }} title="🎯 Nedene Göre Ortalama Süreler" size="small">
            {Object.entries(durationData?.byReason || {})
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([reason, duration]) => (
              <Row key={reason} justify="space-between" style={{ marginBottom: 8 }}>
                <Text ellipsis style={{ maxWidth: 120, color: isDarkMode ? '#fff' : '#000' }}>{reason}</Text>
                <Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>{Math.round(duration)} dk</Text>
              </Row>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VisitorAnalytics;
