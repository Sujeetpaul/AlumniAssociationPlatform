// src/features/auth/components/LoginForm.jsx
import React, { useState } from 'react';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import { useAuth } from '../../../contexts/AuthContext'; // <-- Import useAuth
import { useLocation, useNavigate } from 'react-router-dom'; // <-- Import for navigation

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // <-- Get login function from context
  const navigate = useNavigate(); // <-- Hook for navigation
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
      event.preventDefault();
      setError('');
      if (!email || !password) {
          setError('Please enter both email and password.');
          return;
      }
      setLoading(true);
      try {
          await login(email, password);
          console.log(`Login successful, navigating to: ${from}`);
          navigate(from, { replace: true }); // <-- Navigate to 'from' location
                                              // 'replace: true' removes login page from history
      } catch (err) {
          console.error("Login error:", err);
          setError(err.message || 'Failed to login. Please check credentials.');
      } finally {
          setLoading(false);
      }
  };

  // ... rest of the component (return JSX) remains the same
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
       {/* ... (form content) ... */}
       <Input
         label="Email Address" type="email" id="email" name="email" value={email}
         onChange={(e) => setEmail(e.target.value)} required placeholder="user@example.com" disabled={loading}
       />
        <Input
         label="Password" type="password" id="password" name="password" value={password}
         onChange={(e) => setPassword(e.target.value)} required placeholder="password" disabled={loading}
       />
       <Button type="submit" variant="primary" disabled={loading} isLoading={loading} className="w-full">
         Login
       </Button>
    </form>
  );
}
export default LoginForm;