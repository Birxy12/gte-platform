import { Shield, Eye, Lock, Share2, UserCheck, Scale, ChevronRight, Mail } from "lucide-react";
import { motion } from "framer-motion";
import "./landing/About.css";

const sections = [
  {
    id: "collection",
    icon: Eye,
    color: "blue",
    title: "Information Collection",
    desc: "We collect personal information such as your name, email address, and phone number when you register. We also gather usage data including IP addresses, browser types, and interaction logs to refine your platform experience."
  },
  {
    id: "usage",
    icon: Shield,
    color: "green",
    title: "Data Utilization",
    desc: "We use collected data to maintain and improve our services, personalize your learning journey, process secure payments, and comply with international digital education standards."
  },
  {
    id: "sharing",
    icon: Share2,
    color: "purple",
    title: "Third-Party Disclosure",
    desc: "Your privacy is paramount. We do not sell or rent personal data. We only share information with trusted infrastructure partners strictly necessary for platform operation, such as payment processors."
  },
  {
    id: "rights",
    icon: UserCheck,
    color: "amber",
    title: "Subject Access Rights",
    desc: "You retain full ownership of your data. You may access, verify, export, or request the permanent deletion of your profile and associated metadata at any time through your security settings."
  },
  {
    id: "security",
    icon: Lock,
    color: "blue",
    title: "Fortified Security",
    desc: "Utilizing industry-standard AES-256 encryption and multi-layer authentication, we shield your data from unauthorized access. We treat your digital footprint with the same rigor as our own proprietary intel."
  }
];

export default function PrivacyPolicy() {
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
            <Scale size={14} /> Legal Framework
          </motion.span>
          <h1>Privacy <span className="gradient-text">Protocols</span></h1>
          <p className="hero-subtitle">
            GlobixTech Enterprises (GTE) maintains the highest standard of data integrity.
            This framework details how we collect, safeguard, and utilize your digital footprint.
          </p>
          <motion.div 
            className="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <a href="mailto:globixtechinc@gmail.com" className="btn-primary">
              <Mail size={18} /> Contact Security Desk
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Policies Section */}
      <section className="differentiators-section">
        <div className="container mx-auto px-4">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">Our Commitment</span>
            <h2>Enterprise-Grade <span className="gradient-text">Assurance</span></h2>
            <p className="section-subtitle">
              We treat every packet of data with the same operational security as our internal tactical systems. Your privacy is not a feature, it is our baseline.
            </p>
          </motion.div>

          <motion.div 
            className="differentiators-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {sections.map((item, idx) => (
              <motion.div 
                key={item.id}
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

      {/* Footer Section */}
      <section className="cta-section" style={{ padding: '4rem 0' }}>
        <div className="cta-bg-pattern"></div>
        <motion.div 
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="trust-badges" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <span>© 2024 GlobixTech Enterprises</span>
            <span>Digital Identity Act Compliant</span>
            <span>Enterprise Encryption</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '600px', margin: '0 auto' }}>
            All communications on this platform are encrypted via military-grade protocols. 
            Metadata is scrubbed periodically to ensure anonymity.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
