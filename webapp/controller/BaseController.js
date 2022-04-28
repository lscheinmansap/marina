sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller,UIComponent, MessageBox, MessageToast)  {
	"use strict";
	
	return Controller.extend("marina.controller.BaseController", {
		getViewId: function()  {
			var id = this.getView().getId();
			return id.substring(id.lastIndexOf("-")+1); // id is prefixed with "containerNav---<view id>"
		},
		
		formatHeatMap: function(heat)  {
			var leafletHeat = [];
			heat.forEach(function(obj)  {
				leafletHeat.push([obj.LAT, obj.LON, obj.COUNTER]);
			});
			return leafletHeat;
		},

		datePickerChange: function(e)  {
			// TODO test
			switch(e.getParameters().value.toLowerCase())  {
				case "monthly":
					startDatePicker.setValue(moment().subtract(30, 'days').format('YYYY-MM-DD'));
					endDatePicker.setValue(moment().format('YYYY-MM-DD'));
					startDatePicker.fireChange();
					break;
				case "weekly":
					startDatePicker.setValue(moment().subtract(7, 'days').format('YYYY-MM-DD'));
					endDatePicker.setValue(moment().format('YYYY-MM-DD'));
					startDatePicker.fireChange();
					break;
				case "daily":
					startDatePicker.setValue(moment().subtract(24, 'hours').format('YYYY-MM-DD'));
					endDatePicker.setValue(moment().format('YYYY-MM-DD'));
					startDatePicker.fireChange();
					break;
			}
		},
		
		navBack: function()  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var history = sap.ui.core.routing.History.getInstance();
			var prevHash = history.getPreviousHash();
			
			if (prevHash !== undefined)  {
				window.history.go(-1);
			}
			else  {
				oRouter.navTo("home", {}, true);
			}
			
			this.setSecurityBanner("UNCLASSIFIED");
		},

		navToOverview: function()  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("overview");
		},

		navToSearch: function()  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("search");
		},

		navToCompass: function(oEvent)  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("compass");
			oEvent.getSource().setExpanded(true);
		},

		navToDataSearch: function()  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("data");
		},

		navToModelSearch: function()  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("models");
		},

		navToImagerySearch: function()  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("imagery");
		},

		navToDataSet: function(e)  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this),
				dataSetId = e.getSource().data("id")
			sap.ui.core.BusyIndicator.show();
			oRouter.navTo("dataSet", {"id": dataSetId});
		},

		navToMyCards: function(id)  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("myCards");
		},

		navToMyApprovals: function(id)  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("myApprovals");
		},

		navToModel: function (id, isApproval) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("modelCard", {"id": id, "approval": isApproval});
		},
		
		editModelCard:  function(cardId)  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("modelCardEdit", {"cardId": cardId});
		},
		
		editDataCard: function(e)  {
			var id = e.getSource().getModel().getProperty("/dataSet/dataCard").DATA_CARD_ID 
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("dataCardEdit", {"cardId": id});
		},

		validateInput: function(oInput)  {
			var sValueState = "None";
			var bValidationError = false;
			var oBinding = oInput.getBinding("value");
			try {
				oBinding.getType().validateValue(oInput.getValue());
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
				
				this.messageManager.addMessages(
        			new sap.ui.core.message.Message({
            			message: oException.message,
            			additionalText: oInput.getLabels()[0].getText(),
            			type: sap.ui.core.MessageType.Error,
            			target: oInput.getBinding,
            			//processor: new sap.ui.core.message.ControlMessageProcessor()
        			})
        		);
			}

			oInput.setValueState(sValueState);

			return bValidationError;
		},

		annotationsObjectSearch: function(e) {
			// TODO test
			var val = e.getSource().getValue();
			var aFilters = [];
			if (val && val.length > 0) {
				var filter = new sap.ui.model.Filter("OBJECT_NAME", sap.ui.model.FilterOperator.Contains, val);
				aFilters.push(filter);
			}
			// update list binding
			var oBinding = list.getBinding("items");
			oBinding.filter(aFilters, "Application");

		},

		selectAll: function(e) {

			//TODO Test
			console.log(e)
		},

		deSelectAll: function(e) {

			//TODO Test
			console.log(e)
		},
		
		validateCombo: function(oCombo)  {
			var sValueState = "None";
			var bValidationError = false;
			var oBinding = oCombo.getBinding("selectedKey");

			try {
				oBinding.getType().validateValue(oCombo.getSelectedKey());
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
				
				this.messageManager.addMessages(
        			new sap.ui.core.message.Message({
            			message: oException.message,
             			additionalText: oCombo.getLabels()[0].getText(),
	           			type: sap.ui.core.MessageType.Error,
            			target: oCombo.getBinding
            			//processor: new sap.ui.core.message.ControlMessageProcessor()
        			})
        		);
			}

			oCombo.setValueState(sValueState);

			return bValidationError;
		},
		
		getProcessStepDetails: function(e)  {
			if (e.getParameters().getState()[0].state !== "Planned")  {
				var assignedApprover = e.getSource().data("assignedApprover"),
					assignedTimestamp = e.getSource().data("assignedTimestamp"),
					actionTaken = e.getSource().data("actionTaken"),
					actionTimestamp = e.getSource().data("actionTimestamp"),
					actionComments = e.getSource().data("actionComments"),
					stepTitle = e.getParameters().getText(),
					icon = e.getParameters().getIconSrc()
			
				var item = new sap.m.NotificationListItem({
					showCloseButton: false,
					title: stepTitle,
					authorName: (actionTaken) ? actionTaken + " by " + assignedApprover : "Assigned",
					authorPicture: icon,
					//authorAvatarColor: parent.getProcessColor(state.state),
					description: actionComments,
					datetime: (actionTaken) ? moment(actionTimestamp).format("MMM DD, YYYY hh:mm:ss a") : moment(assignedTimestamp).format("MMM DD, YYYY hh:mm:ss a")
				});

				var popover = new sap.m.Popover({
					showHeader: false,
					contentWidth: "500px",
					contentHeight: "auto",
					verticalScrolling: true,
					placement: sap.m.PlacementType.Bottom,
					content: [item]
				});

				popover.openBy(e.getSource());
			}
		},

		getProcessColor: function(state)  {
			if (state === 'Positive')  {
				return sap.m.AvatarColor.Accent8;
			}
			else if (state === 'Critical')  {
				return sap.m.AvatarColor.Accent1;
			}
			else if (state === 'Error')  {
				return sap.m.AvatarColor.Accent2;
			}
			else {
				return sap.m.AvatarColor.Accent10;				
			}
		},

		approveCard: function(cardType, notes, stateId)  {
			var parent = this;

			$.ajax({
				url: "/mgmt/approveCardState",
				data: {cardId: parent.cardId, cardType: cardType, notes: notes, stateId: stateId} ,
				success: function(data)  {
					$.ajax({
						url: "/mgmt/getMyApprovals",
						success: function(data)  {
							if (data.status === 200)  {
								parent.navBack();
							}
							else  {
								MessageBox.error("An error occured retrieving approvals.\n\n" + data.data.message);
							}
						},
						error: function(xhr, ajaxOptions, thrownErr)  {
							console.log(thrownErr);
						},
						complete:  function(e)  {
						}
					});
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});		
		},

		rejectCard: function(reason, stateId)  {
			var parent = this;
			$.ajax({
				url: "/mgmt/rejectCardState",
				data: {cardId: parent.cardId, comments: reason, stateId: stateId},
				success: function(data)  {
					$.ajax({
						url: "/mgmt/getMyApprovals",
						success: function(data)  {
							if (data.status === 200)  {
								parent.navBack();
							}
							else  {
								MessageBox.error("An error occured retrieving approvals.\n\n" + data.data.message);
							}				
						},
						error: function(xhr, ajaxOptions, thrownErr)  {
							console.log(thrownErr);
						}
					});
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});	
		},
		
		setSecurityBanner: function(classification)  {
			$("#banner-top").text(classification);
			$("#banner-bottom").text(classification);
		},
		
		convertMuliValues: function(val)  {
			if (val)  {
				return val.split(',');
			}
			else  {
				return "";
			}
		},
		
		audit: function(id, type, action)  {
			$.ajax({
				url: sap.ui.getCore().getModel("API").getData().url + "/config/audit",
				data: {id: id, type: type, action: action},
				success: function(data)  {
					if (data.status !== 200)  {
						MessageBox.error("An error occured during audit.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});			
		},
		
		openAuditDialog: function(oEvent)  {
			var parent = this,
				id = oEvent.getSource().data().id,
				name = oEvent.getSource().data().name

			var exportMenu = new sap.ui.unified.Menu({
				items: [
					new sap.ui.unified.MenuItem({
						icon: "sap-icon://excel-attachment",
						text: "CSV"
					}),
					new sap.ui.unified.MenuItem({
						icon: "sap-icon://syntax",
						text: "JSON"
					})
				],
				itemSelect: function(e)  {
					parent.exportAudit(e.getParameter("item").getText());
				}
			});
		
			var dialog = new sap.m.Dialog({
				title: "Usage Log: " + name,
				icon: "sap-icon://manager-insight",
				contentWidth: "800px",
				contentHeight: "auto",	
				resizable: true,
				content: sap.ui.view({
					viewName : "marina.view.AuditLog",
					type : "XML",
					viewData : { cardId : id, name: name }
				}),
				beginButton: new sap.m.Button({
					text: "Export",
					press: function (e) {
						exportMenu.open(null, e.getSource(), sap.ui.core.Popup.Dock.LeftTop, sap.ui.core.Popup.Dock.BeginBottom, e.getSource());
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						dialog.close();
						dialog.destroy();
					}.bind(this)
				})
			});
			this.getView().addDependent(dialog);
			dialog.open();
		},
		
		loadImageryFilterModel: function(e)  {
			var model = this.getView().getModel();

			$.ajax({
				url: "/config/getPlatformTypes",
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/platformTypes", data.data);
					}
					else  {
						MessageBox.error("An error occured loading platform types.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: "/config/getSourceSensor",
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/sourceSensors", data.data);
					}
					else  {
						MessageBox.error("An error occured loading source sensors.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: "/config/getSensorBand",
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/sensorBands", data.data);
					}
					else  {
						MessageBox.error("An error occured loading sensor bands.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},

		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.jsfragment(sDialogFragmentName, this);
				this.getView().addDependent(oDialog);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				oDialog.addStyleClass("sapUiSizeCompact");
			}
			return oDialog;
		},
		
		downloadFiles: function(dataSetId, files)  {
			var parent = this;
			var params = {
				'datasetId': dataSetId
			};

			if (files && files.length > 0)  {
				params.fileIds = files.join();
			}

			$.ajax({
				url: "/data/initDownload",
				data: params,
				success: function(data)  {
					if (data.status === 200)  {
						parent.audit(dataSetId, constants.AUDIT_TYPE_DATA_SET, constants.AUDIT_ACTION_DOWNLOAD);
						
						MessageToast.show("Data Export Request Submitted Successfully.", {
							width: "auto",
						    duration: 4000,
						    my: "center center", 
						    at: "center center"
						});
								
						// constantly check the download status until the download is either available or has errored
						parent.checkDownloadStatus();
					}
					else  {
						MessageBox.error("An error occured with the DI endpoint.\n\n" + data.data);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		checkDownloadStatus: function()  {
			var parent = this;
			// get current value
			var indicator = sap.ui.getCore().byId("downloadsIndicator");
			var currCount = indicator.getValue();

			// now continuously (every 30 seconds) check for a new entry in user_downloads.  
			// when entry appears, cancel the check & update the notification count
			var downloadCheck = setInterval(function()  {
				$.ajax({
				url: parent.base_url + "/data/getDownloadsCount",
				success: function(data)  {
					if (data.status ===200)  {
						if (data.data > currCount)  {
							parent.updateIndicatorCount("downloadsIndicator", data.data);
							clearInterval(downloadCheck);
						}
					}
					else  {
						MessageBox.error("An error occured retrieving download notification count.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			}, 3000);
		},
		
		getDataSetSubscriptionCount: function()  {
			var parent = this;
			$.ajax({
				url: parent.base_url + "/data/getUserSubscriptions",
				success: function(data)  {
					if (data.status ===200)  {
						parent.updateIndicatorCount("datasetIndicator", data.data.length);
					}
					else  {
						MessageBox.error("An error occured retrieving data set subscribptions count.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		getDownloadsCount: function()  {
			var parent = this;
			$.ajax({
				url: parent.base_url + "/data/getDownloadsCount",
				success: function(data)  {
					if (data.status ===200)  {
						parent.updateIndicatorCount("downloadsIndicator", data.data);
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
		
		getRejectedCount: function()  {
			var parent = this;
			$.ajax({
				url: parent.base_url + "/data/getRejectedCount",
				success: function(data)  {
					if (data.status ===200)  {
						parent.updateIndicatorCount("rejectionIndicator", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving rejected card count.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		getApprovalsCount: function()  {
			var parent = this;
			var userModel = this.getOwnerComponent().getModel("USER_MODEL");
			$.ajax({
				url: parent.base_url + "/data/getApprovalsCount",
				data: {approverType: userModel.getProperty("/approverType")},
				success: function(data)  {
					if (data.status ===200)  {
						parent.updateIndicatorCount("approvalsIndicator", data.data);
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

		updateIndicatorCount: function(id, count)  {
			var indicator = this.byId(id).getCustomData()[0];
			if (parseInt(count) > 0)  {
				indicator.setValue(count);
			}
			else  {
				indicator.setValue(0);
			}
		},

		formatCsvPreview: function(data, colheaders)  {
			var lines = data.split("\n");
			var result = [];
			for (var i = 1; i < lines.length; i++) {
				var obj = {};
				var currentline = lines[i].split(",");
				for (var j = 0; j < colheaders.length; j++) {
					obj[colheaders[j].COLUMN] = currentline[j];
				}
				result.push(obj);
			}
			return {header: colheaders, data: result};
		},
		
		computePercentage: function(vals, total)  {
			vals.forEach(function(obj)  {
				var perc = Math.round((parseInt(obj.COUNT)/parseInt(total))*100);
				obj.PERCENTAGE = perc.toString() + "%";
			});
			return vals;
		},
		
		getCurrentRoute: function()  {
			return this.routeName;
		},
		
		/*getImagerySearchParams: function(model)  {
			var labels=[], date=[];

			// check if a label is selected
			var labelItems = sap.ui.getCore().byId("labelList").getSelectedItems();
			labelItems.forEach(function(item)  {
				labels.push(item.getTitle());
			});
			// check if date point is selected
			var chart = sap.ui.getCore().byId("imageryDateChart");
			var points = chart.getSelectedPoints();
			if (points && points.length > 0)  {
				date = points[0].data("date");
			}		
			
			return {
				labels: labels.join(), 
				dateType: (this.dateChartVal) ? this.dateChartVal : "Month", 
				dateVal: date, 
				coords: (this.coords) ? JSON.stringify(this.coords) : null, 
				advanced: this.getAdvancedValues(model)
			};
		},
		
		getAdvancedValues: function()  {
			// check if range slider values are default.  if yes, don't include in search
			var sensorAz = sap.ui.getCore().byId("sensorAzimuth");
			var sensorAzMin = sensorAz.getMin();
			var sensorAzMax = sensorAz.getMax();
			var sensorAzRange = sensorAz.getRange();

			var horzFov = sap.ui.getCore().byId("horzFov");
			var horzFovMin = horzFov.getMin();
			var horzFovMax = horzFov.getMax();
			var horzFovRange = horzFov.getRange();

			var vertFov = sap.ui.getCore().byId("vertFov");
			var vertFovMin = vertFov.getMin();
			var vertFovMax = vertFov.getMax();
			var vertFovRange = vertFov.getRange();

			return {
				platformTypes: sap.ui.getCore().byId("platformType").getSelectedKeys(),
				sourceSensors: sap.ui.getCore().byId("sourceSensor").getSelectedKeys(),
				sensorBands: sap.ui.getCore().byId("sensorBand").getSelectedKeys(),
				bitRate: sap.ui.getCore().byId("bitRate").getValue(),
				bitRateOp: sap.ui.getCore().byId("bitRateOp").getSelectedKey(),
				pixelHeight: sap.ui.getCore().byId("pixelHeight").getValue(),
				pixelHeightOp: sap.ui.getCore().byId("pixelHeightOp").getSelectedKey(),
				pixelWidth: sap.ui.getCore().byId("pixelWidth").getValue(),
				pixelWidthOp: sap.ui.getCore().byId("pixelWidthOp").getSelectedKey(),
				sensorAzimuth: (sensorAzRange[0] === sensorAzMin && sensorAzRange[1] === sensorAzMax) ? null : sensorAzRange,
				horzFov: (horzFovRange[0] === horzFovMin && horzFovRange[1] === horzFovMax) ? null : horzFovRange,
				vertFov: (vertFovRange[0] === vertFovMin && vertFovRange[1] === vertFovMax) ? null : vertFovRange,
				annPixelHeight: (this.searchAnnotations) ? sap.ui.getCore().byId("annPixelHeight").getRange() : null,
				annPixelWidth: (this.searchAnnotations) ? sap.ui.getCore().byId("annPixelWidth").getRange() : null
			};
		},*/
		
		sortByProperty: function(property){  
			return function(a,b) {  
    			if (a[property] > b[property])  {
        			return 1; 
    			}
    			else if (a[property] < b[property]) {
        			return -1;
    			}
    			return 0;
			}  
		},
		
		saveCollaboratePost: function(objectId, objectType, message, type, collabId, refId, replyTo)  {
			var parent = this;
			$.ajax({
				url: "/data/saveCollaboratePost",
				data: {objectId: objectId, objectType: objectType, message: message, type: type, collabId: collabId, refId: refId, replyTo: replyTo},
				type: "POST",
				success: function(data)  {
					if (data.status ===200)  {
						parent.getCollaboratePosts(objectId);
					}
					else  {
						MessageBox.error("An error occured saving collaborate post.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		editCollaboratePost: function(collabId, modelCardId, type, refId, replyTo)  {
			var parent = this;
			$.ajax({
				url: "/data/getCollaboratePost",
				data: {collabId: collabId},
				success: function(data)  {
					if (data.status ===200)  {
						var dialog = new sap.m.Dialog({
							title: "Edit Post",
							icon: "sap-icon://collaborate",
							contentWidth: "600px",
							contentHeight: "auto",	
							content: new sap.m.FeedInput({
								icon: "sap-icon://collaborate",
								value: data.data.MESSAGE,
								post: function(e)  {
									var msg = e.getParameters().value;
									parent.saveCollaboratePost(modelCardId, constants.COLLABORATE_TYPE_MODEL_CARD, msg, type, collabId, refId, replyTo);
									dialog.close();
									dialog.destroy();
								}
							}).addStyleClass("sapUiSmallMarginBottom"),
							endButton: new sap.m.Button({
								icon: "sap-icon://decline",
								text: "Cancel",
								press: function () {
									dialog.close();
									dialog.destroy();
								}.bind(parent)
							})
						}).addStyleClass("sapUiSizeCompact");
						parent.getView().addDependent(dialog);
						dialog.open();
					}
					else  {
						MessageBox.error("An error occured saving collaborate post.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		replyCollaboratePost: function(refId, modelCardId, replyTo)  {
			var parent = this;
			var dialog = new sap.m.Dialog({
				title: "Reply to Post",
				icon: "sap-icon://response",
				contentWidth: "600px",
				contentHeight: "auto",	
				content: new sap.m.FeedInput({
					icon: "sap-icon://collaborate",
					post: function(e)  {
						var msg = e.getParameters().value;
						parent.saveCollaboratePost(modelCardId, constants.COLLABORATE_TYPE_MODEL_CARD, msg, constants.COLLABORATE_TYPE_REPLY, null, refId, replyTo);
						dialog.close();
						dialog.destroy();
					}
				}).addStyleClass("sapUiSmallMarginBottom"),
				endButton: new sap.m.Button({
					icon: "sap-icon://decline",
					text: "Cancel",
					press: function () {
						dialog.close();
						dialog.destroy();
					}.bind(this)
				})
			}).addStyleClass("sapUiSizeCompact");
			this.getView().addDependent(dialog);
			dialog.open();
		},

		deleteCollaboratePost: function(collabId, objectId)  {
			var parent = this;
			MessageBox.confirm("Delete post?", {
				onClose: function(val)  {
					if (val === 'OK')  {
						$.ajax({
							url: "/data/deleteCollaboratePost",
							data: {id: collabId},
							success: function(data)  {
								if (data.status ===200)  {
									parent.getCollaboratePosts(objectId);
								}
								else  {
									MessageBox.error("An error occured deleting collaborate post.\n\n" + data.data.message);
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
		
		getCollaboratePosts: function(objectId)  {
			var model = this.getView().getModel();
			$.ajax({
				url: "/data/getCollaboratePosts",
				data: {objectId: objectId},
				success: function(data)  {
					if (data.status ===200)  {
						model.setProperty("/collaboratePosts", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving collaborate posts.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		processIconColor: function(tabs)  {
			var processed = [];
			tabs.forEach(function(tab)  {
				tab.ICON_COLOR = (tab.ANNOTATION_PACKAGE_EXISTS_FLAG) ? sap.ui.core.IconColor.Default : sap.ui.core.IconColor.Neutral;
				processed.push(tab);
			});
			return processed;
		}

		
	});
});