# Звіт з практичної роботи №7

**Тема:** CI/CD на GitHub Actions  
**Рівень:** 75 балів  
**Студент:** _____________________  
**Група:** _____________________  
**Дата:** _____________________

## Мета

Налаштувати автоматичні перевірки застосунку (CI: lint, test, build) і реалізувати delivery **одного** сервісу через артефакт Docker-образу.

## Обраний проєкт

Task Tracker — навчальний вебзастосунок із REST API на Node.js 22. Сервіс має endpoints `GET /health`, `GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/:id` і вебінтерфейс. Дані завдань зберігаються в пам'яті процесу. Проєкт містить один сервіс.

## Реалізація CI

У файлі `.github/workflows/ci.yml` налаштовано тригери `push`, `pull_request`, `workflow_dispatch`.

| Крок | Призначення |
|---|---|
| `actions/checkout@v7` | Отримати вихідний код |
| `actions/setup-node@v7` | Node.js 22, npm cache |
| `npm ci` | Відтворюване встановлення залежностей |
| `npm run lint` | Перевірка синтаксису JavaScript і стилю файлів |
| `npm run test:ci` | 4 автоматичні тести, JUnit XML |
| `npm run build` | Підготовка збірки `dist/` |
| `upload-artifact@v7` | Артефакти `junit-report`, `app-build` |

## Реалізація delivery

Обрано **варіант B — Artifact** (за вимогами на 75 балів). Після успішного CI на `main` Docker збирає образ одного сервісу `task-tracker-api`, тестує `GET /health`, експортує образ через `docker save` у файл `task-tracker-api.tar` і завантажує його до Actions як артефакт `task-tracker-api-docker`.

## Перевірка роботи

Під час підготовки проєкту локально перевірено команди `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build` та HTTP-відповідь API (результати у `docs/lokalna-perevirka.md`).

**Після публікації на GitHub:** заповніть реальні результати, збережіть скріншот зелених jobs CI та delivery і сторінки артефакту. Жоден із цих результатів не слід позначати як виконаний до запуску workflow.

## Посилання для здачі (заповнити після публікації)

- **Репозиторій:** `https://github.com/USERNAME/practical7-75`
- **Успішний запуск CI/CD:** `https://github.com/USERNAME/practical7-75/actions/runs/RUN_ID`
- **Docker-артефакт:** на сторінці вказаного запуску → **Artifacts → task-tracker-api-docker**.
- **Бейдж статусу CI:** у кореневому `README.md`.

## Місце для скріншотів

1. Успішні `CI - lint, tests, build` та `CD - deliver one Docker image as TAR` — *додати реальний скріншот після запуску*.
2. Сторінка `Artifacts` з `task-tracker-api-docker` — *додати реальний скріншот після запуску*.
3. Робота вебінтерфейсу або відповідь `GET /health` — *за потреби додати реальний скріншот*.

## Висновок

У межах практичної підготовлено конфігурацію GitHub Actions для автоматичної перевірки застосунку та delivery одного Docker-сервісу у вигляді TAR-артефакту. Остаточне підтвердження роботи CI/CD потребує успішного виконання workflow у власному GitHub-репозиторії.
