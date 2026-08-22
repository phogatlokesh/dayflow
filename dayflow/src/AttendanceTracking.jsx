import { useState } from 'react';
import './AttendanceTracking.css';

function AttendanceTracking({ userRole = 'Employee', userId = 'john@example.com' }) {

  const [viewMode, setViewMode] = useState('daily'); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Present', checkIn: '09:00 AM', checkOut: '05:30 PM' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Absent', checkIn: '-', checkOut: '-' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'Half-day', checkIn: '09:15 AM', checkOut: '01:00 PM' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', status: 'Leave', checkIn: '-', checkOut: '-' },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', status: 'Present', checkIn: '08:50 AM', checkOut: '05:45 PM' },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showCheckModal, setShowCheckModal] = useState(false);

  // Filter employees based on role
  const getVisibleEmployees = () => {
    if (userRole === 'HR') {
      return employees;
    } else {
      // Employee can only see their own attendance
      return employees.filter(emp => emp.email === userId);
    }
  };

  const getWeekDates = (date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i));
      weekDates.push(new Date(d));
    }
    return weekDates;
  };

 
  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  
  const handleCheckInOut = (employeeId, action) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeId) {
        const currentTime = getCurrentTime();
        if (action === 'checkIn') {
          return { ...emp, checkIn: currentTime, status: 'Present' };
        } else if (action === 'checkOut') {
          return { ...emp, checkOut: currentTime };
        }
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    setShowCheckModal(false);
    setSelectedEmployee(null);
  };

  const updateStatus = (employeeId, newStatus) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeId) {
        return { ...emp, status: newStatus };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
  };

  const weekDates = getWeekDates(currentDate);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return '#4CAF50';
      case 'Absent':
        return '#f44336';
      case 'Half-day':
        return '#FF9800';
      case 'Leave':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div className="header-left">
          <h1>Attendance Management</h1>
          <span className="role-badge" style={{ backgroundColor: userRole === 'HR' ? '#1976D2' : '#4CAF50' }}>
            {userRole}
          </span>
        </div>
        <div className="view-switcher">
          <button
            className={`btn ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => setViewMode('daily')}
          >
            Daily View
          </button>
          <button
            className={`btn ${viewMode === 'weekly' ? 'active' : ''}`}
            onClick={() => setViewMode('weekly')}
          >
            Weekly View
          </button>
        </div>
      </div>

      <div className="date-navigation">
        <button className="nav-btn" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - (viewMode === 'daily' ? 1 : 7))))}>
          ← Previous
        </button>
        <span className="current-date">
          {viewMode === 'daily'
            ? currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : `Week of ${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`}
        </span>
        <button className="nav-btn" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + (viewMode === 'daily' ? 1 : 7))))}>
          Next →
        </button>
      </div>

      {viewMode === 'daily' && (
        <div className="daily-view">
          <div className="attendance-grid">
            <div className="grid-header">
              <div className="col-name">Employee</div>
              <div className="col-status">Status</div>
              <div className="col-checkin">Check-In</div>
              <div className="col-checkout">Check-Out</div>
              <div className="col-actions">Actions</div>
            </div>

            {getVisibleEmployees().map(employee => (
              <div key={employee.id} className="grid-row">
                <div className="col-name">{employee.name}</div>
                <div className="col-status">
                  <select
                    className="status-select"
                    value={employee.status}
                    onChange={(e) => updateStatus(employee.id, e.target.value)}
                    disabled={userRole === 'Employee'}
                    style={{ borderColor: getStatusColor(employee.status) }}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half-day">Half-day</option>
                    <option value="Leave">Leave</option>
                  </select>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(employee.status) }}
                  >
                    {employee.status}
                  </span>
                </div>
                <div className="col-checkin">{employee.checkIn}</div>
                <div className="col-checkout">{employee.checkOut}</div>
                <div className="col-actions">
                  {userRole === 'HR' ? (
                    <>
                      <button
                        className="action-btn check-in-btn"
                        onClick={() => {
                          setSelectedEmployee(employee.id);
                          setShowCheckModal(true);
                        }}
                      >
                        Check-In
                      </button>
                      <button
                        className="action-btn check-out-btn"
                        onClick={() => {
                          setSelectedEmployee(employee.id);
                          setShowCheckModal(true);
                        }}
                      >
                        Check-Out
                      </button>
                    </>
                  ) : (
                    <span className="view-only-badge">View Only</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'weekly' && (
        <div className="weekly-view">
          <div className="week-grid">
            {weekDates.map((date, index) => (
              <div key={index} className="day-column">
                <div className="day-header">
                  <div className="day-name">{getDayName(date)}</div>
                  <div className="day-date">{formatDate(date)}</div>
                </div>
                <div className="day-content">
                  {getVisibleEmployees().map(employee => (
                    <div key={employee.id} className="week-employee-row">
                      <div className="week-emp-name">{employee.name.split(' ')[0]}</div>
                      <span
                        className="week-status-badge"
                        style={{ backgroundColor: getStatusColor(employee.status) }}
                        title={employee.status}
                      >
                        {employee.status.charAt(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCheckModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowCheckModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Check-In / Check-Out</h2>
            <p>Employee: {employees.find(e => e.id === selectedEmployee)?.name}</p>
            <p>Current Time: {getCurrentTime()}</p>
            <div className="modal-actions">
              <button
                className="modal-btn check-in-btn"
                onClick={() => handleCheckInOut(selectedEmployee, 'checkIn')}
              >
                Check-In
              </button>
              <button
                className="modal-btn check-out-btn"
                onClick={() => handleCheckInOut(selectedEmployee, 'checkOut')}
              >
                Check-Out
              </button>
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowCheckModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="status-legend">
        <h3>Status Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
            <span>Present</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#f44336' }}></span>
            <span>Absent</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FF9800' }}></span>
            <span>Half-day</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
            <span>Leave</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceTracking;
