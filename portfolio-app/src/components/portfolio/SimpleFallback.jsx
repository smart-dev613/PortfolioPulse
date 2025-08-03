import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SimpleFallback = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">PortfolioPulse</h1>
              <p className="text-sm text-gray-600">Live Crypto Portfolio Tracker</p>
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
        <div className="text-center space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to PortfolioPulse!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Your crypto portfolio tracking application is loading. If you're seeing this message, 
                there might be a temporary connection issue with the backend services.
              </p>
              
              <div className="space-y-2">
                <h3 className="font-semibold">What you can do:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Refresh the page to try again</li>
                  <li>• Check your internet connection</li>
                  <li>• Wait a moment and try again</li>
                </ul>
              </div>

              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Live Token Data</h4>
                  <p className="text-blue-700">Real-time prices from Dexscreener API</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Portfolio Management</h4>
                  <p className="text-green-700">Track your crypto holdings</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Interactive Charts</h4>
                  <p className="text-purple-700">TradingView integration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleFallback; 