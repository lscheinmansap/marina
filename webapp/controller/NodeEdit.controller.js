sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "marina/utils/fastAPI",
    "marina/utils/helpers",
    "sap/ui/model/Filter",
    "sap/ui/vbm/Spot",
    "sap/ui/vbm/Spots",
    "sap/m/MessageToast"
], function (Controller, JSONModel, fastAPI, helpers, Filter, Spot, Spots, MessageToast) {
	"use strict";
	return Controller.extend("marina.controller.NodeEdit", {
        onInit: function () {
            sap.ui.getCore().setModel(new JSONModel({
                dialogId: this.byId("editNodePanel").sId,
                nodeKey: null,
                nodeEdited: false,
                editNodeIconValue: null,
                editNodeTitleValue: null,
                editNodeTypeValue: null,
                editNodeDateTimeValue: null,
                editNodeCategoryValue: null,
                editNodeURLValue: null,
                editNodeLatitudeValue: null,
                editNodeLongitudeValue: null,
                editNodeCityValue: null,
                editNodeCountryValue: null,
                editNodeFirstNameValue: null,
                editNodeLastNameValue: null,
                editNodeAgeValue: null,
                editNodeDOBValue: null,
                editNodeGenderValue: null,
                editNodeEndDateValue: null
            }), "editNodeModel")

            var editNodeModel = new JSONModel();
            editNodeModel.loadData(sap.ui.require.toUrl("marina/model/workbenchVariables.json"));
            this.byId("editNodePanel").setModel(editNodeModel);
            this.iconSearch = this.byId("editSearchNodeIcons")

            var editLocationMapObject = this.getView().byId("editLocationMap")
            var url_reduced = "https://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/reduced.day/{LOD}/{X}/{Y}/256/png8?app_id=EDg91hW3LxiYy5m8rMtW&app_code=sPyvKymXGuEuEUM14nq3dw"
            var oMapConfig = {
                "MapProvider": [{
                "name": "HEREMAPS",
                "tileX": "256",
                "tileY": "256",
                "maxLOD": "20",
                "Source": [{
                    "id": "s1",
                    "url": url_reduced
                    }]
                }],
                "MapLayerStacks": [
                    {
                    "name": "DEFAULT",
                    "MapLayer": {
                    "name": "layer1",
                    "refMapProvider": "HEREMAPS",
                    "opacity": "1.0",
                    "colBkgnd": "RGB(255,255,255)"
                }
                }]
            };
            editLocationMapObject.setMapConfiguration(oMapConfig);
            editLocationMapObject.setRefMapLayerStack("DEFAULT");
        },

        onPressCancel: function() {
            sap.ui.getCore().byId(sap.ui.getCore().getModel("editNodeModel").getData().dialogId).close()
        },
        openDialog: function(){
            sap.ui.getCore().byId(sap.ui.getCore().getModel("editNodeModel").getData().dialogId).open()
        },

        onSuggest: function (oEvent) {
            this.resetEditNodeModel()
            helpers.onSuggest(oEvent)
        },

        addSpotToMap: function (lon, lat){
            var vos = this.byId("editLocationMap").getVos(),
            spot = new Spot({
                'position': String(lon) + ";" + String(lat) + ";0"
            })
            if(vos.length > 0){
                vos[0].removeAllItems()
                vos[0].addItem(spot)
            } else {
                this.byId("editLocationMap").addVo(new Spots({
                    items: [spot]})
                )
            }
            this.byId("editLocationMap").setCenterPosition(spot.getPosition())
        },

        onMapClick: function (oEvent) {
            var lon = Number((oEvent.getParameter('pos').split(";")[0])).toFixed(5),
                lat = Number((oEvent.getParameter('pos').split(";")[1])).toFixed(5)
            
            this.byId("editLongitudeInput").setValue(lon)
            this.byId("editLatitudeInput").setValue(lat)
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeLatitudeValue = lat
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeLongitudeValue = lon
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            this.addSpotToMap(lon, lat)
            
        },

        onSuggestIcons: function (oEvent) {
            /**
             * Get the icons that fit the search input for a Node icon.
             */
			var sValue = oEvent.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters = [
					new Filter([
						new Filter("text", function (sText) {
							return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						}),
						new Filter("icon", function (sDes) {
							return (sDes || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						})
					], false)
				];
			}

			this.iconSearch.getBinding("suggestionItems").filter(aFilters);
			this.iconSearch.suggest();
		},

        onNodeTypeSelected: function (oEvent) {
            /**
             * Select the type of node.
             */
            var sType = oEvent.getSource().getSelectedKey()
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeTypeValue = sType
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true

        },

        resetEditNodeModel: function () {

            sap.ui.getCore().getModel("editNodeModel").getData().editNodeTypeValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeTitleValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeIconValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeDateTimeValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeCategoryValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeURLValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeLatitudeValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeLongitudeValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeCityValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeCountryValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeFirstNameValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeLastNameValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeAgeValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeDOBValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeEndDateValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().nodeKey = null
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeGenderValue = null
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = false

            this.byId("editStartDateTimePicker").setValue(null)
            this.byId("editEndDateTimePicker").setValue(null)
            this.byId("editDobDateTimePicker").setValue(null)
            this.byId("editFirstNameInput").setValue(null)
            this.byId("editLastNameInput").setValue(null)
            this.byId("editAgeInput").setValue(null)
            this.byId("editGenderInput").setValue(null)
            this.byId("editLongitudeInput").setValue(null)
            this.byId("editLatitudeInput").setValue(null)
            this.byId("editCityInput").setValue(null)
            this.byId("editCountryInput").setValue(null)
            this.byId("editURLInput").setValue(null)
            this.byId("editCategoryInput").setValue(null)
            this.byId("editNodeTitleInput").setValue(null)
            this.byId("editNodeTypeInput").setValue(null)
            this.byId("editSearchNodeIcons").setValue(null)

            this.byId("editStartDateTimePicker").setVisible(false)
            this.byId("editEndDateTimePicker").setVisible(false)
            this.byId("editDobDateTimePicker").setVisible(false)
            this.byId("editFirstNameInput").setVisible(false)
            this.byId("editLastNameInput").setVisible(false)
            this.byId("editAgeInput").setVisible(false)
            this.byId("editGenderInput").setVisible(false)
            this.byId("editCityInput").setVisible(false)
            this.byId("editCountryInput").setVisible(false)
            this.byId("editURLInput").setVisible(false)
            this.byId("editCategoryInput").setVisible(false)
            this.byId("editNodeTitleInput").setVisible(false)
            this.byId("editNodeTypeInput").setVisible(false)
            this.byId("editSearchNodeIcons").setVisible(false)
            this.byId('editLocationMapFlexBox').setVisible(false)
            this.byId('editLonLatFields').setVisible(false)

            this.byId('editNodeIconLabel').setVisible(false)
            this.byId('editTypeLabel').setVisible(false)
            this.byId('editNodeTitleLabel').setVisible(false)
            this.byId('editCategoryInputLabel').setVisible(false)
            this.byId('editURLInputLabel').setVisible(false)
            this.byId('editAgeInputLabel').setVisible(false)
            this.byId('editDobDateTimePickerLabel').setVisible(false)
            this.byId('editGenderInputLabel').setVisible(false)
            this.byId('editLastNameInputLabel').setVisible(false)
            this.byId('editFirstNameInputLabel').setVisible(false)
            this.byId('editEndDateTimePickerLabel').setVisible(false)
            this.byId('editStartDateTimePickerLabel').setVisible(false)
            this.byId('editCityCountryInputLabel').setVisible(false)

            var vos = this.byId("editLocationMap").getVos()
            if(vos.length > 0){
                vos[0].removeAllItems()
            }            
        },

        onSetAdditionalPersonAttributes: function () {
            this.byId('editAgeInputLabel').setVisible(true)
            this.byId("editAgeInput").setVisible(true)
            this.byId('editGenderInputLabel').setVisible(true)
            this.byId('editGenderInput').setVisible(true)
            this.byId('editDobDateTimePickerLabel').setVisible(true)
            this.byId('editDobDateTimePicker').setVisible(true)
            this.byId('editFirstNameInputLabel').setVisible(true)
            this.byId('editFirstNameInput').setVisible(true)
            this.byId('editLastNameInputLabel').setVisible(true)
            this.byId('editLastNameInput').setVisible(true)
        },

        onSetNodeToEdit: function (oEvent) {
            fastAPI.getNode(oEvent.getParameter("suggestionItem").getKey())
            .then(results => {
                this.byId('editLocationMapFlexBox').setVisible(true)
                this.byId('editLonLatFields').setVisible(true)
                this.byId('editURLInputLabel').setVisible(true)
                this.byId('editURLInput').setVisible(true)
                for (const property in results) {
                    console.log(`${property}: ${results[property]}`)
                    if(property === "key"){
                        sap.ui.getCore().getModel("editNodeModel").getData().nodeKey = results[property]
                    } else if(property === "icon"){
                        this.byId('editNodeIconLabel').setVisible(true)
                        this.byId('editSearchNodeIcons').setVisible(true)
                        this.byId('editSearchNodeIcons').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeIconValue = results[property]
                    } else if(property === "type"){
                        this.byId('editTypeLabel').setVisible(true)
                        this.byId('editNodeTypeInput').setVisible(true)
                        this.byId('editNodeTypeInput').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeTypeValue = results[property]
                    } else if(property === "title"){
                        this.byId('editNodeTitleLabel').setVisible(true)
                        this.byId('editNodeTitleInput').setVisible(true)
                        this.byId('editNodeTitleInput').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeTitleValue = results[property]
                    } else if(property === "category"){
                        this.byId('editCategoryInputLabel').setVisible(true)
                        this.byId('editCategoryInput').setVisible(true)
                        this.byId('editCategoryInput').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeCategoryValue = results[property]
                    } else if(property === "URL"){
                        this.byId('editURLInput').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeURLValue = results[property]
                    } else if(property === "lat"){
                        this.byId('editLatitudeInput').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeLatitudeValue = results[property]
                    } else if(property === "lon"){
                        this.byId('editLongitudeInput').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeLongitudeValue = results[property]
                    } else if(property === "dateTime"){
                        this.byId('editStartDateTimePickerLabel').setVisible(true)
                        this.byId('editStartDateTimePicker').setVisible(true)
                        this.byId('editStartDateTimePicker').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeDateTimeValue = results[property]
                    } else if(property === "gender"){
                        this.byId('editGenderInputLabel').setVisible(true)
                        this.byId('editGenderInput').setVisible(true)
                        this.byId('editGenderInput').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeGenderValue = results[property]
                    } else if(property === "dob"){
                        this.byId('editDobDateTimePickerLabel').setVisible(true)
                        this.byId('editDobDateTimePicker').setVisible(true)
                        this.byId('editDobDateTimePicker').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeDOBValue = results[property]
                    } else if(property === "nameFirst"){
                        this.byId('editFirstNameInputLabel').setVisible(true)
                        this.byId('editFirstNameInput').setVisible(true)
                        this.byId('editFirstNameInputLabel').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeFirstNameValue = results[property]
                    } else if(property === "nameLast"){
                        this.byId('editLastNameInputLabel').setVisible(true)
                        this.byId('editLastNameInput').setVisible(true)
                        this.byId('editLastNameInput').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeLastNameValue = results[property]
                    } else if(property === "endDate"){
                        this.byId('editEndDateTimePickerLabel').setVisible(true)
                        this.byId('editEndDateTimePicker').setVisible(true)
                        this.byId('editEndDateTimePicker').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeEndDateValue = results[property]
                    } else if(property === "city"){
                        this.byId('editCityCountryInputLabel').setVisible(true)
                        this.byId('editCityInput').setVisible(true)
                        this.byId('editCityInput').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeCityValue = results[property]
                    } else if(property === "country"){
                        this.byId('editCityCountryInputLabel').setVisible(true)
                        this.byId('editCountryInput').setVisible(true)
                        this.byId('editCountryInput').setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeCountryValue = results[property]
                    } else if(property === "age"){
                        this.byId('editAgeInputLabel').setVisible(true)
                        this.byId("editAgeInput").setVisible(true)
                        this.byId("editAgeInput").setValue(results[property])
                        sap.ui.getCore().getModel("editNodeModel").getData().editNodeAgeValue = results[property]
                    }
                    
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeLatitudeValue !== null &&
                sap.ui.getCore().getModel("editNodeModel").getData().editNodeLongitudeValue !== null){
                    this.addSpotToMap(sap.ui.getCore().getModel("editNodeModel").getData().editNodeLongitudeValue, 
                    sap.ui.getCore().getModel("editNodeModel").getData().editNodeLatitudeValue
                    )
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeTypeValue === 'Person'){
                    this.onSetAdditionalPersonAttributes()
                }
            })
        },

        onPressEditNode: function () {
            if(sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited === true){
                var oNodeShell = {
                    key: sap.ui.getCore().getModel("editNodeModel").getData().nodeKey
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeTypeValue != null){
                    oNodeShell['type'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeTypeValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeTitleValue != null){
                    oNodeShell['title'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeTitleValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeIconValue != null){
                    oNodeShell['icon'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeIconValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeDateTimeValue != null){
                    oNodeShell['dateTime'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeDateTimeValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeCategoryValue != null){
                    oNodeShell['category'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeCategoryValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeURLValue != null){
                    oNodeShell['URL'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeURLValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeLatitudeValue != null){
                    oNodeShell['lat'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeLatitudeValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeLongitudeValue != null){
                    oNodeShell['lon'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeLongitudeValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeCityValue != null){
                    oNodeShell['city'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeCityValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeCountryValue != null){
                    oNodeShell['country'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeCountryValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeFirstNameValue != null){
                    oNodeShell['nameFirst'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeFirstNameValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeLastNameValue != null){
                    oNodeShell['nameLast'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeLastNameValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeAgeValue != null){
                    oNodeShell['age'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeAgeValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeDOBValue != null){
                    oNodeShell['dob'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeDOBValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeEndDateValue != null){
                    oNodeShell['endDate'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeEndDateValue
                }
                if(sap.ui.getCore().getModel("editNodeModel").getData().editNodeGenderValue != null){
                    oNodeShell['gender'] = sap.ui.getCore().getModel("editNodeModel").getData().editNodeGenderValue
                }
                fastAPI.postUpdateNode(oNodeShell).then((results) =>{
                    MessageToast.show(results.message)
                    sap.ui.controller("marina.controller.NetworkGraph").setGraph(results.sub_graph, results.node_key)
                })
            }
            else{
                MessageToast.show("No changes have been made.")
            }
        },

        onNodeLastNameChange: function (oEvent) {
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeLastNameValue = oEvent.getSource().getValue()
        },

        onNodeURLChange: function (oEvent) {
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeURLValue = oEvent.getSource().getValue()
        },

        onNodeFirstNameChange: function (oEvent) {
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeFirstNameValue = oEvent.getSource().getValue()
        },

        onNodeCountryChange: function (oEvent) {
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeCountryValue = oEvent.getSource().getValue()
        },

        onNodeCityChange: function (oEvent) {
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeCityValue = oEvent.getSource().getValue()
        },

        onNodeAgeChange: function (oEvent) {
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeAgeValue = oEvent.getSource().getValue()
        },

        onGenderSelected: function (oEvent) {
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeGender = oEvent.getSource().getSelectedKey()
        },

        handleChangeStartDate: function (oEvent){
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeDateTimeValue = oEvent.getSource().getValue()
        },

        handleChangeEndDate: function (oEvent){
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeEndDateValue = oEvent.getSource().getValue()
        },

        handleChangeDOB: function (oEvent){
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("editNodeModel").getData().editNodeDOBValue = oEvent.getSource().getValue()
        },

        onNodeTitleChange: function(oEvent) {
            sap.ui.getCore().getModel("editNodeModel").getData().nodeEdited = true
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeTitleValue = oEvent.getSource().getValue()
		},

        
	});
});