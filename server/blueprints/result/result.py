"""Result Blueprint."""
import os
from flask import Blueprint, render_template, url_for, jsonify, request
from server.helper import log_cmd
from server.enrich import main
from werkzeug.utils import secure_filename
import json
import time
import math

def get_enrichment_stats(ontology_summary):
    subj_num = 0
    trip_num = 0
    for subj in ontology_summary:
        if ontology_summary[subj]['enriched']:
            subj_num += 1
            for pred in ontology_summary[subj]['predicates']:
                for obj in ontology_summary[subj]['predicates'][pred]['objects']:
                    if ontology_summary[subj]['predicates'][pred]['objects'][obj]['added']:
                        trip_num += 1
    enrichment_stats = {
        "subj_num": subj_num,
        "trip_num": trip_num
    }
    return enrichment_stats

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


@result_handler.route('/enrich', methods=['POST'])
def enrich():
    log_cmd('Requested enrich', 'green')
    ttl_file = request.files['ttl']
    params_file = request.files['params']
    prom = params_file.read()
    params = json.loads(prom.decode('utf8'))
    config = {
        "input_file": ttl_file,
        "link_type": params['kg'],
        "predicate": params['pred'],
    }
    #ont, enr_stats, ont_stats, subs_data, ontology_summary = main(options, ont_query)
    start = time.time()
    enriched_ontology, ontology_stats, ontology_summary, enrichment_warns_num = main('options.json', config)
    end = time.time()
    enrichment_stats = get_enrichment_stats(ontology_summary)
    result_dict = {
        "enriched_ontology": enriched_ontology.decode('utf8'),
        "enrichment_time": math.ceil(end - start),
        "enrichment_warns_num": enrichment_warns_num,
        "ontology_stats": ontology_stats,
        "ontology_summary": ontology_summary,
        "enrichment_stats": enrichment_stats,
    }
    #print(result_dict['ontology_summary']['https://w3id.org/i40/sto#IEC_42010']['added'])
    return jsonify(result_dict)
