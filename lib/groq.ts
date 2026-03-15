import Groq from 'groq-sdk';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key_to_pass_build'
});

