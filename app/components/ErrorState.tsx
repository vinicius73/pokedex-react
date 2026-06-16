type ErrorStateProps = {
  message?: string;
};

export function ErrorState({
  message = "Something went wrong. Please try again later.",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-900 dark:bg-red-950/40"
    >
      <p className="text-sm font-medium text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
}
