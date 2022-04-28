/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");
const async = require('async');
const request = require('request');
const { parse } = require('json2csv');
var AWS = require('aws-sdk');

// set the config file directory for the config module to read
// first, figure out which XSA Space we're in...
let vcap = JSON.parse(process.env.VCAP_APPLICATION);
let space = vcap.space_name;
// then, append the space to the config directory
process.env["NODE_CONFIG_DIR"] = "/home/saphdbxsa/config/marina/" + space;

const config = require('config');
const diConfig = config.get("DI");
const s3Config = config.get("S3");
AWS.config.update({
	region: s3Config.region
});

const diAuthOptions = {
    url: 'https://' + diConfig.host + ':' + diConfig.port + '/auth/login',
    rejectUnauthorized: false,
    auth: {
        username: diConfig.tenant + '\\' + diConfig.user,
        password: diConfig.password
    }
};


module.exports = function() {
	var app = express.Router();

	app.get("/getUserSubscriptions", (req, res) => {
		let userid = req.user.id;
		
		let client = req.db;
		var stmt = client.prepare('select * from V_DATA_SET_LAST_UPDATED u, data_set_subscribe s where u.DATA_SET_ID = s.data_set_id ' +
									'and userid = ? and u.LAST_UPDATED_TIMESTAMP >= s.LAST_CHECKED_TIMESTAMP');
		stmt.exec([userid], function (err, rows) {
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
	
	app.get("/getDownloadsCount", (req, res) => {
		let userid = req.user.id;
		
		let client = req.db;
		var stmt = client.prepare('select count(*) as TOTAL from USER_DOWNLOAD a inner join DATA_SET d on a.DATA_SET_ID = d.DATA_SET_ID where username = ? and DOWNLOAD_TIME is null');
		stmt.exec([userid], function (err, rows) {
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
					data: rows[0].TOTAL
				});
			}
		});
	});
	
	app.get("/getApprovalsCount", (req, res) => {
		let userid = req.user.id;
		var approverType = req.query.approverType;

		let client = req.db;
		var stmt = client.prepare('select count(card_name) as TOTAL from V_MARINA_WORKFLOW_INSTANCE_IN_PROGRESS p ' +
			'inner join workflow_instance wi on p.wf_instance_id = wi.wf_instance_id inner join workflow w on wi.wf_id = w.wf_id  ' +
			'where APPROVER_ROLE = ? and card_id not in (select object_id from audit_log where userid = ? and action = \'VIEW\')');
		stmt.exec([approverType, userid], function (err, rows) {
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
					data: rows[0].TOTAL
				});
			}
		});
	});
	
	app.get("/getRejectedCount", (req, res) => {
		let userid = req.user.id;
		
		let client = req.db;
		var stmt = client.prepare('select count(card_name) as TOTAL from workflow_instance wi inner join workflow w on wi.wf_id = w.wf_id ' +
					'inner join workflow_instance_state s on wi.wf_instance_id = s.wf_instance_id ' +
					'where CREATED_BY = ? and ACTION_TAKEN = \'REJECTED\' and card_id not in (select object_id from audit_log where userid = ? and action = \'VIEW\')');
		stmt.exec([userid, userid], function (err, rows) {
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
					data: rows[0].TOTAL
				});
			}
		});
	});

	app.get("/searchDataSet", (req, res) => {
		var hasFouo = req.authInfo.checkScope('$XSAPPNAME.cui');
		var val = (req.query.val) ? req.query.val : '';
		var limit = (req.query.limit) ? req.query.limit : 50;
		var offset = (req.query.offset) ? req.query.offset : 0;
		var sortBy = (req.query.sortBy) ? req.query.sortBy : "d.LAST_MOD_DATE";
		var sortDir = (req.query.sortDir) ? req.query.sortDir : "desc";
		var startDate = req.query.start;
		var endDate = req.query.end;
		var filters = req.query.filters;
		var filterStmt = '', keywordStmt = '', nonCuiStmt = '', prefix = ' where ', params = [];
		
		if (val && val.length > 0)  {
			keywordStmt += ' left outer join V_TA_TABLE vtt on d.data_set_id = vtt.data_set_id where contains (TA_TOKEN, ?, FUZZY(0.7)) ';
			params.push('%'+val+'%');
			prefix = ' and ';
		}
		
		if (filters)  {
			Object.keys(filters).forEach(function(key)  {
				var colVals = filters[key];
				filterStmt += prefix + key + ' in (\'' + colVals.join("\',\'") + '\') ';
				prefix = ' and ';
			});
		}
		
		let client = req.db;
		let stmt, query;
		async.waterfall([
			// first, get total count for query
			function (done) {
				query = 'select count(distinct d.DATA_SET_ID) as COUNT from data_set d left outer join data_file f on d.data_set_id = f.data_set_id ';
				if (keywordStmt)  {
					query += keywordStmt;
				}
				// if user doesn't have fouo, only return unclass data
				if (!hasFouo) {
					nonCuiStmt = prefix + ' d.CLASSIFICATION not in (\'CUI\', \'CONTROLLED UNCLASSIFIED INFORMATION\') ';
					query += nonCuiStmt;
					prefix = ' and ';
				}
				if (filterStmt)  {
					query += filterStmt;
				}
				if (startDate)  {
					query += prefix + ' TO_DATE(d.LAST_MOD_DATE) between ? and ? ';
					prefix = " and ";
					params.push(startDate);
					params.push(endDate);
				}

				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].COUNT);
				});	

			},
			// next, execute the query
			function (count, done) {
				// search all columns in the data card table for the user provided value
				query = 'select d.data_set_id, IFNULL(d.source, \'Source Not Available\') as SOURCE, d.classification, d.name, description, d.last_mod_date, prime_category, ' +
						'count(f.data_file_id) as num_files, (SELECT count(*) FROM AUDIT_LOG a WHERE OBJECT_TYPE = \'DATA SET\' AND ACTION = \'VIEW\' AND d.DATA_SET_ID = a.OBJECT_ID) AS NUM_VIEWS, URL ' +
							'from data_set d left outer join data_file f on d.data_set_id = f.data_set_id ';
				if (keywordStmt)  {
					query += keywordStmt;
				}
				// if user doesn't have fouo only return unclass data
				if (!hasFouo) {
					query += nonCuiStmt
					prefix = ' and ';
				}
				if (filterStmt)  {
					query += filterStmt;
				}
				
				var groupClause = ' group by d.data_set_id, d.source, d.classification, d.name, d.description, d.last_mod_date, d.prime_category, d.url ';
				// ensure most recently updated datasets are displayed first
				groupClause += 'order by ' + sortBy + ' ' + sortDir;
				// add limit and offset for paging
				groupClause += ' limit ? offset ?'; 

				if (startDate)  {
					query += prefix + ' TO_DATE(d.LAST_MOD_DATE) between ? and ? ';
					prefix = ' and ';
					params.push(startDate);
					params.push(endDate);
				}
				
				query += groupClause;
				params.push(limit);
				params.push(offset);

				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {total: count, limit: limit, offset: offset, results: rows});
				});
				
			},
			// return the complete result
			function (result, done) {
				client.close();
				client.end();
				res.json({
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

	app.get("/getDataCardsTotal", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select count(*) as TOTAL from DATA_CARD where IS_APPROVED = 1');
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
					data: rows[0].TOTAL
				});
			}
		});
	});
	
	app.get("/getModelCardsTotal", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select count(*) as TOTAL from MODEL_CARD where IS_APPROVED = 1');
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
					data: rows[0].TOTAL
				});
			}
		});
	});
	
	app.get("/searchManifest", (req, res) => {
		let hasFouo = req.authInfo.checkScope('$XSAPPNAME.cui');
		let val = (req.query.val) ? req.query.val : '';
		let limit = (req.query.limit) ? req.query.limit : 50;
		let offset = (req.query.offset) ? req.query.offset : 0;
		let filters = req.query.filters;
		let filterStmt;
		
		if (filters)  {
			Object.keys(filters).forEach(function(key)  {
				var colVals = filters[key];
				var vals = Object.keys(colVals);
				filterStmt = 'and ' + key + ' in (\'' + vals.join("\',\'") + '\') ';
			});
		}
	
		let client = req.db;
		let stmt, query;
		async.waterfall([
			// first, get total count for query
			function (done) {
				query = 'select count(*) as COUNT from data_set where contains (*, ?, FUZZY(0.7)) ';
				// if user doesn't have fouo, only return unclass data
				if (!hasFouo) {
					query += 'and CLASSIFICATION not in (\'CUI\', \'CONTROLLED UNCLASSIFIED INFORMATION\') ';
				}
				if (filterStmt)  {
					query += filterStmt;
				}
				
				stmt = client.prepare(query);
				stmt.exec(['%'+val+'%'], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].COUNT);
				});	
				
			},
			// next, execute the query
			function (count, done) {
				// search all columns in the data card table for the user provided value
				query = 'select * from data_set d where contains (*, ?, FUZZY(0.7)) ';
				// if user doesn't have fouo only return unclass data
				if (!hasFouo) {
					query += 'and CLASSIFICATION not in (\'CUI\', \'CONTROLLED UNCLASSIFIED INFORMATION\') ';
				}
				if (filterStmt)  {
					query += filterStmt;
				}

				query += ' order by LAST_MOD_DATE desc ';
				// add limit and offset for paging
				query += 'limit ? offset ?';  

				stmt = client.prepare(query);
				stmt.exec(['%'+val+'%', limit, offset], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {total: count, limit: limit, offset: offset, results: rows});
				});
				
			},
			// return the complete result
			function (result, done) {
				client.close();
				client.end();
				res.json({
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

	app.post("/saveManifestRow", (req, res) => {
		let manifestRow = req.body.manifestRow;
		let userid = req.user.id;		
		let client = req.db;
		let stmt = client.prepare("upsert DATA_SET (DATA_SET_ID, DATA_CARD_ID, NAME, SOURCE, DESCRIPTION, " +
			"PRIME_CATEGORY, SUB_CATEGORY, ACCESS_TYPE, LOAD_STATUS, LOAD_FREQUENCY, DATANODE_PATH, CLASSIFICATION, DATA_CARD_STATUS, LAST_MOD_BY, LAST_MOD_DATE) values " +
			"(?,?,?,?,?,?,?,?,?,?,?,?,?,?, CURRENT_TIMESTAMP) where DATA_SET_ID = ?");
		stmt.exec([manifestRow.DATA_SET_ID, manifestRow.DATA_CARD_ID, manifestRow.NAME, manifestRow.SOURCE, manifestRow.DESCRIPTION, 
					manifestRow.PRIME_CATEGORY, manifestRow.SUB_CATEGORY, manifestRow.ACCESS_TYPE, manifestRow.LOAD_STATUS, manifestRow.LOAD_FREQUENCY, manifestRow.DATANODE_PATH, 
					manifestRow.CLASSIFICATION, manifestRow.DATA_CARD_STATUS, userid, manifestRow.DATA_SET_ID], function (err, rows) {
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
	
	app.get("/deleteManifestRow", (req, res) => {
		let id = req.query.id;		
		let client = req.db;
		let stmt = client.prepare("delete from DATA_SET where DATA_SET_ID = ?");
		stmt.exec([id], function (err, rows) {
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
	
	app.get("/exportManifestAsJson", (req, res) => {
		let isAdmin = req.authInfo.checkScope('$XSAPPNAME.admin');	
		let client = req.db;
		// the NON_ADMIN view hides the S3 path, path and connection id columns from non-admin users
		let query = (isAdmin) ? 'select * from DATA_SET' : 'select * from V_DATA_SET_NON_ADMIN';
		let stmt = client.prepare(query);
		stmt.exec([], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.setHeader('Content-Type', 'application/json');
				res.setHeader('Content-disposition', 'attachment; filename=\"DataSetManifest.json' + '\"');
				res.json(rows);
			}
		});
	});
	
	app.get("/exportManifestAsCsv", (req, res) => {
		let isAdmin = req.authInfo.checkScope('$XSAPPNAME.admin');	
		let client = req.db;
		// the NON_ADMIN view hides the S3 path, path and connection id columns from non-admin users
		let query = (isAdmin) ? 'select * from DATA_SET' : 'select * from V_DATA_SET_NON_ADMIN';
		let stmt = client.prepare(query);
		stmt.exec([], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.setHeader('Content-Type', 'text/csv');
            	res.setHeader('Content-disposition', 'attachment; filename=\"DataSetManifest.csv' + '\"');
				var csv = parse(rows);
	            res.send(csv);
			}
		});
	});

	app.get("/getRejectedNotifications", (req, res) => {
		let userid = req.user.id;	
		let client = req.db;
		let stmt = client.prepare('select card_name, card_id, w.icon, wf_name, created_by, action_timestamp from workflow_instance wi ' +
					'inner join workflow w on wi.wf_id = w.wf_id ' +
					'inner join workflow_instance_state s on wi.wf_instance_id = s.wf_instance_id ' +
					'where CREATED_BY = ? and ACTION_TAKEN = \'REJECTED\' ' +
					'and card_id not in (select object_id from audit_log where userid = ? and action = \'VIEW\') ' +
					'order by ASSIGNED_TIMESTAMP desc');
		stmt.exec([userid, userid], function (err, rows) {
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
	
	app.get("/getDownloadsByUser", (req, res) => {
		let userid = req.user.id;	
		let client = req.db;
		let stmt = client.prepare('select a.*, d.NAME from USER_DOWNLOAD a inner join DATA_SET d on a.DATA_SET_ID = d.DATA_SET_ID where username = ? order by CREATE_TIME desc');
		stmt.exec([userid], function (err, rows) {
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
	
	app.get("/getApproverNotifications", (req, res) => {
		let userid = req.user.id;	
		let approverType = req.query.approverType;

		let client = req.db;
		let stmt = client.prepare('select p.ASSIGNED_TIMESTAMP, card_name, card_id, w.icon, wf_name, created_by from V_MARINA_WORKFLOW_INSTANCE_IN_PROGRESS p ' +
					'inner join workflow_instance wi on p.wf_instance_id = wi.wf_instance_id ' +
					'inner join workflow w on wi.wf_id = w.wf_id  ' +
					'where APPROVER_ROLE = ? and card_id not in ' +
					'(select object_id from audit_log where userid = ? and action = \'VIEW\') ' +
					'order by ASSIGNED_TIMESTAMP desc');
		stmt.exec([approverType, userid], function (err, rows) {
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
	
	app.get("/downloadDataSet", (req, res) => {
		let downloadId = req.query.id;	
		let client = req.db;
		let pstmt;
		async.waterfall([
			// first, update the download_time in the user_download table
			function (done) {
				pstmt = client.prepare('update USER_DOWNLOAD set DOWNLOAD_TIME = CURRENT_TIMESTAMP, MESSAGE = \'Downloaded\' where ID = ?');
				pstmt.exec([downloadId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					
					done(null, rows);
				});
			},
			// next, start the download from the s3 bucket
			function (result, done) {
				// get the filename from the user_download table
				pstmt = client.prepare('select DETAIL from USER_DOWNLOAD where ID = ?');
				pstmt.exec([downloadId], function (err, rows) {
					if (err) {
						res.send({
							status: 401,
							message: "ERR",
							data: err
						});
					}
				
					// read the file from the bucket and send back to client
					let file = rows[0].DETAIL;
					let fileName = file.substring(file.lastIndexOf("/")+1);
					client.close();
					client.end();
					
					let s3 = new AWS.S3();
					let options = {
						Bucket: s3Config.MARINA_BUCKET,
						Key: file
					}
					s3.getObject(options, function(err, data)  {
						if (err)  {
							res.attachment("error.json");
							res.send({"error": err});
						}
						else  {
							res.attachment(fileName);
							res.send(data.Body);
						}
					});
				});
			}
		], function (err) {
			//if (err) throw new Error(err);
			if (err) {
				res.send({
					status: 401,
					message: "ERR",
					data: err
				});	
			}
		});
		
	});

	app.get("/removeDownload", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('delete from USER_DOWNLOAD where ID = ?');
		stmt.exec([id], function (err, rows) {
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
	
	app.get("/updateUserSubscriptions", (req, res) => {
		let datasetId = req.query.id;
		let userid = req.user.id;
		let client = req.db;
		let stmt = client.prepare('update DATA_SET_SUBSCRIBE set LAST_CHECKED_TIMESTAMP = CURRENT_TIMESTAMP where USERID = ? and DATA_SET_ID = ?');
		stmt.exec([userid, datasetId], function (err, rows) {
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
	
	app.get("/getDataSetById", (req, res) => {
		let id = req.query.id;
		let val = req.query.val;
		let userid = req.user.id;
		let client = req.db;
		let stmt;
		async.waterfall([
			// first, retrieve the data set metadata
			function (done) {
				stmt = client.prepare('select * from data_set where data_set_id = ?');
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0])
				});
			},
			// next, retreive files for the data set
			function (dataSet, done) {
				var query = 'select *, \'0\' as SEARCH_MATCHES from data_file where data_set_id = ?';
				var params = [id];
				if (val && val.length>0)  {
					query = 'SELECT (SELECT count(*) FROM V_TA_TABLE v WHERE data_set_id = ? AND CONTAINS(TA_TOKEN, ?, FUZZY(0.7)) AND f.DATA_FILE_ID = v.data_file_id ) AS SEARCH_MATCHES, f.* ' +
							'FROM data_file f WHERE DATA_SET_ID = ?';
					params = [id, '%'+val+'%', id];
				}
				
				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					if (dataSet)  {
						dataSet.FILES = {total: rows.length, results: rows};
					}
					done(null, dataSet);
				});
			},
			// next, retreive data card info
			function (dataSet, done) {
				stmt = client.prepare('select * from DATA_CARD where DATA_CARD_ID = ?');
				stmt.exec([dataSet.DATA_CARD_ID], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					if (dataSet)  {
						if (rows.length>0)  {
							dataSet.dataCard = rows[0];
						}
						else  {
							dataSet.dataCard = {};
						}
					}
					done(null, dataSet);
				});
			},
			// determine if user is subscribed to the dataset
			function (dataSet, done) {
				stmt = client.prepare('select count(*) as TOTAL from DATA_SET_SUBSCRIBE where USERID = ? and DATA_SET_ID = ?');
				stmt.exec([userid, id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					if (dataSet)  {
						if (rows.length>0)  {
							dataSet.IS_SUBSCRIBED = (rows[0].TOTAL > 0) ? true : false;
						}
						else  {
							dataSet.IS_SUBSCRIBED = false;
						}
					}
					done(null, dataSet);
				});
			},
			// get current workflow state
			function (dataSet, done) {
				stmt = client.prepare('SELECT STATE_NAME, STATE_ID FROM WORKFLOW_STATE wf WHERE STATE_ID = (SELECT STATE_ID FROM WORKFLOW_INSTANCE_STATE wis ' +
					'INNER JOIN WORKFLOW_INSTANCE wi ON wis.WF_INSTANCE_ID = wi.WF_INSTANCE_ID WHERE CARD_ID = ? AND action_taken IS null)');
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}

					if (rows[0]) {
						dataSet.dataCard.CURRENT_STATE = rows[0].STATE_NAME;
						dataSet.dataCard.CURRENT_STATE_ID = rows[0].STATE_ID;
					} else {
						dataSet.dataCard.CURRENT_STATE = null;
						dataSet.dataCard.CURRENT_STATE_ID = null;
					}

					done(null, dataSet);
				});
			},

			// get last action executed
			function (dataSet, done) {
				stmt = client.prepare('SELECT ACTION_TAKEN FROM WORKFLOW_INSTANCE_STATE wis INNER JOIN WORKFLOW_INSTANCE wi ' +
					'ON wis.WF_INSTANCE_ID = wi.WF_INSTANCE_ID ' +
					'WHERE CARD_ID = ? and ACTION_TIMESTAMP = (SELECT max(ACTION_TIMESTAMP) FROM WORKFLOW_INSTANCE_STATE wis ' +
					'INNER JOIN WORKFLOW_INSTANCE wi ON wis.WF_INSTANCE_ID = wi.WF_INSTANCE_ID WHERE CARD_ID = ?)');
				stmt.exec([id,id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					if (rows[0]) {
						dataSet.dataCard.ACTION_TAKEN = rows[0].ACTION_TAKEN;
					} else {
						dataSet.dataCard.ACTION_TAKEN = null;
					}

					done(null, dataSet)
				});
			},
			// return the complete result
			function (result, done) {
				client.close();
				client.end();
				res.json({
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
	
	app.get("/getDataSetFileCounts", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('select file_type, count(*) as COUNT from data_file where data_set_id = ? group by file_type');
		stmt.exec([id], function (err, rows) {
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

	app.get("/isSubscribed", (req, res) => {
		let id = req.query.id;
		let userid = req.user.id;
		let client = req.db;
		let stmt = client.prepare('select count(*) as TOTAL from DATA_SET_SUBSCRIBE where USERID = ? and DATA_SET_ID = ?');
		stmt.exec([userid, id], function (err, rows) {
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
					data: (rows[0].TOTAL > 0) ? true : false
				});
			}
		});
	});	

	app.get("/getDataFileColumns", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('select * from DATA_DICTIONARY where DATA_FILE_ID = ? order by RRC');
		stmt.exec([id], function (err, rows) {
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
	
	app.get("/getDataFileHistory", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('select * from DATA_FILE where DATA_FILE_ID = ? order by LAST_MOD_DATE desc');
		stmt.exec([id], function (err, rows) {
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
	
	app.get("/getFileColTypeCounts", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('select ctype, count(*) as COUNT from data_dictionary where data_file_id = ? group by ctype');
		stmt.exec([id], function (err, rows) {
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
	
	app.get("/getDataPreview", (req, resp) => {
		let fileId = req.query.id;
		let client = req.db;

		request.get(diAuthOptions, (err, res, body) => {
			if (err)  {
				resp.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			if (res.headers["set-cookie"])  {
				var cookie = JSON.stringify(res.headers["set-cookie"]);
				var token = cookie.substring(cookie.indexOf("Bearer"), cookie.lastIndexOf("\\\""));
				const previewOpts = {
					url: 'https://' + diConfig.host + ':' + diConfig.port + '/app/pipeline-modeler/openapi/service/marina/preview/v1/',
				    rejectUnauthorized: false,
					body: JSON.stringify({'DFID': fileId, 'ROWCNT': '50'}),
					headers:  {
						'Authorization': token
					}
				};
				request.post(previewOpts, (error, response) => {
					if (error)  {
						resp.json({
							status: 401,
							message: "ERR",
							data: error
						});
					}
					if (response.body.includes("Illegal URL request path"))  {
						resp.json({
							status: 401,
							message: "ERR",
							data: "DI Endpoint not available."
						});
					}
					else  {
						resp.json({
							status: 200,
							message: "OK",
							data: response.body
						});
					}
				});
			}
			else  {
				resp.json({
					status: 401,
					message: "ERR",
					data: "Authentication token not available."
				});	
			}
		});
	});

	app.get("/subscribeDataSet", (req, res) => {
		let id = req.query.id;
		let userid = req.user.id;
		
		let client = req.db;
		let stmt = client.prepare('insert into DATA_SET_SUBSCRIBE values (?,?, CURRENT_TIMESTAMP)');
		stmt.exec([userid, id], function (err, rows) {
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
					data: "Unscribe"
				});
			}
		});
	});
	
	app.get("/unsubscribeDataSet", (req, res) => {
		let id = req.query.id;
		let userid = req.user.id;
		
		let client = req.db;
		let stmt = client.prepare('delete from DATA_SET_SUBSCRIBE where USERID = ? and DATA_SET_ID = ?');
		stmt.exec([userid, id], function (err, rows) {
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
					data: "Subscribe"
				});
			}
		});
	});
	
	app.get("/setFileExportable", (req, res) => {
		let dataFileId = req.query.dataFileId;
		let exportable = (req.query.exportable === 'Y' || req.query.exportable === '') ? 'N' : 'Y';
		
		let client = req.db;
		let stmt = client.prepare('update data_file set exportable = ? where DATA_FILE_ID = ?');
		stmt.exec([exportable, dataFileId], function (err, rows) {
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
					data: {exportable: exportable}
				});
			}
		});
	});
	
	app.get("/initDownload", (req, resp) => {
		let datasetId = req.query.datasetId;
		let fileIds = req.query.fileIds;
		let userid = req.user.id;
	
		request.get(diAuthOptions, (err, res, body) => {
			if (err)  {
				resp.json({
					status: 401,
					message: "ERR",
					data: 'Auth Error: ' + err
				});
			}
			if (res.headers["set-cookie"])  {
				var cookie = JSON.stringify(res.headers["set-cookie"]);
				var token = cookie.substring(cookie.indexOf("Bearer"), cookie.lastIndexOf("\\\""));
	
				// create the body object and check if user selected files for download.  if no files selected, all files will be downloaded
				var downloadBody = {
					'dsid': datasetId,
					'user.name': userid
				};
				if (fileIds && fileIds.length > 0)  {
					downloadBody.dfid = fileIds.split(",");
				}
	
				const downloadOpts = {
					url: 'https://' + diConfig.host + ':' + diConfig.port + '/app/pipeline-modeler/openapi/service/marina/download/v1/',
				    rejectUnauthorized: false,
					body: JSON.stringify(downloadBody),
					headers:  {
						'Authorization': token
					},
					encoding: null,
					timeout: 0
				};
				
				request.post(downloadOpts, (error, response) => {
					if (error)  {
						resp.json({
							status: 401,
							message: "ERR",
							data: error
						});
					}
					else  {
						resp.json({
							status: 200,
							message: "OK",
							data: response
						});	
					}
				});
	
			}
			else  {
				resp.json({
					status: 401,
					message: "ERR",
					data: "Authentication token not available."
				});	
			}
		});
	});

	app.get("/getDownloadsCount", (req, res) => {
		let userid = req.user.id;
		
		let client = req.db;
		let stmt = client.prepare('select count(*) as TOTAL from USER_DOWNLOAD where username = ? and DOWNLOAD_TIME is null');
		stmt.exec([userid], function (err, rows) {
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
					data: rows[0].TOTAL
				});
			}
		});
	});

	app.get("/searchDataCards", (req, res) => {
		let hasFouo = req.authInfo.checkScope('$XSAPPNAME.cui');
		let val = (req.query.val) ? req.query.val : '';
		let limit = (req.query.limit) ? req.query.limit : 50;
		let offset = (req.query.offset) ? req.query.offset : 0;
	
		let client = req.db;
		let stmt, query;
		async.waterfall([
			// first, get total count for query
			function (done) {
				query = 'select count(*) as COUNT from DATA_CARD where is_approved = 1 and contains (*, ?, FUZZY(0.7)) '
				if (!hasFouo) {
					query += 'and CLASSIFICATION not in (\'CUI\', \'CONTROLLED UNCLASSIFIED INFORMATION\') ';
				}

				stmt = client.prepare(query);
				stmt.exec(['%'+val+'%'], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].COUNT);
				});
			},
			// next, execute the query
			function (count, done) {
				// search all columns in the data card table for the user provided value
				query = 'select DATA_CARD_ID, DATA_PREVIEW_TABLE, IFNULL(LAST_UPDATED_TIMESTAMP, CREATION_TIMESTAMP) as LAST_UPDATED_TIMESTAMP, DATASET_SUMMARY, DATASET_NAME from DATA_CARD where is_approved = 1 and contains (*, ?, FUZZY(0.7)) ';
				// if user doesn't have fouo only return unclass data
				if (!hasFouo) {
					query += 'and CLASSIFICATION not in (\'CUI\', \'CONTROLLED UNCLASSIFIED INFORMATION\') ';
				}
				query += ' order by LAST_UPDATED_TIMESTAMP desc ';
				// add limit and offset for paging
				query += 'limit ? offset ?';

				stmt = client.prepare(query);
				stmt.exec(['%'+val+'%', limit, offset], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {total: count, limit: limit, offset: offset, results: rows});
				});
			},
			// return the complete result
			function (result, done) {
				client.close();
				client.end();
				res.json({
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

	app.get("/getDataCardById", (req, res) => {
		let id = req.query.id;		
		let client = req.db;
		let stmt;
		async.waterfall([
			// card data
			function (done) {
				stmt = client.prepare('select * from DATA_CARD where DATA_CARD_ID = ?');
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0]);
				});
			},

			// get linked data sets
			function (card, done) {
				stmt = client.prepare('SELECT DATA_SET_ID, NAME, DATANODE_PATH, CLASSIFICATION, LAST_MOD_DATE from DATA_SET where DATA_CARD_ID = ?');
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					card.DATA_SET = rows[0];
					done(null, card);
				});
			},

			// get current workflow state
			function (card, done) {
				stmt = client.prepare('SELECT STATE_NAME, STATE_ID FROM WORKFLOW_STATE wf WHERE STATE_ID = (SELECT STATE_ID FROM WORKFLOW_INSTANCE_STATE wis ' +
					'INNER JOIN WORKFLOW_INSTANCE wi ON wis.WF_INSTANCE_ID = wi.WF_INSTANCE_ID WHERE CARD_ID = ? AND action_taken IS null)');
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}

					if (rows[0]) {
						card.CURRENT_STATE = rows[0].STATE_NAME;
						card.CURRENT_STATE_ID = rows[0].STATE_ID;
					} else {
						card.CURRENT_STATE = null;
						card.CURRENT_STATE_ID = null;
					}

					done(null, card);
				});
			},

			// get last action executed
			function (card, done) {
				stmt = client.prepare('SELECT ACTION_TAKEN FROM WORKFLOW_INSTANCE_STATE wis INNER JOIN WORKFLOW_INSTANCE wi ' +
					'ON wis.WF_INSTANCE_ID = wi.WF_INSTANCE_ID ' +
					'WHERE CARD_ID = ? and ACTION_TIMESTAMP = (SELECT max(ACTION_TIMESTAMP) FROM WORKFLOW_INSTANCE_STATE wis ' +
					'INNER JOIN WORKFLOW_INSTANCE wi ON wis.WF_INSTANCE_ID = wi.WF_INSTANCE_ID WHERE CARD_ID = ?)');
				stmt.exec([id,id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					if (rows[0]) {
						card.ACTION_TAKEN = rows[0].ACTION_TAKEN;
					} else {
						card.ACTION_TAKEN = null;
					}

					done(null, card)
				});
			},

			// return the complete result
			function (result, done) {
				client.close();
				client.end();
				res.send({
					status: 200,
					messag:"OK",
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

	app.get("/getCardWorkflow", (req, res) => {
		let cardId = req.query.cardId;
		let client = req.db;
		let stmt;
		async.waterfall([
			// get max lane_id for the wf instance
			function (done) {
				stmt = client.prepare('select max(LANE_ID) as LANE_ID from WORKFLOW_INSTANCE_STATE s ' +
						'INNER JOIN WORKFLOW_INSTANCE i on s.WF_INSTANCE_ID = i.WF_INSTANCE_ID ' +
						'where card_id = ?');
				stmt.exec([cardId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].LANE_ID)
				});
			},
			// get the workflow items that are completed/in progress
			function (laneId, done) {
				stmt = client.prepare('SELECT DISTINCT s.STATE_ID, STATE_NAME, wfis.LANE_ID as LANE_ID, ICON, ACTION_TAKEN, ACTION_TIMESTAMP, ' +
					'ACTION_APPROVER, ASSIGNED_TIMESTAMP, ACTION_COMMENTS ' +
					'FROM WORKFLOW_STATE s INNER JOIN WORKFLOW_INSTANCE w ON w.WF_ID = s.WF_ID ' +
					'INNER JOIN WORKFLOW_INSTANCE_STATE wfis ON w.WF_INSTANCE_ID = wfis.WF_INSTANCE_ID ' +
					'WHERE w.CARD_ID = ? AND wfis.STATE_ID  = s.STATE_ID order by LANE_ID');
				stmt.exec([cardId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {objs: rows, laneId: laneId})
				});
			},				
			// get the workflow items that are remaining
			function (obj, done) {
				stmt = client.prepare('select STATE_ID, STATE_NAME, ?+row_number() over() as LANE_ID, ICON, null, null, null, null, null ' +
					'from WORKFLOW_STATE where STATE_ORDER > (select STATE_ORDER from ' +
					'WORKFLOW_STATE s where STATE_ID = ?) ' +
					'and wf_id = (select wf_id from workflow_instance where card_id = ?)');
				stmt.exec([obj.laneId, obj.objs[obj.objs.length-1].STATE_ID, cardId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					
					done(null, obj.objs.concat(rows))
				});
			},					
			// return the complete result
			function (result, done) {
				client.close();
				client.end();
				res.json({
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

	app.get("/getUnlinkedDataSets", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select DATA_SET_ID, NAME, DESCRIPTION, CLASSIFICATION from DATA_SET where DATA_CARD_ID is null or DATA_CARD_ID = \'\' order by NAME');
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
	
	app.get("/linkDataSet", (req, res) => {
		let dataSetId = req.query.dataSetId;
		let dataCardId = req.query.dataCardId;
		let client = req.db;
		var stmt;
		async.waterfall([
			// first unlink if it's already linked
			function (done) {
				stmt = client.prepare('update DATA_SET set DATA_CARD_ID = null where DATA_CARD_ID = ?');
				stmt.exec([dataCardId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows)
				});
			},
			// now link to recently selected data set
			function (obj, done) {
				stmt = client.prepare('update DATA_SET set DATA_CARD_ID = ? where DATA_SET_ID = ?');
				stmt.exec([dataCardId, dataSetId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					
					done(null, rows)
				});
			},					
			// return the complete result
			function (result, done) {
				client.close();
				client.end();
				res.json({
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

	app.get("/exportDataCardAsJson", (req, res) => {
		let cardId = req.query.cardId;
		let client = req.db;
		let stmt = client.prepare('select * from DATA_CARD where DATA_CARD_ID = ?');
		stmt.exec([cardId], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				let card = rows[0];
				res.setHeader('Content-Type', 'application/json');
				res.setHeader('Content-disposition', 'attachment; filename=\"' + card.DATASET_NAME + '.json' + '\"');
				res.json(card);
			}
		});
	});
	
	app.get("/exportDataCardAsCsv", (req, res) => {
		let cardId = req.query.cardId;
		let client = req.db;
		let stmt = client.prepare('select * from DATA_CARD where DATA_CARD_ID = ?');
		stmt.exec([cardId], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.setHeader('Content-Type', 'text/csv');
            	res.setHeader('Content-disposition', 'attachment; filename=\"' + rows[0].DATASET_NAME + '.csv' + '\"');
				let csv = parse(rows);
            	res.send(csv);
			}
		});
	});

	app.get("/getAudit", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('select * from AUDIT_LOG where OBJECT_ID = ? order by ACTION_TIMESTAMP desc');
		stmt.exec([id], function (err, rows) {
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
	
	app.get("/exportAuditAsJson", (req, res) => {
		let id = req.query.id;
		let cardName = req.query.cardName;
		let client = req.db;
		let stmt = client.prepare('select * from AUDIT_LOG where OBJECT_ID = ? order by ACTION_TIMESTAMP desc');
		stmt.exec([id], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.setHeader('Content-Type', 'application/json');
				res.setHeader('Content-disposition', 'attachment; filename=\"Usage ' + cardName + '.json' + '\"');
				res.json(rows);
			}
		});
	});
	
	app.get("/exportAuditAsCsv", (req, res) => {
		let id = req.query.id;
		let cardName = req.query.cardName;
		let client = req.db;
		let stmt = client.prepare('select * from AUDIT_LOG where OBJECT_ID = ? order by ACTION_TIMESTAMP desc');
		stmt.exec([id], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				res.setHeader('Content-Type', 'text/csv');
            	res.setHeader('Content-disposition', 'attachment; filename=\"Usage ' + cardName + '.csv' + '\"');
				let csv = parse(rows);
	            res.send(csv);
			}
		});
	});
	
	app.post("/saveDataCard", (req, res) => {
		let dataCard = req.body.dataCard;
		let userid = req.user.id;
		let currentTimestamp = (dataCard.CREATION_TIMESTAMP) ? "'" + new Date(dataCard.CREATION_TIMESTAMP).toISOString().slice(0, 19).replace('T', ' ') + "'" : "CURRENT_TIMESTAMP";

		let client = req.db;
		let stmt = client.prepare("upsert DATA_CARD (DATA_CARD_ID, DATASET_NAME, DATASET_SUMMARY, PRIMARY_POC_NAME, PRIMARY_POC_EMAIL, PRIMARY_POC_PHONE, EXTIMATED_SIZE_GB, ESTIMATED_SIZE_OTHER, " +
			"INDUSTRY_TYPE, INDUSTRY_TYPE_OTHER, KEY_APPLICATION, KEY_APPLICATION_OTHER, INTENDED_USE_CASE, PRIMARY_DATA_TYPE, PRIMARY_DATA_TYPE_OTHER, DATASET_FUNCTION, DATASET_FUNCTION_OTHER, DATASET_METADATA_TOTAL_INSTANCES, DATASET_METADATA_TOTAL_CLASSES, " +
			"DATASET_METADATA_TOTAL_LABELS, DATASET_METADATA_ALGORITM_GEN, DATASET_METADATA_USER_CONTRIBUTED, DATASET_METADATA_HUMAN_VERIFIED_LABEL, CONTENT_NATURE, EXCLUDED_DATA, " +
			"PRIVACY_PII, IS_PRIVACY_PII, CLASSIFICATION, LAST_MOD_DATELICENSE_TYPE, LICENSE_VERSION, LICENSE_STATUS, ACCESS_COST, DATA_COLLECTION_METHOD, SAMPLING_METHODS, SAMPLING_METHODS_OTHER, DATA_DISTRIBUTION, " +
			"FILTERING_CRITERIA, LABELING_METHODS, LABELING_METHODS_OTHER, LABEL_TYPES_HUMAN, LABEL_TYPES_ALGORITHM, LABEL_SOURCE_HUMAN, LABEL_SOURCE_ALGORITHM, LABEL_PROCEDURE_HUMAN, LABEL_PROCEDURE_ALGORITHM, " +
			"VALIDATION_METHOD, VALIDATION_METHODS_OTHER, VALIDATION_TASKS, VALIDATION_DESCRIPTION, VALIDATION_POLICY_SUMMARY, LICENSE_TYPE, LICENSE_SUMMARY, PUBLISHER_NAME, SOURCE_NAME, DATA_SELECTION, WF_ID, " +
			"IS_APPROVED, STATUTORY_AUTHORIZATION, COLLECTION_MECHANISM, DATA_MINIMIZATION, PRIVACY_RISK, ETHICS_RISK, CLOUD, CLOUD_OTHER, DATA_INTEGRATOR_CARD_ID, MAXIMUM_FILE_SIZE_GB, MAXIMUM_FILE_SIZE_OTHER, " +
			"JCF_DATA_SOURCE_DMZ, JCF_DATA_TARGET_CLEAN, TRANS_SPECIAL_REQUESTS, CREATION_USERID, CREATION_TIMESTAMP, LAST_UPDATED_BY, LAST_UPDATED_TIMESTAMP) values " +
			"(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, " +
			currentTimestamp + ", '" + userid + "', CURRENT_TIMESTAMP) where DATA_CARD_ID = '" + dataCard.DATA_CARD_ID +
			"' ");
		stmt.exec([dataCard.DATA_CARD_ID, dataCard.DATASET_NAME, dataCard.DATASET_SUMMARY, dataCard.PRIMARY_POC_NAME, dataCard.PRIMARY_POC_EMAIL,
			dataCard.PRIMARY_POC_PHONE, dataCard.EXTIMATED_SIZE_GB, dataCard.ESTIMATED_SIZE_OTHER,
			dataCard.INDUSTRY_TYPE, dataCard.INDUSTRY_TYPE_OTHER, dataCard.KEY_APPLICATION, dataCard.KEY_APPLICATION_OTHER, dataCard.INTENDED_USE_CASE, dataCard.PRIMARY_DATA_TYPE, dataCard.PRIMARY_DATA_TYPE_OTHER, 
			(dataCard.DATASET_FUNCTION) ? dataCard.DATASET_FUNCTION.toString() : null, dataCard.DATASET_FUNCTION_OTHER, dataCard.DATASET_METADATA_TOTAL_INSTANCES,
			dataCard.DATASET_METADATA_TOTAL_CLASSES, dataCard.DATASET_METADATA_TOTAL_LABELS, dataCard.DATASET_METADATA_ALGORITM_GEN, dataCard.DATASET_METADATA_USER_CONTRIBUTED,
			dataCard.DATASET_METADATA_HUMAN_VERIFIED_LABEL, dataCard.CONTENT_NATURE, dataCard.EXCLUDED_DATA, dataCard.PRIVACY_PII, dataCard.IS_PRIVACY_PII, dataCard.CLASSIFICATION,
			dataCard.LAST_MOD_DATELICENSE_TYPE, dataCard.LICENSE_VERSION, dataCard.LICENSE_STATUS, dataCard.ACCESS_COST, dataCard.DATA_COLLECTION_METHOD, 
			(dataCard.SAMPLING_METHODS) ? dataCard.SAMPLING_METHODS.toString() : null, 	dataCard.SAMPLING_METHODS_OTHER, dataCard.DATA_DISTRIBUTION,
			dataCard.FILTERING_CRITERIA, (dataCard.LABELING_METHODS) ? dataCard.LABELING_METHODS.toString() : null,  dataCard.LABELING_METHODS_OTHER, dataCard.LABEL_TYPES_HUMAN, 
			dataCard.LABEL_TYPES_ALGORITHM, 
			dataCard.LABEL_SOURCE_HUMAN, dataCard.LABEL_SOURCE_ALGORITHM, dataCard.LABEL_PROCEDURE_HUMAN, dataCard.LABEL_PROCEDURE_ALGORITHM, 
			(dataCard.VALIDATION_METHOD) ? dataCard.VALIDATION_METHOD.toString() : null, dataCard.VALIDATION_METHODS_OTHER, dataCard.VALIDATION_TASKS,
			dataCard.VALIDATION_DESCRIPTION, dataCard.VALIDATION_POLICY_SUMMARY, dataCard.LICENSE_TYPE, dataCard.LICENSE_SUMMARY, dataCard.PUBLISHER_NAME, 
			dataCard.SOURCE_NAME, dataCard.DATA_SELECTION, dataCard.WF_ID, dataCard.IS_APPROVED, dataCard.STATUTORY_AUTHORIZATION, dataCard.COLLECTION_MECHANISM, 
			dataCard.DATA_MINIMIZATION, dataCard.PRIVACY_RISK, dataCard.ETHICS_RISK, dataCard.CLOUD, dataCard.CLOUD_OTHER, dataCard.DATA_INTEGRATOR_CARD_ID, 
			dataCard.MAXIMUM_FILE_SIZE_GB, dataCard.MAXIMUM_FILE_SIZE_OTHER, dataCard.JCF_DATA_SOURCE_DMZ, dataCard.JCF_DATA_TARGET_CLEAN, dataCard.TRANS_SPECIAL_REQUESTS,
			((dataCard.CREATION_USERID) ? dataCard.CREATION_USERID : userid)], function (err, rows) {
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

	app.get("/deleteDataCard", (req, res) => {
		let cardId = req.query.cardId;
		let client = req.db;
		let stmt;
		async.waterfall([
			// first, delete from data_card table
			function (done) {
				stmt = client.prepare('delete from DATA_CARD where DATA_CARD_ID= ?');
				stmt.exec([cardId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, "");
				});
			},
			// next, get the wf_instance_id
			function (val, done) {
				stmt = client.prepare('select WF_INSTANCE_ID from WORKFLOW_INSTANCE where CARD_ID = ?');
				stmt.exec([cardId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, (rows.length > 0) ? rows[0].WF_INSTANCE_ID : null);
				});
			},
			// delete from the wf_state_instance table
			function (wfInstanceId, done) {
				if (wfInstanceId)  {
					stmt = client.prepare('delete from WORKFLOW_INSTANCE_STATE where WF_INSTANCE_ID = ?');
					stmt.exec([wfInstanceId], function (err, rows) {
						if (err) {
							console.log(err);
							return next(err);
						}
						done(null, wfInstanceId);
					});
				}
				else  {
					done(null, wfInstanceId);
				}
			},
			// delete from the wf_instance table
			function (wfInstanceId, done) {
				if (wfInstanceId)  {
					stmt = client.prepare('delete from WORKFLOW_INSTANCE where WF_INSTANCE_ID = ?');
					stmt.exec([wfInstanceId], function (err, rows) {
						if (err) {
							console.log(err);
							return next(err);
						}
						done(null, wfInstanceId);
					});
				}
				else  {
					done(null, wfInstanceId);
				}
			},
			// return the complete result
			function (result, done) {
				client.close();
				client.end();
				res.json({
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
	
	
	
	app.post("/saveCollaboratePost", (req, res) => {
		let collabId = req.body.collabId;
		let objectId = req.body.objectId;
		let objectType = req.body.objectType;
		let message = req.body.message;
		let type = req.body.type;
		let refId = req.body.refId;
		let replyTo = req.body.replyTo;
		let userid = req.user.id;
		
		let params = [objectId, objectType, userid, message, type, refId, replyTo, collabId];
		let query = "upsert USER_COLLABORATE (COLLABORATE_ID, OBJECT_ID, OBJECT_TYPE, SENDER, MESSAGE, COLLABORATE_TYPE, COLLABORATE_REF_ID, REF_SENDER, MESSAGE_TIMESTAMP, LAST_MOD_TIMESTAMP) " +
					"values (SYSUUID,?,?,?,?,?,?,?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) where COLLABORATE_ID = ?";
		// if we are editing the row, don't update the MESSAGE_TIMESTAMP
		if (collabId)  {
			query = "upsert USER_COLLABORATE (COLLABORATE_ID, OBJECT_ID, OBJECT_TYPE, SENDER, MESSAGE, COLLABORATE_TYPE, COLLABORATE_REF_ID, REF_SENDER, MESSAGE_TIMESTAMP, LAST_MOD_TIMESTAMP) " +
					"values (SYSUUID,?,?,?,?,?,?,?, (select MESSAGE_TIMESTAMP from USER_COLLABORATE where COLLABORATE_ID = ?), CURRENT_TIMESTAMP) where COLLABORATE_ID = ?";
			params.push(collabId);
		}
		
		let client = req.db;
		let stmt = client.prepare(query);
		stmt.exec([params], function (err, rows) {
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

	app.get("/deleteCollaboratePost", (req, res) => {
		let id = req.query.id;

		let client = req.db;
		let stmt = client.prepare('delete from USER_COLLABORATE where COLLABORATE_ID = ?');
		stmt.exec([id], function (err, rows) {
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
	
	app.get("/getCollaboratePost", (req, res) => {
		let id = req.query.collabId;

		let client = req.db;
		let stmt = client.prepare('select * from USER_COLLABORATE where COLLABORATE_ID = ?');
		stmt.exec([id], function (err, rows) {
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
	
	app.get("/getCollaboratePosts", (req, res) => {
		let id = req.query.objectId;

		let client = req.db;
		let stmt = client.prepare('select * from USER_COLLABORATE where OBJECT_ID = ? order by (CASE WHEN COLLABORATE_REF_ID IS NULL THEN COLLABORATE_ID ELSE COLLABORATE_REF_ID END), MESSAGE_TIMESTAMP');
		stmt.exec([id], function (err, rows) {
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

	app.get("/getClassificationFilters", (req, res) => {
		let val = req.query.val;
		let filters = req.query.filters;

		let client = req.db;
		let query = "select distinct CLASSIFICATION as NAME, count(CLASSIFICATION) as TOTAL ";
		//if (filters && filters["CLASSIFICATION"])  {
		//	query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM DATA_SET d2 WHERE CLASSIFICATION IN (\'" + filters["CLASSIFICATION"].join("\',\'") + "\') AND d2.CLASSIFICATION = d.CLASSIFICATION ) AS SELECTED ";
		//}
		//else  {
		//	query += " 'false' as SELECTED ";
		//}
		query += "from DATA_SET d where contains (*, ?, FUZZY(0.7)) ";
		if (filters)  {
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by CLASSIFICATION order by count(CLASSIFICATION) desc ";

		let stmt = client.prepare(query);
		stmt.exec(['%'+val+'%'], function (err, rows) {
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
	
	app.get("/getSourceFilters", (req, res) => {
		let val = req.query.val;
		let filters = req.query.filters;

		let client = req.db;
		let query = "select distinct SOURCE as NAME, count(SOURCE) as TOTAL  ";
		//if (filters && filters["SOURCE"])  {
		//	query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM DATA_SET d2 WHERE SOURCE IN (\'" + filters["SOURCE"].join("\',\'") + "\') AND d2.SOURCE = d.SOURCE ) AS SELECTED ";
		//}
		//else  {
		//	query += " 'false' as SELECTED ";
		//}
		query += "from DATA_SET d where contains (*, ?, FUZZY(0.7)) ";
		if (filters)  {
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by SOURCE order by count(SOURCE) desc, SOURCE ";

		let stmt = client.prepare(query);
		stmt.exec(['%'+val+'%'], function (err, rows) {
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

	app.get("/getCategoryFilters", (req, res) => {
		let val = req.query.val;
		let filters = req.query.filters;

		let client = req.db;
		let query = "select distinct PRIME_CATEGORY as NAME, count(PRIME_CATEGORY) as TOTAL ";
		//if (filters && filters["PRIME_CATEGORY"])  {
		//	query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM DATA_SET d2 WHERE PRIME_CATEGORY IN (\'" + filters["PRIME_CATEGORY"].join("\',\'") + "\') AND d2.PRIME_CATEGORY = d.PRIME_CATEGORY) AS SELECTED ";
	//	}
		//else  {
		//	query += " 'false' as SELECTED ";
		//}
		query += "from DATA_SET d where contains (*, ?, FUZZY(0.7)) ";
		if (filters)  {
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by PRIME_CATEGORY order by count(PRIME_CATEGORY) desc ";

		let stmt = client.prepare(query);
		stmt.exec(['%'+val+'%'], function (err, rows) {
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

	app.get("/getLoadFreqFilters", (req, res) => {
		let val = req.query.val;
		let filters = req.query.filters;

		let client = req.db;
		let query = "select distinct LOAD_FREQUENCY as NAME, count(LOAD_FREQUENCY) as TOTAL ";
		//if (filters && filters["LOAD_FREQUENCY"])  {
		//	query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM DATA_SET d2 WHERE LOAD_FREQUENCY IN (\'" + filters["LOAD_FREQUENCY"].join("\',\'") + "\') AND d2.LOAD_FREQUENCY = d.LOAD_FREQUENCY) AS SELECTED ";
		//}
		//else  {
		//	query += " 'false' as SELECTED ";
		//}
		query += "from DATA_SET d where contains (*, ?, FUZZY(0.7)) ";
		if (filters)  {
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by LOAD_FREQUENCY order by count(LOAD_FREQUENCY) desc, LOAD_FREQUENCY ";

		let stmt = client.prepare(query);
		stmt.exec(['%'+val+'%'], function (err, rows) {
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

	app.get("/getDataSetLastModByWeek", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('SELECT TO_DATE(LAST_MOD_DATE) AS LABEL, count(*) as COUNT FROM DATA_SET WHERE LAST_MOD_DATE >= ADD_DAYS(CURRENT_DATE, -7) ' +
									'GROUP BY TO_DATE(LAST_MOD_DATE) order by TO_DATE(LAST_MOD_DATE) asc');
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

	app.get("/getDataSetLastModByMonth", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select MONTH(LAST_MOD_DATE) as LABEL, count(*) as COUNT from data_set d group by MONTH(LAST_MOD_DATE) order by MONTH(LAST_MOD_DATE) asc');
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
	
	app.get("/getDataSetLastModByYear", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select YEAR(LAST_MOD_DATE) as LABEL, count(*) as COUNT from data_set d group by YEAR(LAST_MOD_DATE) order by YEAR(LAST_MOD_DATE) asc');
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

	app.get("/getDataSetFileTypes", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('SELECT DISTINCT file_type as NAME, count(FILE_TYPE) as TOTAL FROM DATA_FILE df GROUP BY FILE_TYPE ORDER BY count(FILE_TYPE) desc, file_type');
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

	app.get("/search", (req, res) => {
		var hasFouo = req.authInfo.checkScope('$XSAPPNAME.cui');
		var val = (req.query.val) ? req.query.val : '';
		var limit = (req.query.limit) ? req.query.limit : 50;
		var offset = (req.query.offset) ? req.query.offset : 0;
		var sortBy = (req.query.sortBy) ? req.query.sortBy : "v.OBJECT_TIMESTAMP";
		var sortDir = (req.query.sortDir) ? req.query.sortDir : "desc";
		var prefix = ' where ', params = [];
		
		let client = req.db;
		let stmt, query;
		async.waterfall([
			// first, get total count for query
			function (done) {
				if (val)  {
				query = 'select count(distinct v.OBJECT_ID) as TOTAL, ' +
						'(SELECT count(DISTINCT OBJECT_ID) FROM GENERAL_SEARCH_VIEW gsv WHERE OBJECT_TYPE = \'DATASET\' AND contains ((TOKEN, NAME, DESCRIPTION), ?, FUZZY(0.7))) AS DATASET_TOTAL, ' +
						'(SELECT count(DISTINCT OBJECT_ID) FROM GENERAL_SEARCH_VIEW gsv WHERE OBJECT_TYPE = \'MODEL\' AND contains ((TOKEN, NAME, DESCRIPTION), ?, FUZZY(0.7))) AS MODEL_TOTAL, ' +
						'(SELECT count(DISTINCT OBJECT_ID) FROM GENERAL_SEARCH_VIEW gsv WHERE OBJECT_TYPE = \'IMAGERY\' AND contains ((TOKEN, NAME, DESCRIPTION), ?, FUZZY(0.7))) AS IMAGERY_TOTAL ' +
						'from GENERAL_SEARCH_VIEW v where contains ((TOKEN, NAME, DESCRIPTION), ?, FUZZY(0.7))';
					params.push(val);
					params.push(val);
					params.push(val);
					params.push(val);
					prefix = ' and ';
				}
				else  {
					query = 'select count(distinct v.OBJECT_ID) as TOTAL, ' +
						'(SELECT count(DISTINCT OBJECT_ID) FROM GENERAL_SEARCH_VIEW gsv WHERE OBJECT_TYPE = \'DATASET\') AS DATASET_TOTAL, ' +
						'(SELECT count(DISTINCT OBJECT_ID) FROM GENERAL_SEARCH_VIEW gsv WHERE OBJECT_TYPE = \'MODEL\') AS MODEL_TOTAL, ' +
						'(SELECT count(DISTINCT OBJECT_ID) FROM GENERAL_SEARCH_VIEW gsv WHERE OBJECT_TYPE = \'IMAGERY\') AS IMAGERY_TOTAL ' +
						'from GENERAL_SEARCH_VIEW v'
				}
				// if user doesn't have fouo, only return unclass data
				if (!hasFouo) {
					query = prefix + ' UPPER(v.CLASSIFICATION) not in (\'CUI\', \'CONTROLLED UNCLASSIFIED INFORMATION\') ';
					prefix = ' and ';
				}

				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					console.log(rows)
					done(null, rows);
				});	

			},
			// next, execute the query
			function (counts, done) {
				prefix = ' where ';
				params = [];
				// search all columns in the data card table for the user provided value
				query = ' select distinct OBJECT_ID, OBJECT_TYPE, CLASSIFICATION, NAME, "SOURCE", OBJECT_TIMESTAMP, DESCRIPTION from GENERAL_SEARCH_VIEW v ';
				if (val)  {
					query += prefix + ' contains ((TOKEN, NAME, DESCRIPTION), ?, FUZZY(0.7)) ';
					params.push(val)
					prefix = ' and ';
				}
				// if user doesn't have fouo, only return unclass data
				if (!hasFouo) {
					query = prefix + ' UPPER(v.CLASSIFICATION) not in (\'CUI\', \'CONTROLLED UNCLASSIFIED INFORMATION\') ';
					prefix = ' and ';
				}
				
				var groupClause = ' group by OBJECT_ID, OBJECT_TYPE, CLASSIFICATION, NAME, "SOURCE", OBJECT_TIMESTAMP, DESCRIPTION ';
				// ensure most recently updated datasets are displayed first
				groupClause += 'order by OBJECT_TIMESTAMP desc ';
				// add limit and offset for paging
				groupClause += ' limit ? offset ?'; 

				query += groupClause;
				params.push(limit);
				params.push(offset);

				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {total: counts[0].TOTAL, datasetTotal: counts[0].DATASET_TOTAL, modelTotal: counts[0].MODEL_TOTAL, imageryTotal: counts[0].IMAGERY_TOTAL, limit: limit, offset: offset, results: rows});
				});
				
			},
			// return the complete result
			function (result, done) {
				client.close();
				client.end();
				res.json({
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

	
	return app;
};