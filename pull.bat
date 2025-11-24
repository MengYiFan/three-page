@echo off
chcp 936>nul 2>&1
cd /d "%~dp0"
cls

echo ==============================================
echo 当前Git仓库状态：
echo ----------------------------------------------
git branch --show-current
echo ----------------------------------------------
git status --short
echo ==============================================
echo.

echo 正在拉取远程代码（origin/main）...
echo ----------------------------------------------
git pull origin main
echo ----------------------------------------------
echo.

echo 操作完成！5秒后自动关闭窗口（按Ctrl+C可取消关闭）...
timeout /t 5 /nobreak >nul
exit