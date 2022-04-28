import os
import hashlib
import json
from loguru import logger
from pandas import read_csv, errors

FILE_NAME = os.path.join(os.getcwd(), "data/OSmnxBook.csv")
SHEET_NAME = "Sheet1"
DEFAULT_POINT = (49.89382, -97.25251)
ALTERNATE_POINT = (49.90093, -96.97571)


def hash_values(values):
    """
    Standardized method to hash 2 or more values for creating things like anonymized ids.
    :param values: list
        Values to join into a string and hash
    :return: str
    """
    str_values = ''.join(values).replace(" ", "")
    return str(hashlib.md5(str_values.encode()).hexdigest())


def check_place_records(place_key):
    dfp = read_csv(FILE_NAME)
    try:
        if place_key in dfp['place_key'].values:
            return dfp[dfp['place_key'] == place_key].to_dict('records')
    except errors.ParserError:
        logger.error("getting pandas")
    return None


def add_place_records(df_new):
    df_new.to_csv(FILE_NAME, mode='a', header=False, encoding='utf-8')


def extract_places(place_key, country, pdf, type):
    pdf = pdf.fillna("N/A")
    if 'name' not in pdf.columns:
        pdf['name'] = "N/A"
    if 'addr:postcode' not in pdf.columns:
        pdf['addr:postcode'] = "N/A"
    if 'addr:street' not in pdf.columns:
        pdf['addr:street'] = "N/A"
    if 'addr:housenumber' not in pdf.columns:
        pdf['addr:housenumber'] = "N/A"
    if 'type' not in pdf.columns:
        pdf['type'] = "N/A"
    return [{
        "place_key": place_key,
        "id": hash_values([
            str(row['name']),
            str(row['type']),
            str(row['geometry'].centroid.coords[0][0]),
            str(row['geometry'].centroid.coords[0][1])]),
        "title": row['name'],
        "lon": row['geometry'].centroid.coords[0][0],
        "lat": row['geometry'].centroid.coords[0][1],
        "geometry": str(row['geometry']),
        "type": "Location",
        "class": row['type'],
        "category": row[type],
        "country": country,
        "address": "{} {}".format(row['addr:street'], row['addr:housenumber']),
        "postcode": row['addr:postcode']
    }
        for index, row in pdf.iterrows()]


def create_place_key(place, point):
    try:
        if isinstance(point[0], str):
            return f'{place}{point[0]}{point[1]}'
        else:
            return f'{place}{int(point[0]*10)}{int(point[1]*10)}'
    except TypeError:
        print(place, point)
    except:
        print(place, point)


class OSMNXSim:
    def __init(self):
        self.graphs: {}

    @staticmethod
    def cache_path(cpath, path_name):
        """
        Save paths that have been previously found.

        :param cpath: list
            Collection of dictionaries representing the points on a shortest path.
        :param path_name: str
            Filename for which the path will be saved.
        :return:
        """
        filename = os.path.join(os.getcwd(), 'cache_paths', f'{path_name}')
        with open(filename, 'w') as fp:
            json.dump({"path": cpath}, fp)
        logger.info(f'Exported {len(cpath)} to {filename}')

    @staticmethod
    def truncate(f, n):
        """
        Truncates/pads a float f to n decimal places without rounding. Used by get_path so shortest paths are not
        attempted to be created from a very specific points.

        :param f: float
            The float that needs to be truncated.
        :param n: int
            How many places the float needs to be truncated.
        :return:
        """
        s = '{}'.format(f)
        if 'e' in s or 'E' in s:
            return '{0:.{1}f}'.format(f, n)
        i, p, d = s.partition('.')
        return '.'.join([i, (d + '0' * n)[:n]])

    def get_path(self, point_a=DEFAULT_POINT, point_b=ALTERNATE_POINT):
        """
        Get a path for a vehicle to follow for realistic simulation.

        :param point_a: tuple
            The origin point expressed as a tuple of 2 floats (longitude, latitude).
        :param point_b: tuple
            The destination point expressed as a tuple of 2 floats (longitude, latitude).
        :return:
        """
        point_a = (float(self.truncate(point_a[0], 2)), float(self.truncate(point_a[1], 2)))
        point_b = (float(self.truncate(point_b[0], 2)), float(self.truncate(point_b[1], 2)))
        path_a = str(point_a).replace(')', '').replace('(', '').replace(',', '').replace(' ', '').replace('.', '')
        path_b = str(point_b).replace(')', '').replace('(', '').replace(',', '').replace(' ', '').replace('.', '')
        path_name = f"{path_a}{path_b}.json"
        if path_name in os.listdir(os.path.join(os.getcwd(), 'cache_paths')):
            with open(os.path.join(os.getcwd(), 'cache_paths', path_name)) as path_file:
                a_path = json.load(path_file)
            return a_path['path']


if __name__ == "__main__":
    oxs = OSMNXSim()
    path = oxs.get_path()


