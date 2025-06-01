/**
 * 通知工具函数
 * 提供统一的通知显示接口
 */

// 简单的通知实现，可以根据需要替换为更复杂的通知库
export const showNotification = (message, type = 'info', duration = 5000) => {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = getNotificationClasses(type);
  notification.textContent = message;
  
  // 添加到页面
  document.body.appendChild(notification);
  
  // 显示动画
  setTimeout(() => {
    notification.classList.add('opacity-100', 'translate-y-0');
    notification.classList.remove('opacity-0', 'translate-y-2');
  }, 10);
  
  // 自动移除
  setTimeout(() => {
    notification.classList.add('opacity-0', 'translate-y-2');
    notification.classList.remove('opacity-100', 'translate-y-0');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
  
  // 点击移除
  notification.addEventListener('click', () => {
    notification.classList.add('opacity-0', 'translate-y-2');
    notification.classList.remove('opacity-100', 'translate-y-0');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  });
};

// 获取通知样式类
function getNotificationClasses(type) {
  const baseClasses = `
    fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg cursor-pointer
    transform transition-all duration-300 ease-in-out opacity-0 translate-y-2
    backdrop-blur-md border
  `;
  
  const typeClasses = {
    success: 'bg-green-900/80 border-green-500/50 text-green-100',
    error: 'bg-red-900/80 border-red-500/50 text-red-100',
    warning: 'bg-orange-900/80 border-orange-500/50 text-orange-100',
    info: 'bg-blue-900/80 border-blue-500/50 text-blue-100'
  };
  
  return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
}

// 预定义的通知类型
export const notifications = {
  success: (message, duration) => showNotification(message, 'success', duration),
  error: (message, duration) => showNotification(message, 'error', duration),
  warning: (message, duration) => showNotification(message, 'warning', duration),
  info: (message, duration) => showNotification(message, 'info', duration)
};

export default showNotification;
