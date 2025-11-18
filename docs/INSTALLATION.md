# Установка ZEGOCLOUD UI Kits

## 📦 Установка зависимостей

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

## ✅ Что уже добавлено в package.json

Все зависимости уже добавлены в `package.json`. Просто выполните:

```bash
npm install
```

## 🔧 Настройка

### 1. Переменные окружения

Убедитесь, что в `.env` есть:

```env
EXPO_PUBLIC_ZEGO_APP_ID=505060583
EXPO_PUBLIC_ZEGO_APP_SIGN=41be4d2d3d828c9a58064fead6419956aec03eea514f648f97a32edda4188e36
EXPO_PUBLIC_BACKEND_URL=https://your-backend.com  # Опционально, для токенов
```

### 2. Перезапуск Metro

После установки зависимостей:

```bash
npm start -- --reset-cache
```

## 📱 Платформы

Все UI Kits работают на:
- ✅ iOS
- ✅ Android
- ❌ Web (не поддерживается)

## 🚀 Готово!

После установки все компоненты готовы к использованию:

- `CallKit` - для звонков
- `LiveStreamingKit` - для стриминга
- `LiveAudioRoomKit` - для аудио комнат
- `VideoConferenceKit` - для конференций
- `ZIMConversationList` / `ZIMMessageList` - для чата

См. `docs/ZEGO_UI_KITS_INTEGRATION.md` для деталей использования.

