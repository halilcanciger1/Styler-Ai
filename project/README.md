# FASHNAI - AI-Powered Fashion Visualization Platform

A modern web application for generating AI-powered fashion visualizations using React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **AI Fashion Generation**: Create stunning fashion visualizations using AI
- **User Authentication**: Secure login/signup with Supabase Auth
- **Credit System**: Pay-per-use credit system with Stripe integration
- **Real-time Updates**: Live updates for generation status
- **Gallery Management**: Organize and manage generated images
- **Responsive Design**: Works seamlessly across all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Payments**: Stripe
- **Deployment**: Netlify
- **AI API**: Fashion AI API integration

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (for payments)
- Fashion AI API key

## 🔧 Environment Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd fashion-ai-platform
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Fashion AI API Configuration
VITE_FASHION_AI_API_URL=https://api.fashn.ai/v1
VITE_FASHION_AI_API_KEY=your_fashion_ai_api_key

# Stripe Configuration (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the database migrations in the `supabase/migrations/` folder
3. Set up the storage buckets:
   - `model-images`
   - `garment-images` 
   - `generated-results`
   - `avatars`
4. Configure Row Level Security (RLS) policies

### 4. Stripe Setup

1. Create a Stripe account
2. Set up pricing tables for credit packages
3. Configure webhooks for payment processing
4. Update the pricing table ID in the code

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Netlify Deployment

1. **Connect Repository**: Link your GitHub repository to Netlify

2. **Environment Variables**: Set the following in Netlify dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_FASHION_AI_API_URL=https://api.fashn.ai/v1
   VITE_FASHION_AI_API_KEY=your_fashion_ai_api_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

3. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

4. **Redirects**: The `netlify.toml` file handles SPA routing automatically

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the dist folder to your hosting provider
```

## 🔐 Authentication Flow

1. Users sign up with email/password
2. Supabase Auth handles authentication
3. Database trigger creates user profile automatically
4. RLS policies ensure data security

## 💳 Payment Integration

- Stripe pricing tables for credit packages
- Secure payment processing
- Automatic credit allocation
- Transaction history tracking

## 🎨 API Integration

The app integrates with Fashion AI API for generating fashion visualizations:

1. Upload model and garment images
2. Submit generation request to Fashion AI API
3. Poll for completion status
4. Display results in the gallery

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Header, Sidebar, etc.)
│   ├── Studio/         # Studio-specific components
│   ├── Pricing/        # Pricing and payment components
│   └── Settings/       # Settings components
├── pages/              # Page components
│   ├── Auth/          # Authentication pages
│   └── ...            # Other pages
├── store/              # Zustand state management
├── lib/                # Utility libraries (Supabase client, etc.)
├── types/              # TypeScript type definitions
└── ...
```

## 🐛 Troubleshooting

### Common Issues

1. **White screen on deployment**:
   - Check environment variables are set correctly
   - Verify Supabase URL and keys
   - Check browser console for errors

2. **Authentication not working**:
   - Verify Supabase project settings
   - Check RLS policies
   - Ensure database migrations are applied

3. **Payment issues**:
   - Verify Stripe configuration
   - Check pricing table IDs
   - Ensure webhooks are configured

### Debug Mode

In development, the app shows additional debug information:
- Environment variable status
- Supabase connection status
- Detailed error messages

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, please contact [support@fashnai.com](mailto:support@fashnai.com)