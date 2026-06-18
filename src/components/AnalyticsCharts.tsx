"use client";

import { useTheme } from "next-themes";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#19c985', '#b45309', '#cbd5e1', '#64748b'];

export default function AnalyticsCharts({ 
  revenueOverTime = [], 
  revenueByPayment = [],
  currencySymbol = "$"
}: { 
  revenueOverTime?: any[], 
  revenueByPayment?: any[],
  currencySymbol?: string
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 min-w-0">
      <div className="lg:col-span-2 bg-white dark:bg-[#1b1d22] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33] flex flex-col min-w-0">
        <h2 className="text-xl font-bold mb-6 dark:text-white">Revenue Overview</h2>
        <div className="flex-1 w-full relative min-h-[256px]">
          <div className="absolute inset-0">
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={revenueOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#19c985" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#19c985" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? (value/1000) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{ stroke: isDark ? '#22242a' : '#f1f5f9', strokeWidth: 2 }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: isDark ? '1px solid #2a2c33' : 'none',
                    backgroundColor: isDark ? '#1b1d22' : '#ffffff',
                    color: isDark ? '#ffffff' : '#171717',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ color: '#19c985', fontWeight: 'bold' }}
                  formatter={(value: any, name: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, name === 'income' ? 'Income' : 'Expense']}
                />
                <Area type="monotone" dataKey="income" name="income" stroke="#19c985" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1b1d22] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33] min-w-0">
        <h2 className="text-xl font-bold mb-6 dark:text-white">Top Products</h2>
        <div className="h-[192px] relative w-full">
          <ResponsiveContainer width="100%" height={192}>
            <PieChart>
              <Pie
                data={revenueByPayment}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {revenueByPayment.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: isDark ? '1px solid #2a2c33' : 'none',
                  backgroundColor: isDark ? '#1b1d22' : '#ffffff',
                  color: isDark ? '#ffffff' : '#171717',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
                itemStyle={{ color: '#19c985', fontWeight: 'bold' }}
                formatter={(value: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">Total</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {currencySymbol}{revenueByPayment.reduce((a, b) => a + b.value, 0).toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          {revenueByPayment.map((entry, index) => {
            const total = revenueByPayment.reduce((a, b) => a + b.value, 0);
            const percentage = total === 0 ? 0 : Math.round((entry.value / total) * 100);
            return (
              <div key={entry.name} className="flex flex-col text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm dark:text-gray-200 truncate pr-2">{entry.name}</span>
                  <span className="font-bold text-sm text-[#19c985] dark:text-[#19c985]">{currencySymbol}{entry.value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>{percentage}% of total</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#22242a] rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
