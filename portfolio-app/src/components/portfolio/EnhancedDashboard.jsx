import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, TrendingUp, TrendingDown, LogOut, Wallet, X, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GET_PORTFOLIO, GET_TOKENS, SEARCH_TOKENS, ADD_HOLDING, REMOVE_HOLDING } from '../../lib/queries';
import TokenCard from './TokenCard';
import AuthPage from '../auth/AuthPage';

const EnhancedDashboard = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [holdingForm, setHoldingForm] = useState({
    quantity: '',
    averagePrice: ''
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Popular Solana token addresses for initial display (4-5 tokens as requested)
  const popularTokens = [
    'So11111111111111111111111111111111111111112', // SOL
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // JUP
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'  // BONK
  ];

  const { data: portfolioData, refetch: refetchPortfolio } = useQuery(GET_PORTFOLIO, {
    variables: { userId: user?.id },
    skip: !user?.id,
    pollInterval: 30000 // Refresh every 30 seconds
  });

  const { data: tokensData, loading: tokensLoading } = useQuery(GET_TOKENS, {
    variables: { addresses: popularTokens },
    pollInterval: 30000 // Refresh every 30 seconds
  });

  const [searchTokens, { loading: searchLoading }] = useMutation(SEARCH_TOKENS);
  const [addHolding] = useMutation(ADD_HOLDING);
  const [removeHolding] = useMutation(REMOVE_HOLDING);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const { data } = await searchTokens({
        variables: { query: searchQuery }
      });
      setSearchResults(data.searchTokens || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Handle token click to show chart
  const handleTokenClick = (token) => {
    setSelectedToken(token);
    setShowChart(true);
  };

  // Handle add to portfolio (triggers login if not authenticated)
  const handleAddToPortfolio = (token) => {
    if (!user) {
      setSelectedToken(token);
      setShowAuth(true);
      return;
    }
    
    setSelectedToken(token);
    setShowAddDialog(true);
  };

  const handleSubmitHolding = async () => {
    if (!selectedToken || !holdingForm.quantity || !holdingForm.averagePrice) {
      return;
    }

    try {
      await addHolding({
        variables: {
          userId: user.id,
          holding: {
            tokenAddress: selectedToken.baseToken.address,
            tokenSymbol: selectedToken.baseToken.symbol,
            tokenName: selectedToken.baseToken.name,
            quantity: parseFloat(holdingForm.quantity),
            averagePrice: parseFloat(holdingForm.averagePrice)
          }
        }
      });
      
      setShowAddDialog(false);
      setHoldingForm({ quantity: '', averagePrice: '' });
      setSelectedToken(null);
      refetchPortfolio();
    } catch (error) {
      console.error('Error adding holding:', error);
    }
  };

  const handleRemoveHolding = async (holdingId) => {
    try {
      await removeHolding({
        variables: { holdingId }
      });
      refetchPortfolio();
    } catch (error) {
      console.error('Error removing holding:', error);
    }
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
      <div className="tradingview-widget-container" style={{ height: '500px', width: '100%' }}>
        <div id="tradingview-widget" style={{ height: '100%', width: '100%' }}></div>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    if (!percentage) return '0.00%';
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const tokens = tokensData?.getTokens || [];
  const portfolio = portfolioData?.getPortfolio;
  const holdings = portfolio?.holdings || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">PortfolioPulse</h1>
              <Badge variant="outline" className="text-xs">
                Live Data
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Welcome, {user.username}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="tokens" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tokens">Live Tokens</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          {/* Live Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Live Token Data (4-5 Solana Tokens)</span>
                </CardTitle>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search tokens..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={searchLoading}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tokensLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading live token data...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(searchResults.length > 0 ? searchResults : tokens).map((token) => (
                      <div key={token.pairAddress} className="relative">
                        <TokenCard 
                          token={token} 
                          onAddToPortfolio={handleAddToPortfolio}
                          onClick={() => handleTokenClick(token)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>My Portfolio</span>
                </CardTitle>
                {portfolio && (
                  <p className="text-lg font-semibold text-green-600">
                    Total Value: {formatCurrency(portfolio.totalValue)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Please log in to view your portfolio</p>
                    <Button onClick={() => setShowAuth(true)}>Login</Button>
                  </div>
                ) : holdings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No holdings yet. Add tokens from the Live Tokens tab!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {holdings.map((holding) => (
                      <div key={holding.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-medium">{holding.tokenSymbol}</h3>
                            <p className="text-sm text-gray-600">{holding.tokenName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(holding.currentValue)}</p>
                            <p className={`text-sm ${holding.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(holding.profitLossPercentage)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveHolding(holding.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Price Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <TradingViewWidget symbol="SOLUSD" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chart Dialog */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {selectedToken?.baseToken?.symbol} Price Chart
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChart(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="mt-4">
            {selectedToken && (
              <TradingViewWidget symbol={`${selectedToken.baseToken.symbol}USD`} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to Portfolio Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {selectedToken?.baseToken?.symbol} to Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                value={holdingForm.quantity}
                onChange={(e) => setHoldingForm({ ...holdingForm, quantity: e.target.value })}
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <Label htmlFor="averagePrice">Average Price (USD)</Label>
              <Input
                id="averagePrice"
                type="number"
                step="any"
                value={holdingForm.averagePrice}
                onChange={(e) => setHoldingForm({ ...holdingForm, averagePrice: e.target.value })}
                placeholder="Enter average price"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSubmitHolding} className="flex-1">
                Add to Portfolio
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-gray-600 mb-4">
              Please log in or register to add {selectedToken?.baseToken?.symbol} to your portfolio.
            </p>
            <AuthPage />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedDashboard; 