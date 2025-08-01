const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const DexscreenerAPI = require('./dexscreener');
const AuthService = require('./auth');
const PortfolioService = require('./portfolio');

async function startServer() {
  // Initialize services
  const dexscreenerAPI = new DexscreenerAPI();
  const authService = new AuthService();
  const portfolioService = new PortfolioService(dexscreenerAPI);

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: process.env.PORT || 4000, host: '0.0.0.0' },
    context: async ({ req }) => {
      // Get user from token if provided
      const token = req.headers.authorization?.replace('Bearer ', '');
      const user = token ? authService.getUserFromToken(token) : null;

      return {
        dexscreenerAPI,
        authService,
        portfolioService,
        user,
      };
    },
  });

  console.log(`🚀 Server ready at ${url}`);
  console.log(`📊 GraphQL Playground available at ${url}`);
  
  // Test the Dexscreener API connection
  try {
    console.log('🔍 Testing Dexscreener API connection...');
    const testTokens = await dexscreenerAPI.getPopularSolanaTokens();
    console.log(`✅ Successfully fetched ${testTokens.length} popular Solana tokens`);
  } catch (error) {
    console.error('❌ Error testing Dexscreener API:', error.message);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

startServer().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

module.exports = { startServer };

