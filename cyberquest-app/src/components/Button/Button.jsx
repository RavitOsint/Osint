import './Button.css';

export default function Button({
    children,
    onClick,
    variant = 'primary', // primary | secondary | danger | success | outline | ghost
    size = 'md', // sm | md | lg | xl
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    className = '',
    type = 'button',
    ...props
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${loading ? 'btn-loading' : ''} ${className}`}
            {...props}
        >
            {loading && <span className="btn-spinner" />}
            {icon && !loading && <span className="btn-icon">{icon}</span>}
            <span className="btn-text">{children}</span>
        </button>
    );
}
