import { gql } from '@apollo/client';

// Authentication mutations
export const REGISTER_USER = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password) {
      token
      user {
        id
        username
        recoveryPhrase
        createdAt
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        recoveryPhrase
        createdAt
      }
    }
  }
`;

export const RECOVER_PASSWORD = gql`
  mutation RecoverPassword($username: String!, $recoveryPhrase: String!, $newPassword: String!) {
    recoverPassword(username: $username, recoveryPhrase: $recoveryPhrase, newPassword: $newPassword) {
      token
      user {
        id
        username
        recoveryPhrase
        createdAt
      }
    }
  }
`;

// Token queries
export const GET_TOKENS = gql`
  query GetTokens($addresses: [String!]!) {
    getTokens(addresses: $addresses) {
      chainId
      dexId
      url
      pairAddress
      baseToken {
        address
        name
        symbol
      }
      quoteToken {
        address
        name
        symbol
      }
      priceNative
      priceUsd
      volume {
        h24
        h6
        h1
        m5
      }
      priceChange {
        h24
        h6
        h1
        m5
      }
      liquidity {
        usd
        base
        quote
      }
      fdv
      marketCap
      pairCreatedAt
      info {
        imageUrl
        websites {
          url
        }
        socials {
          platform
          handle
        }
      }
    }
  }
`;

export const SEARCH_TOKENS = gql`
  query SearchTokens($query: String!) {
    searchTokens(query: $query) {
      chainId
      dexId
      url
      pairAddress
      baseToken {
        address
        name
        symbol
      }
      quoteToken {
        address
        name
        symbol
      }
      priceNative
      priceUsd
      volume {
        h24
        h6
        h1
        m5
      }
      priceChange {
        h24
        h6
        h1
        m5
      }
      liquidity {
        usd
        base
        quote
      }
      fdv
      marketCap
      pairCreatedAt
      info {
        imageUrl
        websites {
          url
        }
        socials {
          platform
          handle
        }
      }
    }
  }
`;

// Portfolio queries
export const GET_PORTFOLIO = gql`
  query GetPortfolio($userId: ID!) {
    getPortfolio(userId: $userId) {
      id
      userId
      totalValue
      holdings {
        id
        tokenAddress
        tokenSymbol
        tokenName
        quantity
        averagePrice
        currentPrice
        currentValue
        profitLoss
        profitLossPercentage
      }
    }
  }
`;

export const GET_HOLDINGS = gql`
  query GetHoldings($userId: ID!) {
    getHoldings(userId: $userId) {
      id
      tokenAddress
      tokenSymbol
      tokenName
      quantity
      averagePrice
      currentPrice
      currentValue
      profitLoss
      profitLossPercentage
    }
  }
`;

// Portfolio mutations
export const ADD_HOLDING = gql`
  mutation AddHolding($userId: ID!, $holding: HoldingInput!) {
    addHolding(userId: $userId, holding: $holding) {
      id
      tokenAddress
      tokenSymbol
      tokenName
      quantity
      averagePrice
      currentPrice
      currentValue
      profitLoss
      profitLossPercentage
    }
  }
`;

export const UPDATE_HOLDING = gql`
  mutation UpdateHolding($holdingId: ID!, $quantity: Float, $averagePrice: Float) {
    updateHolding(holdingId: $holdingId, quantity: $quantity, averagePrice: $averagePrice) {
      id
      tokenAddress
      tokenSymbol
      tokenName
      quantity
      averagePrice
      currentPrice
      currentValue
      profitLoss
      profitLossPercentage
    }
  }
`;

export const REMOVE_HOLDING = gql`
  mutation RemoveHolding($holdingId: ID!) {
    removeHolding(holdingId: $holdingId)
  }
`;

// User query
export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      recoveryPhrase
      createdAt
    }
  }
`;

