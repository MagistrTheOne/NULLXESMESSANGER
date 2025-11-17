# Рекомендации по SDK для NULLXES Messenger

## 📹 Видео/Голосовые звонки (WebRTC)

### Рекомендуемые решения для Expo/React Native:

#### 1. **Voximplant** (Рекомендуется)
- ✅ Поддерживает React Native
- ✅ WebRTC на основе
- ✅ P2P и групповые звонки
- ✅ Демонстрация экрана
- ✅ Хорошая документация
- 📦 `@voximplant/react-native-jsapi`

#### 2. **ZEGOCLOUD** (Альтернатива)
- ✅ Простая интеграция
- ✅ Хорошая производительность
- ✅ Поддержка React Native
- 📦 `zego-express-engine-reactnative`

#### 3. **Agora.io** (Популярный выбор)
- ✅ Надежный и масштабируемый
- ✅ React Native SDK
- ✅ Хорошая документация
- 📦 `react-native-agora`

#### 4. **Twilio Video** (Enterprise)
- ✅ Очень надежный
- ✅ Отличная поддержка
- ⚠️ Дороже других решений
- 📦 `twilio-video-react-native`

### Установка (пример для Voximplant):
```bash
npm install @voximplant/react-native-jsapi
npx expo install expo-av
```

---

## 📸 Stories (Уже реализовано)

### Текущие зависимости:
- ✅ `expo-camera` - для записи фото/видео
- ✅ `expo-av` - для воспроизведения видео
- ✅ `expo-image-picker` - для выбора медиа

### Дополнительно можно добавить:
- `expo-media-library` - для работы с медиа-библиотекой
- `react-native-vision-camera` - для более продвинутой записи (требует eject из Expo)

---

## 🎥 Видео запись и обработка

### Для улучшения Stories:
- `expo-media-library` - доступ к медиа-библиотеке
- `expo-image-manipulator` - редактирование изображений
- `expo-video` (если доступен) - улучшенная работа с видео

---

## 📱 Рекомендуемый стек для полной реализации:

### 1. Видео звонки:
```bash
npm install @voximplant/react-native-jsapi
# или
npm install zego-express-engine-reactnative
```

### 2. Улучшение Stories:
```bash
npx expo install expo-media-library
npx expo install expo-image-manipulator
```

### 3. Для обработки видео (опционально):
```bash
npm install react-native-video
# или использовать expo-av (уже установлен)
```

---

## 🔧 Пример интеграции Voximplant:

```typescript
// lib/api/voximplant.ts
import { Voximplant } from '@voximplant/react-native-jsapi';

export class CallManager {
  private client: Voximplant.Client;
  
  async initialize() {
    this.client = Voximplant.getInstance();
    await this.client.init();
  }
  
  async startCall(userId: string, video: boolean) {
    const call = await this.client.call(userId, {
      video: video,
      receiveVideo: true,
    });
    return call;
  }
}
```

---

## 💰 Сравнение решений:

| SDK | Цена | Сложность | Качество | Рекомендация |
|-----|------|-----------|----------|--------------|
| Voximplant | Средняя | Низкая | Высокое | ⭐⭐⭐⭐⭐ |
| ZEGOCLOUD | Низкая | Низкая | Высокое | ⭐⭐⭐⭐ |
| Agora.io | Средняя | Средняя | Очень высокое | ⭐⭐⭐⭐ |
| Twilio | Высокая | Средняя | Очень высокое | ⭐⭐⭐ |

---

## 🚀 Быстрый старт:

1. **Для видео звонков** - рекомендую начать с **Voximplant** или **ZEGOCLOUD**
2. **Для Stories** - текущий стек достаточен, можно добавить `expo-media-library`
3. **Для обработки медиа** - использовать `expo-image-manipulator`

---

## 📚 Полезные ссылки:

- [Voximplant React Native SDK](https://voximplant.com/docs/references/mobilesdk/react-native)
- [ZEGOCLOUD React Native](https://docs.zegocloud.com/article/14882)
- [Agora React Native](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)
- [Expo Camera Docs](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo AV Docs](https://docs.expo.dev/versions/latest/sdk/av/)

