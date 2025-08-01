import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SimpleDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedToken, setSelectedToken] = useState('SOLUSD');

  // Mock portfolio data
  const portfolioData = {
    totalValue: 12450.75,
    holdings: [
      {
        id: '1',
        symbol: 'SOL',
        name: 'Solana',
        quantity: 25.5,
        averagePrice: 85.20,
        currentPrice: 92.15,
        currentValue: 2349.83,
        profitLoss: 177.23,
        profitLossPercentage: 8.15
      },
      {
        id: '2',
        symbol: 'USDC',
        name: 'USD Coin',
        quantity: 5000,
        averagePrice: 1.00,
        currentPrice: 1.00,
        currentValue: 5000.00,
        profitLoss: 0,
        profitLossPercentage: 0
      },
      {
        id: '3',
        symbol: 'JUP',
        name: 'Jupiter',
        quantity: 1200,
        averagePrice: 0.85,
        currentPrice: 0.92,
        currentValue: 1104.00,
        profitLoss: 84.00,
        profitLossPercentage: 8.24
      }
    ]
  };

  // Mock popular tokens
  const popularTokens = [
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 92.15,
      change24h: 5.23,
      volume24h: 1250000000,
      marketCap: 42500000000
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.00,
      change24h: 0.01,
      volume24h: 2100000000,
      marketCap: 32000000000
    },
    {
      symbol: 'JUP',
      name: 'Jupiter',
      price: 0.92,
      change24h: 8.24,
      volume24h: 45000000,
      marketCap: 1200000000
    },
    {
      symbol: 'BONK',
      name: 'Bonk',
      price: 0.000025,
      change24h: -2.15,
      volume24h: 125000000,
      marketCap: 1800000000
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPercentage = (percentage) => {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  // TradingView Widget Component
  const TradingViewWidget = ({ symbol }) => {
    useEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        calendar: false,
        support_host: "https://www.tradingview.com"
      });

      const container = document.getElementById('tradingview-widget');
      if (container) {
        container.innerHTML = '';
        container.appendChild(script);
      }

      return () => {
        if (container) {
          container.innerHTML = '';
        }
      };
    }, [symbol]);

    return (
      <div className="tradingview-widget-container" style={{ height: '400px', width: '100%' }}>
        <div id="tradingview-widget" style={{ height: '100%', width: '100%' }}></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Portfolio Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(portfolioData.totalValue)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {portfolioData.holdings.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">24h Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +2.45%
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="discover">Discover Tokens</TabsTrigger>
            <TabsTrigger value="charts">Live Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Holdings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Token</th>
                        <th className="text-right py-3 px-4">Quantity</th>
                        <th className="text-right py-3 px-4">Avg Price</th>
                        <th className="text-right py-3 px-4">Current Price</th>
                        <th className="text-right py-3 px-4">Value</th>
                        <th className="text-right py-3 px-4">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioData.holdings.map((holding) => (
                        <tr key={holding.id} className="border-b">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{holding.symbol}</div>
                              <div className="text-sm text-gray-600">{holding.name}</div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">{holding.quantity}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(holding.averagePrice)}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(holding.currentPrice)}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(holding.currentValue)}</td>
                          <td className={`text-right py-3 px-4 ${holding.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <div>{formatCurrency(holding.profitLoss)}</div>
                            <div className="text-sm">
                              {formatPercentage(holding.profitLossPercentage)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            {/* Popular Tokens */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Popular Solana Tokens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {popularTokens.map((token) => (
                  <Card key={token.symbol} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{token.symbol}</CardTitle>
                          <p className="text-sm text-gray-600">{token.name}</p>
                        </div>
                        <div className={`flex items-center space-x-1 ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {token.change24h >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {formatPercentage(token.change24h)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="text-2xl font-bold">
                        {formatCurrency(token.price)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">24h Volume</p>
                          <p className="font-medium">${formatNumber(token.volume24h)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Market Cap</p>
                          <p className="font-medium">${formatNumber(token.marketCap)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            {/* TradingView Charts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Live Price Charts</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant={selectedToken === 'SOLUSD' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedToken('SOLUSD')}
                    >
                      SOL/USD
                    </Button>
                    <Button
                      variant={selectedToken === 'BTCUSD' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedToken('BTCUSD')}
                    >
                      BTC/USD
                    </Button>
                    <Button
                      variant={selectedToken === 'ETHUSD' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedToken('ETHUSD')}
                    >
                      ETH/USD
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TradingViewWidget symbol={selectedToken} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SimpleDashboard;

