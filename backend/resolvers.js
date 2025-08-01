const resolvers = {
  Query: {
    getTokens: async (_, { addresses }, { dexscreenerAPI }) => {
      return await dexscreenerAPI.getTokens(addresses);
    },

    searchTokens: async (_, { query }, { dexscreenerAPI }) => {
      return await dexscreenerAPI.searchTokens(query);
    },

    getTokenPairs: async (_, { chainId, tokenAddress }, { dexscreenerAPI }) => {
      return await dexscreenerAPI.getTokenPairs(chainId, tokenAddress);
    },

    getPortfolio: async (_, { userId }, { portfolioService }) => {
      return await portfolioService.getPortfolio(userId);
    },

    getHoldings: async (_, { userId }, { portfolioService }) => {
      return await portfolioService.getHoldings(userId);
    },

    me: async (_, __, { user }) => {
      return user;
    }
  },

  Mutation: {
    register: async (_, { username, password }, { authService }) => {
      return await authService.register(username, password);
    },

    login: async (_, { username, password }, { authService }) => {
      return await authService.login(username, password);
    },

    recoverPassword: async (_, { username, recoveryPhrase, newPassword }, { authService }) => {
      return await authService.recoverPassword(username, recoveryPhrase, newPassword);
    },

    addHolding: async (_, { userId, holding }, { portfolioService }) => {
      return await portfolioService.addHolding(userId, holding);
    },

    updateHolding: async (_, { holdingId, quantity, averagePrice }, { portfolioService }) => {
      const updates = {};
      if (quantity !== undefined) updates.quantity = quantity;
      if (averagePrice !== undefined) updates.averagePrice = averagePrice;
      return await portfolioService.updateHolding(holdingId, updates);
    },

    removeHolding: async (_, { holdingId }, { portfolioService }) => {
      return await portfolioService.removeHolding(holdingId);
    }
  }
};

module.exports = resolvers;

