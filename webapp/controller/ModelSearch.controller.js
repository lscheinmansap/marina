sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
    "marina/model/formatter"
], function (BaseController, JSONModel, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.ModelSearch", {

        formatter : formatter, 

		onInit: function () {
			var model = new JSONModel();
			this.getView().setModel(model);
			this.base_url = sap.ui.getCore().getModel("API").getData().url;

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("models").attachMatched(this.onRouteMatched, this);
            sap.ui.getCore().setModel(new JSONModel({id: this.byId("modelScrollContainer").sId}), "modelScrollContainer");
		},
		
		loadFilters: function(e)  {
			var model = this.getView().getModel();
			var oThis = this;
			$.ajax({
				url: oThis.base_url + "/model/getClassificationFilters",
				data: {
					val: oThis.byId("modelSearch").getValue()
				},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/classifications", data.data);
					}
					else  {
						MessageBox.error("An error occured loading classifications.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: oThis.base_url + "/model/getModelTypeFilters",
				data: {
					val: this.byId("modelSearch").getValue()
				},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/modelTypes", data.data);
					}
					else  {
						MessageBox.error("An error occured loading model types.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: oThis.base_url + "/model/getDeveloperFilters",
				data: {
					val: this.byId("modelSearch").getValue()
				},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/modelDevelopers", data.data);
					}
					else  {
						MessageBox.error("An error occured loading model developers.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		onAfterRendering: function()  {
            //var scrollContainer = sap.ui.getCore().byId(sap.ui.getCore().getModel("modelScrollContainer").getData().id)
			var scrollContainer = this.byId("modelScrollContainer");
			scrollContainer.setHeight(window.innerHeight-175 + "px");
		},
		
		onRouteMatched: function(e)  {
			this.offset = 0;
			this.loadFilters();
			this.byId("modelSortButton").setText("Last Modified");
			this.searchModels(true);
		},
		
		searchModels: function(resetOffset, sortBy, sortDir)  {
			if (resetOffset)  {
				this.offset = 0;
			}
			var model = this.getView().getModel();
			var searchVal = this.byId("modelSearch").getValue();
			var dateStart = this.byId("modelDateRange").getDateValue();
			var dateEnd = this.byId("modelDateRange").getSecondDateValue ();
			var filters = this.processFilters();
            var oThis = this;
			$.ajax({
				url: oThis.base_url + "/model/searchModelCards",
				data: {
					val: searchVal, 
					limit: constants.RESULTS_LIMIT, 
					offset: this.offset, 
					filters: filters,
					start: (dateStart) ? moment(dateStart).format('YYYY-MM-DD') : null,
					end: (dateEnd) ? moment(dateEnd).format('YYYY-MM-DD') : null,    
					sortBy: sortBy,
					sortDir: sortDir
				},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/results", data.data);
					}
					else  {
						MessageBox.error("An error occured loading model search results.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		processFilters: function()  {
			var filters = {};
			// parse the last mod chart
			
			var classifications = this.byId("modelClassificationList").getSelectedKeys();
			if (classifications && classifications.length > 0)  {
				filters["m.MODEL_CLASSIFICATION"] = classifications;
			}

			var modelTypes = this.byId("modelTypesList").getSelectedKeys();
			if (modelTypes && modelTypes.length > 0)  {
				filters["MODEL_TYPE"] = modelTypes;
			}

			var modelDevs = this.byId("modelDeveloperList").getSelectedKeys();
			if (modelDevs && modelDevs.length > 0)  {
				filters["MODEL_DEVELOPER"] = modelDevs;
			}

			return filters;
		},
		
		clearAllFilters: function()  {
			this.byId("modelSearch").setValue("");
			this.byId("modelClassificationList").removeAllSelectedItems();
			this.byId("modelTypesList").removeAllSelectedItems();
			this.byId("modelDeveloperList").removeAllSelectedItems();
			this.byId("modelDateRange").setDateValue(null);
			this.byId("modelDateRange").setSecondDateValue(null);
		},
		
		getNext: function()  {
			var model = this.getView().getModel();
			var offset = this.offset + constants.RESULTS_LIMIT;
			if (offset < model.getProperty("/results/total"))  {
				this.offset = offset;
				this.searchModels(false);
			}
		},

		getPrevious: function()  {
			var offset = this.offset - constants.RESULTS_LIMIT;
			if (offset >= 0)  {
				this.offset = offset;
				this.searchModels(false);
				
			}
		},
		
		getFirst: function()  {
			this.searchModels(true);
		},

		getLast: function()  {
			var model = this.getView().getModel();
			var total = model.getProperty("/results/total");
			var totalPages = parseInt(total)/constants.RESULTS_LIMIT;
			if (totalPages % 1 !== 0)  {
				totalPages = Math.trunc(totalPages)+1;
			}
			this.offset = (totalPages - 1) * constants.RESULTS_LIMIT;
			this.searchModels(false);
		}

		
	});
});