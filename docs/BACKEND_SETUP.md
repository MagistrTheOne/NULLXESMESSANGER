# Backend Setup для ZEGOCLOUD

## Обязательные endpoints

### 1. POST /api/zego/token

Генерация токена для ZEGOCLOUD API.

**Request:**
```json
{
  "roomId": "string (optional)",
  "userId": "string (optional)"
}
```

**Response:**
```json
{
  "token": "zego_token_string"
}
```

**Пример реализации (Node.js):**
```javascript
const crypto = require('crypto');

app.post('/api/zego/token', async (req, res) => {
  const { roomId, userId } = req.body;
  const appId = process.env.ZEGO_APP_ID;
  const serverSecret = process.env.ZEGO_SERVER_SECRET;
  
  // Generate token using ZEGO SDK
  // See: https://www.zegocloud.com/docs/server-side/token-generation
  
  const token = generateZegoToken(appId, serverSecret, roomId, userId);
  
  res.json({ token });
});
```

### 2. POST /api/upload (опционально)

Загрузка файлов (например, Anna.jpg) на CDN.

**Request:**
```json
{
  "fileName": "anna.jpg",
  "fileType": "image/jpeg",
  "data": "base64_encoded_file_data"
}
```

**Response:**
```json
{
  "url": "https://cdn.example.com/anna.jpg"
}
```

## Переменные окружения на backend

```env
ZEGO_APP_ID=505060583
ZEGO_SERVER_SECRET=your_server_secret_here
CDN_URL=https://your-cdn.com
```

## Быстрый старт

1. Установите ZEGO Server SDK:
```bash
npm install zego-server-sdk
```

2. Создайте endpoint для токенов
3. Настройте переменные окружения
4. Установите `EXPO_PUBLIC_BACKEND_URL` в `.env` клиента

## Безопасность

⚠️ **ВАЖНО:** `ZEGO_SERVER_SECRET` должен быть ТОЛЬКО на backend!
Никогда не добавляйте его в `.env` клиентского приложения!

