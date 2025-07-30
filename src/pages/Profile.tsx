import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Row,
  Col,
  Divider,
  Space,
  Tag,
  Modal,
  Switch,
  Spin
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  LockOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { userInfoAPI } from '../services/api';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  department?: string;
  joinDate?: string;
  bio?: string;
  lastLoginTime?: string;
  loginCount?: number;
  status?: string;
  settings?: {
    twoFactorEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
}

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  // 加载用户信息
  const loadUserInfo = async () => {
    try {
      setPageLoading(true);
      const response = await userInfoAPI.getUserProfile();
      console.log(response.data)
      setUserInfo(response.data);
      form.setFieldsValue(response.data);
    } catch (error) {
      message.error('加载用户信息失败');
    } finally {
      setPageLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    form.setFieldsValue(userInfo);
  };

  const handleCancel = () => {
    setEditing(false);
    form.setFieldsValue(userInfo);
  };

  const handleSave = async (values: any) => {
    if (!userInfo) return;

    try {
      setLoading(true);
      const updatedUser = await userInfoAPI.updateUserProfile({
        ...userInfo,
        ...values
      });

      setUserInfo(updatedUser);

      // 更新localStorage中的用户信息
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        name: updatedUser.name,
        email: updatedUser.email
      }));

      setEditing(false);
      message.success('个人信息更新成功！');
    } catch (error) {
      message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 头像上传处理
  const handleAvatarUpload = async (file: File) => {
    if (!userInfo) return;

    try {
      setLoading(true);
      const result = await userInfoAPI.uploadAvatar(userInfo.id, file);
      setUserInfo(prev => prev ? { ...prev, avatar: result.avatarUrl } : null);
      message.success('头像更新成功！');
    } catch (error) {
      message.error('头像上传失败');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    listType: 'picture-card',
    className: 'avatar-uploader',
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
        return false;
      }

      handleAvatarUpload(file);
      return false; // 阻止自动上传
    },
  };

  // 修改密码
  const handlePasswordChange = async (values: any) => {
    if (!userInfo) return;

    try {
      setLoading(true);
      await userInfoAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      setPasswordModalVisible(false);
      passwordForm.resetFields();
      message.success('密码修改成功！');
    } catch (error: any) {
      message.error(error.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换两步验证
  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (!userInfo) return;

    try {
      await userInfoAPI.toggleTwoFactor(userInfo.id, enabled);
      setUserInfo(prev => prev ? {
        ...prev,
        settings: { ...prev.settings!, twoFactorEnabled: enabled }
      } : null);
      message.success(`两步验证已${enabled ? '开启' : '关闭'}`);
    } catch (error) {
      message.error('设置失败，请重试');
    }
  };

  const getRoleTag = (role: string) => {
    const roleMap: Record<string, { color: string; text: string }> = {
      admin: { color: 'red', text: '超级管理员' },
      manager: { color: 'blue', text: '管理员' },
      user: { color: 'green', text: '普通用户' }
    };
    const roleInfo = roleMap[role] || { color: 'default', text: role };
    return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="text-center p-8">
        <p>用户信息加载失败</p>
        <Button onClick={loadUserInfo}>重新加载</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Row gutter={[24, 24]}>
        {/* 左侧：头像和基本信息 */}
        <Col xs={24} lg={8}>
          <Card className="text-center">
            <div className="mb-4">
              <Upload {...uploadProps}>
                <Avatar
                  size={120}
                  src={userInfo.avatar}
                  icon={<UserOutlined />}
                  className="mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Upload>
              <div className="text-sm text-gray-500 mt-2">
                <CameraOutlined /> 点击头像更换
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2">{userInfo.name}</h2>
            <div className="mb-4">{getRoleTag(userInfo.role)}</div>

            <Divider />

            <Space direction="vertical" className="w-full text-left">
              <div className="flex items-center">
                <MailOutlined className="mr-2 text-gray-500" />
                <span className="text-sm">{userInfo.email}</span>
              </div>
              {userInfo.phone && (
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2 text-gray-500" />
                  <span className="text-sm">{userInfo.phone}</span>
                </div>
              )}
              {userInfo.department && (
                <div className="flex items-center">
                  <IdcardOutlined className="mr-2 text-gray-500" />
                  <span className="text-sm">{userInfo.department}</span>
                </div>
              )}
              {userInfo.joinDate && (
                <div className="text-sm text-gray-500">
                  加入时间: {userInfo.joinDate}
                </div>
              )}
              {userInfo.lastLoginTime && (
                <div className="text-sm text-gray-500">
                  上次登录: {userInfo.lastLoginTime}
                </div>
              )}
              {userInfo.loginCount && (
                <div className="text-sm text-gray-500">
                  登录次数: {userInfo.loginCount} 次
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* 右侧：详细信息编辑 */}
        <Col xs={24} lg={16}>
          <Card
            title="个人信息"
            extra={
              !editing ? (
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                  编辑信息
                </Button>
              ) : (
                <Space>
                  <Button onClick={handleCancel}>取消</Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                    loading={loading}
                  >
                    保存
                  </Button>
                </Space>
              )
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              disabled={!editing}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="姓名"
                    name="name"
                    rules={[{ required: true, message: '请输入姓名' }]}
                  >
                    <Input placeholder="请输入姓名" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input placeholder="请输入邮箱" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="手机号"
                    name="phone"
                    rules={[
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                    ]}
                  >
                    <Input placeholder="请输入手机号" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="部门" name="department">
                    <Input placeholder="请输入部门" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="个人简介" name="bio">
                <Input.TextArea
                  rows={4}
                  placeholder="请输入个人简介"
                  maxLength={200}
                  showCount
                />
              </Form.Item>
            </Form>
          </Card>

          {/* 安全设置 */}
          <Card title="安全设置" className="mt-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">修改密码</h4>
                  <p className="text-gray-500 text-sm mb-3">
                    定期更换密码可以提高账户安全性
                  </p>
                  <Button
                    icon={<LockOutlined />}
                    onClick={() => setPasswordModalVisible(true)}
                  >
                    修改密码
                  </Button>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">两步验证</h4>
                    <Switch
                      checked={userInfo.settings?.twoFactorEnabled}
                      onChange={handleTwoFactorToggle}
                      disabled={true}
                    />
                  </div>
                  <p className="text-gray-500 text-sm mb-3">
                    开启两步验证可以更好地保护您的账户
                  </p>
                  <Tag color={userInfo.settings?.twoFactorEnabled ? 'green' : 'default'}>
                    {userInfo.settings?.twoFactorEnabled ? '已开启' : '未开启'}
                  </Tag>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            label="当前密码"
            name="currentPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setPasswordModalVisible(false);
                passwordForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;