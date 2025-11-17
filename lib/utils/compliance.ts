/**
 * Утилиты для соответствия требованиям законодательства
 * ФЗ-152, GDPR, CCPA, LGPD
 */

export interface ComplianceInfo {
  fz152: {
    operator: string;
    purpose: string;
    legalBasis: string;
    retentionPeriod: string;
  };
  gdpr: {
    controller: string;
    legalBasis: string;
    retentionPeriod: string;
  };
  ccpa: {
    business: string;
    categories: string[];
  };
}

export const COMPLIANCE_INFO: ComplianceInfo = {
  fz152: {
    operator: "NULLXES Messenger",
    purpose: "Обеспечение функционирования мессенджера, предоставление услуг связи",
    legalBasis: "Согласие субъекта персональных данных (ст. 9 ФЗ-152)",
    retentionPeriod: "До отзыва согласия или удаления аккаунта",
  },
  gdpr: {
    controller: "NULLXES Messenger",
    legalBasis: "Consent (Article 6(1)(a) GDPR), Contract (Article 6(1)(b) GDPR)",
    retentionPeriod: "Until consent withdrawal or account deletion",
  },
  ccpa: {
    business: "NULLXES Messenger",
    categories: [
      "Identifiers (phone number, user ID)",
      "Personal information (name, status)",
      "Internet activity (messages, chats)",
    ],
  },
};

export function getDataRetentionPeriod(): string {
  return "Данные хранятся до отзыва согласия или удаления аккаунта пользователем";
}

export function getOperatorInfo(): string {
  return "Оператор персональных данных: NULLXES Messenger. Контакты: privacy@nullxes.club";
}

export function getRightsInfo(): string[] {
  return [
    "Право на доступ к персональным данным (ст. 14 ФЗ-152, ст. 15 GDPR)",
    "Право на исправление неточных данных (ст. 14 ФЗ-152, ст. 16 GDPR)",
    "Право на удаление данных (ст. 14 ФЗ-152, ст. 17 GDPR)",
    "Право на ограничение обработки (ст. 18 GDPR)",
    "Право на переносимость данных (ст. 20 GDPR)",
    "Право на отзыв согласия (ст. 9 ФЗ-152, ст. 7 GDPR)",
    "Право на возражение против обработки (ст. 21 GDPR)",
  ];
}

export function getSecurityMeasures(): string[] {
  return [
    "Шифрование данных при передаче (TLS 1.3)",
    "Безопасное хранение токенов (SecureStore, Keychain)",
    "Биометрическая аутентификация",
    "Регулярные обновления безопасности",
    "Аудит доступа к данным",
    "Резервное копирование с шифрованием",
  ];
}

