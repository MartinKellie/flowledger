# FlowLedger

A comprehensive project tracker for n8n workflows and API keys, providing security insights and risk analysis.

## 🚀 Features

- **Key-to-Workflow Mapping**: Strict and heuristic mapping of API credentials to n8n workflows
- **Security Risk Analysis**: Identify plaintext suspects, shared keys, and deprecated workflows
- **Multi-Instance Support**: Manage multiple n8n instances with environment filtering
- **Real-time Scanning**: On-demand and scheduled scans of your n8n instances
- **Metadata Management**: Rich metadata for workflows and credentials
- **Notifications**: In-app and email alerts for security findings
- **Audit Logging**: Complete audit trail of all actions

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Shadcn UI, Radix UI, Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: NextAuth.js with magic link
- **Email**: Resend
- **Validation**: Zod
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- Resend account (for email notifications)

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd flowledger
npm install
```

### 2. Environment Setup

Copy the environment example file:

```bash
cp env.example .env.local
```

### 3. Configure Environment Variables

Update `.env.local` with your configuration:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----\n"

# Resend (Email Service)
RESEND_API_KEY=your-resend-api-key
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract the values for your environment variables

### 5. Resend Setup

1. Create a Resend account at [Resend](https://resend.com)
2. Generate an API key
3. Add the API key to your environment variables

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── dashboard/         # Dashboard pages
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── providers.tsx     # Context providers
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── n8n-api.ts        # n8n API client
│   ├── email.ts          # Email utilities
│   ├── auth.ts           # Authentication utilities
│   ├── validations.ts    # Zod schemas
│   ├── constants.ts      # App constants
│   └── utils.ts          # General utilities
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm run version:update <version>` - Update version across the codebase

## 📋 Version Management

FlowLedger includes a comprehensive version management system:

### Version Display
- Version appears in the navigation bar (desktop and mobile)
- Version appears in the footer on all pages
- Version is centrally managed in `src/lib/version.ts`

### Updating Version
To update the version across the entire codebase:

```bash
# Using npm script (recommended)
npm run version:update 1.1.0

# Or directly with node
node scripts/update-version.js 1.1.0
```

This will automatically update:
- `package.json` version
- `src/lib/version.ts` APP_VERSION
- Provide git commit suggestions

### Version Components
- `VersionDisplay` - Flexible version display component
- `VersionBadge` - Badge-style version display
- Multiple variants: `minimal`, `default`, `full`

## 🔐 Security Features

- **No Raw Secrets**: Never stores actual API keys or secrets
- **Temporary Reveals**: Credential reveals are temporary and auto-hide
- **Audit Logging**: All actions are logged for compliance
- **Encrypted Storage**: Sensitive data is encrypted at rest

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Key Features

### 1. Instance Management
- Add multiple n8n instances
- Environment-based organisation
- Connection validation

### 2. Workflow Scanning
- Automatic workflow discovery
- Credential mapping (strict + heuristic)
- Risk assessment

### 3. Security Analysis
- Plaintext credential detection
- Shared key identification
- Deprecated workflow alerts

### 4. Metadata Management
- Rich workflow metadata
- Credential documentation
- Owner and contact information

### 5. Notifications
- Real-time in-app alerts
- Email notifications
- Risk-based alerting

## 🔌 API Integration

FlowLedger integrates with n8n instances using the n8n REST API:

- **Workflows**: Fetch workflow definitions and node configurations
- **Credentials**: Retrieve credential metadata (no raw secrets)
- **Authentication**: Personal access token-based authentication

## 🛡️ Security

- **No Raw Secrets**: Never stores actual API keys or secrets
- **Temporary Reveals**: Credential reveals are temporary and auto-hide
- **Audit Logging**: All actions are logged for compliance
- **Encrypted Storage**: Sensitive data is encrypted at rest

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the PRD in `readme.md`

---

Built with ❤️ for the n8n community