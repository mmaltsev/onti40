"""Module for enlarging existing ontology based on knowledge from DBpedia."""

from server.landscape import Ontology, DBpedia
import json
import sys


def get_filename(path):
    """Gett file name from path."""
    full_file_name = path.split('/')[-1]
    file_name = full_file_name.split('.')[0]
    return file_name


def get_resource(row):
    """Get resource from STO query result row."""
    resource_split_list = row.split('/')
    resource = '/'.join(resource_split_list[4:])
    return resource


def set_blacklist(ont, blacklist):
    """Specify all predicates that should be excluded from DBpedia fetching results."""
    for url in blacklist:
        ont.blacklist.add(url)
    return ont


def set_prefixes(ont, prefixes):
    """Set ontology prefixes. Here all custom prefixes are specified."""
    for prefix in prefixes:
        ont.set_prefix(prefix['prfx'], prefix['uri'])
    print()
    return ont


def get_dbp_query(predicate, whitelist):
    """Return a DBpedia query based on the predicate resource and whitelist."""
    resource = get_resource(predicate)
    dbpedia_query = 'SELECT ?pred ?obj WHERE {' + \
        '<http://dbpedia.org/resource/' + resource + '> ?pred ?obj . '
    if whitelist:
        dbpedia_query += 'FILTER(?pred IN (' + whitelist + '))'
    dbpedia_query += '}'
    return dbpedia_query


def get_ont_query(predicate):
    """Return an ontology query based on the linking predicate."""
    ont_query = """
        SELECT ?sub ?res WHERE {
            ?sub """ + predicate + """ ?res .
        }
    """
    return ont_query


def set_prefix(name, namespaces):
    """Return an ontology entity with prefix."""
    for namespace in namespaces:
        if name.find(namespace) > -1:
            name = name.replace(namespace, namespaces[namespace] + ':')
    return name


def expand_summary(ont_summary, subject, predicate, object, isEnriched, namespaces):
    """Enrich the summary of ontology."""
    if subject not in ont_summary:
        ont_summary[subject] = {
            'predicates': {
                predicate: {
                    'objects': {
                        object: {
                            'added': isEnriched,
                            'label': set_prefix(object, namespaces)
                        }
                    },
                    'enriched': isEnriched,
                    'added': isEnriched,
                    'label': set_prefix(predicate, namespaces)
                }
            },
            'enriched': isEnriched,
            'added': isEnriched,
            'label': set_prefix(subject, namespaces)
        }
    elif predicate not in ont_summary[subject]['predicates']:
        ont_summary[subject]['predicates'][predicate] = {
            'objects': {
                object: {
                    'added': isEnriched,
                    'label': set_prefix(object, namespaces)
                }
            },
            'enriched': isEnriched,
            'added': isEnriched,
            'label': set_prefix(predicate, namespaces)
        }
        # update enriched property for the parent subject
        ont_summary[subject]['enriched'] = ont_summary[subject]['enriched'] or isEnriched
    elif object not in ont_summary[subject]['predicates'][predicate]['objects']:
        ont_summary[subject]['predicates'][predicate]['objects'][object] = {
            'added': isEnriched,
            'label': set_prefix(object, namespaces)
        }
        # update enriched property for the parent subject and predicate
        ont_summary[subject]['enriched'] = ont_summary[subject]['enriched'] or isEnriched
        ont_summary[subject]['predicates'][predicate]['enriched'] = \
            ont_summary[subject]['predicates'][predicate]['enriched'] or isEnriched
    return ont_summary


def get_obj_value(obj_value, obj_type):
    """Extract object value depending on its type."""
    if obj_type in ['Literal', 'literal']:
        return 'Literal'
    elif obj_type in ['BNode', 'bnode']:
        return 'BNode'
    return str(obj_value)


def get_init_ont_stats(ont):
    """Return ontology statistics before enrichment."""
    stats_query = """
        SELECT (COUNT(?sub) as ?trip_num) (COUNT(DISTINCT ?sub) as ?sub_num) (COUNT(DISTINCT ?pred) as ?pred_num) (COUNT(DISTINCT ?obj) as ?obj_num)
        WHERE {
            ?sub ?pred ?obj .
        }
    """
    for row in ont.query(stats_query):
        ont_stats = {
            'trip_num': int(row[0]),
            'subj_num': int(row[1]),
            'pred_num': int(row[2]),
            'obj_num': int(row[3])
        }
    return ont_stats


def get_init_ont_summary(ont):
    """Return summary of the ontology before the enrichment."""
    summary_query = """
        SELECT ?sub ?pred ?obj WHERE {
            ?sub ?pred ?obj .
        }
    """
    ont_summary = {}
    for row in ont.query(summary_query):
        subj = str(row[0])
        pred = str(row[1])
        obj = get_obj_value(row[2], type(row[2]).__name__)
        namespaces = ont.namespaces()
        ont_summary = expand_summary(ont_summary, subj, pred, obj, False, namespaces)
    return ont_summary


def enrich(ont, subject, dbpedia_result, ont_summary):
    """Enrich ontology with a triple."""
    print('/', sep=' ', end='', flush=True)
    subj = {
        'value': str(subject)
    }
    for triple in dbpedia_result:
        pred = triple['pred']
        obj = triple['obj']
        if pred['value'] not in ont.blacklist:
            isEnriched = ont.enrich(subj, pred, obj)
            obj_value = get_obj_value(obj['value'], obj['type'])
            namespaces = ont.namespaces()
            ont_summary = expand_summary(ont_summary, subj['value'], pred['value'], obj_value, isEnriched, namespaces)
    return ont


def get_init_ont_data(ont, options, config):
    """Return ontology related data before enrichment."""
    ont_stats = get_init_ont_stats(ont)
    ont_summary = get_init_ont_summary(ont)
    ont_whitelist = ', '.join(options['whitelist'])
    ont_query = get_ont_query(config.get('predicate') or options['predicate'])
    return ont_stats, ont_summary, ont_whitelist, ont_query


def get_export_path(config):
    """Return ontology related data before enrichment."""
    if config != {}:
        return None
    filename = get_filename(options['input_file'])
    full_filename = 'ttl/' + filename + '(enriched).ttl'
    print('...saving file as "' + full_filename + '"')
    return full_filename


def main(options_path, config):
    """Describe abstract algorithm of the ontology enriching."""
    print('...starting enrichment process')
    if config != {}:
        options_path = 'server/' + options_path
    options = json.load(open(options_path))
    ont = Ontology(config.get('input_file') or options['input_file'])
    ont = set_blacklist(ont, options['blacklist'])
    ont_stats, ont_summary, ont_whitelist, ont_query = get_init_ont_data(ont, options, config)
    for row in ont.query(ont_query):
        subject = row[0]
        predicate = row[1]
        dbpedia_query = get_dbp_query(predicate, ont_whitelist)
        dbpedia_result = DBpedia().query(dbpedia_query)
        ont = enrich(ont, subject, dbpedia_result, ont_summary)
    ont = set_prefixes(ont, options['prefixes'])
    print('...finishing enrichment process')
    export_path = get_export_path(config)
    return ont.export(export_path), ont_stats, ont_summary


if __name__ == "__main__":
    if len(sys.argv) == 3:
        main(sys.argv[2], {})
    else:
        print('ERROR: wrong number of arguments.')
