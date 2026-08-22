import { useState } from 'react'
import './App.css'
import AttendanceTracking from './AttendanceTracking'
import EmployeeProfile from './EmployeeProfile'

function App() {
  const [view, setView] = useState('signin')
  const [form, setForm] = useState({ employeeId: '', email: '', password: '', role: 'Employee' })
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [dashboardView, setDashboardView] = useState('profile')

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
    setFeedback(null)
  }

  const submitForm = (event) => {
    event.preventDefault()
    if (view === 'signin') {
      if (form.email !== 'alex@dayflow.com' || form.password !== 'Dayflow123!') {
        setFeedback({ type: 'error', text: 'Incorrect email or password. Please try again.' })
        return
      }
      setIsLoggedIn(true)
      return
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(form.password)) {
      setFeedback({ type: 'error', text: 'Use 8+ characters with uppercase, lowercase, a number, and a symbol.' })
      return
    }
    setFeedback({ type: 'success', text: 'Account created. Check your email to verify your account before signing in.' })
  }

  if (isLoggedIn) {
    return <main className="dashboard-page"><nav className="topbar"><a href="/" className="brand"><span className="brand-mark">d</span>dayflow</a><div className="workspace-nav"><button className={dashboardView === 'profile' ? 'active' : ''} onClick={() => setDashboardView('profile')}>My profile</button><button className={dashboardView === 'attendance' ? 'active' : ''} onClick={() => setDashboardView('attendance')}>Attendance</button></div><button className="secondary-button" onClick={() => setIsLoggedIn(false)}>Sign out</button></nav>{dashboardView === 'profile' ? <EmployeeProfile /> : <AttendanceTracking />}</main>
  }

  return <main className="auth-page"><section className="brand-panel"><div className="brand-lockup"><span className="brand-mark">d</span><span>dayflow</span></div><div className="brand-copy"><p className="eyebrow">A calmer way to work</p><h1>Make room for<br /><em>good work.</em></h1><p>One clear place for your people, priorities, and daily rhythm.</p></div><p className="principle">Clarity is the beginning of momentum.</p></section><section className="form-panel"><div className="form-inner"><div className="mobile-brand brand-lockup"><span className="brand-mark">d</span><span>dayflow</span></div><header className="form-heading"><p className="eyebrow">Your workspace awaits</p><h2>{view === 'signin' ? 'Welcome back.' : 'Start your flow.'}</h2><p>{view === 'signin' ? 'Sign in to pick up where you left off.' : 'Create your account in less than a minute.'}</p></header><div className="tabs" role="tablist"><button className={view === 'signin' ? 'active' : ''} onClick={() => { setView('signin'); setFeedback(null) }} role="tab" aria-selected={view === 'signin'}>Sign in</button><button className={view === 'signup' ? 'active' : ''} onClick={() => { setView('signup'); setFeedback(null) }} role="tab" aria-selected={view === 'signup'}>Sign up</button></div><form onSubmit={submitForm}>{view === 'signup' && <label>Employee ID<input name="employeeId" value={form.employeeId} onChange={updateForm} placeholder="e.g. DF-1048" required /></label>}<label>Email address<input name="email" type="email" value={form.email} onChange={updateForm} placeholder="you@company.com" required /></label><label>Password<div className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateForm} placeholder="Enter your password" required /><button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>{view === 'signup' && <label>Role<select name="role" value={form.role} onChange={updateForm}><option>Employee</option><option>HR</option></select></label>}{view === 'signup' && <p className="password-rules">8+ characters · uppercase · lowercase · number · symbol</p>}{feedback && <p className={`feedback ${feedback.type}`} role="alert">{feedback.text}</p>}<button className="submit-button" type="submit">{view === 'signin' ? 'Sign in to Dayflow' : 'Create account'} <span>-&gt;</span></button></form>{view === 'signin' && <p className="demo-access">Demo access: <strong>alex@dayflow.com</strong> / <strong>Dayflow123!</strong></p>}<p className="legal">By continuing, you agree to our <a href="/">Terms</a> and <a href="/">Privacy Policy</a>.</p></div></section></main>
}

export default App
