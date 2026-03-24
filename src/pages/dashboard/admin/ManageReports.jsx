import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { openAiService } from "../../../services/openAiService";

export default function ManageReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzingId, setAnalyzingId] = useState(null);

    const fetchReports = async () => {
        try {
            const snapshot = await getDocs(collection(db, "reports"));
            setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const updateReportStatus = async (reportId, newStatus) => {
        try {
            await updateDoc(doc(db, "reports", reportId), { status: newStatus });
            setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        }
    };

    const handleAIAnalyze = async (report) => {
        setAnalyzingId(report.id);
        try {
            const analysis = await openAiService.evaluateReport(report.reason, report.details);

            let message = `AI Decision: ${analysis.decision.toUpperCase()}\n`;
            message += `Confidence: ${analysis.confidence}%\n\n`;
            message += `Reasoning: ${analysis.reasoning}\n\n`;

            const action = window.confirm(message + "Do you want to apply the AI's decision?");

            if (action) {
                if (analysis.decision === "ban") {
                    // Update user role to banned
                    await updateDoc(doc(db, "users", report.reportedUserId), { role: "banned" });
                    await updateReportStatus(report.id, "resolved_banned");
                    alert(`User ${report.reportedUserName} has been permanently banned.`);
                } else {
                    await updateReportStatus(report.id, "resolved_ignored");
                    alert("Report marked as ignored based on AI advice.");
                }
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to analyze with AI.");
        } finally {
            setAnalyzingId(null);
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm("Delete this report forever?")) return;
        try {
            await deleteDoc(doc(db, "reports", reportId));
            setReports(reports.filter(r => r.id !== reportId));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="ad-card">Loading reports...</div>;

    return (
        <>
            <div className="ad-page-header">
                <div className="ad-header-title">
                    <h1>Moderation & Reports</h1>
                    <p>Review user reports and employ AI moderation</p>
                </div>
            </div>

            <div className="ad-card" style={{ padding: '0' }}>
                {reports.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        No reports have been submitted yet. Everything is peaceful! 🕊️
                    </div>
                ) : (
                    <div className="ad-table-wrapper">
                        <table className="ad-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Reported User</th>
                                    <th>Reason / Details</th>
                                    <th>Reporter</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(r => (
                                    <tr key={r.id}>
                                        <td>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                background: r.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                color: r.status === 'pending' ? '#fcd34d' : '#6ee7b7'
                                            }}>
                                                {r.status.replace("_", " ").toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>
                                            {r.reportedUserName}<br />
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal' }}>
                                                {r.reportedUserEmail}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{r.reason}</strong>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                "{r.details}"
                                            </p>
                                        </td>
                                        <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                                            {r.reporterEmail}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {r.status === 'pending' && (
                                                    <button
                                                        className="ad-btn-primary"
                                                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                                        onClick={() => handleAIAnalyze(r)}
                                                        disabled={analyzingId === r.id}
                                                    >
                                                        {analyzingId === r.id ? "🤖 Analyzing..." : "🤖 AI Analyze"}
                                                    </button>
                                                )}
                                                <button
                                                    className="ad-btn-danger"
                                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                                    onClick={() => handleDeleteReport(r.id)}
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
