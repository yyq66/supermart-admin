import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { message } from 'antd';

// 系统设置接口定义
export interface SystemSettings {
  // 商店基本信息
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  
  // 营业设置
  openTime: string;
  closeTime: string;
  currency: string;
  taxRate: number;
  
  // 库存管理
  lowStockThreshold: number;
  autoReorderEnabled: boolean;
  stockAlertEmail: boolean;
  
  // 会员设置
  membershipEnabled: boolean;
  pointsPerYuan: number;
  memberDiscountRate: number;
  
  // 系统设置
  autoBackup: boolean;
  backupTime: string;
  sessionTimeout: number;
  
  // 通知设置
  emailNotifications: boolean;
  lowStockAlert: boolean;
  dailyReport: boolean;
}

// 状态接口定义
interface SettingsState {
  settings: SystemSettings | null;
  loading: boolean;
  initialSettings: SystemSettings | null;
  
  // 操作方法
  loadSettings: () => Promise<void>;
  saveSettings: (newSettings: SystemSettings) => Promise<void>;
  updateSettings: (partialSettings: Partial<SystemSettings>) => void;
  resetSettings: () => void;
  setLoading: (loading: boolean) => void;
}

// 默认设置
const defaultSettings: SystemSettings = {
  storeName: '超市便利店',
  storeAddress: '北京市朝阳区xxx街道xxx号',
  storePhone: '010-12345678',
  storeEmail: 'store@example.com',
  openTime: '08:00',
  closeTime: '22:00',
  currency: 'CNY',
  taxRate: 13,
  lowStockThreshold: 10,
  autoReorderEnabled: false,
  stockAlertEmail: true,
  membershipEnabled: true,
  pointsPerYuan: 1,
  memberDiscountRate: 5,
  autoBackup: true,
  backupTime: '02:00',
  sessionTimeout: 30,
  emailNotifications: true,
  lowStockAlert: true,
  dailyReport: false
};

// 创建设置存储
const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 状态
      settings: null,
      loading: false,
      initialSettings: null,

      // 加载设置
      loadSettings: async () => {
        try {
          set({ loading: true });
          
          // 模拟API调用 - 可替换为实际API
          await new Promise(resolve => setTimeout(resolve, 500));
          const loadedSettings = { ...defaultSettings };
          
          set({ 
            settings: loadedSettings, 
            initialSettings: loadedSettings,
            loading: false 
          });
        } catch (error) {
          console.error('加载设置失败:', error);
          message.error('加载设置失败，请稍后重试');
          set({ loading: false });
        }
      },

      // 保存设置
      saveSettings: async (newSettings: SystemSettings) => {
        try {
          set({ loading: true });
          
          // 模拟API调用 - 可替换为实际API
          await new Promise(resolve => setTimeout(resolve, 1000));
          // await settingsAPI.updateSettings(newSettings);
          
          set({ settings: newSettings, loading: false });
          message.success('设置保存成功！');
        } catch (error) {
          console.error('保存设置失败:', error);
          message.error('保存设置失败，请稍后重试');
          set({ loading: false });
          throw error;
        }
      },

      // 更新部分设置
      updateSettings: (partialSettings: Partial<SystemSettings>) => {
        const { settings } = get();
        if (settings) {
          set({ settings: { ...settings, ...partialSettings } });
        }
      },

      // 重置设置
      resetSettings: () => {
        const { initialSettings } = get();
        if (initialSettings) {
          set({ settings: { ...initialSettings } });
          message.success('设置已重置到初始状态');
        } else {
          set({ settings: { ...defaultSettings } });
          message.success('设置已重置');
        }
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ loading });
      }
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ 
        settings: state.settings,
        initialSettings: state.initialSettings 
      })
    }
  )
);

export default useSettingsStore;