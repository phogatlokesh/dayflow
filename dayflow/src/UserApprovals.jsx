import { useEffect, useState } from 'react'
import './UserApprovals.css'

const API_URL = import.meta.env.VITE_API_URL || ''

function UserApprovals({ token }) {
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const load = async () => { try { const response = await fetch(`${API_URL}/api/admin/pending-users`, { headers: { Authorization: `Bearer ${token}` } }); const data = await response.json(); if (!response.ok) throw new Error(data.message); setUsers(data.users); } catch (error) { setMessage(error.message); } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  const decide = async (employeeId, status) => { const response = await fetch(`${API_URL}/api/admin/pending-users/${employeeId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) }); const data = await response.json(); if (!response.ok) { setMessage(data.message); return } setUsers((current) => current.filter((user) => user.employee_id !== employeeId)); setMessage(`Employee ${status}. They have been notified through their account status.`) }
  return <section className="user-approvals"><header><div><p className="eyebrow">People / Access control</p><h1>Employee approvals</h1><p>Only verified personal-email signups appear here. Approve access once you confirm the employee details.</p></div></header>{message && <p className="approval-notice">{message}</p>}{loading ? <p className="approval-empty">Loading pending employee requests…</p> : users.length === 0 ? <p className="approval-empty">There are no employee signups awaiting approval.</p> : <div className="approval-list">{users.map((user) => <article key={user.employee_id}><div><strong>{user.employee_id}</strong><span>{user.email}</span><small>Requested {new Date(user.created_at).toLocaleDateString()}</small></div><div><button className="approval-reject" onClick={() => decide(user.employee_id, 'rejected')}>Reject</button><button className="approval-allow" onClick={() => decide(user.employee_id, 'approved')}>Approve access</button></div></article>)}</div>}</section>
}
export default UserApprovals
