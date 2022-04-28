sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "marina/utils/fastAPI"
], function (JSONModel, fastAPI) {
    return {

        onSuggest: function (oEvent) {
            /**
             * Get the items to populate the results of a search.
             * If the suggestion is for complex search like shortest path then store the key of 
             */
            var searchField = sap.ui.getCore().byId(oEvent.getSource().sId) 
            fastAPI.getSuggestionItems(oEvent.getSource().mProperties.value)
            .then((results) =>{
                searchField.setModel(new JSONModel(results))
                searchField.suggest()
            })
        },
    }

});