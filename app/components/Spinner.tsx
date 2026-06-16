type SpinnerProps = {
  className?: string;
};

export function Spinner({ className = "h-6 w-6" }: SpinnerProps) {
  return (
    <output
      aria-label="Loading"
      aria-live="polite"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}
