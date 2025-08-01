import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TokenCard = ({ token, onAddToPortfolio }) => {
  const priceChange24h = token.priceChange?.h24 || 0;
  const volume24h = token.volume?.h24 || 0;
  const liquidity = token.liquidity?.usd || 0;
  
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

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
      
      <CardContent className="space-y-3">
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
            <p className="text-gray-600">24h Volume</p>
            <p className="font-medium">${formatNumber(volume24h)}</p>
          </div>
          <div>
            <p className="text-gray-600">Liquidity</p>
            <p className="font-medium">${formatNumber(liquidity)}</p>
          </div>
        </div>
        
        {token.marketCap && (
          <div className="text-sm">
            <p className="text-gray-600">Market Cap</p>
            <p className="font-medium">${formatNumber(token.marketCap)}</p>
          </div>
        )}
        
        {onAddToPortfolio && (
          <button
            onClick={() => onAddToPortfolio(token)}
            className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Add to Portfolio
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenCard;

