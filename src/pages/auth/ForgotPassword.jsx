import { Link } from "react-router-dom";
import "../auth/Login.css"; // Reuse premium styling

export default function ForgotPassword() {
    const handleReset = (e) => {
        e.preventDefault();
        alert("Password reset functionality to be implemented.");
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleReset} className="login-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                        Send Reset Link
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
