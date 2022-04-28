sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"marina/model/formatter"
], function (BaseController, MessageBox, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.DataCardEditable", {

		formatter: formatter,

		onInit: function () {
			this.messageManager = sap.ui.getCore().getMessageManager();
			this.messageManager.registerObject(this.getView(), true);
            this.base_url = sap.ui.getCore().getModel("API").getData().url;

			this.popover = new sap.m.MessagePopover({
				items: {
					path: "message>/",
					template: new sap.m.MessagePopoverItem({
						type: "{message>type}",
						title: "{message>message}",
						subtitle: "{message>additionalText}",
						description: "{message>description}"
					})
				}
			});
			this.popover.setModel(this.messageManager.getMessageModel(), "message");
			sap.ui.getCore().setModel(new JSONModel({
				dataMessagePopover: this.byId("data-messagePopover"),
				submitDialog: this.byId("submitDialog").sId,
				approveDialog: this.byId("submitDialog").sId,
				rejectDialog: this.byId("submitDialog").sId,
				editDataCardOpl: this.byId("editDataCardOpl").sId,
				datasetNameInput: this.byId("datasetNameInput").sId,
				dataClassification: this.byId("data-classification").sId,
				dataCardWorkflow: this.byId("dataCard-workflow").sId,
				dataClassification: this.byId("data-classification").sId,
				datasetNameInput: this.byId("datasetNameInput").sId
				//unlinkedList: this.byId("unlinkedList").sId

				
			}), "DataCardEditableModel")

			this.byId("data-messagePopover").setModel(this.messageManager.getMessageModel(), "message");

			var model = new sap.ui.model.json.JSONModel();
			model.setProperty("/dataCard", {});
			this.byId("editDataCardOpl").setModel(model);
			var oThis = this

			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "CLASSIFICATION"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/classifications", data.data);
						oThis.getView().getModel()
					}
					else  {
						MessageBox.error("An error occured retrieving Classifications.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});

			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "INDUSTRY_TYPE"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/industryTypes", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving Industry Types.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "KEY_APPLICATION"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/keyApps", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving Key Applications.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});

			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "EST_SIZE"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/estSizes", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving Estimated Sizes.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});	
			
			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "PRIMARY_DATA_TYPE"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/primaryDataTypes", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving Primary Data Types.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});	
			
			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "DATASET_FUNCTION"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/datasetFunctions", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving Data Set Functions.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "IS_PRIVACY_PII"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/isPrivacyPii", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving Privacy PII values.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "SAMPLING_METHOD"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/samplingMethods", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving Sampling Methods.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});

			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "LABELING_METHOD"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/labelingMethods", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving Labeling Methods.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "VALIDATION_METHOD"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/validationMethods", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving Validation Methods.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			$.ajax({
				url: this.base_url + "/config/getLookupValues",
				data: {name: "CLOUD"},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/clouds", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving Clouds.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("dataCardNew").attachMatched(this.onRouteMatched, this);
			oRouter.getRoute("dataCardEdit").attachMatched(this.onRouteMatched, this);
		},
		
		onAfterRendering: function()  {
			var opl = sap.ui.getCore().byId(sap.ui.getCore().getModel("DataCardEditableModel").getData().editDataCardOpl);
			opl.setHeight(window.innerHeight-215 + "px");
		},

		openSubmitDialog: function() {
			var dialog = sap.ui.getCore().byId(sap.ui.getCore().getModel("DataCardEditableModel").getData().submitDialog);
			dialog.open()
		},

		openAcceptDialog: function() {
			var dialog = sap.ui.getCore().byId(sap.ui.getCore().getModel("DataCardEditableModel").getData().acceptDialog);
			dialog.open()
		},

		openRejectDialog: function() {
			var dialog = sap.ui.getCore().byId(sap.ui.getCore().getModel("DataCardEditableModel").getData().rejectDialog);
			dialog.open()
		},

		onSubmitPress: function(e) {
			var notes
			console.log(e)
			this.submitDataCardForApproval(notes)	
		},

		onAcceptPress: function(e) {
			var notes,
				currentState = this.getModel().getProperty("/dataCard").CURRENT_STATE_ID
			console.log(e)
			this.approveCard(notes, currentState)
			
		},

		onRejectPress: function(e) {
			var notes,
				currentState = this.getModel().getProperty("/dataCard").CURRENT_STATE_ID
			console.log(e)
			this.rejectCard(notes, currentState)
			
		},

		closeDialog: function(e) {
			e.getSource().getParent().close()

		},
		
		onRouteMatched: function(e)  {
			var args = e.getParameter("arguments");
			this.wfId = args.wfId;
			this.cardId = args.cardId;

			this.messageManager.removeAllMessages();
			// reset the value state for the required fields
			sap.ui.getCore().byId(sap.ui.getCore().getModel("DataCardEditableModel").getData().datasetNameInput).setValueState(sap.ui.core.ValueState.None);
			sap.ui.getCore().byId(sap.ui.getCore().getModel("DataCardEditableModel").getData().dataClassification).setValueState(sap.ui.core.ValueState.None);

			this.getDataCard();
		}, 
		
		getDataCard: function()  {
			var model = this.byId("editDataCardOpl").getModel(),
                baseURL = this.base_url = sap.ui.getCore().getModel("API").getData().url;
			model.setProperty("/dataCard", {});
			
			var parent = this;
			
			// if the card id is not null, then the card exists and the user wants to edit
			if (this.cardId)  {
				$.ajax({
					url: baseURL + "/data/getDataCardById",
					data: {id: this.cardId},
					success: function(data)  {
						if (data.status === 200)  {
							// convert all attributes that contain multiple values to an array
							data.data.SAMPLING_METHODS = parent.convertMuliValues(data.data.SAMPLING_METHODS);
							data.data.DATASET_FUNCTION = parent.convertMuliValues(data.data.DATASET_FUNCTION);
							data.data.LABELING_METHODS = parent.convertMuliValues(data.data.LABELING_METHODS);
							data.data.VALIDATION_METHOD = parent.convertMuliValues(data.data.VALIDATION_METHOD);
							
							model.setProperty("/dataCard", data.data);
							
							if (data.data.ACTION_TAKEN)  {
								$.ajax({
									url: baseURL + "/data/getCardWorkflow",
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
							}
	
							// set page classification
							parent.setSecurityBanner(data.data.CLASSIFICATION);
						}
						else  {
							MessageBox.error("An error occured loading Data Card for edit.");
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			}
		},
		
		openMessages: function(button)  {
			this.popover.openBy(button);
		},
		
		saveDataCard: function(objectPageLayout)  {
			var parent = this;
			var model = this.getView().getModel();
			var dataCard = model.getProperty("/dataCard");

			var valid = this.validateForm();
			
			if (!valid)  {
				if (!dataCard.DATA_CARD_ID)  {
					$.ajax({
						url: this.base_url + "/config/getNewGuid",
						method: "GET",
						success: function(data)  {
							if (data.status === 200)  {
								// set the DATA_CARD_ID to the new guid
								dataCard.DATA_CARD_ID = data.data.GUID;
								dataCard.WF_ID = parent.wfId;
								dataCard.IS_APPROVED = 0;
								
								parent._save(dataCard, true);
							}
							else  {
								MessageBox.error("An error occured retrieving new guid.");
							}
						},
						error: function(xhr, ajaxOptions, thrownErr)  {
							console.log(thrownErr);
						},
						complete: function()  {
							objectPageLayout.setBusy(false);
						}
					});
				}
				else  {
					this._save(dataCard, true);
				}
			}
		},
		
		_save: function(dataCard, showMsg)  {
			var parent = this;
			var model = this.getView().getModel();
			$.ajax({
				url: this.base_url + "/data/saveDataCard",
				method: "POST",
				async: false,
				data: {dataCard: dataCard},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/dataCard", dataCard);
						
						// reset classification, if needed
						parent.setSecurityBanner(dataCard.CLASSIFICATION);
						
						if (showMsg)  {
							sap.m.MessageToast.show("Data Card successfully saved.", {
							    duration: 3500,
							    my: "center center", 
							    at: "center center"
							});
						}
					}
					else  {
						MessageBox.error("An error occured saving Data Card.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});			
		},
		
		submitDataCardForApproval: function(notes)  {
			var model = this.getView().getModel();
			var dataCard = model.getProperty("/dataCard");
			var parent = this;
			
			// save card first
			this._save(dataCard, false);
			
			if (!dataCard.ACTION_TAKEN || dataCard.ACTION_TAKEN === 'Not Submitted')  {
				$.ajax({
					url: this.base_url + "/mgmt/createWfInstance",
					data: {wfId: dataCard.WF_ID, cardId: dataCard.DATA_CARD_ID, cardName: dataCard.DATA_SET.NAME, notes: notes},
					success: function(data)  {
						if (data.status === 200)  {
							parent.navToMyCards();
						}
						else  {
							MessageBox.error("An error occured creating data card workflow.\n\n" + data.data.message);
						}					
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			}
			// card had been rejected and user wants to resubmit
			else  {
				$.ajax({
					url: this.base_url + "/mgmt/resubmitCard",
					data: {wfId: dataCard.WF_ID, cardId: dataCard.DATA_CARD_ID, notes: notes},
					success: function(data)  {
						if (data.status === 200)  {
							parent.navToMyCards();
						}
						else  {
							MessageBox.error("An error occured resubmitting data card.\n\n" + data.data.message);
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			}
		},
		
		deleteDataCard: function()  {
			var parent = this;
			var model = this.getView().getModel();
			var dataCard = model.getProperty("/dataCard");
			
			MessageBox.confirm("Delete data card?", {
				onClose: function(val)  {
					if (val === 'OK')  {
						$.ajax({
							url: this.base_url + "/data/deleteDataCard",
							method: "GET",
							data: {cardId: dataCard.DATA_CARD_ID},
							success: function(data)  {
								if (status !== 200)  {
									MessageBox.error("An error occured deleting data card.");
								}
							},
							error: function(xhr, ajaxOptions, thrownErr)  {
								console.log(thrownErr);
							},
							complete: function()  {
								parent.navToMyCards();
							}
						});
					}
				}	
			});			
		},
		
		validateForm: function()  {
			this.messageManager.removeAllMessages();
			var combos = [ sap.ui.getCore().byId(sap.ui.getCore().getModel("DataCardEditableModel").getData().dataClassification) ];
			var valError = false;
			
			var datasetName = sap.ui.getCore().byId(sap.ui.getCore().getModel("DataCardEditableModel").getData().datasetNameInput);
			if (!datasetName.getValue())  {
				valError = true;
				this.messageManager.addMessages(
        			new sap.ui.core.message.Message({
            			message: "Data Set required.",
            			additionalText: "Data Set",
            			type: sap.ui.core.MessageType.Error,
            			target: datasetName.getBinding()
        			})
        		);
			}

			combos.forEach(function(combo)  {
				valError = this.validateCombo(combo) || valError;      
			}, this);
			
			return valError;
		},
		
		showUnlinkedDataSets: function()  {
			var parent = this;
			var model = this.getView().getModel();
			
			$.ajax({
				url: this.base_url + "/data/getUnlinkedDataSets",
				method: "GET",
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/unlinked", data.data);
					}
					else  {
						MessageBox.error("An error occured loading unlinked data sets.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
						
			var dialog = new sap.m.Dialog({
				title: "Unlinked Data Sets",
				icon: "sap-icon://database",
				contentWidth: "700px",
				contentHeight: "300px",				
				content: new sap.ui.xmlfragement("marina.view.fragment.UnlinkedDataSets", this),
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					text: "Link",
					press: function () {
						var list = sap.ui.getCore().byId(sap.ui.getCore().getModel("DataCardEditableModel").getData().unlinkedList);
						var selectedItem = list.getSelectedItem();
						parent.linkDataSet(selectedItem.data("dataSetId"));
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
		
		linkDataSet: function(dataSetId)  {
			var parent = this;
			var model = this.getView().getModel();
			var dataCard = model.getProperty("/dataCard");

			// if the cardId is null, user has not saved the newly created card yet.  Save first, then link to the data set
			if (this.cardId && this.cardId.length > 0)  {
				$.ajax({
					url: this.base_url + "/data/linkDataSet",
					data: {dataCardId: this.cardId, dataSetId: dataSetId},
					method: "GET",
					success: function(data)  {
						if (data.status !== 200) {
							MessageBox.error("An error occured linking data set.\n\n" + data.data.message);
						}
						else  {
							// refresh the data card stored in the model to display the linked data set
							parent.getDataCard();
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			}
			else  {
				$.ajax({
					url: this.base_url + "/config/getNewGuid",
					method: "GET",
					success: function(data)  {
						if (data.status === 200)  {
							// set the DATA_CARD_ID to the new guid
							dataCard.DATA_CARD_ID = data.data.GUID;
							dataCard.WF_ID = parent.wfId;
							dataCard.IS_APPROVED = 0;
							parent.cardId = data.data.GUID;
							
							parent._save(dataCard, true);

							$.ajax({
								url: this.base_url + "/data/linkDataSet",
								data: {dataCardId: data.data.GUID, dataSetId: dataSetId},
								method: "GET",
								success: function(data)  {
									if (data.status !== 200) {
										MessageBox.error("An error occured linking data set.\n\n" + data.data.message);
									}
									else  {
										// refresh the data card stored in the model to display the linked data set
										parent.getDataCard();
									}
								},
								error: function(xhr, ajaxOptions, thrownErr)  {
									console.log(thrownErr);
								}
							});
						}
						else  {
							MessageBox.error("An error occured retrieving new guid.");
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					},
					complete: function()  {
					}
				});
			}
		}

	});
});