#!/bin/bash

echo "============================================"
echo "  Carti Merch Store - Автоматический запуск"
echo "============================================"
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "[ОШИБКА] Node.js не найден!"
    echo ""
    echo "Пожалуйста, установите Node.js:"
    echo "https://nodejs.org/"
    echo ""
    exit 1
fi

echo "[1/4] Проверка Node.js..."
node --version
echo ""

# Установка зависимостей Backend
echo "[2/4] Установка зависимостей Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Установка npm пакетов для backend..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ОШИБКА] Не удалось установить зависимости backend"
        exit 1
    fi
else
    echo "Зависимости backend уже установлены"
fi
echo ""

# Установка зависимостей Frontend
echo "[3/4] Установка зависимостей Frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Установка npm пакетов для frontend..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ОШИБКА] Не удалось установить зависимости frontend"
        exit 1
    fi
else
    echo "Зависимости frontend уже установлены"
fi
echo ""

# Запуск серверов
echo "[4/4] Запуск серверов..."
echo ""
echo "============================================"
echo "  Запускаю Backend и Frontend..."
echo "============================================"
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Нажмите Ctrl+C для остановки серверов"
echo "============================================"
echo ""

cd ../backend
npm start &
BACKEND_PID=$!

sleep 3

cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Серверы запущены!"
echo ""
echo "Откройте браузер и перейдите на:"
echo "http://localhost:5173"
echo ""
echo "Нажмите Ctrl+C для остановки"

# Ожидание прерывания
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

