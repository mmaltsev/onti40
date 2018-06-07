from server.landscape import Ontology

def standards():
    """ """

    ont_query = """
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?standard WHERE {
            ?standard rdf:type sto:Standard .
        }
    """
    return fetch_sto_data(ont_query)


def standard_organizations():
    """ """

    ont_query = """
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?standard WHERE {
            ?standard rdf:type sto:StandardOrganization .
        }
    """
    return fetch_sto_data(ont_query)

    
def standard_properties():
    """ """

    ont_query = """
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?standard WHERE {
            ?standard rdf:type sto:Standard .
        }
    """
    return fetch_sto_data(ont_query)

    
def standards():
    """ """

    ont_query = """
        PREFIX sto: <https://w3id.org/i40/sto#>
        SELECT ?standard WHERE {
            ?standard rdf:type sto:Standard .
        }
    """
    standard_list = fetch_sto_data(ont_query)
    return standard_list



def fetch_sto_data(ont_query):
    ont = Ontology('https://rawgit.com/i40-Tools/StandardOntology/master/sto.ttl')
    data = []
    for row in ont.query(ont_query):
        standard_full = str(row[0])
        standard_split_list = standard_full.split('/')
        standard = '/'.join(standard_split_list[4:])
        data.append(standard)
    return data
