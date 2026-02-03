import type { UserInputs, SavingsBucket } from '../types';
import { DEFAULT_BUCKET, BUCKET_PRESETS } from '../types';
import { BucketForm } from './BucketForm';
import { InfoTooltip } from './InfoTooltip';
import { InfoBlock } from './InfoBlock';
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
      <InfoBlock title="Getting Started - What is this tool?">
        <p className="mb-2">
          This tool helps you visualize how your savings might grow over time until and through retirement. 
          It uses a technique called <strong>Monte Carlo simulation</strong> to show you a range of possible outcomes, 
          not just one prediction.
        </p>
        <p className="mb-2">
          <strong>Why a range?</strong> Because investments don't grow at a steady rate - they go up and down. 
          The simulation runs 1,000 different scenarios with random market fluctuations to show you 
          best-case, worst-case, and most likely outcomes.
        </p>
        <p>
          <strong>Tip:</strong> Start by entering your basic info below, then add your savings accounts (called "buckets"). 
          Don't worry about being exact - you can always adjust and re-run the simulation.
        </p>
      </InfoBlock>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Personal Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Age
              <InfoTooltip content="Your age today. This is the starting point for all projections." />
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
              <InfoTooltip content="The age when you plan to stop working. After this age, you'll stop contributing to savings and start withdrawing for expenses." />
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
              <InfoTooltip content="How many years into the future to simulate. Set this beyond retirement to see if your savings will last. For example, if you're 30 and want to see until age 90, enter 60 years." />
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
        <InfoBlock title="Why does income matter?">
          <p className="mb-2">
            Your salary determines how much you can contribute to savings accounts, especially those 
            where contributions are a percentage of your income (like some retirement accounts).
          </p>
          <p>
            <strong>Tip:</strong> A typical salary increase is 2-4% per year. This accounts for raises, 
            promotions, and inflation adjustments. Be conservative if unsure - it's better to be pleasantly 
            surprised than disappointed.
          </p>
        </InfoBlock>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Annual Salary ($)
              <InfoTooltip content="Your total yearly income before taxes. This is used to calculate percentage-based contributions to savings." />
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
              <InfoTooltip content="How much you expect your salary to grow each year on average. This compounds over time, so even small percentages add up." />
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
        <InfoBlock title="Planning for retirement expenses">
          <p className="mb-2">
            Once you retire, you'll stop earning a salary and start withdrawing from your savings to cover 
            living expenses. This section lets you estimate how much you'll need.
          </p>
          <p className="mb-2">
            <strong>Common rule of thumb:</strong> Many financial advisors suggest you'll need about 70-80% 
            of your pre-retirement income to maintain your lifestyle.
          </p>
          <p>
            <strong>Don't forget inflation:</strong> $5,000/month today won't buy the same amount in 30 years. 
            The spending increase percentage accounts for this - historical US inflation averages around 2-3% per year.
          </p>
        </InfoBlock>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Spending in Retirement ($)
              <InfoTooltip content="How much you expect to spend each month after retiring. Include housing, food, healthcare, travel, hobbies, etc. This amount will be withdrawn from your savings." />
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
              <InfoTooltip content="How much your expenses will increase each year due to inflation. Historically, inflation averages 2-3% per year. Healthcare costs often rise faster (5-6%)." />
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
          <div className="flex gap-2 flex-wrap justify-end">
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

        <InfoBlock title="Understanding savings buckets">
          <p className="mb-2">
            A "bucket" is simply a type of savings or investment account. Different buckets have different 
            characteristics - some are safer but grow slowly, others are riskier but can grow faster.
          </p>
          <div className="mb-2">
            <strong>Common bucket types:</strong>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li><strong>HYSA (High-Yield Savings Account):</strong> Very safe, low returns (~4-5%), great for emergency funds</li>
              <li><strong>401(k):</strong> Retirement account with tax benefits and often employer matching - free money!</li>
              <li><strong>ETF/Index Funds:</strong> Diversified stock investments, higher risk but historically ~7-10% returns</li>
              <li><strong>Other:</strong> Any other savings like bonds, real estate, crypto, etc.</li>
            </ul>
          </div>
          <p>
            <strong>Tip:</strong> Most financial advisors recommend having 3-6 months of expenses in a safe HYSA, 
            then investing the rest in a mix of retirement accounts and index funds.
          </p>
        </InfoBlock>

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
