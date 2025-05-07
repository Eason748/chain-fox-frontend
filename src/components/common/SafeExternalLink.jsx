import React from 'react';
import { useTranslation } from 'react-i18next';
import { openSafeExternalLink } from '../../utils/safeExternalLink';

/**
 * 安全的外部链接组件
 * 替代普通的<a>标签，提供更安全的外部链接处理
 * 
 * @param {Object} props - 组件属性
 * @param {string} props.href - 链接URL
 * @param {string} props.className - CSS类名
 * @param {React.ReactNode} props.children - 子元素
 * @param {Array<string>} props.allowedDomains - 允许的域名列表
 * @param {string} props.warningMessage - 自定义警告消息
 * @param {Function} props.onClick - 点击事件处理函数
 * @param {Object} props.rest - 其他属性
 */
function SafeExternalLink({
  href,
  className = '',
  children,
  allowedDomains,
  warningMessage,
  onClick,
  ...rest
}) {
  const { t } = useTranslation(['common']);
  
  // 默认警告消息
  const defaultWarningMessage = t('common:externalLink.generalWarning', 
    '您将被重定向到外部网站。是否继续？');
  
  // 处理点击事件
  const handleClick = (e) => {
    // 如果提供了onClick处理函数，先调用它
    if (onClick) {
      onClick(e);
    }
    
    // 如果事件已被阻止默认行为，则不继续处理
    if (e.defaultPrevented) {
      return;
    }
    
    // 阻止默认行为
    e.preventDefault();
    
    // 使用安全链接打开函数
    openSafeExternalLink(
      href,
      {
        allowedDomains,
        warningMessage: warningMessage || defaultWarningMessage,
        onError: (error) => console.error('External link error:', error)
      },
      e
    );
  };
  
  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      // 安全属性
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
}

export default SafeExternalLink;
