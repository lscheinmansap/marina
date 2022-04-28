sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("marina.controller.DataSet", {
		onInit: function () {
			var model = new JSONModel();
			this.getView().setModel(model);
			this.base_url = sap.ui.getCore().getModel("API").getData().url; 

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("dataSet").attachMatched(this.onRouteMatched, this);
			
		},
		onRouteMatched: function(e)  {
			sap.ui.core.BusyIndicator.hide();

			var parent = this;
			var model = this.getView().getModel();
			model.setProperty("/layout", sap.f.LayoutType.OneColumn);
			var baseURL = this.base_url
			
			var datasetModel = this.getOwnerComponent().getModel("DATASET_MODEL");
			
			var fb = sap.ui.getCore().byId(sap.ui.getCore().getModel("dataSetMasterComponents").getData().masterMetaFB);
			fb.removeStyleClass("hide");
			
			var filesTable = sap.ui.getCore().byId(sap.ui.getCore().getModel("dataSetMasterComponents").getData().filesTable);
			filesTable.removeSelections();
				
			var args = e.getParameter("arguments");
			this.dataSetId = args.id;
			
			this.audit(this.dataSetId, constants.AUDIT_TYPE_DATA_SET, constants.AUDIT_ACTION_VIEW);
			
			// get the prev view to determine which search field to use

			var sPreViewName = this.getView().getParent().getPreviousPage().getViewName();
			// search val is used to highlight files in the list that match any search criteria
			var searchVal;
			if (sPreViewName === 'marina.view.DataSearch')  {
				searchVal = sap.ui.getCore().byId(sap.ui.getCore().getModel("dataSearch").getData().id).getValue();
			}
			else if (sPreViewName === 'marina.view.Search')  {
				searchVal = sap.ui.getCore().byId(sap.ui.getCore().getModel("searchComponents").getData().globalSearch).getValue();
			}

			$.ajax({
				url: baseURL + "/data/getDataSetById",
				data: {id: this.dataSetId, val: searchVal},
				success: function(data)  {
					if (data.status === 200)  {
						// set page classification
						parent.setSecurityBanner(data.data.CLASSIFICATION);
						parent.dataSetName = data.data.NAME;
						
						datasetModel.setProperty("/dataSet", data.data);
						var totalFiles = data.data.FILES.total;

						
						// get data card workflow
						if (data.data.dataCard.DATA_CARD_ID)  {
							$.ajax({
								url: baseURL + "/data/getCardWorkflow",
								//data: {cardId: data.data.dataCard.DATA_CARD_ID},
								success: function(data)  {
									if (data.status === 200)  {
										datasetModel.setProperty("/workflow", data.data);
									}
									else  {
										MessageBox.error("An error occured retrieving card workflow.\n\n" + data.data.message);
									}
								},
								error: function(xhr, ajaxOptions, thrownErr)  {
									console.log(thrownErr);
								}
							});	
						} 
						else  {
							datasetModel.setProperty("/workflow", {});
						}
						
						// get file type breakdown.  this is data is used in the donut chart on the ds page
						$.ajax({
							url: baseURL + "/data/getDataSetFileCounts",
							data: {id: parent.dataSetId},
							success: function(data)  {
								if (data.status === 200)  {
									datasetModel.setProperty("/dataSetFileTypes", parent.computePercentage(data.data, totalFiles));
								}
								else  {
									MessageBox.error("An error occured loading data set file counts.\n\n" + data.data.message);
								}
							},
							error: function(xhr, ajaxOptions, thrownErr)  {
								console.log(thrownErr);
							}
						});
					}
					else  {
						MessageBox.error("An error occured loading Data Set.");
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});

		},
		
		onStateChange: function(e) {
			var isNavArrow = e.getParameter("isNavigationArrow");
			if (isNavArrow)  {
				var layout = e.getParameter("layout");
				var flexbox = sap.ui.getCore().byId("masterMetaFB");

				if (layout ==="TwoColumnsMidExpanded")  {
					flexbox.addStyleClass("hide"); 
				}
				else  {
					flexbox.removeStyleClass("hide");
				}
			}
		},

		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
		}
		
	});
});