'use client';

const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function MonthNav({ year, month, onChange }: Props) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const prev = () => {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  };

  const next = () => {
    if (isCurrentMonth) return;
    if (month === 11) onChange(year + 1, 0);
    else onChange(year, month + 1);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        aria-label="Vorige maand"
      >
        ←
      </button>
      <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center capitalize">
        {MONTHS_NL[month]} {year}
      </span>
      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Volgende maand"
      >
        →
      </button>
    </div>
  );
}
