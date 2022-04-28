sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/suite/ui/commons/MicroProcessFlow",
	"sap/suite/ui/commons/MicroProcessFlowItem",
	"sap/suite/ui/commons/ProcessFlow",
	"sap/suite/ui/commons/ProcessFlowLaneHeader"
], function (BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("marina.controller.ModelCard", {
		onInit: function () {
			var model = new sap.ui.model.json.JSONModel();
			this.getView().setModel(model);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("modelCard").attachMatched(this.onRouteMatched, this);
		},
		
		onAfterRendering: function(e)  {
			var opl = sap.ui.getCore().byId("modelCardView-ModelObjectPageLayout");
			opl.setHeight(window.innerHeight-215 + "px");
		},

		onRouteMatched: function(e)  {
			sap.ui.core.BusyIndicator.hide();

			var args = e.getParameter("arguments");
			this.cardId = args.id;
			this.isApproval = args.approval;

			// select first section each time the page is loaded
			var opl = sap.ui.getCore().byId("modelCardView-ModelObjectPageLayout");
			opl.setSelectedSection("detailsSection");

			this.audit(this.cardId, constants.AUDIT_TYPE_MODEL_CARD, constants.AUDIT_ACTION_VIEW);

			this.getModelCard();
		},
        
		searchModelDataSets: function(e)  {
            // TODO test

            var val = e.getSource().getValue();
            var aFilters = [];
            if (val && val.length > 0) {
                var filter = new sap.ui.model.Filter("NAME", sap.ui.model.FilterOperator.Contains, val);
                aFilters.push(filter);
            }
            // update list binding
            var oBinding = list.getBinding("items");
            oBinding.filter(aFilters, "Application");
        },

		getModelCard:  function() {
			var model = this.getView().getModel();
			var parent = this;

			$.ajax({
				url: "/model/getModelCardById",
				data: {id: parent.cardId},
				success: function(data)  {
					if (data.status === 200)  {
						// set page classification
						parent.cardName = data.data.MODEL_NAME;                               
						parent.setSecurityBanner(data.data.MODEL_CLASSIFICATION);
						model.setProperty("/modelCardData", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving model card.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				},
				complete: function()  {
				}
			});

			$.ajax({
				url: "/model/getModelDataSetCategories",
				data: {id: parent.cardId},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/modelDataSetCategories", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving model data set categories.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});	
			
			$.ajax({
				url: "/data/getCardWorkflow",
				data: {cardId: parent.cardId},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/workflow", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving card workflow.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});			
			
			this.getAttachments();
		},		
		
		getAttachments: function()  {
			var model = this.getView().getModel();
			$.ajax({
				url: "/model/getModelCardAttachments",
				data: {id: this.cardId},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/attachments", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving model card attachments.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		downloadAttachment: function(attachmentId)  {
			var winLoc = window.location;
			winLoc.replace("/model/downloadModelCardAttachment?id=" + attachmentId);
		},
		
		editModelCard:  function(actionTaken)  {
			var parent = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("modelCardEdit", {"cardId": parent.cardId, "actionTaken": actionTaken});
		},
		
		deleteModelCard: function()  {
			var parent = this;
			var model = this.getView().getModel();
			var modelCard = model.getProperty("/modelCardData");
			
			MessageBox.confirm("Delete model card?", {
				onClose: function(val)  {
					if (val === 'OK')  {
						$.ajax({
							url: "/model/deleteModelCard",
							data: {cardId: modelCard.MODEL_CARD_ID},
							success: function(data)  {
								if (data.status !== 200)  {
									MessageBox.error("An error occured deleting model card.\n\n" + data.data.message);
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
		
		viewModel: function(url)  {
			this.audit(this.cardId, constants.AUDIT_TYPE_MODEL, constants.AUDIT_ACTION_VIEW);
			window.open(url, '_blank');
		},
		
		upload: function()  {
			var parent = this;
			
			var uploader = sap.ui.getCore().byId("modelUploader");
			var domRef = uploader.getFocusDomRef();
			var file = domRef.files[0];
			var reader = new FileReader();
			
			reader.onload = function(oEvent)  {
				$.ajax({
					url: "/model/uploadModelFile",
					type: "POST",
					data: {id: parent.cardId, name: file.name, size: file.size, type: file.type, content: oEvent.target.result},
					success: function(data)  {
						if (data.status === 200)  {
							parent.getAttachments();
						}
						else  {
							MessageBox.error("An error occured uploading file.\n\n" + data.data.message);
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			};
			reader.readAsDataURL(file);
		},
		
		deleteAttachment: function(attachmentId)  {
			var parent = this;
			
			MessageBox.confirm("Delete model card attachment?", {
				onClose: function(val)  {
					if (val === 'OK')  {
						$.ajax({
							url: "/model/deleteModelCardAttachment",
							data: {id: attachmentId},
							success: function(data)  {
								if (data.status === 200)  {
									parent.getAttachments();
								}
								else  {
									MessageBox.error("An error occured deleting model card attachment.\n\n" + data.data.message);
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
		
		showActions: function(e)  {
			var btn = e.getSource();
			sap.ui.getCore().byId("modelCardActionSheet").openBy(btn);
		},
		
		showDataSets: function()  {
			var parent = this;
			var model = this.getView().getModel();
			
			$.ajax({
				url: "/model/getDataSetsForModel",
				data: {modelCardId: this.cardId},
				method: "GET",
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/modelDataSets", data.data);
					}
					else  {
						MessageBox.error("An error occured loading data sets.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			// TODO move to view			
			var dialog = new sap.m.Dialog({
				title: "Data Sets",
				icon: "sap-icon://database",
				contentWidth: "700px",
				contentHeight: "300px",				
				content: new sap.ui.xmlfragment("marina.view.fragment.ModelDataSets", this),
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					text: "Link",
					press: function () {
						parent.linkModelDataSet();
						dialog.close();
						dialog.destroy();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cancel",
					press: function () {
						dialog.close();
						dialog.destroy();
					}.bind(this)
				})
			});
			this.getView().addDependent(dialog);
			dialog.open();
		},
		
		linkModelDataSet: function()  {
			var parent = this;
			var list = sap.ui.getCore().byId("modelDataSetsList");
			var selectedItems = list.getSelectedItems();
			selectedItems.forEach(function(item)  {
				$.ajax({
					url: "/model/linkModelDataSet",
					data: {modelCardId: parent.cardId, dataSetId: item.data("dataSetId")},
					success: function(data)  {
						if (data.status !== 200) {
							MessageBox.error("An error occured linking data set.\n\n" + data.data.message);
						}
						else  {
							parent.getModelCard();
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			});
		},
		
		unlinkModelDataSets: function(items)  {
			var parent = this;
			items.forEach(function(dataSetId)  {
				$.ajax({
					url: "/model/unlinkModelDataSet",
					data: {modelCardId: parent.cardId, dataSetId: dataSetId},
					success: function(data)  {
						if (data.status !== 200) {
							MessageBox.error("An error occured unlinking data set.\n\n" + data.data.message);
						}
						else  {
							parent.getModelCard();
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			});
		},

		exportModelCard: function(exporttype)  {
			this.audit(this.cardId, constants.AUDIT_TYPE_MODEL_CARD, constants.AUDIT_ACTION_DOWNLOAD);

			var winLoc = window.location;
			if (exporttype === 'JSON')  {
				winLoc.replace("/model/exportModelCardAsJson?cardId=" + this.cardId);
			}
			else if (exporttype === 'CSV') {
				winLoc.replace("/model/exportModelCardAsCsv?cardId=" + this.cardId);
			}
		},
		
		exportAudit: function(exportType)  {
			var model = this.getView().getModel();
			var id = model.getProperty("/modelCardData").MODEL_CARD_ID;
			var name = model.getProperty("/modelCardData").MODEL_NAME;

			var winLoc = window.location;
			if (exportType === 'JSON')  {
				winLoc.replace("/data/exportAuditAsJson?id=" + id + "&cardName=" + name);
			}
			else if (exportType === 'CSV') {
				winLoc.replace("/data/exportAuditAsCsv?id=" + id + "&cardName=" + name);
			}
		}
		
	});
});