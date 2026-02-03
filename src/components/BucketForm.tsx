import type { SavingsBucket } from '../types';
import { BUCKET_PRESETS } from '../types';

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
            <span className="text-gray-400 text-xs ml-1">(for Monte Carlo)</span>
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
              <span className="text-gray-400 text-xs ml-1">(IRS limit)</span>
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
    </div>
  );
}
