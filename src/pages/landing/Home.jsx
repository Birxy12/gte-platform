import { useAuth } from "../../context/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import "./Home.css";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const testimonials = [
    {
        quote: "GTE Portal completely changed my career trajectory. The React course helped me land a job at a top-tier startup within 3 months!",
        author: "Adewale Ogundimu",
        role: "Frontend Developer, Lagos",
        initials: "AO",
        color: "linear-gradient(135deg, #3b82f6, #6366f1)"
    },
    {
        quote: "The community blog is incredible. I've learned so much from the discussions and made connections that led to freelance opportunities.",
        author: "Fatima Kayode",
        role: "UI/UX Designer, Abuja",
        initials: "FK",
        color: "linear-gradient(135deg, #10b981, #059669)"
    },
    {
        quote: "Best investment I've ever made in my education. The certificates from GTE Portal are recognized by employers and opened doors for me.",
        author: "Chukwuemeka Obi",
        role: "Full Stack Developer, Port Harcourt",
        initials: "CO",
        color: "linear-gradient(135deg, #f59e0b, #d97706)"
    },
    {
        quote: "The AI & Machine Learning bootcamp was intense but rewarding. I now build production-ready ML pipelines thanks to GTE.",
        author: "Sarah Johnson",
        role: "ML Engineer, Nairobi",
        initials: "SJ",
        color: "linear-gradient(135deg, #ec4899, #db2777)"
    }
];

export default function Home() {
    const { user } = useAuth();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="landing">
            <Navbar />

            {/* ─── Hero Section ─── */}
            <section className="hero">
                <div className="hero-glow hero-glow-1"></div>
                <div className="hero-glow hero-glow-2"></div>
                <div className="hero-glow hero-glow-3"></div>
                <div className="hero-grid"></div>

                <div className="hero-content">
                    <div className="hero-badge">🚀 The Future of Learning is Here</div>
                    <h1 className="hero-title">
                        Master Tech Skills<br />
                        <span className="gradient-text">Build Your Future</span>
                    </h1>
                    <p className="hero-subtitle">
                        Join thousands of learners on GTE Portal — access expert-led courses,
                        earn certificates, and connect with a global community of developers,
                        designers, and innovators.
                    </p>
                    <div className="hero-actions">
                        <a href={user ? "/courses" : "/register"} className="btn-cta">
                            {user ? "Browse Courses" : "Start Learning Free"} →
                        </a>
                        <a href="/about" className="btn-outline">Learn More</a>
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <strong>10K+</strong>
                            <span>Active Learners</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="hero-stat">
                            <strong>500+</strong>
                            <span>Expert Courses</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="hero-stat">
                            <strong>98%</strong>
                            <span>Satisfaction</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Features Section ─── */}
            <section className="features-section">
                <div className="section-header">
                    <span className="section-badge">Why GTE Portal?</span>
                    <h2>Everything You Need to <span className="gradient-text">Succeed</span></h2>
                    <p>Our platform combines cutting-edge technology with expert instruction to deliver an unmatched learning experience.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>🎓</div>
                        <h3>Expert-Led Courses</h3>
                        <p>Learn from industry professionals with years of real-world experience in top tech companies.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>🏅</div>
                        <h3>Earn Certificates</h3>
                        <p>Get verified certificates upon completion to showcase your skills to employers worldwide.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>⚡</div>
                        <h3>Interactive Labs</h3>
                        <p>Practice with hands-on coding exercises and real projects that build your portfolio.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>🌐</div>
                        <h3>Global Community</h3>
                        <p>Connect with learners from around the world through our blog, forums, and live events.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>📱</div>
                        <h3>Learn Anywhere</h3>
                        <p>Access your courses on any device — desktop, tablet, or mobile. Learn on your schedule.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>🔒</div>
                        <h3>Lifetime Access</h3>
                        <p>Once enrolled, keep access to course materials forever — including all future updates.</p>
                    </div>
                </div>
            </section>

            {/* ─── Popular Courses Preview ─── */}
            <section className="courses-preview">
                <div className="section-header">
                    <span className="section-badge">Trending Now</span>
                    <h2>Popular <span className="gradient-text">Courses</span></h2>
                    <p>Our most enrolled courses that are helping thousands of students level up their careers.</p>
                </div>

                <div className="courses-showcase">
                    <div className="course-preview-card">
                        <div className="course-thumb" style={{ background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)' }}>
                            <span className="course-emoji">⚛️</span>
                        </div>
                        <div className="course-info">
                            <div className="course-tag">Frontend</div>
                            <h4>React & Next.js Masterclass</h4>
                            <p>Build production-ready apps with React 19 and Next.js 15</p>
                            <div className="course-meta">
                                <span>⭐ 4.9</span>
                                <span>👥 2.4K students</span>
                            </div>
                        </div>
                    </div>
                    <div className="course-preview-card">
                        <div className="course-thumb" style={{ background: 'linear-gradient(135deg, #064e3b, #10b981)' }}>
                            <span className="course-emoji">🐍</span>
                        </div>
                        <div className="course-info">
                            <div className="course-tag">Backend</div>
                            <h4>Python Full Stack Development</h4>
                            <p>Django, Flask, REST APIs, and deployment best practices</p>
                            <div className="course-meta">
                                <span>⭐ 4.8</span>
                                <span>👥 1.8K students</span>
                            </div>
                        </div>
                    </div>
                    <div className="course-preview-card">
                        <div className="course-thumb" style={{ background: 'linear-gradient(135deg, #4c1d95, #8b5cf6)' }}>
                            <span className="course-emoji">🤖</span>
                        </div>
                        <div className="course-info">
                            <div className="course-tag">AI/ML</div>
                            <h4>AI & Machine Learning Bootcamp</h4>
                            <p>From neural networks to production ML pipelines</p>
                            <div className="course-meta">
                                <span>⭐ 4.9</span>
                                <span>👥 3.1K students</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <a href="/courses" className="btn-outline" style={{ fontSize: '1rem' }}>
                        View All Courses →
                    </a>
                </div>
            </section>

            {/* ─── Testimonials ─── */}
            <section className="testimonials-section">
                <div className="section-header">
                    <span className="section-badge">Testimonials</span>
                    <h2>Loved by <span className="gradient-text">Learners</span></h2>
                    <p>Hear what our community has to say about their experience on GTE Portal.</p>
                </div>

                <div className="testimonials-container">
                    <div className="testimonials-slideshow">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTestimonial}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="testimonial-card-active"
                            >
                                <div className="testimonial-quote">"{testimonials[currentTestimonial].quote}"</div>
                                <div className="testimonial-author">
                                    <div className="author-avatar" style={{ background: testimonials[currentTestimonial].color }}>
                                        {testimonials[currentTestimonial].initials}
                                    </div>
                                    <div>
                                        <strong>{testimonials[currentTestimonial].author}</strong>
                                        <span>{testimonials[currentTestimonial].role}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <div className="testimonial-dots">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentTestimonial(idx)}
                                className={`dot ${currentTestimonial === idx ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA Section ─── */}
            <section className="cta-section">
                <div className="cta-glow"></div>
                <div className="cta-content">
                    <h2>Ready to Start Your <span className="gradient-text">Learning Journey?</span></h2>
                    <p>Join over 10,000 learners and start building your future today. Free to get started, no credit card required.</p>
                    <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
                        <a href={user ? "/courses" : "/register"} className="btn-cta">
                            {user ? "Explore Courses" : "Create Free Account"} →
                        </a>
                        <a href="/contact" className="btn-outline">Talk to Us</a>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}