/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");

module.exports = function() {
	var app = express.Router();

	app.get("/getLoadStatus", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select IFNULL(load_status, \'Unknown\') as LOAD_STATUS, count(*) as count from data_set group by load_status order by count desc');
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
	
	app.get("/getLoadStatusReport", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select IFNULL(load_status, \'Unknown\') as LOAD_STATUS, NAME, SOURCE, CLASSIFICATION from DATA_SET order by LOAD_STATUS, SOURCE');
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
	
	app.get("/getLoadFreq", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select IFNULL(LOAD_FREQUENCY, \'Unknown\') as LOAD_FREQUENCY, count(*) as count from data_set group by LOAD_FREQUENCY order by count desc');
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
	
	app.get("/getLoadFreqReport", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select IFNULL(LOAD_FREQUENCY, \'Unknown\') as LOAD_FREQUENCY, NAME, SOURCE, CLASSIFICATION from DATA_SET order by LOAD_FREQUENCY, SOURCE');
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
	
	app.get("/getAccessType", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select IFNULL(ACCESS_TYPE, \'Unknown\') as ACCESS_TYPE, count(*) as COUNT from DATA_SET group by ACCESS_TYPE order by COUNT desc');
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
	
	app.get("/getAccessTypeReport", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select IFNULL(ACCESS_TYPE, \'Unknown\') as ACCESS_TYPE, NAME, SOURCE, CLASSIFICATION from DATA_SET order by ACCESS_TYPE, SOURCE');
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
	
	app.get("/topDataCardViews", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select top 3 DATA_CARD_ID, DATASET_NAME, count(OBJECT_TYPE) as COUNT from audit_log a inner join data_card d on a.OBJECT_ID = DATA_CARD_ID ' +
					'where a.OBJECT_TYPE = \'DATA CARD\' and action = \'VIEW\' group by DATA_CARD_ID, DATASET_NAME order by count desc');
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
	
	app.get("/topModelCardViews", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select top 3 MODEL_CARD_ID, MODEL_NAME, count(OBJECT_TYPE) as COUNT ' +
					'from audit_log a inner join model_card m on a.OBJECT_ID = MODEL_CARD_ID ' +
					'where a.OBJECT_TYPE = \'MODEL CARD\' and action = \'VIEW\' group by MODEL_CARD_ID, MODEL_NAME order by count desc');
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
	
	app.get("/topDataSetExports", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select top 3 DATA_SET_ID, NAME, count(OBJECT_TYPE) as COUNT ' +
					'from audit_log a inner join data_set d on a.OBJECT_ID = DATA_SET_ID ' +
					'where a.OBJECT_TYPE = \'DATA SET\' and action = \'DOWNLOAD\' group by NAME, DATA_SET_ID order by count desc');
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
	
	app.get("/getDataSetDownloadsByMonth", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select MONTH(ACTION_TIMESTAMP) as MONTH, count(*) as COUNT from audit_log a ' +
									'where ACTION = \'DOWNLOAD\' and OBJECT_TYPE = \'DATA SET\' group by MONTH(ACTION_TIMESTAMP)');
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
	
	app.get("/getImageryDownloadsByMonth", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select MONTH(ACTION_TIMESTAMP) as MONTH, count(*) as COUNT from audit_log a ' +
									'where ACTION = \'DOWNLOAD\' and OBJECT_TYPE in (\'IMAGERY PACKAGE\', \'CLIP\', \'FRAME\') ' +
									'group by MONTH(ACTION_TIMESTAMP) ORDER BY MONTH(ACTION_TIMESTAMP) asc');
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
	
	app.get("/getModelViewsByMonth", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select MONTH(ACTION_TIMESTAMP) as MONTH, count(*) as COUNT from audit_log a ' +
									'where ACTION = \'VIEW\' and OBJECT_TYPE = \'MODEL CARD\' ' +
									'group by MONTH(ACTION_TIMESTAMP) ORDER BY MONTH(ACTION_TIMESTAMP) asc');
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
	
	app.get("/getCategoriesChart", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select ds1.prime_category, ds1.sub_category, ds1.sub_count, ds2.prime_count from ' +
				    '(select prime_category, coalesce(nullif(sub_category,\'\'), \'Unknown\') as sub_category, count(*) as sub_count from data_set ' +
				    'group by prime_category, sub_category ' +
				    'order by prime_category, sub_count desc) ds1, ' +
				    '(select prime_category, count(*) as prime_count from data_set ' +
				    'group by prime_category) ds2 where ' +
				    'ds1.prime_category = ds2.prime_category ' +
					'order by ds2.prime_count desc, ds1.prime_category, ds1.sub_category');
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
	
	app.get("/getTeDesignationsChart", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('SELECT te_designation, count(TE_DESIGNATION) AS COUNT FROM IMAGERY_PACKAGE_DATA_CARD ' + 
									'GROUP BY TE_DESIGNATION ORDER BY count(TE_DESIGNATION) desc');
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
	
	app.get("/getDownloadsByMonthReport", (req, res) => {
		let month = req.query.month;
		let client = req.db;
		let stmt = client.prepare('select d.name, userid, action_timestamp from audit_log a, data_set d ' +
									'where a.object_id = d.data_set_id and MONTH(ACTION_TIMESTAMP) = ? ' +
									'and ACTION = \'DOWNLOAD\' and OBJECT_TYPE = \'DATA SET\' ' +
									'group by name, userid, action_timestamp order by action_timestamp desc');
		stmt.exec([month], function (err, rows) {
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