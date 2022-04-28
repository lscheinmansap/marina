sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/layout/cssgrid/GridBoxLayout",
	"sap/ui/core/BusyIndicator"
], function (BaseController, JSONModel, MessageBox, GridBoxLayout, BusyIndicator) {
	"use strict";

	return BaseController.extend("marina.controller.Search", {
		onInit: function () {
			var model = new sap.ui.model.json.JSONModel();
			this.getView().setModel(model);
			this.base_url = sap.ui.getCore().getModel("API").getData().url;
			sap.ui.getCore().setModel(new JSONModel({
				globalSearch: this.byId("globalSearch").sId
			}), "searchComponents") 
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("search").attachMatched(this.onRouteMatched, this);
			
		},
		
		onBeforeRendering: function()  {
			this.search();
		},
		
		search: function()  {
			var searchField = sap.ui.getCore().byId("globalSearch"),
				model = this.getView().getModel(),
				oView = this.getView(),
				searchList = this.byId("globalSearchList")
			var searchVal;
			if (searchField)  {
				searchVal = searchField.getValue();
			}

			$.ajax({
				url: this.base_url + "/data/search",
				data: {val: searchVal},
				success: function(data)  {
					if (data.status === 200)  {
						var dt = []
						data.data.results.forEach(function(d) {
							var icon = "sap-icon://question-mark"
							if (d.OBJECT_TYPE === 'IMAGERY')  {
								icon = "sap-icon://image-viewer"
							}
							else if (d.OBJECT_TYPE === 'DATASET')  {
								icon = "sap-icon://database"
							}
							else if (d.OBJECT_TYPE === 'MODEL')  {
								icon = "sap-icon://overview-chart"
							}
							d["ICON"] = icon
							dt.push(d)
						})
						data.data.results = dt
						oView.setModel(new JSONModel(data.data))
					}
					else  {
						MessageBox.error("An error occured loading search results.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		filter: function(event)  {
			var list = this.byId("globalSearchList");
			var binding = list.getBinding("items");
			var key = event.getParameter("key");
			var filters = [];
			if (key !== 'ALL')  {
				filters.push(new sap.ui.model.Filter("OBJECT_TYPE", "EQ", key));
			}
			binding.filter(filters);
		},
		
		navToDetail: function(oEvent)  {
			var id = oEvent.getSource().data("objectId"),
				type = oEvent.getSource().data("objectType")
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (type === 'DATASET')  {
				oRouter.navTo("dataSet", {"id": id});
			}
			else if (type === 'IMAGERY')  {
				oRouter.navTo("imageryDetails", {"layout": sap.f.LayoutType.OneColumn, "id": id});
			}
			else if (type === 'MODEL')  {
				oRouter.navTo("modelCard", {"id": id, "approval": false});
			}
			else  {
				console.log("Object type invalid.");
			}
		}
		
	});
});