# DECAY — сайт

Статический сайт игры DECAY (Real_Studio). Без сборки и зависимостей.

```
index.html          главная (+ FAQ)
download/           страница «Скачать» (версия и changelog из GitHub Releases)
roadmap/            план разработки
devlog/             девлог
feedback/           форма отзыва -> GitHub Issues
404.html            страница 404 с мини-игрой (js/game.js)
sitemap.xml, robots.txt, manifest.webmanifest
css/site.css        база: шрифты, цвета, кнопки, фон
css/style.css       стили страниц
js/config.js        репозиторий и Telegram (меняется здесь)
js/i18n.js          переключатель RU/EN (английский текст здесь)
js/fx.js            падающий металлолом
js/sound.js         звук (синтез в браузере, без файлов)
js/effects.js       тряска, пыль, фонарик и прицел
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

## Адрес сайта
В `sitemap.xml`, `robots.txt`, `og:image` и `canonical` прописан `https://vovapro01345.github.io/Decay/`.
Если подключишь свой домен — замени этот адрес (и в `<base>` внутри `404.html`) на новый.

## Статистика
Зарегистрируй сайт на goatcounter.com, впиши код в `js/config.js` → `goatcounter: "твой-код"`. Пусто — статистика выключена.

## Релизы лаунчера
Страница «Скачать» берёт `.exe` и `.apk` из последнего релиза репозитория `repo` (`js/config.js`).
Текст релиза показывается как «Что нового».
