import React from 'react';
import './ui.css';

/* ---------------- Layout Components ---------------- */
export const Container = ({ children, ...props }) => (
  <div className="ui-container" {...props}>
    {children}
  </div>
);

export const ScrollContainer = ({ children, ...props }) => (
  <div className="ui-scroll-container" {...props}>
    {children}
  </div>
);

export const ContentContainer = ({ children, ...props }) => (
  <div className="ui-content-container" {...props}>
    {children}
  </div>
);

/* ---------------- Card Components ---------------- */
export const Card = ({ children, ...props }) => (
  <div className="ui-card" {...props}>
    {children}
  </div>
);

export const FormCard = ({ children, onSubmit, ...props }) => (
  <form className="ui-form-card" onSubmit={onSubmit} {...props}>
    {children}
  </form>
);

/* ---------------- Button Components ---------------- */
export const Button = ({
  children,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => (
  <button
    className={`ui-button ui-button--${variant} ${fullWidth ? 'ui-button--full-width' : ''} ${disabled ? 'ui-button--disabled' : ''}`}
    type={type}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

/* ---------------- Input Components ---------------- */
export const Input = ({
  error = false,
  disabled = false,
  onChange,
  ...props
}) => (
  <input
    className={`ui-input ${error ? 'ui-input--error' : ''} ${disabled ? 'ui-input--disabled' : ''}`}
    onChange={onChange}
    disabled={disabled}
    {...props}
  />
);

export const InputContainer = ({ children, ...props }) => (
  <div className="ui-input-container" {...props}>
    {children}
  </div>
);

export const InputLabel = ({ children, htmlFor, ...props }) => (
  <label className="ui-input-label" htmlFor={htmlFor} {...props}>
    {children}
  </label>
);

export const InputError = ({ children, ...props }) => (
  <span className="ui-input-error" {...props}>
    {children}
  </span>
);

/* ---------------- Text Components ---------------- */
export const Text = ({
  children,
  color,
  size = '14px',
  weight = 'normal',
  align = 'left',
  ...props
}) => (
  <p
    className="ui-text"
    style={{
      color,
      fontSize: size,
      fontWeight: weight,
      textAlign: align
    }}
    {...props}
  >
    {children}
  </p>
);

export const Link = ({ children, onClick, ...props }) => (
  <a className="ui-link" onClick={onClick} {...props}>
    {children}
  </a>
);

/* ---------------- Logo Components ---------------- */
export const LogoContainer = ({ children, ...props }) => (
  <div className="ui-logo-container" {...props}>
    {children}
  </div>
);

export const LogoImage = ({ src, alt, onError, ...props }) => (
  <img
    className="ui-logo-image"
    src={src}
    alt={alt}
    onError={onError}
    {...props}
  />
);

export const LogoText = ({ children, ...props }) => (
  <h1 className="ui-logo-text" {...props}>
    {children}
  </h1>
);

/* ---------------- Loading Components ---------------- */
export const LoadingSpinner = ({ ...props }) => (
  <div className="ui-loading-spinner" {...props} />
);

/* ---------------- Divider Components ---------------- */
export const OrDivider = ({ children, ...props }) => (
  <div className="ui-or-divider" {...props}>
    {children}
  </div>
);
