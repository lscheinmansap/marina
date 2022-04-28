sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("marina.controller.Streams", {
		onInit: function () {
			var model = new JSONModel();
			this.getView().setModel(model);
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("streams").attachMatched(this.onRouteMatched, this);
			this.base_url = sap.ui.getCore().getModel("API").getData().url;
			this.getStreams();

		},
		// TODO add stream, test search
		getStreams: function() {
			var streamsList = this.byId("streamsList");
			$.ajax({
				url: this.base_url + "/imagery/getStreams",
				success: function(data)  {
					if (data.status ===200)  {
						streamsList.setModel(new JSONModel(data))
					}
					else  {
						MessageBox.error("An error occured retrieving streams.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});

		},
		
		openStream: function(e)  {
			var id = e.getParameters().listItem.data("id"),
				url = e.getParameters().listItem.data("url")

			if (id)  {
				var html = new sap.ui.core.HTML({
					content: '<iframe width="1280" height="720" src="' + url + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
				});
											
				var dialog = new sap.m.Dialog({
					title: "Live Stream",
					icon: "sap-icon://video",
					contentWidth: "auto",
					contentHeight: "auto",				
					content: html,
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
			}
		}
		
	});
});