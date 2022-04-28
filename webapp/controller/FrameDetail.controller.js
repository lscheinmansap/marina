sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"marina/model/formatter"
], function (BaseController, MessageBox, JSONModel,formatter) {
	"use strict";

	return BaseController.extend("marina.controller.FrameDetail", {

		formatter : formatter, 
		
		onInit: function () {
			var model = new JSONModel();
			this.getView().setModel(model);
			this.base_url = sap.ui.getCore().getModel("API").getData().url; 

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("frame").attachMatched(this.onRouteMatched, this);
		},
		
		onAfterRendering: function(e)  {
			var opl = sap.ui.getCore().byId("frameOpl");
			opl.setHeight(window.innerHeight-160 + "px");
		},

		onRouteMatched: function(e)  {
			sap.ui.core.BusyIndicator.hide();

			var args = e.getParameter("arguments");
			this.id = args.id;
			this.source = args.source;
			this.type = args.type;

			this.audit(this.id, constants.AUDIT_TYPE_IMAGERY_PACKAGE_FRAME, constants.AUDIT_ACTION_VIEW);

			this.getFrame(this.id);
		},
		
		handleClose: function () {
			var imageryModel = this.getOwnerComponent().getModel("IMAGERY_MODEL");
			var imageryId = imageryModel.getProperty("/imageryPackage/metadata/IMAGERY_PACKAGE_UUID");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("imageryDetails", {id: imageryId, layout: sap.f.LayoutType.TwoColumnsMidExpanded});
		},
		
		getFrame: function(frameId)  {
			var model = this.getView().getModel();
			$.ajax({
				url: this.base_url + "/imagery/getFrame",
				data: { id: frameId, source: this.source, type: this.type },
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/frame", data.data);
					}
					else  {
						MessageBox.error("An error occured loading frame.");
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
		
		removeFrameAnnotations: function()  {
			// first, remove any previously added svg layer
			$("#frameSvg").remove();
			// next, deselect any selected items from frame list
			var frameAnnotationsList = sap.ui.getCore().byId("frameAnnotationsList");
			if (frameAnnotationsList)  {
				frameAnnotationsList.removeSelections(true);
			}
		},
		
		showFrameAnnotations: function(evt)  {
			var parent = this;
			var model = this.getView().getModel();
			var	button = evt.getSource();
			var frameId = evt.getSource().data("frameId");

			// remove any existing svg layer
			this.removeFrameAnnotations();
			
			model.setProperty("/selectedAnnoSource", this.source);
			model.setProperty("/selectedAnnoType", this.type);
			
			// retrieve the annotations for the given source/type
			$.ajax({
				url:  this.base_url + "/imagery/getFrameAnnotations",
				data: {frameId: frameId, annoSource: this.source, annoType: this.type},
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/frameAnnotations", data.data);
					}
					else  {
						MessageBox.error("An error occured loading frame annotations.\n\n" + data.data.message);
					}					
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
			
			// display the frame annotations popover below the button
			if (!this.frameAnnotations)  {
				var popover = sap.ui.jsfragment("marina.view.fragment.FrameAnnotations", this); 
				this.frameAnnotations = popover;
				this.getView().addDependent(this.frameAnnotations);
				this.frameAnnotations.openBy(button);
			}
			else  {
				this.frameAnnotations.openBy(button);
			}
		},
		
		getAnnotationsBySource: function(source, frameId)  {
			var model = this.getView().getModel();
			// retrieve the frame annotations and set to the model
			$.ajax({
				url:  this.base_url + "/imagery/getFrameAnnotations",
				data: {frameId: frameId, annoSource: source},
				async: true,
				success: function(data)  {
					if (data.status === 200)  {
						model.setProperty("/frameAnnotations", data.data);
					}
					else  {
						MessageBox.error("An error occured loading frame annotations.\n\n" + data.data.message);
					}					
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				}
			});
		},
		
		drawSvg: function(selectedItems)  {
			var model = this.getView().getModel();
			var imageEditorContainer = sap.ui.getCore().byId("imageEditorContainer");
			var imageEditor = imageEditorContainer.getImageEditor();
			var imageHeight = imageEditor.getHeight();
			var imageWidth = imageEditor.getWidth();
			
			// first, remove any existing layer. 
			$("#frameSvg").remove();
			
			// next, generate the svg layer for the frame
			var svg = '<svg id="frameSvg" style="position: absolute; display: inline-block; top: 0; left: 0;" preserveAspectRatio="xMidYMid slice" viewBox="0 0 ' + imageWidth + ' ' + imageHeight + '">';
			selectedItems.forEach(function(item)  {
				var ctx = item.getBindingContext();
				var path = ctx.getPath();
				var annotation = model.getProperty(path);

				var points = "";
				var geoJson = JSON.parse(annotation.ANNOTATION_AS_GEOJSON);
				var coords = geoJson.coordinates;
				coords.forEach(function(coord)  {
					points += coord.join() + " ";
				});
				
				svg += '<polygon id="' + annotation.ANNOTATION_UUID + '" onclick="openAnnotationPopover(\'' + annotation.OBJECT_NAME + 
						'\', evt);" points=' + points + ' style="stroke: yellow; stroke-width: 2; fill: transparent;"/>';
			});
			
			svg += '</svg>';
			// add svg to the container
			$("#__editor0-canvasInnerContainer").append(svg);
		}
		
	});
});