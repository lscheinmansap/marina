/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");
const async = require('async');
const request = require('request');
const { parse } = require('json2csv');

module.exports = function() {
	var app = express.Router();

	app.get("/getClassificationFilters", (req, res) => {
		let hasFouo = req.authInfo.checkScope('$XSAPPNAME.cui');
		let val = req.query.val;
		let filters = req.query.filters;

		let client = req.db;
		let query = "select distinct MODEL_CLASSIFICATION as NAME, count(MODEL_CLASSIFICATION) as TOTAL, ";
		if (filters && filters["MODEL_CLASSIFICATION"])  {
			query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM MODEL_CARD m2 WHERE MODEL_CLASSIFICATION IN (\'" + filters["MODEL_CLASSIFICATION"].join("\',\'") + "\') AND m2.MODEL_CLASSIFICATION = m.MODEL_CLASSIFICATION) AS SELECTED ";
		}
		else  {
			query += " 'false' as SELECTED ";
		}
		query += "from MODEL_CARD m where contains (*, ?, FUZZY(0.7)) and is_approved = 1 ";

		if (filters)  {
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by MODEL_CLASSIFICATION order by count(MODEL_CLASSIFICATION) desc ";

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
	
	app.get("/getModelTypeFilters", (req, res) => {
		let val = req.query.val;
		let filters = req.query.filters;

		let client = req.db;
		let query = "select distinct MODEL_TYPE as NAME, count(MODEL_TYPE) as TOTAL, ";
		if (filters && filters["MODEL_TYPE"])  {
			query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM MODEL_CARD m2 WHERE MODEL_TYPE IN (\'" + filters["MODEL_TYPE"].join("\',\'") + "\') AND m2.MODEL_TYPE = m.MODEL_TYPE) AS SELECTED ";
		}
		else  {
			query += " 'false' as SELECTED ";
		}
		query += "from MODEL_CARD m where contains (*, ?, FUZZY(0.7)) and is_approved = 1 ";
		if (filters)  {
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by MODEL_TYPE order by count(MODEL_TYPE) desc ";

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
	
	app.get("/getDeveloperFilters", (req, res) => {
		let val = req.query.val;
		let filters = req.query.filters;

		let client = req.db;
		let query = "select distinct MODEL_DEVELOPER as NAME, count(MODEL_DEVELOPER) as TOTAL, ";
		if (filters && filters["MODEL_DEVELOPER"])  {
			query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM MODEL_CARD m2 WHERE MODEL_DEVELOPER IN (\'" + filters["MODEL_DEVELOPER"].join("\',\'") + "\') AND m2.MODEL_DEVELOPER = m.MODEL_DEVELOPER) AS SELECTED ";
		}
		else  {
			query += " 'false' as SELECTED ";
		}
		query += "from MODEL_CARD m where contains (*, ?, FUZZY(0.7)) and is_approved = 1 ";
		if (filters)  {
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by MODEL_DEVELOPER order by count(MODEL_DEVELOPER) desc ";

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

	app.get("/searchModelCards", (req, res) => {
		let val = (req.query.val) ? req.query.val : '';
		let limit = (req.query.limit) ? req.query.limit : 50;
		let offset = (req.query.offset) ? req.query.offset : 0;
		let sortBy = (req.query.sortBy) ? req.query.sortBy : "m.LAST_UPDATED_TIMESTAMP";
		let sortDir = (req.query.sortDir) ? req.query.sortDir : "desc";
		let startDate = req.query.start;
		let endDate = req.query.end;
		let filters = req.query.filters;
		let filterStmt = '';

		if (filters)  {
			Object.keys(filters).forEach(function(key)  {
				var colVals = filters[key];
				filterStmt += ' and ' + key + ' in (\'' + colVals.join("\',\'") + '\') ';
			});
		}
		
		let client = req.db;
		let stmt, query;
		async.waterfall([
			// first, get total count for query
			function (done) {
				query = 'select count(*) as COUNT from MODEL_CARD m where is_approved = 1 and contains (*, ?, FUZZY(0.7)) ' + filterStmt;
				
				if (startDate)  {
					query += ' and TO_DATE(m.LAST_UPDATED_TIMESTAMP) between ? and ? ';
					stmt = client.prepare(query);
					stmt.exec(['%'+val+'%', startDate, endDate], function (err, rows) {
						if (err) {
							console.log(err);
							return next(err);
						}
						done(null, rows[0].COUNT);
					});	
					
				}
				else  {
					stmt = client.prepare(query);
					stmt.exec(['%'+val+'%'], function (err, rows) {
						if (err) {
							console.log(err);
							return next(err);
						}
						done(null, rows[0].COUNT);
					});	
				}

			},
			// next, execute the query
			function (count, done) {
				// search all columns in the model card table for the user provided value
				query = 'select m.MODEL_CARD_ID, LAST_UPDATED_TIMESTAMP as LAST_UPDATED_TIMESTAMP, MODEL_NAME, DESCRIPTION, MODEL_CLASSIFICATION, MODEL_TYPE, MODEL_DEVELOPER, ' +
						'count(DATA_SET_ID) as num_data_sets, (SELECT count(*) FROM AUDIT_LOG a WHERE OBJECT_TYPE = \'MODEL CARD\' AND ACTION = \'VIEW\' AND m.MODEL_CARD_ID = a.OBJECT_ID) AS NUM_VIEWS ' +
						'from MODEL_CARD m left outer join MODEL_CARD_DATA_SET d on m.model_card_id = d.model_card_id where is_approved = 1 and contains (*, ?, FUZZY(0.7)) ' + filterStmt;
						
				var groupClause = ' group by m.model_card_id, LAST_UPDATED_TIMESTAMP, model_name, description, model_classification, model_type, model_developer ';
				groupClause += 'order by ' + sortBy + ' ' + sortDir;
				// add limit and offset for paging
				groupClause += ' limit ? offset ?';

				if (startDate)  {
					query += ' and TO_DATE(m.LAST_UPDATED_TIMESTAMP) between ? and ? ';
					stmt = client.prepare(query + groupClause);
					stmt.exec(['%'+val+'%', startDate, endDate, limit, offset], function (err, rows) {
						if (err) {
							console.log(err);
							return next(err);
						}
						done(null, {total: count, limit: limit, offset: offset, results: rows});
					});	
					
				}
				else  {
					stmt = client.prepare(query + groupClause);
					stmt.exec(['%'+val+'%', limit, offset], function (err, rows) {
						if (err) {
							console.log(err);
							return next(err);
						}
						done(null, {total: count, limit: limit, offset: offset, results: rows});
					});	
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

	app.get("/getModelCardById", (req, res) => {
		let id = req.query.id;
		
		let client = req.db;
		let stmt;
		async.waterfall([
			// model card data
			function (done) {
				stmt = client.prepare('select * from MODEL_CARD where MODEL_CARD_ID = ? order by DEV_DATE desc');
				stmt.exec([id], function (err, rows) {
					if (err) {
						return next(err);
					}
					done(null, rows[0])
				});
			},
			// get current workflow state
			function (modelCard, done) {
				stmt = client.prepare('SELECT STATE_NAME, STATE_ID FROM WORKFLOW_STATE wf WHERE STATE_ID = (SELECT STATE_ID FROM WORKFLOW_INSTANCE_STATE wis ' +
					'INNER JOIN WORKFLOW_INSTANCE wi ON wis.WF_INSTANCE_ID = wi.WF_INSTANCE_ID WHERE CARD_ID = ? AND action_taken IS null)');
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}

					if (rows[0]) {
						modelCard.CURRENT_STATE = rows[0].STATE_NAME;
						modelCard.CURRENT_STATE_ID = rows[0].STATE_ID;
					} else {
						modelCard.CURRENT_STATE = null;
						modelCard.CURRENT_STATE_ID = null;
					}

					done(null, modelCard);
				});
			},
			// get last action executed
			function (modelCard, done) {
				stmt = client.prepare('SELECT ACTION_TAKEN FROM WORKFLOW_INSTANCE_STATE wis INNER JOIN WORKFLOW_INSTANCE wi ON wis.WF_INSTANCE_ID = wi.WF_INSTANCE_ID ' +
					'WHERE CARD_ID = ? and ACTION_TIMESTAMP = (SELECT max(ACTION_TIMESTAMP) FROM WORKFLOW_INSTANCE_STATE wis ' +
					'INNER JOIN WORKFLOW_INSTANCE wi ON wis.WF_INSTANCE_ID = wi.WF_INSTANCE_ID WHERE CARD_ID = ?)');
				stmt.exec([id, id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					if (rows[0]) {
						modelCard.ACTION_TAKEN = rows[0].ACTION_TAKEN;
					} else {
						modelCard.ACTION_TAKEN = null;
					}
					done(null, modelCard);
				});
			},
			// get linked data sets
			function (card, done) {
				stmt = client.prepare('SELECT d.DATA_SET_ID, NAME, DATANODE_PATH, URL, LAST_MOD_DATE, CLASSIFICATION from DATA_SET d inner join MODEL_CARD_DATA_SET m ' +
										'on d.DATA_SET_ID = m.DATA_SET_ID where m.MODEL_CARD_ID = ?');
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					card.DATA_SETS = rows;
					done(null, card);
				});
			},
			// get attachments
			function (card, done) {
				stmt = client.prepare('select ATTACHMENT_ID, FILE_NAME, FILE_TYPE, FILE_SIZE, UPLOAD_DATE from MODEL_CARD_ATTACHMENT where MODEL_CARD_ID = ?');
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					card.ATTACHMENTS = rows;
					done(null, card);
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

	app.get("/getModelCardAttachments", (req, res) => {
		let id = req.query.id;
		
		let client = req.db;
		let stmt = client.prepare('select ATTACHMENT_ID, FILE_NAME, FILE_TYPE, FILE_SIZE, UPLOAD_DATE from MODEL_CARD_ATTACHMENT where MODEL_CARD_ID = ?');
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
	
	app.get("/downloadModelCardAttachment", (req, res) => {
		let id = req.query.id;
		
		let client = req.db;
		let stmt = client.prepare('select FILE_NAME, FILE_TYPE, FILE_SIZE, FILE_CONTENTS_BASE64 from MODEL_CARD_ATTACHMENT where ATTACHMENT_ID = ?');
		stmt.exec([id], function (err, rows) {
			if (err) {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			else  {
				let attachment = rows[0];
				res.setHeader('Content-Type', attachment.FILE_TYPE);
				res.setHeader('Content-disposition', 'attachment; filename=\"' + attachment.FILE_NAME + '\"');
				res.send(Buffer.from(attachment.FILE_CONTENTS_BASE64.split(';base64,').pop(), "base64"));
			}
		});
	});
	
	app.get("/deleteModelCard", (req, res) => {
		let cardId = req.query.cardId;
		let client = req.db;
		let stmt;
		async.waterfall([
			// first, delete from model_card table
			function (done) {
				stmt = client.prepare('delete from MODEL_CARD where MODEL_CARD_ID= ?');
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
				res.send({
					status: 200,
					message: "OK",
					data: "success"
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
	
	app.post("/uploadModelFile", (req, res) => {
		let modelId = req.body.id;
		let fileName = req.body.name;
		let fileType = req.body.type;
		let fileSize = req.body.size;
		let fileContent = req.body.content;
		let userid = req.user.id;
		
		let client = req.db;
		let stmt = client.prepare('insert into MODEL_CARD_ATTACHMENT values (?,?,?,?,?,CURRENT_TIMESTAMP,SYSUUID,?,?)');
		stmt.exec([modelId, fileName, fileSize, fileType, userid, Buffer.from(fileContent, "base64"), fileContent], function (err, rows) {
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

	app.get("/deleteModelCardAttachment", (req, res) => {
		let id = req.query.id;
		
		let client = req.db;
		let stmt = client.prepare('delete from MODEL_CARD_ATTACHMENT where ATTACHMENT_ID = ?');
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
	
	app.get("/getDataSetsForModel", (req, res) => {
		let id = req.query.modelCardId;
		
		let client = req.db;
		let stmt = client.prepare('select d.DATA_SET_ID, NAME, DESCRIPTION, CLASSIFICATION from DATA_SET d left outer join MODEL_CARD_DATA_SET m ' +
					'on d.DATA_SET_ID = m.DATA_SET_ID where d.DATA_SET_ID not in (select DATA_SET_ID from MODEL_CARD_DATA_SET where MODEL_CARD_ID = ?)');
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

	app.get("/getModelDataSetCategories", (req, res) => {
		let id = req.query.id;
		
		let client = req.db;
		let stmt = client.prepare('SELECT PRIME_CATEGORY, count(PRIME_CATEGORY) AS COUNT FROM DATA_SET ds INNER JOIN MODEL_CARD_DATA_SET mcds ON ds.DATA_SET_ID = mcds.DATA_SET_ID ' +
									'WHERE MCDS.MODEL_CARD_ID = ? GROUP BY PRIME_CATEGORY ORDER BY count(PRIME_CATEGORY)');
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
	
	app.get("/linkModelDataSet", (req, res) => {
		let dataSetId = req.query.dataSetId;
		let modelCardId = req.query.modelCardId;
		
		let client = req.db;
		let stmt = client.prepare('insert into MODEL_CARD_DATA_SET values (?, ?)');
		stmt.exec([modelCardId, dataSetId], function (err, rows) {
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
	
	app.get("/unlinkModelDataSet", (req, res) => {
		let dataSetId = req.query.dataSetId;
		let modelCardId = req.query.modelCardId;
		
		let client = req.db;
		let stmt = client.prepare('delete from MODEL_CARD_DATA_SET where DATA_SET_ID = ? and MODEL_CARD_ID = ?');
		stmt.exec([dataSetId, modelCardId], function (err, rows) {
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

	app.get("/exportModelCardAsJson", (req, res) => {
		let id = req.query.cardId;

		let client = req.db;
		let stmt = client.prepare('select * from MODEL_CARD where MODEL_CARD_ID = ?');
		stmt.exec([id], function (err, rows) {
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
				res.setHeader('Content-disposition', 'attachment; filename=\"' + card.MODEL_NAME + '.json' + '\"');
				res.json(card);
			}
		});
	});
	
	app.get("/exportModelCardAsCsv", (req, res) => {
		let id = req.query.cardId;

		let client = req.db;
		let stmt = client.prepare('select * from MODEL_CARD where MODEL_CARD_ID = ?');
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
	            res.setHeader('Content-disposition', 'attachment; filename=\"' + rows[0].MODEL_NAME + '.csv' + '\"');
				let csv = parse(rows);
	            res.send(csv);
			}
		});
	});

	app.post("/saveModelCard", (req, res) => {
		let modelCard = req.body.modelCard;
		let userid = req.user.id;
		let currentTimestamp = (modelCard.CREATION_TIMESTAMP) ? "'" + new Date(modelCard.CREATION_TIMESTAMP).toISOString().slice(0, 19).replace('T', ' ') + "'" : "CURRENT_TIMESTAMP";

		let client = req.db;
		let stmt = client.prepare("upsert MODEL_CARD (MODEL_CARD_ID, MODEL_NAME, MODEL_DEVELOPER, MODEL_URL, DEV_DATE, " +
			"VERSION, VERSION_CHANGES, MODEL_TYPE, DESCRIPTION, LINKED_MODEL_CARDS, LICENSES, POC_NAME, POC_EMAIL, POC_PHONE, INTENDED_USERS, INTENDED_USES, " +
			"LIMITATIONS, IMPACT, LINKED_DATACARDS, SOURCE_OF_DATA, TYPE_OF_DATA, DATASET_TIME_PERIOD, TRAINING_DATA_SELECTION, " +
			"TRAINING_DATA_MOD, TRAINING_LIMITATIONS, ML_MISREP, MODEL_SECURITY, MODEL_TESTING, MODEL_VALIDATION, PERFORMANCE_MEASURES, " +
			"DESCION_THRES_DETERMINATION, DECISION_THRES_PROPS, CONFIDENCE_INTERVALS, DEPLOYMENT_CONTROLS, MODEL_DRIFT, STOP_MECHANISM, " +
			"RISKS, HARM_MIN, RISK_MITIGATION, MODEL_OS, MODEL_CLASSIFICATION, MODEL_INFO_ASSURANCE, DATA_FILE_FORMAT, RESULT_OUTPUT, " +
			"MODEL_PRIVACY, WF_ID, IS_APPROVED, CREATION_USERID, CREATION_TIMESTAMP, LAST_UPDATED_TIMESTAMP, LAST_UPDATED_BY) values " +
			"(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, " +
			currentTimestamp + ", CURRENT_TIMESTAMP, '" + userid + "') where MODEL_CARD_ID = '" + modelCard.MODEL_CARD_ID + "' ");
		stmt.exec([modelCard.MODEL_CARD_ID, modelCard.MODEL_NAME, modelCard.MODEL_DEVELOPER, modelCard.MODEL_URL, modelCard.DEV_DATE, modelCard.VERSION,
			modelCard.VERSION_CHANGES, modelCard.MODEL_TYPE, modelCard.DESCRIPTION, modelCard.LINKED_MODEL_CARD, modelCard.LICENSES,
			modelCard.POC_NAME, modelCard.POC_EMAIL, modelCard.POC_PHONE, modelCard.INTENDED_USERS, modelCard.INTENDED_USES,
			modelCard.LIMITATIONS, modelCard.IMPACT, modelCard.LINKED_DATACARDS, modelCard.SOURCE_OF_DATA, modelCard.TYPE_OF_DATA,
			modelCard.DATASET_TIME_PERIOD, modelCard.TRAINING_DATA_SELECTION, modelCard.TRAINING_DATA_MOD, modelCard.TRAINING_LIMITATIONS,
			modelCard.ML_MISREP, modelCard.MODEL_SECURITY, modelCard.MODEL_TESTING, modelCard.MODEL_VALIDATION,
			modelCard.PERFORMANCE_MEASURES, modelCard.DECISION_THRES_DETERMINATION, modelCard.DECISION_THRES_PROPS,
			modelCard.CONFIDENCE_INTERVALS, modelCard.DEPLOYMENT_CONTROLS, modelCard.MODEL_DRIFT, modelCard.STOP_MECHANISM,
			modelCard.RISKS, modelCard.HARM_MIN, modelCard.RISK_MITIGATION, modelCard.MODEL_OS, modelCard.MODEL_CLASSIFICATION,
			modelCard.MODEL_INFO_ASSURANCE, modelCard.DATA_FILE_FORMAT, modelCard.RESULT_OUTPUT, modelCard.MODEL_PRIVACY, modelCard.WF_ID, modelCard.IS_APPROVED,
			((modelCard.CREATION_USERID) ? modelCard.CREATION_USERID : userid)], function (err, rows) {
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