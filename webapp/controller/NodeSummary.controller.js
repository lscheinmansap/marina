sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (Controller, JSONModel, Filter) {
        "use strict";
        return Controller.extend("marina.controller.NodeSummary", {

            onInit: function () {
                var nodeSummaryTable = this.byId("nodeSummaryTable")
                var iconTabBar = this.byId("idIconTabBar")
                sap.ui.getCore().setModel(new JSONModel({
                    nodeSummaryTableId: nodeSummaryTable.sId,
                    summaryView: this.getView().sId,
                    iconTabBarId: iconTabBar.sId,
                    columnHeaders: [],
                    summaryNodeKey: ""
                }), "summaryConfig")
            },
    
            onFilterSelect: function (oEvent) {
                /**
                 * Filter out the values based on Type that equals the sKey which should match the type of the entity in the model
                 */
                var oBinding = sap.ui.getCore().byId((sap.ui.getCore().getModel("summaryConfig").oData.nodeSummaryTableId)).getBinding("items")
                var sKey = oEvent.getParameter("key")
                if(sKey == "All"){
                    var entityFilter = []
                } else {
                    var entityFilter = new Filter([new Filter("type", "EQ", sKey)], true)
                }
                oBinding.filter(entityFilter)
            },

            setSummaryFromGraphResults: function (oSummary, sNodeTitle, sKey) {
                /**
                 * Expect a summary object that contains counts of each node type (Person, Object, Location, Event) and the nodes
                 * that are included in each. Also expect the string representing the node's title so it can be displayed in the 
                 * summary panel denoting that the summary is based on that node and the key to store in the summary model.
                 */
                sap.ui.getCore().byId(sap.ui.getCore().getModel("summaryConfig").oData.iconTabBarId).setModel(new JSONModel(oSummary.counts))
                sap.ui.getCore().byId(sap.ui.getCore().getModel("summaryConfig").oData.summaryView).setModel(new JSONModel(oSummary))
                sap.ui.getCore().getModel("summaryConfig").oData.summaryNodeKey = sKey
                //sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfig").oData.summaryPanelId).setHeaderText("Summary: " + sNodeTitle)
            },

            clearSummary: function () {
                /***
                 * Set the summary model to an empty array, each of the filter counts to blank and the panel text back to "Summary"
                 */
                sap.ui.getCore().byId(sap.ui.getCore().getModel("summaryConfig").oData.summaryView).setModel(new JSONModel({nodeSummary: []}))
                var iconTabBar = sap.ui.getCore().byId((sap.ui.getCore().getModel("summaryConfig").oData.iconTabBarId))
                iconTabBar.mForwardedAggregations.items.forEach(function (item){item.setCount("")})
                sap.ui.getCore().getModel("summaryConfig").oData.summaryPanelId.setHeaderText("Summary")
            },

            adjustTable: function (columnHeaders) {
                /**
                 * Change the table columns based on the node details.
                 * TODO determine why the columns don't update with new values
                 */
                /*
                 var summary = sap.ui.getCore().byId((sap.ui.getCore().getModel("summaryConfig").oData.nodeSummaryTableId))
                 var currentColumnHeaders = sap.ui.getCore().getModel("summaryConfig").oData.columnHeaders
                 columnHeaders.forEach(function (text){
                     if(!currentColumnHeaders.includes(text)){
                         var newColumn = new Column()
                         newColumn.setHeader(new Text(text))
                         summary.addColumn(newColumn)
                         currentColumnHeaders.push(text)
                     }
                 })
                 sap.ui.getCore().getModel("summaryConfig").oData.columnHeaders = currentColumnHeaders
                 */

            },

            onClickRow: function (oEvent) {
                /**
                 * Click on a row and if the node or line is already on the canvas, go to it. If not add it. Use the selected summary node
                 * key for the case the node is not on the graph so when it is added to the graph, an edge between the clicked node and the
                 * summary node is added to the graph
                 */
                // Cell 2 is the key of the selected row
                var sKey = oEvent.getSource().mAggregations.cells[3].mProperties.text
                sap.ui.controller("marina.controller.NetworkGraph").zoomToNode(sKey, sap.ui.getCore().getModel("summaryConfig").oData.summaryNodeKey)

            }
        })
    })