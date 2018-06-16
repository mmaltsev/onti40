"""Validation Blueprint."""
from flask import Blueprint, render_template, url_for, jsonify
from server.helper import log_cmd
import os

THIS_FILE_PATH = os.path.abspath(__file__)
STATIC_DIR = os.path.dirname(THIS_FILE_PATH)
#CONTENT_DIR = os.path.join(STATIC_DIR, 'content')

validation_handler = Blueprint(name='validation',
                            import_name=__name__,
                            template_folder='',
                            static_folder='')

@validation_handler.route('/', methods=['GET'])
def index():
    """Render validation page."""
    log_cmd('Requested validation.index', 'green')
    return render_template('validation.html',
                           page_title='Validation',
                           local_css='validation.css',
                           )


@validation_handler.route('/template', methods=['GET'])
def get_standards():
    """ """
    log_cmd('Requested SHACL template', 'green')
    with open(os.path.join(STATIC_DIR, 'template.ttl'), 'r') as f:
        template = f.read()
    return template
