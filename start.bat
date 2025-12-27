@echo off
chcp 65001 >nul
title Carti Merch Store - Запуск
color 0A

echo ============================================
echo   Carti Merch Store - Автоматический запуск
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Проверка Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Node.js не найден!
    echo.
    echo Пожалуйста, установите Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

node --version
echo.

echo [2/4] Установка зависимостей Backend...
cd backend
if not exist node_modules (
    echo Установка npm пакетов для backend...
    call npm install
    if errorlevel 1 (
        echo [ОШИБКА] Не удалось установить зависимости backend
        pause
        exit /b 1
    )
) else (
    echo Зависимости backend уже установлены
)
echo.

echo [3/4] Установка зависимостей Frontend...
cd ..\frontend
if not exist node_modules (
    echo Установка npm пакетов для frontend...
    call npm install
    if errorlevel 1 (
        echo [ОШИБКА] Не удалось установить зависимости frontend
        pause
        exit /b 1
    )
) else (
    echo Зависимости frontend уже установлены
)
echo.

echo [4/4] Запуск серверов...
echo.
echo ============================================
echo   Запускаю Backend и Frontend...
echo ============================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Нажмите Ctrl+C для остановки серверов
echo ============================================
echo.

cd ..\backend
start "Backend Server" cmd /k "npm start"

timeout /t 3 /nobreak >nul

cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Серверы запущены в отдельных окнах!
echo.
echo Откройте браузер и перейдите на:
echo http://localhost:5173
echo.
pause

