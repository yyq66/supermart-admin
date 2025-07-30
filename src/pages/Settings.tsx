import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  TimePicker,
  InputNumber,
  Divider,
  Row,
  Col,
  Space,
  message,
  Spin,
  Tabs
} from 'antd';
import {
  SettingOutlined,
  ShopOutlined,
  SecurityScanOutlined,
  BellOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useSettingsStore from '../store/settings';

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('store');
  
  // 使用Zustand状态管理
  const {
    settings,
    loading,
    loadSettings,
    saveSettings,
    resetSettings
  } = useSettingsStore();

  useEffect(() => {
    // 组件挂载时加载设置
    if (!settings) {
      loadSettings();
    } else {
      // 如果已有设置，直接设置表单值
      setFormValues(settings);
    }
  }, [settings, loadSettings]);

  // 设置表单值的辅助函数
  const setFormValues = (settingsData: any) => {
    const formValues = {
      ...settingsData,
      openTime: settingsData.openTime ? dayjs(settingsData.openTime, 'HH:mm') : null,
      closeTime: settingsData.closeTime ? dayjs(settingsData.closeTime, 'HH:mm') : null,
      backupTime: settingsData.backupTime ? dayjs(settingsData.backupTime, 'HH:mm') : null
    };
    form.setFieldsValue(formValues);
  };

  // 保存设置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // 安全地转换时间格式
      const formattedValues = {
        ...values,
        openTime: values.openTime ? values.openTime.format('HH:mm') : '',
        closeTime: values.closeTime ? values.closeTime.format('HH:mm') : '',
        backupTime: values.backupTime ? values.backupTime.format('HH:mm') : ''
      };
      
      await saveSettings(formattedValues);
    } catch (error) {
      // 错误处理已在store中完成
    }
  };

  // 重置设置
  const handleReset = () => {
    resetSettings();
    if (settings) {
      setFormValues(settings);
    }
  };

  // 实时更新设置（可选功能）
  const handleFormChange = (changedValues: any, allValues: any) => {
    // 可以在这里实现实时保存或其他逻辑
    // updateSettings(changedValues);
  };

  if (loading && !settings) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'store',
      label: (
        <span>
          <ShopOutlined style={{ marginRight: '8px' }} />
          商店信息
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="基本信息" size="small">
              <Form.Item
                label="商店名称"
                name="storeName"
                rules={[{ required: true, message: '请输入商店名称' }]}
              >
                <Input placeholder="请输入商店名称" />
              </Form.Item>
              <Form.Item
                label="商店地址"
                name="storeAddress"
                rules={[{ required: true, message: '请输入商店地址' }]}
              >
                <Input.TextArea rows={2} placeholder="请输入商店地址" />
              </Form.Item>
              <Form.Item
                label="联系电话"
                name="storePhone"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^[0-9-+()\s]+$/, message: '请输入有效的电话号码' }
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
              <Form.Item
                label="邮箱地址"
                name="storeEmail"
                rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
              >
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="营业设置" size="small">
              <Form.Item
                label="营业时间"
                style={{ marginBottom: 16 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Form.Item 
                      name="openTime" 
                      noStyle
                      rules={[{ required: true, message: '请选择开始时间' }]}
                    >
                      <TimePicker format="HH:mm" placeholder="开始时间" />
                    </Form.Item>
                    <span>至</span>
                    <Form.Item 
                      name="closeTime" 
                      noStyle
                      rules={[{ required: true, message: '请选择结束时间' }]}
                    >
                      <TimePicker format="HH:mm" placeholder="结束时间" />
                    </Form.Item>
                  </Space>
                </Space>
              </Form.Item>
              <Form.Item
                label="货币单位"
                name="currency"
                rules={[{ required: true, message: '请选择货币单位' }]}
              >
                <Select placeholder="请选择货币单位">
                  <Select.Option value="CNY">人民币 (¥)</Select.Option>
                  <Select.Option value="USD">美元 ($)</Select.Option>
                  <Select.Option value="EUR">欧元 (€)</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="税率 (%)"
                name="taxRate"
                rules={[{ required: true, message: '请输入税率' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="请输入税率"
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'inventory',
      label: (
        <span>
          <SettingOutlined style={{ marginRight: '8px' }} />
          库存管理
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="库存设置" size="small">
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="低库存预警阈值"
                    name="lowStockThreshold"
                    tooltip="当商品库存低于此数量时发出预警"
                    rules={[{ required: true, message: '请输入预警阈值' }]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="请输入预警阈值"
                    />
                  </Form.Item>
                  <Form.Item
                    label="启用自动补货"
                    name="autoReorderEnabled"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="库存预警邮件"
                    name="stockAlertEmail"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'member',
      label: (
        <span>
          <SecurityScanOutlined style={{ marginRight: '8px' }} />
          会员设置
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="会员系统" size="small">
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="启用会员系统"
                    name="membershipEnabled"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="积分比例 (每元)"
                    name="pointsPerYuan"
                    tooltip="每消费1元获得的积分数"
                    rules={[{ required: true, message: '请输入积分比例' }]}
                  >
                    <InputNumber
                      min={0}
                      step={0.1}
                      style={{ width: '100%' }}
                      placeholder="请输入积分比例"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="会员折扣率 (%)"
                    name="memberDiscountRate"
                    tooltip="会员享受的折扣百分比"
                    rules={[{ required: true, message: '请输入折扣率' }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.1}
                      style={{ width: '100%' }}
                      placeholder="请输入折扣率"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'system',
      label: (
        <span>
          <BellOutlined style={{ marginRight: '8px' }} />
          系统设置
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="系统维护" size="small">
              <Form.Item
                label="自动备份"
                name="autoBackup"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="备份时间"
                name="backupTime"
                rules={[{ required: true, message: '请选择备份时间' }]}
              >
                <TimePicker format="HH:mm" placeholder="选择备份时间" />
              </Form.Item>
              <Form.Item
                label="会话超时 (分钟)"
                name="sessionTimeout"
                rules={[{ required: true, message: '请输入超时时间' }]}
              >
                <InputNumber
                  min={5}
                  max={120}
                  style={{ width: '100%' }}
                  placeholder="请输入超时时间"
                />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="通知设置" size="small">
              <Form.Item
                label="邮件通知"
                name="emailNotifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="低库存提醒"
                name="lowStockAlert"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="每日报告"
                name="dailyReport"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          <SettingOutlined style={{ marginRight: '8px' }} />
          系统设置
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          配置系统基本信息和运营参数
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Space size="middle">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleSave}
              size="large"
            >
              保存设置
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              size="large"
              disabled={loading}
            >
              重置
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default Settings;