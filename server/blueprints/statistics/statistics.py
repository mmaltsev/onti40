"""Statistics Blueprint."""
from flask import Blueprint, render_template, url_for, jsonify
from server.helper import log_cmd

statistics_handler = Blueprint(name='statistics',
                            import_name=__name__,
                            template_folder='',
                            static_folder='')

@statistics_handler.route('/', methods=['GET'])
def index():
    """Render statistics page."""
    log_cmd('Requested statistics.index', 'green')
    return render_template('statistics.html',
                           page_title='Statistics',
                           local_css='statistics.css',
                           )

@statistics_handler.route('/data', methods=['GET'])
def get_statistics_data():
    """ """
    log_cmd('Requested statistics data', 'green')
    return jsonify({})
