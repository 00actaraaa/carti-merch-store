# Инструкция по подключению к GitHub

## Шаг 1: Создайте репозиторий на GitHub
1. Перейдите на https://github.com/new
2. Введите название репозитория (например: `carti-merch-store`)
3. Выберите публичный или приватный
4. **НЕ** добавляйте README, .gitignore или лицензию
5. Нажмите "Create repository"

## Шаг 2: Подключите локальный репозиторий

После создания репозитория выполните команды (замените URL на ваш):

```bash
git remote add origin https://github.com/ВАШ_USERNAME/НАЗВАНИЕ_РЕПОЗИТОРИЯ.git
git branch -M main
git push -u origin main
```

Или если ваш репозиторий использует SSH:
```bash
git remote add origin git@github.com:ВАШ_USERNAME/НАЗВАНИЕ_РЕПОЗИТОРИЯ.git
git branch -M main
git push -u origin main
```

## Альтернатива: Если репозиторий уже создан

Просто пришлите URL репозитория, и я подключу его автоматически.

