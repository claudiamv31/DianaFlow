export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
}) {
  return (
    <div className="mb-3 w-full">
      {label && (
        <label className="font-semibold text-on-surface">{label}</label>
      )}

      <div className="flex w-full overflow-hidden rounded-[0.75rem] border-2 border-primary transition-[border-color,box-shadow] duration-300 focus-within:ring-[0.2rem] focus-within:ring-secondary-container/40">
        {icon && (
          <span className="flex items-center border-r border-primary bg-transparent px-3 text-primary">
            {icon}
          </span>
        )}

        <input
          type={type}
          className="block w-full flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:outline-none focus:ring-0"
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
