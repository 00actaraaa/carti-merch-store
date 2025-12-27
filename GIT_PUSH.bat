@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo  Отправка кода на GitHub
echo ========================================
echo.
echo Проверка Git...
where git >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Git не найден в системе!
    echo.
    echo Пожалуйста, установите Git:
    echo https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

git --version
echo.
echo Переименование ветки в main...
git branch -M main
if errorlevel 1 (
    echo [ПРЕДУПРЕЖДЕНИЕ] Не удалось переименовать ветку
)

echo.
echo Проверка удаленного репозитория...
git remote -v
echo.

echo Отправка кода на GitHub...
echo.
echo [ВАЖНО] Если потребуется ввод пароля, используйте Personal Access Token
echo Создайте токен здесь: https://github.com/settings/tokens
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo [ОШИБКА] Не удалось отправить код
    echo ========================================
    echo.
    echo Возможные причины:
    echo 1. Нужна аутентификация (создайте токен)
    echo 2. Проблемы с сетью
    echo 3. Репозиторий не существует
    echo.
) else (
    echo.
    echo ========================================
    echo [УСПЕХ] Код отправлен на GitHub!
    echo ========================================
    echo.
    echo Репозиторий: https://github.com/00actaraaa/carti-merch-store
    echo.
)

pause

