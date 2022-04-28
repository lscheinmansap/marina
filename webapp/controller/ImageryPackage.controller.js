sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"marina/model/formatter"
], function (BaseController, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.ImageryPackage", {
		
		formatter : formatter, 

		onInit: function () {
			//var model = new sap.ui.model.json.JSONModel();
			var model = this.getOwnerComponent().getModel("IMAGERY_MODEL");
			this.getView().setModel(model);
            this.base_url = sap.ui.getCore().getModel("API").getData().url;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("imageryDetails").attachMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(e)  {
			sap.ui.core.BusyIndicator.hide();

			var args = e.getParameter("arguments");
			this.id = args.id;
			this.offset = 0;
			
			var layout = args.layout;

			var model = this.getView().getModel();
			model.setProperty("/layout", layout);
			
			// select first section each time the page is loaded
			var opl = sap.ui.getCore().byId(sap.ui.getCore().getModel("imageryComponents").getData().imageryOpl);
			opl.setSelectedSection("clipsSection");

			this.audit(this.id, constants.AUDIT_TYPE_IMAGERY_PACKAGE, constants.AUDIT_ACTION_VIEW);

			this.getImageryPackage();
			this.getClips(model, this.id, this.offset);
		},
		
		getImageryPackage:  function() {
			var imageryModel = this.getView().getModel();

			$.ajax({
				url: this.base_url + "/imagery/getImageryCard",
				data: {id: this.id},
				success: function(data)  {
					if (data.status === 200)  {
						imageryModel.setProperty("/imageryPackage", data.data);
					}
					else  {
						MessageBox.error("An error occured loading imagery package details.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},		
		
		getClips: function(imageryModel, id, offset)  {
			$.ajax({
				url: this.base_url + "/imagery/getFmvClips",
				type: "POST",
				data: { id: id, 
						limit: constants.RESULTS_LIMIT, 
						offset: offset },
				success: function(data)  {
					if (data.status === 200)  {
						// set clips
						imageryModel.setProperty("/results", data.data);
					}
					else  {
						MessageBox.error("An error occured loading clips.");
					}
				},
				complete: function()  {
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
		}
		
	});
});