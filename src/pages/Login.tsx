import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (value && !/\S+@\S+\.\S+/.test(value)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.length < 6) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || emailError || !password || passwordError) {
      if (!username) setEmailError(true);
      if (!password) setPasswordError(true);
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      // Call the login API
      const response = await authApi.login({ username, password });

      // Store the token in local storage
      localStorage.setItem('authToken', response.data.token);

      // Redirect to the dashboard or home page
      navigate('/vehicles');
    } catch (err: any) {
      console.error('Login failed:', err);
      setApiError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-5">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-lg">
        <div className="text-center text-3xl text-gray-900 dark:text-white">
          <h1 className="text-3xl text-black font-bold">Administrative Login</h1>
          <h2 className="text-lg text-black">Authorized Access Only</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div className="mb-4">
              <label htmlFor="username" className="text-black text-lg font-bold">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className={`block w-full px-4 py-3 placeholder-gray-500 border ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Username"
                value={username}
                onChange={handleEmailChange}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-500">Please enter a valid username.</p>
              )}
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="text-black text-lg font-bold">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`block w-full px-4 py-3 placeholder-gray-500 border ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-500">
                  Password must be at least 6 characters.
                </p>
              )}
            </div>
          </div>
          {apiError && (
            <p className="text-sm text-red-500 text-center">{apiError}</p>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md group hover:bg-white hover:text-primary hover:border-primary transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="relative flex justify-center w-full mt-3 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md group hover:bg-white hover:text-red-500 hover:border-red-500 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Forgot Password
            </button>
          </div>
        </form>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Forgot Password</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 text-[20px] hover:text-gray-700 focus:outline-none"
              >
                X
              </button>
            </div>
            <p className="text-md text-gray-600">
              If you have forgotten your password, you will have to contact M6 by sending an
              email to{' '}
              <a href="mailto:info@m6group.ca" className="text-indigo-600 underline">
                info@m6group.ca
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;