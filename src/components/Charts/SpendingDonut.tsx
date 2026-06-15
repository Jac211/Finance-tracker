import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORY_COLORS } from '../../types';

interface SpendingDonutProps {
  data: Record<string, number>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-xs text-slate-400">{payload[0].name}</p>
        <p className="text-sm font-semibold text-white">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export function SpendingDonut({ data }: SpendingDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({
      name,
      value,
      fill: CATEGORY_COLORS[name] || '#6b7280',
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No spending data for this month
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="relative w-48 h-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.fill}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <span className="text-xs text-slate-400">Total</span>
          <span className="text-sm font-bold text-white">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex-1 w-full grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
        {chartData.map((item, index) => (
          <div
            key={item.name}
            className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors ${
              activeIndex === index ? 'bg-slate-700/50' : ''
            }`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs text-slate-300 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              <span className="text-xs text-slate-400">
                {total > 0 ? `${Math.round((item.value / total) * 100)}%` : '0%'}
              </span>
              <span className="text-xs font-medium text-white">{formatCurrency(item.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
