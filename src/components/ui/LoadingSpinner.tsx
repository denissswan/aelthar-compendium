export default function LoadingSpinner({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex justify-center py-10 ${className}`}>
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}
