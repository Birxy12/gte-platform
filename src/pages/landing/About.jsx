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
                    {/* ... existing values grid ... */}

                    {/* Strategic Leadership Section */}
                    <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', color: 'white', fontWeight: '800' }}>Strategic <span style={{ color: '#60a5fa' }}>Leadership</span></h2>
                            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>The elite unit driving digital innovation at GTE Portal.</p>
                        </div>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '2rem' 
                        }}>
                            {[
                                { name: 'Cmdr. Birxy', role: 'Chief Intelligence Officer', bio: 'Strategic lead for architecture and data warfare.', initials: 'CB' },
                                { name: 'Maj. Sarah J.', role: 'Head of Operations', bio: 'Mission control for curriculum and learning paths.', initials: 'MS' },
                                { name: 'Lt. Adewale O.', role: 'Tactical Frontend Lead', bio: 'Expert in high-performance UI/UX deployment.', initials: 'LA' },
                                { name: 'Sgt. Fatima K.', role: 'Community Liaison', bio: 'Lead for community engagement and student morale.', initials: 'SF' }
                            ].map((member, i) => (
                                <div key={i} style={{ 
                                    background: 'rgba(255,255,255,0.02)', 
                                    border: '1px solid rgba(255,255,255,0.05)', 
                                    borderRadius: '16px', 
                                    padding: '2rem', 
                                    textAlign: 'center',
                                    transition: 'transform 0.3s'
                                }}>
                                    <div style={{ 
                                        width: '80px', height: '80px', borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, #1e293b, #334155)', 
                                        margin: '0 auto 1rem', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa',
                                        border: '2px solid rgba(96, 165, 250, 0.2)'
                                    }}>{member.initials}</div>
                                    <h3 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>{member.name}</h3>
                                    <p style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{member.role}</p>
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>{member.bio}</p>
                                </div>
                            ))}
                        </div>
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
