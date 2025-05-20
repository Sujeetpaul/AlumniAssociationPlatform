// src/pages/DonatePage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input/Input';
import Button from '../components/common/Button/Button';
import Spinner from '../components/common/Spinner/Spinner';
// Import the donation service function
import { processDonation } from '../services/donation'; // <-- Import service

function DonatePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const canDonate = isAuthenticated && user && (user.role === 'alumnus' || user.role === 'admin');

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Updated handler to call the service
  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid donation amount.");
      return;
    }

    setIsLoading(true);
    const donationData = {
        amount: parseFloat(amount),
        paymentMethod,
        userId: user.id // Assuming user object from AuthContext has an id
    };
    console.log(`[DonatePage] Submitting donation via service:`, donationData);

    try {
      // --- Call the Donation Service ---
      const response = await processDonation(donationData); // <-- Call service
      console.log("[DonatePage] Donation processed successfully via service:", response);
      // --- End Service Call ---

      setSuccessMessage(response.message || `Thank you for your generous donation of $${parseFloat(amount).toFixed(2)}!`);
      setAmount('');
      // Optionally redirect or show a more persistent success message
      // navigate('/donation-success');
    } catch (err) {
      console.error("Donation processing error:", err);
      setError(err.message || "Donation processing failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-10 max-w-md mx-auto bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Login Required</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to make a donation.</p>
        <Link to="/login" state={{ from: { pathname: '/donate' } }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md">Login</Link>
      </div>
    );
  }

  if (!canDonate) {
    return (
      <div className="text-center p-10 max-w-md mx-auto bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Donation Not Available</h2>
        <p className="text-gray-600">Currently, only alumni and administrators can make donations. Your role is: {user?.role}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-xl space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">Donate to Your College</h1>
      <p className="text-center text-gray-600 text-sm">Your contribution helps support current students and college initiatives.</p>

      {error && ( <div className="p-3 text-sm bg-red-100 border border-red-300 text-red-700 rounded" role="alert">{error}</div> )}
      {successMessage && ( <div className="p-3 text-sm bg-green-100 border border-green-300 text-green-700 rounded" role="alert">{successMessage}</div> )}

      <form onSubmit={handleSubmitDonation} className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Donation Amount ($)</label>
          <Input type="text" id="amount" name="amount" value={amount} onChange={handleAmountChange} placeholder="e.g., 50.00" required pattern="\d*\.?\d*" className="text-lg" disabled={isLoading} />
        </div>
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method (Placeholder)</label>
          <select id="paymentMethod" name="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" disabled={isLoading} >
            <option value="creditCard">Credit Card (Mock)</option>
            <option value="paypal">PayPal (Mock)</option>
            <option value="bankTransfer">Bank Transfer (Mock)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">This is a mock payment selection. No real transaction will occur.</p>
        </div>
        <Button type="submit" isLoading={isLoading} disabled={isLoading || !amount || parseFloat(amount) <= 0} className="w-full text-lg py-3">
          {isLoading ? 'Processing...' : 'Donate Now'}
        </Button>
      </form>
    </div>
  );
}

export default DonatePage;
