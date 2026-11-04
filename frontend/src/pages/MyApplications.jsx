import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyApplications } from "../api/applications";

function statusClass(status) {
    return `application-status application-status-${(status || "pending").toLowerCase()}`;
}

export default function MyApplications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        getMyApplications()
            .then((data) => { if (!cancelled) setApplications(Array.isArray(data) ? data : []); })
            .catch((err) => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const pendingCount = applications.filter((item) => item.status === "Pending").length;
    const approvedCount = applications.filter((item) => item.status === "Approved").length;

    return (
        <div className="applications-page my-applications-page">
            <header className="applications-heading">
                <div>
                    <span className="applications-eyebrow">YOUR ACTIVITY</span>
                    <h1>My applications</h1>
                    <p>Keep track of the events you have applied to.</p>
                </div>
                <button className="btn-outline" onClick={() => navigate("/events")}>Browse events</button>
            </header>

            {error && <p className="msg msg-error" role="alert">{error}</p>}

            {!loading && applications.length > 0 && <div className="my-applications-summary">
                <div><strong>{applications.length}</strong><span>Total applications</span></div>
                <div><strong>{pendingCount}</strong><span>Awaiting review</span></div>
                <div><strong>{approvedCount}</strong><span>Approved</span></div>
            </div>}

            {loading && <div className="applications-empty"><span className="loading-spinner" /><p>Loading your applications…</p></div>}
            {!loading && !error && applications.length === 0 && <div className="applications-empty">
                <div className="applications-empty-icon">▤</div>
                <h2>No applications yet</h2>
                <p>When you apply to an event, its status will appear here.</p>
                <button className="btn-primary" onClick={() => navigate("/events")}>Explore events</button>
            </div>}

            {!loading && applications.length > 0 && <section className="my-applications-grid" aria-label="My event applications">
                {applications.map((application, index) => (
                    <article className="my-application-card" key={`${application.title}-${application.eventDate}-${index}`}>
                        <div className="my-application-card-top">
                            <span className="application-event-icon">✦</span>
                            <span className={statusClass(application.status)}>{application.status || "Pending"}</span>
                        </div>
                        <h2>{application.title || "College event"}</h2>
                        <div className="my-application-meta">
                            <span><b>Venue</b>{application.venue || "Not specified"}</span>
                            <span><b>Date and time</b>{application.eventDate ? new Date(application.eventDate).toLocaleString() : "Not specified"}</span>
                        </div>
                        <div className="my-application-footnote">
                            {application.status === "Approved" ? "You are approved to participate." : application.status === "Rejected" ? "This application was not approved." : "Your application is awaiting review."}
                        </div>
                    </article>
                ))}
            </section>}
        </div>
    );
}
