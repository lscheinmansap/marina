sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/layout/cssgrid/GridBoxLayout",
	"sap/ui/core/BusyIndicator",
    "marina/model/formatter"
], function (BaseController, JSONModel, MessageBox, GridBoxLayout, BusyIndicator, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.Overview", {
        
        formatter: formatter,

		onInit: function () {
			var model = new sap.ui.model.json.JSONModel();
			this.getView().setModel(model);
            this.base_url = sap.ui.getCore().getModel("API").getData().url; 
			this._mViewSettingsDialogs = {};
		},
		
		onAfterRendering: function(e)  {
            var oModel = this.getView().getModel();
            this.getChartData(this.base_url + "/dashboard/getModelViewsByMonth", "/modelViewsByMonth", oModel)
            this.getChartData(this.base_url + "/dashboard/getLoadFreq", "/loadFreq", oModel)
            this.getChartData(this.base_url + "/dashboard/getLoadStatus", "/loadStatus", oModel)
            this.getChartData(this.base_url + "/dashboard/getAccessType", "/accessType", oModel)
            this.getChartData(this.base_url + "/dashboard/getDataSetDownloadsByMonth", "/datasetDownloadsByMonth", oModel)
            this.getChartData(this.base_url + "/dashboard/getImageryDownloadsByMonth", "/imageryDownloadsByMonth", oModel)
            this.getChartData(this.base_url + "/dashboard/getModelViewsByMonth", "/modelViewsByMonth", oModel)
            this.createStackedChart()
            
		},

        getChartData: function (sURL, sModelPath, oModel) {
			$.ajax({
				url: sURL,
				success: function(data)  {
					if (data.status === 200)  {
						oModel.setProperty(sModelPath, data.data);
					}
					else  {
						MessageBox.error(data.data.message);
					}				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
            });
        },
		
		getChartLabels: function(results)  {
			var labels = [];
			results.prime.forEach(function(obj){
				labels.push(obj.PRIME_CATEGORY);
			});
			results.subprime.forEach(function(obj){
				labels.push(obj.SUB_CATEGORY);
			});
			return labels;
		},

		navToReport: function(name)  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo(name);
		},

        handleChartContainerSelectionChange: function(e)  {
            var contentType = e.getSource().getSelectedKey();
            if (contentType === 'imagery')  {
                this.createImageryPieChart()
            }
            else  {
                this.createStackedChart();                
            }
        },

        createStackedChart: function() {
            var parent = this;
			var model = this.getView().getModel();
			$.ajax({
				url: parent.base_url + "/dashboard/getCategoriesChart",
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/categories", data.data)
					}
					else  {
						MessageBox.error("An error occured loading categories chart.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
            var stackedBar = new sap.viz.ui5.controls.VizFrame("datasetsContent", {
                width: "auto",
                height: "37vh",
                vizType: "stacked_column",
                vizProperties: {
                    title: { 
                        visible: true,
                        text: "Data Set Categories & Sub Categories" 
                    },
                    legend: {
                        visible: true,
                        title: {
                            text: "Sub Categories"
                        }
                    },
                    plotArea: {
                        dataLabel: {
                            visible: false,
                            showTotal: true
                        }
                    }
                },
                dataset: new sap.viz.ui5.data.FlattenedDataset({
                    data: "{/categories}",
                    dimensions: [
                        new sap.viz.ui5.data.DimensionDefinition({
                            name: "Primary Category",
                            value: "{PRIME_CATEGORY}"
                        }),
                        new sap.viz.ui5.data.DimensionDefinition({
                            name: "Sub Category",
                            value: "{SUB_CATEGORY}"
                        })
                    ],
                    measures: [
                        new sap.viz.ui5.data.MeasureDefinition({
                            name: "Number of Data Sets",
                            value: "{SUB_COUNT}"
                        })
                    ]
                }),
                feeds: [
                    new sap.viz.ui5.controls.common.feeds.FeedItem({
                        uid: "valueAxis",
                        type: "Measure",
                        values: ["Number of Data Sets"]
                    }),
                    new sap.viz.ui5.controls.common.feeds.FeedItem({
                        uid: "categoryAxis",
                        type: "Dimension",
                        values: ["Primary Category"]
                    }),
                    new sap.viz.ui5.controls.common.feeds.FeedItem({
                        uid: "color",
                        type: "Dimension",
                        values: ["Sub Category"]
                    })
                ]
            }).addStyleClass("sapUiSizeCompact sapUiSmallMarginTop");

            this.updateOverViewChart(stackedBar, "Data Sets By Category")

        },

        createImageryPieChart: function() {
            var model = this.getView().getModel();
			$.ajax({
				url: this.base_url + "/dashboard/getTeDesignationsChart",
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/teDesignations", data.data)
					}
					else  {
						MessageBox.error("An error occured loading categories chart.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
            var imageryPie = new sap.viz.ui5.controls.VizFrame("imageryContent", {
                width: "auto",
                height: "40vh",
                vizType: "pie",
                vizProperties: {
                    title: { 
                        visible: true,
                        text: "Imagery by classification" 
                    },
                    legend: {
                        visible: true,
                        title: {
                            text: "TE Designation"
                        }
                    },
                    plotArea: {
                        dataLabel: {
                            visible: true,
                            showTotal: true
                        },
                        valueLabel: {
                            visible: true,
                            showTotal: true
                        }
                    }
                },
                dataset: new sap.viz.ui5.data.FlattenedDataset({
                    data: "{/teDesignations}",
                    dimensions: [
                        new sap.viz.ui5.data.DimensionDefinition({
                            name: "TE Designation",
                            value: "{TE_DESIGNATION}"
                        })
                    ],
                    measures: [
                        new sap.viz.ui5.data.MeasureDefinition({
                            name: "Number of Imagery Packages",
                            value: "{COUNT}"
                        })
                    ]
                }),
                feeds: [
                    new sap.viz.ui5.controls.common.feeds.FeedItem({
                        uid: "size",
                        type: "Measure",
                        values: ["Number of Imagery Packages"]
                    }),
                    new sap.viz.ui5.controls.common.feeds.FeedItem({
                        uid: "color",
                        type: "Dimension",
                        values: ["TE Designation"]
                    })
                ]
            }).addStyleClass("sapUiSizeCompact sapUiSmallMarginTop");
            
            this.updateOverViewChart(imageryPie, "Imagery Packages by TE Designation")

        },

        updateOverViewChart: function(oContent, sTitle) {
            var chart = this.byId("dataSetsChartContainer")
            chart.destroyContent()
            chart.setTitle(sTitle)
            chart.setContent(oContent)
            chart.getParent().updateChartContainer()
        }
	});
});