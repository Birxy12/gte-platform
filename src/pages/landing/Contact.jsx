import { useState } from "react";
import "./Home.css";

export default function Contact() {
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app this would send to a backend or Firebase
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className="dashboard-container" style={{ minHeight: '100vh' }}>
            <div className="dashboard-main" style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 2rem' }}>

                <div className="dashboard-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem' }}>Get in <span style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Touch</span></h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        Have questions or feedback? We'd love to hear from you.
                    </p>
                </div>

                {submitted && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399',
                        padding: '1rem',
                        borderRadius: '12px',
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        fontWeight: '500'
                    }}>
                        ✅ Message sent successfully! We'll get back to you soon.
                    </div>
                )}

                <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '2rem'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white',
                                    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white',
                                    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500', display: 'block', marginBottom: '0.4rem' }}>Subject</label>
                            <input
                                name="subject"
                                type="text"
                                placeholder="How can we help?"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white',
                                    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500', display: 'block', marginBottom: '0.4rem' }}>Message</label>
                            <textarea
                                name="message"
                                placeholder="Write your message..."
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white',
                                    fontSize: '0.95rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                padding: '0.8rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                fontWeight: '600', fontSize: '1rem', transition: 'transform 0.2s, box-shadow 0.2s',
                                marginTop: '0.5rem'
                            }}
                        >
                            Send Message ✉️
                        </button>
                    </form>
                </div>

                <div className="stats-grid" style={{ marginTop: '2.5rem' }}>
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-icon">📧</div>
                        <p className="stat-label">support@gteportal.edu</p>
                    </div>
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-icon">📞</div>
                        <p className="stat-label">1-800-GTE-LEARN</p>
                    </div>
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-icon">📍</div>
                        <p className="stat-label">Lagos, Nigeria</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
