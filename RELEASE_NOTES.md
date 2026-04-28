# Clock Widget 2.0.0 Release Notes

## Русский

Версия `2.0.0` - технический релиз, который подготавливает проект к нормальной публикации через GitHub Releases. Пользовательские возможности из `1.0.0` сохранены, а основная работа сделана вокруг структуры проекта, сборки и поддержки релизов.

### Что изменилось после 1.0.0

- Убраны внешние тени вокруг виджета во всех визуальных режимах.
- Размер окна теперь фиксируется в физических пикселях, чтобы при переносе между мониторами с разным DPI/разрешением виджет не пересчитывался в другой размер.
- Разделён монолитный `src/index.html`: стили вынесены в `src/styles.css`, логика окна и меню - в `src/app.js`.
- Обновлены метаданные пакета до `2.0.0`, добавлена ссылка на репозиторий в `Cargo.toml`.
- Добавлен скрипт `scripts/build-release-assets.ps1`, который собирает MSI и portable ZIP в `dist/`.
- Добавлен GitHub Actions workflow для сборки Windows assets и публикации их в GitHub Release.
- Расширен `.gitignore`: build output, release artifacts, local preview files, package-manager cache, env/log/temp файлы.
- Portable ZIP теперь включает `LICENSE.txt`.
- В сборочных PowerShell-скриптах добавлена явная проверка exit code после native-команд.
- Добавлены базовые Rust-тесты для констант и helper-логики фиксированного размера окна.
- Локальный `src/preview.html` убран из исходников релиза и добавлен в ignore.
- Обновлён README: актуальная структура файлов, команды сборки, установка, управление и публикация релиза.

### Для пользователей

Если у тебя уже была версия `1.0.0`, настройки виджетов должны остаться локально в WebView. Формат пользовательских настроек не менялся.

### Файлы релиза

- `Clock.Widget_2.0.0_x64_en-US.msi`
- `ClockWidget-2.0.0-portable-win11.zip`

## English

Version `2.0.0` is a technical release that prepares the project for proper GitHub Releases publishing. User-facing features from `1.0.0` remain in place; most of the work is in project structure, build scripts, and release maintenance.

### What Changed Since 1.0.0

- Removed outer widget shadows in all visual modes.
- The window size is now fixed in physical pixels so moving the widget between monitors with different DPI/resolution does not resize it.
- Split the monolithic `src/index.html`: styles now live in `src/styles.css`, window/menu logic now lives in `src/app.js`.
- Updated package metadata to `2.0.0` and added the repository URL to `Cargo.toml`.
- Added `scripts/build-release-assets.ps1` to build both the MSI and portable ZIP into `dist/`.
- Added a GitHub Actions workflow for building Windows assets and publishing them to GitHub Releases.
- Expanded `.gitignore` for build output, release artifacts, local preview files, package-manager cache, env/log/temp files.
- Portable ZIP now includes `LICENSE.txt`.
- Build PowerShell scripts now check native command exit codes explicitly.
- Added basic Rust tests for fixed-size window constants and helper logic.
- Removed the local `src/preview.html` file from release sources and added it to ignore.
- Updated README with the current file layout, build commands, installation notes, controls, and release publishing flow.

### For Users

If you already used version `1.0.0`, widget settings should remain in the local WebView storage. The user settings format did not change.

### Release Files

- `Clock.Widget_2.0.0_x64_en-US.msi`
- `ClockWidget-2.0.0-portable-win11.zip`
