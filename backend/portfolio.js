const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto-js');

class PortfolioService {
  constructor(dexscreenerAPI) {
    this.portfolios = new Map();
    this.holdings = new Map();
    this.dexscreenerAPI = dexscreenerAPI;
    this.portfolioFile = path.join(__dirname, 'portfolios.json');
    this.holdingsFile = path.join(__dirname, 'holdings.json');
    this.loadData();
  }

  async loadData() {
    try {
      // Load portfolios
      const portfolioData = await fs.readFile(this.portfolioFile, 'utf8');
      const portfoliosArray = JSON.parse(portfolioData);
      portfoliosArray.forEach(portfolio => {
        this.portfolios.set(portfolio.userId, portfolio);
      });

      // Load holdings
      const holdingsData = await fs.readFile(this.holdingsFile, 'utf8');
      const holdingsArray = JSON.parse(holdingsData);
      holdingsArray.forEach(holding => {
        if (!this.holdings.has(holding.userId)) {
          this.holdings.set(holding.userId, []);
        }
        this.holdings.get(holding.userId).push(holding);
      });
    } catch (error) {
      console.log('No existing portfolio data found, starting fresh');
    }
  }

  async saveData() {
    try {
      // Save portfolios
      const portfoliosArray = Array.from(this.portfolios.values());
      await fs.writeFile(this.portfolioFile, JSON.stringify(portfoliosArray, null, 2));

      // Save holdings
      const holdingsArray = [];
      for (const userHoldings of this.holdings.values()) {
        holdingsArray.push(...userHoldings);
      }
      await fs.writeFile(this.holdingsFile, JSON.stringify(holdingsArray, null, 2));
    } catch (error) {
      console.error('Error saving portfolio data:', error);
    }
  }

  async getPortfolio(userId) {
    let portfolio = this.portfolios.get(userId);
    if (!portfolio) {
      portfolio = {
        id: crypto.lib.WordArray.random(16).toString(),
        userId,
        totalValue: 0
      };
      this.portfolios.set(userId, portfolio);
    }

    const holdings = await this.getHoldings(userId);
    const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
    
    portfolio.totalValue = totalValue;
    portfolio.holdings = holdings;
    
    await this.saveData();
    return portfolio;
  }

  async getHoldings(userId) {
    const userHoldings = this.holdings.get(userId) || [];
    
    // Get current prices for all holdings
    const tokenAddresses = userHoldings.map(h => h.tokenAddress);
    if (tokenAddresses.length === 0) return [];

    try {
      const tokenData = await this.dexscreenerAPI.getTokens(tokenAddresses);
      
      return userHoldings.map(holding => {
        const tokenInfo = tokenData.find(token => 
          token.baseToken?.address === holding.tokenAddress ||
          token.quoteToken?.address === holding.tokenAddress
        );
        
        const currentPrice = tokenInfo ? parseFloat(tokenInfo.priceUsd || '0') : holding.averagePrice;
        const currentValue = holding.quantity * currentPrice;
        const profitLoss = currentValue - (holding.quantity * holding.averagePrice);
        const profitLossPercentage = holding.averagePrice > 0 ? 
          ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100 : 0;

        return {
          ...holding,
          currentPrice,
          currentValue,
          profitLoss,
          profitLossPercentage
        };
      });
    } catch (error) {
      console.error('Error updating holding prices:', error);
      // Return holdings with original prices if API fails
      return userHoldings.map(holding => ({
        ...holding,
        currentPrice: holding.averagePrice,
        currentValue: holding.quantity * holding.averagePrice,
        profitLoss: 0,
        profitLossPercentage: 0
      }));
    }
  }

  async addHolding(userId, holdingInput) {
    const holding = {
      id: crypto.lib.WordArray.random(16).toString(),
      userId,
      ...holdingInput,
      currentPrice: holdingInput.averagePrice,
      currentValue: holdingInput.quantity * holdingInput.averagePrice,
      profitLoss: 0,
      profitLossPercentage: 0
    };

    if (!this.holdings.has(userId)) {
      this.holdings.set(userId, []);
    }
    
    this.holdings.get(userId).push(holding);
    await this.saveData();
    
    return holding;
  }

  async updateHolding(holdingId, updates) {
    for (const userHoldings of this.holdings.values()) {
      const holdingIndex = userHoldings.findIndex(h => h.id === holdingId);
      if (holdingIndex !== -1) {
        const holding = userHoldings[holdingIndex];
        
        if (updates.quantity !== undefined) {
          holding.quantity = updates.quantity;
        }
        if (updates.averagePrice !== undefined) {
          holding.averagePrice = updates.averagePrice;
        }
        
        // Recalculate current value
        holding.currentValue = holding.quantity * (holding.currentPrice || holding.averagePrice);
        holding.profitLoss = holding.currentValue - (holding.quantity * holding.averagePrice);
        holding.profitLossPercentage = holding.averagePrice > 0 ? 
          ((holding.currentPrice - holding.averagePrice) / holding.averagePrice) * 100 : 0;
        
        await this.saveData();
        return holding;
      }
    }
    throw new Error('Holding not found');
  }

  async removeHolding(holdingId) {
    for (const userHoldings of this.holdings.values()) {
      const holdingIndex = userHoldings.findIndex(h => h.id === holdingId);
      if (holdingIndex !== -1) {
        userHoldings.splice(holdingIndex, 1);
        await this.saveData();
        return true;
      }
    }
    return false;
  }
}

module.exports = PortfolioService;

