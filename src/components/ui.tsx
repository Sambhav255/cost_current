import type { ReactNode } from 'react';
import { ArrowUpRight, Waves } from 'lucide-react';
export function Brand({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand ${small ? 'brand-small' : ''}`}>
      <span className="brand-mark">
        <Waves size={23} />
      </span>
      <span>
        cost<span className="brand-light">current</span>
        <span className="brand-dot">.</span>
      </span>
    </div>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
export function SourceBadge({
  edited = false,
  customer = false,
}: {
  edited?: boolean;
  customer?: boolean;
}) {
  return (
    <span className={`source-badge ${edited ? 'user' : ''}`}>
      <span />
      {customer
        ? 'Customer inputs + scenarios'
        : edited
          ? 'User assumption'
          : 'Illustrative scenario'}
    </span>
  );
}
export function SectionHeading({
  number,
  title,
  description,
  action,
}: {
  number?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="section-title">
          {number && <span className="section-number">{number}</span>}
          <h2>{title}</h2>
        </div>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Metric({
  label,
  value,
  detail,
  accent = false,
  children,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`metric ${accent ? 'metric-accent' : ''}`}>
      <div className="metric-label">
        {label}
        {children || <ArrowUpRight size={15} />}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}
export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <span className="input-wrap">
      {prefix && <span className="input-prefix">{prefix}</span>}
      <input
        aria-label={label}
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
      />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </span>
  );
}
