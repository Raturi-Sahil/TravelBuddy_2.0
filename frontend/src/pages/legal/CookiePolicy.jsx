import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-28">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>

      <div className="prose prose-amber max-w-none text-gray-600">
        <p className="mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">1. What Are Cookies</h2>
          <p className="mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website.
            They are widely used to make websites work more efficiently and provide information to website owners.
            TravelBuddy uses cookies to enhance your browsing experience and provide personalized services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">2. How We Use Cookies</h2>
          <p className="mb-4">
            We use cookies for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.</li>
            <li><strong>Analytics Cookies:</strong> We use analytics cookies to understand how visitors interact with our website, helping us improve our services and user experience.</li>
            <li><strong>Functionality Cookies:</strong> These cookies allow us to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features.</li>
            <li><strong>Preference Cookies:</strong> These cookies remember your preferences and settings to provide a more personalized experience on future visits.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Types of Cookies We Use</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Session Cookies:</strong> These are temporary cookies that expire when you close your browser. They are used to maintain your session while you navigate through the website.</li>
            <li><strong>Persistent Cookies:</strong> These cookies remain on your device for a set period or until you delete them. They are used to remember your preferences for future visits.</li>
            <li><strong>Third-Party Cookies:</strong> Some cookies are placed by third-party services that appear on our pages, such as analytics providers and social media platforms.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Managing Cookies</h2>
          <p className="mb-4">
            You can control and manage cookies in various ways. Most browsers allow you to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>View the cookies stored on your device and delete them individually</li>
            <li>Block third-party cookies</li>
            <li>Block cookies from specific sites</li>
            <li>Block all cookies from being set</li>
            <li>Delete all cookies when you close your browser</li>
          </ul>
          <p className="mt-4">
            Please note that blocking or deleting cookies may impact your experience on our website, and some features may not function properly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Updates to This Policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this page periodically for the latest information on our cookie practices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
            <a href="mailto:hello@travelbuddy.com" className="text-amber-600 hover:text-amber-700 ml-1">hello@travelbuddy.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;
