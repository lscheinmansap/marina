import os
import datetime
from dateutil.parser import parse
import re
import time
import csv
import json
import hashlib
import datefinder
from dotenv import dotenv_values
from loguru import logger

DATA_PATH = os.path.join(os.getcwd(), 'data')
TIMEFORMAT = "%Y-%m-%d %H:%M"
DATEFORMAT = "%Y-%m-%d"
TIMEFORMATFILE = "%Y%m%d%H%M%S"
CONFIG = dotenv_values(".env")


def get_location_category_colors():
    return{
        "apron": "rgba(255,258,222,0.6)",
        "water_park": "rgba(85,97,185,0.6)",
        "stopway": "rgba(199,85,67,0.6)",
        "fast_food": "rgba(126,255,175,0.6)",
        "works": "rgba(161,166,129,0.6)",
        "water_tower": "rgba(160,78,35,0.6)",
        "bridge": "rgba(35,26,41,0.6)",
        "GPE": "rgba(0,174,129,0.6)",
        "kiln": "rgba(127,80,77,0.6)",
        "NA": "rgba(179,209,140,0.6)",
        "monitoring_station": "rgba(178,74,184,0.6)",
        "runway": "rgba(162,217,178,0.6)",
        "cabin": "rgba(77,121,43,0.6)",
        "garden": "rgba(57,247,215,0.6)",
        "Surveillance": "rgba(153,114,134,0.6)",
        "common": "rgba(225,189,244,0.6)",
        "terminal": "rgba(64,75,143,0.6)",
        "aerodrome": "rgba(201,235,20,0.6)",
        "jet_bridge": "rgba(92,30,14,0.6)",
        "FAC": "rgba(159,93,216,0.6)",
        "LOC": "rgba(142,92,152,0.6)",
        "parking_position": "rgba(94,26,68,0.6)",
        "navigationaid": "rgba(127,39,98,0.6)",
        "hangar": "rgba(153,142,172,0.6)",
        "park": "rgba(228,164,58,0.6)",
        "pub": "rgba(29,201,188,0.6)",
        "mall": "rgba(216,123,28,0.6)",
        "house": "rgba(125,211,126,0.6)",
        "detached": "rgba(218,12,115,0.6)",
        "ORG": "rgba(203,243,54,0.6)",
        "wastewater_plant": "rgba(179,188,98,0.6)",
        "nature_reserve": "rgba(93,34,197,0.6)",
        "taxiway": "rgba(207,89,151,0.6)",
        "pipeline": "rgba(118,235,210,0.6)",
        "bar": "rgba(109,27,4,0.6)",
        "bunker_silo": "rgba(224,9,85,0.6)",
        "supermarket": "rgba(96,30,254,0.6)",
        "restaurant": "rgba(155,183,16,0.6)",
        "holding_position": "rgba(139,187,183,0.6)",
        "windsock": "rgba(13,52,50,0.6)",
        "residential": "rgba(90,106,19,0.6)",
        "dyke": "rgba(248,72,49,0.6)",
        "apartments": "rgba(176,228,226,0.6)",
        "convenience": "rgba(179,193,253,0.6)",
        "dog_park": "rgba(226,61,112,0.6)",
        "cafe": "rgba(149,10,117,0.6)",
        "water_well": "rgba(238,232,13,0.6)",
        "biergarten": "rgba(195,206,86,0.6)",
        "mineshaft": "rgba(208,182,62,0.6)",
        "helipad": "rgba(69,191,206,0.6)",
    }


def get_ui5_map():
    return {
        "MET": "sap-icon://activity-2",
        "Person": "sap-icon://customer",
        "Object": "sap-icon://radar-chart",
        "Location": "sap-icon://map",
        "Event": "sap-icon://date-time",
        "Case": "sap-icon://folder",
        "ForceElement": "sap-icon://database",
        "Position": "sap-icon://role",
        "Default": "sap-icon://information",
        "Organization": "sap-icon://overview-chart",
        "Capability": "sap-icon://add-equipment",
        "FMPO": "sap-icon://product"
    }


def change_if_date(date_string, fuzzy=False):
    """
    Return a date if the string is possibly in a date format within the list of date_formats.
    :param date_string: str, string to check for date
    :param fuzzy: bool, ignore unknown tokens in string if True
    """
    # clean the date string
    matches = [match for match in datefinder.find_dates(date_string)]
    if len(matches) == 0:
        return False
    date_formats = [
        '%d.%m.%Y', '%a, %d %b %Y %H:%M:%S %z', '%a, %d %b %Y %H:%M:%S %Z', '%A, %D %B %Y %H:%M:%S %z', '%A, %D %B %Y %H:%M:%S %Z',
        '%A, %D %B %y %h:%m:%s %z', '%a, %d %b %y %h:%m:%s %z', '%a, %d %b %y %h:%m:%s %Z', '%a, %D %b %Y %H:%M:%S %Z',
        '%m/%d/%y, %I:%M %p', '%M/%d/%y, %I:%M %p', '%M/%D/%y, %I:%M %p', '%M/%D/%Y, %I:%M %p', '%m/%d/%Y/%H:%M:%S',
        '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d', '%Y/%m/%d', '%d-%m-%Y', '%d/%m/%Y', '%Y-%M-%D', '%Y/%M/%D', '%D-%M-%Y',
        '%D/%M/%Y', '%Y-%m-%d %H:%M:%S', '%Y/%m/%d %H:%M:%S', '%d-%m-%Y %H:%M:%S', '%d/%m/%Y %H:%M:%S',
        '%Y-%m-%d %H:%M', '%Y/%m/%d %H:%M', '%d-%m-%Y %H:%M', '%d/%m/%Y %H:%M', '%Y%M%D', '%D%M%Y', ''
    ]
    try:
        parse(date_string, fuzzy=fuzzy)
        try:
            return datetime.datetime.strftime(parse(date_string, fuzzy=fuzzy), "%Y-%m-%d %H:%M")
        except Exception as err:
            logger.info(err)
            for df in date_formats:
                try:
                    dt = datetime.datetime.strptime(date_string, df)
                    return dt
                except ValueError:
                    pass
                except re.error:
                    pass
        return False
    except ValueError:
        return False
    except TypeError:
        return False
    except OverflowError:
        return False


def get_datetime():
    """
    Utility function for returning a common standard datetime
    :return: str
    """
    return datetime.datetime.fromtimestamp(time.time()).strftime(TIMEFORMAT)


def get_datetime_for_file():
    """
    Utility function for returning a common standard datetime for files
    :return: str
    """
    return datetime.datetime.fromtimestamp(time.time()).strftime(TIMEFORMATFILE)


def hash_values(values):
    """
    Standardized method to hash values for creating anonymized ids.
    :param values: list
    :return: str
    """
    str_values = ''.join(values).replace(" ", "")
    return str(hashlib.md5(str_values.encode()).hexdigest())


def combine_networkgraph_jsons(data_path=DATA_PATH):
    """
    Combine network graph jsons that have been produced by the sim engine into a single json and save it to the
    top level directory.

    :param data_path: str
        Path where the network jsons exist.
    :return:
    """
    index = []
    networkgraph = {
        "nodes": [],
        "lines": []
    }
    jsons = [js_file for js_file in os.listdir(data_path) if js_file[-5:] == '.json' and js_file[:12] == 'networkgraph']
    logger.info(f"Found {len(jsons)} networkgraph files")
    for path in jsons:
        logger.info(f"Opening {path}...")
        with open(os.path.join(data_path, path)) as json_file:
            json_obj = json.load(json_file)
            json_file.close()
        logger.info(f"Loading {len(json_obj['nodes'])}...")
        for node in json_obj['nodes']:
            if node['key'] not in index:
                index.append(node['key'])
                networkgraph['nodes'].append(node)
        logger.info(f"Loading {len(json_obj['lines'])}...")
        for line in json_obj['lines']:
            networkgraph['lines'].append(line)

    logger.info(f"Complete with integration resulting in {len(networkgraph['nodes'])} nodes and "
                f"{len(networkgraph['lines'])} lines...")
    with open('networkgraph.json', 'w') as json_file:
        json.dump(networkgraph, json_file)
        json_file.close()
    logger.info(f"Complete writing combined file to disk.")


def create_master_data_from_json(data_path=DATA_PATH):
    """
    Find networkgraph jsons which contain nodes and lines and make 2 different csv's representing master data and edges.
    :param data_path:
    :return:
    """
    jsons = [js_file for js_file in os.listdir(data_path) if js_file[-5:] == '.json' and js_file[:12] == 'networkgraph']
    logger.info(f"Found {len(jsons)} networkgraph files")
    master_data_file = 'master_data.csv'
    line_data_file = 'edge_table.csv'
    if len(jsons) > 0:
        logger.info(f"Opening {jsons[0]}...")
        master_data = []
        line_data = []
        index = []
        headers = ['key', 'title', 'icon', 'status']
        with open(os.path.join(data_path, jsons[0])) as json_file:
            json_obj = json.load(json_file)
            json_file.close()
        for node in json_obj['nodes']:
            if node['key'] not in index:
                index.append(node['key'])
                row = {'key': node['key'], 'title': node['title'], 'icon': node['icon'], 'status': node['status']}
                for att in node['attributes']:
                    if att['label'] not in headers:
                        headers.append(att['label'])
                    row[att['label']] = att['value']
                master_data.append(row)
        with open(os.path.join(data_path, master_data_file), 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            writer.writeheader()
            for data in master_data:
                writer.writerow(data)
        logger.info(f'{os.path.join(data_path, master_data_file)} written with {len(master_data)} nodes.')
        with open(os.path.join(data_path, line_data_file), 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=['key', 'from', 'to', 'title', 'description'])
            writer.writeheader()
            i = 0
            for line in json_obj['lines']:
                line['key'] = hash_values([line['from'], line['to'], line['title'], line['description']])
                if line['from'] in index and line['to'] in index and line['key'] not in index:
                    writer.writerow(line)
                    i += 1
                    index.append(line['key'])
        logger.info(f'{os.path.join(data_path, line_data_file)} written with {i} lines.')


if __name__ == "__main__":
    create_master_data_from_json()