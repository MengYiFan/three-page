@echo off
:: 自动切换到脚本所在的本地目录（无需手动设置路径）
cd /d "%~dp0"

:: 执行 git pull（默认拉取当前分支对应的远程分支，无需写 origin main）
git pull

:: 执行完成后自动关闭窗口
exit