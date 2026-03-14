export function AiChat() {
    return (
        <div className="flex flex-col h-full border rounded-md p-4">
            <div className="flex-1 overflow-y-auto">
                {/* Chat messages */}
                <p>AI Assistant Chat Placeholder</p>
            </div>
            <div className="mt-4 flex gap-2">
                <input type="text" placeholder="Ask RemitAI..." className="flex-1 border rounded px-2" />
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
            </div>
        </div>
    );
}
