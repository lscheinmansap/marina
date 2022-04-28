sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
    "marina/model/formatter"
], function (BaseController, JSONModel, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.DataSetManifest", {

        formatter: formatter,

		onInit: function () {
			var model = new JSONModel();
			this.getView().setModel(model);
			
			this._mViewSettingsDialogs = {};
			
			$.ajax({
				url: sap.ui.getCore().getModel("API").getData().url + "/config/getLookupValues",
				data: {name: "CLASSIFICATION"},
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						//data.data.unshift({"KEY":"","VALUE":""});
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
				url: sap.ui.getCore().getModel("API").getData().url +  "/config/getLookupValues",
				data: {name: "DATA_SET_CATEGORY"},
				async: true,
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
				url: sap.ui.getCore().getModel("API").getData().url +  "/config/getLookupValues",
				data: {name: "DATA_SET_SUB_CATEGORY"},
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						data.data.unshift({"KEY":"","VALUE":""});
						model.setProperty("/dataSetSubCategories", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data set sub-categories.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});

			$.ajax({
				url: sap.ui.getCore().getModel("API").getData().url +  "/config/getLookupValues",
				data: {name: "ACCESS_TYPE"},
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						data.data.unshift({"KEY":"","VALUE":""});
						model.setProperty("/dataSetAccessTypes", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data set access types.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});

			$.ajax({
				url: sap.ui.getCore().getModel("API").getData().url +  "/config/getLookupValues",
				data: {name: "LOAD_STATUS"},
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						data.data.unshift({"KEY":"","VALUE":""});
						model.setProperty("/dataSetLoadStatus", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data set load status.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});

			$.ajax({
				url: sap.ui.getCore().getModel("API").getData().url +  "/config/getLookupValues",
				data: {name: "LOAD_FREQ"},
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						data.data.unshift({"KEY":"","VALUE":""});
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
				url: sap.ui.getCore().getModel("API").getData().url +  "/config/getLookupValues",
				data: {name: "DATA_CARD_STATUS"},
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						data.data.unshift({"KEY":"","VALUE":""});
						model.setProperty("/dataCardStatus", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data card statuses.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("dataSetManifest").attachMatched(this.onRouteMatched, this);
		},
	
		onAfterRendering: function()  {
			var opl = this.byId("manifestScroll");
			opl.setHeight(window.innerHeight-215 + "px");
		},
		
		onRouteMatched: function(e)  {
			var dataSetSearch = this.byId("manifestSearch");
			var dataSetTerm = dataSetSearch.getValue();
			this.dataSetOffset = 0;
			this.getManifest(dataSetTerm, true);
		},
		
		getManifest: function(resetOffset)  {
			var model = this.getView().getModel();
			var parent = this;
			if (resetOffset)  {
				this.dataSetOffset = 0;
			}
			
			var searchVal = this.byId("manifestSearch").getValue();

			$.ajax({
				url: sap.ui.getCore().getModel("API").getData().url + "/data/searchManifest",
				data: {val: searchVal, limit: constants.RESULTS_LIMIT, offset: this.dataSetOffset, filters: this.dataSetFilters, start: this.dataSetStart, end: this.dataSetEnd},
				success: function(data)  {
					if (data.status === 200)  {
						parent.dataSetTotal = data.data.total;
						model.setProperty("/results", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data sets.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});		
		},
		
		getNext:  function()  {
			var model = this.getView().getModel();
			var offset = this.dataSetOffset + constants.RESULTS_LIMIT;
			if (offset < model.getProperty("/results/total"))  {
				this.dataSetOffset = offset;
				this.getManifest(false);
			}
		},

		getPrevious: function()  {
			var offset = this.dataSetOffset - constants.RESULTS_LIMIT;
			if (offset >= 0)  {
				this.dataSetOffset = offset;
				this.getManifest(false);
				
			}
		},

		getFirst: function()  {
			this.getManifest(true);
		},

		getLast: function()  {
			var model = this.getView().getModel();
			var total = model.getProperty("/results/total");
			var totalPages = parseInt(total)/constants.RESULTS_LIMIT;
			if (totalPages % 1 !== 0)  {
				totalPages = Math.trunc(totalPages)+1;
			}
			this.dataSetOffset = (totalPages - 1) * constants.RESULTS_LIMIT;
			this.getManifest(false);
		},
		
		openManifestDialog: function(dataset)  {
			var model = this.getView().getModel();
			if (dataset)  {
				model.setProperty("/dataset", dataset);
			}
			else  {
				model.setProperty("/dataset", {});
			}
			
			if (!this.manifestDialog)  {
				this.manifestDialog = new sap.m.Dialog({
					title: "Data Set Manifest Entry",
					icon: "sap-icon://provision",
					contentWidth: "630px",
					contentHeight: "500px",				
					content: new sap.ui.jsfragment( "marina.view.fragment.ManifestRow", parent),
					beginButton: new sap.m.Button({
						icon: "sap-icon://save",
						text: "Save",
						press: function () {
							this.saveManifestRow();
							this.manifestDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Close",
						icon: "sap-icon://decline",
						press: function () {
							this.manifestDialog.close();
						}.bind(this)
					})
				});
				this.getView().addDependent(this.manifestDialog);
			}
			this.manifestDialog.open();			
		},
		
		saveManifestRow: function()  {
			var model = this.getView().getModel();
			var dataset = model.getProperty("/dataset");
			var parent = this;

			if (!dataset.DATA_SET_ID)  {
				$.ajax({
					url: sap.ui.getCore().getModel("API").getData().url + "/config/getNewGuid",
					method: "GET",
					success: function(data)  {
						if (data.status === 200)  {
							dataset.DATA_SET_ID = data.data.GUID;
							parent._save(dataset);
						}
						else  {
							MessageBox.error("An error occured retrieving new guid.\n\n" + data.data.message);
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			}
			else  {
				parent._save(dataset);
			}
			
		},
		
		_save: function(dataset)  {
			var parent = this;
			$.ajax({
				url: sap.ui.getCore().getModel("API").getData().url + "/data/saveManifestRow",
				async: false,
				method: "POST",
				data: {manifestRow: dataset},
				success: function(data)  {
					if (data.status === 200)  {
						sap.m.MessageToast.show("Manifest row successfully saved.", {
						    duration: 3500,
						    my: "center center", 
						    at: "center center"
						});
						parent.refreshManifest();
					}
					else  {
						MessageBox.error("An error occured saving manifest row.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		deleteManifestRow: function(id)  {
			var parent = this;
			MessageBox.confirm("Delete manifest row?", {
				onClose: function(val)  {
					if (val === 'OK')  {
						$.ajax({
							url: sap.ui.getCore().getModel("API").getData().url + "/data/deleteManifestRow",
							method: "GET",
							data: {id: id},
							success: function(data)  {
								if (data.status !== 200)  {
									MessageBox.error("An error occured deleting manifest row.\n\n" + data.data.message);
								}
								else  {
									parent.refreshManifest();
								}
							},
							error: function(xhr, ajaxOptions, thrownErr)  {
								console.log(thrownErr);
							}
						});
					}
				}	
			});
		},
		
		refreshManifest: function()  {
			var dataSetSearch = this.byId("manifestSearch");
			var dataSetTerm = dataSetSearch.getValue();
			this.getManifest(dataSetTerm, false);			
		},
		
		exportManifest: function(exporttype)  {
			var winLoc = window.location;
			if (exporttype === 'CSV')  {
				winLoc.replace("/data/exportManifestAsCsv");
			
			}
			else if (exporttype === 'JSON')  {
				winLoc.replace("/data/exportManifestAsJson");
			}
		},
		
		handleDataSetFilterConfirm: function(event)  {
			this.dataSetFilters = event.getParameters().filterCompoundKeys;

			var dataSetSearch = this.byId("manifestSearch");
			var dataSetTerm = dataSetSearch.getValue();
			this.getManifest(dataSetTerm, true);
		},
		
		handleDataSetFilterReset: function(event)  {
			this.dataSetFilters = {};
		}

	});
});