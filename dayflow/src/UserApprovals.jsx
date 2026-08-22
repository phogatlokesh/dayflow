import { useEffect, useState } from "react";
import "./UserApprovals.css";

const API_URL = import.meta.env.VITE_API_URL || "";

function UserApprovals({ token }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setUsers(data.employees);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const decide = async (employeeId, status) => {
    const response = await fetch(
      `${API_URL}/api/admin/pending-users/${employeeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message);
      return;
    }
    setUsers((current) => current.map((user) => user.employee_id === employeeId ? { ...user, approval_status: status } : user));
    setMessage(
      `Employee ${status}. They have been notified through their account status.`,
    );
  };
  return (
    <section className="user-approvals">
      <header>
        <div>
          <p className="eyebrow">People / Access control</p>
          <h1>Employee directory</h1>
          <p>
            Review every employee ID and profile record. New verified signups
            appear here with a pending approval status.
          </p>
        </div>
      </header>
      {message && <p className="approval-notice">{message}</p>}
      {loading ? (
        <p className="approval-empty">Loading employee directory…</p>
      ) : users.length === 0 ? (
        <p className="approval-empty">
          There are no employee records yet.
        </p>
      ) : (
        <div className="approval-list">
          {users.map((user) => (
            <article key={user.employee_id}>
              <div>
                <strong>{user.employee_id}</strong>
                <span>{user.email}</span>
                <small>
                  {user.approval_status === "email_verification_pending" ? `New signup · ${user.designation || "Designation not provided"}` : `${user.first_name} ${user.last_name} · ${user.designation || "Employee"} · ${user.department || "Unassigned"} · ${user.phone || "No phone"} · ${user.salary || "Salary not set"}`}
                </small>
              </div>
              <div><span className={`approval-status ${user.approval_status}`}>{user.approval_status}</span>{user.approval_status === "pending" && <><button className="approval-reject" onClick={() => decide(user.employee_id, "rejected")}>Reject</button><button className="approval-allow" onClick={() => decide(user.employee_id, "approved")}>Approve access</button></>}</div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
export default UserApprovals;
