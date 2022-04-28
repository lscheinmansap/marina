/*global QUnit*/

sap.ui.define([
	"marina/controller/Launchpad.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Launchpad Controller");

	QUnit.test("I should test the Launchpad controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
