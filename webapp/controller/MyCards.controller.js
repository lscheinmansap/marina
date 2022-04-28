sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
    "marina/model/formatter"
], function (BaseController, JSONModel, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.MyCards", {
                    
        formatter: formatter,

		onInit: function () {
			var model = new JSONModel();
			this.getView().setModel(model);
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("myCards").attachMatched(this.onRouteMatched, this);

            this.base_url = sap.ui.getCore().getModel("API").getData().url;
		},
		
		onAfterRendering: function()  {
			var opl = this.byId("myCardsScroll");
			opl.setHeight(window.innerHeight-340 + "px");
			
			// select the first tab item so list will be filtered
			var iconTabBar =this.byId("myCardsIconTabBar");
			iconTabBar.setSelectedKey("NOT_SUBMITTED");
			iconTabBar.fireSelect({key: "NOT_SUBMITTED"});
		},

		onRouteMatched: function(e)  {
			this.getMyCards();
		},
		
		getMyCards: function()  {
			var model = this.getView().getModel();
			$.ajax({
				url: this.base_url + "/mgmt/getMyCards",
				success: function(data)  {
					if (data.status === 200)  {
						var inProgress=0, notSubmitted=0, rejected=0, approved=0;
						for (var i=0; i<data.data.length; i++)  {
							var card = data.data[i];
							if (card.ACTION_TAKEN === 'APPROVED')  {
								approved++;
							}
							else if (card.ACTION_TAKEN === 'REJECTED')  {
								rejected++;
							}
							else if (card.ACTION_TAKEN === 'Not Submitted') {
								notSubmitted++;
							}
							else {
								inProgress++;
							}
						}
						model.setProperty("/inProgressCnt", inProgress);
						model.setProperty("/notSubmittedCnt", notSubmitted);
						model.setProperty("/rejectedCnt", rejected);
						model.setProperty("/approvedCnt", approved);
						model.setProperty("/myCards", data.data);
					}
					else  {
						MessageBox.error("An error occured retrieving My Cards.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				},
				complete: function() {
				}
			});	
		},
		
		filterMyCards: function(event)  {
			var list = this.byId("myCardsList");
			var binding = list.getBinding("items");
			var key = event.getParameter("key");
			var filters = [];

			if (key !== 'SUBMITTED')  {
				filters.push(new sap.ui.model.Filter("ACTION_TAKEN", "EQ", key));
			}
			
			else  {
				filters.push(new sap.ui.model.Filter("ACTION_TAKEN", "EQ", null));
			}
			binding.filter(filters);
		},

        pressEditCard: function(e) {
            var cardId = e.getParameters().listItem.data("id");
            var wfName = e.getParameters().listItem.data("wfName");

            if (wfName === 'Data Card') {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("dataCardEdit", {"cardId": cardId});
            }
            else if (wfName === 'Model Card')  {
                this.editModelCard(cardId);
            }
        }

	});
});