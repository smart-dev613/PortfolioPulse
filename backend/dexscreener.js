const axios = require('axios');

class DexscreenerAPI {
  constructor() {
    this.baseURL = 'https://api.dexscreener.com';
    this.rateLimitDelay = 1000; // 1 second delay between requests
    this.lastRequestTime = 0;
  }

  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  async getTokens(addresses) {
    await this.rateLimit();
    try {
      const addressString = addresses.join(',');
      const response = await axios.get(`${this.baseURL}/tokens/v1/solana/${addressString}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tokens:', error.message);
      return [];
    }
  }

  async searchTokens(query) {
    await this.rateLimit();
    try {
      const response = await axios.get(`${this.baseURL}/latest/dex/search`, {
        params: { q: query }
      });
      return response.data?.pairs || [];
    } catch (error) {
      console.error('Error searching tokens:', error.message);
      return [];
    }
  }

  async getTokenPairs(chainId, tokenAddress) {
    await this.rateLimit();
    try {
      const response = await axios.get(`${this.baseURL}/token-pairs/v1/${chainId}/${tokenAddress}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching token pairs:', error.message);
      return [];
    }
  }

  async getPairByAddress(chainId, pairAddress) {
    await this.rateLimit();
    try {
      const response = await axios.get(`${this.baseURL}/latest/dex/pairs/${chainId}/${pairAddress}`);
      return response.data?.pairs?.[0] || null;
    } catch (error) {
      console.error('Error fetching pair:', error.message);
      return null;
    }
  }

  // Get some popular Solana tokens for demo purposes
  async getPopularSolanaTokens() {
    const popularTokens = [
      'So11111111111111111111111111111111111111112', // SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
      'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // JUP
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'  // BONK
    ];
    
    return await this.getTokens(popularTokens);
  }
}

module.exports = DexscreenerAPI;

