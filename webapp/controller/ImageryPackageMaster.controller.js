sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
    "marina/model/formatter",
	"sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, formatter, JSONModel) {
	"use strict";

	return BaseController.extend("marina.controller.ImageryPackageMaster", {
		
        formatter: formatter,
        
        onInit: function () {
			var model = this.getOwnerComponent().getModel("IMAGERY_MODEL");
			this.getView().setModel(model);
            this.base_url = sap.ui.getCore().getModel("API").getData().url;
			sap.ui.getCore().setModel(new JSONModel({
				imageryOpl: this.byId("imageryOpl").sId
			}),"imageryComponents")
		},
		
		onAfterRendering: function(e)  {
			var opl = this.byId("imageryOpl");
			opl.setHeight(window.innerHeight-215 + "px");
		},
		
		showClip: function(e)  {
            sap.ui.core.BusyIndicator.show();
            var item = e.getParameters().listItem;
            var id = item.data("id");
			var parent = this;
			var clipModel = this.getOwnerComponent().getModel("CLIP_MODEL");

			this.audit(id, constants.AUDIT_TYPE_IMAGERY_PACKAGE_CLIP, constants.AUDIT_ACTION_VIEW);
			
			$.ajax({
				url: this.base_url + "/imagery/getAnalysisTypesByClipId",
				data: {id: id},
				success: function(data)  {
					if (data.status === 200)  {
						clipModel.setProperty("/analysisTypes", parent.processIconColor(data.data));
					}
					else  {
						MessageBox.error("An error occured loading imagery analysis types.\n\n" + data.data.message);
					}					
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/imagery/getClip",
				data: { id: id },
				success: function(data)  {
					if (data.status === 200)  {
						clipModel.setProperty("/clip", data.data);
					}
					else  {
						MessageBox.error("An error occured loading clip objects.");
					}
				},
				complete: function()  {
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			$.ajax({
				url: this.base_url + "/imagery/getClipLabels",
				data: { id: id },
				success: function(data)  {
					if (data.status === 200)  {
						clipModel.setProperty("/clipLabels", data.data);
					}
					else  {
						MessageBox.error("An error occured loading clip objects.");
					}
				},
				complete: function()  {
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			var fcl = this.getView().getParent().getParent();
			fcl.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded);
			
			// select the first tab item so list will be filtered
			setTimeout(function()  {
				var iconTabBar = sap.ui.getCore().byId("framesTabBar");
				if (iconTabBar)  {
					var tabs = iconTabBar.getItems();
					var selectedTab = tabs[0];
					iconTabBar.fireSelect({item: selectedTab }); // select the first tab
				}
			}, 1500);
				
		},
		
		openClipInfo: function(e)  {
			var id = e.getSource().data("id"),
                clipModel = this.getOwnerComponent().getModel("CLIP_MODEL"),
			    button = e.getSource(), parent = this;

			if (!this._pQuickView) {
				this._pQuickView = sap.ui.jsfragment("marina.view.fragment.ClipQuickView", this);
				this.getView().addDependent(this._pQuickView);
			}
			
			$.ajax({
				url: this.base_url + "/imagery/getClip",
				data: {id: id},
				success: function(data)  {
					if (data.status === 200)  {
						clipModel.setProperty("/clipInfo", data.data);
						parent._pQuickView.setModel(clipModel);
						parent._pQuickView.openBy(button);
					}
					else  {
						MessageBox.error("An error occured loading clip info.");
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		loadVideoMap: function(e)  {
            var sectionTitle = e.getParameters().section.getTitle();
			if (sectionTitle === 'Video')  {
                var imageryModel = this.getOwnerComponent().getModel("IMAGERY_MODEL");
                var imageryPackage = imageryModel.getProperty("/imageryPackage");
                var videoGeoArea = imageryPackage.metadata.IMAGERY_PACKAGE_GEO_AREA_GEOJSON;

                var videoMap = L.map(this.byId('videoMapBox').sId).setView([39.82, -98.58], 1);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(videoMap);
                    
                var videoLayer = L.geoJSON().addTo(videoMap);
                this.plotVideoGeoArea(videoGeoArea, videoMap, videoLayer);
            }
		},
		
		plotVideoGeoArea: function(geoArea, map, layer)  {
			layer.clearLayers();
			if (geoArea)  {
				var oGeoArea = JSON.parse(geoArea);
				var geojsonFeature = {
				    "type": "Feature",
				    "properties": {
				        "name": "Video",
				        "popupContent": "This is where the video was filmed."
				    },
				    "geometry": {
				        "type": oGeoArea.type,
				        "coordinates": oGeoArea.coordinates
				    }
				};	

				layer.addData(geojsonFeature);
				map.fitBounds(layer.getBounds(), {padding: [100,100]});
			}
		},
		
		getNext: function()  {
			var model = this.getView().getModel();
			var imageryPackageId = model.getProperty("/imageryPackage/metadata/IMAGERY_PACKAGE_UUID");
			var currOffset = model.getProperty("/results/offset");
			var offset = parseInt(currOffset) + constants.RESULTS_LIMIT;
			if (offset < model.getProperty("/results/total"))  {
				sap.ui.controller("marina.controller.ImageryPackage").getClips(this.getOwnerComponent().getModel("IMAGERY_MODEL"), imageryPackageId, offset);
			}
		},

		getPrevious: function()  {
			var model = this.getView().getModel();
			var imageryPackageId = model.getProperty("/imageryPackage/metadata/IMAGERY_PACKAGE_UUID");
			var currOffset = model.getProperty("/results/offset");
			var offset = currOffset - constants.RESULTS_LIMIT;
			if (offset >= 0)  {
				sap.ui.controller("marina.controller.ImageryPackage").getClips(this.getOwnerComponent().getModel("IMAGERY_MODEL"), imageryPackageId, offset);
			}
		},
		
		getFirst: function()  {
			var model = this.getView().getModel();
			var imageryPackageId = model.getProperty("/imageryPackage/metadata/IMAGERY_PACKAGE_UUID");
			sap.ui.controller("marina.controller.ImageryPackage").getClips(this.getOwnerComponent().getModel("IMAGERY_MODEL"), imageryPackageId, 0); // set offset to 0 since we need to show first page
		},

		getLast: function()  {
			var model = this.getView().getModel();
			var imageryPackageId = model.getProperty("/imageryPackage/metadata/IMAGERY_PACKAGE_UUID");
			var total = model.getProperty("/results/total");
			var totalPages = parseInt(total)/constants.RESULTS_LIMIT;
			if (totalPages % 1 !== 0)  {
				totalPages = Math.trunc(totalPages)+1;
			}
			var offset = (totalPages - 1) * constants.RESULTS_LIMIT;
			sap.ui.controller("marina.controller.ImageryPackage").getClips(this.getOwnerComponent().getModel("IMAGERY_MODEL"), imageryPackageId, offset); 
		}
		
	});
});