"""Enrichment Blueprint."""
from flask import Blueprint, render_template, url_for, jsonify
from server.helper import log_cmd

enrichment_handler = Blueprint(name='enrichment',
                            import_name=__name__,
                            template_folder='',
                            static_folder='')

@enrichment_handler.route('/', methods=['GET'])
def index():
    """Render enrichment page."""
    log_cmd('Requested enrichment.index', 'green')
    return render_template('enrichment.html',
                           page_title='Enrichment',
                           local_css='enrichment.css',
                           )

@enrichment_handler.route('/data', methods=['GET'])
def get_enrichment_data():
    """ """
    log_cmd('Requested enrichment data', 'green')
    return jsonify({})
