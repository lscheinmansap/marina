"""
Main logic for handling access to SAP HANA DB and transforming results into UI5 views.
"""
import os
import time
import hashlib
import string
import json
import ast
import pandas as pd
from datetime import datetime, timedelta
from loguru import logger
import dotenv
import hdbcli
import hana_ml
from hana_ml.graph import algorithms as hga, Graph
from hana_ml.dataframe import create_dataframe_from_pandas
from hana_ml.graph import create_graph_from_hana_dataframes
from osmnx_sim import OSMNXSim
from utils import change_if_date, get_location_category_colors, get_ui5_map

dotenv.load_dotenv()

CATEGORY_MAP = get_location_category_colors()
UI5_ICON_MAP = get_ui5_map()
oxs = OSMNXSim()


class SubGraph:

    def __init__(self):
        self.nodes = []
        self.links = []
        self.groups = []

    def transform_edges_df_to_ui5(self, df):
        """
        Load the subgraph links with UI5 standard based on a pandas dataframe.

        :param df: pd.DataFrame

        :return:
        """
        for index, edge in df.iterrows():
            ui5_edge = {
                "from": edge['from'],
                "to": edge['to'],
                "title": edge['title']
            }
            if edge['weight'] and edge['weight'] != "NA":
                ui5_edge['weight'] = edge['weight']
            if edge['description'] and edge['description'] != "NA":
                ui5_edge['description'] = edge['description']
            self.links.append(ui5_edge)

    def transform_nodes_df_to_ui5(self, df):
        """
        Load the subgraph nodes with UI5 standard based on a pandas dataframe.

        :param df: pd.DataFrame

        :return:
        """
        header_vals = ['key', 'title', 'icon', 'status']
        for index, node in df.iterrows():
            ui5_node = {
                "key": None,
                "title": "Unknown",
                "icon": UI5_ICON_MAP['Default'],
                "status": "Standard",
                "attributes": []
            }
            for nk in node.keys():
                if nk in header_vals:
                    if nk == 'icon' and not node[nk]:
                        ui5_node[nk] = UI5_ICON_MAP['Default']
                    else:
                        ui5_node[nk] = node[nk]
                elif node[nk] and node[nk] != "NA":
                    ui5_node['attributes'].append({"label": nk, "value": node[nk]})
            self.nodes.append(ui5_node)

    @staticmethod
    def transform_nodes_df_to_dict(df):
        """
        Create a dictionary/index of nodes in UI5 format

        :param df: pd.DataFrame

        :return: dict
        """
        node_dict = {}
        header_vals = ['key', 'title', 'icon', 'status']
        for index, node in df.iterrows():
            ui5_node = {
                "key": None,
                "title": "Unknown",
                "icon": UI5_ICON_MAP['Default'],
                "status": "Standard",
                "attributes": []
            }
            for nk in node.keys():
                if nk in header_vals:
                    ui5_node[nk] = node[nk]
                elif node[nk] and node[nk] != "NA":
                    ui5_node['attributes'].append({"label": nk, "value": node[nk]})
            node_dict[ui5_node['key']] = ui5_node

        return node_dict

    def export(self):
        return {"nodes": self.nodes, "links": self.links}

    def export_ui5(self):
        return {"nodes": self.nodes, "lines": self.links, "groups": self.groups, "status": 200,
                "message": "Returned {} nodes and {} edges".format(len(self.nodes), len(self.links))}


class HanaDbApi:

    def __init__(self):
        self.user = os.environ.get('HANA_USER')
        self.port = os.environ.get('HANA_PORT')
        self.pwd = os.environ.get('HANA_PASS')
        self.address = os.environ.get('HANA_ADDRESS').replace(":443", "")   # copying the SQL endpoint includes 443
        self.data_path = os.path.join(os.getcwd(), 'data')
        self.connection_context = self.get_connection_context()
        self.graph_workspace = os.environ.get('GRAPH_VIEW')
        self.osm_workspace = os.environ.get('OSM_GRAPH')
        self.nodes_table = os.environ.get('NODES_TABLE')
        self.locations_table = os.environ.get('LOCATIONS_TABLE')
        self.nodes_backup = "master_data_backup"
        self.edges_table = os.environ.get('EDGE_TABLE')
        self.resolution_table = os.environ.get('RESOLUTION_TABLE')
        self.db_changes_table = "db_changes"
        self.node_data = None
        self.line_data = None
        self.osm_nodes = os.environ.get('OSM_NODES')
        self.osm_streets = os.environ.get('OSM_STREETS')
        self.osm_streets_poly = os.environ.get('OSM_STREETS_POLY')
        self.osm_places = os.environ.get('OSM_PLACES')
        self.md_table_structure = {
            "Unnamed 0.1": "VARCHAR(100)",
            "key": "VARCHAR(500)",
            "dateTime": "VARCHAR(500)",
            "type": "VARCHAR(500)",
            "category": "VARCHAR(500)",
            "title": "VARCHAR(500)",
            "URL": "VARCHAR(500)",
            "icon": "VARCHAR(500)",
            "status": "VARCHAR(500)",
            "met-id": "VARCHAR(500)",
            "scope": "VARCHAR(500)",
            "lat": "VARCHAR(500)",
            "lon": "VARCHAR(500)",
            "unit": "VARCHAR(500)",
            "section": "VARCHAR(500)",
            "rank": "VARCHAR(500)",
            "Req": "VARCHAR(100)",
            "code": "VARCHAR(100)",
            "components": "VARCHAR(100)",
            "image": "VARCHAR(100)",
            "kpiSubTitle": "VARCHAR(100)",
            "kpiValue": "VARCHAR(100)",
            "kpiColor": "VARCHAR(100)",
            "important": "VARCHAR(100)",
            "label": "VARCHAR(100)",
            "readiness": "VARCHAR(100)",
            "comments": "VARCHAR(100)",
            "Lat": "VARCHAR(100)",
            "Lon": "VARCHAR(100)",
            "D_Lat": "VARCHAR(100)",
            "D_Lon": "VARCHAR(100)",
            "city": "VARCHAR(100)",
            "country": "VARCHAR(100)",
            "place_key": "VARCHAR(100)",
            "class": "VARCHAR(100)",
            "postcode": "VARCHAR(100)",
            "description": "VARCHAR(5000)",
            "nameFirst": "VARCHAR(100)",
            "nameLast": "VARCHAR(100)",
            "hasChildren": "VARCHAR(100)",
            "married": "VARCHAR(100)",
            "address": "VARCHAR(100)",
            "age": "VARCHAR(100)",
            "dob": "VARCHAR(100)",
            "gender": "VARCHAR(100)",
            "sc_interests": "VARCHAR(100)",
            "sc_education": "VARCHAR(100)",
            "sc_occupation": "VARCHAR(100)",
            "sc_charisma": "VARCHAR(100)",
            "sc_engagement": "VARCHAR(100)",
            "sc_personality": "VARCHAR(100)",
            "sc_tolerance": "VARCHAR(100)",
            "sc_culture": "VARCHAR(100)",
            "sc_ethnic": "VARCHAR(100)",
            "sc_locale": "VARCHAR(100)",
            "sc_soc_class": "VARCHAR(100)",
            "culture": "VARCHAR(100)",
            "ethnic": "VARCHAR(100)",
            "interests": "VARCHAR(100)",
            "occupation": "VARCHAR(100)",
            "personality": "VARCHAR(100)",
            "pob": "VARCHAR(100)",
            "livesAt": "VARCHAR(5000)",
            "color": "VARCHAR(100)",
            "endDate": "VARCHAR(100)",
            "geometry": "NCLOB"
        }
        self.db_change_structure = {
            "change_id": "VARCHAR(500)",
            "change_time": "VARCHAR(500)",
            "change_type": "VARCHAR(32)",
            "node_key": "VARCHAR(5000)",
            "node_title": "VARCHAR(5000)",
            "edge_key": "VARCHAR(5000)",
            "edge_from": "VARCHAR(5000)",
            "edge_to": "VARCHAR(5000)"
        }
        self.geo_locations_structure = {
            "key": "VARCHAR(5000)",
            "title": "VARCHAR(5000)",
            "lon": "DOUBLE",
            "lat": "DOUBLE",
            "category": "VARCHAR(5000)"
        }
        self.osm_streets_structure = {
            "key": "NVARCHAR(500)",
            "maxspeed": "NVARCHAR(500)",
            "lanes": "NVARCHAR(500)",
            "name": "NVARCHAR(500)",
            "source": "NVARCHAR(500)",
            "target": "NVARCHAR(500)",
            "highway": "NVARCHAR(500)",
            "length": "NVARCHAR(500)",
            "geometry": "NCLOB",
        }
        self.graph = None
        self.osm_graph = None
        self.all_tables = [self.nodes_table, self.edges_table, self.osm_nodes, self.osm_streets, self.osm_streets_poly,
                           self.osm_places]

    def setup(self):
        """
        Run through all setup checks of the HANA DB
        - Check the connection to the HDB in the env file is working
        - Check if there is master data

        :return:
        """
        logger.info(f"Establishing connection to {self.address} ")
        try:
            self.connection_context = self.get_connection_context()
        except hdbcli.dbapi.Error as err:
            return err.errortext
        logger.info("Connection established.")
        logger.info("Creating views of master data and edges for internal processes.")
        self.node_data = self._master_data_view()
        self.line_data = self._edge_data_view()
        logger.info("Checking tables and graph.")
        self._check_pole_graph()
        logger.info("Tables and graph set.")
        logger.info("Checking Situations for Troubled Families use case.")
        sits = self.get_situations_tf()
        if len(sits['situations']) == 7:
            logger.info("All Troubled Families use case set.")
        else:
            logger.error("Troubled Families use case not existing")
        logger.info("Checking Situations for Surveillance use case.")
        sits = self.get_situations_surveillance()
        if len(sits['situations']) == 22:
            logger.info("Surveillance use case set.")
        else:
            logger.error("Surveillance use case not existing")
        logger.info("Checking Situations for case management.")
        sits = self.get_situations_cases()
        if len(sits['situations']) == 1:
            logger.info("Case Management use case set.")
        else:
            logger.error("Case Management use case not existing")
        logger.info("Loading Open Streets Maps data.")
        self._check_osm_graph()
        logger.info("Checking data changes table.")
        self.check_db_changes_table()

    def get_path_point(self, sub_sql):
        """
        Given a longitude and latitude within a sub SQL statement find nodes that are nearest the point.

        :param sub_sql: str
            SQL sub statement that includes a longitude and latitude.
        :return: str
            Key of the point found that can be used to look up in other tables.
        """
        geo_df = self.connection_context.sql(f'''
            SELECT * FROM "DBADMIN"."osm_streets" 
            WHERE "key" IN(SELECT "key" FROM "DBADMIN"."osm_streets_poly" WHERE {sub_sql})
        ''').collect().fillna('')
        path_points = {}
        for index, point in geo_df.iterrows():
            if point['key'] not in path_points.keys():
                path_points[point['key']] = {
                    "source": point['source'],
                    "target": point['target']
                }
        logger.info(f"Found {len(path_points.keys())} paths")
        return path_points

    def _check_osm_graph(self):
        if not self.osm_graph:
            self.osm_graph = self.load_osm_graph()

    def _check_pole_graph(self):
        if not self.graph:
            self.graph = self.load_pole_graph()

    def get_geo_shortest_path(self, points):
        """
        Based on a string of points separated by ',' get the lat and lon of each set. Use each set to get a corresponding
        closest point from the points defined in the osm_nodes table. Use the closest node to determine an end point
        for calculating a shortest path. Find the shortest path between each of the points.

        :param points: str
            Comma separated string of lon/lat sets
        :return: list
            Paths
        """
        self._check_osm_graph()
        paths = []
        path_keys = []
        sql_build = []
        for point_set in points.split(","):
            lat = float(point_set[point_set.find(';')+1:])
            lon = float(point_set[:point_set.find(';')])
            sql_build.append(f'''(NEW ST_Point('POINT({lon} {lat})').ST_Within("geobuffer_GEO")) = 1''')
        sub = ' OR '.join(sql_build)
        valid_points = self.get_path_point(sub_sql=sub)
        if len(valid_points.keys()) > 1:
            checked_points = []
            for point_a in valid_points:
                checked_points.append(point_a)
                for point_b in valid_points:
                    if point_b not in checked_points:
                        for att in ['source', 'target']:
                            try:
                                sp = hga.ShortestPath(graph=self.osm_graph).execute(
                                    source=valid_points[point_a][att],
                                    target=valid_points[point_b][att],
                                    direction="ANY")
                                for idx, path in sp.edges.iterrows():
                                    if path['key'] not in path_keys:
                                        path_keys.append(path['key'])
                                        paths.append(path)
                            except ValueError as err:
                                logger.error(err.args)
            if len(path_keys) > 0:
                wkt_df = self.connection_context.sql(f'''
                SELECT "key", "maxspeed", "geometry_GEO".ST_AsWKT() AS "wkt"
                FROM "{self.connection_context.get_current_schema()}"."{self.osm_streets}"
                WHERE "key" IN ({', '.join([f"'{pkey}'" for pkey in path_keys ])})
                ''').collect().fillna('')
                paths = [{
                    "key": geo['key'],
                    "geometry": geo['wkt'].replace("LINESTRING ", "").replace(",", ";0;").replace(' ', ';').replace("(", "").replace(")", ""),
                    "maxspeed": geo['maxspeed']
                } for idx, geo in wkt_df.iterrows()]

        return {
            "message": f"Retrieved {len(paths)}",
            "paths": paths
        }

    def update_node(self, node):
        """
        Update a node based on the key received within the node dictionary.

        :param node: dict
            Node to be updated in the database.

        :return:
        """
        update_statement = f", ".join([f'''"{att}" = '{node[att]}' '''.strip() for att in node if att != "key"])
        self.connection_context.connection.cursor().execute(f'''
        UPDATE "DBADMIN"."{self.nodes_table}"
        SET {update_statement}
        WHERE "key" = '{node['key']}'
        ''')

        self.create_db_change_records('node update', [node])
        sub_graph = self.get_neighbors(node_id=node['key'])

        return {"message": f"{node['key']} updated.", "node_key": node['key'], "sub_graph": sub_graph}

    def check_db_changes_table(self):
        """
        Ensure the transactions table is created if not already available.

        :return:
        """
        try:
            self.connection_context.table(self.db_changes_table).collect().fillna('')
        except hdbcli.dbapi.ProgrammingError:
            change_time = datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
            change_id = self.hash_values(['db_change', change_time])
            create_dataframe_from_pandas(
                connection_context=self.connection_context,
                table_name=self.db_changes_table,
                schema=self.connection_context.get_current_schema(),
                drop_exist_tab=True,
                force=True,
                pandas_df=pd.DataFrame([{
                    "change_id": change_id,
                    "change_time": change_time,
                    "change_type": 'setup',
                    "node_key": None,
                    "node_title": None,
                    "edge_key": None,
                    "edge_from": None,
                    "edge_to": None
                }]),
                table_structure=self.db_change_structure
            )

    def load_pole_graph(self):
        """
        Check if a graph already exists with the workspace name. If not, create it based on flat files.

        :return: hana_ml.Graph
        """
        hana_graph = self.create_hana_graph_from_csv(f'{self.nodes_table}.csv', f'{self.edges_table}.csv')
        logger.info(f'{self.graph_workspace} created')
        return hana_graph

    def check_csv_quality_for_graph(self):
        """
        Ensure node csv don't have duplicate values and edge csv only contains edges with nodes that exist in node csv.

        :return:
        """
        n_df = pd.read_csv(os.path.join(self.data_path, f'{self.nodes_table}.csv'),
                           on_bad_lines='skip', low_memory=False).fillna("NA").convert_dtypes()
        n_df.drop_duplicates(subset="key", inplace=True)
        for col in n_df.columns:
            if col not in self.md_table_structure.keys():
                del n_df[col]
        n_df.to_csv(path_or_buf=(os.path.join(self.data_path, f'{self.nodes_table}.csv')))
        n_idx = set([key for key in n_df.key])
        e_df = pd.read_csv(os.path.join(self.data_path, f'{self.edges_table}.csv'),
                           on_bad_lines='skip', low_memory=False).fillna("NA").convert_dtypes()
        for col in e_df.columns:
            if col not in ['key', 'from', 'to', 'title', 'weight', 'description']:
                del e_df[col]
        e_df_new = pd.DataFrame(
            [row.to_dict() for idx, row in e_df.iterrows() if row["from"] in n_idx and row["to"] in n_idx])
        e_df_new.to_csv(path_or_buf=(os.path.join(self.data_path, f'{self.edges_table}.csv')))

    def load_osm_graph(self):
        """
        Check if a graph already exists with the workspace name. If not, create it based on flat files.

        :return: hana_ml.Graph
        """
        try:
            hana_graph = Graph(self.connection_context, self.osm_workspace)
            logger.info(f'{self.osm_workspace} set')
        except ValueError:
            logger.info(f'{self.osm_workspace} needs to be created')
            # Get osm_streets as the HANA Edge Dataframe
            if self.connection_context.has_table(self.osm_streets, self.user):
                edges_hdf = self.connection_context.table(self.osm_streets)
            else:
                logger.info("OSM Streets not loaded into HANA. Starting process")
                streets = pd.read_csv(os.path.join(self.data_path, "osm_streets.csv"))
                streets.rename(columns={'geometry_GEO': 'geometry'}, inplace=True)
                edges_hdf = create_dataframe_from_pandas(
                    connection_context=self.connection_context,
                    pandas_df=pd.DataFrame(streets),
                    primary_key="key",
                    table_name="osm_streets",
                    schema=self.connection_context.get_current_schema(),
                    drop_exist_tab=True,
                    force=True,
                    geo_cols=['geometry'],
                    table_structure=self.osm_streets_structure
                )
                logger.info("OSM Streets loaded")
            # Create Vertices View
            sql = f"""SELECT "source" AS VERTEX_ID
                       FROM ({edges_hdf.select_statement})
                      UNION
                     SELECT "target" AS VERTEX_ID
                       FROM ({edges_hdf.select_statement})"""
            vertices_hdf = hana_ml.DataFrame(
                connection_context=self.connection_context, select_statement=sql
            )
            hana_graph = create_graph_from_hana_dataframes(
                connection_context=self.connection_context,
                vertices_df=vertices_hdf,
                vertex_key_column="VERTEX_ID",
                edges_df=edges_hdf,
                edge_key_column="key",
                workspace_name=self.osm_workspace,
                schema=self.connection_context.get_current_schema(),
                edge_source_column="source",
                edge_target_column="target",
                force=True,
            )
            logger.info(f'{self.osm_workspace} created')

        return hana_graph

    def create_backup(self):
        """
        Drop the back up tables if they exist and create new back ups based on the current tables. Run checks against
        the back up tables to determine if a back up is required.

        :return:
        """
        drops = ['edge_table_backup', self.nodes_backup, 'resolution_mapping_backup']
        creates = [
            'CREATE COLUMN TABLE "DBADMIN"."edge_table_backup" LIKE "DBADMIN"."edge_table" WITH DATA;',
            f'CREATE COLUMN TABLE "DBADMIN"."{self.nodes_backup}" LIKE "DBADMIN"."{self.nodes_table}" WITH DATA;',
            'CREATE COLUMN TABLE "DBADMIN"."resolution_mapping_backup" LIKE "DBADMIN"."resolution_mapping" WITH DATA;'
        ]
        for drop in drops:
            self.connection_context.drop_table(table=drop)
        for create in creates:
            try:
                self.connection_context.connection.cursor().execute(create)
            except hdbcli.dbapi.ProgrammingError as err:
                logger.error(err.errortext)

    def check_graph_consistency(self):
        """
        Check the edges to make sure they don't make reference to non-existent nodes.

        :return:
        """
        removed = 0
        new_edges = []
        n_hdf = self.connection_context.table(self.nodes_table)
        e_hdf = self.connection_context.table(self.edges_table)
        try:
            node_index = [node['key'] for index, node in n_hdf.collect().fillna('').iterrows()]
            edge_index = {edge['key']: {
                "key": edge['key'],
                "from": edge['from'],
                "to": edge['to'],
                "title": edge['title'],
                "weight": edge['weight'],
                "description": edge['description']
            } for index, edge in e_hdf.collect().fillna('').iterrows()}
            for e in edge_index:
                if edge_index[e]['from'] not in node_index or edge_index[e]['to'] not in node_index:
                    removed += 1
                else:
                    new_edges.append(edge_index[e])
            message = f'Removed {removed} edges resulting a in total {len(new_edges)} edges.'
            logger.info(message)
            create_dataframe_from_pandas(
                connection_context=self.connection_context,
                pandas_df=pd.DataFrame(new_edges),
                primary_key="key",
                table_name=self.edges_table,
                schema=self.connection_context.get_current_schema(),
                drop_exist_tab=True,
                force=True
            )
            try:
                self.connection_context.drop_table(table="edge_table_backup")
            except hdbcli.dbapi.ProgrammingError as err:
                logger.error(err.errortext)
            create = 'CREATE COLUMN TABLE "DBADMIN"."edge_table_backup" LIKE "DBADMIN"."edge_table" WITH DATA;'
            self.connection_context.connection.cursor().execute(create)
        except hdbcli.dbapi.ProgrammingError:
            message = "No tables yet"
            logger.info("No tables yet")

        return message

    def create_db_change_records(self, change_type, nodes=None, edges=None):
        """
        Keep a record of user triggered changes in the case any need to be reversed.

        :param change_type: str
            Type of change to the DB records such as merge, create, or node update.
        :param nodes: list
            Collection of nodes stored as dictionaries.

            Default to None.
        :param edges: list
            Collection of edges stored as dictionaries.

            Default to None
        :return:
        """
        change_time = datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
        change_id = self.hash_values(['db_change', change_time])
        if nodes:
            for node in nodes:
                values = [change_id, change_time, change_type, node['key'], self.clean_punc(node['title']), 'None', 'None', 'None']
                values_str = ','.join([f"'{val}'" for val in values])
                insert_statement = f'INSERT INTO "DBADMIN"."db_changes" VALUES ({values_str})'
                self.connection_context.connection.cursor().execute(insert_statement)
        if edges:
            for edge in edges:
                values = [change_id, change_time, change_type, 'None', 'None', edge['key'], edge['from'], edge['to']]
                values_str = ','.join([f"'{val}'" for val in values])
                insert_statement = f'INSERT INTO "DBADMIN"."db_changes" VALUES ({values_str})'
                self.connection_context.connection.cursor().execute(insert_statement)

    def create_edge(self, source_key, target_key, edge_title):
        """
        Given a source and target key which refer to nodes, create an edge with a title between them. Handle the issue
        where the edge already exists but still return a complete edge with nodes.

        :param source_key: str
            Key of the node from which the edge should originate.
        :param target_key: str
            Key of the node from which the edge should terminate.
        :param edge_title: str
            Type of edge.
        :return: dict
            Message of the result and subgraph in UI5 format containing the nodes and new edge.
        """

        key = self.hash_values([source_key, target_key, edge_title])
        source_node = self.get_node(source_key)
        target_node = self.get_node(target_key)
        values_str = f"1, '{key}', '{source_key}', '{target_key}', '{edge_title}', '{None}', '{None}'"
        insert_statement = f'INSERT INTO "DBADMIN"."{self.edges_table}" VALUES ({values_str})'
        try:
            self.connection_context.connection.cursor().execute(insert_statement)
            message = f"{edge_title} edge created between {source_node['title']} and {target_node['title']}"
        except hdbcli.dbapi.IntegrityError:
            message = f"{edge_title} edge already exists between {source_node['title']} and {target_node['title']}"

        edge = {'key': key, 'from': source_key, 'to': target_key, 'title': edge_title, 'weight': 0, "description": "N/A"}
        sub_graph = SubGraph()
        sub_graph.transform_nodes_df_to_ui5(pd.DataFrame([
            source_node, target_node
        ]).fillna('N/A'))
        sub_graph.transform_edges_df_to_ui5(pd.DataFrame([edge ]))
        self.create_db_change_records(
            change_type="create_edge",
            nodes=[source_node, target_node],
            edges=[edge])
        exp = sub_graph.export_ui5()
        exp['message'] = message
        return exp

    def create_node(self, node):
        """
        Insert a new node with data manually entered by a user.

        :param node: dict
            Key, value pairs that describe a node to be entered into the DB.
        :return:
        """
        node['key'] = self.hash_values([node['type'], node['title'].lower()])
        insert_values = []
        for att in list(self.md_table_structure.keys()):
            if att in node.keys():
                insert_values.append(f"'{node[att]}'")
            else:
                insert_values.append('NULL')
        values_str = ', '.join(insert_values)
        insert_statement = f'INSERT INTO "DBADMIN"."{self.nodes_table}" VALUES ({values_str})'
        sub_graph = None
        try:
            self.connection_context.connection.cursor().execute(insert_statement)
            message = f"Successfully created {node['type']} with key {node['key']}"
            sub_graph = self.get_neighbors(node_id=node['key'])
            self.create_db_change_records(change_type="create_node", nodes=[node], edges=[])
        except hdbcli.dbapi.IntegrityError as err:
            if err.errorcode == 301:
                message = 'Node not created as it already exists'
                sub_graph = self.get_neighbors(node_id=node['key'])
            else:
                message = err.errortext
        except hdbcli.dbapi.ProgrammingError as err:
            message = 'Node not created. ' + err.errortext

        return {"message": message, "node_key": node['key'], "sub_graph": sub_graph}

    def merge_nodes(self, absorbing_key, merging_key):
        """
        Merge 2 nodes by keeping the node corresponding to the absorbing key and deleting the node corresponding to the
        merging key. Get all the edges of the merging node and change the source or target (from, to) to the absorbing
        key. Update the resolution_mapping table so the merging key value is the absorbing key. Lastly, update the
        back up tables with the changes.

        :param absorbing_key: str
            Key that corresponds to the node which will remain after the merging operation.
        :param merging_key: str
            Key that corresponds to the node that will be deleted after the merging operation.

        :return: str, dict
            Message of the results of the operation.
            UI5 formatted node otherwise
        """
        logger.info(f'Merging {merging_key} into {absorbing_key}')
        ui5_node = {"key": absorbing_key, "attributes": []}
        nodes = self.connection_context.sql(f'''
        SELECT *
        FROM "DBADMIN"."{self.nodes_table}"
        WHERE "key" in ('{merging_key}', '{absorbing_key}')
        ''').collect().fillna('')
        if len(nodes.values) == 2:
            node_a = node_b = {}
        else:
            message = f'Merge not processed. Check that both {merging_key} and {absorbing_key} are in the master data.'
            return {'message': message}
        for index, node in nodes.iterrows():
            if node['key'] == absorbing_key:
                node_a = node.to_dict()
                ui5_node['title'] = node_a['title']
                ui5_node['icon'] = node_a['icon']
                ui5_node['status'] = node_a['status']
            else:
                node_b = node.to_dict()
        # Update the absorbing node with any non-critical attributes that are not null from the merging node
        updated_atts = {}
        for att in node_b:
            if att not in ['key', 'icon', 'type', 'status', 'title']:
                if node_b[att] and not node_a[att]:
                    updated_atts[att] = node_b[att]
                    ui5_node['attributes'].append({'label': att, 'value': node_b[att]})
                elif node_a[att]:
                    ui5_node['attributes'].append({'label': att, 'value': node_a[att]})
        if len(updated_atts) > 0:
            update_statement = f", ".join([f'''"{att}" = '{updated_atts[att]}' '''.strip() for att in updated_atts])
            self.connection_context.connection.cursor().execute(f'''
            UPDATE "DBADMIN"."{self.nodes_table}"
            SET {update_statement}
            WHERE "key" = '{absorbing_key}'
            ''')
        # Delete the merging node
        self.connection_context.connection.cursor().execute(f'''
        DELETE FROM "DBADMIN"."{self.nodes_table}"
        WHERE "key" = '{merging_key}'
        ''')
        # Get the count of edges that will be changed
        merging_edges = self.connection_context.sql(f'''
        SELECT *
        FROM "DBADMIN"."edge_table"
        WHERE "from" = '{merging_key}' or "to" = '{merging_key}'
        ''').collect().fillna('')
        # Update the edges in place where from exists
        self.connection_context.connection.cursor().execute(f'''
        UPDATE "DBADMIN"."edge_table"
        SET "from" = '{absorbing_key}'
        WHERE "from" = '{merging_key}'
        ''')
        # Update the edges in place where to exists
        self.connection_context.connection.cursor().execute(f'''
        UPDATE "DBADMIN"."edge_table"
        SET "to" = '{absorbing_key}'
        WHERE "to" = '{merging_key}'
        ''')
        # Update the mapping table
        self.connection_context.connection.cursor().execute(f'''
        UPDATE "DBADMIN"."resolution_mapping"
        SET "map" = '{absorbing_key}'
        WHERE "key" = '{merging_key}'
        ''')
        self.create_backup()
        self.create_db_change_records(
            'merge',
            [node_a, node_b],
            [{'key': ed['key'], 'from': ed['from'], 'to': ed['to']} for index, ed in merging_edges.iterrows()]
        )
        message = f'Removed node {merging_key} and updated {len(merging_edges.values)} edges with {absorbing_key}.'
        return {'message': message, 'absorbing_node': ui5_node}

    @staticmethod
    def hash_values(values):
        """
        Standardized method to hash values for creating anonymized ids.
        :param values: list
        :return: str
        """
        str_values = ''.join(values).replace(" ", "")
        return str(hashlib.md5(str_values.encode()).hexdigest())

    def check_resolution_mapping(self):
        tbl = self.connection_context.table(table=self.resolution_table).collect().fillna('')
        if tbl.shape[0] < 2:
            nodes = self.connection_context.table(table=self.nodes_table).collect().fillna('')
            ndf = pd.DataFrame([{"key": nd['key'], "map": nd['key']} for idx, nd in nodes.iterrows()])
            create_dataframe_from_pandas(
                connection_context=self.connection_context,
                drop_exist_tab=False,
                table_name=self.resolution_table,
                pandas_df=pd.DataFrame(ndf)
            )

    @staticmethod
    def clean_punc(s):
        return s.translate(str.maketrans('', '', string.punctuation)).replace(" ", "")

    def get_situations_tf(self):
        """
        Collect all edges with the label InvolvedInCounseling, InvolvedInCrime or InvolvedInCP.
        Get the source of each of those edges as candidates
        Confirm candidates if they have 2 or more edges or those types
        Collect all edges for the candidates with the label HasChild or HasSibling.
        If any of the source/target of the edge is also in candidates, then it is a troubled family.

        :return:
        """

        def get_events(fam_id, candidate_list, node_data):
            events = [node_data[event] for event in candidate_list[fam_id]['hits']]
            sits = []
            for event in events:
                date_start = [att['value'] for att in event['attributes'] if att['label'] == 'dateTime'][0]
                date_start = change_if_date(date_start)
                date_end = datetime.strftime(
                    datetime.strptime(date_start, '%Y-%m-%d %H:%M') + timedelta(hours=6), '%Y-%m-%d %H:%M')
                sits.append(
                    {
                        "Name": event['title'],
                        "key": event['key'],
                        "dates": [
                            {
                                "Date start": date_start,
                                "Date end": date_end
                            }
                        ]
                    }
                )
            return sits

        # Set the trigger edge data
        trig_edge_types = ['InvolvedInCounseling', 'InvolvedInCrime', 'InvolvedInCP']
        trig_edges = ', '.join([f"'{edge}'" for edge in trig_edge_types])
        trig_select_statement = f'''SELECT * FROM "{self.user}"."{self.edges_table}" WHERE "title" in ({trig_edges})'''
        tf_trigger_edges = hana_ml.DataFrame(
            self.connection_context, select_statement=trig_select_statement).collect().fillna('')

        # Collect candidates based on the trigger edges
        candidates = {}
        node_data_keys = []
        for index, trigger in tf_trigger_edges.iterrows():
            if trigger['from'] in candidates.keys():
                # More than 1 trigger is a confirmation
                candidates[trigger['from']]['hits'].append(trigger['to'])
                node_data_keys.append(trigger['to'])
            else:
                candidates[trigger['from']] = {'hits': [trigger['to']]}
                node_data_keys.append(trigger['to'])
                node_data_keys.append(trigger['from'])

        # Set the family edge data
        sub = SubGraph()
        fam_edge_types = ['HasChild', 'HasSibling']
        fam_edges = ', '.join([f"'{edge}'" for edge in fam_edge_types])
        confirmed_keys = ', '.join([f"'{conf_key}'" for conf_key in node_data_keys])
        fam_select_statement = f'''SELECT * FROM "{self.user}"."{self.edges_table}" WHERE "title" in ({fam_edges}) AND "from" in ({confirmed_keys}) AND "to" in ({confirmed_keys})'''
        tf_family_edges = hana_ml.DataFrame(self.connection_context, select_statement=fam_select_statement).collect()
        node_data_select = f'''SELECT * FROM "{self.user}"."{self.nodes_table}" WHERE "key" in ({confirmed_keys})'''
        node_data = sub.transform_nodes_df_to_dict(
            hana_ml.DataFrame(self.connection_context, select_statement=node_data_select).collect())
        sit_build = {}
        for index, fam in tf_family_edges.iterrows():
            fam_name = [att['value']
                           for att in node_data[fam['from']]['attributes'] if att['label'] == 'nameLast'][0]
            lives_at = [ast.literal_eval(att['value'])['id']
                           for att in node_data[fam['from']]['attributes'] if att['label'] == 'livesAt'][0]
            if lives_at in sit_build.keys():
                if fam['from'] not in sit_build[lives_at]['keys']:
                    sit_build[lives_at]['situations'].append(
                        {
                            "Name": "{} {}".format([att['value'] for att in node_data[fam['from']]['attributes'] if
                                                    att['label'] == 'nameFirst'][0], fam_name),
                            "key": fam['from'],
                            "Total Events": len(candidates[fam['from']]['hits']),
                            "situations": get_events(fam['from'], candidates, node_data)
                        }
                    )
                    sit_build[lives_at]['keys'].append(fam['from'])
                elif fam['to'] not in sit_build[lives_at]['keys']:
                    sit_build[lives_at]['situations'].append(
                        {
                            "Name": "{} {}".format([att['value'] for att in node_data[fam['to']]['attributes'] if
                                                    att['label'] == 'nameFirst'][0], fam_name),
                            "key": fam['from'],
                            "Total Events": len(candidates[fam['to']]['hits']),
                            "situations": get_events(fam['to'], candidates, node_data)
                        }
                    )
                    sit_build[lives_at]['keys'].append(fam['to'])
            else:
                if not self.node_data:
                        self.node_data = self._master_data_view()
                        self.line_data = self._edge_data_view()
                situation = {
                    "Family": fam_name,
                    "key": lives_at,
                    "keys": [fam['from'], fam['to']],
                    "situations": [
                        {
                            "Name": "{} {}".format([att['value'] for att in self.node_data[fam['from']]['attributes'] if
                                                    att['label'] == 'nameFirst'][0], fam_name),
                            "key": fam['from'],
                            "Total Events": len(candidates[fam['from']]['hits']),
                            "situations": get_events(fam['from'], candidates, node_data)
                        },
                        {
                            "Name": "{} {}".format([att['value'] for att in node_data[fam['to']]['attributes'] if
                                                    att['label'] == 'nameFirst'][0], fam_name),
                            "key": fam['to'],
                            "Total Events": len(candidates[fam['to']]['hits']),
                            "situations": get_events(fam['to'], candidates, node_data)
                        },
                    ]

                }
                sit_build[lives_at] = situation

        return {"situations": [sit_build[sit] for sit in sit_build], "message": f"Found {len(sit_build)} at risk families situations"}

    def get_node(self, node_id):

        ndf = hana_ml.DataFrame(
            self.connection_context,
            select_statement=f'''SELECT * FROM "{self.user}"."{self.nodes_table}" WHERE "key" = '{node_id}' ''').collect()
        node = {}
        for index, row in ndf.iterrows():
            for key in row.keys():
                if row[key]:
                    node[key] = row[key]
        return node

    def handle_inconsistent_graph(self, err):
        err_1 = err.args[0][err.args[0].find('invalid vertex key'):]
        err_2 = err_1[err_1.find("'"):].replace(".", "")
        sql = f"""
        DELETE FROM "DBADMIN"."edge_table" WHERE "from" = {err_2} OR "to" = {err_2}
        """
        self.connection_context.connection.cursor().execute(sql)

    def get_neighbors(self, node_id, lower_bound=0, upper_bound=1, direction='ANY'):
        """
        Get neighbors from the graph including options that can define the depth and direction
        to search.

        :param node_id: str
            Key of the node from which to start the search.
        :param lower_bound: int, optional
            The count of degrees of separation from which to start considering neighbors.

            Defaults to 0 to include the start node.
        :param upper_bound: int, optional
            The count of degrees of separation at which to end considering neighbors.

            Defaults to 1.
        :param direction: OUTGOING, INCOMING, or ANY which determines the algorithm results.

            Defaults to ANY.

        :return: dict
            Sub-graph of the nodes and edges in a UI5 format.
        """
        self._check_pole_graph()
        nbrs = ""
        try:
            nbrs = hga.NeighborsSubgraph(graph=self.graph).execute(
                start_vertex=node_id,
                lower_bound=lower_bound,
                upper_bound=upper_bound,
                direction=direction
            )
        except ValueError as err:
            logger.info(err)
            return {
                "message": err.args[0],
                "nodes": [], "lines": [], "status": 201
            }
        except RuntimeError as err:
            self.handle_inconsistent_graph(err)
            self.get_neighbors(node_id=node_id, lower_bound=lower_bound, upper_bound=upper_bound, direction=direction)
        sub = SubGraph()
        # Create a string to be used for the sql statement that gets the nodes
        node_keys = ", ".join([f"'{node['key']}'" for index, node in nbrs.vertices.iterrows()])
        sub.transform_nodes_df_to_ui5(hana_ml.DataFrame(
            self.connection_context,
            select_statement=f'''
            SELECT * FROM "{self.user}"."{self.nodes_table}" WHERE "key" in ({node_keys})''').collect().fillna(''))
        edge_keys = ", ".join([f"'{edge['key']}'" for index, edge in nbrs.edges.iterrows()])
        if len(edge_keys) > 0:
            sub.transform_edges_df_to_ui5(hana_ml.DataFrame(
                self.connection_context,
                select_statement=f'''
                SELECT * FROM "{self.user}"."{self.edges_table}" WHERE "key" in ({edge_keys})''').collect().fillna(''))
        return sub.export_ui5()

    def get_edge(self, node_a, node_b):
        """
        Using a source and target, get the shortest path
        :param node_a: str
            Key of one of the 2 nodes in an edge to find
        :param node_b: str
            Key of one of the 2 nodes in an edge to find
        :return:
        """
        sub = SubGraph()
        node_keys = f"'{node_a}', '{node_b}'"
        sub.transform_nodes_df_to_ui5(hana_ml.DataFrame(
            self.connection_context,
            select_statement=f'''SELECT * FROM "{self.user}"."{self.nodes_table}" WHERE "key" in ({node_keys})''').collect())
        edge_sql = f'''SELECT * FROM "{self.user}"."{self.edges_table}" WHERE "to" in ({node_keys}) OR "from" in ({node_keys})'''
        sub.transform_edges_df_to_ui5(hana_ml.DataFrame(
            self.connection_context,
            select_statement=edge_sql).collect().fillna(''))
        return sub.export_ui5()

    def get_shortest_path(self, source, target, k=3):
        """
        Use HANA graph to get the shortest path between a source and target.

        :param source: str
            Key of the source/from node/vertex.
        :param target: str
            Key of the target/to node/vertex.
        :param k: int
            Number of paths to be calculated.

            Default to 3.
        :return: json
            UI5 ready graph of nodes and lines.
        """
        self._check_pole_graph()
        try:
            sp = hga.ShortestPath(graph=self.graph).execute(source=source, target=target, direction="ANY")
        except ValueError as err:
            logger.info(err)
            return {
                "message": err.args[0],
                "nodes": [], "lines": [], "status": 201
            }
        if len(sp.edges.index) == 0:
            return {
                "message": "No path between {} and {}".format(source, target),
                "nodes": [], "lines": [], "status": 201
            }
        sub = SubGraph()
        edge_keys = ", ".join([f"'{edge['key']}'" for index, edge in sp.edges.iterrows()])
        sub.transform_edges_df_to_ui5(hana_ml.DataFrame(
            self.connection_context,
            select_statement=f'''
            SELECT * FROM "{self.user}"."{self.edges_table}" WHERE "key" in ({edge_keys})''').collect().fillna(''))
        node_index = []
        for line in sub.links:
            if line['from'] not in node_index:
                node_index.append(line['from'])
            if line['to'] not in node_index:
                node_index.append(line['to'])
        node_keys = ", ".join([f"'{node}'" for node in node_index])
        sub.transform_nodes_df_to_ui5(hana_ml.DataFrame(
            self.connection_context,
            select_statement=f'''
            SELECT * FROM "{self.user}"."{self.nodes_table}" WHERE "key" in ({node_keys})''').collect().fillna(''))

        return sub.export_ui5()

    def get_suggestion_items(self, search_value):
        """
        Get a search based on HANA fuzzy search.

        :param search_value: str
            The string provided by the user for searching.
        :return: list
            Key, value pairs based on the search value
        """
        hdf = hana_ml.DataFrame(
            self.connection_context,
            f'''
            SELECT * FROM "{self.user}"."{self.nodes_table}" WHERE CONTAINS ("title", '{search_value}', FUZZY (0.85))'''
        ).collect().fillna('')
        return {
            "suggestions": [
                {
                    "key": row['key'],
                    "text": row['title'],
                    "icon": (row['icon'] if row['icon'] else UI5_ICON_MAP['Default'])
                }
                for index, row in hdf.iterrows()
            ]
        }

    def _master_data_view(self):
        """
        Create a view so that calls to the DB don't need to be made and nodes are in a UI5 format.
        :return: dict
        """
        with open(os.path.join(self.data_path, 'networkgraph.json')) as f:
            data = json.load(f)
        return {node['key']: node for node in data['nodes']}

    def _edge_data_view(self):
        """
        Create a view so that calls to the DB don't need to be made and edges are in a UI5 format including title.
        :return: dict
        """
        e_df = pd.read_csv(os.path.join(self.data_path, 'edge_table.csv'),
                           on_bad_lines='skip', low_memory=False).fillna("NA").convert_dtypes()
        return {line['key']: {
            'title': line['title'],
            'description': line['description'],
            'from': line['from'],
            'to': line['to']
        } for index, line in e_df.iterrows()}

    def create_hana_graph_from_csv(self, filename_nodes, filename_edges):
        """
        Create a graph from a nodes table and edges table using hana_ml.

        :param filename_nodes: str
            Filename for the nodes expected to be in the data path of the db api.

        :param filename_edges: str
            Filename for the edges expected to be in the data path of the db api.

        :return: hana_ml.graph
        """
        table_name = filename_nodes[:filename_nodes.find(".")]
        if not self.connection_context.has_table(table_name, self.connection_context.get_current_schema()):
            logger.info(f"Creating HANA dataframe {table_name}")
            n_df = pd.read_csv(os.path.join(self.data_path, filename_nodes)).fillna("NA").convert_dtypes()
            n_hdf = create_dataframe_from_pandas(
                connection_context=self.connection_context,
                pandas_df=n_df,
                primary_key="key",
                table_name=table_name,
                table_structure=self.md_table_structure,
                schema=self.connection_context.get_current_schema(),
                drop_exist_tab=True,
                force=True
            )
            unique_statement = f'''ALTER TABLE "DBADMIN"."{self.nodes_table}" ALTER ("key" NVARCHAR(500) UNIQUE)'''
            self.connection_context.connection.cursor().execute(unique_statement)
            logger.info(f"{table_name} created in {self.connection_context.get_current_schema()}")
        else:
            n_hdf = self.connection_context.table(table_name)
        table_name = filename_edges[:filename_edges.find(".")]
        if not self.connection_context.has_table(table_name, self.connection_context.get_current_schema()):
            e_df = pd.read_csv(os.path.join(self.data_path, filename_edges)).fillna("NA").convert_dtypes()
            e_hdf = create_dataframe_from_pandas(
                connection_context=self.connection_context,
                pandas_df=e_df,
                primary_key="key",
                table_name=table_name,
                schema=self.connection_context.get_current_schema(),
                drop_exist_tab=True,
                force=True
            )
            logger.info(f"{table_name} created in {self.connection_context.get_current_schema()}")
        else:
            e_hdf = self.connection_context.table(table_name)
        hgf = create_graph_from_hana_dataframes(
            connection_context=self.connection_context,
            vertices_df=n_hdf,
            vertex_key_column='key',
            edges_df=e_hdf,
            edge_key_column="key",
            force=True,
            workspace_name="graph_one"
        )
        logger.info("Created graph.")
        return hgf

    def get_connection_context(self):
        """
        Create a connection with HANA to use with hana_ml.

        :return: hana_ml.ConnectionContext
        """
        cc = hana_ml.ConnectionContext(
            address=self.address,
            port=int(self.port),
            user=self.user,
            password=self.pwd,
            encrypt='true',
            autocommit=True,
            sslValidateCertificate='false'
        )
        logger.info(f'Connected to {self.address} version {cc.hana_version()}')
        return cc

    def create_master_data(self):
        """
        Data preparation function used prior to productive use in which master_data needs to be enhanced with locations
        or other pre-defined data sets.

        :return:
        """
        md_df = pd.read_excel(os.path.join(os.getcwd(), 'Basebook.xls'), sheet_name="Locations").fillna("NA").convert_dtypes()
        md_list = [{
            "key": self.hash_values(['Location', self.clean_punc(row['city'])]),
            "title": row['city_ascii'],
            "icon": UI5_ICON_MAP['Location'],
            "status": "Standard",
            "category": "area",
            "met-id": None,
            "scope": None,
            "type": "city",
            "lat": row['lat'],
            "lon": row['lng'],
            "unit": None,
            "section": None,
            "rank": None,
            "Req": None,
            "code": None,
            "components": None,
            "image": None,
            "kpiSubTitle": None,
            "kpiValue": None,
            "kpiColor": None,
            "important": None,
            "label": None,
            "readiness": None,
            "comments": None,
            "Lat": row['lat'],
            "Lon": row['lng'],
            "D_Lat": None,
            "D_Lon": None,
            "city": row['city_ascii'],
            "country": row['country'],
            "Unnamed: 0": None,
            "place_key": None,
            "class": None,
            "address": None,
            "postcode": None,
            "dateTime": None,
            "description": f"{row['city_ascii']} {row['province']}, {row['country']}",
            "nameFirst": None,
            "nameLast": None,
            "hasChildren": None,
            "married": None,
            "age": None,
            "dob": None,
            "gender": None,
            "sc_interests": None,
            "sc_education": None,
            "sc_occupation": None,
            "sc_charisma": None,
            "sc_engagement": None,
            "sc_personality": None,
            "sc_tolerance": None,
            "sc_culture": None,
            "sc_ethnic": None,
            "sc_locale": None,
            "sc_soc_class": None,
            "culture": None,
            "ethnic": None,
            "interests": None,
            "occupation": None,
            "personality": None,
            "pob": None,
            "livesAt": None,
            "color": None,
            "endDate": None,
            "URL": None,
            "geometry": None
        } for index, row in md_df.iterrows()]
        pd.DataFrame(md_list).to_csv(path_or_buf=os.path.join(os.getcwd(), "data", "locations_md_ready.csv"))

    def create_geo_table(self):
        """
        Get the master data from HANA to create a locations table for spatial queries.

        :return:
        """
        try:
            md_df = self.connection_context.table(table=self.nodes_table).collect().fillna('')
            locations = []
            for index, row in md_df.iterrows():
                if row['lon'] and row['lon'] != 'NA':
                    try:
                        locations.append({
                            "key": row['key'],
                            "title": row['title'],
                            "lon": float(row['lon']),
                            "lat": float(row['lat']),
                            "category": str(row['category']).strip()
                        })
                    except ValueError:
                        logger.error(row)
            create_dataframe_from_pandas(
                connection_context=self.connection_context,
                table_name=self.locations_table,
                geo_cols=[('lon', 'lat')],
                pandas_df=pd.DataFrame(locations),
                object_type_as_bin=True,
                schema=self.connection_context.get_current_schema(),
                drop_exist_tab=True,
                force=True,
                table_structure=self.geo_locations_structure
            )
        except hdbcli.dbapi.ProgrammingError:
            logger.error("No master data table exists. Creating...")
            self.create_hana_graph_from_csv()
            self.create_geo_table()

    @staticmethod
    def get_location_color(category):
        return CATEGORY_MAP[category] if category in CATEGORY_MAP.keys() else "rgba(240,171,0,0.6)"

    def calculate_radius_size_based_on_edges(self, row):
        """
        Normalize a radius based on the connections a node has.

        :return: float
            Size of the bubble.
        """
        self._check_pole_graph()
        radius = .3 * len(self.graph.in_edges(row['key'])) + 5
        if radius > 100:
            radius = 100 + radius/100
        return radius

    def get_points_within_distance(self, radius, lon, lat, result_type=False, cat_filter="NA, GPE, LOC"):
        """
        Conduct a spatial search using the binary, WithinDistance transform. If a point in the database is within the
        given radius (kilometers) then a 1 will be returned. Therefore, collect the point and aggregate it into a list
        so it can be rendered in the calling application along with a title and key that corresponds with a graph node.

        :param radius: int
            Distance in kilometers from which to base a geo search.
        :param lon: float
            Longitude of the center point from which to base the radius.
        :param lat: float
            Latitude of the center point from which to base the radius.
        :param result_type: bool
            Switch to determine if the results should include connectivity statistics or not.
        :param cat_filter: str
            Categories of locations to filter in string form so it can be properly formatted for sending to SQL query.

        :return: dict
            Results as a message and list of the points found within the search.
        """
        cat_filter_string = ", ".join([f"'{cat}'".strip() for cat in cat_filter.split(",")])
        geo_df = self.connection_context.sql(f'''
        SELECT 
            "key",
            "title",
            "lon",
            "lat",
            "category"
        FROM "DBADMIN"."{self.locations_table}"
        WHERE "lon_lat_GEO".ST_WithinDistance ( NEW ST_Point('POINT({lon} {lat})', 4326), {radius}, 'kilometer') = 1 AND
        "category" IN ({cat_filter_string})
        ''').collect().fillna('')
        locations = [{
            "key": row['key'],
            "tooltip": f"{row['category']}: {row['title']}",
            "color": self.get_location_color(row['category']),
            "position": f"{row['lon']};{row['lat']};0;",
            "radius": 5
        } for index, row in geo_df.iterrows()]

        if result_type:
            locations = [{
                **row,
                "radius": self.calculate_radius_size_based_on_edges(row)
            } for row in locations]

        return {
            "message": f'Found {len(locations)} locations within {radius} KM from Lon: {lon}, Lat: {lat}',
            "locations": locations
        }

    def get_table_to_csv(self, table):
        try:
            pdf = self.connection_context.table(table).collect().fillna('')
            pdf.to_csv(os.path.join(self.data_path, f"{table}.csv"))
            logger.info(f'Created {table}.csv at {self.data_path}')
        except hdbcli.dbapi.ProgrammingError:
            logger.error(f"No table by the name {table}")
            return

    def get_situations_cases(self):
        trig_select_statement = f'''SELECT * FROM "{self.user}"."{self.nodes_table}" WHERE "icon" = 'sap-icon://folder' '''
        tsc_nodes = hana_ml.DataFrame(
            self.connection_context, select_statement=trig_select_statement).collect().fillna('')
        logger.info(f'Found {len(tsc_nodes)} case situations.')
        sit_build = {}
        for idx, row in tsc_nodes.iterrows():
            sit_build[row['key']] = {
                "key": row['key'],
                "title": row['title'],
                "nbr": 2,
                "situations": []
            }
            nbrs = self.get_neighbors(row['key'], lower_bound=1, upper_bound=1)
            for nbr in nbrs['nodes']:
                sit_build[row['key']]['situations'].append({
                    "key": nbr['key'],
                    "title": nbr['title'],
                })

        return {"situations": [sit_build[sit] for sit in sit_build], "message": f'Found {len(sit_build)} cases with new data'}

    def get_situations_surveillance(self):
        """
        Get the coincidence of surveillance beacons that have been in the same place and time
        :return: dict
            Situations formatted for a tree-table
        """

        trig_select_statement = f'''SELECT * FROM "{self.user}"."{self.nodes_table}" WHERE "category" = 'Space time coincidence' AND "section" = 'classified operations' '''
        tsc_nodes = hana_ml.DataFrame(
            self.connection_context, select_statement=trig_select_statement).collect().fillna('')
        message = f'Found {len(tsc_nodes)} surveillance situations.'
        logger.info(message)
        sit_build = {}
        for idx, row in tsc_nodes.iterrows():
            sit_build[row['key']] = {
                "key": row['key'],
                "title": row['title'],
                "situations": []
            }
            nbrs = self.get_neighbors(row['key'], lower_bound=1)
            for nbr in nbrs['nodes']:
                lat = lon = dtg = None
                if nbr['icon'] == 'sap-icon://map':
                    lat = [att['value'] for att in nbr['attributes'] if att['label'] == 'lat'][0]
                    lon = [att['value'] for att in nbr['attributes'] if att['label'] == 'lon'][0]
                    dtg = "N/A"
                elif nbr['icon'] == 'sap-icon://sys-find':
                    lat = "N/A"
                    lon = "N/A"
                    dtg = [att['value'] for att in nbr['attributes'] if att['label'] == 'dateTime'][0]
                if lat and lon and dtg:
                    sit_build[row['key']]['situations'].append({
                        "key": nbr['key'],
                        "title": nbr['title'],
                        "lat": lat,
                        "lon": lon,
                        "dtg": dtg
                    })

        logger.info('Complete with situation build')
        return {"situations": [sit_build[sit] for sit in sit_build], "message": message}

    def export_main_tables(self):
        for tbl in self.all_tables:
            self.get_table_to_csv(tbl)


if __name__ == "__main__":
    hdb = HanaDbApi()
    result = hdb.setup()
    if result:
        logger.error(result)
    else:
        logger.info("HDB setup complete")
