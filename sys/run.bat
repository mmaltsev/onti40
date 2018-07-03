@ECHO OFF

IF "%1"=="setup" (
    :: installing conda environment from `dev_environment.yml` ::
    CALL conda env create --force -f dev_environment.yml
    )

:: exctracting environment name from `dev_environment.yml` ::
set /p texte=< dev_environment.yml
set env_name=%texte:~6,6%

:: running the server ::
CALL activate %env_name%
CALL python -c "from server import server; server.main()"

ECHO ON