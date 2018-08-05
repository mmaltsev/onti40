"""Result Blueprint."""
import os
from flask import Blueprint, render_template, url_for, jsonify, request
from server.helper import log_cmd
from server.enrich import main_upload
from werkzeug.utils import secure_filename
import json

result_handler = Blueprint(name='result',
                            import_name=__name__,
                            template_folder='',
                            static_folder='')

@result_handler.route('/', methods=['GET'])
def index():
    """Render result page."""
    log_cmd('Requested result.index', 'green')
    return render_template('result.html',
                           page_title='Result',
                           local_css='result.css',
                           )


@result_handler.route('/enrich', methods=['POST'])
def enrich():
    log_cmd('Requested enrich', 'green')
    ttl_file = request.files['ttl']
    params_file = request.files['params']
    prom = params_file.read()
    params = json.loads(prom.decode('utf8'))
    result_dict = {
        "format": "ttl",
        "enriched_ttl": main_upload(ttl_file, params).decode('utf8')
    }
    return jsonify(result_dict)
