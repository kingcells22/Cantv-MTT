@echo off
chcp 65001 >nul
title CANTV SINCOMTT - Publicador Oficial a GitHub (origin)
color 0A

echo ================================================================================
echo   CANTV SINCOMTT - PUBLICADOR OFICIAL A GITHUB EMPRESARIAL
echo   Destino: origin (feature/frontend-react19)
echo ================================================================================
echo.

set OFFICIAL_BRANCH=feature/frontend-react19

:: 0. Asegurar que origin apunte a CANTV oficial y personal a tu repo privado
for /f "tokens=*" %%u in ('git remote get-url origin 2^>nul') do set ORIGIN_URL=%%u
echo %ORIGIN_URL% | findstr /i "cantv-mtt-workspace" >nul
if %errorlevel% equ 0 (
    git remote rename origin personal >nul 2>&1
    git remote add origin https://github.com/kingcells22/Cantv-MTT.git >nul 2>&1
)

:: 1. Cambiar a la rama oficial si estamos en otra rama
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%a

if not "%CURRENT_BRANCH%"=="%OFFICIAL_BRANCH%" (
    echo [1/4] Cambiando desde '%CURRENT_BRANCH%' a rama oficial '%OFFICIAL_BRANCH%'...
    git add -A >nul 2>&1
    git commit -m "sync: autoguardado previo a publicacion" >nul 2>&1
    git checkout %OFFICIAL_BRANCH%
    echo [2/4] Fusionando avances de codigo desde '%CURRENT_BRANCH%'...
    git merge %CURRENT_BRANCH% -m "merge: integracion de avances hacia rama oficial" --no-edit
) else (
    echo [1/4] Ya te encuentras en la rama oficial '%OFFICIAL_BRANCH%'.
)

:: 2. Blindaje de seguridad defensivo (Des-indexar carpetas privadas)
echo [2/4] Verificando blindaje de .gitignore...
git rm --cached -r .agents Agents Workflow Datos_del_Proyecto AGENTS.md SESSION_CONTEXT.md SESSION_HILO.md sync_laptop.sh publish_official.sh publish_official.bat >nul 2>&1

:: 3. Preparar commit
echo [3/4] Preparando cambios de codigo...
git add .
git add .gitignore

set /p USER_MSG="Ingrese descripcion del commit (ENTER para automatico): "
if "%USER_MSG%"=="" (
    set COMMIT_MSG=feat(release): actualizacion oficial del sistema SINCOMTT
) else (
    set COMMIT_MSG=%USER_MSG%
)

git commit -m "%COMMIT_MSG%" >nul 2>&1

:: 4. Publicar
echo [4/4] Publicando hacia GitHub CANTV (origin)...
git push origin %OFFICIAL_BRANCH%

if %errorlevel% equ 0 (
    echo.
    echo ================================================================================
    echo   PUBLICACION OFICIAL COMPLETADA EXITOSAMENTE
    echo   Destino: https://github.com/kingcells22/Cantv-MTT.git
    echo   El codigo productivo ya fue actualizado para Soporte-IT y Kenny Navarro.
    echo ================================================================================
) else (
    echo.
    echo [ERROR] Hubo un problema al publicar. Verifique su conexion o credenciales.
)

echo.
pause

