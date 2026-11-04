import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserDepartment, getUserRole } from "../api/auth";
import { submitApplication } from "../api/applications";
import { deleteEvent, getEvents } from "../api/events";

export default function Events() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getUserRole();
  const department = getUserDepartment();
  const canManage = role === "Admin" || role === "Teacher";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [applyState, setApplyState] = useState(null);

  async function loadEvents() {
    setLoading(true);
    setError("");
    try {
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    getEvents()
      .then((data) => {
        if (!cancelled) setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function handleDelete(eventId) {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setError("");
    setMessage("");
    try {
      await deleteEvent(eventId);
      setEvents((current) => current.filter((item) => item.id !== eventId));
      setMessage("Event deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleApply(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await submitApplication({ eventId: applyState.eventId, aadhar: applyState.aadhar, mobile: applyState.mobile });
      setApplyState(null);
      setMessage("Your application was submitted. You can track its status in My Applications.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="events-page">
      <div className="page-header">
        <div>
          <h1>{role === "Student" ? "College Events" : role === "Teacher" ? "Department Events" : "All College Events"}</h1>
          <p>{role === "Student" ? `Events available for ${department || "your department"}` : "Browse and manage college events."}</p>
        </div>
        <div className="event-page-actions">
          {role === "Student" && <button className="btn-outline" onClick={() => navigate("/my-applications")}>My Applications</button>}
          {canManage && <button className="btn-primary" onClick={() => navigate("/events/create")}>Create Event</button>}
        </div>
      </div>

      {error && <p className="msg msg-error" role="alert">{error}</p>}
      {message && <p className="msg msg-success" role="status">{message}</p>}

      <section className="events-list-section">
        <div className="list-header"><h2>Available Events</h2><span className="muted">{events.length} events</span></div>
        {loading && <p className="muted">Loading events…</p>}
        {!loading && events.length === 0 && <div className="empty-state"><p>No events are available yet.</p></div>}
        <div className="event-grid">{events.map((item) => <article className="card event-card" key={item.id}>
          <div className="event-card-top">
            <div className="event-tags">{(item.departments || []).map((entry) => <span className="event-tag" key={entry.id}>{entry.departmentName}</span>)}</div>
            <span className="event-date">{new Date(item.eventDate).toLocaleString()}</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className="event-meta"><span>📍 {item.venue}</span><span>👥 {item.departments?.length || 0} departments</span></div>
          <div className="event-actions">
            {role === "Student" && <button className="btn-primary" onClick={() => { setError(""); setApplyState({ eventId: item.id, aadhar: "", mobile: "" }); }}>Apply to Participate</button>}
            {(role === "Admin" || role === "Teacher") && <button className="btn-outline" onClick={() => navigate(`/events/${item.id}/edit`)}>Edit Event</button>}
            {role === "Admin" && <button className="btn-danger" onClick={() => handleDelete(item.id)}>Delete Event</button>}
          </div>
        </article>)}</div>
      </section>

      {applyState && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setApplyState(null); }}>
        <form className="apply-modal" onSubmit={handleApply} role="dialog" aria-modal="true" aria-labelledby="apply-title">
          <button className="modal-close" type="button" aria-label="Close" onClick={() => setApplyState(null)}>×</button>
          <h2 id="apply-title">Apply to Participate</h2><p>Enter your contact details for this event.</p>
          <div className="form-group"><label htmlFor="apply-aadhar">Aadhaar number</label><input id="apply-aadhar" type="text" inputMode="numeric" pattern="[0-9]{12}" title="Enter a 12-digit Aadhaar number." maxLength={12} value={applyState.aadhar} onChange={(e) => setApplyState({ ...applyState, aadhar: e.target.value })} required /></div>
          <div className="form-group"><label htmlFor="apply-mobile">Mobile number</label><input id="apply-mobile" type="tel" inputMode="numeric" pattern="[0-9]{10}" title="Enter a 10-digit mobile number." maxLength={10} value={applyState.mobile} onChange={(e) => setApplyState({ ...applyState, mobile: e.target.value })} required /></div>
          <div className="event-actions"><button type="submit" className="btn-primary">Submit Application</button><button type="button" className="btn-outline" onClick={() => setApplyState(null)}>Cancel</button></div>
        </form>
      </div>}
    </div>
  );
}
