import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';

/**
 * Dependency-free, animated SVG charts tuned for the Electric Sky palette.
 */

export function BarChart({ data = [], height = 220, valueFormatter = formatNumber }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * 100;
          return (
            <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-bold text-heading">{valueFormatter(d.value)}</span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[44px] rounded-t-lg bg-brand-gradient"
                style={{ minHeight: 4 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex-1 truncate text-center text-[0.7rem] font-medium text-muted">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ data = [], size = 180 }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const radius = size / 2 - 16;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const colors = ['#3B82F6', '#14B8A6', '#F59E0B', '#64748B', '#8B5CF6'];

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const seg = (
            <motion.circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color || colors[i % colors.length]}
              strokeWidth={16}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              strokeLinecap="round"
            />
          );
          offset += dash;
          return seg;
        })}
        <text x="50%" y="50%" className="rotate-90" textAnchor="middle" dy="0.35em" style={{ transformOrigin: 'center' }} fontSize="22" fontWeight="800" fill="#0F172A">
          {formatNumber(total)}
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ background: d.color || colors[i % colors.length] }} />
            <span className="text-body">{d.label}</span>
            <span className="ml-auto font-bold text-heading">{formatNumber(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
