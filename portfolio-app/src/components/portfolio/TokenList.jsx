import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Plus, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GET_TOKENS } from '../../lib/queries';
import AuthPage from '../auth/AuthPage';

const TokenList = ({ onAddToPortfolio }) => {
  const { user } = useAuth();
  const [selectedToken, setSelectedToken] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Popular Solana token addresses for initial display
  const popularTokens = [
    'So11111111111111111111111111111111111111112', // SOL
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // JUP
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'  // BONK
  ];

  const { data: tokensData, loading: tokensLoading, error: tokensError } = useQuery(GET_TOKENS, {
    variables: { addresses: popularTokens },
    pollInterval: 30000, // Refresh every 30 seconds
    errorPolicy: 'all' // Don't fail the entire component on query errors
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

  const handleAddToPortfolio = (token) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    onAddToPortfolio(token);
  };

  const handleViewChart = (token) => {
    setSelectedToken(token);
    setShowChart(true);
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

  if (tokensLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600 ml-2">Loading tokens...</p>
      </div>
    );
  }

  if (tokensError) {
    console.error('Tokens query error:', tokensError);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Live Token Data</h2>
          <p className="text-sm text-gray-600">Real-time prices from Dexscreener API</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Error loading token data. Please check your connection and try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tokens = tokensData?.getTokens || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Token Data</h2>
        <p className="text-sm text-gray-600">Real-time prices from Dexscreener API</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((token) => {
          const priceChange24h = token.priceChange?.h24 || 0;
          const volume24h = token.volume?.h24 || 0;
          const volume3h = token.volume?.h6 || 0; // Using h6 as closest to 3h
          const liquidity = token.liquidity?.usd || 0;

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
                    <p className="font-medium">${formatNumber(liquidity)}</p>
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

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Please login or register to add tokens to your portfolio.
            </p>
            <AuthPage />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TokenList; 