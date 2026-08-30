import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthProvider';
import { enrollmentService } from '../../../services/enrollmentService';
import { Shield, Coins, CreditCard, Landmark, Phone, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedTopup, setSelectedTopup] = useState(null); // 'opay', 'paystack', 'bank'

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [courseSnap, userSnap] = await Promise.all([
          getDoc(doc(db, 'courses', courseId)),
          getDoc(doc(db, 'users', user.uid))
        ]);

        if (courseSnap.exists()) {
          setCourse({ id: courseSnap.id, ...courseSnap.data() });
        }
        if (userSnap.exists()) {
          setProfile(userSnap.data());
        }
      } catch (err) {
        console.error("Error loading checkout data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, courseId]);

  if (loading) {
    return (
      <div className="checkout-loading">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p>Securing connection...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="checkout-loading">
        <p className="text-red-400">Error: Course protocol not found.</p>
        <button onClick={() => navigate('/pricing')} className="mt-4 text-blue-400 hover:underline">Return to Pricing</button>
      </div>
    );
  }

  // Cost Logic: Assume 1 USD = 1 Coin for this implementation
  const coinCost = parseFloat(course.monthlyPrice || course.annualPrice || 0);
  const userCoins = profile?.coins || 0;
  const isSufficient = userCoins >= coinCost;

  const handleEnrollWithCoins = async () => {
    if (!isSufficient || processing) return;
    setProcessing(true);
    try {
      await enrollmentService.enrollInCourse(user.uid, course.id, coinCost);
      alert(`Success! Deducted ${coinCost} coins. Welcome to ${course.title}.`);
      navigate('/dashboard/enrolled');
    } catch (err) {
      console.error(err);
      alert(err.message || "Enrollment failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleMockTopup = (method) => {
    alert(`This will initiate the ${method} flow in a real production environment. API keys required.`);
  };

  return (
    <div className="checkout-page">
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <button onClick={() => navigate('/pricing')} className="checkout-back-btn">
          <ArrowLeft size={16} /> Back to Plans
        </button>

        <div className="checkout-grid">
          {/* Order Summary */}
          <div className="checkout-card order-summary">
            <h2 className="checkout-title">Checkout Protocol</h2>
            
            <div className="course-brief">
              <div className="course-icon"><Shield size={24} /></div>
              <div>
                <h3>{course.title || "Unknown Asset"}</h3>
                <p>Digital Intelligence Access</p>
              </div>
            </div>

            <div className="checkout-totals">
              <div className="total-row">
                <span>Asset Value</span>
                <span>{coinCost} 🪙</span>
              </div>
              <div className="total-row discount">
                <span>Platform Discount</span>
                <span>-0 🪙</span>
              </div>
              <div className="total-row final">
                <span>Total Required</span>
                <span className="text-blue-400 font-bold">{coinCost} 🪙</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="checkout-card payment-section">
            <div className="wallet-status">
              <div className="wallet-header">
                <h3>Vault Wallet</h3>
                <span className="balance-badge">
                  <Coins size={16} /> {userCoins} Coins
                </span>
              </div>
              
              {isSufficient ? (
                <div className="status-message success">
                  <CheckCircle2 size={20} />
                  <span>Sufficient funds available for clearance.</span>
                </div>
              ) : (
                <div className="status-message warning">
                  <AlertCircle size={20} />
                  <span>Insufficient Vault Coins. Top up required.</span>
                </div>
              )}
            </div>

            {isSufficient ? (
              <button 
                onClick={handleEnrollWithCoins} 
                disabled={processing}
                className="checkout-primary-btn"
              >
                {processing ? <Loader2 className="animate-spin" /> : "Authorize Clearance (Pay with Coins)"}
              </button>
            ) : (
              <div className="topup-options">
                <h4>Top Up Vault Balance</h4>
                <p className="topup-desc">Select a gateway to acquire the required {coinCost - userCoins} coins.</p>
                
                <div className="topup-methods">
                  <button 
                    className={`method-btn ${selectedTopup === 'paystack' ? 'active' : ''}`}
                    onClick={() => setSelectedTopup('paystack')}
                  >
                    <CreditCard size={20} />
                    <span>Paystack</span>
                  </button>
                  <button 
                    className={`method-btn ${selectedTopup === 'opay' ? 'active' : ''}`}
                    onClick={() => setSelectedTopup('opay')}
                  >
                    <Phone size={20} />
                    <span>Opay Transfer</span>
                  </button>
                  <button 
                    className={`method-btn ${selectedTopup === 'bank' ? 'active' : ''}`}
                    onClick={() => setSelectedTopup('bank')}
                  >
                    <Landmark size={20} />
                    <span>Direct Bank</span>
                  </button>
                </div>

                <AnimatePresenceTopup selected={selectedTopup} handleMockTopup={handleMockTopup} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimatePresenceTopup({ selected, handleMockTopup }) {
  if (!selected) return null;

  return (
    <div className="topup-action-box animate-fade-in">
      {selected === 'paystack' && (
        <div className="gateway-info">
          <p>Secure credit/debit card payment via Paystack.</p>
          <button className="gateway-btn" onClick={() => handleMockTopup('Paystack')}>Proceed to Paystack</button>
        </div>
      )}
      {selected === 'opay' && (
        <div className="gateway-info">
          <p>Instant transfer via Opay wallet. Fast and secure.</p>
          <button className="gateway-btn" onClick={() => handleMockTopup('Opay')}>Pay with Opay</button>
        </div>
      )}
      {selected === 'bank' && (
        <div className="gateway-info">
          <div className="bank-details">
            <p><strong>Bank:</strong> GlobixTech Financial</p>
            <p><strong>Account:</strong> 0123456789</p>
            <p><strong>Name:</strong> GlobixTech Academy</p>
          </div>
          <button className="gateway-btn" onClick={() => handleMockTopup('Bank Transfer')}>I have sent the funds</button>
        </div>
      )}
    </div>
  );
}
