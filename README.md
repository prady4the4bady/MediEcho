# MediEcho - Privacy-First Voice Journal SaaS

MediEcho is a comprehensive MERN stack SaaS application for voice journaling and health tracking with AI-powered insights and encrypted weekly reports.

## Features

- **Voice-First Journaling**: Record symptoms, fitness, and mood using natural speech
- **AI Health Insights**: Get personalized health patterns and recommendations
- **Privacy-First Design**: Choose local storage or encrypted cloud sync
- **Weekly Encrypted PDFs**: Automatic health brief generation and secure storage
- **Subscription Management**: Stripe-powered billing with multiple tiers
- **Real-time AI Coaching**: Voice-based health coaching and guidance

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Stripe** for payments and subscriptions
- **bcrypt** for password hashing
- **pdf-lib** for PDF generation
- **Helmet** for security
- **Rate limiting** for API protection

### Frontend
- **React 18** with hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **Lucide React** for icons
- **Web Speech API** for voice recording

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe account for payments
- npm or yarn package manager

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   MONGO_URI=mongodb://localhost:27017/mediecho
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=15m
   REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
   REFRESH_TOKEN_EXPIRE=7d
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   STRIPE_PRICE_PRO_MONTHLY=price_your-pro-monthly-price-id
   STRIPE_PRICE_PRO_YEARLY=price_your-pro-yearly-price-id
   STRIPE_PRICE_COACH_MONTHLY=price_your-coach-monthly-price-id
   STRIPE_PRICE_COACH_YEARLY=price_your-coach-yearly-price-id
   NODE_ENV=development
   PORT=5000
   APP_URL=http://localhost:3000
   ```

4. Start the backend server:
   ```bash
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
   REACT_APP_NAME=MediEcho
   REACT_APP_VERSION=1.0.0
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Create products and prices for your subscription tiers
4. Set up webhooks for subscription events
5. Update the `.env` files with your Stripe credentials

## MongoDB Setup

### Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Use the default connection string: `mongodb://localhost:27017/mediecho`

### MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a cluster and database
3. Get connection string and update `MONGO_URI` in `.env`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Logs
- `GET /api/logs` - Get user logs
- `POST /api/logs` - Create new log
- `PUT /api/logs/:id` - Update log
- `DELETE /api/logs/:id` - Delete log

### Subscriptions
- `POST /api/subscription/create-checkout-session` - Create Stripe checkout
- `POST /api/subscription/create-portal-session` - Create customer portal
- `GET /api/subscription` - Get subscription status

### Weekly Briefs
- `GET /api/briefs` - Get weekly briefs
- `GET /api/briefs/:id/download` - Download PDF brief

## Project Structure

```
MediEcho/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env
│   └── package.json
└── README.md
```

## Development

### Running Tests
```bash
cd backend
npm test
```

### Building for Production
```bash
cd frontend
npm run build
```

### Environment Variables

Make sure to set all environment variables in both `.env` files. Never commit `.env` files to version control.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@mediecho.com or create an issue in this repository.

## Roadmap

- [ ] Voice recording and transcription
- [ ] AI-powered health insights
- [ ] PDF brief generation
- [ ] Real-time AI coaching
- [ ] Mobile app
- [ ] Integration with wearables
- [ ] Multi-language support