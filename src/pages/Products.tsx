import { useState, useEffect } from 'react';
import {
    Table, Card, Button, Space, Modal, Form, Input, InputNumber,
    Select, message, Upload, Image, Tag, Row, Col, Badge, Alert, Drawer, Dropdown
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
    ExportOutlined, EyeOutlined,WarningOutlined, ReloadOutlined, MoreOutlined
} from '@ant-design/icons';
import { productAPI } from '../services/api';

interface Product {
    key: string;
    id: string;
    name: string;
    category: string;
    price: string;
    stock: number;
    sales?: number;
    profit?: number;
    image?: string;
    description?: string;
    brand?: string;
    sku?: string;
    status: 'active' | 'inactive' | 'out_of_stock';
    minStock: number;
    supplier?: string;
    createTime?: string;
    updateTime?: string;
}

interface ProductCategory {
    value: string;
    label: string;
    children?: ProductCategory[];
}

const Products = () => {
    // 基础状态
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');



    // 搜索和筛选状态
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
    // const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
    const [stockFilter, setStockFilter] = useState<string>('all');

    // 监听窗口大小
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 搜索和筛选逻辑
    useEffect(() => {
        let filtered = products;

        // 文本搜索
        if (searchText) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                product.id.toLowerCase().includes(searchText.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // 分类筛选
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // 状态筛选
        if (selectedStatus) {
            filtered = filtered.filter(product => product.status === selectedStatus);
        }


        // 库存筛选
        if (stockFilter === 'low') {
            filtered = filtered.filter(product => product.stock <= product.minStock);
        } else if (stockFilter === 'out') {
            filtered = filtered.filter(product => product.stock === 0);
        }

        setFilteredProducts(filtered);
    }, [products, searchText, selectedCategory, selectedStatus, , stockFilter]);

    // 表格列配置
    const columns = [
        // {title: 'ID', dataIndex: 'id', key: 'id', width: 80, fixed: 'left' as const,},
        {
            title: '商品名称', dataIndex: 'name', key: 'name',
            ellipsis: true,
        },
        {
            title: 'SKU', dataIndex: 'sku', key: 'sku',
        },
        {
            title: '分类', dataIndex: 'category', key: 'category',
        },
        {
            title: '价格', dataIndex: 'price', key: 'price',
            sorter: (a: Product, b: Product) => parseFloat(a.price) - parseFloat(b.price), render: (price: string) => `¥${price}`,
        },
        {
            title: '库存',
            dataIndex: 'stock',
            key: 'stock',
            sorter: (a: Product, b: Product) => a.stock - b.stock,
            render: (stock: number, record: Product) => {
                if (stock === 0) {
                    return <Badge status="error" text={`${stock} (缺货)`} />;
                } else if (stock <= record.minStock) {
                    return <Badge status="warning" text={`${stock} (低库存)`} />;
                } else {
                    return <Badge status="success" text={stock} />;
                }
            },
        },
        {
            title: '销量',
            dataIndex: 'sales',
            key: 'sales',
            sorter: (a: Product, b: Product) => (a.sales || 0) - (b.sales || 0),
            render: (sales: number) => sales || 0,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusConfig = {
                    active: { color: 'green', text: '上架' },
                    inactive: { color: 'red', text: '下架' },
                    out_of_stock: { color: 'orange', text: '缺货' },
                };
                const config = statusConfig[status as keyof typeof statusConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: isMobile ? '' : '操作',
            key: 'action',
            width: isMobile ? 10 : 80,
            fixed: 'right' as const,
            render: (_: any, record: Product) => {
                const menuItems = [
                    {
                        key: 'view',
                        icon: <EyeOutlined />,
                        label: '查看详情',
                        onClick: () => handleView(record)
                    },
                    {
                        key: 'edit',
                        icon: <EditOutlined />,
                        label: '编辑',
                        onClick: () => handleEdit(record)
                    },
                    {
                        key: 'delete',
                        icon: <DeleteOutlined />,
                        label: '删除',
                        danger: true,
                        onClick: () => {
                            Modal.confirm({
                                title: '确定要删除这个商品吗？',
                                content: `商品：${record.name}`,
                                onOk: () => handleDelete(record.key),
                                okText: '确定',
                                cancelText: '取消'
                            });
                        }
                    }
                ];
                return (
                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined />}
                            size="small"
                        />
                    </Dropdown>
                );
            }
        },
    ];

    // 商品分类选项
    const categoryOptions = [
        { value: '水果', label: '水果' },
        { value: '蔬菜', label: '蔬菜' },
        { value: '肉类', label: '肉类' },
        { value: '海鲜', label: '海鲜' },
        { value: '乳制品', label: '乳制品' },
        { value: '粮油', label: '粮油' },
        { value: '调料', label: '调料' },
        { value: '饮料', label: '饮料' },
        { value: '零食', label: '零食' },
        { value: '日用品', label: '日用品' },
    ];

    // 获取商品数据
    useEffect(() => {
        getProducts();
    }, []);


    // 获取商品数据
    const getProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getProducts();
            const productsWithKey = response.data.map((product: any) => ({
                ...product,
                key: product.id,
                minStock: product.minStock || 10, // 默认最低库存
            }));
            setProducts(productsWithKey);
        } catch (error) {
            message.error('获取商品数据失败');
        } finally {
            setLoading(false);
        }
    };

    // 添加商品
    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // 编辑商品
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        form.setFieldsValue(product);
        setIsModalVisible(true);
    };

    // 删除商品
    const handleDelete = (key: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个商品吗？',
            onOk() {
                productAPI.deleteProduct(key).then(() => {
                    getProducts();
                    message.success('删除成功');
                });
            },
        });
    }

    // 处理表单提交
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            let imageUrl = editingProduct?.image || '';

            // 如果有新选择的图片，尝试上传
            if (selectedFile) {
                try {
                    const uploadResponse = await productAPI.uploadProductImage(selectedFile);
                    imageUrl = uploadResponse.data.url;
                    message.success('图片上传成功');
                } catch (error) {
                    message.warning('图片上传失败，商品将保存但不包含图片');
                    // 继续执行，不阻止商品保存
                }
            }
            console.log("values", values)

            const newProduct: Product = {
                ...values,
                // price: values.price.toFixed(2),
                image: imageUrl, // 使用上传后的图片URL
                key: editingProduct ? editingProduct.key : Date.now().toString(),
                id: editingProduct ? editingProduct.id : `P${Date.now()}`,
                sales: editingProduct ? editingProduct.sales : 0,
                createTime: editingProduct ? editingProduct.createTime : new Date().toISOString(),
                updateTime: new Date().toISOString(),
            };
            console.log(typeof newProduct.price)

            if (editingProduct) {
                await productAPI.updateProduct(editingProduct.key, newProduct);
                message.success('更新成功');
            } else {
                await productAPI.addProduct(newProduct);
                message.success('添加成功');
            }

            // 清理状态
            setIsModalVisible(false);
            setSelectedFile(null);
            setPreviewUrl('');
            form.resetFields();
            getProducts();

        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    // 记录操作日志
    const logOperation = (operation: any) => {
        console.log('Operation logged:', operation);
        // 可以发送到后端记录
    };
    // 获取当前用户
    const getCurrentUser = () => {
        // 从用户状态或localStorage获取当前用户信息
        return JSON.parse(localStorage.getItem('user') || '{}');
    };

    // 批量操作
    const handleBatchDelete = () => {
        // if (selectedRowKeys.length === 0) {
        //     message.warning('请选择要删除的商品');
        //     return;
        // }

        Modal.confirm({
            title: '批量删除确认',
            content: `确定要删除选中的 ${selectedRowKeys.length} 个商品吗？`,
            okText: '确定删除',
            okType: 'danger',
            cancelText: '取消',
            width: 500,
            async onOk() {
                // 添加操作日志
                logOperation({
                    action: 'batch_delete_products',
                    count: selectedRowKeys.length,
                    user: getCurrentUser()?.id,
                    timestamp: new Date().toISOString()
                });

                const res = await productAPI.batchDeleteProducts(selectedRowKeys);
                getProducts();
                setSelectedRowKeys([]);
                message.success(res.message);
            },
        });
    };

    // 批量上架、下架
    const handleBatchStatusChange = async (status: 'active' | 'inactive') => {
        // if (selectedRowKeys.length === 0) {
        //     message.warning('请选择要操作的商品');
        //     return;
        // }

        try {
            const res = await productAPI.batchUpdateStatus(selectedRowKeys as string[], status);
            if(res.success){
                 // 更新本地状态
            setProducts(products.map(product =>
                selectedRowKeys.includes(product.key)
                    ? { ...product, status: status as Product['status'] }
                    : product
            ));
            setSelectedRowKeys([]);
            message.success(res.message || `成功更新 ${selectedRowKeys.length} 个商品状态`);
            }
        } catch (error) {
            message.error('批量更新失败');
        }
    };

    // 导出功能
    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,名称,分类,价格,库存,最低库存,供应商,状态,描述\n"
            + filteredProducts.map(product =>
                `${product.id},${product.name},${product.category},${product.price},${product.stock},${product.minStock},${product.supplier},${product.status},${product.description}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "products.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('导出成功');
    };

    // 查看商品详情
    const handleView = (product: Product) => {
        setViewingProduct(product);
        setIsDetailVisible(true);
    };

    // 图片选择处理（不立即上传）
    const handleImageChange = (file: File) => {
        // 创建预览URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setSelectedFile(file);

        // 更新表单字段（临时存储文件对象）
        form.setFieldValue('imageFile', file);

        message.success('图片选择成功，提交时将自动上传');
    };

    // 计算低库存商品数量
    const lowStockCount = products.filter(product =>
        product.stock <= product.minStock && product.stock > 0
    ).length;


    // 搜索栏组件
    const renderSearchBar = () => (
        <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Input
                        placeholder="搜索商品名称或SKU"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={12} md={4}>
                    <Select
                        placeholder="选择分类"
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        allowClear
                        className='w-full'
                        options={categoryOptions}
                    />
                </Col>
                <Col xs={24} sm={12} md={4}>
                    <Select
                        placeholder="商品状态"
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        allowClear
                        className='w-full'
                        options={[
                            { value: 'active', label: '上架' },
                            { value: 'inactive', label: '下架' },
                            { value: 'out_of_stock', label: '缺货' }
                        ]}
                    />
                </Col>
                <Col xs={24} sm={12} md={4}>
                    <Select
                        placeholder="库存状态"
                        value={stockFilter}
                        onChange={setStockFilter}
                        style={{ width: '100%' }}
                        options={[
                            { value: 'all', label: '全部' },
                            { value: 'low', label: '低库存' },
                            { value: 'out', label: '缺货' }
                        ]}
                    />
                </Col>
                <Col xs={24} sm={24} md={6}>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setSearchText('');
                                setSelectedCategory('');
                                setSelectedStatus('');
                                setStockFilter('all');
                                // setPriceRange(null);
                            }}
                        >
                            重置
                        </Button>
                        <Button
                            type="primary"
                            icon={<ExportOutlined />}
                            onClick={handleExport}
                        >
                            导出
                        </Button>
                    </Space>
                </Col>
            </Row>
        </Card>
    );


    // 添加、编辑商品表单组件
    const renderProductForm = () => (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                status: 'active',
                minStock: 10,
            }}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="name"
                        label="商品名称"
                        rules={[{ required: true, message: '请输入商品名称' }]}
                    >
                        <Input placeholder="请输入商品名称" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="sku"
                        label="SKU"
                        rules={[{ required: true, message: '请输入SKU' }]}
                    >
                        <Input placeholder="请输入SKU" />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="category"
                        label="商品分类"
                        rules={[{ required: true, message: '请选择商品分类' }]}
                    >
                        <Select
                            placeholder="请选择商品分类"
                            options={categoryOptions}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="brand"
                        label="品牌"
                    >
                        <Input placeholder="请输入品牌" />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name="price"
                        label="价格"
                        rules={[{ required: true, message: '请输入价格' }]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            placeholder="请输入价格"
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="stock"
                        label="库存"
                        rules={[{ required: true, message: '请输入库存' }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="请输入库存"
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="minStock"
                        label="最低库存"
                        rules={[{ required: true, message: '请输入最低库存' }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="请输入最低库存"
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="supplier"
                        label="供应商"
                    >
                        <Input placeholder="请输入供应商" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="status"
                        label="商品状态"
                        rules={[{ required: true, message: '请选择商品状态' }]}
                    >
                        <Select
                            placeholder="请选择商品状态"
                            options={[
                                { value: 'active', label: '上架' },
                                { value: 'inactive', label: '下架' },
                                { value: 'out_of_stock', label: '缺货' }
                            ]}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item
                name="description"
                label="商品描述"
            >
                <Input.TextArea
                    rows={3}
                    placeholder="请输入商品描述"
                />
            </Form.Item>
            <Form.Item
                name="image"
                label="商品图片"
            >
                <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={(file) => {
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

                        handleImageChange(file);
                        return false; // 阻止自动上传
                    }}
                // onChange={handleImageChange}
                >
                    {(previewUrl || editingProduct?.image) ? (
                        <img
                            src={previewUrl || editingProduct?.image}
                            alt="商品图片"
                            style={{ width: '100%' }}
                        />
                    ) : (
                        <div>
                            <PlusOutlined />
                            <div className='mt-2'>上传图片</div>
                        </div>
                    )}
                    {/* {editingProduct?.image ? (
                        <img src={editingProduct.image} alt="商品图片" style={{ width: '100%' }} />
                    ) : (
                        <div>
                            <PlusOutlined />
                            <div className='mt-2'>上传图片</div>
                        </div>
                    )} */}
                </Upload>
            </Form.Item>
        </Form>
    );

    return (
        <div>
            {/* 库存预警 */}
            {lowStockCount > 0 && (
                <Alert
                    message={`有 ${lowStockCount} 个商品库存不足，请及时补货`}
                    type="warning"
                    icon={<WarningOutlined />}
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* 搜索筛选栏 */}
            {renderSearchBar()}

            {/* 商品管理 */}
            <Card
                title="商品管理"
                extra={
                    <Space>
                        {selectedRowKeys.length > 0 && (
                            <div>
                                <Button danger onClick={handleBatchDelete}>删除 ({selectedRowKeys.length})</Button>
                                <Button onClick={() => handleBatchStatusChange('active')}>上架</Button>
                                <Button onClick={() => handleBatchStatusChange('inactive')}>下架</Button>
                            </div>
                        )}
                        <Button
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            {isMobile ? '' : '添加商品'}
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredProducts}
                    loading={loading}
                    size={isMobile ? 'small' : 'middle'}
                    scroll={{ x: 600 }}
                    tableLayout="auto"
                    rowSelection={{
                        columnWidth: 10,
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                    }}
                    pagination={{
                        total: filteredProducts.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                    }}
                />
            </Card>

            {/* 添加/编辑商品弹窗 */}
            <Modal
                title={editingProduct ? '编辑商品' : '添加商品'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={800}
                okText="确定"
                cancelText="取消"
            >
                {renderProductForm()}
            </Modal>

            {/* 商品详情抽屉 */}
            <Drawer
                title="商品详情"
                placement="right"
                onClose={() => setIsDetailVisible(false)}
                open={isDetailVisible}
                width={400}
            >
                {viewingProduct && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Image
                                width={200}
                                src={viewingProduct.image}
                            />
                        </div>
                        <div>
                            <p><strong>商品名称：</strong>{viewingProduct.name}</p>
                            <p><strong>SKU：</strong>{viewingProduct.sku}</p>
                            <p><strong>分类：</strong>{viewingProduct.category}</p>
                            <p><strong>品牌：</strong>{viewingProduct.brand}</p>
                            <p><strong>价格：</strong>¥{viewingProduct.price}</p>
                            <p><strong>库存：</strong>{viewingProduct.stock}</p>
                            <p><strong>销量：</strong>{viewingProduct.sales || 0}</p>
                            <p><strong>状态：</strong>{viewingProduct.status}</p>
                            <p><strong>描述：</strong>{viewingProduct.description}</p>
                        </div>
                    </div>
                )}
            </Drawer>

        </div>
    );
};

export default Products;