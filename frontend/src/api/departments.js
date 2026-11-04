import { fetchWithAuth } from "./auth";

export async function getDepartments() {
    return fetchWithAuth("/department");
}
