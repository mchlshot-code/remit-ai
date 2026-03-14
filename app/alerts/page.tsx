import { AlertForm } from '../../components/alert-form';

export default function AlertsPage() {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-4">Rate Alerts</h1>
            <p className="mb-8 text-gray-600">Set up notifications to get an email when rates hit your target.</p>
            <AlertForm />
        </div>
    );
}
