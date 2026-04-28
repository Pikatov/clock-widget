# Clock Widget

Небольшой desktop-виджет часов для Windows 11, сделанный на Tauri.

<img width="300" height="600" alt="Clock Widget preview" src="https://github.com/user-attachments/assets/23f9cf58-e395-43e1-9a6f-e34ddee02c58" />

Текущая версия: `2.0.0`.

Релизные заметки: [RELEASE_NOTES.md](RELEASE_NOTES.md).

## Что это

Clock Widget показывает аккуратные часы в отдельном прозрачном окне. Виджет можно держать поверх остальных окон, переносить между мониторами, закреплять на месте и запускать несколько независимых экземпляров с разными настройками.

Приложение не использует аккаунты, синхронизацию или внешние сервисы. Настройки каждого окна хранятся локально в WebView.

## Возможности

- несколько независимых окон-виджетов
- отдельная таймзона для каждого окна
- поиск таймзоны по городу или IANA-имени
- три визуальных режима: `Classic dark`, `Light theme`, `Text only`
- режимы `Always on top` и `Pin widget`
- переключение секунд
- 12/24-часовой формат
- перетаскивание по рабочему столу
- фиксированный размер окна при смене DPI и переносе между мониторами

## Управление

- Перетащить виджет: зажать левую кнопку мыши на часах.
- Открыть меню: правый клик по окну.
- Выбрать таймзону: пункт `Time zone...` или клик по бейджу таймзоны.
- Создать ещё один виджет: `Add widget`.
- Закрепить окно на месте: `Pin widget`.
- Держать поверх окон: `Always on top`.

## Установка

Готовые сборки публикуются в GitHub Releases:

- MSI-установщик: `Clock Widget_2.0.0_x64_en-US.msi`
- portable-архив: `ClockWidget-2.0.0-portable-win11.zip`

Portable-версия не требует установки: распакуй архив и запусти `ClockWidget.exe`.

## Автозапуск с Windows

1. Установи приложение или распакуй portable-версию в постоянную папку.
2. Нажми `Win + R`.
3. Введи `shell:startup` и нажми Enter.
4. Добавь ярлык на `Clock Widget.exe` или `ClockWidget.exe`.

## Локальный запуск

```powershell
cargo run
```

## Сборка

Для полной сборки release assets на Windows:

```powershell
cargo install tauri-cli --version "^1" --locked
.\scripts\build-release-assets.ps1
```

Скрипт собирает MSI и portable ZIP в `dist/`.

Если нужен только MSI:

```powershell
cargo tauri build --bundles msi
```

Если нужен только portable ZIP:

```powershell
.\scripts\build-portable-zip.ps1
```

## Требования для разработки

- Windows 11
- Rust toolchain
- Tauri CLI 1.x
- Microsoft Edge WebView2 Runtime
- Visual Studio Build Tools 2022 с C++ workload
- WiX Toolset для MSI-сборки

## Структура проекта

- `src/index.html` - разметка окна и меню.
- `src/styles.css` - стили виджета, меню и выбора таймзоны.
- `src/app.js` - состояние окна, часы, таймзоны и обработчики меню.
- `src/main.rs` - Tauri bootstrap, создание окон и защита размера при DPI changes.
- `scripts/build-release-assets.ps1` - сборка MSI и portable ZIP.
- `scripts/build-portable-zip.ps1` - сборка portable ZIP.
- `.github/workflows/release.yml` - сборка и публикация assets для GitHub Releases.

## Публикация релиза

1. Обновить версию в `Cargo.toml` и `tauri.conf.json`.
2. Обновить `README.md` и `RELEASE_NOTES.md`.
3. Создать tag формата `v2.0.0`.
4. Запушить `main` и tag на GitHub.

GitHub Actions соберёт Windows assets и прикрепит их к GitHub Release.

## License

MIT. See [LICENSE](LICENSE).

---

## English

Small Windows 11 desktop clock widget built with Tauri.

Current version: `2.0.0`.

Release notes: [RELEASE_NOTES.md](RELEASE_NOTES.md).

## What It Is

Clock Widget shows a clean clock in a separate transparent desktop window. You can keep it above other windows, move it across monitors, pin it in place, and create multiple independent widgets with separate settings.

The app does not use accounts, sync, or external services. Per-window settings are stored locally in the WebView.

## Features

- multiple independent widget windows
- per-window time zone
- time zone search by city or IANA name
- three visual modes: `Classic dark`, `Light theme`, `Text only`
- `Always on top` and `Pin widget` modes
- optional seconds
- 12/24-hour format
- desktop dragging
- fixed window size across DPI changes and monitor moves

## Controls

- Drag the widget: hold the left mouse button on the clock.
- Open the menu: right-click the window.
- Pick a time zone: use `Time zone...` or click the time zone badge.
- Create another widget: `Add widget`.
- Lock the widget in place: `Pin widget`.
- Keep it above other windows: `Always on top`.

## Installation

Ready builds are published through GitHub Releases:

- MSI installer: `Clock Widget_2.0.0_x64_en-US.msi`
- portable archive: `ClockWidget-2.0.0-portable-win11.zip`

The portable build does not require installation: unzip it and run `ClockWidget.exe`.

## Start With Windows

1. Install the app or unzip the portable build to a permanent folder.
2. Press `Win + R`.
3. Type `shell:startup` and press Enter.
4. Add a shortcut to `Clock Widget.exe` or `ClockWidget.exe`.

## Run Locally

```powershell
cargo run
```

## Build

To build the full release assets on Windows:

```powershell
cargo install tauri-cli --version "^1" --locked
.\scripts\build-release-assets.ps1
```

The script creates the MSI and portable ZIP in `dist/`.

If you only need the MSI:

```powershell
cargo tauri build --bundles msi
```

If you only need the portable ZIP:

```powershell
.\scripts\build-portable-zip.ps1
```

## Development Requirements

- Windows 11
- Rust toolchain
- Tauri CLI 1.x
- Microsoft Edge WebView2 Runtime
- Visual Studio Build Tools 2022 with the C++ workload
- WiX Toolset for MSI builds

## Project Layout

- `src/index.html` - window and menu markup.
- `src/styles.css` - widget, menu, and time zone picker styles.
- `src/app.js` - window state, clock, time zones, and menu handlers.
- `src/main.rs` - Tauri bootstrap, window creation, and DPI size guards.
- `scripts/build-release-assets.ps1` - builds the MSI and portable ZIP.
- `scripts/build-portable-zip.ps1` - builds the portable ZIP.
- `.github/workflows/release.yml` - builds and publishes GitHub Release assets.

## Release Publishing

1. Update the version in `Cargo.toml` and `tauri.conf.json`.
2. Update `README.md` and `RELEASE_NOTES.md`.
3. Create a tag such as `v2.0.0`.
4. Push `main` and the tag to GitHub.

GitHub Actions will build the Windows assets and attach them to the GitHub Release.

## License

MIT. See [LICENSE](LICENSE).
