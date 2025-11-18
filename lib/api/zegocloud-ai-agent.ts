// ZEGOCLOUD AI Agent Server API integration
// Documentation: https://www.zegocloud.com/docs/aiagent-server/introduction/overview
// Real-time Interactive AI Agent with Gemini LLM and Digital Human

import { getSystemPrompt } from "@/lib/annaSystemPrompt";
import Constants from "expo-constants";

const ZEGO_APP_ID = parseInt(process.env.EXPO_PUBLIC_ZEGO_APP_ID || "0");
// Note: ZEGO_SERVER_SECRET should be used on backend only for security
// For now, token generation is handled on backend (TODO)
const GEMINI_API_KEY = Constants.expoConfig?.extra?.googleAiApiKey || process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || "";

// Base URL for ZEGOCLOUD AI Agent API
const API_BASE_URL = "https://aigc.zego.im/v1";

/**
 * Generate ZEGO token for API authentication
 * Note: In production, this should be done on your backend server
 * 
 * Backend endpoint required: POST /api/zego/token
 * Request: { roomId?: string, userId?: string }
 * Response: { token: string }
 */
async function generateZegoToken(roomId?: string, userId?: string): Promise<string> {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  if (BACKEND_URL) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/zego/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.token || "";
      }
    } catch (error) {
      console.warn("Failed to get token from backend, using empty token:", error);
    }
  }

  // Fallback: empty token (works in test mode)
  // For production, you MUST set up backend token generation
  return "";
}

export interface AgentConfig {
  agentName: string;
  systemPrompt: string;
  geminiApiKey: string;
  annaImageUrl?: string; // URL to Anna.jpg for Digital Human
  voiceId?: string;
  language?: string;
}

export interface AgentInstance {
  instanceId: string;
  roomId: string;
  userId: string;
  status: string;
  agentStatus?: "idle" | "listening" | "thinking" | "speaking";
}

/**
 * Register AI Agent with Gemini LLM
 * Creates Anna agent with personalized persona and Digital Human avatar
 */
export async function registerAnnaAgent(config?: Partial<AgentConfig>): Promise<string> {
  try {
    const token = await generateZegoToken();
    const systemPrompt = getSystemPrompt("normal");
    
    const agentConfig: AgentConfig = {
      agentName: "Anna",
      systemPrompt: systemPrompt,
      geminiApiKey: GEMINI_API_KEY,
      voiceId: "anna_voice_female_01", // Default voice, can be customized
      language: "ru-RU",
      ...config,
    };

    const response = await fetch(`${API_BASE_URL}/agent/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        agent_name: agentConfig.agentName,
        agent_type: config?.annaImageUrl ? "digital_human_video_call" : "voice_call",
        
        // LLM Configuration (Google Gemini)
        llm_config: {
          provider: "google",
          model: "gemini-pro",
          api_key: agentConfig.geminiApiKey,
          base_url: "https://generativelanguage.googleapis.com/v1beta",
          system_prompt: agentConfig.systemPrompt,
          temperature: 0.9,
          max_tokens: 2048,
        },
        
        // TTS Configuration
        tts_config: {
          provider: "volcano", // Volcano Engine TTS
          voice_id: agentConfig.voiceId,
          speed: 1.0,
          pitch: 1.0,
        },
        
        // ASR Configuration (Speech Recognition)
        asr_config: {
          provider: "tencent", // Tencent ASR
          language: agentConfig.language || "ru-RU",
        },
        
        // Digital Human Configuration (if image provided)
        ...(agentConfig.annaImageUrl && {
          digital_human_config: {
            asset_type: "image_based",
            image_url: agentConfig.annaImageUrl,
            resolution: "1080p",
          },
        }),
        
        // AI Audio Processing
        audio_processing: {
          ai_ans: true, // AI Noise Suppression
          ai_vad: true, // AI Voice Activity Detection
          ai_aec: true, // AI Echo Cancellation
        },
        
        // Interruption Settings
        interruption_config: {
          natural_voice_interruption: true, // 500ms natural interruption
          manual_interruption: true,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to register agent: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data.agent_id;
  } catch (error) {
    console.error("Error registering Anna agent:", error);
    throw error;
  }
}

/**
 * Create Digital Human Agent Instance
 * For video calls with Digital Human avatar
 */
export async function createDigitalHumanAgentInstance(
  agentId: string,
  roomId: string,
  userId: string
): Promise<AgentInstance> {
  try {
    const token = await generateZegoToken();
    
    const response = await fetch(`${API_BASE_URL}/agent/instance/create_digital_human`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        agent_id: agentId,
        room_id: roomId,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to create digital human instance: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      instanceId: data.instance_id,
      roomId: data.room_id,
      userId: data.user_id,
      status: data.status,
      agentStatus: data.agent_status,
    };
  } catch (error) {
    console.error("Error creating digital human agent instance:", error);
    throw error;
  }
}

/**
 * Create Voice Agent Instance
 * For voice-only calls
 */
export async function createVoiceAgentInstance(
  agentId: string,
  roomId: string,
  userId: string
): Promise<AgentInstance> {
  try {
    const token = await generateZegoToken();
    
    const response = await fetch(`${API_BASE_URL}/agent/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        agent_id: agentId,
        room_id: roomId,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to create voice instance: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      instanceId: data.instance_id,
      roomId: data.room_id,
      userId: data.user_id,
      status: data.status,
      agentStatus: data.agent_status,
    };
  } catch (error) {
    console.error("Error creating voice agent instance:", error);
    throw error;
  }
}

/**
 * Get Agent Instance Status
 * Returns current status: idle, listening, thinking, speaking
 */
export async function getAgentInstanceStatus(instanceId: string): Promise<AgentInstance> {
  try {
    const token = await generateZegoToken();
    
    // According to docs: POST /agent/instance/status
    const response = await fetch(`${API_BASE_URL}/agent/instance/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        instance_id: instanceId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      instanceId: data.instance_id,
      roomId: data.room_id,
      userId: data.user_id,
      status: data.status,
      agentStatus: data.agent_status,
    };
  } catch (error) {
    console.error("Error getting agent instance status:", error);
    throw error;
  }
}

/**
 * Interrupt Agent Speech
 * Stops current agent speech (natural or manual interruption)
 */
export async function interruptAnnaAgent(instanceId: string): Promise<void> {
  try {
    const token = await generateZegoToken();
    
    const response = await fetch(`${API_BASE_URL}/agent/instance/interrupt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        instance_id: instanceId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to interrupt: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Error interrupting agent:", error);
    throw error;
  }
}

/**
 * Delete Agent Instance
 * Cleanup after call ends
 */
export async function deleteAnnaAgentInstance(instanceId: string): Promise<void> {
  try {
    const token = await generateZegoToken();
    
    const response = await fetch(`${API_BASE_URL}/agent/instance/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        instance_id: instanceId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to delete instance: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting agent instance:", error);
    throw error;
  }
}

/**
 * Update Agent Configuration
 * Update agent settings (persona, voice, etc.)
 */
export async function updateAnnaAgent(
  agentId: string,
  updates: Partial<AgentConfig>
): Promise<void> {
  try {
    const token = await generateZegoToken();
    
    const updateData: any = {
      app_id: ZEGO_APP_ID,
      agent_id: agentId,
    };

    if (updates.systemPrompt) {
      updateData.llm_config = {
        system_prompt: updates.systemPrompt,
      };
    }

    if (updates.voiceId) {
      updateData.tts_config = {
        voice_id: updates.voiceId,
      };
    }

    const response = await fetch(`${API_BASE_URL}/agent/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to update agent: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Error updating agent:", error);
    throw error;
  }
}

/**
 * List All Registered Agents
 */
export async function listAgents(): Promise<any[]> {
  try {
    const token = await generateZegoToken();
    
    const response = await fetch(`${API_BASE_URL}/agent/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to list agents: ${response.statusText}`);
    }

    const data = await response.json();
    return data.agents || [];
  } catch (error) {
    console.error("Error listing agents:", error);
    throw error;
  }
}

/**
 * Query Agent Details
 */
export async function getAgentDetails(agentId: string): Promise<any> {
  try {
    const token = await generateZegoToken();
    
    // According to docs: POST /agent/query
    const response = await fetch(`${API_BASE_URL}/agent/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        agent_id: agentId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get agent details: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting agent details:", error);
    throw error;
  }
}

