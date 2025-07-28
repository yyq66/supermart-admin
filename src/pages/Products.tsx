import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Product {
    key: string;
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
}

const Products = () => {
    const [products, setProducts] = useState<Product[]>([
        { key: '1', id: 'PRD001', name: '苹果', category: '水果', price: 5.99, stock: 100 },
        { key: '2', id: 'PRD002', name: '香蕉', category: '水果', price: 3.99, stock: 150 },
        { key: '3', id: 'PRD003', name: '牛奶', category: '饮料', price: 4.50, stock: 80 },
        { key: '4', id: 'PRD004', name: '面包', category: '食品', price: 2.99, stock: 60 },
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // 添加窗口大小监听
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: '商品名称', dataIndex: 'name', key: 'name' },
        { title: '分类', dataIndex: 'category', key: 'category' },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `¥${price.toFixed(2)}`
        },
        { title: '库存', dataIndex: 'stock', key: 'stock' },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: Product) => (
                <Space size="middle">
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
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        form.setFieldsValue(product);
        setIsModalVisible(true);
    };

    const handleDelete = (key: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个商品吗？',
            onOk() {
                setProducts(products.filter(product => product.key !== key));
                message.success('删除成功');
            },
        });
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            if (editingProduct) {
                // 更新现有商品
                setProducts(products.map(product =>
                    product.key === editingProduct.key ? { ...product, ...values } : product
                ));
                message.success('商品更新成功');
            } else {
                // 添加新商品
                const newProduct = {
                    key: `${products.length + 1}`,
                    id: `PRD${String(products.length + 1).padStart(3, '0')}`,
                    ...values,
                };
                setProducts([...products, newProduct]);
                message.success('商品添加成功');
            }
            setIsModalVisible(false);
        });
    };

    const categoryOptions = [
        { value: '水果', label: '水果' },
        { value: '蔬菜', label: '蔬菜' },
        { value: '肉类', label: '肉类' },
        { value: '饮料', label: '饮料' },
        { value: '食品', label: '食品' },
        { value: '日用品', label: '日用品' },
    ];

    return (
        <div>
            <Card
                title="商品管理"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        添加商品
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={products}
                    size={isMobile ? "small" : "middle"}
                    scroll={isMobile ? { x: 500 } : undefined}
                />
            </Card>

            <Modal
                title={editingProduct ? '编辑商品' : '添加商品'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="商品名称"
                        rules={[{ required: true, message: '请输入商品名称' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="category"
                        label="分类"
                        rules={[{ required: true, message: '请选择商品分类' }]}
                    >
                        <Select options={categoryOptions} />
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="价格"
                        rules={[{ required: true, message: '请输入商品价格' }]}
                    >
                        <InputNumber<number>
                            min={0.01}
                            step={0.01}
                            precision={2}
                            style={{ width: '100%' }}
                            formatter={(value) => `¥ ${value}`}
                            parser={(value: string | undefined) => (typeof value === 'string' ? parseFloat(value.replace(/¥\s?/g, '')) : 0.01)}
                        />
                    </Form.Item>
                    <Form.Item
                        name="stock"
                        label="库存"
                        rules={[{ required: true, message: '请输入商品库存' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Products;