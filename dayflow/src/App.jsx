import { useState } from 'react'
import './App.css'
import AttendanceTracking from './AttendanceTracking'
import EmployeeProfile from './EmployeeProfile'
import LeaveManagement from './LeaveManagement'

const API_URL = import.meta.env.VITE_API_URL || ''

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.8 3.1-4.3 3.1-7.4Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.2 13.7A6 6 0 0 1 5.9 12c0-.6.1-1.2.3-1.7V7.7H2.9A10 10 0 0 0 2 12c0 1.5.4 3 1 4.3l3.2-2.6Z" /><path fill="#EA4335" d="M12 6c1.7 0 3.2.6 4.4 1.7l3.3-3.2C17.8 2.8 15.1 2 12 2a10 10 0 0 0-9.1 5.7l3.3 2.6C7 7.8 9.3 6 12 6Z" /></svg>
}

function MicrosoftIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#f35325" d="M2 2h9.5v9.5H2z" /><path fill="#81bc06" d="M12.5 2H22v9.5h-9.5z" /><path fill="#05a6f0" d="M2 12.5h9.5V22H2z" /><path fill="#ffba08" d="M12.5 12.5H22V22h-9.5z" /></svg>
}

function App() {
  const [view, setView] = useState('signin')
  const [form, setForm] = useState({ employeeId: '', email: '', password: '', role: 'Employee', designation: 'Software Engineer' })
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [dashboardView, setDashboardView] = useState('profile')
  const [userRole, setUserRole] = useState('Employee')
  const [userId, setUserId] = useState(null)
  const [userDesignation, setUserDesignation] = useState('Software Engineer')

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
    setFeedback(null)
  }

  const submitForm = async (event) => {
    event.preventDefault()
    if (view === 'signup' && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(form.password)) {
      setFeedback({ type: 'error', text: 'Use 8+ characters with uppercase, lowercase, a number, and a symbol.' })
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/${view}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) {
        setFeedback({ type: 'error', text: data.message || 'Authentication failed. Please try again.' })
        return
      }
      if (view === 'signin') {
        setIsLoggedIn(true)
        setUserRole(data.user?.role || 'Employee')
        setUserDesignation(form.designation || 'Software Engineer')
        setUserId(data.user?.email || form.email)
      } else {
        setFeedback({ type: 'success', text: 'Account created. You can now sign in.' })
        setView('signin')
      }
    } catch (error) {
      console.error('Request failed:', error);
      const errorMsg = error.message === 'Failed to fetch' 
        ? 'Cannot reach the server. Check if backend is running and accessible.' 
        : error.message;
      setFeedback({ type: 'error', text: `The server is unavailable: ${errorMsg}` })
    }
  }


  if (isLoggedIn) {
    return <main className="dashboard-page"><nav className="topbar"><a href="/" className="brand"><span className="brand-mark">d</span>dayflow</a><div className="workspace-nav"><button className={dashboardView === 'profile' ? 'active' : ''} onClick={() => setDashboardView('profile')}>My profile</button><button className={dashboardView === 'attendance' ? 'active' : ''} onClick={() => setDashboardView('attendance')}>Attendance</button><button className={dashboardView === 'leave' ? 'active' : ''} onClick={() => setDashboardView('leave')}>Leave & time off</button></div><button className="secondary-button" onClick={() => setIsLoggedIn(false)}>Sign out</button></nav>{dashboardView === 'profile' ? <EmployeeProfile /> : dashboardView === 'attendance' ? <AttendanceTracking userRole={userRole} userId={userId} userDesignation={userDesignation} /> : <LeaveManagement userRole={userRole} userId={userId} />}</main>
  }

  const action = view === 'signin' ? 'Sign in' : 'Sign up'

  return <main className="auth-page"><section className="brand-panel"><div className="brand-lockup"><span className="brand-mark">d</span><span>dayflow</span></div><div className="brand-copy"><p className="eyebrow">A calmer way to work</p><h1>Make room for<br /><em>good work.</em></h1><p>One clear place for your people, priorities, and daily rhythm.</p></div><p className="principle">Clarity is the beginning of momentum.</p></section><section className="form-panel"><div className="form-inner"><div className="mobile-brand brand-lockup"><span className="brand-mark">d</span><span>dayflow</span></div><header className="form-heading"><p className="eyebrow">Your workspace awaits</p><h2>{view === 'signin' ? 'Welcome back.' : 'Start your flow.'}</h2><p>{view === 'signin' ? 'Sign in to pick up where you left off.' : 'Create your account in less than a minute.'}</p></header><div className="tabs" role="tablist"><button className={view === 'signin' ? 'active' : ''} onClick={() => { setView('signin'); setFeedback(null) }} role="tab" aria-selected={view === 'signin'}>Sign in</button><button className={view === 'signup' ? 'active' : ''} onClick={() => { setView('signup'); setFeedback(null) }} role="tab" aria-selected={view === 'signup'}>Sign up</button></div><div className="social-auth" aria-label={`${action} with a provider`}><button type="button" className="provider-button"><GoogleIcon />Continue with Google</button><button type="button" className="provider-button"><MicrosoftIcon />Continue with Outlook</button></div><div className="auth-divider"><span>or continue with email</span></div><form onSubmit={submitForm}>{view === 'signup' && <label>Employee ID<input name="employeeId" value={form.employeeId} onChange={updateForm} placeholder="e.g. DF-1048" required /></label>}<label>Email address<input name="email" type="email" value={form.email} onChange={updateForm} placeholder="you@company.com" required /></label><label>Password<div className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateForm} placeholder="Enter your password" required /><button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>{view === 'signup' && <label>Role<select name="role" value={form.role} onChange={updateForm}><option>Employee</option><option>HR</option><option>Admin</option></select></label>}{view === 'signup' && <label>Designation<select name="designation" value={form.designation} onChange={updateForm}><option>Software Engineer</option><option>Senior Software Engineer</option><option>Manager</option><option>Project Manager</option><option>HR Manager</option><option>Business Analyst</option><option>Quality Assurance</option><option>DevOps Engineer</option></select></label>}{view === 'signup' && <p className="password-rules">8+ characters · uppercase · lowercase · number · symbol</p>}{feedback && <p className={`feedback ${feedback.type}`} role="alert">{feedback.text}</p>}<button className="submit-button" type="submit">{view === 'signin' ? 'Sign in to Dayflow' : 'Create account'} <span>-&gt;</span></button></form>{view === 'signin' && <p className="demo-access">Demo access: <strong>alex@dayflow.com</strong> / <strong>Dayflow123!</strong></p>}<p className="legal">By continuing, you agree to our <a href="/">Terms</a> and <a href="/">Privacy Policy</a>.</p></div></section></main>
}

export default App




