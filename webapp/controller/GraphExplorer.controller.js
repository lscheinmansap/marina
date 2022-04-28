sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "marina/utils/fastAPI",
    "marina/utils/helpers",
    "sap/m/MessageToast"
], function (Controller, JSONModel, fastAPI, helpers, MessageToast) {
	"use strict";
	return Controller.extend("marina.controller.GraphExplorer", {
        onInit: function () {
            /**
             * Set a model that contains the different sources for graph formatted data and their respective URLs. 
             */
            var emptySearchModel = new JSONModel();
            emptySearchModel.loadData(sap.ui.require.toUrl("marina/model/workbenchVariables.json"));
            this.getView().setModel(emptySearchModel);
            sap.ui.getCore().setModel(new JSONModel({
                dialogId: this.byId("explorerPanel").sId,
                graphCache: {}
            }), "graphExplorerConfig")
            this.setNeighborsModel()

        },

        setNeighborsModel: function() {
            sap.ui.getCore().setModel(new JSONModel({
                key: null
            }), "neighborSource") 
            sap.ui.getCore().setModel(new JSONModel({
                val1: null,
                val2: null
            }), "neighborsRange") 

        },

        onPressCancel: function() {
            sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfig").getData().dialogId).close()
        },
        openDialog: function(){
            sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfig").getData().dialogId).open()
        },

        onSuggest: function (oEvent) {
            helpers.onSuggest(oEvent)
        },

        onSearch: function (oEvent){
            /**
             * Get the results of a suggestion item by calling neighbors
             * then reset the searchfield to null.
             */
            if(oEvent.getParameter("suggestionItem") !== undefined){
                var searchKey = oEvent.getParameter("suggestionItem").getKey()
                this.getNeighbors(searchKey)
                this.byId("graphSearchField").clear()
            }
        },

        onSetShortestPathSource: function (oEvent) {
            /**
             * Maintain the model for the shortest path SOURCE key
             */
             if(oEvent.getParameter("suggestionItem") !== undefined){
                sap.ui.getCore().setModel(new JSONModel({
                    key: oEvent.getParameter("suggestionItem").getKey()
                }), "shortestPathSource") 
            }
        },

        onSetShortestPathTarget: function (oEvent) {
            /**
             * Maintain the model for the shortest path TARGET key
             */
            if(oEvent.getParameter("suggestionItem") !== undefined){
                sap.ui.getCore().setModel(new JSONModel({
                    key: oEvent.getParameter("suggestionItem").getKey()
                }), "shortestPathTarget")
            }
        },

        onPressWorkspace: function (oEvent) {
            /**
             * Choose from the workspaces in the options and then set the currentSelection for the apiModel to map the appropriate URLs which may be different per workspace
             * Then get the top subgraph from that workspace
             */
            var oPanel = this.byId("panelWorkspaces")
            oPanel.setHeaderText("Workspaces (" + oEvent.getSource().getSelectedItem().mProperties.text + ")")
            sap.ui.getCore().getModel("apiModel").getData().currentSelection = sap.ui.getCore().getModel("apiModel").getData()[this.byId("optionsWorkspaces").mProperties.selectedKey]
        },

        onPressShortestPath: function () {
            /**
             * Get the SOURCE and TARGET keys from the model, set the fields to null and get the path from the API
             */
            var sourceId = sap.ui.getCore().getModel("shortestPathSource").oData.key
            var targetId = sap.ui.getCore().getModel("shortestPathTarget").oData.key
            var oSpSource = this.byId("graphShortestPathSource")
            var oSpTarget = this.byId("graphShortestPathTarget")
            fastAPI.getShortestPath(sourceId, targetId)
            .then(results => {
                sap.ui.controller("marina.controller.NetworkGraph").setGraph(results, sourceId, undefined, "ShortestPath")
                MessageToast.show("Shortest path loaded")
                oSpSource.clear()
                oSpTarget.clear()
            })
        },

        getTopSubGraph: function () {
            /**
             * Get the top nodes from a graph
             */
            fastAPI.getTopSubGraph()
            .then(results => {
                console.log(results)
                sap.ui.controller("marina.controller.NetworkGraph").setGraph(results)
                MessageToast.show("Loaded the top connected people.")
            })
        },
        onSetNeighborsSource: function (oEvent) {
            if(oEvent.getParameter("suggestionItem") !== undefined){
                sap.ui.getCore().setModel(new JSONModel({
                    key: oEvent.getParameter("suggestionItem").getKey()
                }), "neighborSource") 
            }

        },

        neighborRangeChange: function (oEvent) {
            if(oEvent.getParameter("suggestionItem") !== undefined){
                sap.ui.getCore().setModel(new JSONModel({
                    val1: oEvent.getSource().getValue(),
                    val2: oEvent.getSource().getValue2()
                }), "neighborsRange") 
            }

        },

        onPressNeighbors: function () {
            var source = null,
                val1 = null,
                val2 = null
            if(sap.ui.getCore().getModel("neighborSource").getData().key !== null){
                source = sap.ui.getCore().getModel("neighborSource").getData().key
            }
            if(sap.ui.getCore().getModel("neighborsRange").getData().val1 !== null){
                val1 = sap.ui.getCore().getModel("neighborsRange").getData().val1
                val2 = sap.ui.getCore().getModel("neighborsRange").getData().val2
            }
            if(source !== null){
                if(val1 === null){
                    val1 = "0"
                    val2 = "1"
                }
                this.getNeighbors(source, undefined, val1, val2)
                this.setNeighborsModel()
                this.byId("graphNeighbors").clear()
                this.byId("NeighborsRange").setValue("0")
                this.byId("NeighborsRange").setValue2("1")
            }

        },

        getNeighbors: function (sKey, summaryOnly, sLowerBound, sUpperBound){
            /**
             * Called when an option from the suggestion items in the search field is selected
             * Get the neighbors of the item to allow the user to explore either through the summary
             * table or the graph
             */
            if(sap.ui.getCore().getModel("graphExplorerConfig").getData().graphCache.hasOwnProperty(sKey)){
                var results = sap.ui.getCore().getModel("graphExplorerConfig").getData().graphCache[sKey]
                sap.ui.controller("marina.controller.NetworkGraph").setGraph(results, sKey, summaryOnly)
            }
            sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id).setBusy(true)
            fastAPI.getNeighbors(sKey, sLowerBound, sUpperBound)
            .then(results => {
                sap.ui.getCore().getModel("graphExplorerConfig").getData().graphCache[sKey] = results
                sap.ui.controller("marina.controller.NetworkGraph").setGraph(results, sKey, summaryOnly)
            })
        }
        
	});
});