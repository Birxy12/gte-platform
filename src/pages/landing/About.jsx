import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Shield, Target, Zap, Users, ChevronRight, Award, Box, MessageSquare } from "lucide-react";
import "./About.css";
import { motion } from "framer-motion";

export default function About() {
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeadership = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "leadership"));
        const members = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLeadership(members.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (error) {
        console.error("Error fetching leadership:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeadership();
  }, []);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-4"
        >
          <span className="hero-badge">Established 2024</span>
          <h1>Empowering the Next Generation of <span className="gradient-text">Elite Engineers</span></h1>
          <p className="hero-subtitle">
            GTE Platform is a high-performance ecosystem designed to bridge the gap between 
            theoretical knowledge and tactical execution in modern software engineering.
          </p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="container mx-auto px-4">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Tactical Engineers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Mission Modules</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Mission Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Leadership Section */}
      <section className="bg-slate-950/20 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Strategic <span className="text-blue-500">Leadership</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Our elite unit consists of architectural pioneers committed to 
              redefining technical education through precision and engineering excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="leadership-card animate-pulse bg-slate-800/10 h-64 rounded-3xl border border-slate-800" />
              ))
            ) : leadership.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                    <Users size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 font-mono text-sm uppercase">Strategic unit protocols offline.</p>
                </div>
            ) : (
              leadership.map((member, idx) => (
                <motion.div 
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="leadership-card group"
                >
                  <div className="card-avatar">
                     <span className="font-black text-blue-500 text-3xl font-mono">{member.initials}</span>
                     <div className="avatar-ring" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{member.name}</h3>
                    <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-6">{member.role}</div>
                    <p className="text-sm text-slate-400 mb-8 leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                    <div className="flex justify-center gap-6 opacity-30 group-hover:opacity-100 transition-opacity">
                       <Shield size={18} className="text-slate-400" />
                       <Award size={18} className="text-slate-400" />
                       <Target size={18} className="text-slate-400" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="about-values py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="values-content">
              <h2 className="text-5xl font-black text-white mb-12 uppercase tracking-tighter">Our Core <span className="text-blue-500">Directives</span></h2>
              
              <div className="value-item group">
                <div className="value-icon group-hover:bg-blue-600/20 transition-colors"><Target className="text-blue-500" /></div>
                <div>
                  <h4 className="group-hover:text-blue-400 transition-colors">Precision Training</h4>
                  <p>Every module is optimized for high-retention learning and practical application in real-world scenarios.</p>
                </div>
              </div>

              <div className="value-item group">
                <div className="value-icon group-hover:bg-amber-600/20 transition-colors"><Zap className="text-amber-500" /></div>
                <div>
                  <h4 className="group-hover:text-amber-400 transition-colors">Agile Execution</h4>
                  <p>We believe in building and breaking things fast. Tactical engineering requires rapid iteration and mental fortitude.</p>
                </div>
              </div>

              <div className="value-item group">
                <div className="value-icon group-hover:bg-green-600/20 transition-colors"><Shield className="text-green-500" /></div>
                <div>
                  <h4 className="group-hover:text-green-400 transition-colors">Operational Security</h4>
                  <p>In the digital battlefield, security isn't an afterthought. We bake best practices into every engineering workflow.</p>
                </div>
              </div>
            </div>

            <div className="relative">
               <div className="visual-grid relative z-10">
                  <div className="visual-box !bg-blue-500/10 border border-blue-500/20"><Box size={48} className="text-blue-500" /></div>
                  <div className="visual-box !bg-amber-500/10 border border-amber-500/20"><Zap size={48} className="text-amber-500" /></div>
                  <div className="visual-box !bg-purple-500/10 border border-purple-500/20"><Users size={48} className="text-purple-500" /></div>
                  <div className="visual-box !bg-slate-900/30 border border-slate-800"><MessageSquare size={48} className="text-slate-500" /></div>
               </div>
               <div className="glow-effect" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
