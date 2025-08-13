import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { visitorService } from '../services/apiService';
import { DateRangeAnalytics } from '../types';
import { Card, Typography, DatePicker, Spin, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { Title: AntTitle } = Typography;
const { RangePicker } = DatePicker;

type Range = [Dayjs, Dayjs] | null;

const VisitorDensityAnalysis: React.FC = () => {
  const [range, setRange] = useState<Range>([dayjs().subtract(30, 'day'), dayjs()]);
  const [dataPoints, setDataPoints] = useState<DateRangeAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!range) return;
    const [start, end] = range;
    setLoading(true);
    visitorService.getDateRangeAnalytics(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'))
      .then(res => setDataPoints(res))
      .catch(() => setDataPoints([]))
      .finally(() => setLoading(false));
  }, [range]);

  const chartData = {
    labels: dataPoints.map(pt => dayjs(pt.date).format('DD/MM')),
    datasets: [
      {
        label: 'Giriş Sayısı',
        data: dataPoints.map(pt => pt.totalVisitors),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Çıkış Sayısı',
        data: dataPoints.map(pt => pt.completedVisits),
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.5)',
        tension: 0.3,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' as const } },
    scales: {
      x: { title: { display: true, text: 'Tarih' } },
      y: { title: { display: true, text: 'Ziyaretçi Sayısı' } }
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <AntTitle level={3}>Ziyaretçi Yoğunluk Analizi</AntTitle>
          <RangePicker
            value={range}
            onChange={dates => setRange(dates as Range)}
            style={{ width: 300 }}
          />
          {loading ? (
            <Spin />
          ) : (
            <Line data={chartData} options={options} />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default VisitorDensityAnalysis;
