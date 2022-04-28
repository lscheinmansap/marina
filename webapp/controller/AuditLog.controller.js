sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"marina/model/formatter"
], function (BaseController, JSONModel, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.AuditLog", {
		formatter: formatter,
		
		onInit: function()  {
			var model = new JSONModel();
			this.getView().setModel(model);

			var cardId = this.getView().getViewData().cardId;
            
            this.base_url = sap.ui.getCore().getModel("API").getData().url; 
			
			$.ajax({
				url: this.base_url + "/data/getAudit",
				data: {id: cardId},
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/audit", data.data);
					}
					else  {
						MessageBox.error("An error occured loading audit data.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		}

	});
});