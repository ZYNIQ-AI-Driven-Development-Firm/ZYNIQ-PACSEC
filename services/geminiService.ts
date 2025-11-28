import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { SecretConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "configure_generator",
        description: "Configure a secure key generator. Use 'recipe' type for multiple keys (e.g., API key + Secret, OAuth set).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              enum: ["password", "jwt", "uuid", "apiKey", "recipe"],
              description: "The type of secret(s) to generate. Use 'recipe' for multiple keys."
            },
            // Single Item Params
            length: { type: Type.INTEGER, description: "Length for passwords/keys." },
            bits: { type: Type.INTEGER, description: "Bit strength (128, 256, 512)." },
            format: { type: Type.STRING, enum: ["hex", "base64"] },
            useSymbols: { type: Type.BOOLEAN },
            useNumbers: { type: Type.BOOLEAN },
            useUppercase: { type: Type.BOOLEAN },
            // Recipe Params
            recipeItems: {
              type: Type.ARRAY,
              description: "List of items for 'recipe' type. E.g. [{label: 'Client ID', config: {type: 'uuid'}}, ...]",
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "Name of the key (e.g., 'API Secret')" },
                  config: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ["password", "jwt", "uuid", "apiKey"] },
                        length: { type: Type.INTEGER },
                        bits: { type: Type.INTEGER },
                        format: { type: Type.STRING, enum: ["hex", "base64"] },
                        useSymbols: { type: Type.BOOLEAN },
                        useNumbers: { type: Type.BOOLEAN },
                        useUppercase: { type: Type.BOOLEAN }
                    },
                    required: ["type"]
                  }
                },
                required: ["label", "config"]
              }
            }
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
            const status = error.status;
            const isRetryable = status === 429 || (status && status >= 500) || !status;
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
    const modelId = "gemini-2.5-flash";

    const response = await generateWithRetry(modelId, prompt, {
        tools: tools,
        systemInstruction: `You are a cybersecurity expert assistant for 'Pac-Sec'.
        
        Rules:
        1. Single Key: If user asks for one thing (e.g. "password"), use type='password', 'jwt', 'apiKey', or 'uuid'.
        2. Multi-Key (Recipe): If user asks for a set/stack (e.g. "API credentials", "OAuth setup", "Webhook signing", "App loot crate"), use type='recipe'.
           - Populate 'recipeItems' with logical labels and configs.
           - Example for OAuth: Item 1: 'Client ID' (uuid), Item 2: 'Client Secret' (apiKey/hex/256).
        3. Defaults: Password length 16+, Key bits 256.
        4. Persona: Professional, retro-arcade style. Brief text.
        `
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.functionCall) {
            const args = part.functionCall.args as any;
            return {
                text: "Configuring secure module...",
                toolCall: args as SecretConfig
            }
        }
      }
      
      return {
          text: parts[0].text || "I can help generate keys. Try 'Generate OAuth Stack'.",
          toolCall: undefined
      };
    }

    return { text: "Input unclear. Specify key type.", toolCall: undefined };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    let errorMessage = "CONNECTION FAILURE. SECURE CHANNEL UNSTABLE.";
    
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