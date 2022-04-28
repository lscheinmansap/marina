sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/layout/cssgrid/GridBoxLayout",
	"sap/ui/core/BusyIndicator",
    "marina/model/formatter"
], function (BaseController, JSONModel, MessageBox, GridBoxLayout, BusyIndicator, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.DataSearch", {

        formatter : formatter, 
        
		onInit: function () {
			var model = new JSONModel();
			this.getView().setModel(model);
			
            this.base_url = sap.ui.getCore().getModel("API").getData().url;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("data").attachMatched(this.onRouteMatched, this);
            sap.ui.getCore().setModel(new JSONModel({id: this.byId("dataSearch").sId}), "dataSearch")
		},
		
		loadFilters: function(e)  {
			var model = this.getView().getModel(),
                dataSearch = sap.ui.getCore().byId(sap.ui.getCore().getModel("dataSearch").getData().id)
			$.ajax({
				url: this.base_url + "/data/getSourceFilters",
				data: {
					val: dataSearch.getValue()
				},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/dataSetSources", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data set sources.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/data/getDataSetFileTypes",
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/dataSetFileTypes", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data set file types.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/data/getCategoryFilters",
				data: {
					val: dataSearch.getValue()
				},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/dataSetCategories", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data set categories.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/data/getLoadFreqFilters",
				data: {
					val: dataSearch.getValue()
				},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/dataSetLoadFreqs", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data set load frequency.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/data/getClassificationFilters",
				data: {
					val: dataSearch.getValue()
				},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/classifications", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data classifications.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		onAfterRendering: function()  {
			var scrollContainer = this.byId("dataScrollContainer");
			scrollContainer.setHeight(window.innerHeight-175 + "px");
		},
		
		onRouteMatched: function(e)  {
			this.offset = 0;
			this.loadFilters();
			this.byId("sortButton").setText("Last Modified");
			this.searchData(true);
		},
		
		searchData: function(resetOffset, sortBy, sortDir)  {
			if (resetOffset)  {
				this.offset = 0;
			}
			var model = this.getView().getModel();
			var searchVal = this.byId("dataSearch").getValue();
			var dateStart = this.byId("dataDateRange").getDateValue();
			var dateEnd = this.byId("dataDateRange").getSecondDateValue();
			var filters = this.processDataFilters();

			$.ajax({
				url: this.base_url + "/data/searchDataSet",
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
						MessageBox.error("An error occured loading data search results.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		processDataFilters: function()  {
			var filters = {};
			// parse the last mod chart
			
			var classifications = this.byId("dataClassificationList").getSelectedKeys();
			if (classifications && classifications.length > 0)  {
				filters["d.CLASSIFICATION"] = classifications;
			}
			
			var sources = this.byId("dataSourceList").getSelectedKeys();
			if (sources && sources.length > 0)  {
				filters["SOURCE"] = sources;
			}
			
			var categories = this.byId("dataCategoryList").getSelectedKeys();
			if (categories && categories.length > 0)  {
				filters["PRIME_CATEGORY"] = categories;
			}

			var loadFreqs = this.byId("dataLoadFrequencyList").getSelectedKeys();
			if (loadFreqs && loadFreqs.length > 0)  {
				filters["LOAD_FREQUENCY"] = loadFreqs;
			}

			var fileTypes = this.byId("dataFileTypeList").getSelectedKeys();
			if (fileTypes && fileTypes.length > 0)  {
				filters["FILE_TYPE"] = fileTypes;
			}

			return filters;
		},
		
		clearAllFilters: function()  {
			this.byId("dataSearch").setValue("");
			this.byId("dataClassificationList").removeAllSelectedItems();
			this.byId("dataSourceList").removeAllSelectedItems();
			this.byId("dataCategoryList").removeAllSelectedItems();
			this.byId("dataLoadFrequencyList").removeAllSelectedItems();
			this.byId("dataFileTypeList").removeAllSelectedItems();
			this.byId("dataDateRange").setDateValue(null);
			this.byId("dataDateRange").setSecondDateValue(null);
		},
		
		getNext: function()  {
			var model = this.getView().getModel();
			var offset = this.offset + constants.RESULTS_LIMIT;
			if (offset < model.getProperty("/results/total"))  {
				this.offset = offset;
				this.searchData(false);
			}
		},

		getPrevious: function()  {
			var offset = this.offset - constants.RESULTS_LIMIT;
			if (offset >= 0)  {
				this.offset = offset;
				this.searchData(false);
				
			}
		},
		
		getFirst: function()  {
			this.searchData(true);
		},

		getLast: function()  {
			var model = this.getView().getModel();
			var total = model.getProperty("/results/total");
			var totalPages = parseInt(total)/constants.RESULTS_LIMIT;
			if (totalPages % 1 !== 0)  {
				totalPages = Math.trunc(totalPages)+1;
			}
			this.offset = (totalPages - 1) * constants.RESULTS_LIMIT;
			this.searchData(false);
		}
		
	});
});