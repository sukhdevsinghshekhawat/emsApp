import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reviewApplication } from "../api/applications";
import { getEventApplications, getEvents } from "../api/events";

function getInitials(name) {
    return (name || "Student")
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");
}

function statusClass(status) {
    return `application-status application-status-${(status || "pending").toLowerCase()}`;
}

function applicationKey(application, index) {
    return `${application.userId}-${application.eventId}-${application.mobile || index}`;
}

export default function Applications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [eventId, setEventId] = useState("");
    const [events, setEvents] = useState([]);
    const [eventMenuOpen, setEventMenuOpen] = useState(false);
    const eventPickerRef = useRef(null);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [reviewingApplicationKey, setReviewingApplicationKey] = useState(null);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;
        getEvents()
            .then((data) => { if (!cancelled) setEvents(Array.isArray(data) ? data : []); })
            .catch((err) => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoadingEvents(false); });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        function closeEventMenu(event) {
            if (!eventPickerRef.current?.contains(event.target)) setEventMenuOpen(false);
        }
        function handleEscape(event) {
            if (event.key === "Escape") setEventMenuOpen(false);
        }
        document.addEventListener("pointerdown", closeEventMenu);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("pointerdown", closeEventMenu);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    async function loadApplications(event) {
        event.preventDefault();
        if (!eventId) {
            setError("Select an event to view its applications.");
            return;
        }
        setLoadingApplications(true);
        setSearched(true);
        setError("");
        setMessage("");
        try {
            const data = await getEventApplications(eventId);
            if (Array.isArray(data)) {
                setApplications(data);
                if (data.length === 0) setMessage("No applications have been submitted for this event yet.");
            } else {
                setApplications([]);
                setMessage(typeof data === "string" ? data : "No applications have been submitted for this event yet.");
            }
        } catch (err) {
            setError(err.message);
            setApplications([]);
        } finally {
            setLoadingApplications(false);
        }
    }

    async function handleReview(application, status, index) {
        setError("");
        setMessage("");
        const key = applicationKey(application, index);
        setReviewingApplicationKey(key);
        try {
            await reviewApplication({ userId: application.userId, eventId: application.eventId, status });
            setApplications((current) => current.map((item) =>
                item.userId === application.userId && item.eventId === application.eventId
                    ? { ...item, status }
                    : item
            ));
            setMessage(`Application ${status.toLowerCase()}.`);
            const data = await getEventApplications(eventId);
            if (Array.isArray(data)) setApplications(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setReviewingApplicationKey(null);
        }
    }

    const selectedEvent = events.find((event) => String(event.id) === String(eventId));
    const pendingCount = applications.filter((application) => application.status === "Pending").length;
    const approvedCount = applications.filter((application) => application.status === "Approved").length;
    const rejectedCount = applications.filter((application) => application.status === "Rejected").length;

    return (
        <div className="applications-page">
            <header className="applications-heading">
                <div>
                    <span className="applications-eyebrow">EVENT MANAGEMENT</span>
                    <h1>Student applications</h1>
                    <p>Review applicants and update their application status.</p>
                </div>
                <button className="btn-outline" onClick={() => navigate("/dashboard")}>← Dashboard</button>
            </header>

            {error && <p className="msg msg-error" role="alert">{error}</p>}
            {message && <p className="msg msg-success" role="status">{message}</p>}

            <form className="applications-filter" onSubmit={loadApplications}>
                <div className="applications-filter-copy">
                    <strong>Choose an event</strong>
                    <span>Applications will appear here once you select an event.</span>
                </div>
                <div className="applications-event-picker" ref={eventPickerRef}>
                    <button
                        className="applications-event-picker-trigger"
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={eventMenuOpen}
                        aria-label="Select event"
                        onClick={() => setEventMenuOpen((open) => !open)}
                        disabled={loadingEvents || events.length === 0}
                    >
                        <span>{selectedEvent?.title || (loadingEvents ? "Loading events…" : "Select an event")}</span>
                        <span className={`applications-event-picker-chevron ${eventMenuOpen ? "is-open" : ""}`} aria-hidden="true">⌄</span>
                    </button>
                    {eventMenuOpen && <div className="applications-event-picker-menu" role="listbox" aria-label="Available events">
                        {events.map((event) => (
                            <button
                                key={event.id}
                                type="button"
                                role="option"
                                aria-selected={String(event.id) === String(eventId)}
                                className="applications-event-picker-option"
                                onClick={() => {
                                    setEventId(String(event.id));
                                    setEventMenuOpen(false);
                                }}
                            >
                                <span>{event.title}</span>
                                {String(event.id) === String(eventId) && <b aria-hidden="true">✓</b>}
                            </button>
                        ))}
                    </div>}
                </div>
                <button className="btn-primary" type="submit" disabled={loadingEvents || loadingApplications || !eventId}>
                    {loadingApplications ? "Loading…" : "View applications"}
                </button>
            </form>

            {searched && applications.length > 0 && <>
                <div className="applications-results-heading">
                    <div>
                        <h2>{selectedEvent?.title || "Applications"}</h2>
                        <span>{applications.length} {applications.length === 1 ? "application" : "applications"}</span>
                    </div>
                    <div className="application-summary">
                        <span><i className="summary-dot summary-dot-pending" />{pendingCount} pending</span>
                        <span><i className="summary-dot summary-dot-approved" />{approvedCount} approved</span>
                        <span><i className="summary-dot summary-dot-rejected" />{rejectedCount} rejected</span>
                    </div>
                </div>

                <section className="applications-grid" aria-label="Applications">
                    {applications.map((application, index) => {
                        const key = applicationKey(application, index);
                        const isReviewing = reviewingApplicationKey === key;
                        const reviewed = application.status !== "Pending";
                        return (
                            <article className="application-card" key={key}>
                                <div className="application-card-heading">
                                    <div className="applicant-avatar">{getInitials(application.userName)}</div>
                                    <div className="applicant-identity">
                                        <h3>{application.userName || "Student"}</h3>
                                        <span>Event applicant</span>
                                    </div>
                                    <span className={statusClass(application.status)}>{application.status || "Pending"}</span>
                                </div>
                                <div className="application-card-details">
                                    <div><span>Mobile number</span><strong>{application.mobile || "Not provided"}</strong></div>
                                    <div><span>Event</span><strong>{selectedEvent?.title || `Event #${application.eventId}`}</strong></div>
                                </div>
                                <div className="application-card-footer">
                                    <span>{reviewed ? "This application has been reviewed" : "Waiting for review"}</span>
                                    <div className="application-review-actions">
                                        <button className="btn-success" onClick={() => handleReview(application, "Approved", index)} disabled={reviewed || isReviewing}>
                                            {isReviewing ? "Saving…" : "Approve"}
                                        </button>
                                        <button className="btn-danger" onClick={() => handleReview(application, "Rejected", index)} disabled={reviewed || isReviewing}>
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </section>
            </>}

            {loadingApplications && <div className="applications-empty"><span className="loading-spinner" /><p>Loading applications…</p></div>}
            {!loadingApplications && searched && applications.length === 0 && <div className="applications-empty"><div className="applications-empty-icon">▤</div><h2>No applications yet</h2><p>There are no applications for this event.</p></div>}
            {!searched && <div className="applications-empty"><div className="applications-empty-icon">⌕</div><h2>Select an event to begin</h2><p>Choose an event above to see its applications and review status.</p></div>}
        </div>
    );
}
