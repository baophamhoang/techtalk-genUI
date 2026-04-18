import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, tool } from 'ai';
import { z } from 'zod';

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  },
  baseURL: 'https://openrouter.ai/api/v1',
});

// Configure long max duration for Edge function/Vercel
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter('minimax/minimax-m2.7'),
    messages,
    system: "You are a helpful and friendly Generative UI assistant. Tương tác với người dùng bằng tiếng Việt một cách tự nhiên, thân thiện. ALWAYS provide a polite and helpful textual introduction or explanation alongside your tool calls. When a user asks for weather, flights, or stocks, you MUST use the appropriate tool to fetch the data, but ALSO write a kind message like 'Dạ, em gửi anh/chị thông tin thời tiết nhé' or 'Đây là diễn biến của thị trường hiện tại ạ'.",
    tools: {
      getWeather: tool({
        description: 'Get the current weather forecast for a specified city.',
        inputSchema: z.object({
          city: z.string().describe('The name of the city (e.g., Hanoi, Ho Chi Minh, Tokyo)'),
        }),
        execute: async ({ city }) => {
          // Simulate latency
          await new Promise(resolve => setTimeout(resolve, 800));
          return { 
            category: 'weather', 
            city, 
            temperature: Math.floor(Math.random() * 10) + 25, 
            humidity: Math.floor(Math.random() * 40) + 50,
            condition: Math.random() > 0.5 ? 'Trời Nắng Ráo ☀️' : 'Nhiều Mây & Mát ☁️'
          };
        },
      }),
      searchFlights: tool({
        description: 'Search for flight options between an origin and destination.',
        inputSchema: z.object({
          from: z.string().describe('Origin city code or name (e.g., HAN, Hanoi)'),
          to: z.string().describe('Destination city code or name (e.g., SGN, PQC)'),
        }),
        execute: async ({ from, to }) => {
          await new Promise(resolve => setTimeout(resolve, 1500));
          return {
            category: 'flight',
            from,
            to,
            flights: [
              { id: 'VJ123', airline: 'VietJet Air', price: '1.200.000đ', time: '08:00 AM' },
              { id: 'VN456', airline: 'Vietnam Airlines', price: '2.500.000đ', time: '10:30 AM' },
              { id: 'BB789', airline: 'Bamboo Airways', price: '1.800.000đ', time: '14:15 PM' },
            ]
          };
        },
      }),
      checkStock: tool({
        description: 'Check current stock price and performance for a given ticker symbol.',
        inputSchema: z.object({
          ticker: z.string().describe('Stock ticker symbol (e.g., AAPL, VNM, FPT)'),
          companyName: z.string().optional().describe('Name of the company if known'),
        }),
        execute: async ({ ticker, companyName }) => {
          await new Promise(resolve => setTimeout(resolve, 600));
          const isUp = Math.random() > 0.4;
          return { 
            category: 'stock', 
            ticker: ticker.toUpperCase(), 
            companyName: companyName || ticker.toUpperCase(),
            price: (Math.random() * 200 + 10).toFixed(2), 
            currency: 'USD',
            change: (isUp ? '+' : '-') + (Math.random() * 5).toFixed(2) + '%',
            trend: isUp ? 'up' : 'down'
          };
        },
      })
    },
  });

  return result.toUIMessageStreamResponse();
}
