import { useState } from 'react'
import './EmployeeProfile.css'

const initialProfile = {
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex@dayflow.com',
  phone: '+1 (415) 555-0182',
  address: '84 Willow Street, San Francisco, CA 94107',
  employeeId: 'DF-1048',
  role: 'Product Designer',
  department: 'Design',
  manager: 'Maya Patel',
  startDate: 'September 12, 2022',
  employment: 'Full-time',
  salary: '$118,000',
  paySchedule: 'Monthly',
}

function EmployeeProfile() {
  const [profile, setProfile] = useState(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateField = (event) => {
    setProfile({ ...profile, [event.target.name]: event.target.value })
    setSaved(false)
  }

  const saveProfile = (event) => {
    event.preventDefault()
    setIsEditing(false)
    setSaved(true)
  }

  const editableFields = isAdmin
    ? ['firstName', 'lastName', 'email', 'phone', 'address', 'role', 'department', 'manager', 'startDate', 'employment', 'salary', 'paySchedule']
    : ['phone', 'address']

  const fieldLabel = (field) => ({
    firstName: 'First name', lastName: 'Last name', email: 'Work email', phone: 'Phone', address: 'Home address',
    role: 'Job title', department: 'Department', manager: 'Reports to', startDate: 'Start date', employment: 'Employment type',
    salary: 'Annual salary', paySchedule: 'Pay schedule',
  })[field]

  const renderDetail = (label, value) => <div className="profile-detail" key={label}><dt>{label}</dt><dd>{value}</dd></div>

  return (
    <section className="profile-page">
      <header className="profile-heading">
        <div>
          <p className="eyebrow">People / My profile</p>
          <h1>Employee profile</h1>
          <p className="muted">Keep your details current and your work story in one place.</p>
        </div>
        <div className="profile-actions">
          <label className="role-toggle"><span>View as</span><select value={isAdmin ? 'Admin' : 'Employee'} onChange={(event) => setIsAdmin(event.target.value === 'Admin')}><option>Employee</option><option>Admin</option></select></label>
          {!isEditing && <button className="profile-button primary" onClick={() => { setIsEditing(true); setSaved(false) }}>Edit profile <span>↗</span></button>}
        </div>
      </header>

      {saved && <div className="save-note" role="status">Profile changes saved successfully.</div>}

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="avatar-wrap"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80" alt="Alex Morgan" /><button className="avatar-edit" aria-label="Change profile picture">+</button></div>
          <h2>{profile.firstName} {profile.lastName}</h2>
          <p>{profile.role}</p>
          <span className="status-pill"><i /> Active</span>
          <div className="sidebar-rule" />
          <a className="side-link active" href="#personal">Personal details <span>01</span></a>
          <a className="side-link" href="#job">Job details <span>02</span></a>
          <a className="side-link" href="#salary">Salary structure <span>03</span></a>
          <a className="side-link" href="#documents">Documents <span>04</span></a>
          <div className="profile-complete"><div><span>Profile completeness</span><strong>92%</strong></div><div className="progress"><i /></div><small>One detail left to add</small></div>
        </aside>

        <div className="profile-main">
          {isEditing ? (
            <form className="edit-panel" onSubmit={saveProfile}>
              <div className="panel-title"><div><p className="section-kicker">{isAdmin ? 'Administrator access' : 'Your editable details'}</p><h2>{isAdmin ? 'Edit all employee details' : 'Update your profile'}</h2></div><span className="access-badge">{isAdmin ? 'Full access' : 'Limited access'}</span></div>
              <div className="edit-grid">{editableFields.map((field) => <label key={field}>{fieldLabel(field)}<input name={field} value={profile[field]} onChange={updateField} /></label>)}</div>
              <div className="edit-footer"><span>Changes are only visible to your workspace.</span><div><button type="button" className="profile-button" onClick={() => setIsEditing(false)}>Cancel</button><button type="submit" className="profile-button primary">Save changes <span>✓</span></button></div></div>
            </form>
          ) : (
            <>
              <section className="profile-panel" id="personal"><div className="panel-title"><div><p className="section-kicker">01 / Personal</p><h2>Personal details</h2></div><span className="panel-caption">Visible to your team</span></div><dl className="detail-grid">{renderDetail('Full name', `${profile.firstName} ${profile.lastName}`)}{renderDetail('Work email', profile.email)}{renderDetail('Phone', profile.phone)}{renderDetail('Home address', profile.address)}</dl></section>
              <section className="profile-panel" id="job"><div className="panel-title"><div><p className="section-kicker">02 / Work</p><h2>Job details</h2></div><span className="panel-caption">Dayflow, Inc.</span></div><dl className="detail-grid">{renderDetail('Employee ID', profile.employeeId)}{renderDetail('Job title', profile.role)}{renderDetail('Department', profile.department)}{renderDetail('Reports to', profile.manager)}{renderDetail('Start date', profile.startDate)}{renderDetail('Employment type', profile.employment)}</dl></section>
              <div className="lower-panels"><section className="profile-panel compact-panel" id="salary"><div className="panel-title"><div><p className="section-kicker">03 / Compensation</p><h2>Salary structure</h2></div></div><dl>{renderDetail('Annual salary', profile.salary)}{renderDetail('Pay schedule', profile.paySchedule)}{renderDetail('Next review', 'October 2026')}</dl><p className="private-note">Private · Only you and admins can view this</p></section><section className="profile-panel compact-panel" id="documents"><div className="panel-title"><div><p className="section-kicker">04 / Records</p><h2>Documents</h2></div><button className="text-button">View all ↗</button></div><div className="document-item"><span className="file-icon">PDF</span><div><strong>Employment agreement</strong><small>Signed Sep 12, 2022 · 1.2 MB</small></div><button className="download-button" aria-label="Download employment agreement">↓</button></div><div className="document-item"><span className="file-icon green">PDF</span><div><strong>2025 tax documents</strong><small>Added Jan 18, 2026 · 840 KB</small></div><button className="download-button" aria-label="Download tax documents">↓</button></div></section></div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default EmployeeProfile