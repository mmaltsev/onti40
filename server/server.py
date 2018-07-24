"""File that contains the endpoints for the app."""
import importlib
import logging
import traceback
from gevent.pywsgi import WSGIServer
from flask import (Flask, Response, jsonify, redirect, render_template, request,
                   send_from_directory, url_for)
from server.config import CONFIG, BLUEPRINTS
from server.helper import log_cmd, module_import


def create_app_without_blueprints():
    """Configure the app w.r.t. everything except Blueprints."""
    app = Flask(__name__,
                instance_relative_config=True,
                static_folder='app',
                static_url_path='/app',
                template_folder='app')
    return app


def register_blueprints(app):
    """Initialize blueprints."""
    for blueprint in BLUEPRINTS:
        blueprint_module = module_import('server.blueprints.{}'.format(blueprint))
        handler_name = '{}_handler'.format(blueprint)
        handler = getattr(blueprint_module, handler_name)
        blueprint_url = "/{}".format(blueprint)
        app.register_blueprint(handler, url_prefix=blueprint_url)


def register_routes(app):
    """Register routes to the first blueprint from the BLUEPRINTS list."""
    @app.route("/")
    def index():
        init_blueprint = '{}.index'.format(BLUEPRINTS[0])
        return redirect(url_for(init_blueprint))


def create_app():
    """Configure the app w.r.t. Flask security, databases, loggers."""
    app = create_app_without_blueprints()
    register_blueprints(app)
    register_routes(app)
    return app


def main():
    """Main entry point of the app."""
    app = create_app()
    logger = logging.getLogger(__name__)
    try:
        http_server = WSGIServer((CONFIG['host'], CONFIG['port']),
                                 app,
                                 log=logging,
                                 error_log=logging)
        log_text = 'Server is running on {}:{}'.format(CONFIG['host'], CONFIG['port'])
        log_cmd(log_text, 'green')
        http_server.serve_forever()
    except Exception as exc:
        log_cmd('Error while launching the server', 'red')
        logger.error(exc)
        logger.exception(traceback.format_exc())
    finally:
        pass
