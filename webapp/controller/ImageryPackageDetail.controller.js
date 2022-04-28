sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
    "marina/model/formatter"
], function (BaseController, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("marina.controller.ImageryPackageDetail", {
		
        formatter : formatter, 

        onInit: function () {
			var model = this.getOwnerComponent().getModel("CLIP_MODEL");
			this.getView().setModel(model);
            this.base_url = sap.ui.getCore().getModel("API").getData().url;
		},
		
		handleClose: function()  {
			var fcl = this.getView().getParent().getParent();
			fcl.setLayout(sap.f.LayoutType.OneColumn);
		},
		
		navToFrame: function(id, source, type)  {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("frame", {"id": id, "source": source, "type": type});
		},
		
		playClip: function(e)  {
			var id = e.getSource().data("id"),
				name = e.getSource().data("name"),
				path = e.getSource().data("path"),
				model = this.getView().getModel(),
				parent = this;
			
			// the unannotated video comes from the s3 bucket.  the annotated video comes from the server.
			// set the path to the model so it is easy to swap back and forth.
			var videoPath = this.base_url + "/imagery/getImageryFromBucket?file=" + path;
			model.setProperty("/videoPath", videoPath)

			// set the clip id to the controller.  this will prevent us from retreiving the clip annotations
			// each time the annotate button is clicked.  only retreieve when the clip id has changed.
			if (this.currClipId !== id)  {
				$.ajax({
					url: this.base_url + "/imagery/getClipAnnotations",
					data: {id: id},
					async: true,
					success: function(data)  {
						if (data.status === 200)  {
							model.setProperty("/clipAnnotations", data.data);
						}
						else  {
							MessageBox.error("An error occured loading frame annotations.\n\n" + data.data.message);
						}					
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					}
				});
			}
			
			var videoBox =new sap.m.FlexBox("videoBox", {
				width: "100%",
				items: [
					new sap.ui.core.HTML({content: "<video width='100%' height='800px' controls controlsList='nodownload'><source src='{/videoPath}' type='video/mp4' style='transform: translate(-50%, -50%); object-fit: cover;'></video>"})
				]
			}).addStyleClass("clipDialog");
			
			var dialog = new sap.m.Dialog({
				title: name,
				icon: "sap-icon://video",
				contentWidth: "auto",
				contentHeight: "auto",	
				resizable: false,
				subHeader: new sap.m.Toolbar({
					content: [
						new sap.m.ToolbarSpacer(),
						new sap.m.Button({
							type: sap.m.ButtonType.Transparent,
							icon: "sap-icon://tags",
							text: "Annotate",
							press: function(e)  {
								parent.showClipAnnotations(e);
							}
						})
					]
				}),
				content: videoBox,
				endButton: new sap.m.Button({
					icon: "sap-icon://decline",
					text: "Close",
					press: function () {
						dialog.close();
						dialog.destroy();
					}.bind(this)
				})
			}).addStyleClass("sapUiSizeCompact");
			this.getView().addDependent(dialog);
			dialog.open();
		},
		
		showClipAnnotations: function(evt)  {
			var	button = evt.getSource();

			// display the clip annotations popover below the button
			if (!this.clipAnnotations)  {
				var popover = sap.ui.xmlfragment("marina.view.fragment.ClipAnnotations", this); 
				this.clipAnnotations = popover;
				this.getView().addDependent(this.clipAnnotations);
				this.clipAnnotations.openBy(button);
			}
			else  {
				this.clipAnnotations.openBy(button);
			}
		},
		
		getObjectIds: function(items)  {
			var ids = [];
			items.forEach(function(item)  {
				ids.push(item.data("objectId"));
			});
			return ids;
		},
		
		formatClipAnnotations: function(result, fileName)  {
			var annotate = {};
			if (result)  {
				var labelConfig = this.getOwnerComponent().getModel("LABEL_CONFIG_MODEL").getProperty("/");
				var s3Config = this.getOwnerComponent().getModel("S3_MODEL").getProperty("/");

				annotate["video_clip_path"] = result.SEQUENCE_CLIP_FILE_PATH;
				annotate["thickness"] = parseInt("2");
				annotate["label_colors"] = [];
				annotate["annotations_filename"] = fileName;
				annotate["source_clip_s3_bucket"] = s3Config.imageryBucket;
				annotate["s3_region"] = s3Config.bucketRegion;
				
				labelConfig.labelConfig.forEach(function(obj)  {
					annotate.label_colors.push({label_name: obj.LABEL_NAME, BGR: [obj.LABEL_COLOR_B, obj.LABEL_COLOR_G, obj.LABEL_COLOR_R]});
				});
			}
			return annotate;
		},
		
		annotateClip:  function(objectIds)  {
			var parent = this;
			var model = this.getView().getModel();
			var clip = model.getProperty("/clip");

			if (objectIds && objectIds.length>0)  {
				// first write the data to a file.  the annotate python program will read from this
				// to determine which objects to annotate.
				var videoBox = sap.ui.getCore().byId("videoBox");
				videoBox.setBusy(true);
				var base_url =  this.base_url;
				$.ajax({
					url: base_url +  "/imagery/writeClipAnnotations",
					data: {clipId: clip.SEQUENCE_CLIP_UUID, objectIds: objectIds.join()},
					success: function(data)  {
						if (data.status === 200) {
							// call the python program, passing all parameters needed to annotate
							$.ajax({
								url: base_url + "/imagery/callAnnotateClip",
								data: {obj: JSON.stringify(parent.formatClipAnnotations(clip, data.data.fileName))},
								success: function(data)  {
									if (data.status === 200 && data.data.status !== -1) {
										var path = data.data.annotated_video_clip_path_h264;
										if (path)  {
											var relPath = path.substring(path.indexOf("/tmp"));
											var videoPath = "/imagery/fmv" + relPath;
											model.setProperty("/videoPath", videoPath);
										}
									}
									else  {
										MessageBox.error("An error occured annotating frame.\n\n" + data.data.status_message);
									}
								},
								error: function(xhr, ajaxOptions, thrownErr)  {
									console.log(thrownErr);
								},
								complete: function()  {
									videoBox.setBusy(false);
								}
							});
						}
						else  {
							MessageBox.error("An error occured writing clip annotation file.\n\n" + data.data.message);
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					},
					complete: function()  {
					}
				});
			}
			else  {
				var videoPath = "/imagery/getImageryFromBucket?file=" + clip.SEQUENCE_CLIP_FILE_PATH;
				model.setProperty("/videoPath", videoPath);
			}
		},

        downloadImageFiles: function() {
            var file = this.getModel().getProperty("/file");
            BaseController.downloadFiles(file.DATA_SET_ID, [file.DATA_FILE_ID]);

        },
	
		getFramesByAnalysisType: function(e)  {
            var tab = e.getParameters().item,
                source = tab.getCount(),
                type = tab.getText(),
			    model = this.getView().getModel(),
			    clipId = model.getProperty("/clip/SEQUENCE_CLIP_UUID");
			$.ajax({
				url: this.base_url + "/imagery/getClipFrames",
				data: {id: clipId, source: source, type: type},
				type: "POST",
				success: function(data)  {
					if (data.status === 200) {
						model.setProperty("/frames", data.data);
						model.setProperty("/selectedAnnoSource", source);
						model.setProperty("/selectedAnnoType", type);
					}
					else  {
						MessageBox.error("An error occured retrieving frames.\n\n" + data.data.message);
					}
				},
				error: function(xhr, ajaxOptions, thrownErr)  {
					console.log(thrownErr);
				},
				complete: function()  {
					
				}
			});
		},
		
		requestAnnotate:  function(e)  {
            var selectedTab = e.getSource().getParent().getSelectedKey(),
                source = selectedTab.split(",")[0],
                type = selectedTab.split(",")[1],
			    parent = this,
			    model = this.getView().getModel(),
			    imageryId = model.getProperty("/clip/IMAGERY_PACKAGE_UUID"),
			    clipId = model.getProperty("/clip/SEQUENCE_CLIP_UUID"),
                base_url = this.base_url
			
			if (source && type)  {
				$.ajax({
					url: base_url +  "/imagery/createAnnotationRequest",
					data: {imageryId: imageryId, clipId: clipId, source: source, type: type},
					success: function(data)  {
						if (data.status === 200) {
							var annoRequestCheck = setInterval(function()  {
								$.ajax({
									url: base_url +  "/imagery/getAnnotationRequestStatus",
									data: {id: data.data.NEW_ANNOTATION_PACKAGE_UUID},
									success: function(data)  {
										if (data.status ===200)  {
											if (data.data.length > 0)  {
												if (data.data[0].STATUS === 'INGESTED')  {
													// when complete, stop the status check interval and retrieve newly processed annotations
													clearInterval(annoRequestCheck);
													parent.getFramesByAnalysisType(source, type);
													$.ajax({
														url: base_url +  "/imagery/getAnalysisTypesByClipId",
														data: {id: clipId},
														success: function(data)  {
															if (data.status === 200)  {
																model.setProperty("/analysisTypes", parent.processIconColor(data.data));
															}
															else  {
																MessageBox.error("An error occured loading imagery analysis types.\n\n" + data.data.message);
															}					
														},
														error: function(xhr, ajaxOptions, thrownErr)  {
															console.log(thrownErr);
														}
													});
													sap.ui.getCore().byId("annotationMessage").setBusy(false);
												}
												else  {
													//framesTable.setNoDataText(data.data[0].STATUS_MESSAGE);
													sap.ui.getCore().byId("annotationMessage").setBusy(true);
												}
											}
										}
										else  {
											MessageBox.error("An error occured retrieving annotation request status.\n\n" + data.data.message);
										}
									},
									error: function(xhr, ajaxOptions, thrownErr)  {
										console.log(thrownErr);
										annotateButton.setBusy(false);
									}
								});
							}, 1500);
						}
						else  {
							MessageBox.error("An error occured requesting annotation.\n\n" + data.data.message);
						}
					},
					error: function(xhr, ajaxOptions, thrownErr)  {
						console.log(thrownErr);
					},
					complete: function()  {
						
					}
				});
			}
			else  {
				MessageBox.error("Invalid annotation source and type.");
			}
		},

        onClickRow: function (e) {
            var id = e.getSource().data("id");
            var selectedTab = annotationTabBar.getSelectedKey();
            var selectedArr = selectedTab.split(",");
            BaseController.navToFrame(id, selectedArr[0], selectedArr[1]);

        }
		
	});
	
});