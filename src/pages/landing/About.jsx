import { Link } from "react-router-dom";

export default function About() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0e1a',
            color: '#e2e8f0',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>

                {/* Header */}
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-block', padding: '0.4rem 1rem',
                        background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '50px', fontSize: '0.8rem', fontWeight: '600', color: '#a78bfa', marginBottom: '1rem'
                    }}>About Us</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', margin: '0.5rem 0' }}>
                        About <span style={{
                            background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>GTE Portal</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.7', marginTop: '1rem', maxWidth: '650px', margin: '1rem auto 0' }}>
                        Globix Tech Enterprise (GTE) is a cutting-edge digital learning platform designed to empower students,
                        instructors, and professionals with premium educational content, interactive courses, and a vibrant community blog.
                    </p>
                </div>

                {/* Values Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem', marginBottom: '3rem'
                }}>
                    {[
                        { icon: '🎯', title: 'Our Mission', desc: 'To democratize quality tech education and make it accessible to everyone, everywhere.' },
                        { icon: '🌍', title: 'Global Reach', desc: 'Connecting learners from around the world with expert instructors and curated content.' },
                        { icon: '🚀', title: 'Innovation', desc: 'Leveraging modern technology to create interactive and engaging learning experiences.' },
                        { icon: '🤝', title: 'Community', desc: 'Building a supportive network where learners collaborate, share insights, and grow together.' }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '20px', padding: '1.5rem', transition: 'all 0.3s'
                        }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem'
                            }}>{item.icon}</div>
                            <h3 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{item.title}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* What We Offer */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '20px', padding: '2rem', marginBottom: '3rem'
                }}>
                    <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.4rem' }}>What We Offer</h2>
                    {[
                        { icon: '📚', color: 'linear-gradient(135deg, #3b82f6, #6366f1)', title: 'Expert-Led Courses', desc: 'Learn from industry professionals with hands-on video courses' },
                        { icon: '✍️', color: 'linear-gradient(135deg, #10b981, #34d399)', title: 'Community Blog', desc: 'Share knowledge, post articles, and engage with fellow learners' },
                        { icon: '🏆', color: 'linear-gradient(135deg, #f59e0b, #fbbf24)', title: 'Certified Learning', desc: 'Earn certificates upon completing courses to boost your career' }
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                            background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: i < 2 ? '1rem' : '0'
                        }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px', background: item.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0
                            }}>{item.icon}</div>
                            <div>
                                <strong style={{ color: 'white', display: 'block' }}>{item.title}</strong>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{item.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center' }}>
                    <Link to="/courses" style={{
                        display: 'inline-block', padding: '0.9rem 2rem',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white',
                        borderRadius: '14px', textDecoration: 'none', fontWeight: '700', fontSize: '1.05rem',
                        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s'
                    }}>
                        Explore Our Courses →
                    </Link>
                </div>

            </div>
        </div>
    );
}
