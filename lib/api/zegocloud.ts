// ZEGOCLOUD SDK integration
// Note: Requires ZEGO_APP_ID and ZEGO_APP_SIGN in environment variables
// Note: ZEGO SDK only works on native platforms (iOS/Android), not on web

import { Platform } from "react-native";

// Type definitions for ZEGO SDK (to avoid importing on web)
type ZegoExpressEngine = any;
type ZegoScenario = any;

// Web platform check - prevent any import on web
const isWeb = Platform.OS === "web";

export class ZegoCallManager {
  private engine: ZegoExpressEngine | null = null;
  private appID: number;
  private appSign: string;

  constructor(appID: number, appSign: string) {
    this.appID = appID;
    this.appSign = appSign;
  }

  async initialize() {
    if (this.engine) return;

    // ZEGO SDK only works on native platforms
    if (isWeb) {
      console.warn("ZEGO SDK is not supported on web platform");
      return;
    }

    try {
      // Dynamic import for native platforms only - use require for better compatibility
      let zegoModule;
      try {
        zegoModule = require("zego-express-engine-reactnative");
      } catch (e) {
        // Fallback to dynamic import if require fails
        zegoModule = await import("zego-express-engine-reactnative");
      }
      const ZegoExpressEngine = zegoModule.default || zegoModule;
      const ZegoScenario = zegoModule.ZegoScenario;

      // Create engine using createEngine (as shown in ZEGOCLOUD docs)
      // createEngine(appID, appSign, isTestEnv, scenario)
      // isTestEnv: false for production (Status: Testing in console)
      this.engine = await ZegoExpressEngine.createEngine(
        this.appID,
        this.appSign,
        false, // isTestEnv - false for production
        ZegoScenario.StandardVideoCall // Best for video calls
      );
      
      // Обработка событий звонка
      this.engine.on("roomUserUpdate", (roomID: string, updateType: number, userList: any[]) => {
        console.log("Room user update:", roomID, updateType, userList);
      });

      this.engine.on("roomStreamUpdate", (roomID: string, updateType: number, streamList: any[]) => {
        console.log("Room stream update:", roomID, updateType, streamList);
      });
    } catch (error) {
      console.error("Error initializing ZEGO engine:", error);
      // Don't throw on web, just log
      if (Platform.OS !== "web") {
        throw new Error("ZEGO SDK not properly installed. Run: npm install zego-express-engine-reactnative");
      }
    }
  }

  async joinRoom(roomID: string, userID: string, userName: string) {
    if (Platform.OS === "web") {
      throw new Error("ZEGO SDK is not supported on web platform");
    }

    if (!this.engine) {
      await this.initialize();
    }

    if (!this.engine) {
      throw new Error("Failed to initialize ZEGO engine");
    }

    const token = await this.generateToken(roomID, userID);
    // loginRoom(roomID, user, config?)
    return await this.engine.loginRoom(roomID, { userID, userName }, token ? { token } : undefined);
  }

  async leaveRoom(roomID: string) {
    if (Platform.OS === "web" || !this.engine) return;
    await this.engine.logoutRoom(roomID);
  }

  async startPublishingStream(streamID: string, video: boolean = true) {
    if (Platform.OS === "web" || !this.engine) return;

    // startPublishingStream(streamID, channel?, config?)
    // ZegoPublishChannel.Main = 0
    const config = {
      video: video,
      audio: true,
    };

    return await this.engine.startPublishingStream(streamID, 0, config); // 0 = Main channel
  }

  async stopPublishingStream(streamID: string) {
    if (Platform.OS === "web" || !this.engine) return;
    // stopPublishingStream(channel?)
    await this.engine.stopPublishingStream(0); // 0 = Main channel
  }

  async startPlayingStream(streamID: string, view: any) {
    if (Platform.OS === "web" || !this.engine) return;
    // startPlayingStream(streamID, config?)
    return await this.engine.startPlayingStream(streamID, view ? { view } : undefined);
  }

  async stopPlayingStream(streamID: string) {
    if (Platform.OS === "web" || !this.engine) return;
    // stopPlayingStream(streamID)
    await this.engine.stopPlayingStream(streamID);
  }

  async enableCamera(enable: boolean) {
    if (Platform.OS === "web" || !this.engine) return;
    await this.engine.enableCamera(enable);
  }

  async enableMicrophone(enable: boolean) {
    if (Platform.OS === "web" || !this.engine) return;
    await this.engine.enableMic(enable);
  }

  async switchCamera() {
    if (Platform.OS === "web" || !this.engine) return;
    const isFront = await this.engine.isCameraFacingFront();
    await this.engine.useFrontCamera(!isFront);
  }

  private async generateToken(roomID: string, userID: string): Promise<string> {
    // TODO: Реализовать генерацию токена на бэкенде через ServerSecret
    // Для тестирования можно использовать пустую строку (только для dev)
    // В production обязательно нужен токен с сервера
    return "";
  }

  destroy() {
    if (Platform.OS === "web" || !this.engine) {
      this.engine = null;
      return;
    }
    
    try {
      // Dynamic import for destroy
      import("zego-express-engine-reactnative").then(({ default: ZegoExpressEngine }) => {
        ZegoExpressEngine.destroyEngine();
        this.engine = null;
      }).catch((error) => {
        console.error("Error destroying ZEGO engine:", error);
        this.engine = null;
      });
    } catch (error) {
      console.error("Error destroying ZEGO engine:", error);
      this.engine = null;
    }
  }
}

// Singleton instance
let zegoManager: ZegoCallManager | null = null;

export function getZegoManager(): ZegoCallManager {
  // On web, always return a dummy manager
  if (isWeb) {
    if (!zegoManager) {
      zegoManager = new ZegoCallManager(0, "");
    }
    return zegoManager;
  }
  
  if (!zegoManager) {
    const appID = parseInt(process.env.EXPO_PUBLIC_ZEGO_APP_ID || "0");
    const appSign = process.env.EXPO_PUBLIC_ZEGO_APP_SIGN || "";
    
    if (!appID || !appSign) {
      console.warn("ZEGO_APP_ID and ZEGO_APP_SIGN not set. Video calls will not work.");
      zegoManager = new ZegoCallManager(0, "");
      return zegoManager;
    }
    
    zegoManager = new ZegoCallManager(appID, appSign);
  }
  return zegoManager;
}
