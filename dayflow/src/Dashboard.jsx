import './Dashboard.css'

export default function Dashboard({ userRole, userName, userEmail, userDesignation, onNavigate, onLogout }) {
  const getCurrentTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  
  const alerts = [
    { type: 'warning', icon: '⚠️', title: 'Leave Request Pending', description: 'Your leave request for Aug 25 is awaiting approval.' },
    { type: 'info', icon: 'ℹ️', title: 'Payroll Processed', description: 'Your salary for August has been credited to your account.' }
  ]

  const isManagement = userRole === 'HR' || userRole === 'Admin'
  const quickStats = isManagement ? [
    { label: 'Team members', value: '45', color: '#4CAF50' },
    { label: 'Present today', value: '42', color: '#2196F3' },
    { label: 'Pending reviews', value: '8', color: '#FF9800' }
  ] : [
    { label: 'Today\'s status', value: 'Present', color: '#4CAF50' },
    { label: 'Attendance', value: '92%', color: '#2196F3' },
    { label: 'Leave balance', value: '8 days', color: '#FF9800' }
  ]

  const quickAccess = [
    { label: 'My Profile', icon: '👤', color: '#1976D2', action: 'profile' },
    { label: 'Attendance', icon: '📋', color: '#4CAF50', action: 'attendance' },
    { label: 'Leave Requests', icon: '📅', color: '#FF9800', action: 'leave' },
    { label: 'Sign Out', icon: '🚪', color: '#f44336', action: 'logout' }
  ]

  const recentActivities = [
    { time: '09:30 AM', action: 'Checked in', icon: '✓' },
    { time: 'Aug 21, 2:15 PM', action: 'Submitted leave request', icon: '📝' },
    { time: 'Aug 20, 5:00 PM', action: 'Checked out', icon: '✓' },
    { time: 'Aug 19, 3:30 PM', action: 'Attended team meeting', icon: '👥' }
  ]

  const handleQuickAccess = (action) => {
    if (action === 'logout') {
      onLogout()
    } else {
      onNavigate(action)
    }
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-content">
          <p className="dashboard-kicker">{isManagement ? 'People operations' : 'Your day at a glance'}</p>
          <h1>{isManagement ? 'Good morning, team.' : `Welcome back, ${userName || 'User'}!`}</h1>
          <p>{isManagement ? `${userRole} workspace at Dayflow` : `${userDesignation} at Dayflow · ${userEmail || 'Your account'}`}</p>
        </div>
        <div className="header-time">
          <div className="current-time">{getCurrentTime()}</div>
        </div>
      </div>

      {/* Alerts Section */}
      <section className="alerts-section">
        <h2>Alerts</h2>
        <div className="alerts-grid">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`alert-card alert-${alert.type}`}>
              <span className="alert-icon">{alert.icon}</span>
              <div className="alert-content">
                <h3>{alert.title}</h3>
                <p>{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="quick-stats-section">
        <h2>Quick Stats</h2>
        <div className="stats-grid">
          {quickStats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value" style={{ borderColor: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="quick-access-section">
        <h2>Quick Access</h2>
        <div className="quick-access-grid">
          {quickAccess.map((item, idx) => (
            <button
              key={idx}
              className="quick-access-card"
              onClick={() => handleQuickAccess(item.action)}
              style={{ borderLeftColor: item.color }}
            >
              <div className="card-icon">{item.icon}</div>
              <div className="card-label">{item.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="recent-activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivities.map((activity, idx) => (
            <div key={idx} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-details">
                <p className="activity-action">{activity.action}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HR Section */}
      {isManagement && (
        <section className="hr-section">
          <h2>Team Overview</h2>
          <div className="hr-stats">
            <div className="hr-stat-item">
              <div className="hr-stat-label">Total Team Members</div>
              <div className="hr-stat-value">45</div>
            </div>
            <div className="hr-stat-item">
              <div className="hr-stat-label">Present Today</div>
              <div className="hr-stat-value" style={{ color: '#4CAF50' }}>42</div>
            </div>
            <div className="hr-stat-item">
              <div className="hr-stat-label">On Leave</div>
              <div className="hr-stat-value" style={{ color: '#FF9800' }}>3</div>
            </div>
          </div>

          <h3>Pending Approvals</h3>
          <div className="pending-approvals">
            <div className="approval-item">
              <span className="approval-badge">5</span>
              <span className="approval-text">Leave Requests</span>
            </div>
            <div className="approval-item">
              <span className="approval-badge">2</span>
              <span className="approval-text">Overtime Requests</span>
            </div>
            <div className="approval-item">
              <span className="approval-badge">1</span>
              <span className="approval-text">Document Reviews</span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
