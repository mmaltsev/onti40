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

@wheel_handler.route('/', methods=['GET'])
def index():
    """Render wheel page."""
    log_cmd('Requested wheel.index', 'green')
    return render_template('wheel.html',
                           page_title='Wheel',
                           local_css='wheel.css',
                           )

@wheel_handler.route('/data', methods=['GET'])
def get_wheel_data():
    """ """
    log_cmd('Requested wheel data', 'green')
    #mtx = [
    #    [0, 1, 1, 1, 1, 1],
    #    [1, 0, 0, 0, 0, 0],
    #    [1, 0, 0, 0, 0, 0],
    #    [1, 0, 0, 0, 0, 0],
    #    [1, 0, 0, 0, 0, 0],
    #    [1, 0, 0, 0, 0, 0],
    #]
    #names = ['1', '2', '3', '4', '5', '6']
    #colors = ['gray', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue']
    ont_query = '''
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?pred WHERE {
            sto:IEC_62541 ?pred ?obj .
        }
    '''
    names = fetch_sto_data(ont_query, ['preds'])['preds']
    names.insert(0, 'sto:IEC_62541')
    elem_num = len(names) + 1
    np_mtx = np.zeros((elem_num, elem_num)).astype(int)
    np_mtx[:, 0] = np.ones(elem_num)
    #np_mtx[0, :] = np.ones(elem_num)
    #np_mtx[0, 0] = 0
    #colors = np.chararray(pred_num, itemsize=5)
    colors = ['gray'] * elem_num
    colors[0] = 'lightblue'
    colors[5] = 'lightgray'
    colors[6] = 'lightgray'
    colors[7] = 'lightgray'
    colors[12] = 'lightgray'
    colors[17] = 'lightgray'
    colors[18] = 'lightgray'
    colors[19] = 'lightgray'
    colors[22] = 'lightgray'
    return jsonify({'mtx': np_mtx.tolist(), 'names': names, 'colors': colors})
