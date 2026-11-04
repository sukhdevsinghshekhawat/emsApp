import { fetchWithAuth } from "./auth";

export async function getUsers() {
    return fetchWithAuth("/users");
}

export async function getRoles() {
    return fetchWithAuth("/roles");
}

export async function updateUserRole(userId, roleId) {
    return fetchWithAuth("/user-roles/edit-role", {
        method: "PUT",
        body: JSON.stringify({ userId: Number(userId), roleId: Number(roleId) }),
    });
}
