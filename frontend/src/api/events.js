import { fetchWithAuth } from "./auth";

export async function getEvents() {
    try {
        return await fetchWithAuth("/events/gets");
    } catch (error) {
        if (error.message === "No events found.") return [];
        throw error;
    }
}

export async function createEvent(payload) {
    return fetchWithAuth("/events/create", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateEvent(id, payload) {
    return fetchWithAuth(`/events/edit/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteEvent(id) {
    return fetchWithAuth(`/events/delete/${id}`, { method: "DELETE" });
}

export async function getEventApplications(eventId) {
    return fetchWithAuth(`/events/application/${encodeURIComponent(eventId)}`);
}
