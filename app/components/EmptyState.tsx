type EmptyStateProps = {
  message?: string;
};

export function EmptyState({ message = "No Pokémon found." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-6 py-8 text-center dark:border-gray-800 dark:bg-gray-900/40">
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}
