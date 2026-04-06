import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Shield, Target, Zap, Users, ChevronRight, Award, Box, MessageSquare, Rocket, Globe, BookOpen, Heart, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import "./About.css";
import { motion } from "framer-motion";

const milestones = [
  { year: "2024", title: "Platform Founded", desc: "GTE Portal launched with a mission to transform tech education", icon: Rocket },
  { year: "2024 Q2", title: "First 1,000 Engineers", desc: "Reached our first milestone of trained tactical engineers", icon: Users },
  { year: "2024 Q4", title: "Global Expansion", desc: "Expanded to 50+ countries with localized content", icon: Globe },
  { year: "2025", title: "AI Integration", desc: "Launched AI-powered personalized learning paths", icon: Zap },
  { year: "2026", title: "Future Vision", desc: "Targeting 100,000+ engineers and enterprise partnerships", icon: TrendingUp }
];

const differentiators = [
  {
    icon: Box,
    title: "Project-Based Learning",
    desc: "Build real-world applications, not just theoretical knowledge. Every course includes hands-on projects for your portfolio.",
    color: "blue"
  },
  {
    icon: Shield,
    title: "Industry Standards",
    desc: "Curriculum designed with top tech companies. Learn the exact skills employers are looking for right now.",
    color: "amber"
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    desc: "Get guidance from engineers at Google, Microsoft, Amazon, and other leading tech companies.",
    color: "green"
  }
];

export default function About() {
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMilestone, setActiveMilestone] = useState(0);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-bg-glow"></div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4"
        >
          <motion.span 
            className="hero-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Calendar size={14} /> Established 2024
          </motion.span>
          <h1>Empowering the Next Generation of <span className="gradient-text">Elite Engineers</span></h1>
          <p className="hero-subtitle">
            GTE Platform is a high-performance ecosystem designed to bridge the gap between 
            theoretical knowledge and tactical execution in modern software engineering.
          </p>
          <motion.div 
            className="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <a href="/courses" className="btn-primary">
              Explore Courses <ChevronRight size={18} />
            </a>
            <a href="/contact" className="btn-secondary">
              Contact Us
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="container mx-auto px-4">
          <motion.div 
            className="stats-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="stat-icon-wrapper blue">
                <Users size={24} />
              </div>
              <div className="stat-number">10k+</div>
              <div className="stat-label">Tactical Engineers</div>
            </motion.div>
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="stat-icon-wrapper purple">
                <BookOpen size={24} />
              </div>
              <div className="stat-number">50+</div>
              <div className="stat-label">Mission Modules</div>
            </motion.div>
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="stat-icon-wrapper green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-number">98%</div>
              <div className="stat-label">Mission Success Rate</div>
            </motion.div>
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="stat-icon-wrapper amber">
                <Globe size={24} />
              </div>
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries Reached</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section">
        <div className="container mx-auto px-4">
          <div className="mission-vision-grid">
            <motion.div 
              className="mission-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="card-header">
                <Target className="icon-mission" size={32} />
                <h3>Our Mission</h3>
              </div>
              <p>
                To democratize elite engineering education by providing accessible, 
                high-intensity training that transforms beginners into job-ready 
                professionals through tactical, hands-on learning experiences.
              </p>
              <div className="card-accent blue"></div>
            </motion.div>

            <motion.div 
              className="vision-card"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="card-header">
                <Rocket className="icon-vision" size={32} />
                <h3>Our Vision</h3>
              </div>
              <p>
                To become the world's leading platform for engineering excellence, 
                creating a global community of tactical engineers who drive innovation 
                and shape the future of technology across every industry.
              </p>
              <div className="card-accent purple"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="differentiators-section">
        <div className="container mx-auto px-4">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">Why Choose Us</span>
            <h2>What Makes Us <span className="gradient-text">Different</span></h2>
            <p className="section-subtitle">We don't just teach code. We engineer success.</p>
          </motion.div>

          <motion.div 
            className="differentiators-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {differentiators.map((item, idx) => (
              <motion.div 
                key={idx}
                className={`diff-card ${item.color}`}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className={`diff-icon ${item.color}`}>
                  <item.icon size={28} />
                </div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="timeline-section">
        <div className="container mx-auto px-4">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">Our Journey</span>
            <h2>The Road to <span className="gradient-text">Excellence</span></h2>
          </motion.div>

          <div className="timeline-container">
            <div className="timeline-line"></div>
            {milestones.map((milestone, idx) => (
              <motion.div 
                key={idx}
                className={`timeline-item ${idx % 2 === 0 ? 'left' : 'right'}`}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onMouseEnter={() => setActiveMilestone(idx)}
              >
                <div className={`timeline-content ${activeMilestone === idx ? 'active' : ''}`}>
                  <div className="timeline-icon">
                    <milestone.icon size={20} />
                  </div>
                  <span className="timeline-year">{milestone.year}</span>
                  <h4>{milestone.title}</h4>
                  <p>{milestone.desc}</p>
                </div>
                <div className="timeline-dot"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Leadership Section */}
      <section className="leadership-section">
        <div className="container mx-auto px-4">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">The Team</span>
            <h2>Strategic <span className="gradient-text">Leadership</span></h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Our elite unit consists of architectural pioneers committed to 
              redefining technical education through precision and engineering excellence.
            </p>
          </motion.div>

          <div className="leadership-grid">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="leadership-skeleton" />
              ))
            ) : leadership.length === 0 ? (
              <div className="empty-state">
                <Users size={48} className="empty-icon" />
                <p>Strategic unit protocols offline.</p>
              </div>
            ) : (
              leadership.map((member, idx) => (
                <motion.div 
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="leadership-card"
                >
                  <div className="card-glow"></div>
                  <div className="card-avatar">
                    <span>{member.initials}</span>
                  </div>
                  <h3>{member.name}</h3>
                  <div className="role-badge">{member.role}</div>
                  <p className="bio">{member.bio}</p>
                  <div className="social-links">
                    <Shield size={16} />
                    <Award size={16} />
                    <Target size={16} />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="values-section">
        <div className="container mx-auto px-4">
          <div className="values-grid">
            <motion.div 
              className="values-content"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-badge">Our Principles</span>
              <h2>Our Core <span className="gradient-text">Directives</span></h2>
              
              <div className="value-list">
                <motion.div 
                  className="value-item"
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="value-icon blue">
                    <Target size={24} />
                  </div>
                  <div>
                    <h4>Precision Training</h4>
                    <p>Every module is optimized for high-retention learning and practical application in real-world scenarios.</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="value-item"
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="value-icon amber">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h4>Agile Execution</h4>
                    <p>We believe in building and breaking things fast. Tactical engineering requires rapid iteration and mental fortitude.</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="value-item"
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="value-icon green">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4>Operational Security</h4>
                    <p>In the digital battlefield, security isn't an afterthought. We bake best practices into every engineering workflow.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="values-visual"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="visual-grid">
                <div className="visual-box blue">
                  <Box size={40} />
                </div>
                <div className="visual-box amber">
                  <Zap size={40} />
                </div>
                <div className="visual-box purple">
                  <Users size={40} />
                </div>
                <div className="visual-box dark">
                  <MessageSquare size={40} />
                </div>
              </div>
              <div className="glow-effect"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-bg-pattern"></div>
        <motion.div 
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Join the <span className="gradient-text">Elite</span>?</h2>
          <p>Start your journey today. No prior experience required—just determination and curiosity.</p>
          <div className="cta-buttons">
            <a href="/register" className="btn-primary large">
              Start Learning Free <ChevronRight size={20} />
            </a>
            <a href="/courses" className="btn-secondary large">
              View Curriculum
            </a>
          </div>
          <div className="trust-badges">
            <span><Heart size={14} /> Loved by 10,000+ students</span>
            <span><Award size={14} /> Industry recognized</span>
            <span><Shield size={14} /> Secure & private</span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
