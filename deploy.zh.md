# Chain Fox 部署指南

本文档提供了 Chain Fox 应用程序的详细部署说明，包括设置 Supabase 身份验证（支持 GitHub、Google、Discord 多种登录方式）以及使用 Cloudflare Pages 部署应用程序。

## 目录

- [前提条件](#前提条件)
- [环境变量](#环境变量)
- [Supabase 设置](#supabase-设置)
  - [创建 Supabase 项目](#创建-supabase-项目)
  - [配置身份验证](#配置身份验证)
  - [设置 OAuth 提供商](#设置-oauth-提供商)
    - [GitHub 身份验证](#github-身份验证)
    - [Google 身份验证](#google-身份验证)
    - [Discord 身份验证](#discord-身份验证)
- [构建和测试](#构建和测试)
  - [本地开发](#本地开发)
  - [生产构建](#生产构建)
- [Cloudflare Pages 部署](#cloudflare-pages-部署)
  - [设置 Cloudflare Pages](#设置-cloudflare-pages)
  - [配置构建设置](#配置构建设置)
  - [Cloudflare Pages 中的环境变量](#cloudflare-pages-中的环境变量)
  - [自定义域名](#自定义域名)
- [实现检测 API](#实现检测-api)
  - [API 实现要求](#api-实现要求)
  - [审计报告生成](#审计报告生成)
    - [报告组件](#报告组件)
    - [报告内容](#报告内容)
    - [PDF 导出配置](#pdf-导出配置)
    - [与自定义 API 集成](#与自定义-api-集成)
  - [集成步骤](#集成步骤)
  - [API 安全考虑](#api-安全考虑)
- [故障排除](#故障排除)

## 前提条件

在开始之前，请确保您拥有：

- GitHub 账户
- Google Cloud Platform 账户（用于 Google OAuth）
- Discord 开发者账户（用于 Discord OAuth）
- Cloudflare 账户
- 本地安装了 Node.js（v14 或更高版本）和 npm/yarn，用于测试

## 环境变量

Chain Fox 应用程序需要以下环境变量：

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

对于本地开发，请在项目根目录中创建一个包含这些变量的 `.env` 文件。

## Supabase 设置

### 创建 Supabase 项目

1. 注册或登录 [Supabase](https://supabase.com)
2. 点击"New Project"并填写详细信息：
   - Organization：选择或创建一个组织
   - Name：输入项目名称（例如，"chain-fox"）
   - Database Password：创建一个强密码
   - Region：选择最接近您目标受众的区域
3. 点击"Create new project"并等待设置完成

### 配置身份验证

1. 在 Supabase 项目仪表板中，导航到左侧边栏的"Authentication"
2. 转到"Settings" > "URL Configuration"
3. 将 Site URL 设置为您的生产 URL（例如，`https://your-domain.com`）
4. 为本地开发和任何其他环境添加额外的重定向 URL：
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `https://your-staging-domain.com`（如果适用）
5. 保存更改

### 设置 OAuth 提供商

#### GitHub 身份验证

1. **创建 GitHub OAuth 应用**：
   - 前往 [GitHub 开发者设置](https://github.com/settings/developers)
   - 点击"New OAuth App"
   - 填写详细信息：
     - Application name："Chain Fox"（或您喜欢的名称）
     - Homepage URL：您的网站 URL（例如，`https://your-domain.com`）
     - Authorization callback URL：`https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
   - 点击"Register application"
   - 生成新的客户端密钥

2. **在 Supabase 中配置 GitHub 身份验证**：
   - 在 Supabase 仪表板中，转到"Authentication" > "Providers"
   - 在列表中找到 GitHub 并启用它
   - 输入来自 GitHub OAuth 应用的 Client ID 和 Client Secret
   - 保存更改

#### Google 身份验证

1. **创建 Google OAuth 客户端**：
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建新项目或选择现有项目
   - 导航到"APIs & Services" > "Credentials"
   - 点击"Create Credentials" > "OAuth client ID"
   - 如果提示，配置同意屏幕：
     - User Type：External
     - App name："Chain Fox"（或您喜欢的名称）
     - User support email：您的电子邮件
     - Developer contact information：您的电子邮件
     - 保存并继续
   - 对于 OAuth client ID：
     - Application type：Web application
     - Name："Chain Fox Web Client"（或您喜欢的名称）
     - Authorized JavaScript origins：添加您的域名（例如，`https://your-domain.com`）和 `http://localhost:5173`（用于开发）
     - Authorized redirect URIs：`https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
   - 点击"Create"

2. **在 Supabase 中配置 Google 身份验证**：
   - 在 Supabase 仪表板中，转到"Authentication" > "Providers"
   - 在列表中找到 Google 并启用它
   - 输入来自 Google OAuth 客户端的 Client ID 和 Client Secret
   - 保存更改

#### Discord 身份验证

1. **创建 Discord 应用**：
   - 前往 [Discord 开发者门户](https://discord.com/developers/applications)
   - 点击"New Application"
   - 为您的应用输入名称（例如，"Chain Fox"）
   - 导航到左侧边栏的"OAuth2"部分
   - 添加重定向 URL：`https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
   - 保存更改
   - 记下您的 Client ID 并生成 Client Secret

2. **在 Supabase 中配置 Discord 身份验证**：
   - 在 Supabase 仪表板中，转到"Authentication" > "Providers"
   - 在列表中找到 Discord 并启用它
   - 输入来自 Discord 应用的 Client ID 和 Client Secret
   - 保存更改

## 构建和测试

在部署到生产环境之前，重要的是在本地构建和测试您的应用程序。

### 本地开发

启动开发服务器：
```bash
npm run dev
# 或
yarn dev
```

网站将在 `http://localhost:5173` 可用

### 生产构建

创建生产构建：
```bash
npm run build
# 或
yarn build
```

在本地预览生产构建：
```bash
npm run preview
# 或
yarn preview
```

这允许您在部署到托管服务之前测试生产构建。

## Cloudflare Pages 部署

### 设置 Cloudflare Pages

1. 注册或登录 [Cloudflare](https://dash.cloudflare.com/)
2. 在左侧边栏导航到"Pages"
3. 点击"Create a project" > "Connect to Git"
4. 选择您的 Git 提供商（GitHub、GitLab 等）并进行身份验证
5. 选择包含您的 Chain Fox 项目的仓库
6. 点击"Begin setup"

### 配置构建设置

为您的 Cloudflare Pages 项目配置构建设置：

1. **Project name**：为您的项目输入名称（例如，"chain-fox"）
2. **Production branch**：选择您的主分支（例如，"main"或"master"）
3. **Build settings**：
   - **Framework preset**：选择"Vite"
   - **Build command**：`npm run build`（或 `yarn build`）
   - **Build output directory**：`dist`
4. 点击"Save and Deploy"

### Cloudflare Pages 中的环境变量

将您的环境变量添加到 Cloudflare Pages：

1. 创建项目后，转到项目设置
2. 导航到"Environment variables"
3. 添加以下变量：
   - `VITE_SUPABASE_URL`：您的 Supabase 项目 URL
   - `VITE_SUPABASE_ANON_KEY`：您的 Supabase 匿名密钥
4. 将环境设置为"Production"，或为"Production"和"Preview"环境都添加变量
5. 点击"Save"

### 自定义域名

为您的 Cloudflare Pages 站点设置自定义域名：

1. 在您的 Pages 项目中，转到"Custom domains"
2. 点击"Set up a custom domain"
3. 输入您的域名（例如，`your-domain.com`）
4. 按照说明验证域名所有权并配置 DNS 设置
5. 等待域名激活（这可能需要一些时间）

## 实现检测 API

目前，项目使用两种方法进行代码分析：

1. **DeepSeek AI 集成**：应用程序可以使用 DeepSeek 的 AI 模型进行初步代码审计。这在 `src/services/deepseek.js` 中实现。

2. **模拟 API**：为了演示目的，在 `src/pages/DetectionPage.jsx` 中包含了一个模拟 API。

对于生产环境，您需要：
- 配置 DeepSeek AI 集成，使用您的 API 密钥
- 实现自定义 API 端点以进行更全面的分析

以下是可以替换或增强的模拟实现：

```javascript
// DetectionPage.jsx 中当前的模拟实现
const mockDetectApi = async (type, data) => {
  console.log(`Mock API call for ${type}:`, data);

  // 模拟不同分析阶段的延迟
  const updateProgress = (progress, callback) => {
    return new Promise(resolve => {
      setTimeout(() => {
        callback(progress);
        resolve();
      }, 800);
    });
  };

  // 根据类型生成真实的模拟漏洞
  const generateMockVulnerabilities = (type) => {
    const commonVulns = [
      {
        id: `VULN-${Date.now()}-1`,
        severity: 'critical',
        name: '重入漏洞',
        description: '外部调用后的合约状态更改可能导致重入攻击。',
        location: type === 'code' ? '第42-57行' : 'contracts/Token.sol',
        recommendation: '实现检查-效果-交互模式，并考虑使用 ReentrancyGuard。'
      },
      // 更多漏洞...
    ];

    return commonVulns;
  };

  // 生成模拟指标
  const generateMockMetrics = () => {
    return {
      codeQuality: Math.floor(Math.random() * 40) + 60, // 60-100
      securityScore: Math.floor(Math.random() * 50) + 50, // 50-100
      gasEfficiency: Math.floor(Math.random() * 30) + 70, // 70-100
      testCoverage: Math.floor(Math.random() * 60) + 40, // 40-100
      scanDuration: Math.floor(Math.random() * 120) + 30 // 30-150秒
    };
  };

  // 返回更全面的结果
  return new Promise(async (resolve) => {
    await new Promise(r => setTimeout(r, 1500)); // 初始延迟

    const vulnerabilities = generateMockVulnerabilities(type);
    const metrics = generateMockMetrics();

    resolve({
      success: true,
      scanId: `SCAN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type,
      target: type === 'code' ? '代码片段' : data,
      vulnerabilities: vulnerabilities,
      issuesFound: vulnerabilities.length,
      metrics: metrics,
      reportUrl: `/report/${type}/${Date.now()}`,
      summary: `检测到 ${vulnerabilities.length} 个潜在问题，包括 ${vulnerabilities.filter(v => v.severity === 'critical').length} 个严重级别、${vulnerabilities.filter(v => v.severity === 'high').length} 个高级别和 ${vulnerabilities.filter(v => v.severity === 'medium').length} 个中级别的漏洞。`
    });
  });
};
```

### API 实现要求

#### DeepSeek AI 集成

要使用 DeepSeek AI 集成：

1. **在 [DeepSeek 网站](https://deepseek.com) 注册获取 API 密钥**
2. **将您的 API 密钥添加到环境变量**，如上所述
3. **通过在检测页面启用 AI 开关来测试集成**

DeepSeek 集成提供：
- 带有 AI 推理的代码分析
- 漏洞检测
- 安全建议
- 详细的思考过程

#### 自定义 API 实现

如果实现自己的 API，它应该：

1. **接受两个参数**：
   - `type`：检测类型（'code' 或 'github'）
   - `data`：要分析的内容（代码片段或 GitHub 仓库 URL）

2. **返回包含以下内容的 JSON 响应**：
   - `success`：布尔值，表示检测是否成功
   - `scanId`：扫描的唯一标识符
   - `timestamp`：执行扫描的 ISO 时间戳
   - `vulnerabilities`：带有严重性级别的检测到的问题数组
   - `metrics`：包含代码质量指标的对象
   - `summary`：发现的文本摘要
   - `thinking`：（可选）表示 AI 推理过程的字符串数组

3. **适当处理错误**并返回有意义的错误消息

### 审计报告生成

应用程序包含一个全面的审计报告生成功能，可以根据检测结果创建专业的安全审计报告。这些报告可以导出为 PDF 文件，用于共享和文档记录。

#### 报告组件

报告生成系统由以下部分组成：

1. **AuditReportTemplate.jsx**：一个 React 组件，使用专业布局渲染报告内容
2. **AuditReport.jsx**：一个模态组件，显示报告并提供导出功能
3. **pdfExport.js**：一个使用 jsPDF 和 html2canvas 处理 PDF 生成和导出的服务

#### 报告内容

生成的报告包括：

- 包含关键发现的执行摘要
- 目标信息（代码片段或仓库 URL）
- 安全指标（代码质量、安全评分、Gas 效率、测试覆盖率）
- 按严重性划分的漏洞分布
- 带有描述和建议的详细漏洞列表
- 代码片段（如适用）
- AI 推理过程（如果启用）

#### PDF 导出配置

可以通过修改 `pdfExport.js` 文件来自定义 PDF 导出功能：

```javascript
// 示例配置选项
const options = {
  // html2canvas 的画布选项
  canvasOptions: {
    scale: 2, // 更高的比例以获得更好的质量
    useCORS: true, // 启用 CORS 以支持图像
    logging: false,
    backgroundColor: '#FFFFFF'
  },
  // 回调函数
  onStart: () => setIsExporting(true),
  onComplete: () => setIsExporting(false),
  onError: (error) => console.error('导出错误:', error)
};
```

#### 与自定义 API 集成

在实现自定义 API 时，确保响应格式与报告生成系统期望的格式匹配。报告生成所需的关键字段是：

- `scanId`：扫描的唯一标识符
- `timestamp`：执行扫描的时间
- `target`：扫描的内容（代码或仓库）
- `vulnerabilities`：检测到的问题数组
- `metrics`：包含性能指标的对象
- `summary`：发现的文本摘要

### 集成步骤

1. 创建可以分析智能合约和区块链代码的后端服务
2. 将服务部署到可靠的托管平台
3. 更新前端代码以调用您的真实 API：

```javascript
// 示例实现
const detectApi = async (type, data) => {
  try {
    const response = await fetch('https://your-api-endpoint.com/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Detection API error:', error);
    throw error;
  }
};
```

4. 将所有 `mockDetectApi` 实例替换为您的真实 API 函数
5. 添加适当的错误处理和加载状态

### API 安全考虑

- 实现速率限制以防止滥用
- 为 API 请求添加身份验证
- 对输入数据进行清理以防止注入攻击
- 考虑实施 CORS 策略以限制访问

## 故障排除

### 身份验证问题

- **重定向 URI 不匹配**：确保 OAuth 提供商中的重定向 URI 与 Supabase 回调 URL 完全匹配。
- **CORS 错误**：确保您的站点 URL 在 Supabase 身份验证设置中正确设置。
- **无效的 Client ID/Secret**：仔细检查您是否为每个提供商输入了正确的凭据。

### 部署问题

- **构建失败**：检查 Cloudflare Pages 中的构建日志以了解具体错误。
- **环境变量**：验证所有必需的环境变量是否正确设置。
- **路由问题**：确保您的 `_redirects` 文件或路由配置正确设置，以支持客户端路由。

如果您遇到持续的问题，请查阅 Supabase 和 Cloudflare 文档或联系他们的支持渠道。
