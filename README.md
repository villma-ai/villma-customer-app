# Villma Customer App

A modern Next.js customer area application with Firebase integration for user authentication, profile management, subscription handling, and chatbot integration setup.

## Features

- **User Authentication**: Registration, login, and logout with Firebase Auth
- **Profile Management**: Users can manage their personal and invoicing information
- **Subscription Plans**: Two subscription tiers (Base and Extra) with monthly/yearly billing
- **Subscription Management**: View current subscriptions with webshop URL and API token configuration
- **Chatbot Integration**: Configure webshop URLs and generate API tokens for chatbot installation
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Route Groups**: Clean separation of auth and dashboard routes using Next.js route groups

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Language**: TypeScript
- **State Management**: React Context API

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Authentication and Firestore enabled

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd villma-customer-app
npm install
```

### 2. Firebase Configuration

The Firebase configuration is already set up in `src/lib/firebase.ts` with the provided credentials:

- Project ID: `villma-customer-app`
- Authentication: Email/Password enabled
- Firestore: Database created

### 3. Initialize Subscription Plans

Run the initialization script to create the default subscription plans in Firestore:

```bash
npm run init-plans
```

This will create 4 subscription plans:
- **BASE Plan (Monthly)** - €90/month
  - Intelligent scan of your store
  - Chatbot agent connected to Villma Server
  - Specialized Agent for pre-sales
  - Specialized Agent for sales
  - Specialized Agent for customer support

- **BASE Plan (Yearly)** - €900/year (2 months free)
  - All monthly features plus annual savings

- **EXTRA Plan (Monthly)** - €170/month
  - Everything in BASE Plan
  - Consultant Agent
  - Super Sales Agent

- **EXTRA Plan (Yearly)** - €1700/year (2 months free)
  - All monthly features plus annual savings

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication route group
│   │   ├── layout.tsx     # Simple layout for auth pages
│   │   └── page.tsx       # Login/register page
│   ├── (dashboard)/       # Protected dashboard route group
│   │   ├── layout.tsx     # Full dashboard layout with auth
│   │   ├── profile/       # Profile management
│   │   ├── subscriptions/ # Subscription management
│   │   └── plans/         # Available plans
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Root page (AuthFlow)
├── components/            # React components
│   ├── auth/             # Authentication components
│   │   ├── AuthFlow.tsx
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/        # Dashboard components
│   │   ├── ProfileForm.tsx
│   │   ├── SubscriptionPlans.tsx
│   │   └── UserSubscriptions.tsx
│   ├── pages/            # Page components
│   │   ├── ProfilePage.tsx
│   │   ├── SubscriptionPlansPage.tsx
│   │   └── UserSubscriptionsPage.tsx
│   └── ui/               # UI components
│       ├── LoadingSpinner.tsx
│       └── SubscriptionSettingsDialog.tsx
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   └── firestore.ts      # Firestore utility functions
└── types/                # TypeScript type definitions
    └── user.ts           # User-related types
```

## Database Schema

### Collections

1. **users** - User profiles
   - uid (document ID)
   - email, firstName, lastName
   - phone, company, vatNumber
   - address (street, city, postalCode, country)
   - createdAt, updatedAt

2. **subscriptionPlans** - Available subscription plans
   - name (Base/Extra)
   - billingCycle (monthly/yearly)
   - price, features, description

3. **userSubscriptions** - User subscription records
   - userId, planId, plan details
   - status (active/cancelled/expired)
   - startDate, endDate
   - webshopUrl (optional) - URL where chatbot will be installed
   - apiToken (optional) - Generated API token for chatbot authentication
   - createdAt, updatedAt

4. **invoices** - Billing records
   - userId, subscriptionId
   - amount, currency, status
   - dueDate, paidAt, createdAt

## Features in Detail

### Authentication Flow
- Users can register with email/password
- User profiles are automatically created in Firestore
- Login/logout functionality with persistent sessions
- Protected routes for authenticated users
- Automatic redirect to login for unauthenticated users

### Profile Management
- Personal information (name, phone)
- Company information (company name, VAT number)
- Billing address management
- Real-time updates with success/error feedback

### Subscription System
- Browse available plans with pricing and features
- Monthly/Yearly billing cycle selection with tab interface
- Purchase subscriptions (creates subscription and invoice records)
- View current subscriptions with status and dates
- Billing history with payment status

### Chatbot Integration Setup
- **Webshop URL Configuration**: Set the URL where the chatbot will be installed
- **API Token Management**: Generate secure random tokens for chatbot authentication
- **Settings Dialog**: Easy-to-use interface for managing integration settings
- **Copy to Clipboard**: One-click token copying functionality
- **URL Validation**: Ensures valid URLs are entered

### Route Groups Architecture
- **Auth Group (`(auth)`)**: Simple layout for login/register pages
- **Dashboard Group (`(dashboard)`)**: Full layout with header, navigation, and auth checks
- **Clean Separation**: No conditional rendering, proper Next.js patterns
- **Better Performance**: Only load necessary code per route group

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run init-plans` - Initialize subscription plans in Firestore

### Environment Variables

The app now uses **runtime environment variables** instead of build-time variables. This means all environment variables are read when the application starts, not when it's built.

#### Required Environment Variables

**Firebase Configuration (Client-side):**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX  # Optional
```

**Stripe Configuration:**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Client-side
STRIPE_SECRET_KEY=sk_test_...                   # Server-side
STRIPE_WEBHOOK_SECRET=whsec_...                 # Server-side
```

**Stripe Product/Price IDs (Server-side):**
```bash
STRIPE_BASE_MONTHLY_PRICE_ID=price_...
STRIPE_BASE_YEARLY_PRICE_ID=price_...
STRIPE_EXTRA_MONTHLY_PRICE_ID=price_...
STRIPE_EXTRA_YEARLY_PRICE_ID=price_...
```

#### Setup Instructions

1. **Local Development**: Create a `.env.local` file in the root directory
2. **Docker**: Provide environment variables at runtime (see Docker section below)
3. Get Firebase credentials from your Firebase project settings
4. Get Stripe credentials from your Stripe dashboard
5. Create products and prices in Stripe and use their IDs

#### Docker Usage

The Docker image is built without any environment variables embedded. You must provide them at runtime:

```bash
# Build the image
docker build -t villma-customer-app .

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain \
  -e NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project \
  -e NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket \
  -e NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789 \
  -e NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef \
  -e STRIPE_PUBLISHABLE_KEY=pk_test_... \
  -e STRIPE_SECRET_KEY=sk_test_... \
  -e STRIPE_WEBHOOK_SECRET=whsec_... \
  -e STRIPE_BASE_MONTHLY_PRICE_ID=price_... \
  -e STRIPE_BASE_YEARLY_PRICE_ID=price_... \
  -e STRIPE_EXTRA_MONTHLY_PRICE_ID=price_... \
  -e STRIPE_EXTRA_YEARLY_PRICE_ID=price_... \
  villma-customer-app
```

Or use an environment file:
```bash
# Create .env file with all variables
docker run -p 3000:3000 --env-file .env villma-customer-app
```

#### Validation

The app will automatically validate all environment variables at startup:
- **Development**: Missing variables will prevent the app from starting
- **Production**: Missing variables will log errors but allow the app to continue (with reduced functionality)

You'll see clear error messages in the console if any required variables are missing or empty.

## Deployment

The application can be deployed to Vercel, Netlify, or any other Next.js-compatible hosting platform.

### Vercel Deployment

1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Deploy

## Security Considerations

- Firebase Authentication handles user security
- Firestore security rules should be configured to protect user data
- Input validation is implemented in forms
- Error handling for all async operations
- API tokens are generated securely and stored encrypted

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software for Villma.
