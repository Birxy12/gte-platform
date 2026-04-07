import { motion } from "framer-motion";
import { FileText, Cookie, Briefcase, RefreshCw, AlertTriangle, Mail, ShieldCheck, Zap, Gavel } from "lucide-react";

const sections = [
  {
    id: "acceptance",
    icon: ShieldCheck,
    color: "#a855f7",
    title: "Operational Acceptance",
    content: "By accessing the GTE Platform, you confirm that you are at least 16 years of age and agree to be bound by these Operational Directives. Failure to comply results in immediate termination of clearance."
  },
  {
    id: "cookies",
    icon: Cookie,
    color: "#f59e0b",
    title: "Tracking & Identifiers",
    content: "We utilize session identifiers (cookies) to maintain your tactical state. By proceeding, you consent to our data collection protocols as outlined in the Privacy Policy."
  },
  {
    id: "ip",
    icon: Briefcase,
    color: "#3b82f6",
    title: "Proprietary Intel",
    content: "All platform assets — including course materials, tactical videos, and encryption keys — are the exclusive intellectual property of GlobixTech Enterprises (GTE)."
  },
  {
    id: "conduct",
    icon: AlertTriangle,
    color: "#ef4444",
    title: "Prohibited Actions",
    content: "Impersonation, transmission of unauthorized malware, or any attempt to breach GTE firewall systems is strictly prohibited and subject to legal intervention."
  },
  {
    id: "accounts",
    icon: Gavel,
    color: "#10b981",
    title: "Account Integrity",
    content: "You are solely responsible for your credentials. GTE reserves the right to scrub any account found in violation of security protocols or engagement rules."
  }
];

export default function TermsOfService() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-purple-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative pt-32 pb-24 px-6 max-w-6xl mx-auto">
        
        {/* Header Label */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-purple-500 mb-8"
        >
          <Zap size={16} fill="currentColor" />
          <span>Operational Directive 104-B</span>
        </motion.div>

        {/* Hero Section */}
        <div className="mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter mb-6"
          >
            Terms of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Engagement
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-400 max-w-2xl leading-relaxed"
          >
            These directives govern your deployment within the GTE ecosystem. 
            By initializing your session, you accept the following terms in their entirety.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
            {/* Sidebar Stats */}
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-4 space-y-6"
            >
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Clearance Status</p>
                    <p className="text-2xl font-bold text-white">Full Engagement</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Effective Date</p>
                    <p className="text-2xl font-bold text-slate-300">Jan 01, 2024</p>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                    <AlertTriangle size={32} className="mb-4 text-white" />
                    <h4 className="font-bold text-xl mb-2">Violation Notice</h4>
                    <p className="text-sm opacity-90 leading-relaxed">
                        Breaching these directives results in immediate asset liquidation and permanent network ban. 
                    </p>
                </div>
            </motion.div>

            {/* Directives List */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="lg:col-span-8 space-y-4"
            >
                {sections.map((section) => (
                    <motion.div
                        key={section.id}
                        variants={itemVariants}
                        className="group flex gap-6 p-6 md:p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition-all hover:bg-slate-900/60"
                    >
                        <div 
                            className="w-14 h-14 min-w-[56px] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${section.color}15`, color: section.color }}
                        >
                            <section.icon size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                                {section.title}
                                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-500 font-black tracking-widest uppercase">
                                    Binding
                                </span>
                            </h2>
                            <p className="text-slate-400 leading-relaxed">
                                {section.content}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {/* Contact CTA */}
                <motion.div 
                    variants={itemVariants}
                    className="p-8 rounded-[2rem] border border-dashed border-slate-800 bg-slate-900/20 text-center"
                >
                    <Mail size={24} className="mx-auto mb-4 text-purple-400" />
                    <p className="text-sm text-slate-400 mb-6 font-medium">
                        Need clarification on these engagement rules? Contact Legal Command.
                    </p>
                    <a 
                        href="mailto:globixtechinc@gmail.com"
                        className="inline-flex items-center gap-3 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black transition-all hover:px-10"
                    >
                        Contact Legal Command
                    </a>
                </motion.div>
            </motion.div>
        </div>

        {/* Tactical Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6"
        >
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                <span>© 2024 GlobixTech Enterprises</span>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span>Protocol: GTE-TERMS-V4</span>
            </div>
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-purple-400 cursor-pointer transition-colors">
                    <Zap size={14} />
                </div>
                <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-purple-400 cursor-pointer transition-colors">
                    <FileText size={14} />
                </div>
            </div>
        </motion.div>

      </div>
    </div>
  );
}