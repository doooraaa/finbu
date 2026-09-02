# FamBu

Коммерческий PWA-прототип семейного бюджета для участников одной семьи.

## Стек

- HTML5
- CSS3
- Vanilla JavaScript ES Modules
- PWA manifest
- Service Worker

## Структура

- `index.html` - экраны приложения и компоненты
- `styles.css` - дизайн-система и адаптивный UI
- `app.js` - навигация и bottom sheet
- `db.js` - IndexedDB и клиентские миграции
- `finance-domain.js` - проверка денежных и кредитных данных
- `payment-cycle.js` - платежные циклы и перенос дат
- `manifest.webmanifest` - PWA-настройки
- `sw.js` - offline shell cache

## Команды

- `npm.cmd start` - запустить приложение на `http://127.0.0.1:4173`
- `npm.cmd test` - запустить автоматические проверки доменной логики
