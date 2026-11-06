@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ==========================================
echo   RealTTS 多语言静态页生成
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 没有找到 Node.js，请先安装 Node.js 再运行本脚本。
  echo        下载地址：https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "build\node_modules\linkedom" (
  echo [1/2] 首次运行，正在安装依赖，请稍候...
  pushd build
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    popd
    echo.
    echo [错误] 依赖安装失败，请检查网络后重试。
    echo.
    pause
    exit /b 1
  )
  popd
  echo.
)

echo [2/2] 正在生成 8 个语言页面和 sitemap.xml ...
node build\i18n.mjs
if errorlevel 1 (
  echo.
  echo [错误] 生成失败，请把上面的报错信息发给 Qoder 处理。
  echo.
  pause
  exit /b 1
)

echo.
echo 生成完成：en / ja / ko / ru / es / pt / ar / zh-TW
echo.
where git >nul 2>nul
if not errorlevel 1 (
  echo 当前有改动的文件：
  git status --short
  echo.
)

echo 提醒：确认无误后提交并推送，Vercel 才会发布新页面。
echo.
pause
