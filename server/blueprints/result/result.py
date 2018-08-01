"""Result Blueprint."""
import os
from flask import Blueprint, render_template, url_for, jsonify, request
from server.helper import log_cmd
from werkzeug.utils import secure_filename

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

@result_handler.route('/file', methods=['POST'])
def result_file():
    """ """
    log_cmd('Requested file result', 'green')
    current_path = os.path.dirname(os.path.abspath(__file__))
    result_folder = 'files'
    result_path = os.path.join(current_path, result_folder)
    file = request.files['file']
    filename = secure_filename(file.filename)
    file.save(os.path.join(result_path, filename))
    return 'success'
