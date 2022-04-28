sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "marina/utils/fastAPI",
    "marina/utils/helpers",
    "sap/ui/model/Filter",
    "sap/ui/vbm/Spot",
    "sap/ui/vbm/Spots",
    "sap/m/MessageToast"
], function (Controller, JSONModel, fastAPI, helpers, Filter, Spot, Spots, MessageToast) {
	"use strict";
	return Controller.extend("marina.controller.EdgeCreate", {
        onInit: function () {
            sap.ui.getCore().setModel(new JSONModel({
                dialogId: this.byId("createEdgePanel").sId,
                sourceNodeKey: null,
                targetNodeKey: null,
                edgeTitle: null
            }), "graphExplorerConfigCreateEdge")
            
            var variablesModel = new JSONModel();
            variablesModel.loadData(sap.ui.require.toUrl("marina/model/workbenchVariables.json"));
            this.byId("createEdgePanel").setModel(variablesModel);
        },

        onPressCancel: function() {
            sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().dialogId).close()
        },
        openDialog: function(){
            sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().dialogId).open()
        },

        onSuggest: function (oEvent) {
            helpers.onSuggest(oEvent)
        },

        onEdgeTitleSelected: function (oEvent) {
            sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().edgeTitle = oEvent.getSource().getValue()
        },

        onSetSourceNode: function (oEvent) {
            try {
                sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().sourceNodeKey = oEvent.getParameter("suggestionItem").getKey()  
            } catch {
                sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().sourceNodeKey = null
            }
            
        },

        onSetTargetNode: function (oEvent) {
            try {
                sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().targetNodeKey = oEvent.getParameter("suggestionItem").getKey()
            } catch {
                sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().targetNodeKey = null 
            }
            
        },

        clearForm: function (){
            this.byId("searchSourceNode").clear()
            this.byId("searchTargetNode").clear()
            this.byId("edgeTitleInput").setValue(null)
            sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().targetNodeKey = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().sourceNodeKey = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().edgeTitle = null

        },

        onPressCreateEdge: function () {
            var sourceKey = sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().sourceNodeKey,
                targetKey = sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().targetNodeKey,
                edgeTitle = sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().edgeTitle,
                oThis = this
            if(sourceKey == targetKey){
                MessageToast.show("Source and Target nodes are the same. They must be different")
            } else if(sourceKey !== null && targetKey !== null && edgeTitle !== null){
                fastAPI.createEdge(sourceKey, targetKey, edgeTitle)
                .then(results => {
                    MessageToast.show(results.message)
                    sap.ui.controller("marina.controller.NetworkGraph").setGraph(results, sourceKey)
                    sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfigCreateEdge").getData().dialogId).close()
                    oThis.clearForm()
                })
            } else if(sourceKey === null) {
                MessageToast.show("Source node is needed.")
            } else if(targetKey === null) {
                MessageToast.show("Target node is needed.")
            }else if(edgeTitle === null) {
                MessageToast.show("Edge title is needed.")
            }else  {
                MessageToast.show("Error in creating edge.")
            }
        }

	});
});