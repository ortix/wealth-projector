import { useState, useEffect, useRef } from 'react';
import type { UserInputs, SimulationResults } from './types';
import { BUCKET_PRESETS } from './types';
import { InputForm } from './components/InputForm';
import { ResultsChart } from './components/ResultsChart';
import { runMonteCarloSimulation } from './simulation';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'wealth-forecaster-inputs';

const defaultInputs: UserInputs = {
  currentAge: 30,
  retirementAge: 65,
  currentSalary: 100000,
  annualSalaryIncrease: 3,
  projectionYears: 40,
  monthlyRetirementSpending: 5000,
  retirementSpendingIncrease: 2.5,
  buckets: [
    {
      id: uuidv4(),
      name: '401(k)',
      type: '401k',
      currentBalance: 50000,
      annualReturn: 7,
      returnVolatility: 15,
      monthlyContribution: 1500,
      contributionType: 'fixed',
      contributionPercentage: 0,
      employerMatch: 50,
      employerMatchLimit: 6,
      maxAnnualContribution: 23500,
      ...BUCKET_PRESETS['401k'],
    },
    {
      id: uuidv4(),
      name: 'High-Yield Savings',
      type: 'hysa',
      currentBalance: 20000,
      annualReturn: 4.5,
      returnVolatility: 0.5,
      monthlyContribution: 500,
      contributionType: 'fixed',
      contributionPercentage: 0,
      ...BUCKET_PRESETS['hysa'],
    },
  ],
};

function loadFromStorage(): UserInputs | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as UserInputs;
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return null;
}

function saveToStorage(inputs: UserInputs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function App() {
  const [inputs, setInputs] = useState<UserInputs>(() => loadFromStorage() || defaultInputs);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveToStorage(inputs);
  }, [inputs]);

  const handleExport = () => {
    const dataStr = JSON.stringify(inputs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wealth-forecast-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as UserInputs;
        setInputs(imported);
        setResults(null);
      } catch (err) {
        alert('Failed to import file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const simulationResults = runMonteCarloSimulation(inputs, 1000);
    setResults(simulationResults);
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wealth Forecaster</h1>
            <p className="text-gray-500 text-sm">
              Project your wealth growth with Monte Carlo simulation
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Export JSON
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Import JSON
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <InputForm
            inputs={inputs}
            onChange={setInputs}
            onSimulate={handleSimulate}
            isSimulating={isSimulating}
          />
        </div>
        
        {results ? (
          <ResultsChart results={results} inputs={inputs} />
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <svg
              className="mx-auto h-16 w-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-lg font-medium">No simulation results yet</p>
            <p className="text-sm mt-2">
              Configure your inputs and click "Run Wealth Projection" to see your forecast
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          Wealth Forecaster - Monte Carlo Simulation Tool
        </div>
      </footer>
    </div>
  );
}

export default App;
