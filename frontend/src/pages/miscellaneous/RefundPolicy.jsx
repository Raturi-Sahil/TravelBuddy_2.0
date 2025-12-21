import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>

      <div className="prose prose-amber max-w-none text-gray-600">
        <p className="mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Overview</h2>
          <p className="mb-4">
            At TravelBuddy, we strive to ensure our customers are satisfied with our services. This Refund Policy outlines the terms and conditions for refunds.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Subscription Refunds</h2>
          <p className="mb-4">
            If you are not satisfied with your premium subscription, you may request a refund within 14 days of purchase. After 14 days, no refunds will be issued for monthly subscriptions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Booking Refunds</h2>
          <p className="mb-4">
            Refunds for bookings made through TravelBuddy partners are subject to the specific terms and conditions of the partner. Please review the cancellation policy for each booking carefully.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Requesting a Refund</h2>
          <p className="mb-4">
            To request a refund, please contact our support team at <a href="mailto:support@travelbuddy.com" className="text-amber-600 hover:text-amber-700">support@travelbuddy.com</a> with your order details and the reason for the request.
          </p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;
