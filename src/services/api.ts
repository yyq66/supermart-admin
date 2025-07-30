import axios from 'axios';
import type { Dayjs } from 'dayjs';

interface User {
    key: string;
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

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

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 成功响应直接返回
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // switch (status) {
      //   case 401:
      //     // 处理401未授权错误
      //     console.warn('用户未授权或登录已过期');
      //     localStorage.removeItem('token');
      //     localStorage.removeItem('user');
          
      //     // 如果当前不在登录页，则跳转到登录页
      //     if (window.location.pathname !== '/login') {
      //       // 保存当前页面路径，登录后可以跳转回来
      //       localStorage.setItem('redirectPath', window.location.pathname);
      //       window.location.href = '/login';
      //     }
      //     break;
          
      //   case 403:
      //     // 处理403权限不足错误
      //     console.error('权限不足，无法访问该资源');
      //     // 可以显示权限不足的提示
      //     break;
          
      //   case 404:
      //     // 处理404资源不存在错误
      //     console.error('请求的资源不存在');
      //     break;
          
      //   case 422:
      //     // 处理422数据验证错误
      //     console.error('数据验证失败:', data?.message || '请检查输入数据');
      //     break;
          
      //   case 500:
      //     // 处理500服务器内部错误
      //     console.error('服务器内部错误，请稍后重试');
      //     break;
          
      //   default:
      //     // 处理其他HTTP错误
      //     console.error(`请求失败 (${status}):`, data?.message || error.message);
      // }
      
      // 如果后端返回了具体的错误信息，优先使用后端的错误信息
      if (data?.message) {
        error.message = data.message;
      }
    } else if (error.request) {
      // 网络错误或请求超时
      console.error('网络错误或请求超时，请检查网络连接');
      error.message = '网络连接失败，请检查网络设置';
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 修改登录API - 接收路径和参数
export const loginAPI = async ( loginData: { username: string; password: string }) => {
  try {
    const response = await api.post('/auth/login', loginData);
    console.log(response)
    return response.data
  } catch (error: any) {
      throw error;
  }
};

export const userAPI = {
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      // console.log("获取用户列表成功",response.data)
      return response.data
      // return {
      //   code: 200,
      //   message: '获取用户列表成功',
      //   data: response.data
      // }
    } catch (error) {
      throw new Error('获取用户列表失败');
    }
  },
  deleteUser: async (id: string) => {
    try {
      const response = await api.delete(`/users/${id}`);
      console.log("删除用户成功",response.data)
      return {
        code: 200,
        message: '删除用户成功',
        data: response.data
      }
    } catch (error) {
      throw new Error('删除用户失败');
    }
  },
  updateUser: async (id: string, userData: User) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return {
        code: 200,
        message: '更新用户成功',
        data: response.data
      }
    } catch (error) {
      throw new Error('更新用户失败');
    }
  },
  addUser: async (userData: User) => {
    try {
      console.log("添加用户",userData)
      const response = await api.post('/users', userData);
      return {
        code: 200,
        message: '添加用户成功',
        data: response.data
      }
    } catch (error) {
      throw new Error('添加用户失败');
    }
  }
}

// 用户管理API
// export const userAPI = async ()=>{
//   try {
//     const response = await api.get('/users');
//     // console.log(response)
//     return {
//       code: 200,
//       message: '获取用户列表成功',
//       data: response.data
//     }
//   } catch (error) {
//     throw new Error('获取用户列表失败');
//   }
// }

// 完善的商品管理API
export const productAPI = {
  // 获取商品列表（支持搜索和筛选）
  getProducts: async (params?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      const response = await api.get('/products', { params });
      return {
        code: 200,
        message: '获取商品列表成功',
        data: response.data,
        total: response.headers['x-total-count'] || response.data.length
      };
    } catch (error) {
      throw new Error('获取商品列表失败');
    }
  },
  // 删除商品
  deleteProduct: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return {
        code: 200,
        message: '删除商品成功',
      };
    } catch (error) {
      throw new Error('删除商品失败');
    }
  },
  // 添加商品
  addProduct: async (productData: Product) => {
    try {
      const response = await api.post('/products', productData);
      return {
        code: 200,
        message: '添加商品成功',
        data: response.data
      };
    } catch (error) {
      throw new Error('添加商品失败');
    }
  },
  // 更新商品
  updateProduct: async (id: string, productData: Product) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return {
        code: 200,
        message: '更新商品成功',
        data: response.data
      };
    } catch (error) {
      throw new Error('更新商品失败');
    }
  },
  // 上传图片
  uploadImage: async (id: string, file: File) => {
    try {
      // const response = await api.post('/upload', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });

      // const formData = new FormData();
      // formData.append('image', file);
      // 模拟图片上传，实际应该上传到文件服务器
      const imageUrl = `/images/products/${Date.now()}_${file.name}`;

      // 更新商品图片
    const response = await api.patch(`/products/${id}`, {
      image: imageUrl
    });
      return {
        code: 200,
        message: '图片上传成功',
        data: imageUrl
      };
    } catch (error) {
      throw new Error('图片上传失败');
    }
  },

  // 获取单个商品详情
  getProductById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return {
        code: 200,
        message: '获取商品详情成功',
        data: response.data
      };
    } catch (error) {
      throw new Error('获取商品详情失败');
    }
  },

  // 创建新商品
  // createProduct: async (productData: {
  //   name: string;
  //   sku: string;
  //   category: string;
  //   price: number;
  //   stock: number;
  //   minStock: number;
  //   description?: string;
  //   brand?: string;
  //   supplier?: string;
  //   status: 'active' | 'inactive';
  //   image?: string;
  // }) => {
  //   try {
  //     const newProduct = {
  //       ...productData,
  //       id: Date.now().toString(),
  //       sales: 0,
  //       profit: 0,
  //       createTime: new Date().toISOString(),
  //       updateTime: new Date().toISOString()
  //     };
      
  //     const response = await api.post('/products', newProduct);
  //     return {
  //       code: 200,
  //       message: '商品创建成功',
  //       data: response.data
  //     };
  //   } catch (error) {
  //     throw new Error('商品创建失败');
  //   }
  // },

  // 批量删除商品
  batchDeleteProducts: async (ids: React.Key[]) => {
    try {
      const deletePromises = ids.map(id => api.delete(`/products/${id}`));
      await Promise.all(deletePromises);
      return {
        code: 200,
        message: `成功删除 ${ids.length} 个商品`
      };
    } catch (error) {
      throw new Error('批量删除失败');
    }
  },

  // 批量更新商品状态
  batchUpdateStatus: async (ids: string[], status: 'active' | 'inactive') => {
    try {
      const updatePromises = ids.map(id => 
        api.patch(`/products/${id}`, { 
          status, 
          updateTime: new Date().toISOString() 
        })
      );
      await Promise.all(updatePromises);
      return {
        code: 200,
        message: `成功更新 ${ids.length} 个商品状态`
      };
    } catch (error) {
      throw new Error('批量更新状态失败');
    }
  },

  // 更新库存
  // updateStock: async (id: string, stock: number, operation: 'set' | 'add' | 'subtract') => {
  //   try {
  //     let newStock = stock;
      
  //     if (operation !== 'set') {
  //       // 先获取当前库存
  //       const currentProduct = await api.get(`/products/${id}`);
  //       const currentStock = currentProduct.data.stock;
        
  //       if (operation === 'add') {
  //         newStock = currentStock + stock;
  //       } else if (operation === 'subtract') {
  //         newStock = Math.max(0, currentStock - stock);
  //       }
  //     }
      
  //     const response = await api.patch(`/products/${id}`, { 
  //       stock: newStock,
  //       status: newStock === 0 ? 'out_of_stock' : 'active',
  //       updateTime: new Date().toISOString()
  //     });
      
  //     return {
  //       code: 200,
  //       message: '库存更新成功',
  //       data: response.data
  //     };
  //   } catch (error) {
  //     throw new Error('库存更新失败');
  //   }
  // },

  // 获取低库存商品
  getLowStockProducts: async () => {
    try {
      const response = await api.get('/products');
      const lowStockProducts = response.data.filter((product: any) => 
        product.stock <= product.minStock
      );
      
      return {
        code: 200,
        message: '获取低库存商品成功',
        data: lowStockProducts
      };
    } catch (error) {
      throw new Error('获取低库存商品失败');
    }
  },

  // 获取商品分类列表
  getCategories: async () => {
    try {
      const response = await api.get('/products');
      const categories = [...new Set(response.data.map((product: any) => product.category))];
      
      return {
        code: 200,
        message: '获取分类列表成功',
        data: categories.map(category => ({ value: category, label: category }))
      };
    } catch (error) {
      throw new Error('获取分类列表失败');
    }
  },

  // 上传商品图片
  uploadProductImage: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // 模拟图片上传，实际应该上传到文件服务器
      // const imageUrl = `/images/products/${Date.now()}_${file.name}`;
      const imageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${file.name}_${Date.now()}`
      
      return {
        code: 200,
        message: '图片上传成功',
        data: { url: imageUrl }
      };
    } catch (error) {
      throw new Error('图片上传失败');
    }
  },

  // 导出商品数据
  exportProducts: async (params?: {
    search?: string;
    category?: string;
    status?: string;
  }) => {
    try {
      const response = await api.get('/products', { params });
      return {
        code: 200,
        message: '导出数据成功',
        data: response.data
      };
    } catch (error) {
      throw new Error('导出数据失败');
    }
  },

  // 获取商品统计信息
  getProductStats: async () => {
    try {
      const response = await api.get('/products');
      const products = response.data;
      
      const stats = {
        total: products.length,
        active: products.filter((p: any) => p.status === 'active').length,
        inactive: products.filter((p: any) => p.status === 'inactive').length,
        outOfStock: products.filter((p: any) => p.stock === 0).length,
        lowStock: products.filter((p: any) => p.stock <= p.minStock && p.stock > 0).length,
        totalValue: products.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0),
        categories: [...new Set(products.map((p: any) => p.category))].length
      };
      
      return {
        code: 200,
        message: '获取统计信息成功',
        data: stats
      };
    } catch (error) {
      throw new Error('获取统计信息失败');
    }
  }
};



// 首页API
export const dashboardAPI = {
  // 获取核心指标
  getCoreMetrics: async () => {
    try {
      const response = await api.get('/dashboard/core-metrics');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取核心指标失败');
    }
  },

  // 获取销售趋势
  getSalesTrend: async () => {
    try {
      const response = await api.get('/dashboard/sales-trend');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取销售趋势失败');
    }
  },

  // 获取分类统计
  getCategoryStats: async () => {
    try {
      const response = await api.get('/dashboard/category-stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取分类统计失败');
    }
  },

  // 获取小时分析
  getHourlyAnalysis: async () => {
    try {
      const response = await api.get('/dashboard/hourly-analysis');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取小时分析失败');
    }
  },

  // 获取地区统计
  getRegionStats: async () => {
    try {
      const response = await api.get('/dashboard/region-stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取地区统计失败');
    }
  },

  // 获取预警信息
  getAlerts: async () => {
    try {
      const response = await api.get('/dashboard/alerts');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取预警信息失败');
    }
  },

  // 获取预测数据
  getPrediction: async () => {
    try {
      const response = await api.get('/dashboard/prediction');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取预测数据失败');
    }
  },

  // 获取热销商品（从产品接口获取）
  getHotProducts: async () => {
    try {
      const response = await api.get('/products');
      if (response.data.code === 200) {
        return response.data.data
          .sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 5);
      }
      throw new Error(response.data.message || '获取热销商品失败');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取热销商品失败');
    }
  },

  // 获取完整仪表盘数据
  getDashboardData: async () => {
    try {
      const [coreMetrics, salesTrend, categoryStats, hourlyAnalysis, regionStats, alerts, prediction] = await Promise.all([
        dashboardAPI.getCoreMetrics(),
        dashboardAPI.getSalesTrend(),
        dashboardAPI.getCategoryStats(),
        dashboardAPI.getHourlyAnalysis(),
        dashboardAPI.getRegionStats(),
        dashboardAPI.getAlerts(),
        dashboardAPI.getPrediction()
      ]);

      return {
        coreMetrics: coreMetrics.data,
        salesTrend: salesTrend.data,
        categoryStats: categoryStats.data,
        hourlyAnalysis: hourlyAnalysis.data,
        regionStats: regionStats.data,
        alerts: alerts.data,
        prediction: prediction.data
      };
    } catch (error: any) {
      throw new Error('获取仪表盘数据失败');
    }
  }
};

// 用户个人信息API
export const userInfoAPI = {
  // 获取当前用户信息
  getUserProfile: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await api.get(`/userProfiles/userInfo`);
    return response.data;
  },

  // 更新用户信息
  updateUserProfile: async ( userData: any) => {
    const response = await api.put(`/userProfiles/userInfo`, userData);
    return response.data;
  },

  // 上传头像
  uploadAvatar: async (userId: string, file: File) => {
    // 模拟头像上传，实际项目中应该上传到文件服务器
    const formData = new FormData();
    formData.append('avatar', file);
    
    // 这里模拟返回一个头像URL
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}_${Date.now()}`;
    
    // 更新用户头像
    const response = await api.patch(`/userProfiles/${userId}`, {
      avatar: avatarUrl
    });
    
    return {
      avatarUrl,
      user: response.data
    };
  },

  // 修改密码
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    // 验证当前密码
    // const authResponse = await api.get('/auth');
    // const user = authResponse.data.find((u: any) => u.user.id.toString() === userId);
    
    // if (!user || user.password !== passwordData.currentPassword) {
    //   throw new Error('当前密码错误');
    // }

    // 更新密码
    const response = await api.patch(`/userProfiles/change-password`, passwordData);

    return {
      message: '密码修改成功'
    };
  },

  // 切换两步验证
  toggleTwoFactor: async (userId: string, enabled: boolean) => {
    const response = await api.patch(`/userProfiles/${userId}`, {
      'settings.twoFactorEnabled': enabled
    });
    return response.data;
  },

  // 更新通知设置
  updateNotificationSettings: async (userId: string, settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
  }) => {
    const response = await api.patch(`/userProfiles/${userId}`, {
      'settings.emailNotifications': settings.emailNotifications,
      'settings.smsNotifications': settings.smsNotifications
    });
    return response.data;
  }
};

export default api;