# Portfolio Manager - Decentralized Crypto Portfolio Tracker

A full-stack web application that serves as a decentralized portfolio manager with live token data, authentication system, and portfolio management features.

## Features

### 🔐 Decentralized Authentication
- Username/password authentication without email/phone requirements
- 12-24 word recovery phrase generation for account recovery
- Secure password recovery using seed phrases
- No external dependencies for authentication

### 📊 Live Data Integration
- Real-time token prices from Dexscreener API
- Interactive price charts via TradingView
- 30-minute volume and liquidity tracking
- 24-hour price change monitoring

### 💼 Portfolio Management
- Manual token holding entry
- Live portfolio valuation
- Add/remove positions
- Clean summary dashboard
- Profit/Loss tracking with percentage changes

### 📈 Interactive Charts
- TradingView widget integration
- Multiple trading pairs (SOL/USD, BTC/USD, ETH/USD)
- Real-time price data and technical indicators
- Professional trading interface

## Tech Stack

### Backend
- **Node.js** with Express
- **Apollo Server** for GraphQL API
- **Axios** for external API integration
- **Crypto** for secure password hashing
- **CORS** for cross-origin requests

### Frontend
- **React** with Vite
- **Apollo Client** for GraphQL queries
- **Tailwind CSS** for styling
- **Shadcn/UI** components
- **Lucide React** icons
- **TradingView** widgets

## Project Structure

```
portfolio-manager/
├── backend/                 # GraphQL backend server
│   ├── server.js           # Main server file
│   ├── schema.js           # GraphQL schema definitions
│   ├── resolvers.js        # GraphQL resolvers
│   ├── auth.js             # Authentication service
│   ├── portfolio.js        # Portfolio management
│   └── dexscreener.js      # External API integration
├── portfolio-app/          # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/           # Utility libraries
│   │   └── App.jsx        # Main app component
│   └── public/            # Static assets
└── package.json           # Main project configuration
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-manager
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../portfolio-app && npm install
   ```

3. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The GraphQL server will run on `http://localhost:4000`

4. **Start the frontend development server**
   ```bash
   cd portfolio-app
   npm run dev
   ```
   The React app will run on `http://localhost:5173`

5. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating an Account
1. Click "Register" on the login page
2. Enter a username and password (minimum 6 characters)
3. Confirm your password
4. Save the generated recovery phrase securely
5. Confirm the recovery phrase to complete registration

### Managing Your Portfolio
1. Log in with your credentials
2. View your portfolio summary on the dashboard
3. Navigate between tabs:
   - **My Portfolio**: View your holdings and performance
   - **Discover Tokens**: Browse popular Solana tokens
   - **Live Charts**: View real-time TradingView charts

### Password Recovery
1. Click "Forgot password? Recover with seed phrase"
2. Enter your username and recovery phrase
3. Set a new password

## API Integration

### Dexscreener API
The application integrates with Dexscreener API to fetch:
- Real-time token prices
- 24-hour price changes
- Trading volume data
- Market liquidity information

### TradingView Widgets
Interactive charts are powered by TradingView's embedded widgets, providing:
- Real-time price charts
- Technical analysis tools
- Multiple timeframes
- Professional trading interface

## Security Features

- **Password Hashing**: Secure password storage using crypto libraries
- **Recovery Phrases**: BIP39-compatible mnemonic phrases for account recovery
- **No External Dependencies**: Authentication works without email/phone verification
- **Local Storage**: User sessions managed locally for privacy

## Deployment

### Render Deployment
The application is configured for deployment on Render:

1. **Backend Deployment**
   - Deploy the `backend` folder as a Node.js service
   - Set environment variables if needed
   - The server will start automatically

2. **Frontend Deployment**
   - Build the React app: `npm run build`
   - Deploy the `dist` folder as a static site
   - Configure the build command: `npm run build`

### Environment Variables
No environment variables are required for basic functionality. The application uses:
- Hardcoded API endpoints for development
- Local file storage for user data
- Public APIs that don't require authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the GitHub issues page
- Review the documentation
- Test locally before reporting bugs

---

**Note**: This application is for demonstration purposes. For production use, consider implementing proper database storage, enhanced security measures, and production-grade infrastructure.

