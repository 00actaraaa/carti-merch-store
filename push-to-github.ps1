# Скрипт для отправки кода на GitHub
# Запустите этот скрипт в PowerShell с правами администратора или в терминале где доступен Git

Write-Host "Подключение к GitHub..." -ForegroundColor Green

# Перейти в папку проекта
Set-Location "C:\Users\antip\Documents\carti merch store"

# Проверить наличие Git
try {
    $gitVersion = git --version
    Write-Host "Git найден: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ОШИБКА: Git не найден в PATH!" -ForegroundColor Red
    Write-Host "Установите Git или добавьте его в PATH" -ForegroundColor Yellow
    exit 1
}

# Проверить статус репозитория
Write-Host "`nПроверка статуса репозитория..." -ForegroundColor Cyan
git status

# Переименовать ветку в main (если нужно)
Write-Host "`nПереименование ветки в main..." -ForegroundColor Cyan
git branch -M main

# Проверить remote
Write-Host "`nПроверка удаленного репозитория..." -ForegroundColor Cyan
git remote -v

# Отправить код на GitHub
Write-Host "`nОтправка кода на GitHub..." -ForegroundColor Cyan
Write-Host "ВНИМАНИЕ: Может потребоваться аутентификация (токен или SSH ключ)" -ForegroundColor Yellow

try {
    git push -u origin main
    Write-Host "`nУСПЕХ! Код отправлен на GitHub!" -ForegroundColor Green
} catch {
    Write-Host "`nОШИБКА при отправке:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nВозможные решения:" -ForegroundColor Yellow
    Write-Host "1. Создайте Personal Access Token на https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. Используйте токен вместо пароля при запросе" -ForegroundColor White
    Write-Host "3. Или настройте SSH ключи для GitHub" -ForegroundColor White
}

Write-Host "`nГотово!" -ForegroundColor Green

