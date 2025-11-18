# Интеграция ZEGOCLOUD UI Kits

## 🎯 Обзор

ZEGOCLOUD предоставляет готовые UI Kits для быстрой интеграции всех фич:
- **Call Kit** - готовый UI для звонков
- **Live Streaming Kit** - готовый UI для стриминга
- **Live Audio Room Kit** - готовый UI для аудио комнат
- **Video Conference Kit** - готовый UI для конференций
- **In-App Chat Kit (ZIM)** - готовый UI для чата

## 📦 Установка

```bash
npm install @zegocloud/zego-uikit-prebuilt-call-rn
npm install @zegocloud/zego-uikit-prebuilt-live-streaming-rn
npm install @zegocloud/zego-uikit-prebuilt-live-audio-room-rn
npm install @zegocloud/zego-uikit-prebuilt-video-conference-rn
npm install zego-zim-react-native
```

Или одной командой:

```bash
npm install @zegocloud/zego-uikit-prebuilt-call-rn @zegocloud/zego-uikit-prebuilt-live-streaming-rn @zegocloud/zego-uikit-prebuilt-live-audio-room-rn @zegocloud/zego-uikit-prebuilt-video-conference-rn zego-zim-react-native
```

## ✅ Что реализовано

### 1. Call Kit
**Файл:** `components/ZegoKits/CallKit.tsx`
**Использование:** `app/(main)/call/video.tsx`

```typescript
import { CallKit } from "@/components/ZegoKits/CallKit";

<CallKit
  callID="room_123"
  userID="user_123"
  userName="John"
  avatarURL="https://..."
  isVideoCall={true}
  onCallEnd={() => router.back()}
/>
```

**Фичи:**
- ✅ 1-on-1 и group calls
- ✅ Voice и video режимы
- ✅ Real-time sound waves
- ✅ Device management
- ✅ Customizable UI
- ✅ Call invitation support

### 2. Live Streaming Kit
**Файл:** `components/ZegoKits/LiveStreamingKit.tsx`

```typescript
import { LiveStreamingKit } from "@/components/ZegoKits/LiveStreamingKit";

<LiveStreamingKit
  liveID="live_123"
  userID="user_123"
  userName="Host"
  isHost={true}
  onLeave={() => router.back()}
/>
```

**Фичи:**
- ✅ Host/Audience режимы
- ✅ Interactive text chat
- ✅ Gift system
- ✅ Co-hosting
- ✅ Real-time audience count

### 3. Live Audio Room Kit
**Файл:** `components/ZegoKits/LiveAudioRoomKit.tsx`

```typescript
import { LiveAudioRoomKit } from "@/components/ZegoKits/LiveAudioRoomKit";

<LiveAudioRoomKit
  roomID="room_123"
  userID="user_123"
  userName="Speaker"
  isHost={false}
  onLeave={() => router.back()}
/>
```

**Фичи:**
- ✅ Speaker seats management
- ✅ Invite/apply to take seats
- ✅ Customizable seat layout
- ✅ Real-time text chat

### 4. Video Conference Kit
**Файл:** `components/ZegoKits/VideoConferenceKit.tsx`

```typescript
import { VideoConferenceKit } from "@/components/ZegoKits/VideoConferenceKit";

<VideoConferenceKit
  conferenceID="conf_123"
  userID="user_123"
  userName="Participant"
  onLeave={() => router.back()}
/>
```

**Фичи:**
- ✅ Multi-user conferences
- ✅ Adaptive video layouts
- ✅ Member list
- ✅ Live text chat
- ✅ Join/leave notifications

### 5. In-App Chat Kit (ZIM)
**Файл:** `components/ZegoKits/InAppChatKit.tsx`

```typescript
import { ZIMConversationList, ZIMMessageList } from "@/components/ZegoKits/InAppChatKit";

// Conversation list
<ZIMConversationList
  userID="user_123"
  userName="John"
  avatarURL="https://..."
/>

// Message list for specific conversation
<ZIMMessageList
  userID="user_123"
  userName="John"
  conversationID="chat_123"
  conversationType="Peer" // or "Group", "Room"
/>
```

**Фичи:**
- ✅ Conversation list
- ✅ Message list
- ✅ One-on-one и group chat
- ✅ Customizable UI

## 🔧 Конфигурация

Все Kits используют централизованную конфигурацию из `lib/zegocloud-config.ts`:

```typescript
import { getZegoCredentials } from "@/lib/zegocloud-config";

const { appID, appSign } = getZegoCredentials();
```

## 📱 Использование в приложении

### Call Kit (уже интегрирован)
Звонки автоматически используют Call Kit через `app/(main)/call/video.tsx`

### Live Streaming
Создайте экран для стриминга:
```typescript
// app/(main)/streaming/[id].tsx
import { LiveStreamingKit } from "@/components/ZegoKits/LiveStreamingKit";

export default function StreamingScreen() {
  const { id } = useLocalSearchParams();
  const user = useAuthStore((state) => state.user);
  
  return (
    <LiveStreamingKit
      liveID={id}
      userID={user.id}
      userName={user.name}
      isHost={true}
    />
  );
}
```

### Live Audio Room
Создайте экран для аудио комнат:
```typescript
// app/(main)/audio-room/[id].tsx
import { LiveAudioRoomKit } from "@/components/ZegoKits/LiveAudioRoomKit";
```

### Video Conference
Создайте экран для конференций:
```typescript
// app/(main)/conference/[id].tsx
import { VideoConferenceKit } from "@/components/ZegoKits/VideoConferenceKit";
```

### In-App Chat (ZIM)
Можно заменить текущую реализацию чата:
```typescript
// app/(main)/chats/index.tsx - использовать ZIMConversationList
// app/(main)/chat/[id].tsx - использовать ZIMMessageList
```

## 🎨 Кастомизация UI

Все Kits поддерживают кастомизацию через `config` prop:

```typescript
<CallKit
  config={{
    layout: {
      mode: "gallery-mode", // для group calls
    },
    turnOnCameraWhenJoining: false,
    // ... другие опции
  }}
/>
```

## 📚 Документация

- [Call Kit](https://www.zegocloud.com/docs/uikit/callkit-rn/overview)
- [Live Streaming Kit](https://www.zegocloud.com/docs/uikit/live-streaming-kit-rn/overview)
- [Live Audio Room Kit](https://www.zegocloud.com/docs/uikit/live-audio-room-kit-rn/overview)
- [Video Conference Kit](https://www.zegocloud.com/docs/uikit/video-conference-kit-rn/overview)
- [In-App Chat Kit](https://www.zegocloud.com/docs/uikit/in-app-chat-kit-rn/overview)

## ⚠️ Важно

1. Все Kits работают только на нативных платформах (iOS/Android)
2. Требуют те же credentials из `.env`
3. Для production нужен backend для токенов
4. Можно использовать готовый UI или кастомизировать

## 🚀 Следующие шаги

1. ✅ Call Kit - интегрирован
2. ⏳ Live Streaming - создать экран
3. ⏳ Live Audio Room - создать экран
4. ⏳ Video Conference - создать экран
5. ⏳ In-App Chat (ZIM) - заменить текущий чат (опционально)

