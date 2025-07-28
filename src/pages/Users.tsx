import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import api from '../services/api';

interface User {
    key: string;
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form] = Form.useForm();


    // 在组件内添加
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // 添加窗口大小监听
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 获取用户数据
    const getUsers = async () => {
        try {
            // setLoading(true);
            const response = await api.get<User[]>('/users');
            console.log("response:",response);
            const formattedUsers = response.data.map((user: User)=>({
                ...user,
                key: user.id.toString()
            }))
            setUsers(formattedUsers)
            // const formattedUsers = response.map((user: any) => ({
            //     ...user,
            //     key: user.id.toString()
            // }));
            // setUsers(formattedUsers);
        } catch (error) {
            console.error('获取用户数据失败:', error);
            message.error('获取用户数据失败');
        } finally {
            // setLoading(false);
        }
    }

    useEffect(() => {
        getUsers()
    }, [])

    // 修改columns定义，添加responsive属性
    const columns: ColumnsType<User> = [
        { title: 'ID', dataIndex: 'id', key: 'id', responsive: ['md'] },
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '邮箱', dataIndex: 'email', key: 'email', responsive: ['lg'] },
        { title: '角色', dataIndex: 'role', key: 'role' },
        { title: '状态', dataIndex: 'status', key: 'status', responsive: ['md'] },
        {
            title: '操作',
            key: 'action',
            render: (_: React.ReactNode, record: User) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        {!isMobile && '编辑'}
                    </Button>
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.key)}
                    >
                        {!isMobile && '删除'}
                    </Button>
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setIsModalVisible(true);
    };

    const handleDelete = (key: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个用户吗？',
            onOk() {
                setUsers(users.filter(user => user.key !== key));
                message.success('删除成功');
            },
        });
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            if (editingUser) {
                // 更新现有用户
                setUsers(users.map(user =>
                    user.key === editingUser.key ? { ...user, ...values } : user
                ));
                message.success('用户更新成功');
            } else {
                // 添加新用户
                const newUser = {
                    key: `${users.length + 1}`,
                    id: `USR${String(users.length + 1).padStart(3, '0')}`,
                    ...values,
                };
                setUsers([...users, newUser]);
                message.success('用户添加成功');
            }
            setIsModalVisible(false);
        });
    };

    return (
        <div>
            <Card
                title="用户管理"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        添加用户
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={users}
                    size={isMobile ? "small" : "middle"}
                    scroll={isMobile ? { x: 500 } : undefined}
                />
            </Card>

            <Modal
                title={editingUser ? '编辑用户' : '添加用户'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="姓名"
                        rules={[{ required: true, message: '请输入姓名' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select>
                            <Select.Option value="管理员">管理员</Select.Option>
                            <Select.Option value="员工">员工</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="状态"
                        rules={[{ required: true, message: '请选择状态' }]}
                    >
                        <Select>
                            <Select.Option value="活跃">活跃</Select.Option>
                            <Select.Option value="停用">停用</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;