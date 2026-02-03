import type { UserInputs, SavingsBucket } from '../types';
import { DEFAULT_BUCKET, BUCKET_PRESETS } from '../types';
import { BucketForm } from './BucketForm';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  inputs: UserInputs;
  onChange: (inputs: UserInputs) => void;
  onSimulate: () => void;
  isSimulating: boolean;
}

export function InputForm({ inputs, onChange, onSimulate, isSimulating }: Props) {
  const addBucket = (type: keyof typeof BUCKET_PRESETS | 'other') => {
    const preset = BUCKET_PRESETS[type] || {};
    const newBucket: SavingsBucket = {
      ...DEFAULT_BUCKET,
      ...preset,
      id: uuidv4(),
      type: type as SavingsBucket['type'],
    };
    onChange({ ...inputs, buckets: [...inputs.buckets, newBucket] });
  };

  const updateBucket = (index: number, bucket: SavingsBucket) => {
    const newBuckets = [...inputs.buckets];
    newBuckets[index] = bucket;
    onChange({ ...inputs, buckets: newBuckets });
  };

  const deleteBucket = (index: number) => {
    const newBuckets = inputs.buckets.filter((_, i) => i !== index);
    onChange({ ...inputs, buckets: newBuckets });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Personal Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Age
            </label>
            <input
              type="number"
              value={inputs.currentAge}
              onChange={(e) => onChange({ ...inputs, currentAge: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retirement Age
            </label>
            <input
              type="number"
              value={inputs.retirementAge}
              onChange={(e) => onChange({ ...inputs, retirementAge: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projection Years
            </label>
            <input
              type="number"
              value={inputs.projectionYears}
              onChange={(e) => onChange({ ...inputs, projectionYears: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Income</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Annual Salary ($)
            </label>
            <input
              type="number"
              value={inputs.currentSalary}
              onChange={(e) => onChange({ ...inputs, currentSalary: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Salary Increase (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.annualSalaryIncrease}
              onChange={(e) => onChange({ ...inputs, annualSalaryIncrease: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Retirement Spending</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Spending in Retirement ($)
            </label>
            <input
              type="number"
              value={inputs.monthlyRetirementSpending}
              onChange={(e) => onChange({ ...inputs, monthlyRetirementSpending: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Spending Increase (%)
              <span className="text-gray-400 text-xs ml-1">(inflation)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.retirementSpendingIncrease}
              onChange={(e) => onChange({ ...inputs, retirementSpendingIncrease: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Savings Buckets</h2>
          <div className="flex gap-2">
            <button
              onClick={() => addBucket('hysa')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              + HYSA
            </button>
            <button
              onClick={() => addBucket('401k')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              + 401(k)
            </button>
            <button
              onClick={() => addBucket('etf')}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              + ETF
            </button>
            <button
              onClick={() => addBucket('other')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              + Other
            </button>
          </div>
        </div>

        {inputs.buckets.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No savings buckets added. Click a button above to add one.
          </p>
        ) : (
          <div className="space-y-4">
            {inputs.buckets.map((bucket, index) => (
              <BucketForm
                key={bucket.id}
                bucket={bucket}
                onChange={(updated) => updateBucket(index, updated)}
                onDelete={() => deleteBucket(index)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onSimulate}
        disabled={isSimulating || inputs.buckets.length === 0}
        className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSimulating ? 'Running Simulation...' : 'Run Wealth Projection'}
      </button>
    </div>
  );
}
