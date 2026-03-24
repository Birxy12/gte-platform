import { useState } from "react";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthProvider";
import "./ReportUserModal.css";

export default function ReportUserModal({ reportedUser, onClose }) {
    const { user } = useAuth();
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addDoc(collection(db, "reports"), {
                reporterId: user.uid,
                reporterEmail: user.email,
                reportedUserId: reportedUser.uid || reportedUser.id,
                reportedUserEmail: reportedUser.email,
                reportedUserName: reportedUser.displayName || reportedUser.username || "Unknown",
                reason,
                details,
                status: "pending",
                createdAt: serverTimestamp()
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error(err);
            alert("Error submitting report. Please try again.");
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="report-modal-overlay" onClick={onClose}>
                <div className="report-modal-content success" onClick={e => e.stopPropagation()}>
                    <div className="success-icon">✅</div>
                    <h2>Report Submitted Successfully</h2>
                    <p>Our moderation team or automated systems will review this shortly.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="report-modal-overlay" onClick={onClose}>
            <div className="report-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Report User</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <p className="report-subtitle">
                    You are reporting <strong>{reportedUser?.displayName || reportedUser?.username || reportedUser?.email}</strong>.
                    Please provide details so we can investigate.
                </p>

                <form onSubmit={handleSubmit} className="report-form">
                    <div className="form-group">
                        <label>Reason for reporting</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select a reason...</option>
                            <option value="spam">Spam or Scam</option>
                            <option value="harassment">Harassment or Bullying</option>
                            <option value="inappropriate_content">Inappropriate Content</option>
                            <option value="impersonation">Impersonation</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Additional Details</label>
                        <textarea
                            placeholder="Please provide specific examples or context..."
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={submitting || !reason}>
                            {submitting ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
