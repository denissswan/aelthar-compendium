interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Hex color for an optional 3px left accent border. */
  accentColor?: string;
}

export default function Card({ children, className = "", accentColor }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-4 ${className}`}
      style={accentColor ? { borderLeft: `3px solid ${accentColor}` } : undefined}
    >
      {children}
    </div>
  );
}
