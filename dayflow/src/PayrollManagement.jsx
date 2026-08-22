import { useMemo, useState } from 'react'
import './PayrollManagement.css'

const seedPayroll = [
  { id: 1, employee: 'John Doe', email: 'john@example.com', designation: 'Software Engineer', department: 'Engineering', status: 'Paid', payCycle: 'Monthly', baseSalary: 9800, bonus: 1200, deductions: 1420, netPay: 9580 },
  { id: 2, employee: 'Jane Smith', email: 'jane@example.com', designation: 'HR Manager', department: 'People', status: 'Pending', payCycle: 'Monthly', baseSalary: 11200, bonus: 1500, deductions: 1765, netPay: 10935 },
  { id: 3, employee: 'Mike Johnson', email: 'mike@example.com', designation: 'Senior Software Engineer', department: 'Engineering', status: 'Paid', payCycle: 'Monthly', baseSalary: 12850, bonus: 1800, deductions: 1910, netPay: 12740 },
  { id: 4, employee: 'Sarah Williams', email: 'sarah@example.com', designation: 'Manager', department: 'Operations', status: 'Review', payCycle: 'Monthly', baseSalary: 10500, bonus: 1300, deductions: 1585, netPay: 10215 },
  { id: 5, employee: 'Tom Brown', email: 'tom@example.com', designation: 'DevOps Engineer', department: 'Engineering', status: 'Paid', payCycle: 'Monthly', baseSalary: 10100, bonus: 1100, deductions: 1495, netPay: 9705 },
]

const currency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

function PayrollManagement({ userRole = 'Employee', userId = 'john@example.com' }) {
  const [payroll, setPayroll] = useState(seedPayroll)
  const [notice, setNotice] = useState('')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(seedPayroll[0].id)
  const adminView = userRole === 'Admin' || userRole === 'HR'

  const visiblePayroll = useMemo(() => {
    if (adminView) return payroll
    return payroll.filter((entry) => entry.email === userId)
  }, [adminView, payroll, userId])

  const selectedEmployee = payroll.find((entry) => entry.id === selectedEmployeeId) ?? visiblePayroll[0] ?? null

  const totalGross = visiblePayroll.reduce((sum, line) => sum + line.baseSalary + line.bonus, 0)
  const totalDeductions = visiblePayroll.reduce((sum, line) => sum + line.deductions, 0)
  const totalNet = visiblePayroll.reduce((sum, line) => sum + line.netPay, 0)

  const updateSalary = (id, field, value) => {
    setPayroll((current) => current.map((entry) => {
      if (entry.id !== id) return entry

      const numericValue = Number(value) || 0
      const updatedEntry = { ...entry, [field]: numericValue }
      updatedEntry.netPay = updatedEntry.baseSalary + updatedEntry.bonus - updatedEntry.deductions
      return updatedEntry
    }))
    setNotice('Payroll values updated. Review the revised totals before final approval.')
  }

  const savePayroll = () => {
    setNotice('Payroll structure saved successfully and the payroll record is now locked for this cycle.')
  }

  return (
    <section className="payroll-page">
      <header className="payroll-heading">
        <div>
          <p className="eyebrow">Finance / Compensation</p>
          <h1>Payroll management</h1>
          <p>{adminView ? 'Monitor payroll accuracy, review every employee payout, and update salary structures with confidence.' : 'Your payroll details are available in read-only mode so you can track your pay with clarity.'}</p>
        </div>
        <span className={`payroll-role ${adminView ? 'admin' : ''}`}>{adminView ? `${userRole} payroll view` : 'Employee read-only'}</span>
      </header>

      {notice && <div className="payroll-notice" role="status">{notice}</div>}

      <div className="payroll-summary-grid">
        <article className="payroll-card">
          <span>Total gross</span>
          <strong>{currency(totalGross)}</strong>
          <small>Gross wages before deductions</small>
        </article>
        <article className="payroll-card">
          <span>Total deductions</span>
          <strong>{currency(totalDeductions)}</strong>
          <small>Taxes, benefits, and withholdings</small>
        </article>
        <article className="payroll-card focus-card">
          <span>Net payout</span>
          <strong>{currency(totalNet)}</strong>
          <small>Amount released to employees</small>
        </article>
      </div>

      <div className="payroll-layout">
        <div className="payroll-table-panel">
          <div className="panel-header">
            <div>
              <p className="section-kicker">Payroll overview</p>
              <h2>{adminView ? 'Employee payroll ledger' : 'Your payroll statement'}</h2>
            </div>
          </div>

          <div className="payroll-table-wrap">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Bonus</th>
                  <th>Net pay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visiblePayroll.map((employee) => (
                  <tr
                    key={employee.id}
                    className={selectedEmployee && selectedEmployee.id === employee.id ? 'selected' : ''}
                    onClick={() => adminView && setSelectedEmployeeId(employee.id)}
                  >
                    <td>
                      <div className="employee-cell">
                        <strong>{employee.employee}</strong>
                        <span>{employee.designation}</span>
                      </div>
                    </td>
                    <td>{employee.department}</td>
                    <td>{currency(employee.baseSalary)}</td>
                    <td>{currency(employee.bonus)}</td>
                    <td>{currency(employee.netPay)}</td>
                    <td>
                      <span className={`status-pill ${employee.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {adminView && selectedEmployee && (
          <aside className="payroll-editor-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Payroll control</p>
                <h2>Salary structure</h2>
              </div>
            </div>

            <div className="employee-editor">
              <h3>{selectedEmployee.employee}</h3>
              <p>{selectedEmployee.designation} · {selectedEmployee.department}</p>

              <label>
                Base salary
                <input type="number" value={selectedEmployee.baseSalary} onChange={(event) => updateSalary(selectedEmployee.id, 'baseSalary', event.target.value)} />
              </label>

              <label>
                Performance bonus
                <input type="number" value={selectedEmployee.bonus} onChange={(event) => updateSalary(selectedEmployee.id, 'bonus', event.target.value)} />
              </label>

              <label>
                Deductions
                <input type="number" value={selectedEmployee.deductions} onChange={(event) => updateSalary(selectedEmployee.id, 'deductions', event.target.value)} />
              </label>

              <div className="salary-breakdown">
                <div>
                  <span>Gross</span>
                  <strong>{currency(selectedEmployee.baseSalary + selectedEmployee.bonus)}</strong>
                </div>
                <div>
                  <span>Net</span>
                  <strong>{currency(selectedEmployee.netPay)}</strong>
                </div>
              </div>

              <button className="save-payroll-button" type="button" onClick={savePayroll}>Save payroll update</button>
            </div>
          </aside>
        )}

        {!adminView && visiblePayroll[0] && (
          <aside className="payroll-editor-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Your pay</p>
                <h2>Pay breakdown</h2>
              </div>
            </div>

            <div className="employee-editor read-only">
              <h3>{visiblePayroll[0].employee}</h3>
              <p>{visiblePayroll[0].designation} · {visiblePayroll[0].department}</p>

              <div className="pay-metrics">
                <div><span>Base salary</span><strong>{currency(visiblePayroll[0].baseSalary)}</strong></div>
                <div><span>Bonus</span><strong>{currency(visiblePayroll[0].bonus)}</strong></div>
                <div><span>Deductions</span><strong>{currency(visiblePayroll[0].deductions)}</strong></div>
                <div><span>Net pay</span><strong>{currency(visiblePayroll[0].netPay)}</strong></div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}

export default PayrollManagement
