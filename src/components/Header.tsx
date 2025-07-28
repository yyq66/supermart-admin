import { Layout, Menu, Button, theme, message, Avatar } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/user.ts';
import type { MenuProps } from 'antd';

const { Header } = Layout;

interface HeaderComponentProps {
  collapsed: boolean;
  toggle: () => void;
  isMobile?: boolean;
}
type MenuItem = Required<MenuProps>['items'][number];

const HeaderComponent = ({ collapsed, toggle, isMobile = false }: HeaderComponentProps) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { logout, user } = useUserStore();

  const userMenuItems: MenuItem[] = [{
    key: 'user',
    label: isMobile ? '' : '用户中心',
    icon: <Avatar size="small" icon={<UserOutlined />} />,
    children: [
      { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
    ],
  }];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'logout') {
      logout();
      message.success('退出登录成功');
      navigate('/login');
    }
  };

  return (
    <Header className="flex justify-between items-center px-2 md:px-4 sticky top-0 z-50" style={{ background: token.colorBgContainer }}>
      <Button
        type="text"
        icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
        onClick={toggle}
        className="text-lg"
      />
      <div className="flex items-center">
        <span className="mr-2 md:mr-4 text-sm md:text-base">{user?.name || '管理员'}</span>
        <Menu mode="horizontal" className="border-0" items={userMenuItems} onClick={handleMenuClick} />
      </div>
    </Header>
  );
};

export default HeaderComponent;