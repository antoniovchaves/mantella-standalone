@echo off
setlocal

set ROOT=%~dp0
set CHARS_SRC=%ROOT%experiment\characters
set OVERRIDE_DEST=%USERPROFILE%\Documents\My Games\Mantella\data\Skyrim\character_overrides

echo.
echo === Mantella Standalone - Experiment Setup ===
echo.

:: Passo 1: criar pasta de destino se nao existir
if not exist "%OVERRIDE_DEST%" (
    mkdir "%OVERRIDE_DEST%"
    echo [OK] Pasta de overrides criada: %OVERRIDE_DEST%
) else (
    echo [OK] Pasta de overrides ja existe: %OVERRIDE_DEST%
)

:: Passo 2: copiar william.json
copy /Y "%CHARS_SRC%\william.json" "%OVERRIDE_DEST%\william.json" >nul
echo [OK] william.json copiado para overrides.

:: Passo 3: copiar arnold.json
copy /Y "%CHARS_SRC%\arnold.json" "%OVERRIDE_DEST%\arnold.json" >nul
echo [OK] arnold.json copiado para overrides.

echo.
echo === Personagens instalados com sucesso! ===
echo     William e Arnold estao prontos em:
echo     %OVERRIDE_DEST%
echo.
pause
