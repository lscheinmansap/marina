sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/suite/ui/commons/MicroProcessFlow",
	"sap/suite/ui/commons/MicroProcessFlowItem",
	"sap/ui/model/json/JSONModel",
	"marina/model/formatter"
], function (BaseController, MessageBox, MicroProcessFlow, MicroProcessFlowItem, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.DataSetMaster", {

		formatter: formatter,

		onInit: function () {
			var model = this.getOwnerComponent().getModel("DATASET_MODEL");
			this.getView().setModel(model);
			this.base_url = sap.ui.getCore().getModel("API").getData().url;
			sap.ui.getCore().setModel(new JSONModel({
				masterMetaFB: this.byId("masterMetaFB").sId,
				filesTable: this.byId("filesTable").sId,
				dataSetWorkFlow: this.byId("dataSetWorkFlow").sId
			}), "dataSetMasterComponents")
		},
		
		onAfterRendering: function(e)  {
			var opl = this.byId("dataSetOpl");
			opl.setHeight(window.innerHeight-215 + "px");
		},

		showFile: function(e)  {
			var parent = this;
			var filePath = e.getSource().getBindingContext().getPath();
			var model = this.getView().getModel();
			var file = model.getProperty(filePath);
			var fileModel = this.getOwnerComponent().getModel("FILE_MODEL");
			fileModel.setProperty("/file", file);

			this.audit(file.DATA_FILE_ID, constants.AUDIT_TYPE_DATA_FILE, constants.AUDIT_ACTION_VIEW)
			var baseURL = this.base_url
			// at the moment, only csv files have column metadata and data preview
			if (file.FILE_TYPE && file.FILE_TYPE.toUpperCase() === 'CSV')  {
				$.ajax({
					url: baseURL + "/data/getDataFileColumns",
					data: {id: file.DATA_FILE_ID},
					success: function(data)  {
						if (data.status === 200)  {
							var cols = data.data;
							fileModel.setProperty("/columns", cols);
							var totalCols = data.data.length;

							// get file col type breakdown.  this is data is used in the donut chart on the file page
							$.ajax({
								url: baseURL + "/data/getFileColTypeCounts",
								data: {id: file.DATA_FILE_ID},
								success: function(data)  {
									if (data.status === 200)  {
										fileModel.setProperty("/fileColTypes", parent.computePercentage(data.data, totalCols));
									}
									else  {
										MessageBox.error("An error occured loading data file column type counts.\n\n" + data.data.message);
									}
								},
								error: function(xhr, ajaxOptions, thrownErr)  {
									console.log(thrownErr);
								}
							});
							
							// data preview from DI
							$.ajax({
								url: baseURL + "/data/getDataPreview",
								data: {id: file.DATA_FILE_ID},
								success: function(data)  {
									if (data.status === 200)  {
										var result = parent.formatCsvPreview(data.data, cols);
										fileModel.setProperty("/preview", result.data);
									}
									else  {
										MessageBox.error("An error occured loading data preview.\n\n" + data.data);
									}
								},
								error: function(xhr, ajaxOptions, thrownErr)  {
									console.log(thrownErr);
								}
							});
					
						}
						else  {
							MessageBox.error("An error occured loading data file columns.\n\n" + data.data.message);
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});	
			}
			
			$.ajax({
				url: baseURL + "/data/getDataFileHistory",
				data: {id: file.DATA_FILE_ID},
				success: function(data)  {
					if (data.status === 200)  {
						fileModel.setProperty("/history", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data file history.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			var fcl = this.getView().getParent().getParent();
			fcl.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded);
		},
		
		toggleSubscription: function(subscribe)  {
			var model = this.getView().getModel();
			var dataSetId = model.getProperty("/dataSet").DATA_SET_ID;

			if (subscribe)  {
				$.ajax({
					url: baseURL + "/data/subscribeDataSet",
					data: {id: dataSetId},
					success: function(data)  {
						if (data.status === 200)  {
							model.setProperty("/dataSet/IS_SUBSCRIBED", true);
						}
						else  {
							MessageBox.error("An error occured subscribing to data set.");
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			}
			else  {
				$.ajax({
					url: baseURL + "/data/unsubscribeDataSet",
					data: {id: dataSetId},
					success: function(data)  {
						if (data.status === 200)  {
							model.setProperty("/dataSet/IS_SUBSCRIBED", false);
						}
						else  {
							MessageBox.error("An error occured unsubscribing from data set.");
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			}
		},
		
		setExportable: function(dataFileId, exportable, path)  {
			var parent = this;
			$.ajax({
				url: baseURL + "/data/setFileExportable",
				data: {dataFileId: dataFileId, exportable: exportable},
				success: function(data)  {
					
					if (data.status === 200)  {
						var model = parent.getView().getModel();
						var file = model.getProperty(path);
						file.EXPORTABLE = data.data.exportable;
						model.setProperty(path, file);
						
						// if not exportable, disable checkbox
						var filesTable = sap.ui.getCore().byId("filesTable");
						var items = filesTable.getItems();
						var item = items[path.substring(path.lastIndexOf('/')+1)];
						var cb = item.$().find('.sapMCb');
						var oCb = sap.ui.getCore().byId(cb.attr('id'));
						var enabled = (exportable === 'N') ? false : true;
						oCb.setEnabled(!enabled);
					}
					else  {
						MessageBox.error("An error occured setting file exportable.\n\n" + data.data);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		showActions: function(e)  {
			var btn = e.getSource();
			sap.ui.getCore().byId("dataCardActionSheet").openBy(btn);
		},
		
		deleteDataCard: function()  {
			var parent = this;
			var model = this.getView().getModel();
			var dataCardId = model.getProperty("/dataSet").DATA_CARD_ID;
			
			MessageBox.confirm("Delete data card?", {
				onClose: function(val)  {
					if (val === 'OK')  {
						$.ajax({
							url: baseURL + "/data/deleteDataCard",
							method: "GET",
							data: {cardId: dataCardId},
							success: function(data)  {
								if (data.status !== 200)  {
									MessageBox.error("An error occured deleting data card.\n\n" + data.data.message);
								}
							},
							error: function(xhr, ajaxOptions, thrownErr)  {
								console.log(thrownErr);
							},
							complete: function()  {
								parent.navBack();
							}
						});
					}
				}	
			});			
		},
		
		exportDataCard: function(exporttype)  {
			var model = this.getView().getModel();
			var dataCardId = model.getProperty("/dataSet").DATA_CARD_ID;

			this.audit(dataCardId, constants.AUDIT_TYPE_DATA_CARD, constants.AUDIT_ACTION_DOWNLOAD);

			var winLoc = window.location;
			if (exporttype === 'JSON')  {
				winLoc.replace("/data/exportDataCardAsJson?cardId=" + dataCardId);
			}
			else if (exporttype === 'CSV') {
				winLoc.replace("/data/exportDataCardAsCsv?cardId=" + dataCardId);
			}
		},
		
		exportAudit: function(exportType)  {
			var model = this.getView().getModel();
			var dataCardId = model.getProperty("/dataSet").DATA_SET_ID;
			var name = model.getProperty("/dataSet").NAME;

			var winLoc = window.location;
			if (exportType === 'JSON')  {
				winLoc.replace("/data/exportAuditAsJson?id=" + dataCardId + "&cardName=" + name);
			}
			else if (exportType === 'CSV') {
				winLoc.replace("/data/exportAuditAsCsv?id=" + dataCardId + "&cardName=" + name);
			}
		},

	});
});