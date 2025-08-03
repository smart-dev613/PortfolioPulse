import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import EnhancedDashboard from './components/portfolio/EnhancedDashboard';
import client from './lib/apollo';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  // Debug logging
  console.log('AppContent - user:', user, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    console.log('Rendering EnhancedDashboard for user:', user.username);
    return <EnhancedDashboard />;
  } else {
    console.log('Rendering AuthPage - no user');
    return <AuthPage />;
  }
}

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
