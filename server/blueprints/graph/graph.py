"""Graph Blueprint."""
from flask import Blueprint, render_template, url_for, jsonify, request
from server.helper import log_cmd
from server.landscape import Ontology
from server.datafetch import fetch_sto_data
import json

def set_prefix(name, prefixes):
    for prefix in prefixes:
        if name.find(prefix) > -1:
            name = name.replace(prefix, prefixes[prefix] + ':')
            return name

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
    subjs = {}
    for key in subs_data:
        subjs[key] = None
    ind = 0
    cl_data = []

    for subj, pred, obj in ont.graph:
        subj_name = str(subj)
        if subjs[subj_name] != None:
            subj_id = subjs[subj_name]
        else:
            subj_id = ind
            subjs[subj_name] = subj_id
            ind += 1
            subj_name_short = set_prefix(subj_name, prefixes)
            cl_subj = {
                "data": {
                  "id": str(subj_id),
                  "idInt": subj_id,
                  "name": subj_name_short,
                  "score": 0.1,
                  "group": "default",
                },
                "group": "nodes"
            }
            cl_data.append(cl_subj)

        obj_name = str(obj)
        if obj in subjs:
            if subjs[obj_name]:
                obj_id = subjs[obj_name]
            else:
                obj_id = ind
                subjs[obj_name] = obj_id
                ind += 1
                obj_name_short = set_prefix(obj_name, prefixes)
                cl_obj = {
                    "data": {
                      "id": str(obj_id),
                      "idInt": obj_id,
                      "name": obj_name_short,
                      "score": 0.1,
                      "group": "default",
                    },
                    "group": "nodes"
                }
            cl_data.append(cl_obj)
        else:
            obj_name = type(obj).__name__
            obj_id = ind
            ind += 1
            obj_name_short = set_prefix(obj_name, prefixes)
            cl_obj = {
                "data": {
                  "id": str(obj_id),
                  "idInt": obj_id,
                  "name": obj_name_short,
                  "score": 0.1,
                  "group": "default",
                },
                "group": "nodes"
            }
            cl_data.append(cl_obj)

        pred_name = str(pred)
        cl_pred = {
            "data": {
              "source": str(subj_id),
              "target": str(obj_id),
              "weight": 0.1,
              "label": pred_name,
              "group": "default",
            },
            "group": "edges"
        }
        cl_data.append(cl_pred)
    return jsonify({"cl_data": cl_data})
