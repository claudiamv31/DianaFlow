import './Input.css';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  buttonText,
  onButtonClick
}) {
  return (
    <div className="mb-3 custom-input-wrapper">
      {label && <label className="form-label">{label}</label>}

      <div className="input-group">
        {icon && <span className="input-group-text input-icon">{icon}</span>}

        <input
          type={type}
          className="form-control custom-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            if (onChange) onChange(e);
          }}
        />
      </div>
    </div>
  );
}
