sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "sap/ui/model/json/JSONModel",
        "marina/model/models",
    ],
    function (UIComponent, Device, JSONModel, models) {
        "use strict";

        return UIComponent.extend("marina.Component", {
            metadata: {
                manifest: "json",
                handleValidation: true
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();
                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                sap.ui.getCore().setModel(new JSONModel({url: "http://localhost:3000"}), "API")
                //sap.ui.getCore().setModel(new JSONModel({url: "https://marina-api.cfapps.eu11.hana.ondemand.com"}), "API")
            }
        });
    }
);