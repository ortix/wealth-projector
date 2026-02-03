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
import { CURRENCIES } from '../types';
import { formatCurrency } from '../simulation';
import { InfoBlock } from './InfoBlock';
import { InfoTooltip } from './InfoTooltip';

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

  const currency = inputs.currency;
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const retirementIndex = Math.max(0, Math.min(results.deterministic.length - 1, inputs.retirementAge - inputs.currentAge));
  const retirementAge = inputs.retirementAge;
  const retirementAnnualSpending = inputs.monthlyRetirementSpending * 12 * Math.pow(1 + inputs.retirementSpendingIncrease / 100, retirementIndex);
  const retirementP50Balance = results.monteCarlo.percentiles.p50[retirementIndex];
  const safeWithdrawalRate = retirementP50Balance > 0 ? (retirementAnnualSpending / retirementP50Balance) * 100 : null;

  const readinessScore = (() => {
    const sims = results.monteCarlo.simulations || [];
    if (!sims.length) return null;
    const success = sims.filter((sim) => sim.slice(retirementIndex).every((year) => year.totalSavings > 0)).length;
    return Math.round((success / sims.length) * 100);
  })();

  const runOutIndex = results.monteCarlo.percentiles.p10.findIndex((value, idx) => idx >= retirementIndex && value <= 0);
  const runOutAge = runOutIndex !== -1 ? inputs.currentAge + runOutIndex : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">Age: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const finalDeterministic = results.deterministic[results.deterministic.length - 1];
  const finalP50 = results.monteCarlo.percentiles.p50[results.monteCarlo.percentiles.p50.length - 1];
  const finalP10 = results.monteCarlo.percentiles.p10[results.monteCarlo.percentiles.p10.length - 1];
  const finalP90 = results.monteCarlo.percentiles.p90[results.monteCarlo.percentiles.p90.length - 1];

  return (
    <div className="space-y-8">
      <InfoBlock title="Understanding Your Results">
        <p className="mb-2">
          The simulation ran 1,000 different scenarios with randomized market returns to show you a range of possible outcomes.
          This helps you plan for uncertainty rather than relying on a single prediction.
        </p>
        <div className="mb-2">
          <strong>What the percentiles mean:</strong>
          <ul className="list-disc list-inside mt-1 ml-2">
            <li><strong>P10 (Conservative):</strong> 90% of scenarios did better than this - your "bad luck" case</li>
            <li><strong>P50 (Median):</strong> Half of scenarios did better, half did worse - the most realistic expectation</li>
            <li><strong>P90 (Optimistic):</strong> Only 10% of scenarios did better - your "good luck" case</li>
          </ul>
        </div>
        <p>
          <strong>Tip:</strong> Plan based on P10 or P25 to be conservative. If your P10 scenario still meets your needs, 
          you're in great shape! If not, consider increasing savings or adjusting retirement plans.
        </p>
      </InfoBlock>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Summary Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">
              Final Wealth (Expected)
              <InfoTooltip content="This assumes steady, average returns every year with no volatility. Real markets fluctuate, so use the Monte Carlo results for more realistic planning." />
            </p>
            <p className="text-2xl font-bold text-blue-800">
              {formatCurrency(finalDeterministic.totalSavings, currency)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">
              Monte Carlo Median (P50)
              <InfoTooltip content="The middle outcome - half of the 1,000 simulations ended with more than this, half with less. This is a realistic expectation." />
            </p>
            <p className="text-2xl font-bold text-green-800">{formatCurrency(finalP50, currency)}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-600 font-medium">
              Conservative (P10)
              <InfoTooltip content="90% of simulations did better than this. Use this for conservative planning - if this amount meets your needs, you're likely in good shape." />
            </p>
            <p className="text-2xl font-bold text-yellow-800">{formatCurrency(finalP10, currency)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">
              Optimistic (P90)
              <InfoTooltip content="Only 10% of simulations did better than this. Don't plan on this - it requires consistently good market performance over many years." />
            </p>
            <p className="text-2xl font-bold text-purple-800">{formatCurrency(finalP90, currency)}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-sm text-emerald-600 font-medium">
              Retirement Readiness
              <InfoTooltip content="Percentage of Monte Carlo scenarios where your portfolio never hits $0 after retirement within the projection window." />
            </p>
            <p className="text-2xl font-bold text-emerald-800">
              {readinessScore !== null ? `${readinessScore}%` : 'N/A'}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">
              Years Until Money Runs Out (P10)
              <InfoTooltip content="Uses the conservative 10th percentile path. If it drops to or below $0, this shows the age it happens; otherwise you stay solvent in this percentile." />
            </p>
            <p className="text-2xl font-bold text-orange-800">
              {runOutAge !== null ? `Age ${runOutAge}` : 'Stays solvent'}
            </p>
          </div>
          <div className="bg-rose-50 rounded-lg p-4">
            <p className="text-sm text-rose-600 font-medium">
              Safe Withdrawal Rate
              <InfoTooltip content="Annual retirement spending (inflation-adjusted to your retirement year) divided by the median (P50) portfolio at retirement. Lower is safer; ~4% is a common guideline." />
            </p>
            <p className="text-2xl font-bold text-rose-800">
              {safeWithdrawalRate !== null ? `${safeWithdrawalRate.toFixed(1)}%` : 'N/A'}
            </p>
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
              tickFormatter={(value) => `${currencySymbol}${(value / 1000000).toFixed(1)}M`}
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
              tickFormatter={(value) => `${currencySymbol}${(value / 1000000).toFixed(1)}M`}
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
                    {formatCurrency(proj.salary, currency)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {formatCurrency(proj.yearlyContributions, currency)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600">
                    {proj.yearlyWithdrawals > 0 ? `-${formatCurrency(proj.yearlyWithdrawals, currency)}` : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {formatCurrency(proj.yearlyReturns, currency)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    {formatCurrency(proj.totalSavings, currency)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-yellow-600">
                    {formatCurrency(results.monteCarlo.percentiles.p10[index], currency)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">
                    {formatCurrency(results.monteCarlo.percentiles.p50[index], currency)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-purple-600">
                    {formatCurrency(results.monteCarlo.percentiles.p90[index], currency)}
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
