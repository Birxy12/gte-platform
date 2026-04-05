import { Shield, Eye, Lock, Share2, UserCheck, AlertTriangle, Mail } from "lucide-react";

const sections = [
  {
    icon: Eye,
    color: "blue",
    title: "Information We Collect",
    content: "We collect personal information such as your name, email address, and phone number when you register. We also gather usage data including IP addresses, browser types, device information, and interaction logs to improve our platform experience."
  },
  {
    icon: Shield,
    color: "green",
    title: "How We Use Your Information",
    content: "We use collected data to provide, maintain, and improve our services; personalize your learning experience; send course updates and promotional communications; process payments; and comply with legal obligations."
  },
  {
    icon: Share2,
    color: "purple",
    title: "How We Share Your Information",
    content: "We do not sell or rent your personal information to third parties. We may share data with trusted service providers — including hosting, payment processors, and analytics services — strictly to operate the GTE platform on our behalf."
  },
  {
    icon: UserCheck,
    color: "amber",
    title: "Your Rights",
    content: "You have the right to access, update, or delete your personal data at any time. You may also object to data processing, restrict usage, or request a portable copy of your information by contacting our support team."
  },
  {
    icon: Lock,
    color: "teal",
    title: "Security",
    content: "We implement industry-standard encryption and security practices to protect your data from unauthorized access, alteration, or disclosure. However, no data transmission over the internet can be guaranteed to be 100% secure."
  },
  {
    icon: AlertTriangle,
    color: "red",
    title: "Changes to This Policy",
    content: "We may update this Privacy Policy from time to time. When we do, we will revise the effective date at the top of this page. We encourage you to review this policy periodically to stay informed about how we protect your data."
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

export default function PrivacyPolicy() {
  return (
    <div style={{ background: "#080d14", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Hero */}
      <div style={{
        padding: "8rem 2rem 4rem",
        textAlign: "center",
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59,130,246,0.06), transparent)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
          <Shield size={14} className="text-blue-400" />
          <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Legal</span>
        </div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Privacy <span className="text-blue-400">Policy</span></h1>
        <p className="text-slate-500 max-w-xl mx-auto text-lg">Effective Date: <strong className="text-slate-300">January 1, 2024</strong></p>
        <p className="text-slate-500 max-w-2xl mx-auto mt-4 leading-relaxed">
          At GlobixTech, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use the GTE platform.
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
          <Mail size={32} className="text-blue-400 mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl mb-2">Questions?</h3>
          <p className="text-slate-400 mb-4">If you have any questions about this Privacy Policy, reach out to us directly.</p>
          <a
            href="mailto:globixtechinc@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
          >
            <Mail size={16} /> globixtechinc@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
