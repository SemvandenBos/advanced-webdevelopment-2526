function fmt(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
}

interface Props {
  income: number;
  expenses: number;
  balance: number;
}

export default function MonthlySummary({ income, expenses, balance }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 mb-1">Inkomsten</p>
        <p className="text-lg font-semibold text-green-600">{fmt(income)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 mb-1">Uitgaven</p>
        <p className="text-lg font-semibold text-red-600">{fmt(expenses)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 mb-1">Balans</p>
        <p className={`text-lg font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {fmt(balance)}
        </p>
      </div>
    </div>
  );
}
