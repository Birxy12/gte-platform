import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Pricing.css';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const courseData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.title || "Untitled Course",
            icon: <Sparkles size={24} />, // Default icon
            desc: data.description || "No description provided.",
            monthlyPrice: data.monthlyPrice || "0",
            annualPrice: data.annualPrice || "0",
            btnText: "Enroll Now",
            btnClass: "btn-secondary",
            features: [
              "Full course access",
              "Practice datasets",
              "Official certificate",
              "Community support"
            ]
          };
        });
        
        // Let's sort them nicely or just use as is
        setPlans(courseData);
      } catch (err) {
        console.error("Error fetching courses for pricing:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Invest in Your Career with <span>GlobixTech</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Choose the perfect plan to accelerate your learning journey. Upgrade anytime as your ambitions grow.
        </motion.p>
        
        <div className="pricing-toggle">
          <span className={`toggle-label ${!isAnnual ? 'active' : ''}`}>Monthly</span>
          <div 
            className={`toggle-switch ${isAnnual ? 'annual' : ''}`}
            onClick={() => setIsAnnual(!isAnnual)}
          ></div>
          <span className={`toggle-label ${isAnnual ? 'active' : ''}`}>Annually</span>
          <AnimatePresence>
            {isAnnual && (
              <motion.span 
                className="save-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                Save up to 34%
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="pricing-grid">
        {loading ? (
          <div className="w-full text-center py-12 text-slate-400">Loading course pricing...</div>
        ) : plans.length === 0 ? (
          <div className="w-full text-center py-12 text-slate-400">No courses available currently.</div>
        ) : (
          plans.map((plan, idx) => (
            <motion.div 
              key={plan.id || idx} 
            className={`pricing-card ${plan.popular ? 'popular' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            
            <div className="card-header">
              <div className="tier-icon">{plan.icon}</div>
              <h2 className="tier-name">{plan.name}</h2>
              <p className="tier-desc">{plan.desc}</p>
              
              <div className="tier-price">
                <span className="currency">$</span>
                <AnimatePresence mode='wait'>
                  <motion.span 
                    key={isAnnual ? 'annual' : 'monthly'}
                    className="amount"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </motion.span>
                </AnimatePresence>
                <span className="period">/mo</span>
              </div>
              {isAnnual && plan.annualPrice !== "0" && (
                <div style={{color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem'}}>
                  Billed ${plan.annualPrice * 12} annually
                </div>
              )}
            </div>

            <div className="card-features">
              {plan.features.map((feature, fIdx) => (
                <div key={fIdx} className="feature-item">
                  <Check size={20} className="feature-icon" />
                  <span className="feature-text">{feature}</span>
                </div>
              ))}
            </div>

            <Link to={plan.btnText === "Contact Sales" ? "/contact" : "/register"} className={plan.btnClass}>
              {plan.btnText}
            </Link>
          </motion.div>
        )))}
      </div>
    </div>
  );
}
