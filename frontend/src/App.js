import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phoneRegex = /^\+?[0-9][0-9\s-]{6,19}$/;

const mockAuthenticate = (email, password) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'user@example.com' && password === 'secure123') {
        resolve('Welcome back! Your workspace is ready.');
      } else {
        reject(new Error('We could not verify those credentials.'));
      }
    }, 1200);
  });

const mockRegister = ({ email, name, phone }) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const blocked = ['already@taken.com', 'existing@example.com'];
      if (blocked.includes(email.trim().toLowerCase())) {
        reject(new Error('This email address already has an account.'));
        return;
      }

      const phoneHint = phone?.trim() ? ` We'll text a confirmation to ${phone.trim()}.` : '';
      resolve(`Account created for ${name.trim() || 'you'}! Check your inbox for the welcome packet.${phoneHint}`);
    }, 1400);
  });

function StatusBanner({ status }) {
  if (!status?.message) return null;
  return (
    <div className={`status-message ${status.variant || 'neutral'}`} role="status" aria-live="polite">
      {status.message}
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <span className="logo" aria-hidden="true">
        🚀
      </span>
      <div>
        <h1>Project Atlas</h1>
        <p>Secure workspace access · 256-bit encryption</p>
      </div>
    </div>
  );
}

function AuthTabs({ current, navigate }) {
  const tabs = [
    { label: 'Sign in', path: '/login' },
    { label: 'Create account', path: '/register' },
  ];

  return (
    <div className="auth-tabs" role="tablist" aria-label="Authentication toggle">
      {tabs.map((tab) => {
        const isActive = current === tab.path.replace('/', '') || (tab.path === '/login' && current === 'login');
        return (
          <button
            key={tab.path}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`auth-tab ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function AuthCard({ status, tip, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname === '/register' ? 'register' : 'login';

  return (
    <div className="login-card">
      <Brand />
      <AuthTabs current={currentPath} navigate={navigate} />
      <StatusBanner status={status} />
      {children}
      {tip && <p className="hint-line">{tip}</p>}
    </div>
  );
}

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, message: '', variant: '' });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Use at least 6 characters for your password.';
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setStatus({ loading: false, message: 'Please fix the highlighted fields.', variant: 'error' });
      return;
    }

    setErrors({});
    setStatus({ loading: true, message: 'Authenticating…', variant: 'neutral' });

    try {
      const successMessage = await mockAuthenticate(formData.email, formData.password);
      setStatus({ loading: false, message: successMessage, variant: 'success' });
    } catch (error) {
      setStatus({ loading: false, message: error.message, variant: 'error' });
    }
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    setStatus({
      loading: false,
      message: 'We emailed a password reset link to that address.',
      variant: 'info',
    });
  };

  return (
    <AuthCard status={status} tip="Use user@example.com / secure123 to see the success state.">
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p className="field-error" id="email-error">
            {errors.email}
          </p>
        )}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <p className="field-error" id="password-error">
            {errors.password}
          </p>
        )}

        <div className="form-footer">
          <label className="remember-me">
            <input type="checkbox" name="remember" checked={formData.remember} onChange={handleChange} />
            Remember me
          </label>
          <button className="link-button" type="button" onClick={handleForgotPassword}>
            Forgot password?
          </button>
        </div>

        <button type="submit" className="submit-button" disabled={status.loading}>
          {status.loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthCard>
  );
}

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, message: '', variant: '' });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Use at least 6 characters for your password.';
    }

    if (formData.phone.trim()) {
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Use digits, spaces, or dashes (minimum 7 digits).';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms to continue.';
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setStatus({ loading: false, message: 'Please address the highlighted fields.', variant: 'error' });
      return;
    }

    setErrors({});
    setStatus({ loading: true, message: 'Creating your account…', variant: 'neutral' });

    try {
      const successMessage = await mockRegister(formData);
      setStatus({ loading: false, message: successMessage, variant: 'success' });
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '', terms: false });
    } catch (error) {
      setStatus({ loading: false, message: error.message, variant: 'error' });
    }
  };

  return (
    <AuthCard status={status} tip="We'll send a confirmation email once your workspace is ready.">
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Jordan Rivers"
          value={formData.name}
          onChange={handleChange}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p className="field-error" id="name-error">
            {errors.name}
          </p>
        )}

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
        />
        {errors.email && (
          <p className="field-error" id="register-email-error">
            {errors.email}
          </p>
        )}

        <label htmlFor="phone">Phone number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 555 012 3456"
          value={formData.phone}
          onChange={handleChange}
          aria-invalid={errors.phone ? 'true' : 'false'}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <p className="field-error" id="phone-error">
            {errors.phone}
          </p>
        )}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'register-password-error' : undefined}
        />
        {errors.password && (
          <p className="field-error" id="register-password-error">
            {errors.password}
          </p>
        )}

        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
        />
        {errors.confirmPassword && (
          <p className="field-error" id="confirm-password-error">
            {errors.confirmPassword}
          </p>
        )}

        <div className="terms">
          <label className="remember-me">
            <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} />
            I agree to the <a href="https://example.com/terms" target="_blank" rel="noreferrer">Terms</a> and{' '}
            <a href="https://example.com/privacy" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            .
          </label>
          {errors.terms && <p className="field-error">{errors.terms}</p>}
        </div>

        <button type="submit" className="submit-button" disabled={status.loading}>
          {status.loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
