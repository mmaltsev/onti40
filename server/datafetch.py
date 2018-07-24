from server.landscape import Ontology

ont = Ontology('https://rawgit.com/mmaltsev/onti40/master/server/assets/ttl/sto.ttl')
# ('https://rawgit.com/i40-Tools/StandardOntology/master/sto.ttl')

def fetch_sto_data(ont_query, dict_props):
    data = []
    data_dict = {}
    for row in ont.query(ont_query):
        for cnt, prop in enumerate(dict_props):
            value = str(row[cnt])
            value = setPrefix(value)
            if prop not in data_dict:
                data_dict[prop] = []
            data_dict[prop].append(value)
    return data_dict


def setPrefix(value):
    prefixes = {
        'http://creativecommons.org/ns#': 'cc:',
        'http://dbpedia.org/ontology#': 'dbo:',
        'http://dbpedia.org/ontology/': 'dbo:',
        'http://dbpedia.org/resource#': 'dbr:',
        'http://dbpedia.org/resource/': 'dbr:',
        'http://purl.org/spar/deo/': 'deo:',
        'http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#': 'dul:',
        'http://www.geonames.org/ontology#': 'geo:',
        'http://www.w3.org/2002/07/owl#': 'owl:',
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
        'https://w3id.org/i40/sto#': 'sto:',
        'http://www.w3.org/XML/1998/namespace': 'xml:',
        'http://www.w3.org/2001/XMLSchema#': 'xsd:',
        'http://purl.org/dc/elements/1.1/': 'dc11:',
        'http://usefulinc.com/ns/doap#': 'doap:',
        'http://xmlns.com/foaf/0.1/': 'foaf:',
        'http://purl.org/muto/core#': 'muto:',
        'https://w3id.org/i40/rami#': 'rami:',
        'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
        'http://www.w3.org/2004/02/skos/core#': 'skos:',
        'http://purl.org/vocab/vann/': 'vann:',
        'http://purl.org/vocommons/voaf#': 'voaf:',
        'http://schema.org/': 'schema:',
        'http://purl.org/dc/terms/': 'dcterms:',
        'http://dbpedia.org/property/': 'dbprop:',
        'http://dbpedia.org/class/yago/': 'dby:',
        'http://www.w3.org/ns/prov#': 'nsprov:',
        'http://purl.org/linguistics/gold/': 'lingg:',
        'http://wikidata.dbpedia.org/resource/': 'wkdr:',
        'http://www.wikidata.org/entity/': 'wkde:'
    }
    for prefix in prefixes:
        if prefix in value:
            value = value.replace(prefix, prefixes[prefix])
    return value
    