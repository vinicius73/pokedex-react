type StatBarProps = {
  name: string;
  displayName: string;
  value: number;
};

const MAX_STAT = 255;

export function StatBar({ displayName, value }: StatBarProps) {
  const percentage = Math.min((value / MAX_STAT) * 100, 100);

  return (
    <div className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 sm:grid-cols-[6.5rem_1fr_2rem]">
      <span className="text-sm font-medium text-ink-muted dark:text-ink-muted-dark">
        {displayName}
      </span>

      <meter
        value={value}
        min={0}
        max={MAX_STAT}
        aria-label={displayName}
        className="pokdex-stat-track"
      >
        <div className="pokdex-stat-fill" style={{ width: `${percentage}%` }} />
      </meter>

      <span className="pokdex-mono text-right text-sm font-semibold text-ink tabular-nums dark:text-ink-dark">
        {value}
      </span>
    </div>
  );
}
