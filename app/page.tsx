import { ComparisonTable } from '../components/comparison-table';
import { RateInputForm } from '../components/rate-input-form';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8 bg-gray-50">
      <div className="max-w-4xl w-full flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            RemitAI
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            Find the best remittance rates in real-time. Compare fees, delivery times, and get maximum value for your money.
          </p>
        </div>

        <div className="w-full bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-6 text-center">Compare Rates Now</h2>
          <div className="flex justify-center mb-8">
            <RateInputForm />
          </div>
          <ComparisonTable />
        </div>
      </div>
    </main>
  );
}
