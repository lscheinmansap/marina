sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/layout/cssgrid/GridBoxLayout",
	"sap/ui/core/BusyIndicator"
], function (BaseController, JSONModel, MessageBox, GridBoxLayout, BusyIndicator) {
	"use strict";

	return BaseController.extend("marina.controller.Compass", {
		onInit: function () {
			var model = new sap.ui.model.json.JSONModel();
			this.getView().setModel(model);
			
        },
		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("graphCell").setWidth(fValue);
			this.byId("explorerCell").setWidth((4-fValue));
		}
		
		
	});
});