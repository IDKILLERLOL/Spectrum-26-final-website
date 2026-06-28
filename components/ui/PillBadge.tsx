export interface PillBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function PillBadge({ children, variant = 'default', className = '' }: PillBadgeProps) {
  const variantClasses = {
    default: 'bg-[#1a1a1a] text-[#cccccc] border border-[#333333]',
    success: 'bg-[#0d3d0d] text-[#00ff00] border border-[#00cc00]',
    warning: 'bg-[#3d3d0d] text-[#ffff00] border border-[#cccc00]',
    error: 'bg-[#3d0d0d] text-[#ff0000] border border-[#cc0000]',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
