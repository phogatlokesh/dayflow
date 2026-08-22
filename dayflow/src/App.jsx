import { useState } from "react";
import "./App.css";
import AttendanceTracking from "./AttendanceTracking";
import EmployeeProfile from "./EmployeeProfile";
import LeaveManagement from "./LeaveManagement";
import UserApprovals from "./UserApprovals";
import PayrollManagement from "./PayrollManagement";
import Dashboard from "./Dashboard";

const API_URL = import.meta.env.VITE_API_URL || "";

function GoogleIcon() {
  return null;
}
function MicrosoftIcon() {
  return null;
}

function App() {
  const [view, setView] = useState("signin");
  const [form, setForm] = useState({
    employeeId: "",
    email: "",
    password: "",
    role: "Employee",
    designation: "Software Engineer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardView, setDashboardView] = useState("dashboard");
  const [userRole, setUserRole] = useState("Employee");
  const [userId, setUserId] = useState(null);
  const [userDesignation, setUserDesignation] = useState("Software Engineer");
  const [signupStep, setSignupStep] = useState("details");
  const [verificationCode, setVerificationCode] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState("request");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setFeedback(null);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (forgotPassword && resetStep === "confirm" && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(newPassword)) {
      setFeedback({ type: "error", text: "Use 8+ characters with uppercase, lowercase, a number, and a symbol." });
      return;
    }
    if (
      view === "signup" &&
      signupStep === "details" &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(
        form.password,
      )
    ) {
      setFeedback({
        type: "error",
        text: "Use 8+ characters with uppercase, lowercase, a number, and a symbol.",
      });
      return;
    }
    const endpoint = forgotPassword
      ? `password-reset/${resetStep}`
      : view === "signin"
        ? "signin"
        : signupStep === "verify"
          ? "signup/verify"
          : "signup/request";
    const body = forgotPassword
      ? resetStep === "request"
        ? { employeeId: form.employeeId, email: form.email }
        : { employeeId: form.employeeId, email: form.email, code: resetCode, newPassword }
      : view === "signin"
        ? {
            employeeId: form.employeeId,
            email: form.email,
            password: form.password,
          }
        : signupStep === "verify"
          ? { email: form.email, code: verificationCode }
          : {
              employeeId: form.employeeId,
              email: form.email,
              password: form.password,
              designation: form.designation,
            };
    try {
      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedback({
          type: "error",
          text: data.message || "Request failed. Please try again.",
        });
        return;
      }
      if (forgotPassword) {
        if (resetStep === "request") {
          setResetStep("confirm");
          setFeedback({ type: "success", text: "A password reset code was sent to your employee email." });
        } else {
          setForgotPassword(false);
          setResetStep("request");
          setResetCode("");
          setNewPassword("");
          setFeedback({ type: "success", text: "Password changed successfully. You can now sign in." });
        }
        return;
      }
      if (view === "signin") {
        setIsLoggedIn(true);
        setUserRole(data.user?.role || "Employee");
        setUserDesignation(data.profile?.role || "Software Engineer");
        setUserId(data.user?.employee_id || form.employeeId);
        setAuthToken(data.token || "");
        setUserProfile(data.profile || null);
        return;
      }
      if (signupStep === "details") {
        setSignupStep("verify");
        setFeedback({
          type: "success",
          text: "We sent a 6-digit code to your personal email.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text:
          data.message ||
          "Email verified. Your request is now with HR for approval.",
      });
      setSignupStep("details");
      setVerificationCode("");
      setView("signin");
    } catch {
      setFeedback({
        type: "error",
        text: `Cannot reach ${API_URL || "the API server"}. Check that the backend is running and your IP address is current.`,
      });
    }
  };

  if (isLoggedIn) {
    return (
      <main
        className={`dashboard-page ${userRole === "Employee" ? "employee-workspace" : "management-workspace"}`}
      >
        <nav className="topbar">
          <a href="/" className="brand">
            <span className="brand-mark">d</span>
            <span>
              <strong>dayflow</strong>
              <small>
                {userRole === "Employee"
                  ? "My workspace"
                  : "Operations console"}
              </small>
            </span>
          </a>
          <div className="workspace-nav">
            <button
              className={dashboardView === "dashboard" ? "active" : ""}
              onClick={() => setDashboardView("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={dashboardView === "profile" ? "active" : ""}
              onClick={() => setDashboardView("profile")}
            >
              My profile
            </button>
            <button
              className={dashboardView === "attendance" ? "active" : ""}
              onClick={() => setDashboardView("attendance")}
            >
              Attendance
            </button>
            <button
              className={dashboardView === "leave" ? "active" : ""}
              onClick={() => setDashboardView("leave")}
            >
              Leave & time off
            </button>
            {(userRole === "HR" || userRole === "Admin") && (
              <button
                className={dashboardView === "approvals" ? "active" : ""}
                onClick={() => setDashboardView("approvals")}
              >
                Employee approvals
              </button>
            )}
            <button
              className={dashboardView === "payroll" ? "active" : ""}
              onClick={() => setDashboardView("payroll")}
            >
              Payroll
            </button>
          </div>
          <div className="account-controls">
            <span className="role-badge">
              {userRole === "Employee" ? "Employee" : `${userRole} team`}
            </span>
            <button
              className="secondary-button"
              onClick={() => setIsLoggedIn(false)}
            >
              Sign out
            </button>
          </div>
        </nav>
        {dashboardView === "dashboard" ? (
          <Dashboard
            userRole={userRole}
            userName={userProfile?.name || form.email}
            userEmail={userProfile?.email || form.email}
            userDesignation={userDesignation}
            onNavigate={setDashboardView}
            onLogout={() => setIsLoggedIn(false)}
          />
        ) : dashboardView === "profile" ? (
          <EmployeeProfile profile={userProfile} />
        ) : dashboardView === "attendance" ? (
          <AttendanceTracking
            userRole={userRole}
            userId={userId}
            userDesignation={userDesignation}
          />
        ) : dashboardView === "leave" ? (
          <LeaveManagement userRole={userRole} userId={userId} />
        ) : dashboardView === "approvals" ? (
          <UserApprovals token={authToken} />
        ) : (
          <PayrollManagement userRole={userRole} userId={userId} />
        )}
      </main>
    );
  }

  if (forgotPassword) {
    return (
      <main className="auth-page">
        <section className="brand-panel">
          <div className="brand-lockup"><span className="brand-mark">d</span><span>dayflow</span></div>
          <div className="brand-copy"><p className="eyebrow">Account recovery</p><h1>Get back to<br /><em>good work.</em></h1><p>We will verify your employee account before changing your password.</p></div>
          <p className="principle">Your account, protected.</p>
        </section>
        <section className="form-panel"><div className="form-inner">
          <header className="form-heading"><p className="eyebrow">Secure password reset</p><h2>{resetStep === "request" ? "Forgot your password?" : "Check your email."}</h2><p>{resetStep === "request" ? "Enter your employee details to receive a reset code." : "Enter the code and choose a new password."}</p></header>
          <form onSubmit={submitForm}>
            <label>Employee ID<input name="employeeId" value={form.employeeId} onChange={updateForm} placeholder="e.g. DF-1048" required /></label>
            <label>Employee email<input name="email" type="email" value={form.email} onChange={updateForm} placeholder="you@company.com" required /></label>
            {resetStep === "confirm" && <><label>OTP code<input value={resetCode} onChange={(event) => setResetCode(event.target.value)} inputMode="numeric" pattern="[0-9]{6}" maxLength="6" placeholder="123456" required /></label><label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Enter a new password" required /></label></>}
            {feedback && <p className={`feedback ${feedback.type}`} role="alert">{feedback.text}</p>}
            <button className="submit-button" type="submit">{resetStep === "request" ? "Send reset code" : "Change password"} <span>-&gt;</span></button>
          </form>
          <button className="auth-back-button" type="button" onClick={() => { setForgotPassword(false); setResetStep("request"); setFeedback(null); }}>Back to sign in</button>
        </div></section>
      </main>
    );
  }

  const action = view === "signin" ? "Sign in" : "Sign up";

  return (
    <main className="auth-page">
      <section className="brand-panel">
        <div className="brand-lockup">
          <span className="brand-mark">d</span>
          <span>dayflow</span>
        </div>
        <div className="brand-copy">
          <p className="eyebrow">A calmer way to work</p>
          <h1>
            Make room for
            <br />
            <em>good work.</em>
          </h1>
          <p>One clear place for your people, priorities, and daily rhythm.</p>
        </div>
        <p className="principle">Clarity is the beginning of momentum.</p>
      </section>
      <section className="form-panel">
        <div className="form-inner">
          <div className="mobile-brand brand-lockup">
            <span className="brand-mark">d</span>
            <span>dayflow</span>
          </div>
          <header className="form-heading">
            <p className="eyebrow">Your workspace awaits</p>
            <h2>{view === "signin" ? "Welcome back." : "Start your flow."}</h2>
            <p>
              {view === "signin"
                ? "Sign in to pick up where you left off."
                : "Create your account in less than a minute."}
            </p>
          </header>
          <div className="tabs" role="tablist">
            <button
              className={view === "signin" ? "active" : ""}
              onClick={() => {
                setView("signin");
                setSignupStep("details");
                setFeedback(null);
              }}
              role="tab"
              aria-selected={view === "signin"}
            >
              Sign in
            </button>
            <button
              className={view === "signup" ? "active" : ""}
              onClick={() => {
                setView("signup");
                setFeedback(null);
              }}
              role="tab"
              aria-selected={view === "signup"}
            >
              Sign up
            </button>
          </div>
          <div className="social-auth" aria-label={`${action} with a provider`}>
            <button type="button" className="provider-button">
              <GoogleIcon />
              Continue with Google
            </button>
            <button type="button" className="provider-button">
              <MicrosoftIcon />
              Continue with Outlook
            </button>
          </div>
          <div className="auth-divider">
            <span>or continue with email</span>
          </div>
          <form onSubmit={submitForm}>
            {view === "signup" && signupStep === "verify" ? (
              <>
                <p className="password-rules">
                  Enter the 6-digit code sent to <strong>{form.email}</strong>.
                </p>
                <label>
                  Verification code
                  <input
                    name="verificationCode"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    value={verificationCode}
                    onChange={(event) =>
                      setVerificationCode(event.target.value)
                    }
                    placeholder="123456"
                    required
                  />
                </label>
              </>
            ) : (
              <>
                {view === "signup" && (
                  <label>
                    Employee ID
                    <input
                      name="employeeId"
                      value={form.employeeId}
                      onChange={updateForm}
                      placeholder="e.g. DF-1048"
                      required
                    />
                  </label>
                )}
                <label>
                  Personal email address
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateForm}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label>
                  Password
                  <div className="password-field">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={updateForm}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="show-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
                {view === "signup" && (
                  <label>
                    Designation
                    <select
                      name="designation"
                      value={form.designation}
                      onChange={updateForm}
                    >
                      <option>Software Engineer</option>
                      <option>Senior Software Engineer</option>
                      <option>Manager</option>
                      <option>Project Manager</option>
                      <option>Business Analyst</option>
                      <option>Quality Assurance</option>
                      <option>DevOps Engineer</option>
                    </select>
                  </label>
                )}
                {view === "signup" && (
                  <p className="password-rules">
                    8+ characters · uppercase · lowercase · number · symbol
                  </p>
                )}
              </>
            )}
            {feedback && (
              <p className={`feedback ${feedback.type}`} role="alert">
                {feedback.text}
              </p>
            )}
            <button className="submit-button" type="submit">
              {view === "signin"
                ? "Sign in to Dayflow"
                : signupStep === "verify"
                  ? "Verify email"
                  : "Send verification code"}{" "}
              <span>-&gt;</span>
            </button>
          </form>
          {view === "signin" && <button className="forgot-password-link" type="button" onClick={() => { setForgotPassword(true); setFeedback(null); }}>Forgot password?</button>}
          {view === "signin" && (
            <p className="demo-access">
              Demo access:{" "}
              <strong>DF-1048 / alex@dayflow.com / Dayflow123!</strong>
            </p>
          )}
          <p className="legal">
            By continuing, you agree to our <a href="/">Terms</a> and{" "}
            <a href="/">Privacy Policy</a>.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
