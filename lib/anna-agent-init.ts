// Anna AI Agent Initialization
// Registers and manages Anna AI Agent with ZEGOCLOUD

import { getAgentDetails, listAgents, registerAnnaAgent } from "@/lib/api/zegocloud-ai-agent";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ANNA_AGENT_STORAGE_KEY = "anna_agent_id";
const ANNA_AGENT_NAME = "Anna";

let annaAgentId: string | null = null;
let initializationPromise: Promise<string> | null = null;

/**
 * Initialize Anna AI Agent
 * Registers agent once and caches agent ID
 */
export async function initializeAnnaAgent(annaImageUrl?: string): Promise<string> {
  // Return cached agent ID if available
  if (annaAgentId) {
    return annaAgentId;
  }

  // Return existing initialization promise if in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async (): Promise<string> => {
    try {
      // Try to load from storage first
      const storedAgentId = await AsyncStorage.getItem(ANNA_AGENT_STORAGE_KEY);
      if (storedAgentId) {
        // Verify agent still exists
        try {
          await getAgentDetails(storedAgentId);
          annaAgentId = storedAgentId;
          return annaAgentId;
        } catch (error) {
          // Agent doesn't exist, need to register new one
          console.log("Stored agent ID invalid, registering new agent");
        }
      }

      // Check if agent already exists by name
      const agents = await listAgents();
      const existingAgent = agents.find((agent: any) => agent.agent_name === ANNA_AGENT_NAME);
      
      if (existingAgent?.agent_id) {
        const agentId = existingAgent.agent_id;
        annaAgentId = agentId;
        await AsyncStorage.setItem(ANNA_AGENT_STORAGE_KEY, agentId);
        return agentId;
      }

      // Register new agent
      const newAgentId = await registerAnnaAgent({
        annaImageUrl: annaImageUrl,
      });

      // Cache agent ID
      annaAgentId = newAgentId;
      await AsyncStorage.setItem(ANNA_AGENT_STORAGE_KEY, annaAgentId);
      
      console.log("✅ Anna AI Agent registered:", annaAgentId);
      return annaAgentId;
    } catch (error) {
      console.error("❌ Error initializing Anna Agent:", error);
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Get Anna Agent ID
 * Returns cached agent ID or null if not initialized
 */
export function getAnnaAgentId(): string | null {
  return annaAgentId;
}

/**
 * Clear cached agent ID
 * Useful for re-registration
 */
export async function clearAnnaAgentCache(): Promise<void> {
  annaAgentId = null;
  initializationPromise = null;
  await AsyncStorage.removeItem(ANNA_AGENT_STORAGE_KEY);
}

