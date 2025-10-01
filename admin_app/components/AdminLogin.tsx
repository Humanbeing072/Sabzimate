import React, { useState } from 'react';

interface AdminLoginProps {
  onAdminLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Super secure password check for demo purposes
    if (password === 'admin123') {
      onAdminLogin();
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 p-6 text-center text-white">
      <h1 className="text-5xl font-bold mb-2">
        <span className="text-green-400">सब्ज़ी</span>
        <span className="text-red-500">MATE</span>
      </h1>
      <p className="text-gray-400 mb-10">Admin Panel</p>

      <div className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
            <input
                type="password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                }}
                placeholder="Password"
                className="w-full bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                autoFocus
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors">
            Login
            </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
