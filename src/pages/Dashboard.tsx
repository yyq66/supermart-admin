import React, { useState, useEffect } from 'react';
import type { Dayjs } from 'dayjs';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Progress,
  Tag,
  Space,
  Select,
  DatePicker,
  Alert,
  Tooltip,
  Badge,
  Spin,
  message,
} from 'antd';
import { FireOutlined, ThunderboltOutlined, EyeOutlined, WarningOutlined, ReloadOutlined} from '@ant-design/icons';
import { Line, AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { dashboardAPI } from '../services/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DashboardData {
  realTimeMetrics: any;
  salesTrend: any[];
  categoryStats: any[];
  hourlyAnalysis: any[];
  regionStats: any[];
  alerts: any[];
  prediction: any;
  coreMetrics: any[]
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const [dateRange, setDateRange] = useState(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [hotProducts, setHotProducts] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 获取仪表盘数据
  // 获取仪表盘数据
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 并行获取所有数据
      const [dashData, productsData] = await Promise.all([
        dashboardAPI.getDashboardData(),
        dashboardAPI.getHotProducts()
      ]);
      
      // 设置仪表盘数据
      setDashboardData({
        realTimeMetrics: dashData.coreMetrics,
        salesTrend: dashData.salesTrend,
        categoryStats: dashData.categoryStats,
        hourlyAnalysis: dashData.hourlyAnalysis,
        regionStats: dashData.regionStats,
        alerts: dashData.alerts,
        prediction: dashData.prediction,
        coreMetrics: dashData.coreMetrics
      });
      
      setHotProducts(productsData);
    } catch (error: any) {
      message.error(error.message || '获取仪表盘数据失败');
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (value: string) => {
    setTimeRange(value);
    if (value !== 'custom') {
      setDateRange(null); // 非自定义时清除日期
    }
  };

  // 自定义日期
  // const handleRangeChange = async(dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
  //   try{
  //     setLoading(true);
  //     const dashData = await dashboardAPI.getNewDashboardData(dates)
  //     setDashboardData(dashData);
  //   }catch(error){
  //     message.error('获取仪表盘数据失败');
  //     console.error('Dashboard data fetch error:', error);
  //   }
  // }


  // 初始化数据
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 自动刷新
  // useEffect(() => {
  //   // if (!autoRefresh) return;

  //   const interval = setInterval(() => {
  //     // 只更新实时指标，避免频繁刷新整个页面
  //     dashboardAPI.getRealTimeMetrics().then(metrics => {
  //       setDashboardData(prev => prev ? { ...prev, realTimeMetrics: metrics } : null);
  //     }).catch(console.error);
  //   }, 30000); // 30秒刷新一次

  //   return () => clearInterval(interval);
  // }, [autoRefresh]);

  if (loading || !dashboardData) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="加载仪表盘数据中..." />
      </div>
    );
  }

  const { realTimeMetrics, coreMetrics, salesTrend, categoryStats, hourlyAnalysis, regionStats, alerts, prediction } = dashboardData;

  
  // 热销商品
  const hotProductColumns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <FireOutlined style={{ color: '#f5222d' }} />
          <span>{text}</span>
          <Tag color="blue">{record.category}</Tag>
        </Space>
      )
    },
    {
      title: '销售额',
      dataIndex: 'sales',
      key: 'sales',
      render: (value: number) => `¥${value?.toLocaleString()}`,
      sorter: (a: any, b: any) => a.sales - b.sales
    },
    {
      title: '利润',
      dataIndex: 'profit',
      key: 'profit',
      render: (value: number) => (
        <Text type="success">¥{value?.toLocaleString()}</Text>
      )
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (value: number) => (
        <Progress
          percent={value}
          size="small"
          status={value < 20 ? 'exception' : value < 50 ? 'active' : 'success'}
          format={() => `${value}%`}
        />
      )
    }
  ];

  // 区域数据
  const regionColumns = [
    {
      title: '区域',
      dataIndex: 'region',
      key: 'region'
    },
    {
      title: '销售额',
      dataIndex: 'sales',
      key: 'sales',
      render: (value: number) => `¥${(value / 1000).toFixed(0)}K`
    },
    {
      title: '增长率',
      dataIndex: 'growth',
      key: 'growth',
      render: (value: number) => (
        <Space>
          {/* {value > 0 ? (
            <TrendingUpOutlined style={{ color: '#52c41a' }} />
          ) : (
            <TrendingDownOutlined style={{ color: '#f5222d' }} />
          )} */}
          <Text type={value > 0 ? 'success' : 'danger'}>
            {value > 0 ? '+' : ''}{value}%
          </Text>
        </Space>
      )
    },
    {
      title: '客户数',
      dataIndex: 'customers',
      key: 'customers',
      render: (value: number) => value.toLocaleString()
    }
  ];

  return (
    <div className="p-4 md:p-6">
      {/* 页面标题和控制器 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <Title level={2} className="mb-4 md:mb-0">
          <Space>
            <EyeOutlined />
            智能数据中心
            <Badge status="processing" text="实时监控" />
          </Space>
        </Title>
        <Space wrap>
          <Select
            value={timeRange}
            onChange={handleTimeChange}
            className='w-[120px]'
            options={[
              { label: '今日', value: 'today' },
              { label: '本周', value: 'week' },
              { label: '本月', value: 'month' },
              { label: '自定义', value: 'custom' }
            ]}
          />
          {/* {timeRange === 'custom' && (
            <RangePicker onChange={handleRangeChange} />
          )} */}
          <Tooltip title={autoRefresh ? '关闭自动刷新' : '开启自动刷新'}>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded ${autoRefresh ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              <ReloadOutlined spin={autoRefresh} />
            </button>
          </Tooltip>
        </Space>
      </div>

      {/* 实时告警 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card size="small" title={<Space><WarningOutlined />实时告警</Space>}>
            <Space direction="vertical" size="small" className='w-full'>
              {alerts.map((alert: any, index: number) => (
                <Alert
                  key={index}
                  message={alert.message}
                  type={alert.type}
                  showIcon
                  action={
                    <Text type="secondary" className='text-xs'>
                      {alert.time}
                    </Text>
                  }
                />
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} className="mb-6">
        {coreMetrics.map((metric, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card hoverable>
              <Statistic
                title={
                  <Space>
                    {metric.title}
                  </Space>
                }
                value={metric.value}
                prefix={metric.prefix}
                suffix={metric.suffix}
                valueStyle={{ color: metric.color, fontSize: '24px' }}
              />
              <div className="mt-2">
                <Space>
                  <Text type={metric.trendUp ? 'success' : 'danger'}>
                    {metric.trend}
                  </Text>
                  <Text type="secondary">{metric.description}</Text>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* AI预测和分析 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ThunderboltOutlined className="text-purple-600" />
                AI智能预测
              </Space>
            }
          >
            <Space direction="vertical" className='w-full'>
              <div>
                <Text strong>下一小时预测销售额：</Text>
                <Text style={{ fontSize: '20px', color: '#1890ff', marginLeft: 8 }}>
                  ¥{prediction.nextHourSales.toLocaleString()}
                </Text>
              </div>
              <div>
                <Text>预测置信度：</Text>
                <Progress
                  percent={prediction.confidence}
                  size="small"
                  status="active"
                  style={{ width: 200, marginLeft: 8 }}
                />
              </div>
              <Alert
                message={prediction.recommendation}
                type="info"
                showIcon
              />
              <Alert
                message={prediction.riskAlert}
                type="warning"
                showIcon
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="分类销售占比">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 销售趋势分析 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card title="24小时销售趋势分析">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stackId="1"
                  stroke="#1890ff"
                  fill="#1890ff"
                  fillOpacity={0.6}
                  name="销售额"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="visitors"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="访客数"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 时段分析和热销商品 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="时段客流分析">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="traffic" fill="#faad14" name="客流量" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<Space><FireOutlined style={{ color: '#f5222d' }} />热销商品TOP5</Space>}>
            <Table
              columns={hotProductColumns}
              dataSource={hotProducts}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* 区域销售分析 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="区域销售分析">
            <Table
              columns={regionColumns}
              dataSource={regionStats}
              pagination={false}
              rowKey="region"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;