# Интеграция ZEGOCLOUD Digital Human AI для Anna

## Обзор

Digital Human AI от ZEGOCLOUD позволяет создать живой видео-аватар Anna, который может говорить, двигаться и взаимодействовать с пользователем в реальном времени.

## Возможности

- **Реальное время**: Задержка < 200ms для интерактивных разговоров
- **Текстовое управление**: Anna может говорить любой текст
- **Действия**: Anna может выполнять различные действия (жесты, движения)
- **Интеграция с Express Video**: Использует существующую инфраструктуру ZEGO

## Архитектура

```
User Input (Text)
    ↓
Google Gemini API (Text Response)
    ↓
Digital Human API (Text → Speech + Video)
    ↓
ZEGO Express Video (Real-time Stream)
    ↓
AnnaDigitalHuman Component (Display)
```

## Настройка

### 1. Переменные окружения

Добавьте в `.env`:

```env
EXPO_PUBLIC_ZEGO_APP_ID=your_app_id
EXPO_PUBLIC_ZEGO_APP_SIGN=your_app_sign
EXPO_PUBLIC_ZEGO_SERVER_SECRET=your_server_secret  # Для генерации токенов
```

### 2. Backend для токенов (обязательно для production)

Digital Human API требует токены, сгенерированные на сервере. Создайте endpoint:

```typescript
// Backend endpoint: /api/zego/token
POST /api/zego/token
{
  "roomId": "string",
  "userId": "string"
}

Response:
{
  "token": "zego_token_string"
}
```

Обновите `generateZegoToken()` в `lib/api/zegocloud-digital-human.ts`:

```typescript
async function generateZegoToken(roomId: string, userId: string): Promise<string> {
  const response = await fetch(`${YOUR_BACKEND_URL}/api/zego/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, userId }),
  });
  const data = await response.json();
  return data.token;
}
```

## Использование

### Базовое использование

```typescript
import { AnnaDigitalHuman } from "@/components/AnnaDigitalHuman";

function AnnaScreen() {
  const roomId = `anna_room_${userId}`;
  
  return (
    <View>
      <AnnaDigitalHuman
        roomId={roomId}
        userId={userId}
        onReady={() => console.log("Anna ready!")}
        onError={(error) => console.error(error)}
      />
    </View>
  );
}
```

### Интеграция с текстовым чатом

```typescript
import { useAnnaDigitalHuman } from "@/components/AnnaDigitalHuman";

function AnnaScreen() {
  const { AnnaComponent, isReady, speak } = useAnnaDigitalHuman(roomId, userId);
  
  const handleSend = async (text: string) => {
    // Получаем ответ от Gemini
    const response = await streamAnnaResponse({ messages, mode });
    
    // Anna говорит ответ
    if (isReady) {
      await speak(response);
    }
  };
  
  return (
    <View>
      {AnnaComponent}
      {/* Chat UI */}
    </View>
  );
}
```

## API Reference

### `createDigitalHumanVideoStream()`

Создает видео-поток Digital Human.

```typescript
const task = await createDigitalHumanVideoStream({
  roomId: "room_123",
  streamId: "stream_123",
  assetId: "asset_123",
  backgroundColor: "#090D12",
  maxDuration: 3600,
});
```

### `driveDigitalHumanByText()`

Заставляет Anna говорить текст.

```typescript
await driveDigitalHumanByText({
  taskId: task.taskId,
  driveType: "text",
  content: "Привет! Я Anna, твой AI-ассистент.",
  interrupt: false,
});
```

### `driveDigitalHumanByAction()`

Заставляет Anna выполнить действие.

```typescript
await driveDigitalHumanByAction(
  taskId,
  "wave", // action name
  false // interrupt current action
);
```

## Действия (Actions)

Доступные действия зависят от выбранного Digital Human asset. Типичные действия:

- `wave` - помахать рукой
- `nod` - кивнуть
- `smile` - улыбнуться
- `think` - подумать
- `greet` - приветствие

## Обработка ошибок

```typescript
<AnnaDigitalHuman
  onError={(error) => {
    if (error.message.includes("token")) {
      // Проблема с токеном - нужно обновить
    } else if (error.message.includes("asset")) {
      // Проблема с выбором аватара
    } else {
      // Другая ошибка
    }
  }}
/>
```

## Оптимизация

1. **Кэширование assets**: Запрашивайте список assets один раз при старте
2. **Переиспользование комнат**: Используйте одну комнату для сессии пользователя
3. **Прерывание**: Используйте `interrupt: true` для быстрой смены текста
4. **Разрешение**: Используйте 720p для баланса качества и производительности

## Ограничения

- Требует backend для генерации токенов (production)
- Работает только на нативных платформах (iOS/Android)
- Требует активное подключение к интернету
- Максимальная длительность потока: 24 часа

## Документация

- [ZEGOCLOUD Digital Human AI Overview](https://docs.zegocloud.com/article/16678)
- [API Reference](https://www.zegocloud.com/docs/aigc-digital-human-server/server-apis/apis-overview)
- [Express Video Integration](https://www.zegocloud.com/docs/video-call/overview)

