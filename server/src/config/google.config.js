import dotenv from 'dotenv';
dotenv.config();

export const config = {
    googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    model: process.env.ORBITAL_AI_MODEL || 'gemini-2.5-flash',
    temperature: parseFloat(process.env.ORBITAL_AI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.ORBITAL_AI_MAX_TOKENS || '2048', 10),
};
