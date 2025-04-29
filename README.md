# Chain Fox 官网前端项目

[English](README.md) | [中文](README.zh.md)

这是 Chain Fox 区块链安全平台的官方网站前端开源项目。本项目使用 React、Tailwind CSS 和 Framer Motion 构建，提供现代化的用户界面和流畅的动画效果，展示 Chain Fox 平台的功能和服务。

![Project Logo](/public/logo.png)

## 关于本项目

本项目是 Chain Fox 的官方网站前端代码库，旨在为用户提供直观、美观的界面来访问 Chain Fox 的区块链安全审计服务。项目特点包括：

- 现代化的 UI 设计，包括渐变效果和流畅动画
- 响应式布局，适配各种设备尺寸
- 多语言支持（英文和中文）
- 集成 DeepSeek AI 进行代码分析
- 专业的安全审计报告生成和 PDF 导出功能
- 基于 React 和 Tailwind CSS 的组件化架构

### 设计理念

贯穿整个首页的动态粒子网络背景 (NetworkParticles) 不仅仅是一个视觉装饰，它承载了 Chain Fox 的核心使命隐喻：

- **守护区块数据**：每一个闪烁的光点代表着广阔区块链宇宙中的一个区块节点，交织的线条则象征着复杂的数据流与交互。
- **照亮黑暗森林**：Chain Fox 如同守护者，细致地扫描并点亮这些区块，确保其安全与完整。从节点散发出的光芒穿透了潜在威胁丛生的"黑暗森林"，寓意着 Chain Fox 如何为复杂且时常晦涩的区块链世界带来清晰的安全视野。

*Author：[@1379hash](https://twitter.com/1379hash)*

## 关于 Chain Fox 平台

Chain Fox 是一个区块链安全平台，为区块链项目和智能合约提供自动化分析服务。该平台旨在通过自动化检测工具使区块链安全更加民主化和普及化。

Chain Fox 平台支持多种区块链（如以太坊、Solana、Polkadot 等）和编程语言（Rust、Go、Solidity 等），提供一键式报告生成，无需安装复杂工具。平台注重安全与保密，确保私有项目代码加密处理，从不共享，并根据用户请求删除。

## 前端项目核心特点

- 🎨 **现代化用户界面**
  - 精美的渐变效果和流畅动画
  - 完全响应式设计，适配各种设备
  - 基于 Tailwind CSS 的优雅样式系统

- 🌊 **动态视觉效果**
  - 使用 Three.js 实现的粒子背景效果
  - Framer Motion 驱动的平滑过渡动画
  - 悬浮卡片组件带有背景模糊效果

- 🌐 **国际化支持**
  - 完整的英文和中文语言支持
  - 基于 react-i18next 的灵活翻译系统
  - 易于扩展的多语言架构

- 🔍 **安全审计功能展示**
  - 代码分析界面，支持多种编程语言
  - GitHub 仓库分析集成
  - 漏洞检测结果可视化展示

- 🤖 **AI 集成**
  - DeepSeek AI 代码分析集成
  - 实时展示 AI 推理过程的打字机效果
  - AI 思考过程可视化

- 📊 **专业报告系统**
  - 生成全面的安全审计报告
  - 支持 PDF 导出功能
  - 美观的报告模板设计

- 🔐 **身份验证**
  - 集成 Supabase 身份验证
  - 支持 GitHub、Google 和 Discord 登录
  - 安全的用户会话管理

- 📱 **组件化架构**
  - 基于 React 的可复用组件系统
  - 清晰的项目结构和代码组织
  - 易于维护和扩展的模块化设计

## 前端功能展示

本前端项目展示了 Chain Fox 平台的主要功能和工作流程：

### 主页展示

- **品牌介绍**：展示 Chain Fox 的品牌形象和核心价值
- **动态背景**：使用 Three.js 实现的粒子效果背景
- **功能概览**：直观展示平台的主要功能和优势
- **多语言切换**：在英文和中文之间无缝切换

### 安全审计界面

- **多种输入方式**：
  - 代码片段直接输入
  - GitHub 仓库 URL 分析
  - 文件上传功能（即将推出）
- **语言选择**：支持多种区块链开发语言的代码高亮
- **实时分析**：展示分析进度和中间结果

### AI 分析展示

- **AI 思考过程**：实时展示 AI 的推理过程
- **打字机效果**：逐字显示 AI 分析结果，增强用户体验
- **可切换视图**：用户可以选择是否显示 AI 思考过程

### 报告系统

- **结果可视化**：直观展示安全审计结果
- **漏洞详情**：展示每个漏洞的详细信息和修复建议
- **报告生成**：生成专业的安全审计报告
- **PDF 导出**：将报告导出为 PDF 格式，方便分享和存档

### 用户认证

- **多平台登录**：支持 GitHub、Google 和 Discord 登录
- **用户管理**：安全的用户会话和权限管理
- **个性化体验**：根据用户偏好提供定制化内容

## 技术实现

本前端项目使用了多种现代 Web 技术和库：

### 前端框架与工具

- **React**：用于构建用户界面的 JavaScript 库
- **Vite**：快速的前端构建工具和开发服务器
- **Tailwind CSS**：实用优先的 CSS 框架
- **Framer Motion**：强大的 React 动画库
- **Three.js**：用于创建 3D 粒子效果的 JavaScript 库

### 功能实现

- **国际化**：使用 react-i18next 实现多语言支持
- **路由**：使用 React Router 实现页面导航
- **状态管理**：使用 React 的 Context API 和 Hooks
- **API 集成**：与 DeepSeek AI API 集成进行代码分析
- **身份验证**：集成 Supabase 身份验证服务
- **PDF 导出**：使用 jsPDF 和 html2canvas 实现报告导出

### 性能优化

- **代码分割**：使用 React.lazy 和 Suspense 实现按需加载
- **图像优化**：优化图像大小和格式
- **缓存策略**：实现适当的缓存策略
- **懒加载**：组件和资源的懒加载

## 项目展示

本前端项目展示了 Chain Fox 平台的功能，包括：

- **主页**：展示平台概述和主要功能
- **安全审计页面**：展示代码分析和漏洞检测功能
- **报告页面**：展示安全审计报告和 PDF 导出功能
- **用户认证**：展示多平台登录选项

通过这些页面，用户可以了解 Chain Fox 平台如何帮助区块链项目提高安全性，并体验平台的主要功能。

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发环境运行

```bash
npm run dev
# 或
yarn dev
```

应用将在 http://localhost:5173 启动。

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

构建文件将生成在 `dist` 目录中。

## 部署指南

本项目可以部署到多种环境，包括 Cloudflare Pages、Vercel、Netlify 等。详细的部署说明，请参考我们的[部署指南](./deploy.md)，其中包括：

- 环境变量配置
- Supabase 身份验证设置
- DeepSeek AI API 集成
- Cloudflare Pages 部署步骤
- 自定义域名配置

> **文档**: [English Deployment Guide](./deploy.md) | [中文部署指南](./deploy.zh.md)

## 项目结构

```
chain-fox/
├── src/
│   ├── components/            # 可复用 UI 组件
│   │   ├── AuditReport/       # 审计报告组件
│   │   ├── HomePage/          # 首页相关组件
│   │   ├── Layout/            # 布局组件
│   │   └── ...                # 其他组件
│   ├── pages/                 # 页面组件
│   │   ├── HomePage.jsx       # 首页
│   │   ├── DetectionPage.jsx  # 安全审计页面
│   │   └── AuthPage.jsx       # 认证页面
│   ├── services/              # 服务模块
│   │   ├── deepseek.js        # AI 集成服务
│   │   ├── pdfExport.js       # PDF 生成和导出服务
│   │   └── supabase.js        # 身份验证服务
│   ├── App.jsx                # 主应用组件（路由配置）
│   ├── i18n.js                # 国际化配置
│   └── main.jsx               # 应用入口
├── public/
│   ├── locales/               # 翻译文件
│   │   ├── en/                # 英文翻译
│   │   └── zh/                # 中文翻译
│   └── logo.png               # 应用程序 logo
├── docs/                      # 文档
│   └── 描述文档.md            # 项目描述文档
├── deploy.md                  # 部署指南(英文)
└── deploy.zh.md               # 部署指南(中文)
```

## 多语言支持

本项目使用 react-i18next 实现了完整的国际化支持：

- **支持语言**：
  - 英文 (en) - 默认语言
  - 中文 (zh)

- **翻译文件**：
  - 位于 `public/locales` 目录
  - 按语言代码和命名空间组织
  - `common.json` 包含共享翻译

- **添加新语言**：
  1. 在 `public/locales` 中创建新语言文件夹
  2. 复制并翻译现有 JSON 文件
  3. 在 `LanguageSwitcher.jsx` 中添加语言选项

## 功能开发计划

本前端项目正在积极开发中，计划添加的功能包括：

- 更多的可视化组件，展示安全分析结果
- 更完善的用户仪表板
- 团队协作功能
- 更多的报告模板和导出选项
- 移动端优化

## 贡献指南

我们欢迎社区贡献，帮助改进这个开源项目：

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加新功能：XXX'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

请确保您的代码符合项目的编码规范，并通过所有测试。

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。
