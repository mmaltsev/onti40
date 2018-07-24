"""Wheel Blueprint."""
from flask import Blueprint, render_template, url_for, jsonify
from server.helper import log_cmd
from server.landscape import Ontology
from server.datafetch import fetch_sto_data
import numpy as np

wheel_handler = Blueprint(name='wheel',
                            import_name=__name__,
                            template_folder='',
                            static_folder='')

def get_sto_subs():
    query = '''
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?sub WHERE {
            ?sub rdf:type ?stand .
            FILTER (?stand IN (sto:Standard, sto:StandardOrganization))
        }
    '''
    return fetch_sto_data(query, ['sub'])['sub']

@wheel_handler.route('/', methods=['GET'])
def index():
    """Render wheel page."""
    log_cmd('Requested wheel.index', 'green')
    #options = get_sto_subs()
    return render_template('wheel.html',
                           page_title='Wheel',
                           local_css='wheel.css',
                           #options = options,
                           )

@wheel_handler.route('/data', methods=['GET'])
def get_wheel_data():
    """ """
    log_cmd('Requested wheel data', 'green')
    #ont_query = '''
    #    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    #    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    #    PREFIX sto: <https://w3id.org/i40/sto#>
    #    SELECT ?pred WHERE {
    #        sto:IEC_62541 ?pred ?obj .
    #    }
    #'''
    #names = fetch_sto_data(ont_query, ['preds'])['preds']
    #names.insert(0, 'sto:IEC_62541')
    #elem_num = len(names) + 1
    #np_mtx = np.zeros((elem_num, elem_num)).astype(int)
    #np_mtx[:, 0] = np.ones(elem_num)
    #colors = ['gray'] * elem_num
    names = ['sto:IEC_62541', 'rdf:type', 'dcterms:hasLicense', 'sto:hasClassification', 'sto:hasDeveloper', 'dcterms:subject', 'sto:hasDomain', 'sto:hasPublisher', 'sto:relatedTo', 'sto:useStructureOf', 'sto:hasDBpediaResource', 'sto:hasOfficialResource', 'sto:hasTag', 'sto:hasWikipediaArticle', 'dcterms:hasLicense', 'lingg:hypernym', 'rdfs:comment', 'rdfs:label']
    colors = ['gray', 'lightblue', 'lightgray', 'lightgray', 'lightgray', 'lightgreen', 'lightgray', 'lightgray', 'lightblue', 'lightgreen', 'lightsalmon', 'lightsalmon', 'lightgray', 'lightsalmon', 'lightgray', 'lightgreen', 'lightblue', 'lightgray']
    mtx = np.zeros((len(names), len(names))).astype(int)
    mtx[:, 0] = np.ones(len(names))

    return jsonify({'mtx': mtx.tolist(), 'names': names, 'colors': colors})
