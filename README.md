# Chain Fox Frontend Project

[English](README.md) | [中文](README.zh.md)

This is the official website frontend open-source project for Chain Fox blockchain security platform. Built with React, Tailwind CSS, and Framer Motion, it provides a modern user interface with smooth animations to showcase the features and services of the Chain Fox platform.

![Project Logo](/public/logo.png)

## About This Project

This project is the official website frontend codebase for Chain Fox, designed to provide users with an intuitive and visually appealing interface to access Chain Fox's blockchain security audit services. Key features include:

- Modern UI design with gradient effects and smooth animations
- Responsive layout that adapts to various device sizes
- Multi-language support (English and Chinese)
- Integration with DeepSeek AI for code analysis
- Professional security audit report generation and PDF export functionality
- Component-based architecture built on React and Tailwind CSS

### Design Philosophy

The dynamic particle network background (NetworkParticles) that runs throughout the homepage is not just a visual decoration; it carries a metaphor for Chain Fox's core mission:

- **Protecting Blockchain Data**: Each glowing point represents a block node in the vast blockchain universe, while the interweaving lines symbolize complex data flows and interactions.
- **Illuminating the Dark Forest**: Chain Fox acts as a guardian, meticulously scanning and illuminating these blocks to ensure their security and integrity. The light emanating from the nodes penetrates the "dark forest" where potential threats lurk, symbolizing how Chain Fox brings clarity to the complex and often obscure world of blockchain.

*Author: [@1379hash](https://twitter.com/1379hash)*

## About Chain Fox Platform

Chain Fox is a blockchain security platform that provides automated analysis services for blockchain projects and smart contracts. The platform aims to democratize and popularize blockchain security through automated detection tools.

The Chain Fox platform supports various blockchains (such as Ethereum, Solana, Polkadot, etc.) and programming languages (Rust, Go, Solidity, etc.), offering one-click report generation without the need to install complex tools. The platform emphasizes security and confidentiality, ensuring that private project code is encrypted, never shared, and deleted upon request.

## Core Features of the Frontend Project

- 🎨 **Modern User Interface**
  - Beautiful gradient effects and smooth animations
  - Fully responsive design, adapting to various devices
  - Elegant styling system based on Tailwind CSS

- 🌊 **Dynamic Visual Effects**
  - Particle background effects implemented with Three.js
  - Smooth transition animations powered by Framer Motion
  - Floating card components with backdrop blur effects

- 🌐 **Internationalization Support**
  - Complete English and Chinese language support
  - Flexible translation system based on react-i18next
  - Easily extensible multilingual architecture

- 🔍 **Security Audit Feature Showcase**
  - Code analysis interface supporting multiple programming languages
  - GitHub repository analysis integration
  - Vulnerability detection results visualization

- 🤖 **AI Integration**
  - DeepSeek AI code analysis integration
  - Real-time display of AI reasoning process with typewriter effect
  - AI thinking process visualization

- 📊 **Professional Reporting System**
  - Generation of comprehensive security audit reports
  - PDF export functionality
  - Beautifully designed report templates

- 🔐 **Authentication**
  - Supabase authentication integration
  - Support for GitHub, Google, and Discord login
  - Secure user session management
  - Permission control with whitelist user system

- 📱 **Component-Based Architecture**
  - Reusable component system based on React
  - Clear project structure and code organization
  - Easily maintainable and extensible modular design

## Frontend Feature Showcase

This frontend project showcases the main features and workflows of the Chain Fox platform:

### Homepage Display

- **Brand Introduction**: Showcasing Chain Fox's brand image and core values
- **Dynamic Background**: Particle effect background implemented with Three.js
- **Feature Overview**: Intuitive display of the platform's main features and advantages
- **Language Switching**: Seamless switching between English and Chinese

### Security Audit Interface

- **Multiple Input Methods**:
  - Direct code snippet input
  - GitHub repository URL analysis
  - File upload functionality (coming soon)
- **Language Selection**: Support for code highlighting in multiple blockchain development languages
- **Real-time Analysis**: Display of analysis progress and intermediate results

### AI Analysis Display

- **AI Reasoning Process**: Real-time display of the AI's reasoning process
- **Typewriter Effect**: Character-by-character display of AI analysis results, enhancing user experience
- **Switchable Views**: Users can choose whether to display the AI thinking process

### Reporting System

- **Results Visualization**: Intuitive display of security audit results
- **Vulnerability Details**: Display of detailed information and fix recommendations for each vulnerability
- **Report Generation**: Generation of professional security audit reports
- **PDF Export**: Export reports to PDF format for easy sharing and archiving

### User Authentication

- **Multi-platform Login**: Support for GitHub, Google, and Discord login
- **User Management**: Secure user session and permission management
- **Personalized Experience**: Customized content based on user preferences

## Technical Implementation

This frontend project uses a variety of modern web technologies and libraries:

### Frontend Frameworks and Tools

- **React**: JavaScript library for building user interfaces
- **Vite**: Fast frontend build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Powerful React animation library
- **Three.js**: JavaScript library for creating 3D particle effects

### Feature Implementation

- **Internationalization**: Multi-language support using react-i18next
- **Routing**: Page navigation using React Router
- **State Management**: Using React's Context API and Hooks
- **API Integration**: Integration with DeepSeek AI API for code analysis
- **Authentication**: Integration with Supabase authentication service and permission control
- **PDF Export**: Report export using jsPDF and html2canvas

### Performance Optimization

- **Code Splitting**: On-demand loading using React.lazy and Suspense
- **Image Optimization**: Optimizing image size and format
- **Caching Strategy**: Implementing appropriate caching strategies
- **Lazy Loading**: Lazy loading of components and resources

## Project Showcase

This frontend project showcases the features of the Chain Fox platform, including:

- **Homepage**: Displaying platform overview and main features
- **Security Audit Page**: Showcasing code analysis and vulnerability detection
- **Report Page**: Displaying security audit reports and PDF export functionality
- **User Authentication**: Showcasing multi-platform login options

Through these pages, users can understand how the Chain Fox platform helps blockchain projects improve security and experience the platform's main features.

## Quick Start

### Installing Dependencies

```bash
npm install
# or
yarn install
```

### Running in Development Environment

```bash
npm run dev
# or
yarn dev
```

The application will start at http://localhost:5173.

### Building for Production

```bash
npm run build
# or
yarn build
```

Build files will be generated in the `dist` directory.

## Deployment Guide

This project can be deployed to various environments, including Cloudflare Pages, Vercel, Netlify, etc. For detailed deployment instructions, please refer to our [Deployment Guide](./deploy.md), which includes:

- Environment variable configuration
- Supabase authentication setup
- DeepSeek AI API integration
- Cloudflare Pages deployment steps
- Custom domain configuration

> **Documentation**: [English Deployment Guide](./deploy.md) | [中文部署指南](./deploy.zh.md)

## Project Structure

```
chain-fox/
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── AuditReport/       # Audit report components
│   │   ├── HomePage/          # Homepage related components
│   │   ├── Layout/            # Layout components
│   │   └── ...                # Other components
│   ├── pages/                 # Page components
│   │   ├── HomePage.jsx       # Homepage
│   │   ├── DetectionPage.jsx  # Security audit page
│   │   └── AuthPage.jsx       # Authentication page
│   ├── services/              # Service modules
│   │   ├── deepseek.js        # AI integration service
│   │   ├── pdfExport.js       # PDF generation and export service
│   │   └── supabase.js        # Authentication service
│   ├── utils/                 # Utility functions
│   │   ├── checkWhitelistUser.js  # Check if user is in whitelist
│   │   ├── supabaseQueries.js     # Supabase database queries
│   │   └── serverPermissionCheck.js # Server-side permission checks
│   ├── hooks/                 # Custom React hooks
│   │   └── usePermission.js   # Permission checking hook
│   ├── middleware/            # Middleware functions
│   │   └── permissionMiddleware.js # Permission checking middleware
│   ├── App.jsx                # Main application component (routing configuration)
│   ├── i18n.js                # Internationalization configuration
│   └── main.jsx               # Application entry point
├── public/
│   ├── locales/               # Translation files
│   │   ├── en/                # English translations
│   │   └── zh/                # Chinese translations
│   └── logo.png               # Application logo
├── tools/
│   └── migrations/            # Database migration files
│       ├── 20240503_is_whitelist_user.sql  # Whitelist user check function
│       └── README.md          # Migration documentation
├── docs/                      # Documentation
│   └── 描述文档.md            # Project description document
├── deploy.md                  # Deployment guide (English)
└── deploy.zh.md               # Deployment guide (Chinese)
```

## Multi-language Support

This project implements complete internationalization support using react-i18next:

- **Supported Languages**:
  - English (en) - Default language
  - Chinese (zh)

- **Translation Files**:
  - Located in the `public/locales` directory
  - Organized by language code and namespace
  - `common.json` contains shared translations

- **Adding a New Language**:
  1. Create a new language folder in `public/locales`
  2. Copy and translate existing JSON files
  3. Add language option in `LanguageSwitcher.jsx`

## Feature Development Plan

This frontend project is actively being developed, with planned features including:

- More visualization components to display security analysis results
- More comprehensive user dashboard
- Team collaboration features
- Additional report templates and export options
- Mobile optimization

## Contribution Guidelines

We welcome community contributions to help improve this open-source project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add new feature: XXX'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

Please ensure your code complies with the project's coding standards and passes all tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
