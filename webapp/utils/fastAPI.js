sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (JSONModel, MessageToast) {
    return {
        setURLs: function () {
            /**
             * Set up the different endpoints that the application will get.
             * currentSelection is changed by the onPressWorkspace function and is based on the key of the selectedKey of the drop-down list choice.
             * Will need to replace the forceElementOrgID='key' in the s4 string
             */

            var api_url = 'https://compass-api.cfapps.eu11.hana.ondemand.com'
            //var api_url = 'http://127.0.0.1:8000'
            var oModel = new JSONModel({
                main_url: api_url,
                currentSelection: {
                    id: "simulations"
                },
                simulations: {
                    id: "simulations",
                    searchURL: api_url + "/get_suggestion_items/",
                    getNeighborsURL: api_url + "/get_neighbors/",
                    getShortestPathURL: api_url + "/get_shortest_path/",
                    getEdge: api_url + "/get_edge/",
                    getNodeURL: api_url + "/get_node/",
                    top: api_url + "/get_top/Person",
                    getSituationsURL: api_url + "/get_situations/",
                    getSituationsTFURL: api_url + "/get_tf_situations/",
                    getSituationsPSURL: api_url + "/get_ps_situations/",
                    getSituationsCSURL: api_url + "/get_cs_situations/",
                    getGeoSearch: api_url + "/get_geo_search/",
                    mergeNodesURL: api_url + "/merge_nodes/",
                    createNodeURL: api_url + "/create_node/",
                    updateNodeURL: api_url + "/update_node/",
                    createEdgeURL: api_url + "/create_edge/",
                    getGeoShortestPathURL: api_url + "/get_geo_shortest_path/"
                },
                s4: {
                    id: "s4",
                    searchURL: "https://uzt840-qkm903.wdf.sap.corp/sap/opu/odata/sap/DFS_FE_FRCELMNTORG_SRV/C_FrcElmntOrgTP?sap-client=840&$skip=0&$top=20&$filter=substringof(%27#SEARCH#%27,FrcElmntOrgName)&$format=json",
                    top20FE: "https://uzt840-qkm903.wdf.sap.corp/sap/opu/odata/sap/DFS_FE_FRCELMNTORG_SRV/C_FrcElmntOrgTP?sap-client=840&$skip=0&$top=20&$format=json",
                    top20POS: "https://uzt840-qkm903.wdf.sap.corp/sap/opu/odata/sap/DFS_POS_DEFENSEPOSITION_SRV/C_DFS_PositionHeaderTP?sap-client=840&$skip=0&$top=20&$format=json",
                    top20METL: " https://uzt840-qkm903.wdf.sap.corp/sap/opu/odata/sap/DFS_CAP_MSNESNLTSK_SRV/C_MissionEssentialTaskTP?sap-client=840&$skip=0&$top=20&$format=json",
                    top20CAP: "https://uzt840-qkm903.wdf.sap.corp/sap/opu/odata/sap/DFS_CAP_CAPBLTOBJECT_SRV/C_DfsCapabilityObjectTP?sap-client=840&$skip=0&$top=15&$format=json",
                    getTopSubGraph: "https://uzt840-qkm903.wdf.sap.corp/sap/opu/odata/sap/DFS_FE_FRCELMNTORG_SRV/C_FrcElmntOrgTP(ForceElementOrgID='50000077',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)/to_FrcElmntOrgStrucRelshpTP?$format=json",
                    getNeighborsURL: "https://uzt840-qkm903.wdf.sap.corp/sap/opu/odata/sap/DFS_FE_FRCELMNTORG_SRV/C_FrcElmntOrgTP(ForceElementOrgID='#SEARCHKEY#',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)/to_FrcElmntOrgStrucRelshpTP?$format=json"
                }
            })

            sap.ui.getCore().setModel(oModel, "apiModel")

            return ({
                "Workspaces": [
                    {"Name": "S4-D&S", "ID": "s4"},
                    {"Name": "Simulations", "ID": "simulations"},
                    {"Name": "OSINT", "ID": "osint"},
                ]
            })
        },
        
        getGeoSearch: async function (radius, lat, lon, resultType, sCatFilter) {
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no geo search path endpoint for s4 yet")
            } else {
                var url = api.getGeoSearch + radius + "/" + lat + "/" + lon + "/" + resultType + "/" + sCatFilter
                return fetch(url)
                    .then(resp => resp.json())
            }

        },

        getShortestPathBetweenPoints: async function(points) {
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no shortest path between points endpoint for s4 yet")
            } else {
                var url = api.getGeoShortestPathURL + points
                return fetch(url)
                    .then(resp => resp.json())
            }

        },

        postCreateNode: async function (oNodeShell) {
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no create node endpoint for s4 yet")
            } else {
                var url = api.createNodeURL
                return fetch(url, {
                    method: "post",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(oNodeShell)
                }).then(resp => resp.json())
            }

        },

        postUpdateNode: async function (oNodeShell) {
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no edit node endpoint for s4 yet")
            } else {
                var url = api.updateNodeURL
                return fetch(url, {
                    method: "post",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(oNodeShell)
                }).then(resp => resp.json())
            }

        },

        getproxy: async function (url) {
            /**
             * Use the python API as a proxy to get OData API sources.
             * Expect a URL and send embed it in a raw body and POST it to the proxy_get endpoint
             * Expect the calling function to use the form
             *  fastAPI.getproxy("https://services.odata.org/TripPinRESTierService/People").then((result)=>{
                    console.log(result)
            })
             */
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            
            var raw = "{\"url\": \"" + url + "\"}"
            
            var requestOptions = {
              method: 'POST',
              headers: myHeaders,
              body: raw,
              redirect: 'follow'
            };
            
            return fetch(sap.ui.getCore().getModel("apiModel").getData().main_url + "/proxy_get/", requestOptions)
                .then(response => response.json())
                .catch(error => console.log('error', error));
        },

        getSuggestionItems: async function (searchValue) {
            if(searchValue.length > 0){
                var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id],
                apiId = sap.ui.getCore().getModel("apiModel").getData().currentSelection.id
                if(apiId === 's4'){ 
                    var url = api.searchURL.replace("#SEARCH#", searchValue)
                    return this.getproxy(url)
                        .then(resp => this.processS4GetSuggestions(resp.d.results))
                } else if(apiId === 'osint'){
                    return fetch(api.searchURL + searchValue)
                        .then(resp => resp.json())
                } else {
                    url = api.searchURL + searchValue
                    return fetch(url)
                        .then(resp => resp.json())
                }
            }
        },

        getShortestPath: async function (source, target) {
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no shortest path endpoint for s4 yet")
            } else {
                var url = api.getShortestPathURL + source + "/" + target
                return fetch(url)
                    .then(resp => resp.json())
            }
        },

        getNode: async function (node_key) {
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no shortest path endpoint for s4 yet")
            } else {
                var url = api.getNodeURL + node_key
                return fetch(url)
                    .then(resp => resp.json())
            }
        },

        mergeNodes: async function (absorbingKey, mergingKey){
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no shortest path endpoint for s4 yet")
            } else {
                var url = api.mergeNodesURL + absorbingKey + "/" + mergingKey
                return fetch(url)
                    .then(resp => resp.json())
            }
        },

        createEdge: async function (sourceKey, targetKey, edgeTitle){
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no shortest path endpoint for s4 yet")
            } else {
                var url = api.createEdgeURL + sourceKey + "/" + targetKey + "/" + edgeTitle
                return fetch(url)
                    .then(resp => resp.json())
            }
        },

        getNeighbors: async function (sKey, lowerBound, upperBound, direction) {
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                var url = api.getNeighborsURL.replace("#SEARCHKEY#", sKey)
                return this.getproxy(url)
                    .then(resp => this.processS4GetNeighbors(resp.d.results))
                    .catch(error => console.log('error', error));
            } else {
                if(lowerBound == undefined){
                    lowerBound = 0
                }
                if(upperBound == undefined){
                    upperBound = 1
                } 
                if(direction == undefined){
                    direction = "ANY"
                }
                url = api.getNeighborsURL + sKey + "/" + lowerBound + "/" + upperBound + "/" + direction
                return fetch(url)
                    .then(resp => resp.json())
            }

        },

        getEdge: async function (sNodeA, sNodeB) {
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                var url = api.getNeighborsURL
                return this.getproxy(url)
                    .then(resp => resp.json())
            } else {
                url = api.getEdge + sNodeA + "/" + sNodeB
                return fetch(url)
                    .then(resp => resp.json())
            }

        },

        getTopSubGraph: async function () {
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                var url = api.getTopSubGraph
                return this.getproxy(url)
                    .then(resp => this.processS4GetNeighbors(resp.d.results))
            } else {
                url = api.top
                return fetch(url)
                    .then(resp => resp.json())
            }
        },

        getSituations: async function (){
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no situations endpoint for s4 yet")
            } else {
                var url = api.getSituationsURL
                return fetch(url)
                    .then(resp => resp.json())
            }

        },

        getSituationsTF: async function (){
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no situations endpoint for s4 yet")
            } else {
                var url = api.getSituationsTFURL
                return fetch(url)
                    .then(resp => resp.json())
            }

        },

        getSituationsPS: async function (){
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no situations endpoint for s4 yet")
            } else {
                var url = api.getSituationsPSURL
                return fetch(url)
                    .then(resp => resp.json())
            }

        },

        getSituationsCS: async function (){
            var api = sap.ui.getCore().getModel("apiModel").getData()[sap.ui.getCore().getModel("apiModel").getData().currentSelection.id]
            if(sap.ui.getCore().getModel("apiModel").getData().currentSelection.id === 's4'){ 
                MessageToast.show("There is no situations endpoint for s4 yet")
            } else {
                var url = api.getSituationsCSURL
                return fetch(url)
                    .then(resp => resp.json())
            }

        },

        processS4GetSuggestions: function (data){

            var suggestionItems = []
            data.forEach(function (item){
                suggestionItems.push({
                    text: item.FrcElmntOrgName,
                    key: item.ForceElementOrgID
                })
            })
            return {suggestions: suggestionItems}

        },

        processS4GetNeighbors: function (data) {
            var nodes = []
            var lines = []
            var nodeIndex = []
            data.forEach(function (entity){
                if(!nodeIndex.includes(entity.ForceElementOrgID)){
                    var oNode = {
                        key: entity.ForceElementOrgID,
                        icon: "sap-icon://shield",
                        title: entity.FrcElmntOrgNameFoEd
                    }
                    oNode.attributes = [
                        {label: "Validity Start Date", value: entity.FrcElmntOrgValdtyStartDate},
                        {label: "Validity End Date", value: entity.FrcElmntOrgValdtyEndDate},
                        {label: "Planning Status", value: entity.FrcElmntOrgPlngStatusName}
                    ]
                    nodes.push(oNode)
                    nodeIndex.push(entity.ForceElementOrgID)
                }
                if(!nodeIndex.includes(entity.FrcElmntOrgRelatedOrgID)){
                    nodes.push({
                        key: entity.FrcElmntOrgRelatedOrgID,
                        icon: "sap-icon://shield",
                        title: "Child " + entity.FrcElmntOrgRelatedOrgID
                    })
                    nodeIndex.push(entity.FrcElmntOrgRelatedOrgID)
                }
                lines.push({
                    from: entity.ForceElementOrgID,
                    to: entity.FrcElmntOrgRelatedOrgID
                })
            })

            return {
                nodes: nodes,
                lines: lines
            }
        }
    }

});
