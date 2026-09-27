@echo off
setlocal
chcp 65001 >nul
title Thailand DPP Hub - Run Git

rem ---------------------------------------------------------------
rem  rungit.bat - add + commit + push this folder to GitHub with one command
rem     REPO   : this folder (GitHub Pages, branch main)
rem     REMOTE : origin  (asked on first run if not set)
rem
rem  Usage:
rem     rungit.bat                        commit message = "update <date> <time>"
rem     rungit.bat "fix gantt"            commit message = "fix gantt"
rem     rungit.bat "first" <repo-url>     set origin to <repo-url>, then push
rem        e.g. rungit.bat "first commit" https://github.com/user/thailand-dpp-hub.git
rem ---------------------------------------------------------------

set "ROOT=%~dp0"
set "BRANCH=main"
set "MSG=%~1"
set "REMOTE=%~2"

where git >nul 2>&1 || (
  echo [ERROR] git not found in PATH.  Install it from https://git-scm.com
  goto :fail
)

cd /d "%ROOT%" || (
  echo [ERROR] Cannot open folder: %ROOT%
  goto :fail
)

echo.
echo === Thailand DPP Hub : push to GitHub ===
echo.

rem --- [1/4] init -------------------------------------------------
if exist ".git" (
  echo [1/4] REPO   -^> already initialized
) else (
  echo [1/4] REPO   -^> git init  ^(branch %BRANCH%^)
  git init -b %BRANCH% || goto :fail
)

rem --- [2/4] remote -----------------------------------------------
git remote get-url origin >nul 2>&1 && goto :has_remote

if "%REMOTE%"=="" set /p "REMOTE=      GitHub repo URL: "
if "%REMOTE%"=="" (
  echo [ERROR] No remote URL given.  Use: rungit.bat "message" ^<repo-url^>
  goto :fail
)
echo [2/4] REMOTE -^> add origin %REMOTE%
git remote add origin "%REMOTE%" || goto :fail
goto :commit

:has_remote
if "%REMOTE%"=="" (
  for /f "delims=" %%U in ('git remote get-url origin') do echo [2/4] REMOTE -^> %%U
) else (
  echo [2/4] REMOTE -^> set origin %REMOTE%
  git remote set-url origin "%REMOTE%" || goto :fail
)

rem --- [3/4] commit -----------------------------------------------
:commit
git add -A || goto :fail
git diff --cached --quiet && (
  echo [3/4] COMMIT -^> nothing to commit
  goto :push
)
if "%MSG%"=="" set "MSG=update %date% %time:~0,5%"
echo [3/4] COMMIT -^> "%MSG%"
git commit -q -m "%MSG%" || goto :fail

rem --- [4/4] push -------------------------------------------------
:push
echo [4/4] PUSH   -^> origin %BRANCH%
git push -u origin %BRANCH% || goto :fail

echo.
echo Done.  GitHub Pages will update in 1-2 minutes.
echo.
endlocal
exit /b 0

:fail
echo.
echo Git run aborted.
echo.
endlocal
pause
exit /b 1
