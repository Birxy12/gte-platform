import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Pricing.css';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      icon: <Shield size={24} />,
      desc: "Perfect for exploring the platform and learning basics.",
      monthlyPrice: "0",
      annualPrice: "0",
      btnText: "Get Started for Free",
      btnClass: "btn-secondary",
      features: [
        "Access to beginner courses",
        "Community forum access",
        "Basic progress tracking",
        "Standard support"
      ]
    },
    {
      name: "Pro",
      icon: <Sparkles size={24} />,
      desc: "For serious learners wanting full access and certificates.",
      monthlyPrice: "29",
      annualPrice: "19",
      btnText: "Upgrade to Pro",
      btnClass: "btn-primary",
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited premium courses",
        "Official certificates of completion",
        "Offline downloading",
        "Globix AI Chatbot access",
        "Priority support"
      ]
    },
    {
      name: "Enterprise",
      icon: <Zap size={24} />,
      desc: "For teams and businesses looking to upskill their workforce.",
      monthlyPrice: "99",
      annualPrice: "79",
      btnText: "Contact Sales",
      btnClass: "btn-secondary",
      features: [
        "Everything in Pro",
        "Admin team dashboard",
        "Analytics and reporting",
        "Custom learning paths",
        "Single Sign-On (SSO)",
        "Dedicated success manager"
      ]
    }
  ];

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
        {plans.map((plan, idx) => (
          <motion.div 
            key={idx} 
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
        ))}
      </div>
    </div>
  );
}
