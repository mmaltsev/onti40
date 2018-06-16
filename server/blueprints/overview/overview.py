"""Overview Blueprint."""
from flask import Blueprint, render_template, url_for, jsonify
from server.helper import log_cmd
from .sto_data import standards, standard_organizations, sto_properties

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

@overview_handler.route('/standards', methods=['GET'])
def get_standards():
    """ """
    log_cmd('Requested standards', 'green')
    return jsonify(standards())
    
@overview_handler.route('/standard-organizations', methods=['GET'])
def get_standard_organizations():
    """ """
    log_cmd('Requested standard-organizations', 'green')
    return jsonify(standard_organizations())

@overview_handler.route('/sto-properties', methods=['GET'])
def get_sto_properties():
    """ """
    log_cmd('Requested sto-properties', 'green')
    return jsonify(sto_properties())
