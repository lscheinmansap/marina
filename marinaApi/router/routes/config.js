/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");
const async = require('async');
var AWS = require('aws-sdk');

// set the config file directory for the config module to read
// first, figure out which XSA Space we're in...
let vcap = JSON.parse(process.env.VCAP_APPLICATION);
let space = vcap.space_name;
// then, append the space to the config directory
process.env["NODE_CONFIG_DIR"] = "/home/saphdbxsa/config/marina/" + space;

const config = require('config');
const s3Config = config.get("S3");
AWS.config.update({
	region: s3Config.region
});

module.exports = function() {
	var app = express.Router();

	app.get("/getCurrentUser", (req, res) => {
		var isApprover=false, approverType;
		// approver type is checked in the workflow tables
		if (req.authInfo.checkScope('$XSAPPNAME.approver1') || req.authInfo.checkScope('$XSAPPNAME.approver2')) {
			isApprover = true;
			if (req.authInfo.checkScope('$XSAPPNAME.approver2')) {
				approverType = "MARINA_DB_APPROVER2";
			}
			else  {
				approverType = "MARINA_DB_APPROVER1";
			}
		}
		
		res.send({
			"username": req.user.id,
			"firstname": req.user.name.givenName,
			"lastname": req.user.name.familyName,
			"admin": req.authInfo.checkScope('$XSAPPNAME.admin'),
			"approver": isApprover,
			"approverType": approverType,
			"cui": req.authInfo.checkScope('$XSAPPNAME.cui'),
			"uncontrolled": req.authInfo.checkScope('$XSAPPNAME.uncontrolled'),
			"editor": req.authInfo.checkScope('$XSAPPNAME.editor')
		});
	});

	app.get("/getAppConfig", (req, res) => {
		let client = req.db;
		var stmt = client.prepare('select KEY as "NAME", VALUE from LOOKUP_VALUES where NAME = \'APP_CONFIG\'');
		stmt.exec([], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				var obj = {};
				rows.forEach(function(row)  {
					obj[row.NAME] = row.VALUE;
				});
				
				res.json({
					status: 200,
					message: "OK",
					data: obj
				});
			}
		});
	});

	app.get("/getS3Config", (req, res) => {
		res.json({
			imageryBucket: s3Config.IMAGERY_BUCKET,
			dataBrokerBucket: s3Config.MARINA_BUCKET,
			bucketRegion: s3Config.region
		});
	});
	
	app.get("/getDataSetCategoryWithIcons", (req, res) => {
		let client = req.db;
		var stmt = client.prepare('select KEY as "NAME", ICON from LOOKUP_VALUES where NAME = \'DATA_SET_CATEGORY\'');
		stmt.exec([], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});

	app.get("/getLabelConfig", (req, res) => {
		let client = req.db;
		var stmt = client.prepare('select * from LABEL_CONFIG');
		stmt.exec([], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.json({
					labelConfig: rows
				});
			}
		});
	});
	
	app.get("/getDataSetSources", (req, res) => {
		let client = req.db;
		var stmt = client.prepare('select distinct SOURCE as NAME from data_set where SOURCE is not null and SOURCE != \'\' order by SOURCE');
		stmt.exec([], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});
	
	app.get("/getLookupValues", (req, res) => {
		let name = req.query.name;
		let client = req.db;
		var stmt = client.prepare('select KEY, VALUE, ICON from LOOKUP_VALUES where NAME = ? order by DISPLAY_ORDER');
		stmt.exec([name], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});
	
	app.get("/getNewGuid", (req, res) => {
		let client = req.db;
		var stmt = client.prepare('select to_nvarchar(SYSUUID) as GUID from dummy');
		stmt.exec([], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.json({
					status: 200,
					message: "OK",
					data: rows[0]
				});
			}
		});
	});
	
	app.get("/audit", (req, res) => {
		let id = req.query.id;
		let type = req.query.type;
		let action = req.query.action;
		let userid = req.user.id;
		
		let client = req.db;
		var stmt = client.prepare('insert into AUDIT_LOG values (?,?,?,?, CURRENT_TIMESTAMP)');
		stmt.exec([id, type, action, userid], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});

	app.get("/getPageHelp", (req, res) => {
		let pageName = req.query.pageName;
		let client = req.db;
		let stmt;
		async.waterfall([
			// first, get the page information
			function (done) {
				stmt = client.prepare('select * from HELP_PAGE where PAGE_NAME = ?');
				stmt.exec([pageName], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {page: rows[0]});
				});
			},
			// get page sections
			function (helpPage, done) {
				stmt = client.prepare('select SECTION_NAME, HELP_TEXT from HELP_PAGE_SECTION where PAGE_NAME = ? order by display_order');
				stmt.exec([pageName], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					helpPage.sections = rows;
					done(null, helpPage);
				});
			},
			// return the complete result
			function (result, done) {
				client.close();
				client.end();
				res.send({
					status: 200,
					message: "OK",
					data: result
				});	
				done(null, 'done');
			}
		], function (err) {
			if (err) {
				res.send({
					status: 401,
					message: "ERR",
					data: err
				});	
			}
		});
	});

	app.get("/getPlatformTypes", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select distinct PLATFORM_TYPE as NAME, count(PLATFORM_TYPE) total ' +
								'from SEQUENCE_FRAME where PLATFORM_TYPE is not null group by PLATFORM_TYPE');
		stmt.exec([], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});	
	
	app.get("/getSourceSensor", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select distinct IMAGE_SOURCE_SENSOR as NAME, count(IMAGE_SOURCE_SENSOR) total ' +
								'from SEQUENCE_FRAME where IMAGE_SOURCE_SENSOR is not null group by IMAGE_SOURCE_SENSOR');
		stmt.exec([], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});	
	
	app.get("/getSensorBand", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select distinct SENSOR_BAND as NAME, count(SENSOR_BAND) total from SEQUENCE_FRAME ' +
								'where SENSOR_BAND is not null group by SENSOR_BAND');
		stmt.exec([], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});	
	
	return app;
};