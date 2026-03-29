import { Link } from "react-router-dom";
import { useState } from "react";
import { auth } from "../../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import "../auth/Login.css"; // Reuse premium styling

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        if (!email) return;

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent! Check your inbox.");
        } catch (err) {
            console.error(err);
            if (err.code === "auth/user-not-found") {
                setError("No account found with this email.");
            } else if (err.code === "auth/invalid-email") {
                setError("Invalid email address.");
            } else {
                setError("Failed to send reset email. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleReset} className="login-form">
                    {message && <div style={{ padding: '10px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(74, 222, 128, 0.2)' }}>{message}</div>}
                    {error && <div style={{ padding: '10px', backgroundColor: 'rgba(2ef, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(248, 113, 113, 0.2)' }}>{error}</div>}

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                        Remembered your password? <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '500' }}>Sign In here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
