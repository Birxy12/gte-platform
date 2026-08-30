import { motion } from "framer-motion";
import { Cookie, Briefcase, AlertTriangle, ShieldCheck, Zap, Gavel, Mail, Scale } from "lucide-react";
import "./landing/About.css";

const sections = [
  {
    id: "acceptance",
    icon: ShieldCheck,
    color: "purple",
    title: "Operational Acceptance",
    desc: "By accessing the GTE Platform, you confirm that you are at least 16 years of age and agree to be bound by these Operational Directives. Failure to comply results in immediate termination of clearance."
  },
  {
    id: "cookies",
    icon: Cookie,
    color: "amber",
    title: "Tracking & Identifiers",
    desc: "We utilize session identifiers (cookies) to maintain your tactical state. By proceeding, you consent to our data collection protocols as outlined in the Privacy Policy."
  },
  {
    id: "ip",
    icon: Briefcase,
    color: "blue",
    title: "Proprietary Intel",
    desc: "All platform assets — including course materials, tactical videos, and encryption keys — are the exclusive intellectual property of GlobixTech Enterprises (GTE)."
  },
  {
    id: "conduct",
    icon: AlertTriangle,
    color: "purple", // Using available CSS classes from About.css (blue, green, amber, purple)
    title: "Prohibited Actions",
    desc: "Impersonation, transmission of unauthorized malware, or any attempt to breach GTE firewall systems is strictly prohibited and subject to legal intervention."
  },
  {
    id: "accounts",
    icon: Gavel,
    color: "green",
    title: "Account Integrity",
    desc: "You are solely responsible for your credentials. GTE reserves the right to scrub any account found in violation of security protocols or engagement rules."
  }
];

export default function TermsOfService() {
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
            <Zap size={14} /> Operational Directive 104-B
          </motion.span>
          <h1>Terms of <span className="gradient-text">Engagement</span></h1>
          <p className="hero-subtitle">
            These directives govern your deployment within the GTE ecosystem. 
            By initializing your session, you accept the following terms in their entirety.
          </p>
          <motion.div 
            className="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <a href="mailto:globixtechinc@gmail.com" className="btn-primary">
              <Mail size={18} /> Contact Legal Command
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Directives Section */}
      <section className="differentiators-section">
        <div className="container mx-auto px-4">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">Directives</span>
            <h2>Rules of <span className="gradient-text">Engagement</span></h2>
            <p className="section-subtitle">
              Breaching these directives results in immediate asset liquidation and permanent network ban.
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
            <span>Protocol: GTE-TERMS-V4</span>
            <span>Strict Compliance Active</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '600px', margin: '0 auto' }}>
            All platform assets are the exclusive intellectual property of GlobixTech Enterprises.
            Impersonation or unauthorized access will be pursued to the fullest extent of the law.
          </p>
        </motion.div>
      </section>
    </div>
  );
}