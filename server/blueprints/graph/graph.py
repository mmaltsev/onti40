"""Graph Blueprint."""
from flask import Blueprint, render_template, url_for, jsonify, request
from server.helper import log_cmd
from server.landscape import Ontology
from server.datafetch import fetch_sto_data
import json
from io import StringIO
import re
import random

def set_prefix(name, prefixes):
    for prefix in prefixes:
        if name.find(prefix) > -1:
            name = name.replace(prefix, prefixes[prefix] + ':')
            return name
    return name
    splited_name = name.split('#')
    if len(splited_name) == 1:
        splited_name = name.split('/')
    return splited_name[-1]

def get_id(ind):
    return str(ind), ind + 1

def get_cy_data(ont, subs_data, prefixes):
    subjs = {}
    for key in subs_data:
        subjs[key] = None
    ind = 0
    cy_data = []
    for subj, pred, obj in ont.graph:
        # print(type(subj), type(pred), type(obj))
        # print(subj, pred, obj)
        # print(str(subj), str(pred), str(obj))
        subj_name = str(subj)
        if subj_name in subjs and subjs[subj_name] != None:
            subj_id = subjs[subj_name]
        else:
            subj_id, ind = get_id(ind)
            subjs[subj_name] = subj_id
            ind += 1
            subj_name_short = set_prefix(subj_name, prefixes)
            cy_subj = {
                "data": {
                  "id": str(subj_id),
                  "name": subj_name_short,
                  "group": "subject",
                },
                "group": "nodes"
            }
            cy_data.append(cy_subj)

        obj_name = str(obj)
        is_subj = True
        if obj in subjs:
            if subjs[obj_name]:
                obj_id = subjs[obj_name]
            else:
                obj_id, ind = get_id(ind)
                subjs[obj_name] = obj_id
                ind += 1
                obj_name_short = set_prefix(obj_name, prefixes)
                cy_obj = {
                    "data": {
                      "id": str(obj_id),
                      "name": obj_name_short,
                      "group": "subject",
                    },
                    "group": "nodes"
                }
            cy_data.append(cy_obj)
        else:
            obj_name = type(obj).__name__
            obj_id, ind = get_id(ind)
            ind += 1
            is_subj = False
            cy_obj = {
                "data": {
                  "id": str(obj_id),
                  "name": obj_name,
                  "group": obj_name,
                },
                "group": "nodes"
            }
            cy_data.append(cy_obj)

        pred_name = set_prefix(str(pred), prefixes)
        cy_pred = {
            "data": {
              "source": str(subj_id),
              "target": str(obj_id),
              "label": pred_name,
              "group": "default",
            },
            "group": "edges"
        }
        cy_data.append(cy_pred)
    return cy_data, 'cy'

def get_sigma_data(ont, subs_data, prefixes):
    subjs = {}
    for key in subs_data:
        subjs[key] = None
    ind = 0
    graph_data = {
        'nodes': [],
        'edges': []
    }
    for subj, pred, obj in ont.graph:
        subj_name = str(subj)
        if subj_name not in subjs or subjs[subj_name] is None:
            subj_id, ind = get_id(ind)
            subj_data = {
                'id': 'n' + subj_id,
                'label': set_prefix(subj_name, prefixes),
                'x': random.random(),
                'y': random.random(),
                'size': 0.5,
                'color': '#555'
            }
            graph_data['nodes'].append(subj_data)
            subjs[subj_name] = subj_id

        if obj in subjs:
            obj_name = str(obj)
            if subjs[obj_name] is None:
                obj_id, ind = get_id(ind)
                obj_data = {
                    'id': 'n' + obj_id,
                    'label': set_prefix(obj_name, prefixes),
                    'x': random.random(),
                    'y': random.random(),
                    'size': 0.5,
                    'color': '#555'
                }
                subjs[obj_name] = obj_id
                graph_data['nodes'].append(obj_data)
            else:
                obj_id = subjs[obj_name]
        else:
            obj_id, ind = get_id(ind)
            obj_label = type(obj).__name__
            if obj_label == 'Literal':
                obj_color = '#75a3b2'
            elif obj_label == 'URIRef':
                obj_color = '#518191'
            else:
                obj_color = '#add8e6'
            obj_data = {
                'id': 'n' + obj_id,
                'label': type(obj).__name__,
                'x': random.random(),
                'y': random.random(),
                'size': 0.1,
                'color': obj_color
            }
            graph_data['nodes'].append(obj_data)

        pred_name = set_prefix(str(pred), prefixes)
        pred_id, ind = get_id(ind)
        pred_data = {
            'id': 'e' + pred_id,
            'source': 'n' + subj_id,
            'target': 'n' + obj_id,
            'size': 0.01,
            'color': '#ccc',
            'label': pred_name
        }
        graph_data['edges'].append(pred_data)
    return graph_data, 'sigma'


graph_handler = Blueprint(name='graph',
                            import_name=__name__,
                            template_folder='',
                            static_folder='')

@graph_handler.route('/', methods=['GET'])
def index():
    """Render graph page."""
    log_cmd('Requested graph.index', 'green')
    return render_template('graph.html',
                           page_title='Graph',
                           local_css='graph.css',
                           #options = options,
                           )

@graph_handler.route('/data', methods=['POST'])
def get_graph_data():
    """ """
    log_cmd('Requested graph data', 'green')

    enriched_ttl_file = request.files['enriched_ttl']
    subs_data_file = request.files['subs_data']
    prom_subs = subs_data_file.read()
    subs_data = json.loads(prom_subs.decode('utf8'))
    prefixes_file = request.files['prefixes']
    prom_prefixes = prefixes_file.read()
    prefixes = json.loads(prom_prefixes.decode('utf8'))
    ont = Ontology(enriched_ttl_file, 'Enriched Ontology')
    print('after')
    #graph_data, flag = get_cy_data(ont, subs_data)
    graph_data, flag = get_sigma_data(ont, subs_data, prefixes)
    return jsonify({"graph_data": graph_data, "flag": flag})
