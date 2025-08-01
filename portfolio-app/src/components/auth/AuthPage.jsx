import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import RecoverForm from './RecoverForm';

const AuthPage = () => {
  const [currentForm, setCurrentForm] = useState('login');

  const renderForm = () => {
    switch (currentForm) {
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={() => setCurrentForm('register')}
            onSwitchToRecover={() => setCurrentForm('recover')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setCurrentForm('login')}
          />
        );
      case 'recover':
        return (
          <RecoverForm
            onSwitchToLogin={() => setCurrentForm('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portfolio Manager
          </h1>
          <p className="text-gray-600">
            Decentralized crypto portfolio tracking
          </p>
        </div>
        {renderForm()}
      </div>
    </div>
  );
};

export default AuthPage;

