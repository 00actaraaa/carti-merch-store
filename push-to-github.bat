@echo off
echo Подключение к GitHub...
cd /d "C:\Users\antip\Documents\carti merch store"

echo.
echo Проверка Git...
git --version
if errorlevel 1 (
    echo ОШИБКА: Git не найден!
    echo Установите Git или добавьте его в PATH
    pause
    exit /b 1
)

echo.
echo Переименование ветки в main...
git branch -M main

echo.
echo Проверка удаленного репозитория...
git remote -v

echo.
echo Отправка кода на GitHub...
echo ВНИМАНИЕ: Может потребоваться аутентификация (токен или SSH ключ)
git push -u origin main

if errorlevel 1 (
    echo.
    echo ОШИБКА при отправке!
    echo.
    echo Возможные решения:
    echo 1. Создайте Personal Access Token на https://github.com/settings/tokens
    echo 2. Используйте токен вместо пароля при запросе
    echo 3. Или настройте SSH ключи для GitHub
) else (
    echo.
    echo УСПЕХ! Код отправлен на GitHub!
)

pause

