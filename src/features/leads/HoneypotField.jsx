/** Visually hidden honeypot — bots fill it; humans leave it empty. */
export function HoneypotField({ value, onChange, id = 'website' }) {
  return (
    <div
      aria-hidden="true"
      className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
      tabIndex={-1}
    >
      <label htmlFor={id}>Website</label>
      <input
        id={id}
        name="website"
        type="text"
        autoComplete="off"
        tabIndex={-1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
