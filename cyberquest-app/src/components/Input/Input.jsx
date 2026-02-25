import './Input.css';

export default function Input({
    type = 'text',
    value,
    onChange,
    placeholder,
    label,
    id,
    disabled = false,
    error,
    icon,
    className = '',
    ...props
}) {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
        <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
            {label && <label htmlFor={inputId} className="input-label">{label}</label>}
            <div className="input-wrapper">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    id={inputId}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={icon ? 'has-icon' : ''}
                    {...props}
                />
            </div>
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
}

export function Textarea({
    value,
    onChange,
    placeholder,
    label,
    id,
    rows = 5,
    className = '',
    ...props
}) {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2)}`;

    return (
        <div className={`input-group ${className}`}>
            {label && <label htmlFor={textareaId} className="input-label">{label}</label>}
            <textarea
                id={textareaId}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                {...props}
            />
        </div>
    );
}

export function Select({
    value,
    onChange,
    options = [],
    label,
    id,
    className = '',
    ...props
}) {
    const selectId = id || `select-${Math.random().toString(36).slice(2)}`;

    return (
        <div className={`input-group ${className}`}>
            {label && <label htmlFor={selectId} className="input-label">{label}</label>}
            <select id={selectId} value={value} onChange={onChange} {...props}>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
