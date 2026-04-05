# Clock Widget

Небольшой виджет часов для Windows 11, сделанный на Tauri.

Идея была простой: сделать аккуратные часы, которые не перегружают рабочий стол, нормально выглядят на нескольких мониторах и не разваливаются от банальных вещей вроде смены DPI или перетаскивания между экранами.

Сейчас в проекте есть:
- несколько независимых виджетов
- отдельная таймзона для каждого окна
- три визуальных стиля
- `always on top`
- 12/24h формат
- показ или скрытие секунд
- свободное перетаскивание между экранами
- `Pin`, если нужно зафиксировать виджет на месте

## Что это за проект

Clock Widget это маленькое desktop-приложение без лишней сложности. Каждый виджет живёт в своём окне и хранит настройки локально. Никакой синхронизации, аккаунтов или внешних сервисов тут нет.

Контекстное меню позволяет быстро поменять стиль, таймзону и поведение окна. Основной сценарий довольно простой: поставил часы на нужный экран, выбрал оформление и больше не трогаешь, пока не захочется что-то переставить.

## Локальный запуск

Если хочешь просто запустить проект локально:

```powershell
cargo run
```

## Сборка установщика

Для сборки MSI:

```powershell
npx.cmd tauri build --bundles msi
```

Готовый файл появится здесь:

- `target/release/bundle/msi/Clock Widget_<version>_x64_en-US.msi`

## Автозапуск с Windows

Если хочешь, чтобы виджет запускался автоматически после входа в Windows:

1. Установи приложение или выбери постоянный путь к `.exe`.
2. Нажми `Win + R`.
3. Введи `shell:startup` и нажми Enter.
4. В открывшейся папке создай ярлык на `Clock Widget.exe`.

Практический совет:

- лучше создавать ярлык на установленную версию приложения, а не на временный файл из `target/`
- если собрал MSI, после установки удобнее использовать ярлык или `.exe` из установленной директории
- всё, что лежит в папке автозагрузки, будет запускаться при каждом входе в систему

## Требования

Для локальной разработки нужны:

- Windows 11
- Rust toolchain
- Tauri CLI
- Microsoft Edge WebView2 Runtime
- Visual Studio Build Tools 2022 с C++ workload

## Структура проекта

Самое важное находится здесь:

- `src/index.html` — интерфейс, стили и контекстное меню
- `src/main.rs` — инициализация Tauri-окна и защита от DPI-сюрпризов
- `tauri.conf.json` — конфиг приложения и сборки
- `scripts/` — вспомогательные скрипты

## Публикация

Если выкладывать проект в публичный Git:

- не коммить `target/`
- не коммить `dist/`
- не держи в репозитории временные `.exe` из локальных сборок
- релизный артефакт лучше выкладывать через GitHub Releases, а не хранить в репо

## Лицензия

MIT, подробнее в [LICENSE](LICENSE).

---

## English

Small desktop clock widget for Windows 11, built with Tauri.

The goal of this project was pretty simple: make a clean clock widget that looks good on the desktop, behaves well across multiple monitors, and does not fall apart when DPI scaling changes or the window is dragged between screens.

Current features:
- multiple independent widgets
- per-window time zone
- three visual styles
- `always on top`
- 12/24h format
- optional seconds
- free dragging across monitors
- `Pin` mode when you want to lock a widget in place

## What this project is

Clock Widget is a small desktop app without unnecessary complexity. Each widget lives in its own window and stores its settings locally. No accounts, no sync, no external services.

The context menu is the main control surface. You can change the style, switch the time zone, or pin the widget in place without digging through settings screens.

## Run locally

```powershell
cargo run
```

## Build the installer

To build the MSI installer:

```powershell
npx.cmd tauri build --bundles msi
```

The generated installer will be here:

- `target/release/bundle/msi/Clock Widget_<version>_x64_en-US.msi`

## Start with Windows

If you want the widget to launch automatically when you sign in to Windows:

1. Install the app or choose a permanent `.exe` location.
2. Press `Win + R`.
3. Type `shell:startup` and press Enter.
4. Create a shortcut to `Clock Widget.exe` in that folder.

Practical notes:

- it is better to create the shortcut to the installed app, not to a temporary build inside `target/`
- if you built an MSI, use the installed app path or shortcut after installation
- everything inside the Startup folder will launch automatically at sign-in

## Requirements

To work on the project locally, you will need:

- Windows 11
- Rust toolchain
- Tauri CLI
- Microsoft Edge WebView2 Runtime
- Visual Studio Build Tools 2022 with the C++ workload

## Project layout

The most important files are:

- `src/index.html` — UI, styles, and context menu logic
- `src/main.rs` — Tauri bootstrap and DPI-related window guards
- `tauri.conf.json` — app and bundling config
- `scripts/` — helper scripts

## Publishing notes

If you plan to publish this repo:

- do not commit `target/`
- do not commit `dist/`
- do not keep temporary local build `.exe` files in the repo
- publish release artifacts through GitHub Releases instead of storing them in source control

## License

MIT. See [LICENSE](LICENSE).
