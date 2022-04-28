sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/suite/ui/commons/networkgraph/layout/ForceDirectedLayout",
    "sap/suite/ui/commons/networkgraph/layout/LayeredLayout",
    "sap/suite/ui/commons/networkgraph/Node",
    "sap/suite/ui/commons/networkgraph/Line",
    "sap/suite/ui/commons/networkgraph/Group",
    "sap/suite/ui/commons/networkgraph/ActionButton",
    "sap/suite/ui/commons/networkgraph/NodeImage",
    "marina/utils/fastAPI",
    "sap/m/MessageToast",
    "sap/ui/core/CustomData",
    "sap/ui/core/Core",
    "sap/m/Link"
], function (BaseController, JSONModel, Button, ForceDirectedLayout, LayeredLayout, Node, Line, Group, ActionButton, NodeImage, fastAPI, MessageToast, CustomData, Core, Link) {
	"use strict";
	return BaseController.extend("marina.controller.NetworkGraph", {

        onInit: function () {
            // Start with a Force Directed layout setting
			sap.ui.getCore().setModel(new JSONModel({
                id: this.byId("graph").sId,
                forceDirectedSettings: new JSONModel({
                    optimalDistanceConstant: 0.26,
                    maxIterations: 200,
                    maxTime: 500,
                    initialTemperature: 200,
                    coolDownStep: 1
                }),
                layout: "layered",
                mode: "build",
                spPopover: this.byId("shortestPathPopover").sId,
                spSearch: this.byId("nodeBasedShortestPathSearchField").sId,
                gmapPopover: this.byId("graphMapPopover").sId,
                customizationPopover: this.byId("customizationPopover").sId,
                settingsPopoverForced: this.byId("settingsPopoverForced").sId,
                settingsPopoverLayered: this.byId("settingsPopoverLayered").sId,
                groupByAttributesPopover: this.byId("groupByAttributesPopover").sId,
                groupingToggle: this.byId("groupingToggle").sId,
                groupAttributeList: this.byId("groupAttributeList").sId,
                getNeighborsDegrees: [0, 1],
                streetViewPopOver: this.byId("streetViewPopOver").sId,
                getNeighborsDegreesSlider: this.byId("getNeighborsDegrees").sId,
                lastSearchedForNode: null,
                nodeIndex: [],
                lineIndex: {},
                locationsIndex: [],
                locations: [],
                geometries: [],
                timeSeriesIndex: {},
                attributesIndex: [],
                lineArrowPosition: "End",
                lineArrowOrientation: sap.suite.ui.commons.networkgraph.LineArrowOrientation.ParentOf,
                nodeShape: sap.suite.ui.commons.networkgraph.NodeShape.Circle
			}), "GRAPH_MODEL")

            this.base_url = sap.ui.getCore().getModel("API").getData().url;
            this.setToolbar(this.byId('graph'))
        },

        zoomToNode: function (sKey, summaryKey) {
            /**
             * Given a node key provided from the summary list (sKey), zoom to it and highlight it as selected.
             * Check if the node is in the graph and make all other nodes unselected.
             * If the node is not in the graph, get just the edge between it and the summaryKey and then load the
             * neighbors of the sKey and then set the sKey node as selected
             */
            var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
            // flag for situation if the node is found in the "de-select" loop
            var loadNode = true
            oGraph.getNodes().forEach(function (oNode) {
                oNode.setSelected(false)
                if(oNode.getKey() === sKey){
                    loadNode = false
                }
            })
            if(loadNode === true){
                // The node is not in the graph so get just the edge between the summaryKey and selected Key
                fastAPI.getEdge(sKey, summaryKey)
                .then((results) =>{
                    var summaryOnly = true
                    sap.ui.controller("marina.controller.Graph").setGraph(results, sKey)
                    sap.ui.controller("marina.controller.GraphExplorer").getNeighbors(sKey, summaryOnly)
                    var oNode = oGraph.getNodeByKey(sKey)
                    oNode.setSelected(true)
                    oGraph.zoom({zoomLevel: 1})
                    oGraph.scrollToElement(oNode)
                })
            } else {
                var oNode = oGraph.getNodeByKey(sKey)
                oNode.setSelected(true)
                oGraph.zoom({zoomLevel: 1})
                oGraph.scrollToElement(oNode)
            }
        },

        graphReady: function () {
            /**
             * Usability function in which the last searched for node is scrolled to after the graph layout is complete.
             */
            var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
            if(sap.ui.getCore().getModel("GRAPH_MODEL").getData().lastSearchedForNode !== null){
                oGraph.scrollToElement(oGraph.getNodeByKey(sap.ui.getCore().getModel("GRAPH_MODEL").getData().lastSearchedForNode))
            }
            
        },

		getGraphData: function (sURL, oModel) {
			$.ajax({
				url: sURL,
				success: function(data)  {
					if (data.status === 200)  {
                        sap.ui.controller("marina.controller.NetworkGraph").setGraph(data)
					}
					else  {
						MessageBox.error(data.data.message);
					}				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
            })
        },

        setToolbar: function(oGraph) {
            /**
             * Customize the graph toolbar with functions that allow the user to manipulate the visualization
             * 1) Change the standard toolbar search field tooltip to avoid perceived search duplication with Graph Explorer
             * 2) Change the layout between Layered (Orthoganal) and Force Directed
             * 3) Clear all the nodes and lines
             * 4) Change the graph build from iterative adding to constant refresh
             */
            var graphToolbar = oGraph.getToolbar();
            graphToolbar.getContent()[1].setPlaceholder("Canvas contents");
			// Leave the field in place but remove the icon so it doesn't confuse with the search in the Graph Explorer
			graphToolbar.getContent()[1].setShowSearchButton(false);
            graphToolbar.insertContent(new Button("customizeGraph", {
                type: "Transparent",
                icon: "sap-icon://customize",
                press: this.toggleCustomizations,
                tooltip: "{i18n>customizeGraph}",
                visible: true
            }))
            graphToolbar.insertContent(new Button("groupByAttributesButton", {
				type: "Transparent",
				icon: "sap-icon://grid",
				press: this.toggleGroupByAttributes,
				tooltip: "{i18n>groupByAttributes}",
				visible: true
			}))
            graphToolbar.insertContent(new Button("adjustSettingsButton", {
				type: "Transparent",
				icon: "sap-icon://action-settings",
				press: this.adjustSettings,
				tooltip: "{i18n>adjustGraphSettings}",
				visible: true
			}))
            graphToolbar.insertContent(new Button("toggleLayoutButton", {
				type: "Transparent",
				icon: "sap-icon://tree",
				press: this.toggleLayout,
				tooltip: "{i18n>toggleLayoutButton}",
				visible: true
			}))
            graphToolbar.insertContent(new Button("clearGraphButton", {
				type: "Transparent",
				icon: "sap-icon://delete",
				press: this.clearGraph,
				tooltip: "{i18n>clearGraph}",
				visible: true
			}))
            graphToolbar.insertContent(new Button("showGraphMap", {
				type: "Transparent",
				icon: "sap-icon://popup-window",
				press: this.toggleGraphMap,
				tooltip: "{i18n>toggleGraphMap}",
				visible: true
			}))

        },

        toggleCustomizations: function (oEvent) {
            var oPopOver = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().customizationPopover)
            oPopOver.setVisible(true)
            if(oPopOver.isOpen() === true){
                oPopOver.close()
            } else {
                oPopOver.openBy(oEvent.getSource())
            } 
        },

        toggleGroupByAttributes: function (oEvent) {
            // Get the attributes by which a grouping can be made and ensure there is a group for unassigned.
            var oPopOver = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().groupByAttributesPopover)
            var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
            if(!sap.ui.getCore().getModel("GRAPH_MODEL").getData().attributesIndex.includes("Unassigned")){
                oGraph.addGroup(new Group({key: "Unassigned", title: "Unassigned"}))
                sap.ui.getCore().getModel("GRAPH_MODEL").getData().attributesIndex.push("Unassigned")
            }
            var attributesModel = []
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().attributesIndex.forEach(function (sLabel){
                attributesModel.push({attributeName: sLabel})
            })
            oPopOver.setModel(new JSONModel({items: attributesModel}))
            oPopOver.setVisible(true)
            if(oPopOver.isOpen() === true){
                oPopOver.close()
            } else {
                oPopOver.openBy(oEvent.getSource())
            } 
        },

        adjustSettings: function (oEvent) {
            /**
             * Adjust the settings of the layout algorithm currently used in the graph. The event is triggered from the toolbar settings button.
             * The Popup is determined by the type of layout set in the graph. If it is already open, then it is closed. 
             * All settings are adjusted based on the button selected which maps to its own function within the country.
             */
            var sLayout = sap.ui.getCore().getModel("GRAPH_MODEL").getData().layout
            if(sLayout === "forced"){
                var oPopOver = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().settingsPopoverForced)

            } else {
                oPopOver = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().settingsPopoverLayered)
            }
            oPopOver.setVisible(true)
            if(oPopOver.isOpen() === true){
                oPopOver.close()
            } else {
                oPopOver.openBy(oEvent.getSource())
            } 
        },

        toggleLayout: function () {
            // Change the layout between layered or force directed
            var sLayout = sap.ui.getCore().getModel("GRAPH_MODEL").getData().layout
            var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
            if(sLayout === "forced"){
                oGraph.setLayoutAlgorithm(
                    new LayeredLayout()
                )
                sap.ui.getCore().byId("toggleLayoutButton").setIcon("sap-icon://tree")
                sap.ui.getCore().getModel("GRAPH_MODEL").getData().layout = "layered"

            } else {
                oGraph.setLayoutAlgorithm(
					new ForceDirectedLayout(sap.ui.getCore().getModel("GRAPH_MODEL").getData().forceDirectedSettings.oData))
                sap.ui.getCore().byId("toggleLayoutButton").setIcon("sap-icon://overview-chart")
                sap.ui.getCore().getModel("GRAPH_MODEL").getData().layout = "forced"
            }
        },

        clearGraph: function () {
            // Remove all the nodes and lines from the graph and reset the indexes and summary.
            var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
            oGraph.removeAllNodes();
			oGraph.removeAllLines();
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().nodeIndex = []
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().lineIndex = {}
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().locationsIndex = []
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().locations = []
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().timeSeriesIndex = {}
            sap.ui.controller("marina.controller.GeoMap").clearSpots()
            sap.ui.controller("marina.controller.NodeSummary").clearSummary()

        },

        onShortestPathSuggest: function (oEvent) {
            /**
             * Use the graph explorer search to get nodes for searching in the context of a shortest path
            */
            sap.ui.controller("marina.controller.GraphExplorer").onSuggest(oEvent)
        },

        onShortestPathSearch: function (oEvent) {
            /**
             * Take the sourceId set when the node is selected and the target node based on the suggestion item
             * selected from the search and use them for the standard call. Set the results in the graph
             * and clear out the search field.
             */
            if(oEvent.getParameter("suggestionItem") !== undefined){
                var sourceId = sap.ui.getCore().getModel("nodeSourceKey").oData.key
                var targetId = oEvent.getParameter("suggestionItem").getKey()
                fastAPI.getShortestPath(sourceId, targetId)
                .then(results => {
                    if(results.nodes.length < 2){
                        MessageToast.show("No shortest path identified") 
                    } else {
                        sap.ui.controller("marina.controller.NetworkGraph").setGraph(results, undefined, undefined, "ShortestPath")
                        MessageToast.show("Shortest path loaded")
                    }
                    sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().spSearch).setValue(null)
                    sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().spPopover).setVisible(false)
                })
            }
        },

        toggleGraphMap: function (oEvent) {
            var oPopOver = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().gmapPopover)
            oPopOver.setVisible(true)
            if(oPopOver.isOpen() === true){
                oPopOver.close()
            } else {
                oPopOver.openBy(oEvent.getSource())
            } 
        },

        setGraph: function (oSubGraph, sKey, summaryOnly, lineStatus) {
            /**
             * Based on build mode, either update the graph with a fresh JSONModel or iterate through the 
             * subGraph and add the nodes first and then the lines. 
             * If the sKey is not undefined, then set the summary based on it. Otherwise take the first node of the
             * subGraph to be the base node.
             * Check to ensure a node doesn't already exist
             * Within the loop, set summary and geoMap
             */
            sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfig").getData().dialogId).close()
            var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
            var sMode = sap.ui.getCore().getModel("GRAPH_MODEL").getData().mode
            var message = "No new nodes loaded"
            var maxNodes = 100
            var maxCount = 0
            var summary = {
                counts: {
                    totalCount: 0,
                    personCount: 0,
                    objectCount: 0,
                    locationCount: 0,
                    eventCount: 0,
                    relationCount: 0,
                },
                nodeSummary: []
            }
            var aNodeIndex = sap.ui.getCore().getModel("GRAPH_MODEL").getData().nodeIndex
            var oLineIndex = sap.ui.getCore().getModel("GRAPH_MODEL").getData().lineIndex
            if(sKey === undefined){
                sKey = oSubGraph.nodes[0].key
            }
            if(sMode == "build" && summaryOnly === undefined){
                // Build the graph iteratively and check the index nodes and lines to avoid duplication
                sap.ui.controller("marina.controller.NetworkGraph").resetLineStatus(oGraph)
                oSubGraph.nodes.forEach(function (oNode) {
                    if(!aNodeIndex.includes(oNode.key) && (maxCount <= maxNodes || oNode.key === sKey)){
                        var check = sap.ui.controller("marina.controller.NetworkGraph").checkNodeForSpecialAttributes(oNode)
                        oGraph.addNode(sap.ui.controller("marina.controller.NetworkGraph").createNode(check.node, check.img, check.ntype))
                        aNodeIndex.push(oNode.key)
                        message = "Graph loaded"
                        maxCount = maxCount + 1
                    } 
                    summary = sap.ui.controller("marina.controller.NetworkGraph").getNodeType(oNode, summary, sKey)
                })
                oSubGraph.lines.forEach(function (oLine) {
                    if(!oLineIndex.hasOwnProperty((oLine.from + oLine.to + oLine.title)) && aNodeIndex.includes(oLine.from) && aNodeIndex.includes(oLine.to)){
                        oLineIndex = sap.ui.controller("marina.controller.NetworkGraph").createLine(oLine, lineStatus, oGraph, oLineIndex)
                    } else if(lineStatus !== undefined){
                        sap.ui.getCore().byId(oLineIndex[oLine.from + oLine.to + oLine.title]).setStatus(lineStatus)
                    }
                    summary = sap.ui.controller("marina.controller.NetworkGraph").getRelationType(oLine, summary, sKey)
                })
            } else if(summaryOnly === undefined) {
                // Reset the indexes since the graph is being refreshed
                aNodeIndex = []
                oLineIndex = {}
                oGraph.removeAllNodes()
                oGraph.removeAllLines()
                sap.ui.controller("marina.controller.GeoMap").clearSpots()
                sap.ui.controller("marina.controller.NetworkGraph").resetLineStatus(oGraph)
                oSubGraph.nodes.forEach(function (oNode) {
                    if(!aNodeIndex.includes(oNode.key) && (maxCount <= maxNodes || oNode.key === sKey)){
                        var check = sap.ui.controller("marina.controller.NetworkGraph").checkNodeForSpecialAttributes(oNode)
                        oGraph.addNode(sap.ui.controller("marina.controller.NetworkGraph").createNode(check.node, check.img, check.ntype))
                        aNodeIndex.push(oNode.key)
                        message = "Graph loaded"
                        maxCount = maxCount + 1
                    } 
                    summary = sap.ui.controller("marina.controller.NetworkGraph").getNodeType(oNode, summary, sKey)
                })
                oSubGraph.lines.forEach(function (oLine) {
                    if(!oLineIndex.hasOwnProperty((oLine.from + oLine.to + oLine.title)) && aNodeIndex.includes(oLine.from) && aNodeIndex.includes(oLine.to)){
                        oLineIndex = sap.ui.controller("marina.controller.NetworkGraph").createLine(oLine, lineStatus, oGraph, oLineIndex)
                    } else if(lineStatus !== undefined){
                        sap.ui.getCore().byId(oLineIndex[oLine.from + oLine.to + oLine.title]).setStatus(lineStatus)
                    }
                    summary = sap.ui.controller("marina.controller.NetworkGraph").getRelationType(oLine, summary, sKey)
                })
            } else {
                oSubGraph.nodes.forEach(function (oNode) {
                    var check = sap.ui.controller("marina.controller.NetworkGraph").checkNodeForSpecialAttributes(oNode)
                    summary = sap.ui.controller("marina.controller.NetworkGraph").getNodeType(check.node, summary, sKey)
                });
                oSubGraph.lines.forEach(function (oLine) {
                    summary = sap.ui.controller("marina.controller.NetworkGraph").getRelationType(oLine, summary, sKey)
                });
            }
            if(oSubGraph.nodes.length > maxNodes){
                message = (String(oSubGraph.nodes.length) + " neighbors received. Display will be limited to " + String(maxNodes))
            } 
            MessageToast.show(message)
            sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id).setBusy(false)
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().nodeIndex = aNodeIndex
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().lineIndex = oLineIndex
            sap.ui.controller("marina.controller.GeoMap").updateBasedOnGraphResults(
                sap.ui.getCore().getModel("GRAPH_MODEL").getData().locations, 
                sap.ui.getCore().getModel("GRAPH_MODEL").getData().geometries)
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().summary = summary
            sap.ui.controller("marina.controller.NodeSummary").setSummaryFromGraphResults(summary, oGraph.getNodeByKey(sKey).getTitle(), sKey)
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().lastSearchedForNode = sKey
            if(sKey !== undefined){
                oGraph.getNodeByKey(sKey).setSelected(true)
            }
        },

        resetLineStatus: function (oGraph) {
            /**
             * Called while setting the graph to reset lines from temporary statuses like shortest path. GetStatusFromLineTitle ensures
             * that not all lines are set to standard but instead given a status based on their title like organizational relationships.
             */
            oGraph.getLines().forEach(function (oLine){
                if(oLine.getTitle() === 'IsOrgManagerOf'){
                    oLine.setStatus("IsOrgManagerOf")
                } else if(oLine.getTitle() === 'IsOpsManagerOf'){
                    oLine.setStatus("IsOpsManagerOf")
                } else {
                    oLine.setStatus("Standard")
                }
            })
        },

        checkNodeForSpecialAttributes: function (oNode){
            /**
             * Used while setting a graph and should be the single function to determine special attributes that would make a node
             * geospatial, time series, or placed in a certain group.
             * Check if a location is already in the index, sap.ui.getCore().getModel("GRAPH_MODEL").getData().locationsIndex 
             * Check for lat and lon data within the attributes of a Node to check if it is a location, storing them if found, in a standardized position format.
             * If it is, add it to the locationIndex with the format of a UI5 spot 
             * Check also if the node has an image attribute within the loop to prevent an extra attribute check in a separate function and return it
             * so it can be created with the node.
             */
            var image = undefined,
                nodeType = {ntype: "Object", ntypeData: ""},
                geometry = undefined,
                newAttributes = []
            oNode.customData = []
            if(oNode.icon === 'NA'){
                oNode.icon = "sap-icon://document"
            }
            if(oNode.hasOwnProperty('attributes')){
                var locationLabelsX = ['lon', 'x', 'longitude', 'northing', 'long'],
                    locationLabelsY = ['y', 'latitude', 'lat', 'easting' ],
                    eventLabels = ['datetime'],
                    personLabels = ['namefirst', 'lastname', 'namelast', 'firstname','gender', 'age', 'dob', 'pob'],
                    personLabelCount = 0,
                    locationData = {},
                    eventData = null,
                    description = null,
                    category = null
                // Iterate through the attributes and determine if it is holds any of the special attributes 
                oNode.attributes.forEach(function (item){
                    // Location check requires more than 1 location attribute
                    if(locationLabelsX.includes(item.label.toLowerCase())){
                        locationData['lon'] = item.value
                    } else if(locationLabelsY.includes(item.label.toLowerCase())){
                        locationData['lat'] = item.value
                    } else if(item.label === "geometry"){
                        geometry = {
                            key: oNode.key,
                            position: item.value.replace("POLYGON ((", "").replace("))", "").replaceAll(" ", ";").replaceAll(",", ";0"),
                            color: "rgba(0, 0, 255, 0.3)",
                            colorBorder: "rgba(0, 255, 0, 0.3)",
                            hotDeltaColor: "rgba(0, 0, 255, 0.3)",
                            tooltip: oNode.title,
                        }
                        sap.ui.getCore().getModel("GRAPH_MODEL").getData().geometries.push(geometry)
                    }
                    // Image check
                    if(item.label.toLowerCase() === 'image'){
                        image = item.value
                    }
                    // Event check. Start with a shell that can be later enhanced with category and description if they exist in the node attributes
                    if(eventLabels.includes(item.label.toLowerCase())){
                        eventData = {
                            dateTime: new Date(item.value),
                            filterValue: oNode.title,
                            icon: oNode.icon,
                            title: oNode.title,
                            key: oNode.key
                        }
                    }
                    // Attribute for group check
                    if(!sap.ui.getCore().getModel("GRAPH_MODEL").getData().attributesIndex.includes(item.label)){
                        sap.ui.getCore().getModel("GRAPH_MODEL").getData().attributesIndex.push(item.label)
                    }
                    if(item.label.toLowerCase() === "description"){
                        description = item.value
                    }
                    if(item.label.toLowerCase() === "category"){
                        category = item.value
                    }
                    // Person check
                    if(personLabels.includes(item.label.toLowerCase())){
                        personLabelCount = personLabelCount + 1
                    }
                    if(item.label.toLowerCase() === 'url'){
                        oNode.customData.push(new sap.ui.core.CustomData({
							key: "URL", 
                            value: item.value
						}))
                    }
                    if(!item.label.toLowerCase().includes('unnamed')){
                        newAttributes.push(item)
                    }

                })
                oNode.attributes = newAttributes
                // If it has more than just one of the location attributes
                if(locationData.hasOwnProperty('lat') && locationData.hasOwnProperty('lon')){
                    sap.ui.getCore().getModel("GRAPH_MODEL").getData().locationsIndex.push(oNode.key)
                    var position = locationData['lon'] + ";" + locationData['lat'] + ";0"
                    sap.ui.getCore().getModel("GRAPH_MODEL").getData().locations.push({
                        key: oNode.key,
                        position: position,
                        tooltip: oNode.title,
                        image: image
                    })
                    nodeType = {ntype: "Location", ntypeData: position}
                }
                // If it has event data
                if(eventData !== null){
                    if(description !== null){
                        eventData.text = description
                    }
                    if(category !== null){
                        eventData.filterValue = category
                    }
                    sap.ui.controller("marina.controller.TimeSeries").addTimeLineItem(eventData)
                    nodeType = {ntype: "Event", ntypeData: eventData.dateTime}
                }
                // If it has more than 1 person identification data
                if(personLabelCount > 1){
                    nodeType = {ntype: "Person", ntypeData: ""}
                }
            }
            if(image !== undefined){
                oNode.attributes = oNode.attributes.filter(function(att){
                    return att.label !== "image"
                })
            }
            return {node: oNode, img: image, ntype: nodeType}
        },

        createNode: function (oNode, image, nType) {
            /**
             * Customize nodes with functions for neighbors and shortest path
             */
            var newNode = new Node(oNode)
            newNode.setTitleLineSize(2)
            newNode.setMaxWidth(200)
            newNode.setShape(sap.ui.getCore().getModel("GRAPH_MODEL").getData().nodeShape)
            if(newNode.getIcon() === 'sap-icon://map'){
                newNode.setShowActionLinksButton(false)
                newNode.addActionButton(new ActionButton({
                    icon: "sap-icon://camera",
                    title: "Street view",
                    press: sap.ui.controller("marina.controller.NetworkGraph").onPressShowStreetView,
                    position: "Right"
                }))
            }
            else if(oNode.hasOwnProperty("customData")){
                oNode.customData.forEach(function (customObj){
                    if(customObj.getKey() === 'URL'){
                        newNode.addActionLink(new Link({href: customObj.getValue(), text: "Go to Source (right click and open in new tab)"}))
                    }
                })
            } else {
                newNode.setShowActionLinksButton(false)
            }
            
            if(image !== undefined && oNode.icon !== "sap-icon://map"){
                newNode.setImage(new NodeImage({
                    src: image
                }))
            }
            newNode.setShowExpandButton(false)
            //newNode.attachPress(sap.ui.controller("marina.controller.NetworkGraph").onPress)
            /* ERRORs out with cooridnates of node */
            newNode.addActionButton(new ActionButton({
                icon: "sap-icon://decline",
                title: "Remove",
                press: sap.ui.controller("marina.controller.NetworkGraph").onPressRemoveNode,
                position: "Left"
            }))
            newNode.addActionButton(new ActionButton({
                icon: "sap-icon://map-3",
                title: "Navigation",
                press: sap.ui.controller("marina.controller.NetworkGraph").onPressNavigation,
                position: "Left"
            }))
            // Add custom data which describes the type of entity (POLE) and the data that differentiates that type so it can be easily accessed to navigate to POLE relevant views
            newNode.addCustomData(new CustomData({ key: "nType", value: nType.ntype}))
            newNode.addCustomData(new CustomData({ key: "nData", value: nType.ntypeData }))
            // Add the data source from which it came based on the current API
            newNode.addCustomData(new CustomData({ key: "apiSource", value: sap.ui.getCore().getModel("apiModel").getData().currentSelection.id}))
            return newNode
        },

        getNodeType: function (oNode, summary, sKey) {
            /**
             * Expect the Node object and summary model. The type for a Node is stored within the attributes.
             * Get the attribute type and iterate the summary count according to the node type.
             * At the same time, using the loop, get the attributes to fill the summary table with a row based
             * on the node attributes. Fill the summary table values not present in the node with null.
             */
            var sType = "None"
            var columnHeaders = sap.ui.getCore().getModel("summaryConfig").oData.columnHeaders
            var nodeLabels = []
            var summaryRow = {
                key: oNode.key,
                title: oNode.title
            }
            if(oNode.hasOwnProperty('attributes')){
                oNode.attributes.forEach(function (item){
                    if(item.label.toLowerCase() == "type" && oNode.key !== sKey){
                        sType = item.value
                        if(sType == "Person"){
                            summary.counts.personCount = summary.counts.personCount + 1
                        } else if(sType == "Object"){
                            summary.counts.objectCount = summary.counts.objectCount + 1
                        } else if(sType == "Location"){
                            summary.counts.locationCount = summary.counts.locationCount + 1
                        } else if(sType == "Event"){
                            summary.counts.eventCount = summary.counts.eventCount + 1
                        }
                    }
                    if(!columnHeaders.includes(item.label)){
                        columnHeaders.push(item.label)
                    }
                    nodeLabels.push(item.label)
                    summaryRow[item.label] = item.value  
                })
            }
            sap.ui.getCore().getModel("summaryConfig").oData.columnHeaders = columnHeaders
            sap.ui.controller("marina.controller.NodeSummary").adjustTable(columnHeaders)
            columnHeaders.forEach(function (col){
                if(!nodeLabels.includes(col)){
                    summaryRow[col] = null
                }
            })
            if(oNode.key !== sKey){
                summary.nodeSummary.push(summaryRow)
                summary.counts.totalCount = summary.counts.totalCount + 1
            }
            return summary
        },

        createLine: function (oLine, lineStatus, oGraph, oLineIndex) {
            /**
             * Create a new line for the graph with customized conditions to change status and determine if the line has time based attributes
             * which triggers the creation of timeline items much like creating nodes.
             */
            oLine = sap.ui.controller("marina.controller.NetworkGraph").getStatusFromLineTitle(oLine)
            if(lineStatus !== undefined){
                oLine.line.status = lineStatus
            }
            var newLine = new Line(oLine.line)
            newLine.setArrowPosition(sap.ui.getCore().getModel("GRAPH_MODEL").getData().lineArrowPosition)
            newLine.setArrowOrientation(sap.ui.getCore().getModel("GRAPH_MODEL").getData().lineArrowOrientation)
            var fromNodeTitle = oGraph.getNodeByKey(newLine.getFrom()).getTitle(),
                toNodeTitle = oGraph.getNodeByKey(newLine.getTo()).getTitle(),
                eventDescription = ""
            if(oLine.customData !== undefined && oLine.customData !== null){
                if(newLine.getTitle() === "IsOrgManagerOf"){
                    eventDescription = fromNodeTitle + " is organization manager of " + toNodeTitle
                } else if(newLine.getTitle() === "IsOpsManagerOf"){
                    eventDescription = fromNodeTitle + " is operations manager of " + toNodeTitle
                }
                /* Expect the customData to either have a single date or range validFrom and validTo. 
                If it is a range, then customData needs to be added so it is not accidentally removed from a filter
                */
               if(!isNaN(oLine.customData.validFrom.getTime())){
                    for (const [key, value] of Object.entries(oLine.customData)){
                        newLine.addCustomData(new CustomData({key: key, value: value}))
                        sap.ui.controller("marina.controller.TimeSeries").addTimeLineItem({
                            dateTime: value,
                            filterValue: newLine.getTitle(),
                            icon: "sap-icon://org-chart",
                            title: key,
                            key: newLine.sId + "_" + key,
                            text: eventDescription + " " + key + " " + value,
                            customData: oLine.customData
                        })
                    }
               }
            }
            oGraph.addLine(newLine)
            oLineIndex[oLine.line.from + oLine.line.to + oLine.line.title] = newLine.sId
            return oLineIndex
        },

        getStatusFromLineTitle: function (oLine) {
            /**
             * Called when creating a line or resetting the lines in the graph which may happen to ensure temporary statuses like
             * highlighting a shortest path don't persist.
             */
            var oCustomData = null
            if(oLine.title === 'IsOrgManagerOf'){
                oLine.status = "IsOrgManagerOf"
                oCustomData = {
                    validFrom: new Date(oLine.description.split(",")[0]),
                    validTo: new Date(oLine.description.split(",")[1]),
                }
            } else if(oLine.title === 'IsOpsManagerOf'){
                oLine.status = "IsOpsManagerOf"
                oCustomData = {
                    validFrom: new Date(oLine.description.split(",")[0]),
                    validTo: new Date(oLine.description.split(",")[1]),
                } 
            } else {
                oLine.status = "Standard"
            }

            return {line: oLine, customData: oCustomData}
        },

        getRelationType: function (oLine, summary, sKey) {
            /**
             * Set the relation for the summary so that when it is clicked it highlights the node included in the relation.
             */
            if(oLine.to === sKey){
                var relKey = oLine.from
            } else {
                relKey = oLine.to
            }
            summary.nodeSummary.push({
                type: "Relation",
                title: oLine.title,
                key: relKey
            })
            summary.counts.relationCount = summary.counts.relationCount + 1
            summary.counts.totalCount = summary.counts.totalCount + 1
            return summary
        },

        onPressRemoveNode: function (oEvent) {
            /**
             * Remove a node from the graph by removing all the lines it in which it is contained first and then the 
             * node itself. Update the node and line indexes to reflect the changes
             * TODO need to ensure this node is removed from the map and timeline. 
             */
            var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
            var sourceNode = oGraph.getNodeByKey(oEvent.getSource().getParent().getKey())
            var lines = oGraph.getLines()
            lines.forEach(function (oLine) {
                if(oLine.getFrom() === sourceNode.getKey()){
                    oGraph.removeLine(oLine)
                } else if(oLine.getTo() === sourceNode.getKey()){
                    oGraph.removeLine(oLine)
                }
            })
            oGraph.removeNode(sourceNode)
            var newNodeIndex = []
            var newLineIndex = []
            oGraph.getNodes().forEach(oNode => {
                newNodeIndex.push(oNode.getKey())
            })
            oGraph.getLines().forEach(oLine => {
                newLineIndex.push(oLine.getFrom() + oLine.getTo())
            })
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().nodeIndex = newNodeIndex
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().lineIndex = newLineIndex

        },

        onPressNavigation: function (oEvent) {
            /**
             * Called from the node action button for shortest path. Open the popOver by the action button and set the
             * source node key for the shortest path.
             */
            var nodeAction = oEvent.getSource()
            var oPopOver = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().spPopover)
            oPopOver.setVisible(true)
            oPopOver.openBy(nodeAction)
            sap.ui.getCore().setModel(new JSONModel({
                key: oEvent.getSource().getParent().getKey()
            }), "nodeSourceKey")
        },

        onPressShowStreetView: function(oEvent) {
            var nodeAction = oEvent.getSource()
            //"https://www.google.com/maps/embed?pb=!4v1634059703701!6m8!1m7!1sNpJnBJf24-7hB-jh00HhwQ!2m2!1d48.23384658246898!2d16.82009417348011!3f192.18167477188243!4f-7.405164574341413!5f0.7820865974627469"
            //London "https://www.google.com/maps/embed?pb=!4v1645612070046!6m8!1m7!1sA8T9Q6cZl7e4rzpykjDt8w!2m2!1d51.50381944630657!2d-0.1339579816948887!3f73.79418482517251!4f0!5f0.7820865974627469"
            // Shore "https://www.google.com/maps/embed?pb=!4v1634114282004!6m8!1m7!1sCAoSLEFGMVFpcE4yMjB3UmY2aVhwTTBkQTlzUEdpaG5LSmI5YjFKeUloaVBVenNF!2m2!1d48.1267456!2d16.7382281!3f307.86768878464903!4f5.922758131869784!5f0.7820865974627469"
            var oPopOver = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().streetViewPopOver)
            var path = "https://www.google.com/maps/embed?pb=!4v1645612070046!6m8!1m7!1sA8T9Q6cZl7e4rzpykjDt8w!2m2!1d51.50381944630657!2d-0.1339579816948887!3f73.79418482517251!4f0!5f0.7820865974627469"
            var aNodeCustomData = oEvent.getSource().getParent().getCustomData()
            aNodeCustomData.forEach(oData => {
                if(oData.mProperties.key === "URL"){
                    path = oData.mProperties.value
                }
            })
            
            var oiFrame = new sap.ui.core.HTML({
                content: "<iframe id='pdfViewer' src='" + path +
                "pdf/web/viewer.html' style='width: 300px; height: 300px;' allowfullscreen='' webkitallowfullscreen=''</iframe>"})
            oPopOver.removeAllContent()
            oPopOver.addContent(oiFrame)
            oPopOver.setVisible(true)
            oPopOver.openBy(nodeAction)
        },

        closePopover: function(oEvent) {
            oEvent.getSource().setVisible(false)
        },

        adjustArrowPosition: function (oEvent) {
            /**
             * Adjust where the arrow will be placed on a graph line/edge. 
             */
            var newArrowPosition = oEvent.getSource().getSelectedButton().getProperty('text')
            var oLines = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id).getLines()
            if(oLines.length > 0){
                MessageToast.show("Adjusting Arrow position to " + newArrowPosition)
            } else {
                MessageToast.show("No lines on the graph to adjust but new line arrows will be positioned at " + newArrowPosition) 
            }
            oLines.forEach(function (oLine){
                oLine.setArrowPosition(newArrowPosition)
            })
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().lineArrowPosition = newArrowPosition
        },

        adjustNodeShape: function (oEvent) {
            /**
             * Switch the shape of the node between box (shows all details of a node) and circle (shows only icon).
             */

            var newNodeShape = oEvent.getSource().getSelectedButton().getProperty('text')
            if(newNodeShape === 'Circle'){
                var oNodeShape = sap.suite.ui.commons.networkgraph.NodeShape.Circle
            } else {
                oNodeShape = sap.suite.ui.commons.networkgraph.NodeShape.Box
            }
            var oNodes = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id).getNodes()
            if(oNodes.length > 0){
                MessageToast.show("Adjusting Node shape to " + newNodeShape)
            } else {
                MessageToast.show("No nodes on the graph to adjust but new nodes will be have the " + newNodeShape + " shape") 
            }
            oNodes.forEach(function (oNode){
                oNode.setShape(oNodeShape)
            })
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().nodeShape = oNodeShape

        },

        adjustArrowOrientation: function (oEvent) {
            /**
             * Adjust the direction in which the arrow will point on a graph line/edge.
             */
            var newArrowOrientation = oEvent.getSource().getSelectedButton().getProperty('text')
            var oArrowOrientation = sap.suite.ui.commons.networkgraph.LineArrowOrientation.None
            var oLines = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id).getLines()
            if(oLines.length > 0){
                MessageToast.show("Adjusting Arrow orientation to " + newArrowOrientation)
            } else {
                MessageToast.show("No lines on the graph to adjust but new line arrows will be oriented to " + newArrowOrientation) 
            }
            if(newArrowOrientation === 'Both'){
                oArrowOrientation = sap.suite.ui.commons.networkgraph.LineArrowOrientation.Both
            } else if (newArrowOrientation === 'Child'){
                oArrowOrientation = sap.suite.ui.commons.networkgraph.LineArrowOrientation.ChildOf
            } else if (newArrowOrientation === 'Parent'){
                oArrowOrientation = sap.suite.ui.commons.networkgraph.LineArrowOrientation.ParentOf
            }
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().lineArrowOrientation = oArrowOrientation
            oLines.forEach(function (oLine){
                oLine.setArrowOrientation(oArrowOrientation)
            })
        },

        adjustSettings: function (oEvent) {
            /**
             * Adjust the settings of the layout algorithm currently used in the graph. The event is triggered from the toolbar settings button.
             * The Popup is determined by the type of layout set in the graph. If it is already open, then it is closed. 
             * All settings are adjusted based on the button selected which maps to its own function within the country.
             */
            var oLayout = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id).getLayoutAlgorithm()
            var sLayout = sap.ui.getCore().getModel("GRAPH_MODEL").getData().layout
            console.log(oLayout)
            if(sLayout === "forced"){
                var oPopOver = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().settingsPopoverForced)

            } else {
                oPopOver = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().settingsPopoverLayered)
            }
            oPopOver.setVisible(true)
            if(oPopOver.isOpen() === true){
                oPopOver.close()
            } else {
                oPopOver.openBy(oEvent.getSource())
            } 
        },
        
        selectGroupByAttribute: function (oEvent, sGroupingAttribute) {
            /**
             * Triggered either by the selection of an attribute within the Group by select list or by toggling the grouping to true. 
             * If the trigger is a selection, then the attribute is the key of the oEvent otherwise oEvent is null and the attribute is the sGroupingAttribtue.
             * Once the attribute is identified, the layout is changed to Layered which enables grouping and the grouping toggle is set to true/On.
             * Then the graph groups are collected and ensured that there is a group for each of the attribute values before adding a node that group if 
             * the node has the attribute label. Otherwise it is added to the Unassigned group.
             */
            if(oEvent === null){
                var groupingAttribute = sGroupingAttribute
            } else {
                 groupingAttribute = oEvent.getParameter('item').getKey()
            }
            // Ensure the graph layout is in layered which can handle grouping
            if(sap.ui.getCore().getModel("GRAPH_MODEL").getData().layout === 'forced'){
                this.toggleLayout()
            }
            // Set the button to true state since groups are being assigned
            sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().groupingToggle).setSelectedKey("true")
            // Get the graph so the groups can be checked and the nodes can be collected to assign groups
            var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
            // Get the groups
            var groupKeys = oGraph.getGroups().map(x => x.getKey())
            oGraph.getNodes().forEach(function (oNode){
                var hasAttribute = false
                oNode.getAttributes().forEach(function (item){
                    if(item.getLabel() === groupingAttribute){
                        hasAttribute = true
                        if(!groupKeys.includes(item.getValue())){
                            groupKeys.push(item.getValue())
                            oGraph.addGroup(new Group({key: item.getValue(), title: item.getValue()}))
                        }
                        oNode.setGroup(item.getValue())
                    } 
                })
                if(hasAttribute === false){
                    oNode.setGroup("Unassigned")
                }
            })
        },

        toggleGroupingByAttributes: function(oEvent) {
            /**
             * Check if the toggle is on or off. If on/true, then check if an attribute item is selected
             * and use that to create the grouping by. If not, choose the first item in the list. If off/false
             * turn the grouping off.
             */
            if(oEvent.getSource().getSelectedKey() == 'true'){
                if(this.byId("groupAttributeList").getSelectedItem() == null){
                    var sAttribute = this.byId("groupAttributeList").getItems()[0].getKey()
                } else {
                    this.byId("groupAttributeList").getSelectedItem().getKey() 
                }
                sap.ui.controller("marina.controller.NetworkGraph").selectGroupByAttribute(null, sAttribute)
            } else {
                var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
                oGraph.getNodes().forEach(function (oNode){
                    oNode.setGroup(null)
                })
                oGraph.removeAllGroups()

            }
        },

        adjustCoolDownStep: function (oEvent) {
            /**
             * Based on the Force directed algorithm, adjust the cool down step which affects how 
             * many times the algorithm is run before settling nodes.
             */
            MessageToast.show("Adjusting cool down step to " + oEvent.getSource().getValue())
            var oLayout = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id).getLayoutAlgorithm()
            oLayout.setCoolDownStep(oEvent.getSource().getValue())    
        },

        adjustOptimalDistanceConstant: function (oEvent) {
            /**
             * Based on the Force directed algorithm, adjust the distance setting for nodes.
             */
            MessageToast.show("Adjusting optimal distance constant to " + oEvent.getSource().getValue())
            var oLayout = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id).getLayoutAlgorithm()
            oLayout.setOptimalDistanceConstant(oEvent.getSource().getValue())    
        },

        adjustNodePlacement: function (oEvent) {
            /**
             * Based on the Layered algorithm, adjust the node placement given 1 of 3 algorithms.
             */
            MessageToast.show("Adjusting node placement to " + oEvent.getSource().getSelectedButton().getText())
            var oLayout = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id).getLayoutAlgorithm()
            if(oEvent.getSource().getSelectedIndex() === 0){
                oLayout.setNodePlacement("BrandesKoepf")  
            } else if(oEvent.getSource().getSelectedIndex() === 1){
                oLayout.setNodePlacement("LinearSegments") 
            } else {
                oLayout.setNodePlacement("Simple") 
            }
        },

        adjustMergedEdges: function (oEvent) {
            /**
             * Based on the Layered algorithm, merge lines coming from a node or leave separated.
             */
            var merged = "Off"
            var setValue = false
            if(oEvent.getSource().getSelectedKey() === "true"){
                merged = "On"
                setValue = true
            } 
            MessageToast.show("Adjusting merged edges " + merged)
            var oLayout = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id).getLayoutAlgorithm()
            oLayout.setMergeEdges(setValue)
            sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().settingsPopoverLayered)    
        },

        adjustDirection: function (oEvent) {
            /**
             * Based on the Layered algorithm, adjust the direction of the layout as either top-to-bottom or left-to-right.
             */
            
            MessageToast.show("Adjusting direction to " + oEvent.getSource().getSelectedKey())
            var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
            if(oEvent.getSource().getSelectedKey() === "Vertical"){
                oGraph.setOrientation("TopBottom") 
            } else {
                oGraph.setOrientation("LeftRight")
            }
        },
        
        updateGraphPostMerge: function (absorbingNode, mergingKey) {
            /**
             * Expect a json to represent the absorbing node 
             */
            var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
            var oNodes = oGraph.getNodes()
            var absorbingNodeInGraph = false
            var mergingNodeInGraph = false
            oNodes.forEach(function (oNode) {
                if(oNode.getKey() === absorbingNode.key){
                    absorbingNodeInGraph = true
                }
                if(oNode.getKey() === mergingKey){
                    mergingNodeInGraph = true
                }
            })
            if(absorbingNodeInGraph === false && mergingNodeInGraph == true){
                var newNode = sap.ui.controller("marina.controller.NetworkGraph").checkNodeForSpecialAttributes(absorbingNode)
                oGraph.addNode(sap.ui.controller("marina.controller.NetworkGraph").createNode(newNode.node, newNode.img, newNode.type))
            } 
            var lines = oGraph.getLines()
            lines.forEach(function (oLine) {
                if(oLine.getFrom() === mergingKey){
                    oLine.setFrom(absorbingNode.key)
                } else if(oLine.getTo() === mergingKey){
                    oLine.setTo(absorbingNode.key)
                }
            })
            if(mergingNodeInGraph === true){
                oGraph.removeNode(mergingKey)
            }
            var newNodeIndex = []
            var newLineIndex = []
            oGraph.getNodes().forEach(oNode => {
                newNodeIndex.push(oNode.getKey())
            })
            oGraph.getLines().forEach(oLine => {
                newLineIndex.push(oLine.getFrom() + oLine.getTo())
            })
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().nodeIndex = newNodeIndex
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().lineIndex = newLineIndex

        },

        setNeighborsDegrees: function (oEvent) {
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().getNeighborsDegrees = oEvent.getSource().getRange()
        },

        onPressNeighbors: function (oEvent) {
            /**
             * Get the key from the source node pressed and use the explorer controller to
             * get the neighbors and set the graph.
             */
            var sourceId = sap.ui.getCore().getModel("nodeSourceKey").oData.key,
                bounds = sap.ui.getCore().getModel("GRAPH_MODEL").getData().getNeighborsDegrees

            sap.ui.controller("marina.controller.GraphExplorer").getNeighbors(sourceId, undefined, bounds[0], bounds[1])
            sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().getNeighborsDegreesSlider).setRange([0, 1])
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().getNeighborsDegrees = [0, 1]
        }
	})
});