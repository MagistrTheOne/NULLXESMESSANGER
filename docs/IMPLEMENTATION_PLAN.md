# План реализации видео звонков и улучшения Stories

## Этап 1: Улучшение Stories (быстро)

### Установка зависимостей:
```bash
npx expo install expo-media-library
npx expo install expo-image-manipulator
```

### Что добавить:
- Фильтры для фото/видео
- Редактирование перед публикацией
- Лучшая работа с медиа-библиотекой

---

## Этап 2: Видео звонки (основная работа)

### Вариант A: Voximplant (Рекомендуется)

#### Установка:
```bash
npm install @voximplant/react-native-jsapi
npx expo install expo-av
```

#### Преимущества:
- ✅ Хорошая документация
- ✅ Поддержка React Native
- ✅ WebRTC на основе
- ✅ Групповые звонки

#### Недостатки:
- ⚠️ Требует регистрацию и API ключи
- ⚠️ Платный после free tier

---

### Вариант B: ZEGOCLOUD (Альтернатива)

#### Установка:
```bash
npm install zego-express-engine-reactnative
```

#### Преимущества:
- ✅ Простая интеграция
- ✅ Хорошая производительность
- ✅ Бесплатный tier

---

## Этап 3: Интеграция в проект

### Структура файлов:
```
lib/
  api/
    voximplant.ts      # Voximplant клиент
    callManager.ts     # Менеджер звонков
  hooks/
    useVideoCall.ts    # Хук для видео звонков
components/
  VideoCall/
    VideoCallScreen.tsx
    CallControls.tsx
    RemoteVideoView.tsx
    LocalVideoView.tsx
```

### Основные компоненты:

1. **CallManager** - управление звонками
2. **VideoCallScreen** - экран звонка
3. **CallControls** - кнопки управления
4. **useVideoCall** - хук для логики звонка

---

## Рекомендация

**Для быстрого старта:** Используйте **Voximplant** или **ZEGOCLOUD**

**Для production:** Рассмотрите **Agora.io** или **Twilio** (если бюджет позволяет)

**Для Stories:** Текущий стек достаточен, добавьте только `expo-media-library` для улучшений

