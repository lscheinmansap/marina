/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");
const async = require('async');

const CARD_STATE_APPROVED = 'APPROVED';
const CARD_STATE_REJECTED = 'REJECTED';

module.exports = function() {
	var app = express.Router();

	app.get("/createWfInstance", (req, res) => {
		let wfId = req.query.wfId;
		let cardId = req.query.cardId;
		let cardName = req.query.cardName;
		let notes = req.query.notes;
		let userid = req.user.id;

		let client = req.db, stmt;
		async.waterfall([
			// get the new workflow id
			function (done) {
				stmt = 'select to_nvarchar(SYSUUID) as GUID from dummy';
				client.exec(stmt, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].GUID)
				});
			},
			// create the new workflow instance
			function (wfInstanceId, done) {
				stmt = client.prepare('insert into WORKFLOW_INSTANCE values (?,?,?,?,?, CURRENT_TIMESTAMP)');
				stmt.exec([wfInstanceId, wfId, cardId, cardName.replace(/'/g, "''"), userid], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, wfInstanceId)
				});
			},
			// add initial row into wf instance state for the SUBMITTED state.  i'm adding the initial/SUBMITTED state to the instance table so the process flow chart
			/// will display the initial state in the UI.  Although this step does not require approval in the workflow, I think this will be useful to the approver users
			// so they can easily see who initiated the workflow.
			function (wfInstanceId, done) {
				stmt = client.prepare('insert into WORKFLOW_INSTANCE_STATE (WF_INSTANCE_ID, ACTION_APPROVER, ASSIGNED_TIMESTAMP, ACTION_TAKEN, ' +
					'ACTION_TIMESTAMP, STATE_ID, ACTION_COMMENTS, LANE_ID) select ?,?, CURRENT_TIMESTAMP, \'SUBMITTED\', CURRENT_TIMESTAMP, STATE_ID, ?, 0 from WORKFLOW_STATE ' +
					'where WF_ID = ? and STATE_ORDER = 0');
				stmt.exec([wfInstanceId, userid, notes.replace(/'/g, "''"), wfId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, wfInstanceId)
				});
			},
			// create the first workflow instance state.  this state requires approval
			function (wfInstanceId, done) {
				stmt = client.prepare('insert into WORKFLOW_INSTANCE_STATE (WF_INSTANCE_ID, STATE_ID, ASSIGNED_TIMESTAMP, LANE_ID) ' +
				'SELECT ?, STATE_ID, CURRENT_TIMESTAMP, 1 FROM WORKFLOW_STATE s WHERE s.WF_ID = ? AND STATE_ORDER = 1 ');
				stmt.exec([wfInstanceId, wfId], function (err, rows) {
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

	app.get("/resubmitCard", (req, res) => {
		let wfId = req.query.wfId;
		let cardId = req.query.cardId;
		let notes = req.query.notes;
		let userid = req.user.id;

		let client = req.db, stmt;
		async.waterfall([
			// get the wf_instance_id for the card
			function (done) {
				stmt = client.prepare('select WF_INSTANCE_ID from WORKFLOW_INSTANCE where card_id = ?');
				stmt.exec([cardId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].WF_INSTANCE_ID)
				});
			},
			// get next lane_id
			function (wfInstanceId, done) {
				stmt = client.prepare('select max(LANE_ID)+1 as LANE_ID from WORKFLOW_INSTANCE_STATE where WF_INSTANCE_ID = ?');
				stmt.exec([wfInstanceId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {wfInstanceId: wfInstanceId, laneId: rows[0].LANE_ID})
				});
			},
			// create another submit workflow instance to represent the resubmission.
			function (obj, done) {
				stmt = client.prepare('insert into WORKFLOW_INSTANCE_STATE (WF_INSTANCE_ID, ACTION_APPROVER, ASSIGNED_TIMESTAMP, ACTION_TAKEN, ACTION_TIMESTAMP, ' +
					'STATE_ID, ACTION_COMMENTS, LANE_ID) select ?, ?, CURRENT_TIMESTAMP, \'SUBMITTED\', CURRENT_TIMESTAMP, STATE_ID, ?, ? from WORKFLOW_STATE ' +
					'where WF_ID = ? and STATE_ORDER = 0');
				stmt.exec([obj.wfInstanceId, userid, notes.replace(/'/g, "''"), obj.laneId, wfId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, obj)
				});
			},				
			// create the first workflow instance state.  this state requires approval
			function (obj, done) {
				var laneId = parseInt(obj.laneId)+1;
				
				stmt = client.prepare('insert into WORKFLOW_INSTANCE_STATE (WF_INSTANCE_ID, STATE_ID, ASSIGNED_TIMESTAMP, LANE_ID) ' +
				'SELECT ?, STATE_ID, CURRENT_TIMESTAMP, ? FROM WORKFLOW_STATE s WHERE s.WF_ID = ? AND STATE_ORDER = 1');
				stmt.exec([obj.wfInstanceId, laneId, wfId], function (err, rows) {
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

	app.get("/getApproverApprovalsState", (req, res) => {
		let userid = req.user.id;
		let client = req.db;
		let stmt;
		async.waterfall([
			// approved
			function (done) {
				stmt = client.prepare('select count(*) as TOTAL from workflow_instance_state where action_approver = ? and ACTION_TAKEN = \'APPROVED\'');
				stmt.exec([userid], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, [{type: 'Approved', total: rows[0].TOTAL}]);
				});
			},
			// rejected
			function (obj, done) {
				stmt = client.prepare('select count(*) as TOTAL from workflow_instance_state where action_approver = ? and ACTION_TAKEN = \'REJECTED\'');
				stmt.exec([userid], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					obj.push({type: 'Rejected', total: rows[0].TOTAL});
					done(null, obj);
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
	
	app.get("/getApproverCardTypes", (req, res) => {
		let userid = req.user.id;
		let client = req.db;
		let stmt = client.prepare('select wf_name, count(*) as TOTAL from workflow w inner join workflow_instance wi on w.wf_id = wi.wf_id ' +
								'inner join workflow_instance_state s on wi.wf_instance_id = s.wf_instance_id where action_approver = ? ' +
								'group by wf_name');
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
	
	app.get("/getApproverApprovalsByMonth", (req, res) => {
		let userid = req.user.id;
		let client = req.db;
		let stmt = client.prepare('select month(action_timestamp) as MONTH, count(*) as TOTAL from workflow_instance_state s ' +
								'where action_approver = ? and action_taken = \'APPROVED\' group by month(action_timestamp) ' +
								'order by month(action_timestamp) asc limit 6');
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

	app.get("/getCardsLinkedDataSets", (req, res) => {
		let client = req.db;
		let stmt;
		async.waterfall([
			// first, get total cards for user
			function (done) {
				stmt = client.prepare('select count(*) as TOTAL from workflow w inner join workflow_instance i on w.wf_id = i.wf_id where WF_NAME = \'Data Card\'');
				stmt.exec([], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {total: rows[0].TOTAL });
				});
			},
			// get linked
			function (obj, done) {
				stmt = client.prepare('select count(*) as TOTAL from workflow_instance i inner join data_set d on i.card_id = d.data_card_id ');
				stmt.exec([], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					var linked = rows[0].TOTAL;
					done(null, [{type: "Linked Data Sets", total: linked}, {type: "Unlinked Data Sets", total: parseInt(obj.total)-parseInt(linked)}]);
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
	
	app.get("/getMyCardsCurrentState", (req, res) => {
		let userid = req.user.id;
		let client = req.db;
		let stmt;
		async.waterfall([
			// in progress
			function (done) {
				stmt = client.prepare('select count(*) as TOTAL from workflow_instance_state s inner join workflow_instance i ' +
										'on s.wf_instance_id = i.wf_instance_id where i.created_by = ? ' +
										'and (s.lane_id = 1 or s.lane_id = 2) and action_taken is null ');
				stmt.exec([userid], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {cardStatus: [{type: "In Progress", total: rows[0].TOTAL}] });
				});
			},
			// rejected card count
			function (obj, done) {
				stmt = client.prepare('select count(card_name) as TOTAL from workflow_instance wi ' +
					'inner join workflow_instance_state s on wi.wf_instance_id = s.wf_instance_id ' +
					'where CREATED_BY = ? and ACTION_TAKEN = \'REJECTED\' ');
				stmt.exec([userid], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					obj.cardStatus.push({type: "Rejected", total: rows[0].TOTAL});
					
					done(null, obj);
				});
			},
			// approved card count
			function (obj, done) {
				stmt = client.prepare('select count(*) as TOTAL from workflow_instance_state s inner join workflow_instance i ' +
										'on s.wf_instance_id = i.wf_instance_id where i.created_by = ? and action_taken = \'APPROVED\' and lane_id = 2 ');
				stmt.exec([userid], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					obj.cardStatus.push({type: "Approved", total: rows[0].TOTAL});
					
					done(null, obj);
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

	app.get("/getInProgressState", (req, res) => {
		let userid = req.user.id;
		let client = req.db;
		let stmt = client.prepare('select lane_id, count(*) as TOTAL from workflow_instance_state s inner join workflow_instance i ' +
					'on s.wf_instance_id = i.wf_instance_id where i.created_by = ? and (s.lane_id = 1 or s.lane_id = 2) ' +
					'and action_taken is null group by lane_id');
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
	
	app.get("/getMyCardsLinkedDataSets", (req, res) => {
		let userid = req.user.id;
		let client = req.db;
		let stmt;
		
		async.waterfall([
			// first, get total cards for user
			function (done) {
				stmt = client.prepare('select count(*) as TOTAL from workflow w inner join workflow_instance i on w.wf_id = i.wf_id where created_by = ? and WF_NAME = \'Data Card\'');
				stmt.exec([userid], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {total: rows[0].TOTAL });
				});
			},
			// get linked
			function (obj, done) {
				stmt = client.prepare('select count(*) as TOTAL from workflow_instance i inner join data_set d on i.card_id = d.data_card_id ' +
										'where created_by = ?');
				stmt.exec([userid], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					var linked = rows[0].TOTAL;
					done(null, [{type: "Linked Data Sets", total: linked}, {type: "Unlinked Data Sets", total: parseInt(obj.total)-parseInt(linked)}]);
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

	app.get("/getMyCardApprovalsByDate", (req, res) => {
		let userid = req.user.id;
		let client = req.db;
		let stmt = client.prepare('select month(action_timestamp) as MONTH, count(*) as TOTAL from workflow_instance_state s inner join workflow_instance i ' +
									'on s.wf_instance_id = i.wf_instance_id and i.created_by = ? and action_taken = \'APPROVED\' and lane_id = 2 ' +
									'group by month(action_timestamp) order by month(action_timestamp) asc limit 6');
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

	app.get("/getMyCards", (req, res) => {
		let userid = req.user.id;
		let client = req.db;
		let stmt = client.prepare('select card_id, card_name, state_name, action_taken, wfs.ASSIGNED_TIMESTAMP as CREATED_TIMESTAMP, w.ICON, w.WF_NAME ' +
					'from WORKFLOW_INSTANCE_STATE wfs INNER JOIN WORKFLOW_STATE s on wfs.STATE_ID = s.STATE_ID ' +
					'inner join WORKFLOW_INSTANCE wf on wf.WF_INSTANCE_ID = wfs.WF_INSTANCE_ID ' +
					'inner join WORKFLOW w on w.WF_ID = wf.WF_ID inner join (select wf_instance_id, max(assigned_timestamp) as ASSIGNED_TIMESTAMP ' +
					'from WORKFLOW_INSTANCE_STATE group by wf_instance_id) z on wfs.wf_instance_id = z.wf_instance_id ' +
					'where wfs.ASSIGNED_TIMESTAMP = z.ASSIGNED_TIMESTAMP and CREATED_BY = ? ' +
					'UNION ' +
					'SELECT MODEL_CARD_ID, MODEL_NAME, \'Not Submitted\', \'Not Submitted\', CREATION_TIMESTAMP AS CREATED_TIMESTAMP, \'sap-icon://overview-chart\', \'Model Card\' ' +
					'FROM MODEL_CARD WHERE CREATION_USERID = ? and IS_APPROVED = 0 ' +
					'AND MODEL_CARD_ID NOT IN (SELECT CARD_ID FROM WORKFLOW_INSTANCE mwis WHERE CREATED_BY = ?) ' +
					'UNION ' +
					'SELECT dc.DATA_CARD_ID, ds.NAME as DATASET_NAME, \'Not Submitted\', \'Not Submitted\', CREATION_TIMESTAMP AS CREATED_TIMESTAMP, \'sap-icon://form\', \'Data Card\' ' +
					'FROM DATA_CARD dc inner join DATA_SET ds on dc.DATA_CARD_ID = ds.DATA_CARD_ID WHERE CREATION_USERID = ? and IS_APPROVED = 0 ' +
					'AND dc.DATA_CARD_ID NOT IN (SELECT CARD_ID FROM WORKFLOW_INSTANCE mwis WHERE CREATED_BY = ?) order by CREATED_TIMESTAMP desc');
		stmt.exec([userid, userid, userid, userid, userid], function (err, rows) {
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
	
	app.get("/getMyApprovals", (req, res) => {
		let approverType = req.query.approverType;
		let client = req.db;
		let stmt = client.prepare('select p.*, card_name, card_id, w.icon, wf_name from V_MARINA_WORKFLOW_INSTANCE_IN_PROGRESS p ' +
					'inner join workflow_instance wi on p.wf_instance_id = wi.wf_instance_id ' +
					'inner join workflow w on wi.wf_id = w.wf_id where APPROVER_ROLE = ? order by ASSIGNED_TIMESTAMP desc');
		stmt.exec([approverType], function (err, rows) {
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
					data: {results: rows, total: rows.length}
				});
			}
		});
	});
	
	app.get("/getPriorApprovals", (req, res) => {
		let userid = req.user.id;
		let client = req.db;
		let stmt = client.prepare('select card_name, card_id, w.icon, wf_name, action_timestamp from WORKFLOW_INSTANCE_STATE s inner join WORKFLOW_INSTANCE i on s.wf_instance_id = i.wf_instance_id ' +
									'inner join workflow w on i.wf_id = w.wf_id where ACTION_APPROVER = ? and ACTION_TAKEN = \'APPROVED\' order by action_timestamp desc');
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
					data: {results: rows, total: rows.length}
				});
			}
		});
	});
	
	app.get("/getPriorRejections", (req, res) => {
		let userid = req.user.id;
		let client = req.db;
		let stmt = client.prepare('select card_name, card_id, w.icon, wf_name, action_timestamp from WORKFLOW_INSTANCE_STATE s inner join WORKFLOW_INSTANCE i on s.wf_instance_id = i.wf_instance_id ' +
									'inner join workflow w on i.wf_id = w.wf_id where ACTION_APPROVER = ? and ACTION_TAKEN = \'REJECTED\' order by action_timestamp desc');
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
					data: {results: rows, total: rows.length}
				});
			}
		});
	});
	
	app.get("/approveCardState", (req, res) => {
		let cardId = req.query.cardId;
		let cardType = req.query.cardType;
		let notes = req.query.notes;
		let stateId = req.query.stateId;
		let userid = req.user.id;
		let stmt;
		
		let client = req.db;
		async.waterfall([
			// get workflow instance id based on card id
			function (done) {
				stmt = client.prepare('select WF_INSTANCE_ID from WORKFLOW_INSTANCE where CARD_ID = ?');
				stmt.exec([cardId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].WF_INSTANCE_ID);
				});
			},
			// update the current state -- approver, action and timestamp
			function (wfInstanceId, done) {
				stmt = client.prepare('UPDATE WORKFLOW_INSTANCE_STATE set ACTION_APPROVER = ?, ACTION_TAKEN = ?, ACTION_TIMESTAMP = CURRENT_TIMESTAMP, ' +
					'ACTION_COMMENTS = ? where WF_INSTANCE_ID = ? and STATE_ID = ? and ACTION_TIMESTAMP is null');
				stmt.exec([userid, CARD_STATE_APPROVED, notes.replace(/'/g, "''"), wfInstanceId, stateId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, wfInstanceId);
				});
			},
			// get next state
			function (wfInstanceId, done) {
				stmt = client.prepare('SELECT ? as WF_INSTANCE_ID, STATE_ID FROM WORKFLOW_STATE s ' +
					'WHERE STATE_ID = (SELECT NEXT_STATE_ID FROM WORKFLOW_TRANSITION t ' +
					'WHERE CURRENT_STATE_ID = (SELECT STATE_ID FROM WORKFLOW_INSTANCE_STATE ' +
					'WHERE WF_INSTANCE_ID = ? AND LANE_ID = (select max(LANE_ID) from WORKFLOW_INSTANCE_STATE ' +
					'WHERE WF_INSTANCE_ID = ? )))');
				stmt.exec([wfInstanceId, wfInstanceId, wfInstanceId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {
						"wfInstanceId": wfInstanceId,
						"nextObj": rows[0]
					});
				});
			},
			// assign next state.  if end of workflow reached, update the IS_APPROVED flag in the card table
			function (obj, done) {
				if (obj.nextObj) {
					stmt = client.prepare('INSERT INTO WORKFLOW_INSTANCE_STATE (WF_INSTANCE_ID, STATE_ID, ASSIGNED_TIMESTAMP, LANE_ID) VALUES' +
						'(?, ?, CURRENT_TIMESTAMP, (select max(LANE_ID)+1 from WORKFLOW_INSTANCE_STATE where WF_INSTANCE_ID = ?) )');
					stmt.exec([obj.nextObj.WF_INSTANCE_ID, obj.nextObj.STATE_ID, obj.nextObj.WF_INSTANCE_ID], function (err, rows) {
						if (err) {
							console.log(err);
							return next(err);
						}
						done(null, rows);
					});
				}
				// end of the workflow.  update the IS_APPROVED flag in the model card table
				else {
					stmt = client.prepare('UPDATE ' + cardType + '_CARD set IS_APPROVED = 1 where ' + cardType + '_CARD_ID = ?');
					stmt.exec([cardId], function (err, rows) {
						if (err) {
							console.log(err);
							return next(err);
						}
						done(null, rows);
					});				
				}
				
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

	app.get("/rejectCardState", (req, res) => {
		let cardId = req.query.cardId;
		let comments = req.query.comments;
		let stateId = req.query.stateId;
		let userid = req.user.id;
		let stmt;
		
		let client = req.db;		
		async.waterfall([
			// get workflow instance id based on card id
			function (done) {
				stmt = client.prepare('select WF_INSTANCE_ID from WORKFLOW_INSTANCE where CARD_ID = ?');
				stmt.exec([cardId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].WF_INSTANCE_ID);
				});
			},
			// update the current state -- approver, action, timestamp and comments
			function (wfInstanceId, done) {
				stmt = client.prepare('UPDATE WORKFLOW_INSTANCE_STATE set ACTION_APPROVER = ?, ACTION_TAKEN = ?, ' +
					'ACTION_TIMESTAMP = CURRENT_TIMESTAMP, ACTION_COMMENTS = ? ' +
					'where WF_INSTANCE_ID = ? and STATE_ID = ? and ACTION_TIMESTAMP is null');
				stmt.exec([userid, CARD_STATE_REJECTED, comments.replace(/'/g, "''"), wfInstanceId, stateId], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, wfInstanceId);
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

	app.get("/getCardTypes", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select * from WORKFLOW order by WF_NAME');
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

	app.get("/getWorkflowByName", (req, res) => {
		let wfName = req.query.name;
		
		let client = req.db;
		let stmt = client.prepare('select * from WORKFLOW where WF_NAME = ?');
		stmt.exec([wfName], function (err, rows) {
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
	
	return app;
};