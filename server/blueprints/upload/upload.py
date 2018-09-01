"""Upload Blueprint."""
import os
from flask import Blueprint, render_template, url_for, jsonify, request
from server.helper import log_cmd
from werkzeug.utils import secure_filename
import time
import json

upload_handler = Blueprint(name='upload',
                            import_name=__name__,
                            template_folder='',
                            static_folder='')

@upload_handler.route('/', methods=['GET'])
def index():
    """Render upload page."""
    log_cmd('Requested upload.index', 'green')
    return render_template('upload.html',
                           page_title='Upload',
                           local_css='upload.css',
                           )

@upload_handler.route('/file', methods=['POST'])
def upload_file():
    """ """
    log_cmd('Requested file upload', 'green')
    current_path = os.path.dirname(os.path.abspath(__file__))
    upload_folder = 'files'
    upload_path = os.path.join(current_path, upload_folder)
    file = request.files['file']
    filename = secure_filename(file.filename) + str(int(time.time()))
    file.save(os.path.join(upload_path, filename))
    return jsonify({ 'filename': filename })
