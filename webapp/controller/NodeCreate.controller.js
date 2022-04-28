sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "marina/utils/fastAPI",
    "sap/m/MessageToast",
    "sap/ui/model/Filter"
], function (Controller, JSONModel, fastAPI, MessageToast, Filter) {
	"use strict";
	return Controller.extend("marina.controller.NodeCreate", {
        onInit: function () {
            /**
             * Set a model that contains the different sources for graph formatted data and their respective URLs. 
             */
            var oModel = new JSONModel(fastAPI.setURLs());
            this.getView().setModel(oModel);
            sap.ui.getCore().setModel(new JSONModel({
                dialogId: this.byId("createNodePanel").sId,
                createNodeIconValue: null,
                createNodeTitleValue: null,
                createNodeTypeValue: null,
                createNodeDateTimeValue: null,
                createNodeCategoryValue: null,
                createNodeURLValue: null,
                createNodeLatitudeValue: null,
                createNodeLongitudeValue: null,
                createNodeCityValue: null,
                createNodeCountryValue: null,
                createNodeFirstNameValue: null,
                createNodeLastNameValue: null,
                createNodeAgeValue: null,
                createNodeDOBValue: null,
                createNodeGenderValue: null,
                createNodeEndDateValue: null
            }), "graphExplorerConfigCreateNode")

            var createNodeModel = new JSONModel();
            createNodeModel.loadData(sap.ui.require.toUrl("marina/model/workbenchVariables.json"));
            this.byId("createNodePanel").setModel(createNodeModel);
            this.iconSearch = this.byId("searchNodeIcons")

            var createLocationMapObject = this.getView().byId("createLocationMap")
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
            createLocationMapObject.setMapConfiguration(oMapConfig);
            createLocationMapObject.setRefMapLayerStack("DEFAULT");
        },

        onPressCancel: function() {
            sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().dialogId).close()
        },
        openDialog: function(){
            sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().dialogId).open()
        },
        onPressCreateNode: function () {
            var sNodeIcon = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeIconValue,
                sNodeTitle = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeTitleValue,
                sNodeType = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeTypeValue
            if(sNodeIcon === null || sNodeTitle === null || sNodeType === null){
                MessageToast.show("An icon, title, and type are required.")
            } else {
                MessageToast.show("Creating node.")
                var oNodeShell = {
                    icon: sNodeIcon,
                    title: sNodeTitle,
                    type: sNodeType 
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeDateTimeValue){
                    oNodeShell['dateTime'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeDateTimeValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCategoryValue){
                    oNodeShell['category'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCategoryValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeURLValue){
                    oNodeShell['URL'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeURLValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLatitudeValue){
                    oNodeShell['lat'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLatitudeValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLongitudeValue){
                    oNodeShell['lon'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLongitudeValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCityValue){
                    oNodeShell['city'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCityValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCountryValue){
                    oNodeShell['country'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCountryValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeFirstNameValue){
                    oNodeShell['nameFirst'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeFirstNameValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLastNameValue){
                    oNodeShell['nameLast'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLastNameValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeAgeValue){
                    oNodeShell['age'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeAgeValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeDOBValue){
                    oNodeShell['dob'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeDOBValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeGenderValue){
                    oNodeShell['gender'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeGenderValue
                }
                if(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeEndDateValue){
                    oNodeShell['endDate'] = sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeEndDateValue
                }
                this.resetCreateNodeModel()
                fastAPI.postCreateNode(oNodeShell).then((results) =>{
                    MessageToast.show(results.message)
                    sap.ui.getCore().byId(sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().dialogId).close()
                    if(results.node_key){
                        sap.ui.controller("marina.controller.NetworkGraph").setGraph(results.sub_graph, results.node_key)
                    }
                })
            }
        },

        setCreateNodeForEvent: function () {
            /**
             * Set the create node fields to those valid for an event
             */
            this.byId("startDateTimePickerLabel").setVisible(true)
            this.byId("startDateTimePicker").setVisible(true)
            this.byId("endDateTimePickerLabel").setVisible(true)
            this.byId("endDateTimePicker").setVisible(true)
            this.byId("categoryInputLabel").setVisible(true)
            this.byId("categoryInput").setVisible(true)
            this.hidePersonFields()
            this.hideLocationFields()
            this.resetCreateNodeModel("Event")
            
        },

        setCreateNodeForPerson: function () {

            this.byId("dobDateTimePickerLabel").setVisible(true)
            this.byId("dobDateTimePicker").setVisible(true)
            this.byId("firstNameInputLabel").setVisible(true)
            this.byId("firstNameInput").setVisible(true)
            this.byId("lastNameInputLabel").setVisible(true)
            this.byId("lastNameInput").setVisible(true)
            this.byId("genderInputLabel").setVisible(true)
            this.byId("genderInput").setVisible(true)
            this.byId("ageInput").setVisible(true)
            this.byId("ageInputLabel").setVisible(true)
            this.hideEventFields()
            this.hideLocationFields()
            this.resetCreateNodeModel("Person")
        },

        hideLocationFields: function () {

            this.byId("createLocationMapFlexBox").setVisible(false)
            this.byId("LonLatInputLabel").setVisible(false)
            this.byId("LongitudeInput").setVisible(false)
            this.byId("LatitudeInput").setVisible(false)
            this.byId("CityCountryInputLabel").setVisible(false)
            this.byId("CityCountryFields").setVisible(false)

        },

        hidePersonFields: function () {

            this.byId("dobDateTimePickerLabel").setVisible(false)
            this.byId("dobDateTimePicker").setVisible(false)
            this.byId("firstNameInputLabel").setVisible(false)
            this.byId("firstNameInput").setVisible(false)
            this.byId("lastNameInputLabel").setVisible(false)
            this.byId("lastNameInput").setVisible(false)
            this.byId("genderInputLabel").setVisible(false)
            this.byId("genderInput").setVisible(false)
            this.byId("ageInput").setVisible(false)
            this.byId("ageInputLabel").setVisible(false)
        },

        hideEventFields: function () {

            this.byId("startDateTimePickerLabel").setVisible(false)
            this.byId("startDateTimePicker").setVisible(false)
            this.byId("endDateTimePickerLabel").setVisible(false)
            this.byId("endDateTimePicker").setVisible(false)
            
        },

        resetCreateNodeModel: function (sNodeType) {

            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeDateTimeValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCategoryValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeURLValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLatitudeValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLongitudeValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCityValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCountryValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeFirstNameValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLastNameValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeAgeValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeDOBValue = null
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeEndDateValue = null

            this.byId("startDateTimePicker").setValue(null)
            this.byId("endDateTimePicker").setValue(null)
            this.byId("dobDateTimePicker").setValue(null)
            this.byId("firstNameInput").setValue(null)
            this.byId("lastNameInput").setValue(null)
            this.byId("ageInput").setValue(null)
            this.byId("genderInput").setValue(null)
            this.byId("LongitudeInput").setValue(null)
            this.byId("LatitudeInput").setValue(null)
            this.byId("CityInput").setValue(null)
            this.byId("CountryInput").setValue(null)
            this.byId("URLInput").setValue(null)
            this.byId("categoryInput").setValue(null)
            this.byId("nodeTitleInput").setValue(null)
            if(sNodeType === undefined){
                this.byId("nodeTypeInput").setValue(null)
            }
            this.byId("searchNodeIcons").setValue(null)

        },

        setCreateNodeForLocation: function () {
            /**
             * Set the create node fields to those valid for an event
             */
            this.byId("createLocationMapFlexBox").setVisible(true)
            this.byId("LonLatInputLabel").setVisible(true)
            this.byId("categoryInputLabel").setVisible(true)
            this.byId("categoryInput").setVisible(true)
            this.byId("LonLatInputLabel").setVisible(true)
            this.byId("LongitudeInput").setVisible(true)
            this.byId("LatitudeInput").setVisible(true)
            this.byId("CityCountryInputLabel").setVisible(true)
            this.byId("CityInput").setVisible(true)
            this.byId("CountryInput").setVisible(true)
            this.byId("CityCountryFields").setVisible(true)
            this.byId("LonLatFields").setVisible(true)
            // Non-Event related fields are set to invisible and null
            this.hideEventFields()
            this.hidePersonFields()
            this.resetCreateNodeModel("Location")

        },

        onMapClick: function (oEvent) {
            var lon = Number((oEvent.getParameter('pos').split(";")[0])).toFixed(5),
                lat = Number((oEvent.getParameter('pos').split(";")[1])).toFixed(5)
            
            this.byId("LongitudeInput").setValue(lon)
            this.byId("LatitudeInput").setValue(lat)
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLatitudeValue = lat
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLongitudeValue = lon
        },

        onNodeTypeSelected: function (oEvent) {
            /**
             * Select the type of node.
             */
            var sType = oEvent.getSource().getSelectedKey()
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeTypeValue = sType

            if(sType === 'Event'){
                this.setCreateNodeForEvent()
            } else if(sType === 'Location'){
                this.setCreateNodeForLocation()
            } else if(sType === 'Person'){
                this.setCreateNodeForPerson()
            } else {
                this.hidePersonFields()
                this.hideEventFields()
                this.hideLocationFields()
            }
        },

        onNodeLastNameChange: function (oEvent) {
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeLastNameValue = oEvent.getSource().getValue()
        },

        onSetIcon: function (oEvent) {
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeIconValue = oEvent.getParameter('suggestionItem').getIcon()
        },

        onNodeURLChange: function (oEvent) {
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeURLValue = oEvent.getSource().getValue()
        },

        onNodeFirstNameChange: function (oEvent) {
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeFirstNameValue = oEvent.getSource().getValue()
        },

        onNodeCountryChange: function (oEvent) {
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCountryValue = oEvent.getSource().getValue()
        },

        onNodeCityChange: function (oEvent) {
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeCityValue = oEvent.getSource().getValue()
        },

        onNodeAgeChange: function (oEvent) {
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeAgeValue = oEvent.getSource().getValue()
        },

        onGenderSelected: function (oEvent) {
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeGender = oEvent.getSource().getSelectedKey()
        },

        handleChangeStartDate: function (oEvent){
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeDateTimeValue = oEvent.getSource().getValue()
        },

        handleChangeEndDate: function (oEvent){
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeEndDateValue = oEvent.getSource().getValue()
        },

        handleChangeDOB: function (oEvent){
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeDOBValue = oEvent.getSource().getValue()
        },

        onNodeTitleChange: function(oEvent) {
            /**
             * Manually enter a title when creating a node.
             */
            sap.ui.getCore().getModel("graphExplorerConfigCreateNode").getData().createNodeTitleValue = oEvent.getSource().getValue()
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
		}
        
	});
});