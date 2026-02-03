import type { SavingsBucket } from '../types';
import { BUCKET_PRESETS } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  bucket: SavingsBucket;
  onChange: (bucket: SavingsBucket) => void;
  onDelete: () => void;
}

export function BucketForm({ bucket, onChange, onDelete }: Props) {
  const handlePresetChange = (type: string) => {
    const preset = BUCKET_PRESETS[type];
    if (preset) {
      onChange({
        ...bucket,
        ...preset,
        type: type as SavingsBucket['type'],
      });
    } else {
      onChange({ ...bucket, type: 'other' });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={bucket.name}
          onChange={(e) => onChange({ ...bucket, name: e.target.value })}
          className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bucket Type
            <InfoTooltip content="Changing the type will update the default values for returns and volatility based on typical values for that account type." />
          </label>
          <select
            value={bucket.type}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="hysa">High-Yield Savings (HYSA)</option>
            <option value="401k">401(k)</option>
            <option value="etf">ETF Portfolio</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Balance ($)
            <InfoTooltip content="How much money is currently in this account. Check your latest statement or log into your account to find this." />
          </label>
          <input
            type="number"
            value={bucket.currentBalance}
            onChange={(e) => onChange({ ...bucket, currentBalance: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Annual Return (%)
            <InfoTooltip content="The average yearly growth rate you expect. HYSA: 4-5%, Bonds: 3-5%, Stock market (S&P 500): historically ~7-10% after inflation. Past performance doesn't guarantee future results." />
          </label>
          <input
            type="number"
            step="0.1"
            value={bucket.annualReturn}
            onChange={(e) => onChange({ ...bucket, annualReturn: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Return Volatility (%)
            <InfoTooltip content="How much returns fluctuate year-to-year. Higher = more unpredictable. HYSA: ~0.5% (stable), Bonds: ~5%, Stocks: ~15-20% (can swing wildly). This affects the spread between best and worst case scenarios." />
          </label>
          <input
            type="number"
            step="0.1"
            value={bucket.returnVolatility}
            onChange={(e) => onChange({ ...bucket, returnVolatility: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {bucket.type !== '401k' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contribution Type
              <InfoTooltip content="Fixed: You contribute the same dollar amount each month. Percentage: You contribute a percentage of your salary (useful if your income grows over time)." />
            </label>
            <select
              value={bucket.contributionType}
              onChange={(e) => onChange({ ...bucket, contributionType: e.target.value as 'fixed' | 'percentage' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fixed">Fixed Monthly Amount</option>
              <option value="percentage">Percentage of Salary</option>
            </select>
          </div>
        )}

        {(bucket.type === '401k' || bucket.contributionType === 'fixed') ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Contribution ($)
              <InfoTooltip content="How much you add to this account each month. For 401(k), this is typically deducted from your paycheck before taxes." />
            </label>
            <input
              type="number"
              value={bucket.monthlyContribution}
              onChange={(e) => onChange({ ...bucket, monthlyContribution: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contribution (% of Salary)
              <InfoTooltip content="The percentage of your annual salary you'll contribute to this account each year. Example: 10% of a $100,000 salary = $10,000/year contribution." />
            </label>
            <input
              type="number"
              step="0.1"
              value={bucket.contributionPercentage}
              onChange={(e) => onChange({ ...bucket, contributionPercentage: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {bucket.type === '401k' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Annual Contribution ($)
              <InfoTooltip content="The IRS limits how much you can contribute to a 401(k) each year. For 2024, the limit is $23,000 (or $30,500 if you're 50+). This is your contribution only, not including employer match." />
            </label>
            <input
              type="number"
              value={bucket.maxAnnualContribution || 23500}
              onChange={(e) => onChange({ ...bucket, maxAnnualContribution: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {bucket.type === '401k' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employer Match (%)
                <InfoTooltip content="Many employers will match a portion of your 401(k) contributions - this is free money! For example, 50% match means for every $1 you contribute, your employer adds $0.50." />
              </label>
              <input
                type="number"
                step="1"
                value={bucket.employerMatch || 0}
                onChange={(e) => onChange({ ...bucket, employerMatch: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Limit (% of salary)
                <InfoTooltip content="Employers typically only match up to a certain percentage of your salary. Example: 50% match up to 6% means if you contribute 6% of salary, employer adds 3%. Contributing more than 6% won't get additional matching." />
              </label>
              <input
                type="number"
                step="0.1"
                value={bucket.employerMatchLimit || 0}
                onChange={(e) => onChange({ ...bucket, employerMatchLimit: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {bucket.type === '401k' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <strong>Tip:</strong> Always try to contribute at least enough to get the full employer match - 
          it's essentially a 50-100% instant return on your money!
        </div>
      )}
    </div>
  );
}
