import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Terminal, 
  Cpu, 
  Globe, 
  Zap, 
  Code2, 
  Layers,
  MonitorPlay,
  CheckCircle2,
  ChevronRight,
  Play,
  Users,
  BookOpen,
  Award,
  Heart,
  Shield,
  Star
} from "lucide-react";
import "./About.css";

const techStack = [
  "React 19", "Next.js 15", "TypeScript", "Node.js",
  "Python", "AWS Cloud", "Docker", "Kubernetes", "PostgreSQL", "PyTorch"
];

const learningTracks = [
  {
    id: "frontend",
    title: "Frontend Engineering",
    Icon: Layers,
    badge: "Popular",
    modules: 14,
    skills: ["React 19", "Next.js", "TypeScript", "Tailwind v4"],
    description: "Master modern component architecture, state management patterns, and high-performance Web applications.",
    color: "blue"
  },
  {
    id: "backend",
    title: "Backend & Systems Architecture",
    Icon: Cpu,
    badge: "Core Track",
    modules: 12,
    skills: ["Node.js", "Python", "PostgreSQL", "gRPC & Kafka"],
    description: "Design and scale fault-tolerant distributed services, low-latency REST/GraphQL APIs, and relational databases.",
    color: "amber"
  },
  {
    id: "cloud",
    title: "Cloud Infrastructure & DevOps",
    Icon: Globe,
    badge: "Enterprise",
    modules: 10,
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD Pipelines"],
    description: "Architect automated multi-region deployments, container orchestration, and zero-trust cloud infrastructure.",
    color: "green"
  },
  {
    id: "ai",
    title: "AI Engineering & Security",
    Icon: Zap,
    badge: "Advanced",
    modules: 16,
    skills: ["LLM Agents", "PyTorch", "Penetration Testing"],
    description: "Build autonomous AI applications, fine-tune neural models, and secure enterprise applications against vulnerabilities.",
    color: "purple"
  }
];

const stats = [
  { value: 0, target: 14500, suffix: "+", label: "Active Engineers", Icon: Users },
  { value: 0, target: 500, suffix: "+", label: "Master Lessons", Icon: BookOpen },
  { value: 0, target: 99, suffix: "%", label: "Satisfaction Rate", Icon: Star },
  { value: 0, target: 50, suffix: "+", label: "Countries", Icon: Globe }
];

const testimonials = [
  {
    quote: "The interactive sandboxes completely changed how I learn architecture. No more 'works on my machine' issues.",
    initials: "JD",
    author: "Jessica D.",
    role: "Senior Backend Engineer"
  },
  {
    quote: "Best learning platform for modern cloud infrastructure. The Kubernetes modules are insanely detailed.",
    initials: "MR",
    author: "Marcus R.",
    role: "DevOps Lead"
  },
  {
    quote: "Tailwind v4 integration was flawless. GTE Platform helps me iterate faster on frontend tasks.",
    initials: "AL",
    author: "Alex L.",
    role: "Frontend Specialist"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [animatedStats, setAnimatedStats] = useState(stats);
  const statsRef = useRef(null);

  // Stat Counter Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const duration = 1600;
          const steps = 40;
          const interval = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setAnimatedStats(prev => prev.map(stat => ({
              ...stat,
              value: Math.floor(stat.target * easeOut)
            })));
            if (step >= steps) clearInterval(timer);
          }, interval);
        }
      },
      { threshold: 0.25 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">

      {/* ── HERO ── */}
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span className="flex size-2 rounded-full bg-blue-400 animate-pulse" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa' }} />
              Tailwind CSS v4 Engine Live
            </span>
          </motion.span>

          <h1>
            Engineer Your Future with{" "}
            <span className="gradient-text">Elite Precision</span>
          </h1>

          <p className="hero-subtitle">
            Accelerate your engineering career with interactive code sandboxes, 
            HD architectural breakdowns, and real-time squad comms. 
            Built for the modern developer.
          </p>

          <motion.div
            className="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link to={user ? "/dashboard" : "/register"} className="btn-primary">
              Start Coding Free <ChevronRight size={18} />
            </Link>
            <Link to="/courses" className="btn-secondary">
              <Play size={16} /> View Curriculum
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── TECH TICKER ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', padding: '1.5rem 0', overflow: 'hidden', display: 'flex', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', animation: 'slide 30s linear infinite', gap: '3rem', paddingLeft: '1.5rem' }}>
          {[...techStack, ...techStack].map((tech, i) => (
            <span key={i} style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={14} style={{ color: '#818cf8' }} /> {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="about-stats" ref={statsRef}>
        <div className="container mx-auto px-4">
          <motion.div
            className="stats-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {animatedStats.map((stat, idx) => {
              const colorMap = ['blue', 'purple', 'green', 'amber'];
              return (
                <motion.div className="stat-card" variants={itemVariants} key={idx}>
                  <div className={`stat-icon-wrapper ${colorMap[idx]}`}>
                    <stat.Icon size={24} />
                  </div>
                  <div className="stat-number">{stat.value.toLocaleString()}{stat.suffix}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── LEARNING TRACKS ── */}
      <section className="differentiators-section">
        <div className="container mx-auto px-4">
          <motion.div
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">Engineering Tracks</span>
            <h2>Curated <span className="gradient-text">Learning Paths</span></h2>
            <p className="section-subtitle">Progress from fundamentals to advanced distributed systems.</p>
          </motion.div>

          <motion.div
            className="differentiators-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {learningTracks.map((track, idx) => (
              <motion.div
                key={track.id}
                className={`diff-card ${track.color}`}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className={`diff-icon ${track.color}`}>
                  <track.Icon size={28} />
                </div>
                <h4>{track.title}</h4>
                <p>{track.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {track.skills.map((skill, i) => (
                    <span key={i} style={{ padding: '3px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', fontSize: '11px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                  <MonitorPlay size={14} /> {track.modules} Modules
                  <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{track.badge}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="differentiators-section" style={{ paddingTop: '4rem' }}>
        <div className="container mx-auto px-4">
          <motion.div
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">Testimonials</span>
            <h2>Trusted by Engineers <span className="gradient-text">World Wide</span></h2>
          </motion.div>

          <motion.div
            className="differentiators-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                className="diff-card blue"
                variants={itemVariants}
                style={{ justifyContent: 'space-between' }}
              >
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>{t.author}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
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
            <Link to={user ? "/dashboard" : "/register"} className="btn-primary large">
              Start Learning Free <ChevronRight size={20} />
            </Link>
            <Link to="/courses" className="btn-secondary large">
              View Curriculum
            </Link>
          </div>
          <div className="trust-badges">
            <span><Heart size={14} /> Loved by 10,000+ students</span>
            <span><Award size={14} /> Industry recognized</span>
            <span><Shield size={14} /> Secure & private</span>
          </div>
        </motion.div>
      </section>

      <style>{`
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
