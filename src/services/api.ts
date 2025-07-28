import axios from 'axios';
import type { Dayjs } from 'dayjs';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000', // JSON Server默认端口
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
    return response;
  },
  (error) => {
    if (error.response) {
      // 处理401未授权错误
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 修改登录API - 接收路径和参数
export const loginAPI = async ( loginData: { username: string; password: string }) => {
  try {
    // 使用POST方法发送登录请求
    const response = await api.post('/auth', loginData);
    
    // 模拟后端返回数据
    // 先获取auth数据进行验证
    const authResponse = await api.get('/auth');
    const user = authResponse.data.find((u: any) => 
      u.username === loginData.username && u.password === loginData.password
    );
    
    if (user) {
      console.log(user)
      return {
        code: 200,
        message: '登录成功',
        data: {
          token: user.token,
          userInfo: user.user
        }
      };
    } else {
      throw new Error('用户名或密码错误');
    }
  } catch (error: any) {
    if (error.message === '用户名或密码错误') {
      throw error;
    }
    throw new Error('登录请求失败');
  }
};

// 仪表盘API
export const dashboardAPI = {
  // 获取实时指标
  getRealTimeMetrics: async () => {
    const response = await api.get('/dashboard');
    return response.data.realTimeMetrics;
  },

  // 获取销售趋势
  getSalesTrend: async () => {
    const response = await api.get('/dashboard');
    return response.data.salesTrend;
  },

  // 获取分类统计
  getCategoryStats: async () => {
    const response = await api.get('/dashboard');
    return response.data.categoryStats;
  },

  // 获取时段分析
  getHourlyAnalysis: async () => {
    const response = await api.get('/dashboard');
    return response.data.hourlyAnalysis;
  },

  // 获取区域统计
  getRegionStats: async () => {
    const response = await api.get('/dashboard');
    return response.data.regionStats;
  },

  // 获取热销商品
  getHotProducts: async () => {
    const response = await api.get('/products');
    return response.data
      .sort((a: any, b: any) => b.sales - a.sales)
      .slice(0, 5);
  },

  // 获取告警信息
  getAlerts: async () => {
    const response = await api.get('/dashboard');
    return response.data.alerts;
  },

  // 获取AI预测
  getPrediction: async () => {
    const response = await api.get('/dashboard');
    return response.data.prediction;
  },

  // 获取核心指标配置
  getCoreMetricsConfig: async () => {
    const response = await api.get('/dashboard');
    return response.data.coreMetrics;
  },

  // 获取完整仪表盘数据
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  getNewDashboardData: async (dates: [Dayjs | null, Dayjs | null] | null)=>{
    const response = await api.post('/getNewDashboardData', dates);
    return response.data;
  }
};

// 用户个人信息API
export const userAPI = {
  // 获取当前用户信息
  getCurrentUserProfile: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await api.get(`/userProfiles/${user.id}`);
    return response.data;
  },

  // 更新用户信息
  updateUserProfile: async (userId: string, userData: any) => {
    const response = await api.put(`/userProfiles/${userId}`, userData);
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
  changePassword: async (userId: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    // 验证当前密码
    const authResponse = await api.get('/auth');
    const user = authResponse.data.find((u: any) => u.user.id.toString() === userId);
    
    if (!user || user.password !== passwordData.currentPassword) {
      throw new Error('当前密码错误');
    }

    // 更新密码
    const response = await api.patch(`/auth/${user.id}`, {
      password: passwordData.newPassword
    });

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