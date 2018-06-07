"""Overview Blueprint."""
from flask import Blueprint, render_template, url_for, jsonify
from server.helper import log_cmd
from .sto_data import standards

overview_handler = Blueprint(name='overview',
                            import_name=__name__,
                            template_folder='',
                            static_folder='')


@overview_handler.route('/', methods=['GET'])
def index():
    """Render overview page."""
    log_cmd('Requested overview.index', 'green')
    return render_template('overview.html',
                           page_title='Overview',
                           local_css='overview.css',
                           )

@overview_handler.route('/standards_list', methods=['GET'])
def standards_list():
    """ """
    log_cmd('Requested standards_list', 'green')
    return jsonify({ 'standards': standards() })
