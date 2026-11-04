import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoles, getUsers, updateUserRole } from "../api/admin";

function findRoleId(userRole, roles) {
    const matchingRole = roles.find((role) => role.roleName?.toLowerCase() === userRole?.toLowerCase());
    return matchingRole ? String(matchingRole.id) : "";
}

export default function AdminUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [savingUserId, setSavingUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadUsersAndRoles() {
            try {
                const [userData, roleData] = await Promise.all([getUsers(), getRoles()]);
                if (cancelled) return;

                const userList = Array.isArray(userData) ? userData : [];
                const roleList = Array.isArray(roleData) ? roleData : [];
                setUsers(userList);
                setRoles(roleList);
                setSelectedRoles(Object.fromEntries(
                    userList.map((user) => [user.userId, findRoleId(user.role, roleList)])
                ));
            } catch (err) {
                if (!cancelled) setError(err.message || "Could not load users and roles.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadUsersAndRoles();
        return () => { cancelled = true; };
    }, []);

    async function handleRoleUpdate(user) {
        const roleId = selectedRoles[user.userId];
        if (!roleId) {
            setError("Select a role first.");
            return;
        }

        setError("");
        setMessage("");
        setSavingUserId(user.userId);
        try {
            await updateUserRole(user.userId, roleId);
            const roleName = roles.find((role) => String(role.id) === String(roleId))?.roleName;
            setUsers((current) => current.map((item) =>
                item.userId === user.userId ? { ...item, role: roleName } : item
            ));
            setMessage(`Role updated for ${user.name || user.email}.`);
        } catch (err) {
            setError(err.message || "Could not update this user's role.");
        } finally {
            setSavingUserId(null);
        }
    }

    return (
        <div className="layout-main">
            <div className="page-header">
                <div>
                    <h1>Manage Users</h1>
                    <p>Change a user's role with the role selector.</p>
                </div>
                <button className="back-btn" onClick={() => navigate("/dashboard")}>
                    ← Back to Dashboard
                </button>
            </div>

            {error && <p className="msg msg-error" role="alert">{error}</p>}
            {message && <p className="msg msg-success" role="status">{message}</p>}
            {loading && <p className="muted">Loading users and roles…</p>}
            {!loading && users.length === 0 && <div className="empty-state"><p>No users found.</p></div>}

            <div style={{ display: "grid", gap: 12 }}>
                {users.map((user) => {
                    const isSaving = savingUserId === user.userId;
                    const selectedRole = selectedRoles[user.userId] || "";
                    const roleUnchanged = findRoleId(user.role, roles) === selectedRole;

                    return (
                        <article key={user.userId} className="card admin-user-row">
                            <div>
                                <div style={{ fontWeight: 600 }}>{user.name || "Unnamed user"}</div>
                                <div className="muted">{user.email}</div>
                                <div className="muted">Current role: {user.role || "Not assigned"}</div>
                            </div>
                            <div className="event-actions">
                                <div className="form-group">
                                    <label htmlFor={`user-role-${user.userId}`}>Role</label>
                                    <select
                                        id={`user-role-${user.userId}`}
                                        value={selectedRole}
                                        onChange={(event) => setSelectedRoles((current) => ({ ...current, [user.userId]: event.target.value }))}
                                        disabled={isSaving}
                                        required
                                    >
                                        <option value="">Select role</option>
                                        {roles.map((role) => <option key={role.id} value={role.id}>{role.roleName}</option>)}
                                    </select>
                                </div>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleRoleUpdate(user)}
                                    disabled={isSaving || !selectedRole || roleUnchanged}
                                >
                                    {isSaving ? "Saving…" : "Update role"}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
