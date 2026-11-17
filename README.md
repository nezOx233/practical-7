# Практична робота №7 — CI/CD на GitHub Actions (75 балів)

[![CI](https://github.com/USERNAME/practical7-75/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/practical7-75/actions/workflows/ci.yml)

> **Після завантаження на GitHub замініть `USERNAME` на власний логін в обох адресах бейджа.** Назву репозиторію в посиланнях також змініть, якщо вона відрізняється від `practical7-75`. До першого реального запуску CI бейдж не відображатиме успіх.

## 1. Опис проєкту

**Task Tracker** — навчальний вебзастосунок на **Node.js 22** без зовнішніх npm-залежностей. Користувач може створювати завдання, дивитися список, позначати їх виконаними й видаляти. Сервер одночасно віддає вебінтерфейс та REST API, тобто це **один сервіс**. Дані тимчасово зберігаються в пам'яті та зникають після перезапуску (для демонстрації CI/CD цього достатньо).

Порт: **8080**. Вебінтерфейс: `http://localhost:8080`. Перевірка API: `http://localhost:8080/health`.

## 2. Локальний запуск

Встановіть **Node.js 22+**, потім виконайте в корені проєкту:

```bash
npm ci
npm run lint
npm test
npm run build
npm start
```

У браузері відкрийте <http://localhost:8080>. Для перевірки готової збірки замість `npm start` можна використати `npm run start:dist`.

Приклади API:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/tasks
curl -X POST http://localhost:8080/api/tasks -H "Content-Type: application/json" -d '{"title":"Перевірити CI"}'
```

Очікувана відповідь `/health`: `{"status":"ok"}`. Перевірки: **4 автоматичні тести** (валідація, створення, оновлення/видалення, HTTP-ендпоїнти та віддача вебсторінки).

## 3. Налаштування CI

Файл [`.github/workflows/ci.yml`](.github/workflows/ci.yml) автоматично виконується на `push`, `pull_request` та вручну через `workflow_dispatch`. Job `CI - lint, tests, build`:

1. Завантажує код за допомогою `actions/checkout@v7`.
2. Налаштовує Node.js 22 та кеш npm (`actions/setup-node@v7`).
3. Встановлює залежності командою `npm ci`.
4. Виконує `npm run lint` (синтаксис JS та перевірка стилю файлів).
5. Виконує `npm run test:ci` й генерує **JUnit XML**.
6. Виконує `npm run build`.
7. Публікує `junit-report` та `app-build` через `actions/upload-artifact@v7`.

При неуспішних тестах CI буде червоним; звіт JUnit все одно завантажиться, якщо встиг сформуватися.

## 4. Delivery на 75 балів — варіант B: Artifact

**Один сервіс** пакується у Docker-образ. На `push` у гілку `main` після успішного CI запускається job `CD - deliver one Docker image as TAR`:

1. `docker build -f Dockerfile -t task-tracker-api:sha-<commit> .`
2. Запуск і перевірка контейнера запитом `GET /health`.
3. `docker save` у **`task-tracker-api.tar`**.
4. Публікація TAR як GitHub Actions artifact **`task-tracker-api-docker`** (зберігається 14 днів).

Публікація в GHCR **не потрібна**, оскільки обрано альтернативний спосіб delivery з методички. На pull request перевірка CI виконується, а delivery не запускається.

### Локальне тестування Docker (за встановленого Docker)

```bash
docker build -t task-tracker-api:local .
docker run --rm -p 8080:8080 task-tracker-api:local
```

Відкрити `http://localhost:8080/health` та перевірити відповідь `{"status":"ok"}`.

### Як отримати контейнерний артефакт

1. Відкрити вкладку **Actions** у власному репозиторії.
2. Вибрати успішне виконання **Practical 7 - CI and Artifact Delivery** з гілки `main`.
3. Внизу сторінки, у розділі **Artifacts**, завантажити `task-tracker-api-docker`.
4. Розпакувати завантажений ZIP, після чого виконати:

```bash
docker load -i task-tracker-api.tar
docker images task-tracker-api
# Запуск: підставте тег, який покаже попередня команда
docker run --rm -p 8080:8080 task-tracker-api:sha-XXXXXXXXXXXX
```

## 5. Як опублікувати у **власному** GitHub-репозиторії

1. Створіть на GitHub порожній репозиторій **`practical7-75`** без початкового README.
2. У терміналі відкрийте розпаковану папку практичної та виконайте команди (замініть `USERNAME`):

```bash
git init
git branch -M main
git add .
git commit -m "Practical 7: CI and Docker artifact delivery (75 points)"
git remote add origin https://github.com/USERNAME/practical7-75.git
git push -u origin main
```

3. Відкрийте вкладку **Actions**, дочекайтесь фактичного завершення обох jobs (CI і delivery). Якщо обидві зелені — відкрийте сторінку запуску, звідти можна скопіювати посилання.
4. Замініть `USERNAME` у бейджі README, зробіть `git add README.md && git commit -m "Set CI badge URL" && git push`.
5. Знайдіть артефакт `task-tracker-api-docker` на сторінці виконання. Посилання на **сторінку run** дозволяє викладачеві знайти цей артефакт (прямі URL артефактів можуть вимагати авторизації).

**Посилання на CI workflow після публікації:** `https://github.com/USERNAME/practical7-75/actions/workflows/ci.yml`.

## 6. Що здати викладачу

- Посилання на свій GitHub-репозиторій.
- Посилання на **реально успішне** виконання CI/CD (обидва jobs зелені) або його скріншот.
- Посилання на виконання, на сторінці якого розміщено артефакт `task-tracker-api-docker`.
- [Звіт до практичної роботи](docs/zvit-praktychna-7.md) (заповнити посилання та додати свої скріншоти після запуску).

## 7. Структура

```text
.github/workflows/ci.yml   # CI + delivery (artifact TAR)
src/server.mjs             # HTTP API і вебінтерфейс
src/tasks.mjs              # бізнес-логіка
public/                    # браузерний інтерфейс
scripts/lint.mjs           # статична перевірка
scripts/build.mjs          # збірка dist/
tests/tasks.test.mjs       # 4 автоматичні тести
Dockerfile                 # контейнеризація одного сервісу
package.json               # npm scripts
package-lock.json          # відтворюваний npm ci
docs/zvit-praktychna-7.md  # звіт для здачі
```

## 8. Важливо

Локальні команди були перевірені під час підготовки проєкту. **Успішний запуск GitHub Actions та опублікований Docker TAR неможливо чесно підтвердити, доки ви не завантажите код у свій репозиторій та не запустите workflow.** Скріншоти і посилання в звіті слід додати лише після виконання на GitHub.
