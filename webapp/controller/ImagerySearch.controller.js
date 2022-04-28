sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"marina/model/formatter"
], function (BaseController, JSONModel, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.ImagerySearch", {

        formatter: formatter,

		onInit: function () {
			this.base_url = sap.ui.getCore().getModel("API").getData().url;
			var model = new JSONModel({
				apiURL: this.base_url
			});
			this.getView().setModel(model);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("imagery").attachMatched(this.onRouteMatched, this);
		},
		
		loadFilters: function(e)  {
			var model = this.getView().getModel();
			
			$.ajax({
				url: this.base_url + "/imagery/getClassificationFilters",
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
				url: this.base_url + "/imagery/getLabelFilters",
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/annotations", data.data);
					}
					else  {
						MessageBox.error("An error occured loading annotations.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/imagery/getPlatformFilters",
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/platforms", data.data);
					}
					else  {
						MessageBox.error("An error occured loading platforms.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/imagery/getImageryTypeFilters",
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/imageryTypes", data.data);
					}
					else  {
						MessageBox.error("An error occured loading imagery types.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/imagery/getTeDesignationFilters",
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/teDesignations", data.data);
					}
					else  {
						MessageBox.error("An error occured loading TE designations.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			
		},
		
		onAfterRendering: function()  {
			var maxHeight = Math.round(window.innerHeight-175);
			this.byId("imageryResultsBox").setHeight(Math.round(maxHeight) + "px");
			this.byId("imageryResultsScroll").setHeight(Math.round(maxHeight * .60) + "px");
			var mapHeight = Math.round(maxHeight * .60);
			var mapContainer = this.byId("mapFilterContainer")
			mapContainer.setHeight(mapHeight + "px");
			var base_url = this.base_url
			// setup the map for filtering
			var parent = this;
			this.isMapAreaSelect = false;
			setTimeout(function () {
				parent.filterMap = L.map(parent.byId("mapFilterContainer").sId).setView([39.82, -98.58], 2);
				
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(parent.filterMap);
				
				L.easyButton('<img width="18px" src="images/selection.png" style="padding-top: 5;">', function(btn, mp)  {
					parent.toggleMapAreaSelect(!parent.isMapAreaSelect);
				}).addTo(parent.filterMap);
				
				
				$.ajax({
					url: base_url + "/imagery/getFramesHeatMap",
					success: function(data)  {
						if (data.status === 200)  {
							L.heatLayer(parent.formatHeatMap(data.data), {radius: 15}).addTo(parent.filterMap);
						}
						else  {
							MessageBox.error("An error occured loading frames heatmap.\n\n" + data.data.message);
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			}, 200);
		},
		
		onRouteMatched: function(e)  {
			this.offset = 0;
			this.loadFilters();
			this.byId("imagerySortButton").setText("Original Date");
			this.searchImagery(true);
		},

		sortImagery: function(e) {
            var sortButtonText = this.byId("imagerySortButton").getText(), 
                sortBy = "",
                sortDir = e.getSource().getKey()
            if (sortButtonText === 'Original Date')  {
                sortBy = "IMAGERY_START_TIME_STAMP";
            }
            else if (sortButtonText === 'Duration')  {
                sortBy = "DURATION_SECONDS";
            }
            else if (sortButtonText === 'Popularity')  {
                sortBy = "NUM_VIEWS";
            }
            this.searchImagery(true, sortBy, sortDir);

        },

		clearImageryDateRange: function(){
			this.byId("imageryDateRange").setDateValue(null)
			this.byId("imageryDateRange").setSecondDateValue(null)
			this.searchImagery(true)
		},

		clearImageryDateRange: function(){
			this.byId("imageryClassificationList").removeAllSelectedItems()
			this.searchImagery(true)
		},

		clearAnnotations: function(){
			this.byId("annotationsList").removeAllSelectedItems()
			this.searchImagery(true)
		},

		clearTypes: function(){
			this.byId("imageryTypesList").removeAllSelectedItems()
			this.searchImagery(true)
		},

		clearPlatforms: function(){
			this.byId("platformsList").removeAllSelectedItems()
			this.searchImagery(true)
		},

		clearTEDesignations: function(){
			this.byId("teDesignationsList").removeAllSelectedItems()
			this.searchImagery(true)
		},

		searchImagery: function(e, sortBy, sortDir)  {

            var resetOffset = true,
                sortBy = undefined,
                sortDir = undefined;
            if(e === false){
                resetOffset = false
            } else if(e !== true){
                sortBy = e.getSource().getSelectedKeys();
                sortDir = this.byId("imagerySortDir").getSelectedKey()
                this.byId("imagerySortButton").setText(e.getSource().getSelectedText())
            }
            
            if (resetOffset)  {
				this.offset = 0;
			}
			var model = this.getView().getModel();
			var coords = model.getProperty("/coords");
			var filters = this.processFilters();
			var dateStart = this.byId("imageryDateRange").getDateValue();
			var dateEnd = this.byId("imageryDateRange").getSecondDateValue();
			
			$.ajax({
				url: this.base_url + "/imagery/searchImagery",
				type: "POST",
				data: {
					limit: constants.RESULTS_LIMIT, 
					offset: this.offset, 
					filters: filters,
					start: (dateStart) ? moment(dateStart).format('YYYY-MM-DD') : null,
					end: (dateEnd) ? moment(dateEnd).format('YYYY-MM-DD') : null,
					coords: (coords && this.isMapAreaSelect) ? JSON.stringify(coords) : null,
					sortBy: sortBy,
					sortDir: sortDir
				},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/results", data.data);
					}
					else  {
						MessageBox.error("An error occured loading imagery search results.\n\n" + data.data.message);
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
			
			var classifications = this.byId("imageryClassificationList").getSelectedKeys();
			if (classifications && classifications.length > 0)  {
				filters["CLASSIFICATION"] = classifications;
			}

			var imageryTypes = this.byId("imageryTypesList").getSelectedKeys();
			if (imageryTypes && imageryTypes.length > 0)  {
				filters["IMAGERY_PACKAGE_TYPE"] = imageryTypes;
			}

			var platforms = this.byId("platformsList").getSelectedKeys();
			if (platforms && platforms.length > 0)  {
				filters["PLATFORM_TYPE"] = platforms;
			}

			var teDesignations = this.byId("teDesignationsList").getSelectedKeys();
			if (teDesignations && teDesignations.length > 0)  {
				filters["TE_DESIGNATION"] = teDesignations;
			}

			var annotations = this.byId("annotationsList").getSelectedKeys();
			if (annotations && annotations.length > 0)  {
				filters["LABEL_NAME"] = annotations;
			}

			return filters;
		},
		
		clearAllFilters: function()  {
			this.byId("imageryClassificationList").removeAllSelectedItems();
			this.byId("annotationsList").removeAllSelectedItems();
			this.byId("teDesignationsList").removeAllSelectedItems();
			this.byId("imageryTypesList").removeAllSelectedItems();
			this.byId("platformsList").removeAllSelectedItems();
			this.byId("imageryDateRange").setDateValue(null);
			this.byId("imageryDateRange").setSecondDateValue(null);
		},
		
		toggleMapAreaSelect: function(pressed)  {
			var model = this.getView().getModel();
			var parent = this;
			if (pressed)  {
				this.isMapAreaSelect = true;
				this.areaSelect = L.areaSelect({width:100, height:100});
				this.areaSelect.addTo(this.filterMap);
				// Get a callback when the bounds change
				this.areaSelect.on("change", function() {
					model.setProperty("/coords", this.getBounds());
					parent.searchImagery(true);
				});
				// Set the dimensions of the box
				this.areaSelect.setDimensions({width: 100, height: 100});	
			}
			else  {
				this.isMapAreaSelect = false;
				this.areaSelect.remove();
				model.setProperty("/coords", null);
				this.searchImagery(true);
			}
		},
		
		getNext: function()  {
			var model = this.getView().getModel();
			var offset = this.offset + constants.RESULTS_LIMIT;
			if (offset < model.getProperty("/results/total"))  {
				this.offset = offset;
				this.searchImagery(false);
			}
		},

		getPrevious: function()  {
			var offset = this.offset - constants.RESULTS_LIMIT;
			if (offset >= 0)  {
				this.offset = offset;
				this.searchImagery(false);
				
			}
		},

		getFirst: function()  {
			this.searchImagery(true);
		},

		getLast: function()  {
			var model = this.getView().getModel();
			var total = model.getProperty("/results/total");
			var totalPages = parseInt(total)/constants.RESULTS_LIMIT;
			if (totalPages % 1 !== 0)  {
				totalPages = Math.trunc(totalPages)+1;
			}
			this.offset = (totalPages - 1) * constants.RESULTS_LIMIT;
			this.searchImagery(false);
		},
		
		navToImageryPackage: function(e)  {
            sap.ui.core.BusyIndicator.show()
            var id = e.getSource().data("id"),
			    oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("imageryDetails", {"layout": sap.f.LayoutType.OneColumn, "id": id});
		}

		
	});
});