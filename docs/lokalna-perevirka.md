# Локальна перевірка практичної №7


| Перевірка | Результат |
|---|---|
| `npm ci --ignore-scripts` | успішно, помилок немає |
| `npm run lint` | успішно, 6 JavaScript-файлів |
| `npm run test:ci` | **4 із 4 тести пройшли**, 0 помилок |
| `npm run build` | успішно, згенеровано `dist/` |
| `GET /health` | HTTP 200, `{"status":"ok"}` |
| `GET /` | HTML-сторінка з заголовком Task Tracker |
| `POST /api/tasks` | HTTP 201, повернуто створене завдання |
| `GET /api/tasks` | новостворене завдання є у відповіді |
| `GET /app.js` | HTTP 200 |
| `GET /styles.css` | HTTP 200 |
| Синтаксис YAML workflow | валідний (тригери та два jobs присутні) |

