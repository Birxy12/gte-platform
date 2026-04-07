import { useState } from "react";
import { auth, db, googleProvider } from "../../config/firebase";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function LoginAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Hardcoded Admin Login Intercept
      if (email === "globixtechinc@gmail.com" && password === "@@@@@@@45") {
        console.log("Admin intercept triggered.");
        let adminCredential;
        try {
          adminCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
          console.warn("Admin sign-in failed, checking if user exists:", err.code);
          if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
            try {
              adminCredential = await createUserWithEmailAndPassword(auth, email, password);
            } catch (createErr) {
              console.error("Admin creation failed:", createErr.code);
              if (createErr.code === "auth/email-already-in-use") {
                throw new Error("Admin account exists but password does not match hardcoded value.");
              }
              throw createErr;
            }
          } else {
            throw err;
          }
        }
        
        await setDoc(doc(db, "users", adminCredential.user.uid), {
          uid: adminCredential.user.uid,
          role: "admin",
          email: email
        }, { merge: true });
        navigate("/admin");
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential") {
        setError("Invalid credentials. Please double-check your email and password.");
      } else if (err.code === "auth/user-not-found") {
        setError("Account not found. Please sign up instead.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError(err.message || "An error occurred during login. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Google sign-in was cancelled or failed.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Login to your account to continue</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={login} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Link to="/forgot-password" style={{ color: '#60a5fa', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? <span className="loader"></span> : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button onClick={googleLogin} className="btn-google">
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Don't have an account? <Link to="/register" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '500' }}>Sign Up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}