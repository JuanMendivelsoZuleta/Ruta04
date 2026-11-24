export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-strong',
  secondary:
    'border border-line-strong bg-panel text-slate-100 hover:border-accent/60 hover:text-white',
  ghost: 'text-slate-300 hover:bg-panel-soft hover:text-white',
  danger: 'bg-red-500 text-white hover:bg-red-400',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra?: string,
): string {
  return [
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}
