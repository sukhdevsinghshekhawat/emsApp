import { fetchWithAuth, getUserId } from "./auth";

export async function submitApplication(payload) {
    const userId = getUserId();
    if (!userId) throw new Error("Could not read your user ID. Please log in again.");

    return fetchWithAuth("/applications/create", {
        method: "POST",
        body: JSON.stringify({
            userId: Number(userId),
            eventId: Number(payload.eventId),
            aadhar: payload.aadhar,
            mobile: payload.mobile,
            status: "Pending",
        }),
    });
}
export async function getMyApplications() {
    const userId = getUserId();
    if (!userId) throw new Error("Could not read your user ID. Please log in again.");
    const encodedUserId = encodeURIComponent(userId);
    return fetchWithAuth(`/applications/myapplication/${encodedUserId}?userId=${encodedUserId}`);
}

export async function reviewApplication(payload) {
    return fetchWithAuth("/applications/review", {
        method: "PUT",
        body: JSON.stringify({
            userId: Number(payload.userId),
            eventId: Number(payload.eventId),
            status: payload.status,
        }),
    });
}
