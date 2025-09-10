import { GoogleGenAI, Type } from "@google/genai";
import { AiInsight, Product, Sale, Expense, InventoryForecast } from '../types';

// Extend the Window interface to include our app-specific config
// FIX: Unified the APP_CONFIG type to include properties from all services, preventing type conflicts.
declare global {
    interface Window {
        APP_CONFIG?: {
            API_KEY?: string;
            SUPABASE_URL?: string;
            SUPABASE_ANON_KEY?: string;
        };
    }
}

// Prefer Vite env vars, fallback to window.APP_CONFIG (from config.local.js)
// These env vars should be provided in .env.local as VITE_GEMINI_API_KEY
const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const apiKey = envApiKey || window.APP_CONFIG?.API_KEY;

if (!apiKey || apiKey.startsWith('PASTE_YOUR')) {
  console.error('Environment variables debug:', {
    VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    envApiKey: envApiKey,
    importMetaEnv: import.meta.env,
    windowAppConfig: window.APP_CONFIG,
    allEnvKeys: Object.keys(import.meta.env)
  });
  throw new Error("Gemini API key not found or is a placeholder. Please set VITE_GEMINI_API_KEY in your deployment environment variables or .env.local file.");
}

const ai = new GoogleGenAI({ apiKey });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A short, one-sentence summary of the answer to the user's query."
        },
        data: {
            type: Type.ARRAY,
            description: "An array of data points to be visualized. Should be empty if there's no relevant data.",
            items: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING, description: "The label for the data point (e.g., product name, date)." },
                    value: { type: Type.NUMBER, description: "The numerical value for the data point (e.g., sales total, quantity)." }
                },
                required: ["label", "value"]
            }
        },
        chartType: {
            type: Type.STRING,
            description: "The suggested chart type for visualization. Can be 'bar', 'line', or 'pie'.",
            enum: ['bar', 'line', 'pie']
        }
    },
    required: ["summary", "data", "chartType"]
};

const forecastSchema = {
    type: Type.ARRAY,
    description: "A list of products that need to be reordered based on sales trends and current stock.",
    items: {
        type: Type.OBJECT,
        properties: {
            productId: { type: Type.NUMBER, description: "The unique ID of the product." },
            productName: { type: Type.STRING, description: "The name of the product." },
            currentStock: { type: Type.NUMBER, description: "The current stock level of the product." },
            predictedWeeklySales: { type: Type.NUMBER, description: "The AI's prediction for the number of units that will be sold in the next 7 days." },
            suggestedReorderQuantity: { type: Type.NUMBER, description: "The suggested quantity to reorder to maintain adequate stock levels." },
            reasoning: { type: Type.STRING, description: "A brief, one-sentence explanation for why this item needs reordering." }
        },
        required: ["productId", "productName", "currentStock", "predictedWeeklySales", "suggestedReorderQuantity", "reasoning"]
    }
};

export const getAiInsight = async (
  query: string,
  context: { products: Product[], sales: Sale[], expenses: Expense[] }
): Promise<AiInsight> => {
    try {
        const systemInstruction = `You are a helpful data analyst for a restaurant POS system called 'Easy Eat'. 
        Your goal is to answer questions based on the provided JSON data context about products, sales, and expenses.
        Analyze the data to answer the user's query. The data is the single source of truth. Do not invent or assume data.
        For sales data, timestamps are in ISO format. The current date is ${new Date().toISOString()}.
        Always provide a concise summary and, if applicable, data points for a chart.
        Respond ONLY with a valid JSON object that adheres to the provided schema. Do not include any other text or markdown formatting.`;

        // Limit sales data to prevent excessively large API requests
        const recentSales = context.sales.slice(0, 100); 

        const contextString = JSON.stringify({
            products: context.products.map(p => ({id: p.id, name: p.name, category: p.category, price: p.price, stock: p.stock})),
            sales: recentSales.map(s => ({
                total: s.total,
                timestamp: s.timestamp.toISOString(),
                items: s.items.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price }))
            })),
            expenses: context.expenses.map(e => ({description: e.description, category: e.category, amount: e.amount, date: e.date.toISOString()}))
        });

        const content = `USER QUERY: "${query}"\n\nDATA CONTEXT:\n${contextString}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: content,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
            },
        });
        
        const jsonText = response.text;
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && typeof parsedJson.summary === 'string' && Array.isArray(parsedJson.data)) {
            return parsedJson as AiInsight;
        } else {
            throw new Error("Received malformed JSON from AI.");
        }

    } catch (error) {
        console.error("Error fetching AI insight:", error);
        throw new Error("Failed to communicate with the AI service.");
    }
};

export const getInventoryForecast = async (
  context: { products: Product[], sales: Sale[] }
): Promise<InventoryForecast[]> => {
    try {
        const systemInstruction = `You are a supply chain analyst for a restaurant POS system. Your task is to predict inventory needs.
        Analyze the provided JSON data, which includes a list of all products with their current stock levels, and a list of recent sales transactions.
        The current date is ${new Date().toISOString()}.
        Your goal is to identify which products are at risk of stocking out soon based on their recent sales velocity.
        Calculate the sales velocity for each product over the last 14 days to determine a predicted weekly sales number.
        Based on the current stock and predicted weekly sales, suggest a reorder quantity. A good rule of thumb is to have at least 2-3 weeks of stock on hand.
        Provide a brief reasoning for each recommendation.
        If a product has sufficient stock for the next month, do not include it in your response.
        Respond ONLY with a valid JSON object that adheres to the provided schema. The response should be an array of objects. Do not include any other text or markdown formatting.`;

        // Limit sales data to recent history for velocity calculation
        const recentSales = context.sales.filter(s => {
            const saleDate = s.timestamp;
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            return saleDate > twoWeeksAgo;
        });

        const contextString = JSON.stringify({
            products: context.products.map(p => ({id: p.id, name: p.name, stock: p.stock})),
            sales: recentSales.map(s => ({
                timestamp: s.timestamp.toISOString(),
                items: s.items.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity }))
            }))
        });

        const content = `DATA CONTEXT:\n${contextString}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: content,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: forecastSchema,
            },
        });
        
        const jsonText = response.text;
        const parsedJson = JSON.parse(jsonText);
        
        if (Array.isArray(parsedJson)) {
            return parsedJson as InventoryForecast[];
        } else {
            console.error("Received non-array response for forecast:", parsedJson);
            throw new Error("Received malformed JSON from AI for forecast.");
        }

    } catch (error) {
        console.error("Error generating inventory forecast:", error);
        throw new Error("Failed to communicate with the AI service for forecasting.");
    }
};