import { FileText, Cookie, Briefcase, RefreshCw, AlertTriangle, Mail } from "lucide-react";

const sections = [
  {
    icon: FileText,
    color: "blue",
    title: "Acceptance of Terms",
    content: "By accessing or using the GTE Platform, you confirm that you are at least 16 years of age and have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please discontinue your use of the platform immediately."
  },
  {
    icon: Cookie,
    color: "amber",
    title: "Use of Cookies",
    content: "We use cookies to enhance your experience on our platform. By continuing to use GTE, you consent to our use of cookies in accordance with our Privacy Policy. You may disable cookies through your browser settings, though this may affect platform functionality."
  },
  {
    icon: Briefcase,
    color: "purple",
    title: "Intellectual Property",
    content: "All content on this platform — including course materials, videos, quizzes, certificates, text, and graphics — is the exclusive intellectual property of GlobixTech Enterprises. You may not reproduce, distribute, or create derivative works without written permission."
  },
  {
    icon: AlertTriangle,
    color: "red",
    title: "Prohibited Conduct",
    content: "You agree not to: impersonate any person or entity; transmit harmful, offensive, or illegal content; attempt to gain unauthorized access to any system or data; use the platform for commercial purposes without permission; or interfere with other users' use of the platform."
  },
  {
    icon: FileText,
    color: "green",
    title: "Accounts & Responsibilities",
    content: "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized access. GlobixTech reserves the right to suspend or terminate accounts that violate these terms."
  },
  {
    icon: RefreshCw,
    color: "teal",
    title: "Changes to Terms",
    content: "We reserve the right to modify these Terms of Service at any time. Changes will take effect immediately upon posting to this page with an updated effective date. Continued use of the platform following any changes constitutes your acceptance of the new terms."
  }
];

const colorMap = {
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  green: "text-green-400 bg-green-500/10 border-green-500/20",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  teal: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  red: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function TermsOfService() {
  return (
    <div style={{ background: "#080d14", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Hero */}
      <div style={{
        padding: "8rem 2rem 4rem",
        textAlign: "center",
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.06), transparent)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
          <FileText size={14} className="text-purple-400" />
          <span className="text-purple-400 text-xs font-black uppercase tracking-widest">Legal</span>
        </div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Terms of <span className="text-purple-400">Service</span></h1>
        <p className="text-slate-500 max-w-xl mx-auto text-lg">Effective Date: <strong className="text-slate-300">January 1, 2024</strong></p>
        <p className="text-slate-500 max-w-2xl mx-auto mt-4 leading-relaxed">
          These terms govern your use of the GTE Platform operated by GlobixTech Enterprises. By using the platform, you agree to these terms in full.
        </p>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem 2rem" }}>
        <div className="grid grid-cols-1 gap-6">
          {sections.map(({ icon: Icon, color, title, content }) => (
            <div
              key={title}
              className={`p-6 rounded-2xl border ${colorMap[color]} transition-all hover:scale-[1.01]`}
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 min-w-[40px] rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg mb-2">{title}</h2>
                  <p className="text-slate-400 leading-relaxed">{content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 p-8 rounded-2xl border border-slate-800 bg-slate-900/30 text-center">
          <Mail size={32} className="text-purple-400 mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl mb-2">Need Clarification?</h3>
          <p className="text-slate-400 mb-4">For any questions about these terms or your rights, our team is ready to assist.</p>
          <a
            href="mailto:globixtechinc@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all"
          >
            <Mail size={16} /> globixtechinc@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}