import axios from 'axios';
import { useCallback,useEffect, useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Star Rating Component with animation
const StarRating = ({ rating, setRating, disabled }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="star-rating-container">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setRating(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          disabled={disabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={star <= (hoverRating || rating) ? "0" : "1.5"}
            className="star-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
};

const RateGuide = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [bookingInfo, setBookingInfo] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const fetchBookingInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/guides/rate/${token}`);
      setBookingInfo(response.data.data);
      setError(null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError({ type: 'invalid', message: 'This rating link is invalid or has already been used.' });
      } else if (status === 410) {
        setError({ type: 'expired', message: 'This rating link has expired. Links are valid for 7 days.' });
      } else if (status === 400) {
        setError({ type: 'reviewed', message: 'You have already submitted a review for this booking.' });
      } else {
        setError({ type: 'error', message: 'Something went wrong. Please try again later.' });
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookingInfo();
  }, [fetchBookingInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (comment.trim().length < 5) {
      alert('Please write a comment (at least 5 characters)');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE_URL}/guides/rate/${token}`, {
        rating,
        comment: comment.trim(),
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="rate-guide-container">
        <div className="rate-guide-card loading-card">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rate-guide-container">
        <div className="rate-guide-card error-card">
          <div className="error-icon">
            {error.type === 'expired' ? '⏰' : error.type === 'reviewed' ? '✅' : '❌'}
          </div>
          <h2>{error.type === 'reviewed' ? 'Already Reviewed' : 'Unable to Rate'}</h2>
          <p>{error.message}</p>
          <button className="home-btn" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rate-guide-container">
        <div className="rate-guide-card success-card">
          <div className="success-icon">🎉</div>
          <h2>Thank You!</h2>
          <p>Your review has been submitted successfully.</p>
          <p className="success-subtext">Your feedback helps other travelers find great guides!</p>
          <button className="home-btn" onClick={() => navigate('/')}>
            Explore TravelBuddy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rate-guide-container">
      <style>{`
        .rate-guide-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 20px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .rate-guide-card {
          background: white;
          border-radius: 24px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .loading-card, .error-card, .success-card {
          text-align: center;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-icon, .success-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .error-card h2, .success-card h2 {
          color: #1a1a2e;
          margin-bottom: 12px;
        }

        .error-card p, .success-card p {
          color: #64748b;
          margin-bottom: 24px;
        }

        .success-subtext {
          font-size: 14px !important;
          color: #94a3b8 !important;
        }

        .home-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .home-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .guide-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .guide-image {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #667eea;
          margin-bottom: 16px;
        }

        .guide-name {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 8px;
        }

        .trip-dates {
          color: #64748b;
          font-size: 14px;
        }

        .rating-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .rating-label {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 16px;
        }

        .star-rating-container {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          transition: transform 0.2s;
        }

        .star-btn:hover:not(.disabled) {
          transform: scale(1.2);
        }

        .star-btn.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .star-icon {
          width: 48px;
          height: 48px;
          color: #fbbf24;
          transition: all 0.2s;
        }

        .star-btn:not(.active) .star-icon {
          color: #cbd5e1;
        }

        .comment-section {
          margin-bottom: 24px;
        }

        .comment-label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 8px;
        }

        .comment-textarea {
          width: 100%;
          min-height: 120px;
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .branding {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .branding-text {
          color: #94a3b8;
          font-size: 14px;
        }

        .branding-logo {
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="rate-guide-card">
        <div className="guide-header">
          <img
            src={bookingInfo.guideImage || 'https://via.placeholder.com/100?text=Guide'}
            alt={bookingInfo.guideName}
            className="guide-image"
          />
          <h1 className="guide-name">{bookingInfo.guideName}</h1>
          <p className="trip-dates">
            🗓️ {formatDate(bookingInfo.startDate)} - {formatDate(bookingInfo.endDate)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rating-section">
            <p className="rating-label">How was your experience?</p>
            <StarRating rating={rating} setRating={setRating} disabled={submitting} />
          </div>

          <div className="comment-section">
            <label className="comment-label">Share your experience</label>
            <textarea
              className="comment-textarea"
              placeholder="Tell us about your trip... What did you enjoy? Would you recommend this guide?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting || rating === 0}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        <div className="branding">
          <p className="branding-text">
            Powered by <span className="branding-logo">✈️ TravelBuddy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RateGuide;
