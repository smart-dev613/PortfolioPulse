import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, TrendingUp, TrendingDown, LogOut, Wallet, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GET_PORTFOLIO, GET_TOKENS, SEARCH_TOKENS, ADD_HOLDING, REMOVE_HOLDING } from '../../lib/queries';
import TokenList from './TokenList';

const EnhancedDashboard = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [holdingForm, setHoldingForm] = useState({
    quantity: '',
    averagePrice: ''
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: portfolioData, refetch: refetchPortfolio } = useQuery(GET_PORTFOLIO, {
    variables: { userId: user?.id },
    skip: !user?.id,
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

  const handleAddToPortfolio = (token) => {
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

  const portfolio = portfolioData?.getPortfolio;
  const holdings = portfolio?.holdings || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">PortfolioPulse</h1>
              <Badge variant="outline" className="text-xs">
                Live Crypto Portfolio Tracker
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
        <Tabs defaultValue="tokens" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tokens">Live Tokens</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          {/* Live Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <TokenList onAddToPortfolio={handleAddToPortfolio} />
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Portfolio Summary */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Portfolio Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(portfolio?.totalValue || 0)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Holdings</p>
                      <p className="font-medium">{holdings.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tokens</p>
                      <p className="font-medium">
                        {new Set(holdings.map(h => h.tokenSymbol)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Holdings List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">Your Holdings</h3>
                {holdings.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-600 mb-4">No holdings yet</p>
                      <p className="text-sm text-gray-500">
                        Add tokens from the Live Tokens tab to start building your portfolio
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {holdings.map((holding) => (
                      <Card key={holding.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-medium">{holding.tokenSymbol}</p>
                                <p className="text-sm text-gray-600">{holding.tokenName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(holding.currentValue)}</p>
                              <p className={`text-sm ${holding.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(holding.profitLossPercentage)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveHolding(holding.id)}
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <p>Quantity: {holding.quantity}</p>
                            </div>
                            <div>
                              <p>Avg Price: {formatCurrency(holding.averagePrice)}</p>
                            </div>
                            <div>
                              <p>Current: {formatCurrency(holding.currentPrice)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Price Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['SOLUSD', 'BTCUSD', 'ETHUSD'].map((symbol) => (
                    <Button
                      key={symbol}
                      variant="outline"
                      className="h-12"
                      onClick={() => {
                        // This would open a chart dialog
                        console.log(`Open chart for ${symbol}`);
                      }}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {symbol}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Holding Dialog */}
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
              <Button
                className="flex-1"
                onClick={handleSubmitHolding}
                disabled={!holdingForm.quantity || !holdingForm.averagePrice}
              >
                Add to Portfolio
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

export default EnhancedDashboard; 