import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const PasswordRequirements = () => (
    <motion.div 
        className="text-xs text-terminal-gray/70 space-y-1 mt-2 p-2 border border-hacker-green/20 rounded-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
        <p>Password requires:</p>
        <ul className="list-disc list-inside pl-2">
            <li>At least 8 characters</li>
            <li>One uppercase letter (A-Z)</li>
            <li>One lowercase letter (a-z)</li>
            <li>One number (0-9)</li>
            <li>One special character (@$!%*?&#)</li>
        </ul>
    </motion.div>
);

const LoginPage = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegisterMode) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      try {
        await register(username, email, password); 
      } catch (err) {
        if (err.response && err.response.data && Array.isArray(err.response.data.detail)) {
          const firstError = err.response.data.detail[0];
          const field = firstError.loc[1];
          const message = firstError.msg;
          setError(`Validation Error -> ${field}: ${message}`);
        } else {
          setError(err.response?.data?.detail || 'Registration failed.');
        }
      }
    } else {
      try {
        await login(username, password);
      } catch (err) {
        setError(err.response?.data?.detail || 'Login failed.');
      }
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div 
        className="card w-full max-w-md p-8 space-y-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <h1 className="text-3xl text-center">
          {isRegisterMode ? 'CREATE_NEW_USER' : 'ACCESS_TERMINAL'}
        </h1>
        <p className="text-center text-terminal-gray">
          {isRegisterMode ? 'Establish a new identity' : 'User Authentication Required'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-hacker-green">
                {isRegisterMode ? 'USERNAME' : 'USERNAME or EMAIL'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {isRegisterMode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label className="block text-hacker-green">{'EMAIL'}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </motion.div>
          )}

          <div>
              <label className="block text-hacker-green">{'PASSWORD'}</label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
              />
              {isRegisterMode && <PasswordRequirements />}
          </div>
          
          {isRegisterMode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label className="block text-hacker-green">{'CONFIRM_PASSWORD'}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                required
              />
            </motion.div>
          )}

          <button type="submit" className="w-full btn-primary">
            {isRegisterMode ? '[CREATE_ACCOUNT]' : '[INITIATE_SESSION]'}
          </button>
        </form>

        {error && <p className="text-red-500 text-center animate-fade-in">{`Error: ${error}`}</p>}
        
        <div className="text-center">
          <button onClick={toggleMode} className="text-sm text-hacker-green hover:underline focus:outline-none">
            {isRegisterMode ? 'Already have an account? Login.' : 'Need an account? Register.'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;