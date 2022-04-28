"""
Base routes to serve data to the App
"""
import os
import base64
import http.client
import json
import uvicorn
from typing import Dict
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger
from models import HanaDbApi
from utils import CONFIG


class URL(BaseModel):
    url: str


user_pass = base64.b64encode("{}:{}".format(CONFIG['USER_NAME'], CONFIG['USER_PASS']).encode())
port = int(os.environ.get('PORT'))
logger.info(port)
# Set up the API for the models (db) and the routes (app)
app = FastAPI(
    title="Marina Compass",
    description="API that provides endpoints to get data from SAP HANA using graph and spatial algorithms",
    version="0.1"
)
hdb = HanaDbApi()

# Expect the app to run on 8080 and provide it to the Cross Origin Request (CORS)
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/get_node/{node_key}/")
def get_node(node_key: str):
    results = hdb.get_node(node_key)
    return JSONResponse(status_code=200, content=results)


@app.get("/merge_nodes/{absorbing_key}/{merging_key}/")
def merge_nodes(absorbing_key: str, merging_key: str):
    results = hdb.merge_nodes(absorbing_key, merging_key)
    return JSONResponse(status_code=200, content=results)


@app.get("/create_edge/{source_key}/{target_key}/{edge_title}")
def create_edge(source_key: str, target_key: str, edge_title: str):
    results = hdb.create_edge(source_key, target_key, edge_title)
    return JSONResponse(status_code=200, content=results)


@app.post("/create_node/")
def create_node(node: Dict[str, str]):
    results = hdb.create_node(node)
    return JSONResponse(status_code=200, content=results)


@app.post("/update_node/")
def update_node(node: Dict[str, str]):
    results = hdb.update_node(node)
    return JSONResponse(status_code=200, content=results)


@app.get("/get_geo_search/{radius}/{lat}/{lon}/{result_type}/{cat_filter}")
def get_geo_search(radius: int, lat: float, lon: float, result_type: bool, cat_filter: str):

    sub_graph = hdb.get_points_within_distance(radius=radius, lat=lat, lon=lon, result_type=result_type,
                                               cat_filter=cat_filter)
    return JSONResponse(status_code=200, content=sub_graph)


@app.get("/get_neighbors/{node_id}/{lower_bound}/{upper_bound}/{direction}")
def get_neighbors(node_id: str, lower_bound: int, upper_bound: int, direction: str):
    sub_graph = hdb.get_neighbors(
        node_id=node_id, lower_bound=lower_bound, upper_bound=upper_bound, direction=direction)
    return JSONResponse(status_code=200, content=sub_graph)


@app.get("/get_suggestion_items/{search_value}")
def get_suggestion_items(search_value: str):
    return JSONResponse(status_code=200, content=hdb.get_suggestion_items(search_value))


@app.post("/proxy_get")
def proxy_get(url: URL):
    payload = ''
    headers = {"Authorization": 'Basic ' + user_pass.decode()}
    # separate the url into client and endpoint for passing into HTTP client
    url_base = url.url[url.url.find("//") + 2:]
    url_client = url_base[:url_base.find("/")]
    url_endpoint = url_base[url_base.find("/"):]
    conn = http.client.HTTPSConnection(url_client)
    conn.request("GET", url_endpoint, payload, headers)
    res = conn.getresponse()
    data = json.loads(str(res.read(), 'utf-8'))
    return JSONResponse(status_code=200, content=data)


@app.get("/get_shortest_path/{source}/{target}")
def get_shortest_path(source: str, target: str):
    return JSONResponse(status_code=200, content=hdb.get_shortest_path(source, target))


@app.get("/check_graph_consistency")
def check_graph_consistency():
    return JSONResponse(status_code=200, content=hdb.check_graph_consistency())


@app.get("/get_geo_shortest_path/{points}")
def get_geo_shortest_path(points: str):
    return JSONResponse(status_code=200, content=hdb.get_geo_shortest_path(points))


@app.get("/get_edge/{node_a}/{node_b}")
def get_edge(node_a: str, node_b: str):
    return JSONResponse(status_code=200, content=hdb.get_edge(node_a, node_b))


@app.get("/get_tf_situations")
def get_tf_situations():
    return JSONResponse(status_code=200, content=hdb.get_situations_tf())


@app.get("/get_ps_situations")
def get_ps_situations():
    return JSONResponse(status_code=200, content=hdb.get_situations_surveillance())


@app.get("/get_cs_situations")
def get_cs_situations():
    return JSONResponse(status_code=200, content=hdb.get_situations_cases())


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
