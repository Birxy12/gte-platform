import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, Lock, Share2, UserCheck, AlertTriangle, Mail, ChevronRight, Scale } from "lucide-react";
import { useState } from "react";

const sections = [
  {
    id: "collection",
    icon: Eye,
    color: "#3b82f6",
    title: "Information Collection",
    content: "We collect personal information such as your name, email address, and phone number when you register. We also gather usage data including IP addresses, browser types, and interaction logs to refine your platform experience."
  },
  {
    id: "usage",
    icon: Shield,
    color: "#10b981",
    title: "Data Utilization",
    content: "We use collected data to maintain and improve our services, personalize your learning journey, process secure payments, and comply with international digital education standards."
  },
  {
    id: "sharing",
    icon: Share2,
    color: "#8b5cf6",
    title: "Third-Party Disclosure",
    content: "Your privacy is paramount. We do not sell or rent personal data. We only share information with trusted infrastructure partners strictly necessary for platform operation, such as payment processors."
  },
  {
    id: "rights",
    icon: UserCheck,
    color: "#f59e0b",
    title: "Subject Access Rights",
    content: "You retain full ownership of your data. You may access, verify, export, or request the permanent deletion of your profile and associated metadata at any time through your security settings."
  },
  {
    id: "security",
    icon: Lock,
    color: "#06b6d4",
    title: "Fortified Security",
    content: "Utilizing industry-standard AES-256 encryption and multi-layer authentication, we shield your data from unauthorized access. We treat your digital footprint with the same rigor as our own proprietary intel."
  }
];

export default function PrivacyPolicy() {
  const [hoveredSection, setHoveredSection] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative pt-32 pb-24 px-6 max-w-6xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-500 mb-12"
        >
          <Scale size={16} />
          <span>Legal Framework</span>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-slate-500">Privacy Protocols</span>
        </motion.div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter mb-8">
              Privacy <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Protocols
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-lg mb-8">
               GlobixTech Enterprises (GTE) maintains the highest standard of data integrity.
               This framework details how we collect, safeguard, and utilize your digital footprint.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 w-fit backdrop-blur-xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-sm font-bold text-slate-200">System Version 4.2 (Active)</span>
                <span className="text-xs text-slate-500 ml-4">Updated: Jan 2024</span>
            </div>
          </motion.div>

          <motion.div 
            className="lg:pt-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-500/20 to-transparent">
              <div className="bg-[#0f172a]/80 backdrop-blur-3xl rounded-[2.3rem] p-8 border border-white/5 shadow-2xl">
                <Shield className="text-blue-500 mb-6" size={48} strokeWidth={1} />
                <h3 className="text-2xl font-bold text-white mb-4">Enterprise-Grade Assurance</h3>
                <p className="text-slate-400 leading-relaxed mb-6 italic">
                  "We treat every packet of data with the same operational security as our internal tactical systems. Your privacy is not a feature, it is our baseline."
                </p>
                <div className="flex -space-x-3 mb-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="Security Officer" />
                    </div>
                  ))}
                  <div className="px-6 py-2 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center border border-blue-500/20 translate-x-4">
                     3M+ Secured Users
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32"
        >
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              variants={itemVariants}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              className="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-md hover:bg-slate-900/60 transition-all duration-500"
            >
              <div 
                 className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"
                 style={{ color: section.color }}
              >
                <section.icon size={40} strokeWidth={0.5} />
              </div>

              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                style={{ backgroundColor: `${section.color}15`, color: section.color }}
              >
                <section.icon size={24} />
              </div>

              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                {section.title}
                <motion.span 
                  animate={{ opacity: hoveredSection === section.id ? 1 : 0 }}
                  className="text-[10px] font-black uppercase text-blue-500"
                >
                  Clearance Required
                </motion.span>
              </h3>
              
              <p className="text-slate-400 leading-relaxed text-sm">
                {section.content}
              </p>
            </motion.div>
          ))}
          
          {/* Support Card */}
          <motion.div
            variants={itemVariants}
            className="group relative p-8 rounded-3xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-md lg:col-span-1"
          >
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    <Mail className="text-white" size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white">Security Desk</h3>
                   <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Direct Access</p>
                </div>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
               Need to verify your clearance or initiate a data deletion request? Contact our Chief Security Officer.
            </p>
            <a 
              href="mailto:globixtechinc@gmail.com" 
              className="inline-flex items-center justify-center w-full py-4 px-6 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-[1.02] transition-transform shadow-xl"
            >
              Request Access Logs
            </a>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8"
        >
            <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>© 2024 GlobixTech Enterprises</span>
                <a href="#" className="hover:text-blue-400 transition-colors">Digital Identity Act</a>
                <a href="#" className="hover:text-blue-400 transition-colors">EU Compliance</a>
            </div>
            <p className="text-[10px] text-slate-700 max-w-sm text-center md:text-right">
                All communications on this platform are encrypted via military-grade protocols. Metadata is scrubbed periodically to ensure anonymity.
            </p>
        </motion.div>

      </div>
    </div>
  );
}

