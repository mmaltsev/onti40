@ECHO OFF
setlocal EnableDelayedExpansion

set action_type=%1
set blueprint_name=%2
if "%action_type%"=="add" (
    call :FirstUp result %blueprint_name%
    set blueprint_name_camel=%result%
    set blueprint_path=server\blueprints\%blueprint_name%
    echo.%blueprint_path%
    if not exist "%blueprint_path%" (
        :: Creating new blueprint structure ::
        mkdir %blueprint_path%
        echo. >%blueprint_path%\__init__.py
        echo. >%blueprint_path%\%blueprint_name%.py
        echo. >%blueprint_path%\%blueprint_name%.css
        echo. >%blueprint_path%\%blueprint_name%.html

        :: Filling new blueprint ::
        echo.from .%blueprint_name% import %blueprint_name%_handler> %blueprint_path%\__init__.py
        (
            echo."""%blueprint_name_camel% Blueprint."""
            echo.from flask import Blueprint, render_template, url_for
            echo.
            echo.%blueprint_name%_handler = Blueprint(name='%blueprint_name%',
            echo.                        import_name=__name__,
            echo.                        template_folder='',
            echo.                        static_folder=''^)
            echo.
            echo.
            echo.@%blueprint_name%_handler.route('/', methods=['GET']^)
            echo.def index(^):
            echo.    """Render %blueprint_name_camel% page."""
            echo.    log_cmd('Requested %blueprint_name%.index', 'green'^)
            echo.    return render_template('%blueprint_name%.html',
            echo.                           page_title='%blueprint_name_camel%',
            echo.                           local_css='%blueprint_name%.css',
            echo.                           ^)
            echo.
        )>%blueprint_path%\%blueprint_name%.py
        (
            echo.{%% extends "app.html" %%}
            echo.{%% block content %%}
            echo.
            echo.^<h1^>%blueprint_name_camel% blueprint^</h1^>
            echo.
            echo.{%% endblock %%}
        )>%blueprint_path%\%blueprint_name%.html

        findstr /v "]" server\config.py > server\config_temp.py
        type server\config_temp.py > server\config.py
        del server\config_temp.py
        (
            echo.    "%blueprint_name%",
            echo.]
        )>>server\config.py

    ) else (
        echo.A blueprint with this name is already in the project.
    )
)

if "%action_type%"=="del" (
    @RD /S /Q server\blueprints\%blueprint_name%
    findstr /v "%blueprint_name%" server\config.py > server\config_temp.py
    type server\config_temp.py > server\config.py
    del server\config_temp.py
)


:: Making the first letter of the string capital ::
:FirstUp
setlocal EnableDelayedExpansion
set "temp=%~2"
set "helper=##AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRSSTTUUVVWWXXYYZZ"
set "first=!helper:*%temp:~0,1%=!"
set "first=!first:~0,1!"
if "!first!"=="#" set "first=!temp:~0,1!"
set "temp=!first!!temp:~1!"
(
    endlocal
    set "result=%temp%"
    goto :eof
)

ECHO ON