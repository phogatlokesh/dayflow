import { useMemo, useState } from 'react'
import './LeaveManagement.css'

const seedRequests = [
  { id: 1, employee: 'Maya Patel', employeeId: 'maya@dayflow.com', type: 'Paid', startDate: '2026-09-14', endDate: '2026-09-18', reason: 'Family trip planned in advance.', issue: 'Planned time away', status: 'Approved', comment: 'Approved. Please ensure your handover is complete.' },
  { id: 2, employee: 'Jordan Lee', employeeId: 'jordan@dayflow.com', type: 'Sick', startDate: '2026-08-25', endDate: '2026-08-26', reason: 'Recovering from a seasonal illness.', issue: 'Medical appointment', status: 'Pending', comment: '' },
  { id: 3, employee: 'Alex Morgan', employeeId: 'alex@dayflow.com', type: 'Unpaid', startDate: '2026-09-03', endDate: '2026-09-04', reason: 'Personal commitment that cannot be rescheduled.', issue: 'Personal emergency', status: 'Rejected', comment: 'Please discuss alternative dates with your manager.' },
]

const emptyRequest = { type: 'Paid', startDate: '', endDate: '', reason: '', issue: 'Planned time away' }
const isApprover = (role) => role === 'HR' || role === 'Admin'
const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function LeaveManagement({ userRole = 'Employee', userId = 'alex@dayflow.com' }) {
  const [requests, setRequests] = useState(seedRequests)
  const [form, setForm] = useState(emptyRequest)
  const [notice, setNotice] = useState('')
  const [comments, setComments] = useState({})
  const approver = isApprover(userRole)
  const currentEmployee = userId || 'alex@dayflow.com'
  const visibleRequests = useMemo(() => approver ? requests : requests.filter((request) => request.employeeId === currentEmployee), [approver, currentEmployee, requests])

  const submitRequest = (event) => {
    event.preventDefault()
    if (form.endDate < form.startDate) {
      setNotice('Choose an end date that is on or after the start date.')
      return
    }
    const request = { id: Date.now(), employee: 'You', employeeId: currentEmployee, ...form, status: 'Pending', comment: '' }
    setRequests((current) => [request, ...current])
    setForm(emptyRequest)
    setNotice('Your leave request was sent to HR and your manager.')
  }

  const updateStatus = (id, status) => {
    setRequests((current) => current.map((request) => request.id === id ? { ...request, status, comment: comments[id] || request.comment } : request))
    setNotice(`Leave request ${status.toLowerCase()}. The employee record was updated immediately.`)
  }

  return <section className="leave-page"><header className="leave-heading"><div><p className="eyebrow">People / Time off</p><h1>Leave & time-off</h1><p>{approver ? 'Review requests, leave a decision, and keep every employee record current.' : 'Request time away from home and track every decision in one place.'}</p></div><span className={`leave-role ${approver ? 'approver' : ''}`}>{approver ? `${userRole} approval view` : 'Employee self-service'}</span></header>{notice && <div className="leave-notice" role="status">{notice}</div>}<div className="leave-layout"><form className="leave-form" onSubmit={submitRequest}><div className="leave-section-title"><p>New request</p><h2>Plan your time away</h2></div><label>Leave type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Paid</option><option>Sick</option><option>Unpaid</option></select></label><div className="leave-date-grid"><label>Start date<input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required /></label><label>End date<input type="date" min={form.startDate} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required /></label></div><label>Reason for leave<select value={form.issue} onChange={(event) => setForm({ ...form, issue: event.target.value })}><option>Planned time away</option><option>Medical appointment</option><option>Personal emergency</option><option>Family care</option><option>Other</option></select></label><label>Remarks<textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Share any details your HR team or manager should know." required /></label><button className="leave-submit" type="submit">Send leave request <span>→</span></button></form><div className="leave-summary"><p className="section-kicker">Your leave at a glance</p><h2>{approver ? 'Team requests' : 'Your request status'}</h2><div className="status-totals"><div><strong>{visibleRequests.filter((request) => request.status === 'Pending').length}</strong><span>Pending</span></div><div><strong>{visibleRequests.filter((request) => request.status === 'Approved').length}</strong><span>Approved</span></div><div><strong>{visibleRequests.filter((request) => request.status === 'Rejected').length}</strong><span>Rejected</span></div></div><p className="summary-note">{approver ? 'Each approval or rejection is immediately reflected in the employee’s private status view.' : 'Only you, HR, and your manager can access your leave details.'}</p></div></div><section className="requests-panel"><div className="requests-heading"><div><p className="section-kicker">{approver ? 'All employee requests' : 'Private request history'}</p><h2>{approver ? 'Leave approvals' : 'My leave requests'}</h2></div><span>{visibleRequests.length} request{visibleRequests.length === 1 ? '' : 's'}</span></div>{visibleRequests.length === 0 ? <div className="leave-empty">No leave requests yet. Submit the form above to get started.</div> : <div className="request-list">{visibleRequests.map((request) => <article className="request-card" key={request.id}><div className="request-main"><div className="request-person">{approver && <><span className="person-avatar">{request.employee.charAt(0)}</span><strong>{request.employee}</strong></>}<span className={`leave-type ${request.type.toLowerCase()}`}>{request.type} leave</span></div><h3>{formatDate(request.startDate)} – {formatDate(request.endDate)}</h3><p className="request-issue">{request.issue}</p><p className="request-reason">{request.reason}</p>{request.comment && <p className="request-comment"><b>{approver ? 'Your note:' : 'HR note:'}</b> {request.comment}</p>}</div><div className="request-action"><span className={`leave-status ${request.status.toLowerCase()}`}>{request.status}</span>{approver && request.status === 'Pending' && <div className="approval-actions"><textarea aria-label={`Comment for ${request.employee}`} placeholder="Optional comment" value={comments[request.id] || ''} onChange={(event) => setComments({ ...comments, [request.id]: event.target.value })} /><div><button type="button" className="reject-button" onClick={() => updateStatus(request.id, 'Rejected')}>Reject</button><button type="button" className="approve-button" onClick={() => updateStatus(request.id, 'Approved')}>Approve</button></div></div>}</div></article>)}</div>}</section></section>
}

export default LeaveManagement
