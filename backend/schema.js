const typeDefs = `
  type Token {
    chainId: String!
    dexId: String!
    url: String
    pairAddress: String!
    baseToken: BaseToken!
    quoteToken: QuoteToken!
    priceNative: String
    priceUsd: String
    txns: Transactions
    volume: Volume
    priceChange: PriceChange
    liquidity: Liquidity
    fdv: Float
    marketCap: Float
    pairCreatedAt: Float
    info: TokenInfo
  }

  type BaseToken {
    address: String!
    name: String!
    symbol: String!
  }

  type QuoteToken {
    address: String!
    name: String!
    symbol: String!
  }

  type Transactions {
    m5: TransactionData
    h1: TransactionData
    h6: TransactionData
    h24: TransactionData
  }

  type TransactionData {
    buys: Int
    sells: Int
  }

  type Volume {
    m5: Float
    h1: Float
    h6: Float
    h24: Float
  }

  type PriceChange {
    m5: Float
    h1: Float
    h6: Float
    h24: Float
  }

  type Liquidity {
    usd: Float
    base: Float
    quote: Float
  }

  type TokenInfo {
    imageUrl: String
    websites: [Website]
    socials: [Social]
  }

  type Website {
    url: String
  }

  type Social {
    platform: String
    handle: String
  }

  type User {
    id: ID!
    username: String!
    recoveryPhrase: String!
    createdAt: String!
  }

  type Portfolio {
    id: ID!
    userId: ID!
    holdings: [Holding!]!
    totalValue: Float!
  }

  type Holding {
    id: ID!
    tokenAddress: String!
    tokenSymbol: String!
    tokenName: String!
    quantity: Float!
    averagePrice: Float!
    currentPrice: Float!
    currentValue: Float!
    profitLoss: Float!
    profitLossPercentage: Float!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input HoldingInput {
    tokenAddress: String!
    tokenSymbol: String!
    tokenName: String!
    quantity: Float!
    averagePrice: Float!
  }

  type Query {
    # Token queries
    getTokens(addresses: [String!]!): [Token!]!
    searchTokens(query: String!): [Token!]!
    getTokenPairs(chainId: String!, tokenAddress: String!): [Token!]!
    
    # Portfolio queries
    getPortfolio(userId: ID!): Portfolio
    getHoldings(userId: ID!): [Holding!]!
    
    # User queries
    me: User
  }

  type Mutation {
    # Authentication mutations
    register(username: String!, password: String!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
    recoverPassword(username: String!, recoveryPhrase: String!, newPassword: String!): AuthPayload!
    
    # Portfolio mutations
    addHolding(userId: ID!, holding: HoldingInput!): Holding!
    updateHolding(holdingId: ID!, quantity: Float, averagePrice: Float): Holding!
    removeHolding(holdingId: ID!): Boolean!
  }
`;

module.exports = typeDefs;

