import { useState } from 'react';
import './App.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function App() {
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
    <div className="app-shell">
      <div className="login-card">
        <div className="brand">
          <span className="logo" aria-hidden="true">
            🚀
          </span>
          <div>
            <h1>Project Atlas</h1>
            <p>Secure workspace access · 256-bit encryption</p>
          </div>
        </div>

        {status.message && (
          <div className={`status-message ${status.variant || 'neutral'}`} role="status" aria-live="polite">
            {status.message}
          </div>
        )}

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

        <p className="hint-line">
          Use <strong>user@example.com</strong> / <strong>secure123</strong> to see the success state.
        </p>
      </div>
    </div>
  );
}

export default App;
