sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
    "marina/model/formatter"
],  function (BaseController, JSONModel, MessageBox, formatter) {
        "use strict";

        return BaseController.extend("marina.controller.Launchpad", {
            
            formatter: formatter,

            onInit: function () {
                var model = new sap.ui.model.json.JSONModel();
                this.getView().setModel(model);
                this.base_url = sap.ui.getCore().getModel("API").getData().url; 

                sap.ui.core.IconPool.registerFont({
                    fontFamily: 'BusinessSuiteInAppSymbols',
                    fontURI   : sap.ui.require.toUrl('sap/ushell/themes/base/fonts/')
                });

                sap.ui.core.IconPool.registerFont({
                    fontFamily: 'SAP-icons-TNT',
                    fontURI   : sap.ui.require.toUrl('sap/tnt/themes/base/fonts/')
                });

            },

            onBeforeRendering: function()  {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("overview");		
            },

            onAfterRendering: function()  {
                this.getCurrentUser();   
            },

            getCurrentUser: function()  {
                var parent = this;
                $.ajax({
                    url: parent.base_url + "/config/getCurrentUser",
                    success: function(data)  {
                        if (data.status ===200)  {
                            parent.getOwnerComponent().setModel(new JSONModel(data.data), "USER_MODEL")
                            var userModel = parent.getOwnerComponent().getModel("USER_MODEL");
                            var userButton = parent.byId("userButton");
                            userButton.setText(userModel.getData().username);
                            var isApprover = userModel.getData().approver;
                            parent.getDataSetSubscriptionCount();
                            parent.getDownloadsCount();
                            parent.getRejectedCount();
                            if (isApprover)  {
                                parent.getApprovalsCount();
                            }
                        }
                        else  {
                            MessageBox.error("An error occured retrieving approver notification count.\n\n" + data.data.message);
                        }
                    },
                    error: function(xhr, ajaxOptions, thrownErr)  {
                        console.log(thrownErr);
                    }
                });
            },
 
            getSubscriptions: function(button)  {
                var parent = this;
                $.ajax({
                    url:  parent.base_url + "/data/getUserSubscriptions",
                    success: function(data)  {
                        if (data.status ===200)  {
                            parent.openSubscriptions(button, data.data);
                        }
                        else  {
                            MessageBox.error("An error occured retrieving data set subscriptions.\n\n" + data.data.message);
                        }
                    },
                    error: function(xhr, ajaxOptions, thrownErr)  {
                        console.log(thrownErr);
                    },
                    complete: function(e)  {
                    }
                });
            },
    
            getRejections: function(button)  {
                var parent = this;
                $.ajax({
                    url: parent.base_url + "/data/getRejectedNotifications",
                    success: function(data)  {
                        if (data.status ===200)  {
                            parent.openCardRejections(button, data.data);
                        }
                        else  {
                            MessageBox.error("An error occured retrieving card rejections.\n\n" + data.data.message);
                        }
                    },
                    error: function(xhr, ajaxOptions, thrownErr)  {
                        console.log(thrownErr);
                    },
                    complete: function(e)  {
                    }
                });
            },
            
            getDownloads: function(button)  {
                var parent = this;
                $.ajax({
                    url: parent.base_url + "/data/getDownloadsByUser",
                    success: function(data)  {
                        if (data.status ===200)  {
                            parent.openDownloads(button, data.data);
                        }
                        else  {
                            MessageBox.error("An error occured retrieving downloads.\n\n" + data.data.message);
                        }
                    },
                    error: function(xhr, ajaxOptions, thrownErr)  {
                        console.log(thrownErr);
                    },
                    complete: function(e)  {
                    }
                });
            },
    
            getApprovals: function(button)  {
                var parent = this;
                $.ajax({
                    url: parent.base_url + "/data/getApproverNotifications",
                    data: {approverType: this.getOwnerComponent().getModel("USER_MODEL").getProperty("/approverType")},
                    success: function(data)  {
                        if (data.status === 200)  {
                            parent.openApprovals(button, data.data);
                        }
                        else  {
                            MessageBox.error("An error occured retrieving approver notifications.\n\n" + data.data.message);
                        }
                    },
                    error: function(xhr, ajaxOptions, thrownErr)  {
                        console.log(thrownErr);
                    }
                });
            },

            openSubscriptions: function(button, subscriptions)  {
                var parent = this;
                var model = new sap.ui.model.json.JSONModel();
                model.setData(subscriptions);
    
                var list = new sap.m.List({
                    items: {
                        path: "/",
                        template: new sap.m.FeedListItem({
                            type: sap.m.ListType.Active,
                            text: "{NAME}",
                            timestamp: {
                                path: "LAST_UPDATED_TIMESTAMP",
                                formatter: function(val)  {
                                    return moment(val).format("MMM DD, YYYY hh:mm:ss a");
                                }
                            },
                            icon: {
                                path: "PRIME_CATEGORY",
                                formatter: function(val)  {
                                    return formatter.getDatasetIcon(val);
                                }
                            },
                            customData: [ 
                                new sap.ui.core.CustomData({ key: "dataSetId", value: "{DATA_SET_ID}"})
                            ],
                            press: function(e)  {
                                var item = e.getSource();
                                var dataSetId = item.data("dataSetId");
                                
                                parent.updateSubscription(dataSetId);
                                parent.removeItemFromList("datasetIndicator", item);
                                parent.navToDataSet(dataSetId, "");
                            }
                        }),
                        templateShareable: true
                    }
                });
                list.setModel(model);
                
                var popover = new sap.m.Popover({
                    title: "My Data Set Subscription Updates",
                    contentWidth: "600px",
                    contentHeight: "400px",
                    verticalScrolling: true,
                    placement: sap.m.PlacementType.Left,
                    content: [list],
                    afterClose: function(e)  {
                    }
                });
                popover.openBy(button);
            },

            linkAnalysisDialogOpen: function (oEvent) {
                var sKey = oEvent.getSource().getKey();
                if(sKey === "openCreateNode"){
                    sap.ui.controller("marina.controller.NodeCreate").openDialog()
                } else if(sKey === "openEditNode"){
                    sap.ui.controller("marina.controller.NodeEdit").openDialog()
                } else if(sKey === "openNodesMerge"){
                    sap.ui.controller("marina.controller.NodesMerge").openDialog()
                } else if(sKey === "openEdgeCreate"){
                    sap.ui.controller("marina.controller.EdgeCreate").openDialog()
                } else if(sKey === "openExploreGraph"){
                    sap.ui.controller("marina.controller.GraphExplorer").openDialog()
                }
            },

            navToManifest: function()  {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("dataSetManifest");
            },

            createDataCard: function()  {
                var parent = this;
                $.ajax({
                    url: parent.base_url + "/mgmt/getWorkflowByName",
                    data: {name: "Data Card"},
                    success: function(data)  {
                        if (data.status === 200)  {
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(parent);
                            oRouter.navTo("dataCardNew", {wfId: data.data.WF_ID});
                        }
                        else  {
                            MessageBox.error("An error occured creating new data card.\n\n" + data.data.message);
                        }
                    },
                    error: function(xhr, ajaxOptions, thrownErr)  {
                        console.log(thrownErr);
                    }
                });
            },

            navToStreams: function()  {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("streams");		
            }

        });
    });
