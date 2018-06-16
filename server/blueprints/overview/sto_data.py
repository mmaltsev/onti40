from server.landscape import Ontology
from server.datafetch import fetch_sto_data

def standards():
    ''' '''

    ont_query = '''
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX sto: <https://w3id.org/i40/sto#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?standard ?label WHERE {
            ?standard rdf:type sto:Standard ;
                      rdfs:label ?label .
            FILTER (langMatches(lang(?label), 'en'))
        }
    '''
    return fetch_sto_data(ont_query, ['standards', 'standard_labels'])

def standard_organizations():
    ''' '''

    ont_query = '''
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?org ?name WHERE {
            ?org rdf:type sto:StandardOrganization ;
                 sto:orgName ?name .
            FILTER (langMatches(lang(?name), 'en'))
        }
    '''
    return fetch_sto_data(ont_query, ['standard_organizations', 'standard_organization_names'])

def sto_properties():
    ''' '''

    ont_query = '''
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?property WHERE {
            ?property rdf:type owl:ObjectProperty .
        }
    '''
    return fetch_sto_data(ont_query, ['sto_properties'])
