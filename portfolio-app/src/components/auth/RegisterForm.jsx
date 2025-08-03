import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [phraseConfirmed, setPhraseConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await register(formData.username, formData.password);
    
    if (result.success) {
      setRecoveryPhrase(result.user.recoveryPhrase);
      setShowRecoveryPhrase(true);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryPhrase);
  };

  if (showRecoveryPhrase) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Save Your Recovery Phrase</CardTitle>
          <CardDescription>
            This 12-word phrase is your only way to recover your account. Store it safely!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Write down these words in order and store them in a safe place. You'll need them to recover your password.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-100 p-4 rounded-lg relative">
              <p className="font-mono text-sm break-words">{recoveryPhrase}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="phrase-confirmed"
                checked={phraseConfirmed}
                onCheckedChange={setPhraseConfirmed}
              />
              <Label htmlFor="phrase-confirmed" className="text-sm">
                I have safely stored my recovery phrase
              </Label>
            </div>
            
            <Button
              className="w-full"
              disabled={!phraseConfirmed}
              onClick={() => {
                setShowRecoveryPhrase(false);
                setPhraseConfirmed(false);
                // The user will be automatically logged in after registration
              }}
            >
              Continue to Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Create a new decentralized account with recovery phrase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min 6 characters)"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToLogin}
              className="text-sm"
            >
              Already have an account? Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;

