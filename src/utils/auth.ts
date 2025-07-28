// 验证token是否有效
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  // 这里可以添加更复杂的验证逻辑，比如检查JWT的过期时间
  // 简单示例仅检查token是否存在
  return true;
};

// 获取当前用户信息
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse user data', e);
    return null;
  }
};

// 检查用户是否有特定权限
export const hasPermission = (requiredRole: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // 简单的角色检查
  if (requiredRole === 'admin' && user.role === 'administrator') {
    return true;
  }
  
  return user.role === requiredRole;
};