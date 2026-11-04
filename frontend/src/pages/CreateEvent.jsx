import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDepartments } from "../api/departments";
import { createEvent, getEvents, updateEvent } from "../api/events";
import { validateRequiredText } from "../utils/validation";

const EMPTY_FORM = { title: "", description: "", departments: [], venue: "", eventDate: "" };

function toDateTimeLocal(value) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      try {
        const [departmentData, eventData] = await Promise.all([
          getDepartments(),
          editing ? getEvents() : Promise.resolve([]),
        ]);
        if (cancelled) return;

        setDepartments(Array.isArray(departmentData) ? departmentData : []);
        if (editing) {
          const event = (Array.isArray(eventData) ? eventData : []).find((item) => String(item.id) === id);
          if (!event) {
            setError("Event not found.");
          } else {
            setForm({
              title: event.title || "",
              description: event.description || "",
              departments: (event.departments || []).map((item) => item.id),
              venue: event.venue || "",
              eventDate: toDateTimeLocal(event.eventDate),
            });
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load event form data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadFormData();
    return () => { cancelled = true; };
  }, [editing, id]);

  function toggleDepartment(departmentId) {
    setForm((current) => ({
      ...current,
      departments: current.departments.includes(departmentId)
        ? current.departments.filter((item) => item !== departmentId)
        : [...current.departments, departmentId],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const errors = [
      validateRequiredText(form.title, "Event title"),
      validateRequiredText(form.description, "Description"),
      validateRequiredText(form.venue, "Venue"),
    ].filter(Boolean);
    if (errors.length) return setError(errors.join(" "));
    if (!form.departments.length) return setError("Select at least one department.");

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        venue: form.venue.trim(),
        departmentIds: form.departments,
        eventDate: new Date(form.eventDate).toISOString(),
      };
      if (editing) {
        await updateEvent(id, payload);
      } else {
        await createEvent(payload);
      }
      navigate("/events", { state: { message: editing ? "Event updated successfully." : "Event created successfully." } });
    } catch (err) {
      setError(err.message || `Could not ${editing ? "update" : "create"} event.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="event-editor-page">
      <div className="page-header">
        <div>
          <h1>{editing ? "Edit Event" : "Create Event"}</h1>
          <p>{editing ? "Update the event details and participating departments." : "Add a new event for the selected departments."}</p>
        </div>
        <button className="btn-outline" onClick={() => navigate("/events")}>Back to Events</button>
      </div>

      {error && <p className="msg msg-error" role="alert">{error}</p>}
      {loading ? <p className="muted">Loading event…</p> : <section className="form-section event-editor-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label htmlFor="event-title">Event title</label><input id="event-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={150} required /></div>
          <div className="form-group"><label htmlFor="event-description">Description</label><textarea id="event-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} required /></div>
          <div className="form-group">
            <span className="form-label">Which departments can participate?</span>
            <div className="department-checkboxes">{departments.map((department) => <label className="dept-checkbox" key={department.id}><input type="checkbox" checked={form.departments.includes(department.id)} onChange={() => toggleDepartment(department.id)} />{department.departmentName}</label>)}</div>
          </div>
          <div className="form-row">
            <div className="form-group"><label htmlFor="event-venue">Venue</label><input id="event-venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} maxLength={100} required /></div>
            <div className="form-group"><label htmlFor="event-date">Date and time</label><input id="event-date" type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required /></div>
          </div>
          <div className="event-actions">
            <button className="btn-primary" type="submit" disabled={saving || loading || !departments.length}>{saving ? "Saving…" : editing ? "Save Changes" : "Create Event"}</button>
            <button className="btn-outline" type="button" onClick={() => navigate("/events")}>Cancel</button>
          </div>
        </form>
      </section>}
    </div>
  );
}
