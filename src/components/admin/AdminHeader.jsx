export function AdminHeader({ title, subtitle, action }) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:mb-5 sm:gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-lg font-extrabold leading-tight text-heading sm:text-2xl lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[11px] leading-snug text-muted sm:mt-1 sm:text-sm">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
