const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api").replace(/\/$/, "");

async function getErrorMessage(response, fallback) {
    const raw = await response.text().catch(() => "");
    let data = null;
    try {
        data = raw ? JSON.parse(raw) : null;
    } catch {
        data = raw;
    }
    const details = Array.isArray(data?.errors)
        ? data.errors
        : data?.errors && typeof data.errors === "object"
            ? Object.values(data.errors).flatMap((value) => Array.isArray(value) ? value : [value])
            : [];
    return [typeof data === "string" ? data : data?.message || data?.title, ...details]
        .filter((value, index, values) => typeof value === "string" && value && values.indexOf(value) === index)
        .join("\n") || fallback;
}
export async function loginUser(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email, passwordHash: credentials.password }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Login failed. Please check your credentials."));
    }

    const data = await response.json();

    if (!data.accessToken) {
        throw new Error("Login response does not contain an access token.");
    }

    return data;
}

export function getToken() {
    return localStorage.getItem("accessToken");
}

export function logoutUser() {
    localStorage.removeItem("accessToken");
}

export async function fetchWithAuth(endpoint, options = {}) {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (response.status === 401) {
        logoutUser();
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, `Request failed (${response.status}). Please try again.`));
    }

    if (response.status === 204) {
        return null;
    }

    const body = await response.text();
    if (!body) return null;
    try {
        return JSON.parse(body);
    } catch {
        return body;
    }
}

export async function registerUser(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: userData.fullName,
            email: userData.email,
            departmentId: Number(userData.department),
            passwordHash: userData.password,
            confirmPasswordHash: userData.confirmPassword,
        }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Registration failed. Please check your details."));
    }

    const data = await response.json();

    return data;
}

function decodeToken() {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
        const payload = token.split(".")[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(
            atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))
        );
    } catch {
        return null;
    }
}

export function getUserRole() {
    const decoded = decodeToken();
    if (!decoded) return null;
    const roleClaim =
        decoded.role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
        null;
    const role = Array.isArray(roleClaim) ? roleClaim[0] : roleClaim;
    return role === "Employee" ? "Student" : role || null;
}

export function getUserDepartment() {
    const decoded = decodeToken();
    if (!decoded) return null;
    return decoded.department || null;
}

export function getUserFullName() {
    const decoded = decodeToken();
    if (!decoded) return null;
    return decoded.fullName || decoded.name || null;
}

export function getUserId() {
    const decoded = decodeToken();
    if (!decoded) return null;
    return decoded.nameid || decoded.sub || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
}
