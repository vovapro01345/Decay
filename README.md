# DECAY — сайт

Статический сайт игры DECAY (Real_Studio). Без сборки и зависимостей.

```
index.html          главная (+ FAQ)
roadmap/            план разработки
devlog/             девлог
feedback/           форма отзыва -> GitHub Issues
404.html
css/site.css        база: шрифты, цвета, кнопки, фон
css/style.css       стили страниц
js/config.js        репозиторий и Telegram (меняется здесь)
js/i18n.js          переключатель RU/EN (английский текст здесь)
js/fx.js            падающий металлолом
js/sound.js         звук (синтез в браузере, без файлов)
js/main.js          шапка, анимации, версия лаунчера, форма
images/ fonts/
```

## GitHub Pages
Settings → Pages → Deploy from a branch → `main` / `(root)`.

## Что править
- Девлог: скопируй блок `<article>` в `devlog/index.html`.
- Roadmap: пункты `<li>` в `roadmap/index.html`.
- `js/config.js`: `repo` — откуда берётся версия лаунчера (релизы), `issues` — репозиторий сайта для отзывов (в нём должны быть включены Issues).
- Новый текст на двух языках: добавь строку в HTML и английскую версию в `js/i18n.js`.
