// frontend/src/pages/LoginPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// A dynamic component to show password requirements and their status
const PasswordRequirements = ({ validation }) => {
    const requirements = [
        { key: 'length', text: 'At least 8 characters' },
        { key: 'uppercase', text: 'One uppercase letter (A-Z)' },
        { key: 'lowercase', text: 'One lowercase letter (a-z)' },
        { key: 'number', text: 'One number (0-9)' },
        { key: 'special', text: 'One special character (@$!%*?&#)' },
    ];

    return (
        <motion.div 
            className="text-xs text-terminal-gray/70 space-y-1 mt-2 p-3 border border-hacker-green/20 rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {requirements.map(req => (
                <div key={req.key} className="flex items-center">
                    {validation[req.key] ? (
                        <CheckCircleIcon className="h-4 w-4 text-hacker-green mr-2" />
                    ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500/50 mr-2" />
                    )}
                    <span className={validation[req.key] ? 'line-through text-terminal-gray/50' : ''}>
                        {req.text}
                    </span>
                </div>
            ))}
        </motion.div>
    );
};

const LoginPage = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const { login, register } = useAuth();

  const isFormValid = useMemo(() => {
    if (!isRegisterMode) return true;
    const allReqsMet = Object.values(passwordValidation).every(Boolean);
    return allReqsMet && password === confirmPassword && password !== '';
  }, [password, confirmPassword, passwordValidation, isRegisterMode]);

  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&#]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      if (isRegisterMode) {
        await register(username, email, password); 
      } else {
        await login(username, password);
      }
    } catch (err) {
      // --- UPDATED ERROR HANDLING LOGIC ---
      if (err.response && err.response.data && err.response.data.detail) {
        const errorDetail = err.response.data.detail;
        
        if (Array.isArray(errorDetail)) {
          // Handles detailed validation errors from Pydantic (e.g., invalid email)
          const firstError = errorDetail[0];
          const field = firstError.loc[1]; // e.g., 'email' or 'password'
          setError(`${field}: ${firstError.msg}`);
        } else {
          // Handles specific string errors from our backend
          // (e.g., "Incorrect username, email, or password", "Username already registered")
          setError(errorDetail);
        }
      } else {
        // Fallback for network errors or other unexpected issues
        setError('An unexpected network error occurred. Please try again.');
      }
    } finally {
      setIsProcessing(false);
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
              {isRegisterMode && <PasswordRequirements validation={passwordValidation} />}
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
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>
              )}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="w-full btn-primary" 
            disabled={isProcessing || (isRegisterMode && !isFormValid)}
          >
            {isProcessing
              ? (isRegisterMode ? 'CREATING_ACCOUNT...' : 'INITIATING_SESSION...')
              : (isRegisterMode ? '[CREATE_ACCOUNT]' : '[INITIATE_SESSION]')}
          </button>
        </form>

        {error && <p className="text-red-500 text-center animate-fade-in">{`Error: ${error}`}</p>}
        
        <div className="text-center">
          <button onClick={toggleMode} className="text-sm text-hacker-green hover:underline focus:outline-none" disabled={isProcessing}>
            {isRegisterMode ? 'Already have an account? Login.' : 'Need an account? Register.'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;