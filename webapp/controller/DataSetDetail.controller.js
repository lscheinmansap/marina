sap.ui.define([
	"./BaseController",
	"sap/ui/table/Column",
	"marina/model/formatter"
], function (BaseController, Column, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.DataSetDetail", {
		
		formatter: formatter,
		
		onInit: function () {
			var model = this.getOwnerComponent().getModel("FILE_MODEL");
			this.getView().setModel(model);
		},
		
		handleClose: function()  {
			var fcl = this.getView().getParent().getParent();
			fcl.setLayout(sap.f.LayoutType.OneColumn);

			var fb = sap.ui.getCore().byId(sap.ui.getCore().getModel("dataSetMasterComponents").getData().masterMetaFB);
			fb.removeStyleClass("hide");
		},

		columnFactory: function(sId, oContext) {
			var colName = oContext.getObject().COLUMN;
			return new Column({
				label: colName,
				template: colName,
				filterProperty: colName,
				sortProperty: colName,
				autoResizable: true,
				minWidth: 100
			})
		}
		
	});
});