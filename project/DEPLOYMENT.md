# Deployment Guide for FASHNAI

This guide will help you deploy the FASHNAI application to Netlify with proper environment configuration.

## 🚨 Critical: Environment Variables

The most common reason for deployment failures is missing environment variables. Follow these steps carefully:

### 1. Netlify Environment Variables Setup

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_FASHION_AI_API_URL=https://api.fashn.ai/v1
VITE_FASHION_AI_API_KEY=fa-Dy6SV0P0ZUSd-TijrFG5cmW5khB3TLrkmNVNk
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Rf5vtRgdiF56xwI7Gk6M8vaT1AjL21AqvqSqLbfSHwEarDvbSQgaOt39Gugak8r8ffIldmC3A5k4enY7ZvuLJoE003rU9P5ER
```

### 2. Getting Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (or create a new one)
4. Go to **Settings** → **API**
5. Copy the following:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public** key → Use as `VITE_SUPABASE_ANON_KEY`

### 3. Supabase Database Setup

If you haven't set up your Supabase database yet:

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the migration files from `supabase/migrations/` in order:
   - `20250622093548_fancy_lantern.sql`
   - `20250622094533_mellow_sea.sql`
   - `20250625110745_muddy_jungle.sql`
   - `20250628181919_wild_pond.sql`
   - `20250628191501_quiet_smoke.sql`

3. Set up Storage buckets:
   - Go to **Storage** in Supabase dashboard
   - Create buckets: `model-images`, `garment-images`, `generated-results`, `avatars`
   - Make them public

### 4. Netlify Build Settings

1. In Netlify dashboard, go to **Site settings** → **Build & deploy**
2. Set the following:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (in Environment variables, add `NODE_VERSION=18`)

### 5. Deploy

1. Push your code to GitHub
2. Connect the repository to Netlify
3. Trigger a new deploy

## 🔍 Troubleshooting

### Issue: White Screen After Deployment

**Symptoms**: The site loads but shows a white screen

**Solutions**:
1. Check browser console for errors (F12 → Console)
2. Verify all environment variables are set correctly
3. Check if Supabase URL is accessible
4. Ensure database migrations are applied

### Issue: Authentication Not Working

**Symptoms**: Can't login or signup

**Solutions**:
1. Verify Supabase project is active
2. Check if database tables exist
3. Verify RLS policies are set up
4. Check Supabase Auth settings

### Issue: Build Fails

**Symptoms**: Netlify build process fails

**Solutions**:
1. Check build logs in Netlify dashboard
2. Verify `package.json` dependencies
3. Ensure Node version is 18+
4. Check for TypeScript errors

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] Storage buckets created and configured
- [ ] Environment variables set in Netlify
- [ ] Repository connected to Netlify
- [ ] Build settings configured
- [ ] Domain configured (if using custom domain)

## 🔧 Manual Verification

After deployment, verify these features work:

1. **Homepage loads** ✅
2. **Login/Signup works** ✅
3. **Dashboard loads after login** ✅
4. **Studio page accessible** ✅
5. **Image upload works** ✅
6. **Payment modal opens** ✅

## 📞 Getting Help

If you're still having issues:

1. Check the browser console for specific error messages
2. Review Netlify build logs
3. Verify Supabase dashboard shows your project is active
4. Test your environment variables locally first

## 🔄 Redeployment

To redeploy after making changes:

1. Push changes to your GitHub repository
2. Netlify will automatically trigger a new build
3. Or manually trigger deploy in Netlify dashboard

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. In Netlify dashboard, go to **Domain settings**
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable HTTPS (automatic with Netlify)

---

**Important**: Always test your deployment thoroughly before going live. The preview environment and production environment can behave differently due to environment variables and external service configurations.