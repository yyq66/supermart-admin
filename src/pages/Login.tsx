import { Form, Input, Button, Card, message} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../services/api';
import useUserStore from '../store/user';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const { login } = useUserStore();

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      const result = await loginAPI(values)
      console.log("result:",result)
      if (result.code === 200) {
        login(result.data.token, result.data.user);
        message.success(result.message);
        navigate('/dashboard');
      }else{
        message.error(result.message);
      }
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-sm md:max-w-md shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold">超市后台管理系统</h2>
          <p className="text-gray-500">请登录您的账号</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size={isMobile ? "middle" : "large"}
          layout="vertical"
        >
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]} >
            <Input prefix={<UserOutlined />} placeholder="用户名: admin" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]} >
            <Input.Password prefix={<LockOutlined />} placeholder="密码: 123456" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" loading={loading}>登录</Button>
          </Form.Item>
        </Form>

      </Card>
    </div>
  );
};

export default Login;