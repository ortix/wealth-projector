import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from 'recharts';
import type { SimulationResults, UserInputs } from '../types';
import { formatCurrency } from '../simulation';

interface Props {
  results: SimulationResults;
  inputs: UserInputs;
}

export function ResultsChart({ results, inputs }: Props) {
  const chartData = results.deterministic.map((proj, index) => ({
    age: proj.age,
    year: proj.year,
    deterministic: proj.totalSavings,
    p10: results.monteCarlo.percentiles.p10[index],
    p25: results.monteCarlo.percentiles.p25[index],
    p50: results.monteCarlo.percentiles.p50[index],
    p75: results.monteCarlo.percentiles.p75[index],
    p90: results.monteCarlo.percentiles.p90[index],
    ...proj.bucketBalances,
  }));

  const bucketChartData = results.deterministic.map((proj) => ({
    age: proj.age,
    ...inputs.buckets.reduce((acc, bucket) => {
      acc[bucket.name] = proj.bucketBalances[bucket.id] || 0;
      return acc;
    }, {} as Record<string, number>),
  }));

  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">Age: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const retirementAge = inputs.retirementAge;
  const finalDeterministic = results.deterministic[results.deterministic.length - 1];
  const finalP50 = results.monteCarlo.percentiles.p50[results.monteCarlo.percentiles.p50.length - 1];
  const finalP10 = results.monteCarlo.percentiles.p10[results.monteCarlo.percentiles.p10.length - 1];
  const finalP90 = results.monteCarlo.percentiles.p90[results.monteCarlo.percentiles.p90.length - 1];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Summary Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Final Wealth (Expected)</p>
            <p className="text-2xl font-bold text-blue-800">
              {formatCurrency(finalDeterministic.totalSavings)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Monte Carlo Median (P50)</p>
            <p className="text-2xl font-bold text-green-800">{formatCurrency(finalP50)}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-600 font-medium">Conservative (P10)</p>
            <p className="text-2xl font-bold text-yellow-800">{formatCurrency(finalP10)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Optimistic (P90)</p>
            <p className="text-2xl font-bold text-purple-800">{formatCurrency(finalP90)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Monte Carlo Simulation (1000 scenarios)
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Shaded areas show the range of outcomes. The darker the shade, the more likely the outcome.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="age"
              label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              label={{ value: 'Total Wealth', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="p90"
              stackId="1"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.1}
              name="90th Percentile"
            />
            <Area
              type="monotone"
              dataKey="p75"
              stackId="2"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.2}
              name="75th Percentile"
            />
            <Area
              type="monotone"
              dataKey="p50"
              stackId="3"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Median (50th)"
            />
            <Area
              type="monotone"
              dataKey="p25"
              stackId="4"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.2}
              name="25th Percentile"
            />
            <Area
              type="monotone"
              dataKey="p10"
              stackId="5"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.1}
              name="10th Percentile"
            />
            <Line
              type="monotone"
              dataKey="deterministic"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Expected (No Volatility)"
            />
            {retirementAge <= chartData[chartData.length - 1]?.age && (
              <Line
                type="monotone"
                dataKey={() => null}
                stroke="#888"
                strokeDasharray="5 5"
                name={`Retirement (Age ${retirementAge})`}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Breakdown by Bucket</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={bucketChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="age"
              label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              label={{ value: 'Balance', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {inputs.buckets.map((bucket, index) => (
              <Area
                key={bucket.id}
                type="monotone"
                dataKey={bucket.name}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Year-by-Year Projection</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Salary
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contributions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Withdrawals
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Returns
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Savings
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  MC P10
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  MC P50
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  MC P90
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.deterministic.map((proj, index) => (
                <tr
                  key={proj.year}
                  className={proj.age >= retirementAge ? 'bg-yellow-50' : ''}
                >
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {proj.age}
                    {proj.age === retirementAge && (
                      <span className="ml-2 text-xs text-yellow-600">(Retired)</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {formatCurrency(proj.salary)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {formatCurrency(proj.yearlyContributions)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600">
                    {proj.yearlyWithdrawals > 0 ? `-${formatCurrency(proj.yearlyWithdrawals)}` : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {formatCurrency(proj.yearlyReturns)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    {formatCurrency(proj.totalSavings)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-yellow-600">
                    {formatCurrency(results.monteCarlo.percentiles.p10[index])}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">
                    {formatCurrency(results.monteCarlo.percentiles.p50[index])}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-purple-600">
                    {formatCurrency(results.monteCarlo.percentiles.p90[index])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
