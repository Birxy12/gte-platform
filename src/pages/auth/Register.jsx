import { useState } from "react";
import { auth, db } from "../../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, updateDoc, increment, query, collection, where, getDocs, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Lock, ArrowRight, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

import "./Login.css";

export default function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const ADMIN_EMAIL = "globixtechinc@gmail.com";
  const ADMIN_PASSWORD = "@@@@@@@45";

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (!username || !email || !phoneNumber || !password) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {

      const normalizedEmail = email.trim().toLowerCase();

      /*
      ==========================
      ADMIN LOGIN INTERCEPT
      ==========================
      */

      if (
        normalizedEmail === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
      ) {

        const adminCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD).catch(async (err) => {
          if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
            return await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
          }
          throw err;
        });

        await setDoc(
          doc(db, "users", adminCredential.user.uid),
          {
            uid: adminCredential.user.uid,
            email: ADMIN_EMAIL,
            role: "admin",
            createdAt: serverTimestamp()
          },
          { merge: true }
        );

        navigate("/admin");
        return;
      }

      /*
      ==========================
      NORMAL USER REGISTRATION
      ==========================
      */

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      const user = userCredential.user;

      // Generate structured student ID: GTE/YEAR/4-DIGITS
      const regYear = new Date().getFullYear();
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const studentId = `GTE/${regYear}/${randomId}`;

      // --- Referral & Initial Coins Logic ---
      let initialCoins = 0;
      let referrerId = null;
      let referralBonus = 20; // Default Referrer bonus
      let registrantBonus = 20; // Default Registrant bonus

      // Fetch global economy settings
      try {
        const settingsSnap = await getDoc(doc(db, "settings", "global"));
        if (settingsSnap.exists()) {
          const settings = settingsSnap.data();
          if (settings.referralEnabled !== false) {
             referralBonus = settings.referralBonus || 20;
             registrantBonus = settings.referralRegistrantBonus || 20;
          } else {
             // System disabled, force 0
             referralBonus = 0;
             registrantBonus = 0;
          }
        }
      } catch (err) {
        console.error("Economy settings fetch error:", err);
      }

      if (referralCode.trim() && registrantBonus > 0) {
        try {
          const q = query(collection(db, "users"), where("username", "==", referralCode.trim()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            initialCoins = registrantBonus;
            referrerId = snap.docs[0].id;
          }
        } catch (refErr) {
          console.error("Referral check error:", refErr);
        }
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        studentId: studentId,
        username: username.trim(),
        email: normalizedEmail,
        phoneNumber: phoneNumber.trim(),
        role: "user",
        coins: initialCoins,
        createdAt: serverTimestamp()
      });

      // Award Referrer if valid
      if (referrerId && referralBonus > 0) {
        await updateDoc(doc(db, "users", referrerId), {
          coins: increment(referralBonus)
        });
      }

      navigate("/home");

    } catch (err) {

      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email already exists. Try logging in.");
      }
      else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      }
      else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      }
      else {
        setError("Registration failed. Please try again.");
      }

    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-card" 
        style={{ maxWidth: "480px" }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <h2>Create Account</h2>
          <p>Join our <span>global</span> learning community today!</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister} className="login-form">

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="JohnDoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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

          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="+1 555 000 0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} /> Referral Code (Optional)
            </label>
            <input
              type="text"
              placeholder="Friend's Nickname"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: "1rem" }}
          >
            {loading ? <span className="loader"></span> : (
              <>
                Register Now <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>

        </form>

        <div className="divider">
          <span>already a member?</span>
        </div>

        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>
            <Link
              to="/login"
              style={{
                color: "#60a5fa",
                textDecoration: "none",
                fontWeight: "600",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              Sign In to Your Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}