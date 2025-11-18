// ZEGOCLOUD Digital Human AI API integration
// Documentation: https://docs.zegocloud.com/article/16678
// Server-side API for creating and managing Digital Human avatars


const ZEGO_APP_ID = parseInt(process.env.EXPO_PUBLIC_ZEGO_APP_ID || "0");
const ZEGO_SERVER_SECRET = process.env.EXPO_PUBLIC_ZEGO_SERVER_SECRET || "";

// Base URL for ZEGOCLOUD Digital Human API
const API_BASE_URL = "https://aigc.zego.im/v1";

interface DigitalHumanAsset {
  assetId: string;
  assetName: string;
  assetType: "real_person" | "image_based";
  thumbnailUrl?: string;
}

interface CreateVideoStreamTaskRequest {
  roomId: string;
  streamId: string;
  assetId: string;
  backgroundImageUrl?: string;
  backgroundColor?: string;
  maxDuration?: number; // seconds, max 24 hours
  videoConfig?: {
    resolution?: "1080p" | "720p" | "540p";
    bitrate?: number;
    fps?: number;
  };
}

interface DriveDigitalHumanRequest {
  taskId: string;
  driveType: "text" | "audio" | "action";
  content: string; // text content, audio URL, or action name
  interrupt?: boolean; // interrupt current driving task
}

interface DigitalHumanTask {
  taskId: string;
  roomId: string;
  streamId: string;
  status: number; // 1: initializing, 2: failed, 3: streaming, 4: stopping, 5: stopped
  drivingStatus: number; // 1: queuing, 2: driving, 3: failed, 4: ended, 5: interrupted
}

/**
 * Generate ZEGO token for API authentication
 * Note: In production, this should be done on your backend server
 */
async function generateZegoToken(): Promise<string> {
  // TODO: Implement token generation on backend
  // For now, return empty string (will work only in test mode)
  // In production, you need to generate token using ServerSecret on your backend
  return "";
}

/**
 * Query available Digital Human assets
 */
export async function queryDigitalHumanAssets(): Promise<DigitalHumanAsset[]> {
  try {
    const token = await generateZegoToken();
    const response = await fetch(`${API_BASE_URL}/digital-human/assets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to query assets: ${response.statusText}`);
    }

    const data = await response.json();
    return data.assets || [];
  } catch (error) {
    console.error("Error querying Digital Human assets:", error);
    throw error;
  }
}

/**
 * Create a Digital Human video stream task
 * This creates a real-time video stream of the Digital Human avatar
 */
export async function createDigitalHumanVideoStream(
  request: CreateVideoStreamTaskRequest
): Promise<DigitalHumanTask> {
  try {
    const token = await generateZegoToken();
    const response = await fetch(`${API_BASE_URL}/digital-human/video-stream/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        room_id: request.roomId,
        stream_id: request.streamId,
        asset_id: request.assetId,
        background_image_url: request.backgroundImageUrl,
        background_color: request.backgroundColor,
        max_duration: request.maxDuration || 3600, // default 1 hour
        video_config: request.videoConfig || {
          resolution: "720p",
          bitrate: 1500,
          fps: 30,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create video stream: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      taskId: data.task_id,
      roomId: data.room_id,
      streamId: data.stream_id,
      status: data.status,
      drivingStatus: data.driving_status || 0,
    };
  } catch (error) {
    console.error("Error creating Digital Human video stream:", error);
    throw error;
  }
}

/**
 * Drive Digital Human by text
 * Makes the Digital Human speak the provided text
 */
export async function driveDigitalHumanByText(
  request: DriveDigitalHumanRequest
): Promise<void> {
  try {
    const token = await generateZegoToken();
    const response = await fetch(`${API_BASE_URL}/digital-human/video-stream/drive/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        task_id: request.taskId,
        text: request.content,
        interrupt: request.interrupt || false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to drive Digital Human: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Error driving Digital Human by text:", error);
    throw error;
  }
}

/**
 * Drive Digital Human by action
 * Makes the Digital Human perform a specific action
 */
export async function driveDigitalHumanByAction(
  taskId: string,
  actionName: string,
  interrupt: boolean = false
): Promise<void> {
  try {
    const token = await generateZegoToken();
    const response = await fetch(`${API_BASE_URL}/digital-human/video-stream/drive/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        task_id: taskId,
        action_name: actionName,
        interrupt: interrupt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to drive Digital Human action: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Error driving Digital Human by action:", error);
    throw error;
  }
}

/**
 * Get Digital Human video stream task status
 */
export async function getDigitalHumanTaskStatus(taskId: string): Promise<DigitalHumanTask> {
  try {
    const token = await generateZegoToken();
    const response = await fetch(`${API_BASE_URL}/digital-human/video-stream/status?task_id=${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get task status: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      taskId: data.task_id,
      roomId: data.room_id,
      streamId: data.stream_id,
      status: data.status,
      drivingStatus: data.driving_status || 0,
    };
  } catch (error) {
    console.error("Error getting Digital Human task status:", error);
    throw error;
  }
}

/**
 * Stop Digital Human video stream task
 */
export async function stopDigitalHumanVideoStream(taskId: string): Promise<void> {
  try {
    const token = await generateZegoToken();
    const response = await fetch(`${API_BASE_URL}/digital-human/video-stream/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        task_id: taskId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to stop video stream: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Error stopping Digital Human video stream:", error);
    throw error;
  }
}

/**
 * Interrupt current Digital Human driving task
 */
export async function interruptDigitalHumanTask(taskId: string): Promise<void> {
  try {
    const token = await generateZegoToken();
    const response = await fetch(`${API_BASE_URL}/digital-human/video-stream/drive/interrupt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        app_id: ZEGO_APP_ID,
        task_id: taskId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to interrupt task: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Error interrupting Digital Human task:", error);
    throw error;
  }
}

