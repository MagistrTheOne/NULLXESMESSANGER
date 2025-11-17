# ZEGOCLOUD Integration Guide

## 🚀 Быстрый старт

### 1. Получите учетные данные ZEGOCLOUD

1. Зарегистрируйтесь на [ZEGOCLOUD Console](https://console.zegocloud.com/)
2. Создайте новый проект
3. Скопируйте `App ID` и `App Sign`

### 2. Настройте переменные окружения

Добавьте в `.env`:
```env
EXPO_PUBLIC_ZEGO_APP_ID=your_app_id_here
EXPO_PUBLIC_ZEGO_APP_SIGN=your_app_sign_here
```

### 3. Установка завершена

SDK уже установлен: `zego-express-engine-reactnative`

## 📱 Использование

### Инициализация в приложении

```typescript
import { getZegoManager } from "@/lib/api/zegocloud";

const zegoManager = getZegoManager();
await zegoManager.initialize();
```

### Начало звонка

```typescript
// В компоненте чата
const handleCall = async (type: "voice" | "video") => {
  const roomId = `room_${chatId}_${Date.now()}`;
  router.push({
    pathname: "/(main)/call/video",
    params: {
      roomId,
      userId: user.id,
      userName: user.name,
      isVideo: type === "video" ? "true" : "false",
    },
  });
};
```

## 🔧 API Reference

### ZegoCallManager

- `initialize()` - Инициализация SDK
- `joinRoom(roomID, userID, userName)` - Присоединение к комнате
- `leaveRoom(roomID)` - Выход из комнаты
- `startPublishingStream(streamID, video)` - Начало публикации потока
- `stopPublishingStream(streamID)` - Остановка публикации
- `startPlayingStream(streamID, view)` - Воспроизведение потока
- `stopPlayingStream(streamID)` - Остановка воспроизведения
- `enableCamera(enable)` - Включение/выключение камеры
- `enableMicrophone(enable)` - Включение/выключение микрофона
- `switchCamera()` - Переключение камеры

## 📚 Документация

- [ZEGOCLOUD React Native SDK](https://docs.zegocloud.com/article/14882)
- [ZEGOCLOUD Console](https://console.zegocloud.com/)

## ⚠️ Важно

1. **Токены**: Для production необходимо реализовать генерацию токенов на бэкенде
2. **Разрешения**: Убедитесь, что запрашиваете разрешения на камеру и микрофон
3. **Тестирование**: Используйте тестовые учетные данные для разработки

