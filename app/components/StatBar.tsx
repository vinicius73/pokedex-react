type StatBarProps = {
  name: string;
  displayName: string;
  value: number;
};

const MAX_STAT = 255;

export function StatBar({ displayName, value }: StatBarProps) {
  const percentage = Math.min((value / MAX_STAT) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
        {displayName}
      </span>

      <div className="flex flex-1 items-center gap-2">
        <div
          role="meter"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={MAX_STAT}
          aria-label={displayName}
          className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
        >
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <span className="w-8 shrink-0 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </span>
      </div>
    </div>
  );
}
