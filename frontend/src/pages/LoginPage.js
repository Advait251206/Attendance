import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const PasswordRequirements = () => (
    <motion.div 
        className="text-xs text-terminal-gray/70 space-y-1 mt-2 p-2 border border-hacker-green/20 rounded-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
        <p>// Password requires:</p>
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
        await register(username, password);
      } catch (err) {
        // --- START OF NEW, SMARTER ERROR HANDLING ---
        if (err.response && err.response.data && Array.isArray(err.response.data.detail)) {
          // This is a FastAPI validation error. Let's parse it.
          const firstError = err.response.data.detail[0];
          const field = firstError.loc[1]; // e.g., "password"
          const message = firstError.msg;  // e.g., "ensure this value has at least 8 characters"
          setError(`Validation Error -> ${field}: ${message}`);
        } else {
          // This is a generic error.
          setError(err.response?.data?.detail || 'Registration failed.');
        }
        // --- END OF NEW ERROR HANDLING ---
      }
    } else {
      // ... (login logic remains the same)
      try {
        await login(username, password);
      } catch (err) {
        setError(err.response?.data?.detail || 'Login failed.');
      }
    }
  };
  
  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    // Clear fields and errors when switching modes
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
        <div className="flex items-center justify-center min-h-screen">
            <motion.div 
                // ... (main div animation is unchanged)
            >
                {/* ... (h1 and p tags are unchanged) */}
                
                <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                    {/* ... (username input is unchanged) */}

                    <div>
                        <label className="block text-hacker-green">{'// PASSWORD'}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            required
                        />
                        {/* Show requirements only in register mode */}
                        {isRegisterMode && <PasswordRequirements />}
                    </div>
                  
                    {/* ... (confirm password and button are unchanged) */}
                </form>

                {/* ... (error message and toggle button are unchanged) */}
            </motion.div>
        </div>
    );
};

export default LoginPage;