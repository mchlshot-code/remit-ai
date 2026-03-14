export function AlertForm() {
    return (
        <form className="flex flex-col gap-4 max-w-sm border p-4 rounded-md">
            <h3 className="font-semibold">Set Rate Alert</h3>
            <input type="number" placeholder="Target Rate" className="border rounded px-2 py-1" />
            <button className="bg-amber-600 text-white px-4 py-2 rounded">Create Alert</button>
        </form>
    );
}
