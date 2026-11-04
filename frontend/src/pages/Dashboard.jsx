import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserFullName, getUserRole, logoutUser } from "../api/auth";
import { getMyApplications } from "../api/applications";
import { getEventApplications, getEvents } from "../api/events";

const EMPTY_METRICS = { total: 0, pending: 0, approved: 0, rejected: 0 };

function formatDate(value) {
    return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Date not set";
}

export default function Dashboard() {
    const navigate = useNavigate();
    const role = getUserRole();
    const fullName = getUserFullName();
    const isStudent = role === "Student";
    const [events, setEvents] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [metrics, setMetrics] = useState(EMPTY_METRICS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadDashboard() {
            setLoading(true);
            setError("");
            try {
                if (isStudent) {
                    const applications = await getMyApplications();
                    const list = Array.isArray(applications) ? applications : [];
                    if (cancelled) return;
                    setMyApplications(list);
                    setMetrics({
                        total: list.length,
                        pending: list.filter((item) => item.status === "Pending").length,
                        approved: list.filter((item) => item.status === "Approved").length,
                        rejected: list.filter((item) => item.status === "Rejected").length,
                    });
                    return;
                }

                const eventList = await getEvents();
                const list = Array.isArray(eventList) ? eventList : [];
                const applicationResults = await Promise.allSettled(
                    list.map((event) => getEventApplications(event.id))
                );
                if (cancelled) return;

                let total = 0;
                let pending = 0;
                let approved = 0;
                let rejected = 0;
                const eventsWithApplications = list.map((event, index) => {
                    const result = applicationResults[index];
                    const applications = result?.status === "fulfilled" && Array.isArray(result.value)
                        ? result.value
                        : [];
                    total += applications.length;
                    pending += applications.filter((item) => item.status === "Pending").length;
                    approved += applications.filter((item) => item.status === "Approved").length;
                    rejected += applications.filter((item) => item.status === "Rejected").length;
                    return { ...event, applicationCount: applications.length, pendingCount: applications.filter((item) => item.status === "Pending").length };
                });

                setEvents(eventsWithApplications);
                setMetrics({ total, pending, approved, rejected });
                if (applicationResults.some((result) => result.status === "rejected")) {
                    setError("Some event application counts could not be loaded.");
                }
            } catch (err) {
                if (!cancelled) setError(err.message || "Could not load dashboard information.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadDashboard();
        return () => { cancelled = true; };
    }, [isStudent]);

    function handleLogout() {
        logoutUser();
        navigate("/login");
    }

    const shortcuts = {
        Admin: [
            { title: "Manage events", detail: "Create, edit, and publish events", link: "/events", icon: "✦" },
            { title: "Review applications", detail: "See applicants and update status", link: "/applications", icon: "▤" },
            { title: "Manage users", detail: "Change user roles", link: "/admin/users", icon: "♙" },
        ],
        Teacher: [
            { title: "Manage events", detail: "Create and update event details", link: "/events", icon: "✦" },
            { title: "Review applications", detail: "Approve or reject applicants", link: "/applications", icon: "▤" },
        ],
        Student: [
            { title: "Browse events", detail: "Find an event to participate in", link: "/events", icon: "✦" },
            { title: "My applications", detail: "Track your application status", link: "/my-applications", icon: "▤" },
        ],
    };

    const cards = isStudent
        ? [
            { label: "My applications", value: metrics.total, icon: "▤", tone: "blue" },
            { label: "Awaiting review", value: metrics.pending, icon: "◷", tone: "amber" },
            { label: "Approved", value: metrics.approved, icon: "✓", tone: "green" },
            { label: "Not approved", value: metrics.rejected, icon: "×", tone: "rose" },
        ]
        : [
            { label: "Total applications", value: metrics.total, icon: "▤", tone: "blue" },
            { label: "Pending review", value: metrics.pending, icon: "◷", tone: "amber" },
            { label: "Approved", value: metrics.approved, icon: "✓", tone: "green" },
            { label: "Events", value: events.length, icon: "✦", tone: "violet" },
        ];

    return (
        <div className="dashboard-page">
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-eyebrow">COLLEGE EVENT MANAGEMENT</span>
                    <h1>{fullName ? `Welcome back, ${fullName}` : `Welcome to your dashboard`}</h1>
                    <p>{isStudent ? "Here’s an overview of your event applications." : "Here’s what’s happening across your events."}</p>
                </div>
                <button className="dashboard-logout" onClick={handleLogout}>Log out</button>
                <span className="dashboard-welcome-mark" aria-hidden="true">✦</span>
            </section>

            {!role && <p className="msg msg-error">Your role could not be read. Please log in again.</p>}
            {error && <p className="msg msg-error" role="alert">{error}</p>}

            <section className="dashboard-metrics" aria-label="Dashboard totals">
                {cards.map((card) => (
                    <article className="dashboard-metric-card" key={card.label}>
                        <span className={`dashboard-metric-icon dashboard-tone-${card.tone}`}>{card.icon}</span>
                        <div><span>{card.label}</span><strong>{loading ? "—" : card.value}</strong></div>
                    </article>
                ))}
            </section>

            <div className="dashboard-content-grid">
                <section className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                        <div><h2>{isStudent ? "Recent applications" : "Applications by event"}</h2><p>{isStudent ? "Your latest application statuses" : "See how many students applied to each event"}</p></div>
                        <Link to={isStudent ? "/my-applications" : "/applications"}>View all <span aria-hidden="true">→</span></Link>
                    </div>

                    {loading && <div className="dashboard-loading">Loading dashboard data…</div>}
                    {!loading && !isStudent && events.length === 0 && <div className="dashboard-empty">No events have been created yet.</div>}
                    {!loading && !isStudent && events.length > 0 && <div className="event-application-list">
                        {events.map((event) => (
                            <article className="event-application-row" key={event.id}>
                                <div className="event-application-mark">✦</div>
                                <div className="event-application-info">
                                    <strong>{event.title}</strong>
                                    <span>{formatDate(event.eventDate)} · {event.venue}</span>
                                    <div className="event-application-meter"><i style={{ width: `${event.applicationCount ? Math.max(8, (event.pendingCount / event.applicationCount) * 100) : 0}%` }} /></div>
                                </div>
                                <div className="event-application-count"><strong>{event.applicationCount}</strong><span>{event.pendingCount} pending</span></div>
                            </article>
                        ))}
                    </div>}
                    {!loading && isStudent && myApplications.length === 0 && <div className="dashboard-empty">You haven’t applied to any events yet. <Link to="/events">Browse events</Link></div>}
                    {!loading && isStudent && myApplications.length > 0 && <div className="student-application-list">
                        {myApplications.slice(0, 5).map((application, index) => (
                            <article className="student-application-row" key={`${application.title}-${application.eventDate}-${index}`}>
                                <div><strong>{application.title}</strong><span>{application.venue} · {formatDate(application.eventDate)}</span></div>
                                <span className={`dashboard-status dashboard-status-${(application.status || "pending").toLowerCase()}`}>{application.status || "Pending"}</span>
                            </article>
                        ))}
                    </div>}
                </section>

                <aside className="dashboard-panel dashboard-shortcuts-panel">
                    <div className="dashboard-panel-heading"><div><h2>Quick actions</h2><p>Go to a section</p></div></div>
                    <div className="dashboard-shortcuts">
                        {(shortcuts[role] || []).map((shortcut) => (
                            <Link to={shortcut.link} className="dashboard-shortcut" key={shortcut.link}>
                                <span className="dashboard-shortcut-icon">{shortcut.icon}</span>
                                <span><strong>{shortcut.title}</strong><small>{shortcut.detail}</small></span>
                                <b aria-hidden="true">→</b>
                            </Link>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}
