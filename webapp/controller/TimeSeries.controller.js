sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
    function (Controller, JSONModel, MessageToast) {
        "use strict";
        return Controller.extend("marina.controller.TimeSeries", {

            onInit: function () {
                sap.ui.getCore().setModel(new JSONModel({
                    id: this.byId('idTimeline').sId,
                    events: {
                        items: [],
                        index: []
                    }
                }), "timeLineConfig")
                // Set an initial range in time
                this.byId('idTimeline').setModel(new JSONModel({
                    items: [
                        {
                            dateTime: new Date("1/1/1900"),
                            filterValue: "Init",
                            icon: "sap-icon://org-chart",
                            key: "_init_1",
                            text: "init",
                            title: "init"
                        },
                        {
                            dateTime: new Date("1/1/2050"),
                            filterValue: "Init",
                            icon: "sap-icon://org-chart",
                            key: "_init_2",
                            text: "init",
                            title: "init"
                        }
                    ]
                }))

            },

            itemClicked: function (oEvent) {
                var nodeID = oEvent.getSource().getCustomData()[0].getValue()
                sap.ui.controller("marina.controller.NetworkGraph").zoomToNode(nodeID)
            },

            getFilterKeys: function (filterItems){
                var filterKeys = []
                filterItems.forEach(function (oItem){
                    filterKeys.push(oItem.key)
                })
                return filterKeys
            },

            onFilterOpen: function (oEvent) {
                /**
                 * Manual override of filter function since the standard filtering doesn't seem
                 * to capture updated timeline events
                 */
                var dates = sap.ui.getCore().getModel("timeLineConfig").getData().events.items,  
                maxDate = new Date(),
                minDate = new Date(maxDate - 6)
                dates.forEach(function (oDate){
                    if(oDate.dateTime > maxDate){
                        maxDate = oDate.dateTime
                    }
                    if(oDate.dateTime < minDate){
                        minDate = oDate.dateTime
                    }
                })
                oEvent.getSource()._maxDate = maxDate
                oEvent.getSource()._minDate = minDate

                var filterPage = oEvent.oSource._filterDialogRangePage
            },

            setAllLinesToVisible: function (aLines) {
                aLines.forEach(function (oLine){
                    oLine.setHidden(false)
                })
            },

            setAllNodesToVisible: function (aNodes) {
                aNodes.forEach(function (oNode){
                    oNode.setHidden(false)
                })
            },

            updateGraphBasedOnFilter: function (oEvent) {
                /**
                 * Use the built in filter of the timeline to update the Graph based on the start and end date of the filter or the
                 * item selected. Use a set of timeBased edges and icons for nodes to determine if it should be considered for 
                 * filtering. Use private methods to get the filtermessage to see if it is null or contains null values in which
                 * the filter is expected to be switched off. In this case, set all nodes and edges to visible. Otherwise, go through
                 * either item based or date based rules to determine if the edges or nodes should be set to hidden.
                 */
                var timeBasedEdges = ["IsOrgManagerOf", "IsOpsManagerOf"],
                    timeBasedIcons = ["sap-icon://date-time"]
                // Get the graph lines and nodes to set to visible or not based on the filter values
                var oGraph = sap.ui.getCore().byId(sap.ui.getCore().getModel("GRAPH_MODEL").getData().id)
                var aLines = oGraph.getLines()
                var aNodes = oGraph.getNodes()
                var filteredMessage = oEvent.getSource()._getFilterMessage()
                if(filteredMessage === null || filteredMessage.includes("null")){
                    this.setAllLinesToVisible(aLines)
                    this.setAllNodesToVisible(aNodes)
                } else {
                    if(filteredMessage.includes("Filtered by: Items")){
                        var filterKeys = this.getFilterKeys(oEvent.getSource()._currentFilterKeys)
                        // Go through the lines and set to visible or not based on the type of line which is in the title
                        aLines.forEach(function (oLine){
                            if(filterKeys.includes(oLine.getTitle())){
                                oLine.setHidden(false)
                            } else if(!timeBasedEdges.includes(oLine.getTitle())){
                                oLine.setHidden(false)
                            } else if(!filterKeys.includes(oLine.getTitle()) && timeBasedEdges.includes(oLine.getTitle())){
                                oLine.setHidden(true)
                            }
                        })
                        // Go through the node attributes and if it is time based, go through the attributes
                        aNodes.forEach(function (oNode){
                            // If the node is time based and it has an attribute that is included in the filter it should not be filtered
                            if(timeBasedIcons.includes(oNode.getIcon())){
                                var filterNode = true
                                oNode.getAttributes().forEach(function (att){
                                    if(filterKeys.includes(att.getValue())){
                                        filterNode = false
                                    }
                                })
                                oNode.setHidden(filterNode)
                            }
                        })
                    } else {
                        var dateFrom = new Date(oEvent.getSource()._startDate)
                        var dateTo = new Date(oEvent.getSource()._endDate)
                        aLines.forEach(function (oLine){
                            if(oLine.getCustomData().length === 2){
                                var withinRange = (oLine.getCustomData()[0].getKey() === "validFrom" && oLine.getCustomData()[0].getValue() < dateFrom && 
                                oLine.getCustomData()[1].getKey() === "validTo" && oLine.getCustomData()[1].getValue() > dateTo)
                                if(withinRange === false){
                                    oLine.setHidden(true)
                                } else {
                                    oLine.setHidden(false)
                                }
                            }
                        })
                        // Go through the node attributes and if it is time based, go through the attributes
                        aNodes.forEach(function (oNode){
                            // If the node is time based and its date is not included in the from and to, filter it out
                            if(timeBasedIcons.includes(oNode.getIcon())){
                                var filterNode = true
                                var nodeDate = new Date(oNode.getTitle())
                                if(nodeDate >= dateFrom && nodeDate <= dateTo){
                                    filterNode = false
                                }
                                oNode.setHidden(filterNode)
                            }
                        })
                    }
                }
            },

            addTimeLineItem: function (oEvent) {
                /**
                 * Given an event from either nodes or edges, check if it has already been added to the index and if not, add it and reset the model.
                 */
                var events = sap.ui.getCore().getModel("timeLineConfig").oData.events
                if(!events.index.includes(oEvent.key)){
                    events.items.push(oEvent)
                    events.index.push(oEvent.key)
                    var timeline = sap.ui.getCore().byId(sap.ui.getCore().getModel("timeLineConfig").oData.id)
                    timeline.setModel(new JSONModel(events))
                }
            }

        });
    });