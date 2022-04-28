sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "marina/utils/fastAPI",
    "marina/utils/helpers",
    "sap/m/MessageToast"
], function (Controller, JSONModel, fastAPI, helpers, MessageToast) {
	"use strict";
	return Controller.extend("marina.controller.NodesMerge", {
        onInit: function () {
            sap.ui.getCore().setModel(new JSONModel({
                dialogId: this.byId("mergeNodesPanel").sId
            }),"graphExplorerConfigMergeNodes");
        },

        onPressCancel: function() {
            sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfigMergeNodes").getData().dialogId).close()
        },
        openDialog: function(){
            sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfigMergeNodes").getData().dialogId).open()
        },

        onSuggest: function (oEvent) {
            helpers.onSuggest(oEvent)
        },

        onSetAbsorbingNode: function (oEvent) {
            /**
             * Maintain the model for the merge nodes ABSORBING key
             */
            if(oEvent.mParameters.hasOwnProperty('suggestionItem')){
                sap.ui.getCore().setModel(new JSONModel({
                    key: oEvent.getParameter("suggestionItem").getKey()
                }), "absorbingNode")
            }
        },

        onSetMergingNode: function (oEvent) {
            /**
             * Maintain the model for the merge nodes MERGING key
             */
             if(oEvent.mParameters.hasOwnProperty('suggestionItem')){
                sap.ui.getCore().setModel(new JSONModel({
                    key: oEvent.getParameter("suggestionItem").getKey()
                }), "mergingNode")
            }
        },

        onPressMergeNodes: function () {
            /**
             * Get the SOURCE and TARGET keys from the model, set the fields to null and get the path from the API
             */
            try {
                var absorbingKey = sap.ui.getCore().getModel("absorbingNode").oData.key
                var mergingKey = sap.ui.getCore().getModel("mergingNode").oData.key
            } catch {
                absorbingKey = null
                mergingKey = null
            }
            if(absorbingKey === null || mergingKey === null){
                MessageToast.show("Both an absorbing and merging node are required.")
            } else if(absorbingKey === mergingKey) {
                MessageToast.show("The nodes chosen are the same. 2 different nodes are required.")
            } else {
                this.byId("searchAbsorbingNode").clear()
                this.byId("searchMergingNode").clear()
                sap.ui.getCore().getModel("mergingNode").oData.key = null
                sap.ui.getCore().getModel("absorbingNode").oData.key = null
                fastAPI.mergeNodes(absorbingKey, mergingKey)
                // Need to check existing graph and reset accordingly
                .then(results => {
                    MessageToast.show(results.message)
                    sap.ui.controller("marina.controller.NetworkGraph").updateGraphPostMerge(results.absorbing_node, mergingKey)
                })
            }
        }
        
	});
});