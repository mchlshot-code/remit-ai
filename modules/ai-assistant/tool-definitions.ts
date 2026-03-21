import Groq from 'groq-sdk';

export const REMITAI_TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_live_rates",
      description: "Fetch current live exchange rates for a sending corridor",
      parameters: {
        type: "object",
        properties: {
          from_currency: { type: "string" },
          to_currency: { type: "string" },
          amount: { type: "number", default: 100 }
        },
        required: ["from_currency", "to_currency"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_best_provider",
      description: "Return the single best remittance provider for a corridor and amount, with savings vs worst rate",
      parameters: {
        type: "object",
        properties: {
          from_currency: { type: "string" },
          to_currency: { type: "string" },
          amount: { type: "number" }
        },
        required: ["from_currency", "to_currency", "amount"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_rate_alert",
      description: "Create a rate alert — notify user by email when target rate is reached",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string" },
          from_currency: { type: "string" },
          to_currency: { type: "string" },
          target_rate: { type: "number" }
        },
        required: ["email", "from_currency", "to_currency", "target_rate"]
      }
    }
  }
];
