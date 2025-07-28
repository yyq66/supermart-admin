import { Layout, Menu, Drawer } from 'antd';
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons';
import Header from '../components/Header';

const { Content, Footer, Sider } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setDrawerVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '系统数据', },
    { key: '/users', icon: <UserOutlined />, label: '用户管理', },
    { key: '/products', icon: <ShoppingOutlined />, label: '商品管理', },
    { key: '/inventory', icon: <ShoppingCartOutlined />, label: '库存管理', },
    { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理', },
    { key: '/reports', icon: <BarChartOutlined />, label: '数据报表', },
    { key: '/settings', icon: <SettingOutlined />, label: '系统设置', },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) { setDrawerVisible(false); }
  };

  const renderMenu = () => (
    <Menu
      theme="light"
      mode="inline"
      defaultSelectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
    />
  );

  return (
    <Layout className="min-h-screen">
      {isMobile ? (
        // 移动端使用Drawer
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{ body: { padding: 0 } }}
          width={200}
        >
          <div className="h-8 m-4 flex items-center justify-center text-lg font-bold">
            超市后台管理系统
          </div>
          {renderMenu()}
        </Drawer>
      ) : (
        // 桌面端使用Sider
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          className="overflow-auto h-screen fixed left-0 top-0 bottom-0"
        >
          <div className="h-8 m-4 flex items-center justify-center text-lg font-bold">
            {!collapsed ? '超市后台管理系统' : '超市'}
          </div>
          {renderMenu()}
        </Sider>
      )}

      <Layout className={`transition-all duration-200 ${isMobile ? 'ml-0' : collapsed ? 'ml-[80px]' : 'ml-[200px]'}`}>
        <Header
          collapsed={collapsed}
          toggle={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)}
          isMobile={isMobile}
        />
        <Content className="flex-1 overflow-auto">
          <div className="m-2 p-3 md:m-6 md:p-6 bg-white rounded-lg">
            <Outlet />
          </div>
          <Footer className="text-center text-xs md:text-base ">超市后台管理系统 ©{new Date().getFullYear()} 版权所有</Footer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;