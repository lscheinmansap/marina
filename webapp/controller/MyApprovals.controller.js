sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
    "marina/model/formatter"
], function (BaseController, JSONModel, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.MyApprovals", {
                
        formatter: formatter,

		onInit: function () {
			var model = new JSONModel();
			this.getView().setModel(model);
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("myApprovals").attachMatched(this.onRouteMatched, this);

            this.base_url = sap.ui.getCore().getModel("API").getData().url;
		},
		
		onAfterRendering: function()  {
			this.byId("myApprovalsScroll").setHeight(window.innerHeight-340 + "px");
			this.byId("priorApprovalsScroll").setHeight(window.innerHeight-340 + "px");
			this.byId("priorRejectionsScroll").setHeight(window.innerHeight-340 + "px");
		},

		onRouteMatched: function(e)  {
			this.getMyApprovals();
		},
		
		getMyApprovals: function()  {
			var model = this.getView().getModel();
			$.ajax({
				url: this.base_url + "/mgmt/getMyApprovals",
				data: {approverType: this.getOwnerComponent().getModel("USER_MODEL").getProperty("/approverType")},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/myApprovals", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving My Approvals.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				},
				complete: function() {
				}
			});	
			
			$.ajax({
				url: this.base_url + "/mgmt/getPriorApprovals",
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/priorApprovals", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving prior approvals.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				},
				complete: function() {
				}
			});
			
			$.ajax({
				url: this.base_url + "/mgmt/getPriorRejections",
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/priorRejections", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving prior rejections.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				},
				complete: function() {
				}
			});
		},

        pressEditApproval: function(e) {
            var cardId = e.getParameters().listItem.data("id");
            var wfName = e.getParameters().listItem.data("wfName");

            if (wfName === 'Data Card') {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("dataCardEdit", {"cardId": cardId});
            }
            else if (wfName === 'Model Card')  {
                this.editModelCard(cardId);
            }
        },

        pressRejection: function(e)  {
            var cardId = e.getParameters().listItem.data("id");
            var wfName = e.getParameters().listItem.data("wfName");
            var title = e.getParameters().listItem.getTitle();
            
            if (wfName === 'Data Card') {
                this.navToDatacard(cardId, title, true);
            }
            else if (wfName === 'Model Card')  {
                this.navToModel(cardId, title, true);
            }
        }

	});
});