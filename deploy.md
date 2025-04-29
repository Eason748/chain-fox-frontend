# Chain Fox Deployment Guide

This document provides detailed instructions for deploying the Chain Fox application, including setting up Supabase authentication with multiple providers (GitHub, Google, Discord) and deploying the application using Cloudflare Pages.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
  - [Creating a Supabase Project](#creating-a-supabase-project)
  - [Configuring Authentication](#configuring-authentication)
  - [Setting Up OAuth Providers](#setting-up-oauth-providers)
    - [GitHub Authentication](#github-authentication)
    - [Google Authentication](#google-authentication)
    - [Discord Authentication](#discord-authentication)
- [Building and Testing](#building-and-testing)
  - [Local Development](#local-development)
  - [Building for Production](#building-for-production)
- [Cloudflare Pages Deployment](#cloudflare-pages-deployment)
  - [Setting Up Cloudflare Pages](#setting-up-cloudflare-pages)
  - [Configuring Build Settings](#configuring-build-settings)
  - [Environment Variables in Cloudflare Pages](#environment-variables-in-cloudflare-pages)
  - [Custom Domains](#custom-domains)
- [Implementing the Detection API](#implementing-the-detection-api)
  - [API Implementation Requirements](#api-implementation-requirements)
  - [Audit Report Generation](#audit-report-generation)
    - [Report Components](#report-components)
    - [Report Content](#report-content)
    - [PDF Export Configuration](#pdf-export-configuration)
    - [Integration with Custom API](#integration-with-custom-api)
  - [Integration Steps](#integration-steps)
  - [API Security Considerations](#api-security-considerations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have:

- A GitHub account
- A Google Cloud Platform account (for Google OAuth)
- A Discord developer account (for Discord OAuth)
- A Cloudflare account
- Node.js (v14 or higher) and npm/yarn installed locally for testing

## Environment Variables

The Chain Fox application requires the following environment variables:

```
# Supabase Authentication
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# DeepSeek AI Integration (for code auditing)
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1
VITE_DEEPSEEK_API_MODEL=deepseek-reasoner
```

For local development, create a `.env` file in the project root with these variables.

## Supabase Setup

### Creating a Supabase Project

1. Sign up or log in to [Supabase](https://supabase.com)
2. Click "New Project" and fill in the details:
   - Organization: Choose or create an organization
   - Name: Enter a name for your project (e.g., "chain-fox")
   - Database Password: Create a strong password
   - Region: Choose a region closest to your target audience
3. Click "Create new project" and wait for the setup to complete

### Configuring Authentication

1. In your Supabase project dashboard, navigate to "Authentication" in the left sidebar
2. Go to "Settings" > "URL Configuration"
3. Set the Site URL to your production URL (e.g., `https://your-domain.com`)
4. Add additional redirect URLs for local development and any other environments:
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `https://your-staging-domain.com` (if applicable)
5. Save the changes

### Setting Up OAuth Providers

#### GitHub Authentication

1. **Create a GitHub OAuth App**:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the details:
     - Application name: "Chain Fox" (or your preferred name)
     - Homepage URL: Your website URL (e.g., `https://your-domain.com`)
     - Authorization callback URL: `https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
   - Click "Register application"
   - Generate a new client secret

2. **Configure GitHub Auth in Supabase**:
   - In your Supabase dashboard, go to "Authentication" > "Providers"
   - Find GitHub in the list and enable it
   - Enter the Client ID and Client Secret from your GitHub OAuth App
   - Save the changes

#### Google Authentication

1. **Create a Google OAuth Client**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Configure the consent screen if prompted:
     - User Type: External
     - App name: "Chain Fox" (or your preferred name)
     - User support email: Your email
     - Developer contact information: Your email
     - Save and continue
   - For the OAuth client ID:
     - Application type: Web application
     - Name: "Chain Fox Web Client" (or your preferred name)
     - Authorized JavaScript origins: Add your domain (e.g., `https://your-domain.com`) and `http://localhost:5173` for development
     - Authorized redirect URIs: `https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
   - Click "Create"

2. **Configure Google Auth in Supabase**:
   - In your Supabase dashboard, go to "Authentication" > "Providers"
   - Find Google in the list and enable it
   - Enter the Client ID and Client Secret from your Google OAuth client
   - Save the changes

#### Discord Authentication

1. **Create a Discord Application**:
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Enter a name for your application (e.g., "Chain Fox")
   - Navigate to the "OAuth2" section in the left sidebar
   - Add a redirect URL: `https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
   - Save changes
   - Note your Client ID and generate a Client Secret

2. **Configure Discord Auth in Supabase**:
   - In your Supabase dashboard, go to "Authentication" > "Providers"
   - Find Discord in the list and enable it
   - Enter the Client ID and Client Secret from your Discord application
   - Save the changes

## Building and Testing

Before deploying to production, it's important to build and test your application locally.

### Local Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The site will be available at `http://localhost:5173`

### Building for Production

Create a production build:
```bash
npm run build
# or
yarn build
```

Preview the production build locally:
```bash
npm run preview
# or
yarn preview
```

This allows you to test the production build before deploying it to a hosting service.

## Cloudflare Pages Deployment

### Setting Up Cloudflare Pages

1. Sign up or log in to [Cloudflare](https://dash.cloudflare.com/)
2. Navigate to "Pages" in the left sidebar
3. Click "Create a project" > "Connect to Git"
4. Select your Git provider (GitHub, GitLab, etc.) and authenticate
5. Choose the repository containing your Chain Fox project
6. Click "Begin setup"

### Configuring Build Settings

Configure the build settings for your Cloudflare Pages project:

1. **Project name**: Enter a name for your project (e.g., "chain-fox")
2. **Production branch**: Select your main branch (e.g., "main" or "master")
3. **Build settings**:
   - **Framework preset**: Select "Vite"
   - **Build command**: `npm run build` (or `yarn build`)
   - **Build output directory**: `dist`
4. Click "Save and Deploy"

### Environment Variables in Cloudflare Pages

Add your environment variables to Cloudflare Pages:

1. After your project is created, go to the project settings
2. Navigate to "Environment variables"
3. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_DEEPSEEK_API_KEY`: Your DeepSeek API key
   - `VITE_DEEPSEEK_API_URL`: DeepSeek API URL (typically https://api.deepseek.com/v1)
   - `VITE_DEEPSEEK_API_MODEL`: DeepSeek model to use (typically deepseek-reasoner)
4. Set the environment to "Production" or add variables for both "Production" and "Preview" environments
5. Click "Save"

### Custom Domains

To set up a custom domain for your Cloudflare Pages site:

1. In your Pages project, go to "Custom domains"
2. Click "Set up a custom domain"
3. Enter your domain name (e.g., `your-domain.com`)
4. Follow the instructions to verify domain ownership and configure DNS settings
5. Wait for the domain to be activated (this may take some time)

## Implementing the Detection API

Currently, the project uses two approaches for code analysis:

1. **DeepSeek AI Integration**: The application can use DeepSeek's AI models for preliminary code auditing. This is implemented in `src/services/deepseek.js`.

2. **Mock API**: For demonstration purposes, a mock API is included in `src/pages/DetectionPage.jsx`.

For production use, you'll need to either:
- Configure the DeepSeek AI integration with your API key
- Implement a custom API endpoint for more comprehensive analysis

Below is the mock implementation that can be replaced or enhanced:

```javascript
// Current mock implementation in DetectionPage.jsx
const mockDetectApi = async (type, data) => {
  console.log(`Mock API call for ${type}:`, data);

  // Simulate different stages of analysis with delays
  const updateProgress = (progress, callback) => {
    return new Promise(resolve => {
      setTimeout(() => {
        callback(progress);
        resolve();
      }, 800);
    });
  };

  // Generate realistic mock vulnerabilities based on type
  const generateMockVulnerabilities = (type) => {
    const commonVulns = [
      {
        id: `VULN-${Date.now()}-1`,
        severity: 'critical',
        name: 'Reentrancy Vulnerability',
        description: 'Contract state changes after external calls can lead to reentrancy attacks.',
        location: type === 'code' ? 'Line 42-57' : 'contracts/Token.sol',
        recommendation: 'Implement checks-effects-interactions pattern and consider using ReentrancyGuard.'
      },
      // More vulnerabilities...
    ];

    return commonVulns;
  };

  // Generate mock metrics
  const generateMockMetrics = () => {
    return {
      codeQuality: Math.floor(Math.random() * 40) + 60, // 60-100
      securityScore: Math.floor(Math.random() * 50) + 50, // 50-100
      gasEfficiency: Math.floor(Math.random() * 30) + 70, // 70-100
      testCoverage: Math.floor(Math.random() * 60) + 40, // 40-100
      scanDuration: Math.floor(Math.random() * 120) + 30 // 30-150 seconds
    };
  };

  // Return a more comprehensive result
  return new Promise(async (resolve) => {
    await new Promise(r => setTimeout(r, 1500)); // Initial delay

    const vulnerabilities = generateMockVulnerabilities(type);
    const metrics = generateMockMetrics();

    resolve({
      success: true,
      scanId: `SCAN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type,
      target: type === 'code' ? 'Code Snippet' : data,
      vulnerabilities: vulnerabilities,
      issuesFound: vulnerabilities.length,
      metrics: metrics,
      reportUrl: `/report/${type}/${Date.now()}`,
      summary: `Detected ${vulnerabilities.length} potential issues across ${vulnerabilities.filter(v => v.severity === 'critical').length} critical, ${vulnerabilities.filter(v => v.severity === 'high').length} high, and ${vulnerabilities.filter(v => v.severity === 'medium').length} medium severity levels.`
    });
  });
};
```

### API Implementation Requirements

#### DeepSeek AI Integration

To use the DeepSeek AI integration:

1. **Sign up for a DeepSeek API key** at [DeepSeek's website](https://deepseek.com)
2. **Add your API key to environment variables** as described above
3. **Test the integration** by enabling the AI toggle in the Detection page

The DeepSeek integration provides:
- Code analysis with AI reasoning
- Vulnerability detection
- Security recommendations
- Detailed thinking process

#### Custom API Implementation

If implementing your own API, it should:

1. **Accept two parameters**:
   - `type`: The type of detection ('code' or 'github')
   - `data`: The content to analyze (code snippet or GitHub repository URL)

2. **Return a JSON response with**:
   - `success`: Boolean indicating if the detection was successful
   - `scanId`: Unique identifier for the scan
   - `timestamp`: ISO timestamp of when the scan was performed
   - `vulnerabilities`: Array of detected issues with severity levels
   - `metrics`: Object containing code quality metrics
   - `summary`: Text summary of findings
   - `thinking`: (Optional) Array of strings representing the AI reasoning process

3. **Handle errors appropriately** and return meaningful error messages

### Audit Report Generation

The application includes a comprehensive audit report generation feature that creates professional security audit reports based on the detection results. These reports can be exported as PDF files for sharing and documentation.

#### Report Components

The report generation system consists of:

1. **AuditReportTemplate.jsx**: A React component that renders the report content with a professional layout
2. **AuditReport.jsx**: A modal component that displays the report and provides export functionality
3. **pdfExport.js**: A service that handles PDF generation and export using jsPDF and html2canvas

#### Report Content

The generated reports include:

- Executive summary with key findings
- Target information (code snippet or repository URL)
- Security metrics (code quality, security score, gas efficiency, test coverage)
- Vulnerability distribution by severity
- Detailed list of vulnerabilities with descriptions and recommendations
- Code snippet (if applicable)
- AI reasoning process (if enabled)

#### PDF Export Configuration

The PDF export functionality can be customized by modifying the `pdfExport.js` file:

```javascript
// Example configuration options
const options = {
  // Canvas options for html2canvas
  canvasOptions: {
    scale: 2, // Higher scale for better quality
    useCORS: true, // Enable CORS for images
    logging: false,
    backgroundColor: '#FFFFFF'
  },
  // Callbacks
  onStart: () => setIsExporting(true),
  onComplete: () => setIsExporting(false),
  onError: (error) => console.error('Export error:', error)
};
```

#### Integration with Custom API

When implementing a custom API, ensure that the response format matches what the report generation system expects. The key fields required for report generation are:

- `scanId`: Unique identifier for the scan
- `timestamp`: When the scan was performed
- `target`: What was scanned (code or repository)
- `vulnerabilities`: Array of detected issues
- `metrics`: Object with performance metrics
- `summary`: Text summary of findings

### Integration Steps

1. Create a backend service that can analyze smart contracts and blockchain code
2. Deploy the service to a reliable hosting platform
3. Update the frontend code to call your real API:

```javascript
// Example implementation
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

4. Replace all instances of `mockDetectApi` with your real API function
5. Add appropriate error handling and loading states

### API Security Considerations

- Implement rate limiting to prevent abuse
- Add authentication for API requests
- Sanitize input data to prevent injection attacks
- Consider implementing CORS policies to restrict access

## Troubleshooting

### Authentication Issues

- **Redirect URI Mismatch**: Ensure that the redirect URIs in your OAuth providers match the Supabase callback URL exactly.
- **CORS Errors**: Make sure your site URL is correctly set in Supabase Authentication settings.
- **Invalid Client ID/Secret**: Double-check that you've entered the correct credentials for each provider.

### Deployment Issues

- **Build Failures**: Check the build logs in Cloudflare Pages for specific errors.
- **Environment Variables**: Verify that all required environment variables are set correctly.
- **Routing Issues**: Ensure that your `_redirects` file or routing configuration is set up correctly for client-side routing.

If you encounter persistent issues, check the Supabase and Cloudflare documentation or reach out to their support channels.
