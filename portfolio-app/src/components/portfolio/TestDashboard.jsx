import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Plus, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GET_TOKENS } from '../../lib/queries';

const TestDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedToken, setSelectedToken] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Popular Solana token addresses for testing
  const popularTokens = [
    'So11111111111111111111111111111111111111112', // SOL
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  ];

  const { data: tokensData, loading: tokensLoading, error: tokensError } = useQuery(GET_TOKENS, {
    variables: { addresses: popularTokens },
    pollInterval: 30000,
    errorPolicy: 'all'
  });

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    const num = parseFloat(price);
    if (num < 0.01) return `$${num.toFixed(6)}`;
    if (num < 1) return `$${num.toFixed(4)}`;
    return `$${num.toFixed(2)}`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const getPriceChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleViewChart = (token) => {
    console.log('View chart clicked for:', token.baseToken.symbol);
    setSelectedToken(token);
    setShowChart(true);
  };

  const handleAddToPortfolio = (token) => {
    console.log('Add to portfolio clicked for:', token.baseToken.symbol);
    setSelectedToken(token);
    setShowAddDialog(true);
  };

  const handleAddConfirm = () => {
    console.log('Adding token to portfolio:', selectedToken?.baseToken.symbol);
    alert(`Added ${selectedToken?.baseToken.symbol} to portfolio!`);
    setShowAddDialog(false);
    setSelectedToken(null);
  };

  // TradingView Widget Component
  const TradingViewWidget = ({ symbol }) => {
    React.useEffect(() => {
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
      <div className="tradingview-widget-container" style={{ height: '500px', width: '100%' }}>
        <div id="tradingview-widget" style={{ height: '100%', width: '100%' }}></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">PortfolioPulse</h1>
              <Badge variant="outline" className="text-xs">
                Test Dashboard - Live Crypto Portfolio Tracker
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Live Token Data (Test)</h2>
            <p className="text-sm text-gray-600">Real-time prices from Dexscreener API</p>
          </div>

          {tokensLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 ml-2">Loading tokens...</p>
            </div>
          ) : tokensError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Error loading token data: {tokensError.message}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(tokensData?.getTokens || []).map((token) => {
                const priceChange24h = token.priceChange?.h24 || 0;
                const volume24h = token.volume?.h24 || 0;
                const volume3h = token.volume?.h6 || 0;

                return (
                  <Card key={token.pairAddress} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {token.info?.imageUrl && (
                            <img
                              src={token.info.imageUrl}
                              alt={token.baseToken.symbol}
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <CardTitle className="text-lg">
                              {token.baseToken.symbol}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              {token.baseToken.name}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {token.dexId}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {formatPrice(token.priceUsd)}
                        </span>
                        <div className={`flex items-center space-x-1 ${getPriceChangeColor(priceChange24h)}`}>
                          {priceChange24h > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : priceChange24h < 0 ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : null}
                          <span className="font-medium">
                            {priceChange24h > 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">24h Change</p>
                          <p className={`font-medium ${getPriceChangeColor(priceChange24h)}`}>
                            {priceChange24h > 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">3h Volume</p>
                          <p className="font-medium">${formatNumber(volume3h)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">24h Volume</p>
                          <p className="font-medium">${formatNumber(volume24h)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Liquidity</p>
                          <p className="font-medium">${formatNumber(token.liquidity?.usd || 0)}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewChart(token)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Chart
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAddToPortfolio(token)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Portfolio
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>User:</strong> {user?.username} (ID: {user?.id})</p>
                <p><strong>Tokens Loaded:</strong> {tokensData?.getTokens?.length || 0}</p>
                <p><strong>Loading:</strong> {tokensLoading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {tokensError ? tokensError.message : 'None'}</p>
                <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:4000'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chart Dialog */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedToken?.baseToken?.symbol} Price Chart
            </DialogTitle>
          </DialogHeader>
          {selectedToken && (
            <TradingViewWidget symbol={`${selectedToken.baseToken.symbol}USD`} />
          )}
        </DialogContent>
      </Dialog>

      {/* Add to Portfolio Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {selectedToken?.baseToken?.symbol} to Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              This is a test dialog. In the full version, you would enter quantity and price here.
            </p>
            <div className="flex space-x-2">
              <Button
                className="flex-1"
                onClick={handleAddConfirm}
              >
                Confirm Add
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestDashboard; 