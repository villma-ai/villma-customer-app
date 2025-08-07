'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    
    try {
      // TODO: Implement password reset functionality
      // For now, we'll simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('A password reset email has been sent. Please check your inbox.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send password reset email.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 text-center mt-4 mb-2 tracking-tight">
        Forgot Password?
      </h1>
      <p className="text-gray-500 text-center mb-4">
        Enter your email address and we&#39;ll send you a link to reset your password.
      </p>
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </>
  );
}
