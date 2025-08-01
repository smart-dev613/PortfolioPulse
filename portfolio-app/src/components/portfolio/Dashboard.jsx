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
import { Search, Plus, TrendingUp, TrendingDown, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GET_PORTFOLIO, GET_TOKENS, SEARCH_TOKENS, ADD_HOLDING, REMOVE_HOLDING } from '../../lib/queries';
import TokenCard from './TokenCard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [holdingForm, setHoldingForm] = useState({
    quantity: '',
    averagePrice: ''
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Popular Solana token addresses for initial display
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercentage = (percentage) => {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
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
                {formatCurrency(portfolioData?.getPortfolio?.totalValue)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {portfolioData?.getPortfolio?.holdings?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">24h Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +0.00%
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="discover">Discover Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Holdings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioData?.getPortfolio?.holdings?.length > 0 ? (
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
                          <th className="text-right py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolioData.getPortfolio.holdings.map((holding) => (
                          <tr key={holding.id} className="border-b">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{holding.tokenSymbol}</div>
                                <div className="text-sm text-gray-600">{holding.tokenName}</div>
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
                            <td className="text-right py-3 px-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveHolding(holding.id)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No holdings yet</p>
                    <p className="text-sm text-gray-500">
                      Add tokens to your portfolio from the Discover tab
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search for tokens (e.g., SOL, USDC)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={searchLoading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Popular Tokens */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {searchResults.length > 0 ? 'Search Results' : 'Popular Solana Tokens'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchResults.length > 0 ? searchResults : tokensData?.getTokens || []).map((token, index) => (
                  <TokenCard
                    key={token.pairAddress || index}
                    token={token}
                    onAddToPortfolio={handleAddToPortfolio}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Holding Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {selectedToken?.baseToken.symbol} to Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                placeholder="Enter quantity"
                value={holdingForm.quantity}
                onChange={(e) => setHoldingForm({ ...holdingForm, quantity: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="averagePrice">Average Price (USD)</Label>
              <Input
                id="averagePrice"
                type="number"
                step="any"
                placeholder="Enter average price"
                value={holdingForm.averagePrice}
                onChange={(e) => setHoldingForm({ ...holdingForm, averagePrice: e.target.value })}
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
    </div>
  );
};

export default Dashboard;

