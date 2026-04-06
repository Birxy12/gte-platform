import { useState, useEffect, useRef } from "react";
import { db } from "../../config/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { useAuth } from "../../context/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
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

const learningPaths = [
    {
        title: "Frontend Development",
        icon: "🎨",
        color: "#3b82f6",
        courses: 12,
        hours: 45,
        skills: ["React", "Vue", "CSS", "TypeScript"],
        description: "Master modern frontend frameworks and build stunning user interfaces"
    },
    {
        title: "Backend Engineering",
        icon: "⚙️",
        color: "#10b981",
        courses: 10,
        hours: 38,
        skills: ["Node.js", "Python", "Databases", "APIs"],
        description: "Build scalable server-side applications and robust APIs"
    },
    {
        title: "Data Science",
        icon: "📊",
        color: "#f59e0b",
        courses: 15,
        hours: 60,
        skills: ["Python", "SQL", "ML", "Visualization"],
        description: "Transform data into insights with cutting-edge analytics tools"
    },
    {
        title: "DevOps & Cloud",
        icon: "☁️",
        color: "#8b5cf6",
        courses: 8,
        hours: 32,
        skills: ["AWS", "Docker", "K8s", "CI/CD"],
        description: "Deploy and manage applications at scale with modern DevOps practices"
    }
];

const stats = [
    { value: 0, target: 10000, suffix: "+", label: "Active Learners", icon: "👥" },
    { value: 0, target: 500, suffix: "+", label: "Expert Courses", icon: "📚" },
    { value: 0, target: 98, suffix: "%", label: "Satisfaction Rate", icon: "⭐" },
    { value: 0, target: 50, suffix: "+", label: "Countries", icon: "🌍" }
];

const partners = ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Spotify"];

const faqs = [
    {
        question: "How do I get started with GTE Portal?",
        answer: "Simply create a free account, browse our course catalog, and enroll in any course that interests you. No credit card required to start learning."
    },
    {
        question: "Are the certificates recognized by employers?",
        answer: "Yes! Our certificates are industry-recognized and can be added to your LinkedIn profile or resume to showcase your skills to potential employers."
    },
    {
        question: "Can I learn at my own pace?",
        answer: "Absolutely. All our courses are self-paced with lifetime access. Learn whenever and wherever works best for your schedule."
    },
    {
        question: "Is there a community for students?",
        answer: "Yes! We have an active community blog, discussion forums, and regular live events where you can connect with fellow learners and instructors."
    }
];

export default function Home() {
    const { user } = useAuth();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [dynamicTestimonials, setDynamicTestimonials] = useState(testimonials);
    const [animatedStats, setAnimatedStats] = useState(stats);
    const [activePath, setActivePath] = useState(0);
    const [openFaq, setOpenFaq] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState({});
    const statsRef = useRef(null);
    const observerRefs = useRef([]);

    // Mouse tracking for parallax effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Scroll tracking
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsVisible(prev => ({ ...prev, [entry.target.dataset.id]: true }));
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        observerRefs.current.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    // Counter animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    const duration = 2000;
                    const steps = 60;
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
            { threshold: 0.5 }
        );

        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    // Testimonials fetch and rotation
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const q = query(collection(db, "testimonies"), where("published", "==", true), limit(6));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const fetched = snap.docs.map(doc => {
                        const data = doc.data();
                        return {
                            quote: data.text,
                            author: data.userName,
                            role: "Verified Soldier",
                            initials: data.userName.substring(0, 2).toUpperCase(),
                            color: "linear-gradient(135deg, #1e293b, #334155)"
                        };
                    });
                    setDynamicTestimonials(fetched);
                }
            } catch (err) {
                console.error("Error fetching testimonials:", err);
            }
        };
        fetchTestimonials();

        const timer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % dynamicTestimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [dynamicTestimonials.length]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="landing">
            {/* ─── Hero Section with Parallax ─── */}
            <section className="hero" style={{ perspective: "1000px" }}>
                <div className="hero-glow hero-glow-1" style={{
                    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
                }}></div>
                <div className="hero-glow hero-glow-2" style={{
                    transform: `translate(${-mousePosition.x * 0.03}px, ${-mousePosition.y * 0.03}px)`
                }}></div>
                <div className="hero-glow hero-glow-3" style={{
                    transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
                }}></div>
                <div className="hero-grid" style={{
                    transform: `translateY(${scrollY * 0.5}px)`
                }}></div>

                <div className="hero-content">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="hero-badge"
                    >
                        <span className="badge-pulse"></span>
                        🚀 The Future of Learning is Here
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="hero-title"
                    >
                        Master Tech Skills<br />
                        <span className="gradient-text">Build Your Future</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="hero-subtitle"
                    >
                        Join thousands of learners on GTE Portal — access expert-led courses,
                        earn certificates, and connect with a global community of developers,
                        designers, and innovators.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="hero-actions"
                    >
                        <a href={user ? "/courses" : "/register"} className="btn-cta btn-cta-large">
                            {user ? "Browse Courses" : "Start Learning Free"} →
                        </a>
                        <a href="/about" className="btn-outline btn-outline-large">
                            <span className="play-icon">▶</span> Watch Demo
                        </a>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="hero-trust"
                    >
                        <div className="trust-avatars">
                            {["AO", "FK", "CO", "SJ"].map((initial, i) => (
                                <div key={i} className="trust-avatar" style={{ zIndex: 4 - i }}>
                                    {initial}
                                </div>
                            ))}
                            <div className="trust-count">+10K</div>
                        </div>
                        <span className="trust-text">Trusted by learners worldwide</span>
                    </motion.div>
                </div>

                {/* Floating cards animation */}
                <div className="floating-cards">
                    <motion.div 
                        className="float-card float-card-1"
                        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <span>🔥</span>
                        <small>Popular</small>
                    </motion.div>
                    <motion.div 
                        className="float-card float-card-2"
                        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                        <span>⭐</span>
                        <small>4.9 Rating</small>
                    </motion.div>
                    <motion.div 
                        className="float-card float-card-3"
                        animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    >
                        <span>🏆</span>
                        <small>Certified</small>
                    </motion.div>
                </div>
            </section>

            {/* ─── Animated Stats Counter ─── */}
            <section className="stats-section" ref={statsRef} data-id="stats">
                <div className="stats-grid">
                    {animatedStats.map((stat, idx) => (
                        <motion.div 
                            key={idx}
                            className="stat-card"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={isVisible["stats"] ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-value">
                                {stat.value.toLocaleString()}{stat.suffix}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── Learning Paths Section ─── */}
            <section className="paths-section" data-id="paths" ref={el => observerRefs.current[0] = el}>
                <div className="section-header">
                    <span className="section-badge">Career Tracks</span>
                    <h2>Choose Your <span className="gradient-text">Learning Path</span></h2>
                    <p>Structured curricula designed to take you from beginner to job-ready professional.</p>
                </div>

                <div className="paths-container">
                    <div className="paths-sidebar">
                        {learningPaths.map((path, idx) => (
                            <button
                                key={idx}
                                className={`path-tab ${activePath === idx ? 'active' : ''}`}
                                onClick={() => setActivePath(idx)}
                                style={{ '--path-color': path.color }}
                            >
                                <span className="path-icon">{path.icon}</span>
                                <span className="path-title">{path.title}</span>
                                <motion.div 
                                    className="tab-indicator"
                                    layoutId="tab-indicator"
                                    style={{ opacity: activePath === idx ? 1 : 0 }}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="paths-content">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activePath}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="path-details"
                            >
                                <div className="path-header" style={{ borderColor: learningPaths[activePath].color }}>
                                    <h3>{learningPaths[activePath].title}</h3>
                                    <div className="path-meta">
                                        <span>{learningPaths[activePath].courses} Courses</span>
                                        <span>•</span>
                                        <span>{learningPaths[activePath].hours} Hours</span>
                                    </div>
                                </div>
                                <p className="path-description">{learningPaths[activePath].description}</p>
                                <div className="path-skills">
                                    <h4>You'll master:</h4>
                                    <div className="skills-grid">
                                        {learningPaths[activePath].skills.map((skill, i) => (
                                            <span key={i} className="skill-tag" style={{ 
                                                background: `${learningPaths[activePath].color}20`,
                                                color: learningPaths[activePath].color,
                                                borderColor: `${learningPaths[activePath].color}40`
                                            }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <a href={`/paths/${activePath}`} className="btn-path" style={{ 
                                    background: learningPaths[activePath].color 
                                }}>
                                    Explore Path →
                                </a>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* ─── Features Section with Hover Effects ─── */}
            <section className="features-section" data-id="features" ref={el => observerRefs.current[1] = el}>
                <div className="section-header">
                    <span className="section-badge">Why GTE Portal?</span>
                    <h2>Everything You Need to <span className="gradient-text">Succeed</span></h2>
                    <p>Our platform combines cutting-edge technology with expert instruction to deliver an unmatched learning experience.</p>
                </div>

                <motion.div 
                    className="features-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isVisible["features"] ? "visible" : "hidden"}
                >
                    {[
                        { icon: "🎓", title: "Expert-Led Courses", desc: "Learn from industry professionals with years of real-world experience in top tech companies.", color: "linear-gradient(135deg, #3b82f6, #6366f1)" },
                        { icon: "🏅", title: "Earn Certificates", desc: "Get verified certificates upon completion to showcase your skills to employers worldwide.", color: "linear-gradient(135deg, #10b981, #059669)" },
                        { icon: "⚡", title: "Interactive Labs", desc: "Practice with hands-on coding exercises and real projects that build your portfolio.", color: "linear-gradient(135deg, #f59e0b, #d97706)" },
                        { icon: "🌐", title: "Global Community", desc: "Connect with learners from around the world through our blog, forums, and live events.", color: "linear-gradient(135deg, #ec4899, #db2777)" },
                        { icon: "📱", title: "Learn Anywhere", desc: "Access your courses on any device — desktop, tablet, or mobile. Learn on your schedule.", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
                        { icon: "🔒", title: "Lifetime Access", desc: "Once enrolled, keep access to course materials forever — including all future updates.", color: "linear-gradient(135deg, #06b6d4, #0891b2)" }
                    ].map((feature, idx) => (
                        <motion.div 
                            key={idx} 
                            className="feature-card"
                            variants={itemVariants}
                            whileHover={{ 
                                scale: 1.05, 
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                y: -10
                            }}
                        >
                            <div className="feature-icon" style={{ background: feature.color }}>
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                            <div className="feature-shine"></div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ─── Popular Courses with 3D Cards ─── */}
            <section className="courses-preview" data-id="courses" ref={el => observerRefs.current[2] = el}>
                <div className="section-header">
                    <span className="section-badge">Trending Now</span>
                    <h2>Popular <span className="gradient-text">Courses</span></h2>
                    <p>Our most enrolled courses that are helping thousands of students level up their careers.</p>
                </div>

                <div className="courses-showcase">
                    {[
                        { bg: "linear-gradient(135deg, #1e3a5f, #3b82f6)", emoji: "⚛️", tag: "Frontend", title: "React & Next.js Masterclass", desc: "Build production-ready apps with React 19 and Next.js 15", rating: "4.9", students: "2.4K", price: "$89" },
                        { bg: "linear-gradient(135deg, #064e3b, #10b981)", emoji: "🐍", tag: "Backend", title: "Python Full Stack Development", desc: "Django, Flask, REST APIs, and deployment best practices", rating: "4.8", students: "1.8K", price: "$79" },
                        { bg: "linear-gradient(135deg, #4c1d95, #8b5cf6)", emoji: "🤖", tag: "AI/ML", title: "AI & Machine Learning Bootcamp", desc: "From neural networks to production ML pipelines", rating: "4.9", students: "3.1K", price: "$129" }
                    ].map((course, idx) => (
                        <motion.div 
                            key={idx}
                            className="course-preview-card"
                            initial={{ opacity: 0, rotateY: -15 }}
                            animate={isVisible["courses"] ? { opacity: 1, rotateY: 0 } : {}}
                            transition={{ delay: idx * 0.2 }}
                            whileHover={{ 
                                rotateY: 5, 
                                rotateX: -5,
                                scale: 1.02,
                                z: 50
                            }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <div className="course-thumb" style={{ background: course.bg }}>
                                <span className="course-emoji">{course.emoji}</span>
                                <div className="course-price">{course.price}</div>
                            </div>
                            <div className="course-info">
                                <div className="course-tag">{course.tag}</div>
                                <h4>{course.title}</h4>
                                <p>{course.desc}</p>
                                <div className="course-meta">
                                    <span>⭐ {course.rating}</span>
                                    <span>👥 {course.students} students</span>
                                </div>
                                <button className="btn-course">Enroll Now</button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <a href="/courses" className="btn-outline btn-outline-large">
                        View All Courses →
                    </a>
                </div>
            </section>

            {/* ─── How It Works Section ─── */}
            <section className="how-it-works" data-id="how" ref={el => observerRefs.current[3] = el}>
                <div className="section-header">
                    <span className="section-badge">Get Started</span>
                    <h2>How It <span className="gradient-text">Works</span></h2>
                </div>
                
                <div className="steps-container">
                    {[
                        { num: "01", title: "Create Account", desc: "Sign up for free and set up your learning profile", icon: "👤" },
                        { num: "02", title: "Choose Course", desc: "Browse our catalog and pick what interests you", icon: "🔍" },
                        { num: "03", title: "Start Learning", desc: "Watch videos, complete exercises, build projects", icon: "📖" },
                        { num: "04", title: "Get Certified", desc: "Earn your certificate and share your achievement", icon: "🎓" }
                    ].map((step, idx) => (
                        <motion.div 
                            key={idx}
                            className="step-card"
                            initial={{ opacity: 0, x: -50 }}
                            animate={isVisible["how"] ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: idx * 0.2 }}
                        >
                            <div className="step-number">{step.num}</div>
                            <div className="step-icon">{step.icon}</div>
                            <h3>{step.title}</h3>
                            <p>{step.desc}</p>
                            {idx < 3 && <div className="step-arrow">→</div>}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── Testimonials with Enhanced Animation ─── */}
            <section className="testimonials-section" data-id="testimonials" ref={el => observerRefs.current[4] = el}>
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
                                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -100, scale: 0.8 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="testimonial-card-active"
                            >
                                <div className="quote-icon">"</div>
                                <div className="testimonial-quote">{dynamicTestimonials[currentTestimonial].quote}</div>
                                <div className="testimonial-author">
                                    <div className="author-avatar" style={{ background: dynamicTestimonials[currentTestimonial].color }}>
                                        {dynamicTestimonials[currentTestimonial].initials}
                                    </div>
                                    <div className="author-info">
                                        <strong>{dynamicTestimonials[currentTestimonial].author}</strong>
                                        <span>{dynamicTestimonials[currentTestimonial].role}</span>
                                    </div>
                                </div>
                                <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    
                    <div className="testimonial-controls">
                        <button 
                            className="testimonial-btn prev"
                            onClick={() => setCurrentTestimonial(prev => (prev - 1 + dynamicTestimonials.length) % dynamicTestimonials.length)}
                        >
                            ←
                        </button>
                        <div className="testimonial-dots">
                            {dynamicTestimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentTestimonial(idx)}
                                    className={`dot ${currentTestimonial === idx ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                        <button 
                            className="testimonial-btn next"
                            onClick={() => setCurrentTestimonial(prev => (prev + 1) % dynamicTestimonials.length)}
                        >
                            →
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── Partners/Trust Section ─── */}
            <section className="partners-section" data-id="partners" ref={el => observerRefs.current[5] = el}>
                <p className="partners-label">Trusted by professionals from</p>
                <div className="partners-scroll">
                    <div className="partners-track">
                        {[...partners, ...partners].map((partner, idx) => (
                            <div key={idx} className="partner-logo">{partner}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ Accordion Section ─── */}
            <section className="faq-section" data-id="faq" ref={el => observerRefs.current[6] = el}>
                <div className="section-header">
                    <span className="section-badge">FAQ</span>
                    <h2>Frequently Asked <span className="gradient-text">Questions</span></h2>
                </div>

                <div className="faq-container">
                    {faqs.map((faq, idx) => (
                        <motion.div 
                            key={idx}
                            className={`faq-item ${openFaq === idx ? 'open' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isVisible["faq"] ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <button 
                                className="faq-question"
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                            >
                                <span>{faq.question}</span>
                                <motion.span 
                                    className="faq-icon"
                                    animate={{ rotate: openFaq === idx ? 45 : 0 }}
                                >
                                    +
                                </motion.span>
                            </button>
                            <AnimatePresence>
                                {openFaq === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="faq-answer"
                                    >
                                        {faq.answer}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── Newsletter Section ─── */}
            <section className="newsletter-section">
                <div className="newsletter-content">
                    <h2>Stay Updated</h2>
                    <p>Get the latest courses, tutorials, and tech news delivered to your inbox.</p>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Enter your email" required />
                        <button type="submit" className="btn-cta">Subscribe</button>
                    </form>
                    <p className="newsletter-note">No spam, unsubscribe at any time.</p>
                </div>
            </section>

            {/* ─── Enhanced CTA Section ─── */}
            <section className="cta-section">
                <div className="cta-glow"></div>
                <div className="cta-particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 5}s`
                        }}></div>
                    ))}
                </div>
                <div className="cta-content">
                    <h2>Ready to Start Your <span className="gradient-text">Learning Journey?</span></h2>
                    <p>Join over 10,000 learners and start building your future today. Free to get started, no credit card required.</p>
                    <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
                        <a href={user ? "/courses" : "/register"} className="btn-cta btn-cta-large">
                            {user ? "Explore Courses" : "Create Free Account"} →
                        </a>
                        <a href="/contact" className="btn-outline btn-outline-large">Talk to Us</a>
                    </div>
                    <div className="cta-features">
                        <span>✓ Free to start</span>
                        <span>✓ Cancel anytime</span>
                        <span>✓ 24/7 Support</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
