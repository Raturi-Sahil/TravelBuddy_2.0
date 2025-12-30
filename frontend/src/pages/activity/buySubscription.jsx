import React, { useState, useEffect } from 'react';
import { Check, X, Star, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buySubscription } from '../../redux/slices/userSlice';
import { useAppDispatch } from '../../redux/hooks';
import { useAuth } from '@clerk/clerk-react';
import { load } from '@cashfreepayments/cashfree-js';
import toast from 'react-hot-toast';

const BuySubscription = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
  const [selectedPlan, setSelectedPlan] = useState('Monthly');
  const dispatch = useAppDispatch();
  const { getToken } = useAuth();

  let cashfree;
  useEffect(() => {
    const initializeSDK = async () => {
        cashfree = await load({
            mode: "sandbox" // Change to "production" for live
        });
    };
    initializeSDK();
  }, []);

  const plans = [
    {
      name: 'Free Trial',
      price: 0,
      period: '/ one time',
      description: 'Experience TravelBuddy risk-free',
      id: 'free_trial',
      features: [
        { name: 'Create 1 activity for free', included: true },
        { name: 'Available only once per user', included: true },
        { name: 'No payment required', included: true },
        { name: 'Standard visibility', included: true },
        { name: 'Basic support', included: true },
      ],
      popular: false
    },
    {
      name: 'One-Time Activity',
      price: 99,
      period: '/ activity',
      description: 'Ideal for occasional users',
      id: 'single',
      features: [
        { name: 'Create single activity', included: true },
        { name: 'No recurring charges', included: true },
        { name: 'Pay once, host once', included: true },
        { name: 'Standard visibility', included: true },
        { name: 'Standard support', included: true },
      ],
      popular: false
    },
    {
      name: billingCycle === 'monthly' ? 'Monthly' : 'Yearly',
      id: billingCycle === 'monthly' ? 'monthly' : 'yearly',
      price: billingCycle === 'monthly' ? 499 : 4999,
      period: billingCycle === 'monthly' ? '/ month' : '/ year',
      description: billingCycle === 'monthly' ? 'Best suited for frequent users' : 'Best value offer',
      features: [
        { name: billingCycle === 'monthly' ? 'Valid for 30 days' : 'Valid for 12 months', included: true },
        { name: 'Unlimited activity creation', included: true },
        { name: 'Verified badge', included: true },
        { name: 'Priority support', included: true },
        { name: 'Premium visibility', included: true },
      ],
      popular: true
    }
  ];

  const handleSubscribe = async (plan) => {
    if (plan.price === 0) {
        toast.success("Free trial activated!");
        navigate('/create-activity');
        return;
    }

    try {
      const result = await dispatch(buySubscription({
          getToken,
          amount: plan.price,
          planType: plan.name
      })).unwrap();

      if (result && result.payment_session_id) {
          const checkoutOptions = {
              paymentSessionId: result.payment_session_id,
              redirectTarget: "_self",
          };
          if (cashfree) {
            cashfree.checkout(checkoutOptions);
          } else {
             // Fallback if cashfree didn't load yet
             const cf = await load({ mode: "sandbox" });
             cf.checkout(checkoutOptions);
          }
      } else {
          toast.error("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center font-sans overflow-hidden relative">

      {/* Background Blobs for specific aesthetic */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <h2 className="text-amber-500 font-semibold tracking-wide uppercase text-sm mb-2">Pricing Plans</h2>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Select The Best Plan <br/> For Your Needs
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Unlock premium features and take your travel experiences to the next level.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none ${billingCycle === 'yearly' ? 'bg-amber-600' : 'bg-gray-300'}`}
          >
            <span
              className={`${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Yearly <span className="text-amber-500 text-xs ml-1 font-bold">(Save 20%)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl relative z-10 px-4">
        {plans.map((plan, index) => (
          <div
            key={plan.name}
            onClick={() => setSelectedPlan(plan.name)}
            className={`relative flex flex-col rounded-3xl p-8 shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-xl border border-white/20
              ${selectedPlan === plan.name
                ? 'bg-white/60 dark:bg-gray-800/60 ring-4 ring-amber-500/50 scale-105 z-10 shadow-amber-500/20'
                : 'bg-white/40 dark:bg-gray-800/40 hover:-translate-y-2 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }
            `}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{plan.description}</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">₹{plan.price}</span>
                <span className="text-gray-500 ml-1">{plan.period}</span>
              </div>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-sm">
                  {feature.included ? (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-3 text-amber-600 dark:text-amber-400">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 text-gray-400">
                       <X className="w-4 h-4" />
                    </div>
                  )}
                  <span className={`${feature.included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 line-through'}`}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSubscribe(plan);
              }}
              className={`w-full py-4 px-6 rounded-xl font-bold text-center transition-transform active:scale-95 shadow-lg ${
                selectedPlan === plan.name
                  ? `bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 hover:shadow-amber-500/30`
                  : 'bg-white text-gray-900 border-2 border-gray-100 hover:border-amber-200 hover:bg-amber-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              My Plan
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Section similar to design */}
      <div className="mt-20 relative z-10 w-full max-w-4xl mx-auto bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl p-8 border border-white/20">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
               <h4 className="text-xl font-bold text-gray-900 dark:text-white">Enterprise & Custom Solutions</h4>
               <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Need a specialized plan for your large agency? Let's talk.</p>
            </div>
            <button className="px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
               Contact Sales
            </button>
         </div>
      </div>
    </div>
  );
};

export default BuySubscription;
