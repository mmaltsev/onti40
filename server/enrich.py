"""Module for enlarging existing ontology based on knowledge from DBpedia.
"""

from server.landscape import Ontology, DBpedia
import json
import sys
import time
import math

def main_cmd(options_path):
    options = json.load(open(options_path))
    ont_query = """
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?sub ?dbPediaResource WHERE {
            ?sub sto:hasDBpediaResource ?dbPediaResource .
        }
    """
    ont, enr_stats, ont_stats, subs_data = main(options, ont_query)
    filename = get_filename(options["input_file"])
    full_filename = 'ttl/' + filename + '(enriched).ttl'
    print('...saving file as "' + full_filename + '"')
    ont_file = ont.export(full_filename)

def main_upload(ttl_file, params):
    options = {
        "input_file": ttl_file,
        "whitelist": [],
        "blacklist": [],
        "prefixes": []
    }
    ont_query = """
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?sub ?res WHERE {
            ?sub """ + params['pred'] + """ ?res .
        }
    """
    start = time.time()
    ont, enr_stats, ont_stats, subs_data = main(options, ont_query)
    end = time.time()
    enr_logs = {
        "enr_time": math.ceil(end - start)
    }
    return ont.export(None), enr_stats, enr_logs, ont_stats, subs_data

def ontology_stats(ont):
    stats_query = """
        SELECT (COUNT(?sub) as ?trip_num) (COUNT(DISTINCT ?sub) as ?sub_num) (COUNT(DISTINCT ?pred) as ?pred_num) (COUNT(DISTINCT ?obj) as ?obj_num)
        WHERE {
            ?sub ?pred ?obj .
        }
    """
    #ont = Ontology(ttl_file)
    ont_stats = {}
    for row in ont.query(stats_query):
        ont_stats['trip_num'] = int(row[0])
        ont_stats['subj_num'] = int(row[1])
        ont_stats['pred_num'] = int(row[2])
        ont_stats['obj_num'] = int(row[3])
    subs_data = {}
    subs_data_query = """
        SELECT ?sub ?pred WHERE {
            ?sub ?pred ?obj .
        }
    """
    for row in ont.query(subs_data_query):
        subject = str(row[0])
        predicate = str(row[1])
        if subject in subs_data:
            if predicate not in subs_data[subject]:
                subs_data[subject].append(predicate)
        else:
            subs_data[subject] = [predicate]
    return ont_stats, subs_data


def main(options, ont_query):
    """Main function.
    Describes abstract algorithm of the ontology enriching.
    """
    ont = Ontology(options["input_file"])
    ont_stats, subs_data = ontology_stats(ont)
    print('...starting enrichment process')
    total_added_triples_num = 0
    total_subj_num = 0
    updated = {}
    for row in ont.query(ont_query):
        subject = row[0]
        resource = get_resource(row[1])
        whitelist = ', '.join(options["whitelist"])

        dbpedia_query = 'SELECT ?pred ?obj WHERE {' + \
            '<http://dbpedia.org/resource/' + resource + '> ?pred ?obj . '
        if whitelist:
            dbpedia_query += 'FILTER(?pred IN (' + whitelist + '))'
        dbpedia_query += '}'
        
        dbpedia_result = DBpedia().query(dbpedia_query)

        print('/', sep=' ', end='', flush=True)
        ont = set_blacklist(ont, options["blacklist"])
        ont, added_triples_num, added_preds = enrich(ont, subject, dbpedia_result)
        updated[subject] = added_preds
        total_added_triples_num += added_triples_num
        total_subj_num += 1
    ont = set_prefixes(ont, options["prefixes"])
    print('') # for moving to the next line in the command line
    print('Enriched ' + str(total_subj_num) + ' subjects with ' + \
      str(total_added_triples_num) + ' triples.')
    enr_stats = {
        "subj_num": total_subj_num,
        "trip_num": total_added_triples_num,
        "updated": updated
    }
    return ont, enr_stats, ont_stats, subs_data


def enrich(ont, subject, dbpedia_result):
    """Enrichhment process wrapper.
    """
    
    added_triples_num = 0
    added_preds = []
    for triple in dbpedia_result:
        sub = { 'value': subject }
        pred = triple['pred']
        obj = triple['obj']
        # marking primary topic of dbpedia resource as wikipedia article in STO terms
        if pred['value'] == 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf' \
           and pred['value'].find('wikipedia.com'):
            pred['value'] = 'https://w3id.org/i40/sto#hasWikipediaArticle'
            obj['type'] = 'literal'
        # 'http://rdf.freebase.com/ns/' doesn't exist anymore
        if pred['value'] not in ont.blacklist and \
           obj['value'] != 'http://rdf.freebase.com/ns/':
            added_triples_num += ont.enrich(sub, pred, obj)
            if pred['value'] not in added_preds:
                added_preds.append(pred['value'])
    return ont, added_triples_num, added_preds


def get_filename(path):
    """Getter of file name from path.
    """
    full_file_name = path.split('/')[-1]
    file_name = full_file_name.split('.')[0]
    return file_name


def get_resource(row):
    """Getter of resource from STO query result row.
    """

    resource_split_list = row.split('/')
    resource = '/'.join(resource_split_list[4:])
    return resource
    

def set_blacklist(ont, blacklist):
    """Setter of ontology black list.
    Here all predicates that should be excluded while fetching data from DPpedia are specified.
    """

    for url in blacklist:
        ont.blacklist.add(url)
    return ont


def set_prefixes(ont, prefixes):
    """Setter of ontology prefixes.
    Here all custom prefixes are specified.
    """
    
    for prefix in prefixes:
        ont.set_prefix(prefix["prfx"], prefix["uri"])
    return ont


if __name__ == "__main__":
    if len(sys.argv) == 3:
        main(sys.argv[2])
    else:
        print('ERROR: wrong number of arguments.')
