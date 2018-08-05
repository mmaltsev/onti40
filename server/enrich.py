"""Module for enlarging existing ontology based on knowledge from DBpedia.
"""

from server.landscape import Ontology, DBpedia
import json
import sys

def main_cmd(options_path):
    options = json.load(open(options_path))
    ont_query = """
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?sub ?dbPediaResource WHERE {
            ?sub sto:hasDBpediaResource ?dbPediaResource .
        }
    """
    ont = main(options, ont_query)
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
    #print(type(params))
    #print(params)
    #print(params['pred'])
    ont_query = """
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?sub ?res WHERE {
            ?sub """ + params['pred'] + """ ?res .
        }
    """
    ont = main(options, ont_query)
    return ont.export(None)

def main(options, ont_query):
    """Main function.
    Describes abstract algorithm of the ontology enriching.
    """
    ont = Ontology(options["input_file"])
    print('...starting enrichment process')
    total_added_triples_num = 0
    total_subj_num = 0
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
        ont, added_triples_num = enrich(ont, subject, dbpedia_result)
        total_added_triples_num += added_triples_num
        total_subj_num += 1
    
    ont = set_prefixes(ont, options["prefixes"])
    print('') # for moving to the next line in the command line
    print('Enriched ' + str(total_subj_num) + ' subjects with ' + \
      str(total_added_triples_num) + ' triples.')
    return ont


def enrich(ont, subject, dbpedia_result):
    """Enrichhment process wrapper.
    """
    
    added_triples_num = 0
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
    return ont, added_triples_num


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
