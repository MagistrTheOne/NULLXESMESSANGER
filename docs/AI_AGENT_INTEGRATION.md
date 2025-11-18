# Интеграция ZEGOCLOUD AI Agent для Anna

## Обзор

ZEGOCLOUD AI Agent - это полноценное решение для создания интерактивного AI-ассистента с поддержкой:
- **Real-time Voice Calls** - задержка < 1 секунда
- **Digital Human Video** - Premium Photo-based Digital Human из Anna.jpg
- **Natural Voice Interruption** - прерывание за 500ms
- **AI Audio Processing** - шумоподавление, VAD, эхо-подавление
- **Gemini LLM Integration** - прямое подключение к Google Gemini

## Архитектура

```
User Voice → ASR (Tencent) → Gemini LLM → TTS (Volcano) → Digital Human → Video Stream
                ↓                                                              ↓
         AI Audio Processing                                          ZEGO Express Video
         (ANS, VAD, AEC)                                                    ↓
                                                                      AnnaAIAgent Component
```

## Настройка

### 1. Переменные окружения (уже настроены в .env)

```env
EXPO_PUBLIC_ZEGO_APP_ID=505060583
EXPO_PUBLIC_ZEGO_APP_SIGN=41be4d2d3d828c9a58064fead6419956aec03eea514f648f97a32edda4188e36
EXPO_PUBLIC_GOOGLE_AI_API_KEY=AIzaSyAeEaDVlckmmygYpEqoWEFaKT00mSAo7U4
```

### 2. Загрузка Anna.jpg на CDN (обязательно для Digital Human)

ZEGOCLOUD требует публично доступный HTTP/HTTPS URL для Anna.jpg.

**Варианты:**

1. **Использовать существующий CDN:**
   ```typescript
   import { setAnnaImageUrl } from "@/lib/utils/annaImage";
   
   // После загрузки на CDN
   setAnnaImageUrl("https://your-cdn.com/anna.jpg");
   ```

2. **Загрузить через ваш backend:**
   - Создайте endpoint для загрузки изображений
   - Загрузите Anna.jpg
   - Получите публичный URL
   - Используйте его при регистрации агента

3. **Временно без Digital Human:**
   - Агент будет работать в voice-only режиме
   - Digital Human можно добавить позже

### 3. Backend для токенов (обязательно для production)

Создайте endpoint на вашем backend:

```typescript
// Backend: POST /api/zego/token
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

Обновите `generateZegoToken()` в `lib/api/zegocloud-ai-agent.ts`:

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
import { AnnaAIAgent } from "@/components/AnnaAIAgent";
import { initializeAnnaAgent } from "@/lib/anna-agent-init";

// 1. Инициализировать агента (один раз)
const agentId = await initializeAnnaAgent("https://cdn.com/anna.jpg");

// 2. Использовать в компоненте
<AnnaAIAgent
  roomId="room_123"
  userId="user_123"
  agentId={agentId}
  callType="digital_human_video" // или "voice"
  onReady={(instanceId) => console.log("Ready!")}
  onStatusChange={(status) => console.log("Status:", status)}
/>
```

### Режимы работы

1. **Voice Mode** - только голосовой звонок
   - `callType="voice"`
   - Нет видео, только аудио

2. **Digital Human Video Mode** - видео с Digital Human
   - `callType="digital_human_video"`
   - Требует Anna.jpg URL
   - Показывает Digital Human аватар

### Статусы агента

- `idle` - готов к разговору
- `listening` - слушает пользователя
- `thinking` - обрабатывает запрос (LLM)
- `speaking` - говорит ответ (TTS + Digital Human)

## API Reference

### `registerAnnaAgent(config?)`

Регистрирует Anna AI Agent с Gemini LLM.

```typescript
const agentId = await registerAnnaAgent({
  annaImageUrl: "https://cdn.com/anna.jpg", // Optional
  voiceId: "anna_voice_female_01",
  language: "ru-RU",
});
```

### `createDigitalHumanAgentInstance()`

Создает instance для видео-звонка с Digital Human.

```typescript
const instance = await createDigitalHumanAgentInstance(
  agentId,
  roomId,
  userId
);
```

### `createVoiceAgentInstance()`

Создает instance для голосового звонка.

```typescript
const instance = await createVoiceAgentInstance(
  agentId,
  roomId,
  userId
);
```

### `interruptAnnaAgent()`

Прерывает текущую речь агента.

```typescript
await interruptAnnaAgent(instanceId);
```

## Особенности

### Real-time Voice Interaction

- **Задержка < 1 секунда** - полная обработка в реальном времени
- **Natural Interruption (500ms)** - естественное прерывание речи
- **AI Audio Processing** - автоматическая обработка аудио

### Digital Human

- **Premium Photo-based** - создается из одного фото Anna.jpg
- **1080p качество** - высокое разрешение
- **Точная синхронизация губ** - реалистичная речь
- **Задержка < 200ms** - интерактивное взаимодействие

### LLM Integration

- **Gemini Pro** - прямое подключение к Google Gemini
- **System Prompt** - персонализация Anna
- **Streaming** - потоковая обработка ответов
- **Context Management** - управление контекстом разговора

## Обработка ошибок

```typescript
<AnnaAIAgent
  onError={(error) => {
    if (error.message.includes("token")) {
      // Проблема с токеном
    } else if (error.message.includes("agent")) {
      // Проблема с агентом
    } else {
      // Другая ошибка
    }
  }}
/>
```

## Оптимизация

1. **Кэширование Agent ID** - агент регистрируется один раз
2. **Переиспользование комнат** - одна комната на сессию
3. **Status Polling** - проверка статуса каждые 500ms
4. **Graceful Degradation** - fallback на текстовый режим при ошибках

## Ограничения

- Требует backend для генерации токенов (production)
- Работает только на нативных платформах (iOS/Android)
- Digital Human требует публичный URL для Anna.jpg
- Требует активное подключение к интернету

## Документация

- [ZEGOCLOUD AI Agent Overview](https://www.zegocloud.com/docs/aiagent-server/introduction/overview)
- [API Reference](https://www.zegocloud.com/docs/aiagent-server/api-reference/apis-overview)
- [Digital Human Guide](https://docs.zegocloud.com/article/16678)

## Следующие шаги

1. ✅ Создан API клиент для AI Agent
2. ✅ Создан компонент AnnaAIAgent
3. ✅ Интегрирован в video.tsx
4. ⏳ Загрузить Anna.jpg на CDN
5. ⏳ Настроить backend для токенов
6. ⏳ Протестировать на реальных устройствах

