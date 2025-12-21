import React from 'react';

const CommunityGuidelines = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Community Guidelines</h1>

      <div className="prose prose-amber max-w-none text-gray-600">
        <p className="mb-6">
          TravelBuddy is built on trust, respect, and a shared love for travel. These guidelines help ensure a positive experience for everyone.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Respect Each Other</h2>
          <p className="mb-4">
            Treat everyone with respect. Harassment, hate speech, and discrimination of any kind are not tolerated.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Safety First</h2>
          <p className="mb-4">
            Prioritize your safety and the safety of others. Do not share personal financial information or private addresses until you are comfortable and have verified your travel buddy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Be Authentic</h2>
          <p className="mb-4">
            Use your real name and photos. Misrepresentation or impersonation is strictly prohibited.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Keep it Relevant</h2>
          <p className="mb-4">
            Post content that is relevant to travel and finding travel companions. Spam and unrelated promotional content will be removed.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CommunityGuidelines;
