import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { SecretConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "configure_generator",
        description: "Configure a secure key generator based on user request. Use this for passwords, jwt secrets, api keys, or uuids.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              enum: ["password", "jwt", "uuid", "apiKey"],
              description: "The type of secret to generate."
            },
            length: {
              type: Type.INTEGER,
              description: "Length for passwords or api keys. Default 16 for passwords.",
            },
            bits: {
              type: Type.INTEGER,
              description: "Bit strength for JWT or keys (128, 256, 512). Default 256.",
            },
            format: {
              type: Type.STRING,
              enum: ["hex", "base64"],
              description: "Format for keys.",
            },
            useSymbols: { type: Type.BOOLEAN, description: "Include symbols in password" },
            useNumbers: { type: Type.BOOLEAN, description: "Include numbers in password" },
            useUppercase: { type: Type.BOOLEAN, description: "Include uppercase in password" }
          },
          required: ["type"]
        }
      }
    ]
  }
];

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

async function generateWithRetry(model: string, contents: string, config: any, retries = 0): Promise<any> {
    try {
        return await ai.models.generateContent({
            model,
            contents,
            config
        });
    } catch (error: any) {
        if (retries < MAX_RETRIES) {
             // Retry on 429 (Too Many Requests) or 5xx (Server Errors) or Network Errors (no status)
            const status = error.status;
            const isRetryable = status === 429 || (status && status >= 500) || !status;
            
            // Do not retry 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden)
            const isAuthOrClientError = status === 400 || status === 401 || status === 403;

            if (isRetryable && !isAuthOrClientError) {
                const delay = BASE_DELAY * Math.pow(2, retries);
                console.warn(`Request failed (Attempt ${retries + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return generateWithRetry(model, contents, config, retries + 1);
            }
        }
        throw error;
    }
}

export const processUserRequest = async (prompt: string): Promise<{ text: string, toolCall?: SecretConfig, isError?: boolean }> => {
  try {
    const modelId = "gemini-2.5-flash"; // Fast and capable for this task

    const response = await generateWithRetry(modelId, prompt, {
        tools: tools,
        systemInstruction: `You are a cybersecurity expert assistant for a high-end security tool called Pac-Sec.
        Your goal is to interpret the user's request and configure the correct security generator tool.
        
        Rules:
        1. If the user asks for a password, call configure_generator with type='password' and safe defaults (length 16+).
        2. If the user asks for a JWT secret, signing key, or API key, call configure_generator with type='jwt' or 'apiKey'.
        3. If the user asks for a UUID, call configure_generator with type='uuid'.
        4. If the user greets or asks general questions, reply briefly and professionally in the character of a helpful, secure AI interface.
        5. NEVER generate the actual secret yourself. Always delegate to the tool.
        `
    });

    // Check for tool calls
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.functionCall) {
            const args = part.functionCall.args as any;
            return {
                text: "Initializing secure generator module...",
                toolCall: args as SecretConfig
            }
        }
      }
      
      // If no tool call, return text
      return {
          text: parts[0].text || "I can help you generate secure keys. Try asking for a 'strong password' or 'JWT secret'.",
          toolCall: undefined
      };
    }

    return { text: "System unclear. Please specify the key type.", toolCall: undefined };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    let errorMessage = "CONNECTION FAILURE. SECURE CHANNEL UNSTABLE.";
    
    // Provide robust, user-friendly error messages based on error type
    if (error.status === 401 || error.message?.includes("API key")) {
        errorMessage = "AUTHENTICATION ERROR: INVALID API KEY CREDENTIALS.";
    } else if (error.status === 429) {
        errorMessage = "SYSTEM OVERLOAD: REQUEST LIMIT EXCEEDED. PLEASE STAND BY.";
    } else if (error.status >= 500) {
        errorMessage = "SERVER ERROR: MAINFRAME TEMPORARILY UNREACHABLE.";
    } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
         errorMessage = "NETWORK ERROR: UNABLE TO ESTABLISH UPLINK.";
    }

    return { 
        text: errorMessage, 
        toolCall: undefined,
        isError: true
    };
  }
};