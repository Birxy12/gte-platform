import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exchange rate USD to NGN
  const NGN_RATE = 1500;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const courseData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const monthlyUSD = parseFloat(data.monthlyPrice || 0);
          const annualUSD = parseFloat(data.annualPrice || 0);

          return {
            id: doc.id,
            name: data.title || "Untitled Course",
            monthlyUSD,
            annualUSD,
            monthlyNGN: (monthlyUSD * NGN_RATE).toLocaleString(),
            annualNGN: (annualUSD * NGN_RATE).toLocaleString(),
            features: [
              "Full course access",
              "Practice datasets",
              "Official certificate",
              "Community support"
            ]
          };
        });
        
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
    <div className="min-h-screen bg-[#080c14] text-white pt-48 pb-32 relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
          >
            <Sparkles size={14} /> Flexible Pricing
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Career</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg"
          >
            Choose the perfect plan to accelerate your learning journey. Start building your future today.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mt-10"
          >
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-8 rounded-full bg-slate-800 border border-white/10 transition-colors duration-300 hover:border-white/20"
            >
              <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-semibold transition-colors flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-slate-500'}`}>
              Annually
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider">Save 20%</span>
            </span>
          </motion.div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
              Loading courses...
            </div>
          ) : plans.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
              No courses available right now.
            </div>
          ) : (
            plans.map((plan, idx) => {
              const currentUSD = isAnnual ? plan.annualUSD : plan.monthlyUSD;
              const currentNGN = isAnnual ? plan.annualNGN : plan.monthlyNGN;
              const billingText = isAnnual ? 'per year' : 'per month';

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="relative group rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:bg-slate-900/80 hover:border-blue-400/50 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_80px_rgba(59,130,246,0.6)] z-10 hover:z-20 overflow-hidden"
                >
                  {/* Torchlight Top Accent */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_30px_rgba(59,130,246,1)]" />
                  
                  {/* Internal Glow Effect */}
                  <div className="absolute -inset-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="mb-8 relative z-10">
                    <h3 className="text-xl font-bold text-white mb-6 group-hover:text-blue-300 transition-colors duration-300">{plan.name}</h3>
                    
                    {/* Price Block */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-blue-500/70 group-hover:text-blue-400 transition-colors">$</span>
                        <AnimatePresence mode='wait'>
                          <motion.span
                            key={currentUSD}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-5xl font-black text-white tracking-tight drop-shadow-md"
                          >
                            {currentUSD}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-sm font-bold border border-emerald-500/20 group-hover:border-emerald-400/40 group-hover:bg-emerald-500/20 transition-colors shadow-[0_0_10px_rgba(16,185,129,0)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          ₦{currentNGN}
                        </span>
                        <span className="text-slate-500 text-sm font-medium group-hover:text-slate-400 transition-colors">{billingText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 relative z-10">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300 text-sm group-hover:text-white transition-colors duration-300">
                          <div className="p-0.5 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all mt-0.5">
                            <Check size={14} strokeWidth={3} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Link 
                    to="/register"
                    className="relative z-10 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/5 hover:bg-blue-600 text-white font-bold border border-white/10 hover:border-blue-400 transition-all duration-300 group-hover:bg-blue-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                  >
                    Enroll Now
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
