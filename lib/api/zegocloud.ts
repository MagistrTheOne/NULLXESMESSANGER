// ZEGOCLOUD SDK integration
// Note: Requires ZEGO_APP_ID and ZEGO_APP_SIGN in environment variables

import ZegoExpressEngine from "zego-express-engine-reactnative";
import { ZegoScenario } from "zego-express-engine-reactnative";

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

    try {
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
      throw new Error("ZEGO SDK not properly installed. Run: npm install zego-express-engine-reactnative");
    }
  }

  async joinRoom(roomID: string, userID: string, userName: string) {
    if (!this.engine) {
      await this.initialize();
    }

    const token = await this.generateToken(roomID, userID);
    // loginRoom(roomID, user, config?)
    return await this.engine!.loginRoom(roomID, { userID, userName }, token ? { token } : undefined);
  }

  async leaveRoom(roomID: string) {
    if (!this.engine) return;
    await this.engine.logoutRoom(roomID);
  }

  async startPublishingStream(streamID: string, video: boolean = true) {
    if (!this.engine) return;

    // startPublishingStream(streamID, channel?, config?)
    // ZegoPublishChannel.Main = 0
    const config = {
      video: video,
      audio: true,
    };

    return await this.engine.startPublishingStream(streamID, 0, config); // 0 = Main channel
  }

  async stopPublishingStream(streamID: string) {
    if (!this.engine) return;
    // stopPublishingStream(channel?)
    await this.engine.stopPublishingStream(0); // 0 = Main channel
  }

  async startPlayingStream(streamID: string, view: any) {
    if (!this.engine) return;
    // startPlayingStream(streamID, config?)
    return await this.engine.startPlayingStream(streamID, view ? { view } : undefined);
  }

  async stopPlayingStream(streamID: string) {
    if (!this.engine) return;
    // stopPlayingStream(streamID)
    await this.engine.stopPlayingStream(streamID);
  }

  async enableCamera(enable: boolean) {
    if (!this.engine) return;
    await this.engine.enableCamera(enable);
  }

  async enableMicrophone(enable: boolean) {
    if (!this.engine) return;
    await this.engine.enableMic(enable);
  }

  async switchCamera() {
    if (!this.engine) return;
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
    if (this.engine) {
      ZegoExpressEngine.destroyEngine();
      this.engine = null;
    }
  }
}

// Singleton instance
let zegoManager: ZegoCallManager | null = null;

export function getZegoManager(): ZegoCallManager {
  if (!zegoManager) {
    const appID = parseInt(process.env.EXPO_PUBLIC_ZEGO_APP_ID || "0");
    const appSign = process.env.EXPO_PUBLIC_ZEGO_APP_SIGN || "";
    
    if (!appID || !appSign) {
      throw new Error("ZEGO_APP_ID and ZEGO_APP_SIGN must be set in environment variables");
    }
    
    zegoManager = new ZegoCallManager(appID, appSign);
  }
  return zegoManager;
}
