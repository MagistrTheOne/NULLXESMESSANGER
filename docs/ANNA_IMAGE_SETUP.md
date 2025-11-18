# Настройка Anna.jpg для Digital Human

## Варианты загрузки Anna.jpg

### Вариант 1: Ручная загрузка на CDN (рекомендуется)

1. Загрузите `app/(main)/anna/image/Anna.jpg` на ваш CDN:
   - AWS S3 + CloudFront
   - Cloudinary
   - Imgur (для тестирования)
   - Любой другой CDN

2. Получите публичный URL, например:
   ```
   https://cdn.example.com/anna.jpg
   ```

3. Установите URL в коде:
   ```typescript
   import { setAnnaImageUrl } from "@/lib/utils/annaImage";
   
   // При инициализации приложения
   setAnnaImageUrl("https://cdn.example.com/anna.jpg");
   ```

### Вариант 2: Автоматическая загрузка через backend

1. Настройте `EXPO_PUBLIC_BACKEND_URL` в `.env`:
   ```env
   EXPO_PUBLIC_BACKEND_URL=https://your-backend.com
   ```

2. Создайте endpoint `POST /api/upload` на backend (см. `docs/BACKEND_SETUP.md`)

3. Раскомментируйте код в `lib/utils/annaImage.ts`:
   ```typescript
   // Раскомментируйте строки 23-31
   try {
     const uploadedUrl = await uploadAnnaImageToCDN();
     if (uploadedUrl) {
       annaImageUrl = uploadedUrl;
       return uploadedUrl;
     }
   } catch (error) {
     console.warn("Failed to upload Anna.jpg, using fallback:", error);
   }
   ```

### Вариант 3: Временное решение для тестирования

Используйте публичный хостинг изображений:

```typescript
import { setAnnaImageUrl } from "@/lib/utils/annaImage";

// Временно используйте публичный URL
setAnnaImageUrl("https://i.imgur.com/your-image-id.jpg");
```

⚠️ **Важно:** Для production используйте надежный CDN!

## Требования к изображению

- **Формат:** JPG, PNG
- **Размер:** Рекомендуется 1024x1024 или больше
- **Содержимое:** Портрет человека (Anna)
- **Качество:** Высокое (для лучшего результата Digital Human)

## Проверка

После настройки URL, проверьте:

```typescript
import { getAnnaImageUrl } from "@/lib/utils/annaImage";

const url = await getAnnaImageUrl();
console.log("Anna image URL:", url);
// Должен вывести: https://cdn.example.com/anna.jpg
```

