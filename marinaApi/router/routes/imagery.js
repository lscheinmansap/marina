/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");
const hdbext = require('@sap/hdbext');
const async = require('async');
var AWS = require('aws-sdk');
const {v4: uuidv4 } = require('uuid');
const fs = require('fs');
const spawn = require('child_process').spawn;

// set the config file directory for the config module to read
// first, figure out which XSA Space we're in...
let vcap = JSON.parse(process.env.VCAP_APPLICATION);
let space = vcap.space_name;
// then, append the space to the config directory
process.env["NODE_CONFIG_DIR"] = "/home/saphdbxsa/config/marina/" + space;

const config = require('config');
const marinaConfig = config.get("HANA.DATA_BROKER");
const s3Config = config.get("S3");
AWS.config.update({
	region: s3Config.region
});

const videoDataDir = '/home/saphdbxsa/bin';
const fmvTmpDir = '/tmp';

module.exports = function() {
	var app = express.Router();

	app.use('/fmv/files', express.static(videoDataDir));
	app.use('/fmv/tmp', express.static(fmvTmpDir));

	app.get("/getImageryFromBucket", (req, res) => {
		let file = req.query.file;
		if (file)  {
			var s3 = new AWS.S3();
			var params = { Bucket: s3Config.IMAGERY_BUCKET, Key: file };
			var s3Stream = s3.getObject(params).createReadStream();
			// error from read stream
			s3Stream.on("error", function(err)  {
				console.log(err);
			});
			// pipe data back to client
			s3Stream.pipe(res).on("error", function(err)  {
				console.log(err);
			});
			
		}
		else  {
			res.json({
				status: 401,
				message: "ERR",
				data: "No File Specified."
			});
		}
	});
		
	app.post("/searchImagery", (req, res) => {
		let hasGlobal = req.authInfo.checkScope('$XSAPPNAME.global');
		let limit = req.body.limit;
		let offset = req.body.offset;
		let sortBy = (req.body.sortBy) ? req.body.sortBy : 'IMAGERY_START_TIME_STAMP';
		let sortDir = (req.body.sortDir) ? req.body.sortDir : 'desc';
		let coords = req.body.coords;
		let filters = req.body.filters;
		let startDate = req.body.start;
		let endDate = req.body.end;

		let client = req.db;
		let params = [], prefix = ' where ', whereClause = '';
		
		// next, build the where clause for the query.  this clause will be applied to the count query and the query to retrieve the actual results.
		// include annotation query stuff first so we can add the inner join
		if (filters && filters["LABEL_NAME"])  {
			whereClause += 'inner join SEQUENCE_FRAME_TRACK_ANNOTATION FA on FA.SEQUENCE_FRAME_UUID = F.SEQUENCE_FRAME_UUID ';
			let labelsQuery = ' (';
			labelsQuery += ' LABEL_NAME in (\'' + filters["LABEL_NAME"].join("\',\'") + '\') ';
			labelsQuery += ') '
			whereClause += prefix + labelsQuery;	
			prefix = ' and ';
		}
		// include platform type in the inner query since we can access the platform_type value in the video table
		if (filters && filters["PLATFORM_TYPE"])  {
			whereClause += prefix + ' (PLATFORM_TYPE in (\'' + filters["PLATFORM_TYPE"].join("\',\'") + '\')  ';
			if (filters["PLATFORM_TYPE"].includes('UNKNOWN'))  {
				whereClause += ' or PLATFORM_TYPE is null ';
			}
			whereClause += ') ';
			prefix = ' and ';
		}
		
		if (startDate)  {
			whereClause += ' and TO_DATE(F.ORIGINAL_TIMESTAMP) between ? and ? ';
			params.push(startDate);
			params.push(endDate);
		}

		// add geospatial query if area selected
		if (coords)  {
			var coordsObj = JSON.parse(coords);
			whereClause += prefix + 'F.FRAME_CENTER_GEO_POINT.ST_IntersectsRect(NEW ST_Point(?,1000004326), NEW ST_Point(?, 1000004326)) = 1 ';
            prefix = ' and ';
			params.push('Point(' + coordsObj._southWest.lng + ' ' + coordsObj._southWest.lat + ')');
			params.push('Point(' + coordsObj._northEast.lng + ' ' + coordsObj._northEast.lat + ')');
		}
		
		// add any selected filters.  these will apply to the sequence_frame table.  other filters are listed below that apply to the imagery_packages_summary view.
		/*if (filters)  {
			if (filters.PIXEL_WIDTH)  {
				whereClause += prefix + ' F.WIDTH_PIX ' + filters.PIXEL_WIDTH.operator + ' ? ';
				prefix = ' and ';
				params.push(filters.PIXEL_WIDTH.value);
			}
			if (filters.PIXEL_HEIGHT)  {
				whereClause += prefix + ' F.HEIGHT_PIX ' + filters.PIXEL_HEIGHT.operator + ' ? ';
				prefix = ' and ';
				params.push(filters.PIXEL_HEIGHT.value);
			}
			if (filters.BIT_RATE)  {
				whereClause += prefix + ' BIT_RATE ' + filters.BIT_RATE.operator + ' ? ';
				prefix = ' and ';
				params.push(filters.BIT_RATE.value);
			}
		}*/

		// if user does not have global role, they can only view training and validation data
		if (!hasGlobal)  {
			whereClause += prefix + ' TE_DESIGNATION in (\'TRAINING\', \'VALIDATION\') ';
			prefix = ' and ';
		}
		
		whereClause += 'group by F.IMAGERY_PACKAGE_UUID) as H on H.IMAGERY_PACKAGE_UUID = IV.IMAGERY_PACKAGE_UUID ';
		
		// add where criteria for the imagery_package_summary_view
		if (filters)  {
			if (filters.CLASSIFICATION)  {
				whereClause += prefix + ' CLASSIFICATION in (\'' + filters["CLASSIFICATION"].join("\',\'") + '\') ';
				prefix = ' and ';
			}
			if (filters.IMAGERY_PACKAGE_TYPE)  {
				whereClause += prefix + ' IMAGERY_PACKAGE_TYPE in (\'' + filters["IMAGERY_PACKAGE_TYPE"].join("\',\'") + '\') ';
				prefix = ' and ';
			}
			if (filters.TE_DESIGNATION)  {
				whereClause += prefix + ' TE_DESIGNATION in (\'' + filters["TE_DESIGNATION"].join("\',\'") + '\') ';
				prefix = ' and ';
			}
		}

		let stmt, query;
		async.waterfall([
			// first, execute the query for the total matching rows
			function (done) {
				query = 'select count(distinct IV.IMAGERY_PACKAGE_UUID) as TOTAL from IMAGERY_PACKAGE_SUMMARY_VIEW IV inner join ' +
						'(select F.IMAGERY_PACKAGE_UUID, count(distinct F.SEQUENCE_CLIP_UUID) as CLIP_HIT_COUNT, count(distinct F.SEQUENCE_FRAME_UUID) as FRAME_HIT_COUNT  ' +
						'from SEQUENCE_FRAME F inner join VIDEO V on V.IMAGERY_PACKAGE_UUID = F.IMAGERY_PACKAGE_UUID ';
				query += whereClause;

				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {total: rows[0].TOTAL});
				});
			},
			// now execute the actual query
			function (obj, done) {
				// start forming the query 
				query = 'select distinct IV.IMAGERY_PACKAGE_UUID, IV.CLASSIFICATION, IV.IMAGERY_PACKAGE_NAME, IV.INSERTION_TIMESTAMP,' +
						'IV.FIRST_FRAME_FILEPATH, IV.CLIP_COUNT, IV.FRAME_COUNT, IFNULL(H.CLIP_HIT_COUNT, 0) as CLIP_HIT_COUNT, ' +
						'IFNULL(H.FRAME_HIT_COUNT, 0) as FRAME_HIT_COUNT, IV.IMAGERY_START_TIME_STAMP, IV.IMAGERY_PACKAGE_TYPE, IMAGERY_PACKAGE_DESCRIPTION, TE_DESIGNATION, DURATION_SECONDS, ' +
						'(SELECT count(*) FROM AUDIT_LOG a WHERE OBJECT_TYPE = \'IMAGERY PACKAGE\' AND ACTION = \'VIEW\' AND IV.IMAGERY_PACKAGE_UUID = a.OBJECT_ID) AS NUM_VIEWS ' +
						'from IMAGERY_PACKAGE_SUMMARY_VIEW IV inner join ' +
						'(select F.IMAGERY_PACKAGE_UUID, count(distinct F.SEQUENCE_CLIP_UUID) as CLIP_HIT_COUNT, count(distinct F.SEQUENCE_FRAME_UUID) as FRAME_HIT_COUNT  ' +
						'from SEQUENCE_FRAME F inner join VIDEO V on V.IMAGERY_PACKAGE_UUID = F.IMAGERY_PACKAGE_UUID ';
				query += whereClause;
				query += ' order by ' + sortBy + " " + sortDir;
				query += ' limit ? offset ? ';
				params.push(limit);
				params.push(offset);

				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					obj.results = rows;
					obj.limit = limit;
					obj.offset = offset;
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

	app.get("/getImageryCardsTotal", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select count(*) as TOTAL from IMAGERY_PACKAGE_DATA_CARD');
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
	
	app.get("/getAnnotationCardsTotal", (req, res) => {
		let client = req.db;
		let stmt = client.prepare('select count(*) as TOTAL from ANNOTATION_PACKAGE_DATA_CARD');
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
	
	app.get("/getAnnotationCardsTotal", (req, res) => {
		let hasGlobal = req.authInfo.checkScope('$XSAPPNAME.global');
		let val = (req.query.val) ? '%' + req.query.val + '%' : '%';
		let limit = (req.query.limit) ? req.query.limit : 20;
		let offset = (req.query.offset) ? req.query.offset : 0;
		
		let client = req.db;
		let stmt, query;
		async.waterfall([
			// first, get total count for query
			function (done) {
				query = 'select count(*) as COUNT from IMAGERY_PACKAGE_DATA_CARD where contains (IMAGERY_PACKAGE_NAME, ?, FUZZY(0.7)) ';
				stmt = client.prepare(query);
				stmt.exec([val], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].COUNT);
				});
			},
			// next, execute the query
			function (count, done) {
				let params = [], prefix = ' where ';
				query = 'select c.*, s.FIRST_FRAME_FILEPATH from IMAGERY_PACKAGE_DATA_CARD c ' +
							'inner join IMAGERY_PACKAGE_SUMMARY_VIEW s on c.IMAGERY_PACKAGE_UUID = s.IMAGERY_PACKAGE_UUID ';
				// if user does not have global role, they can only view training and validation data
				if (!hasGlobal)  {
					query += prefix + ' s.TE_DESIGNATION in (\'TRAINING\', \'VALIDATION\') ';
					prefix = ' and ';
				}
				if (val)  {
					params.push(val)
					query += prefix + ' contains (c.IMAGERY_PACKAGE_NAME, ?, FUZZY(0.7)) ';
				}
				params.push(limit);
				params.push(offset);
				query += 'limit ? offset ?';
				
				stmt = client.prepare(query);
				stmt.exec([val, limit, offset], function (err, rows) {
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

	app.get("/getAnnotationCardsTotal", (req, res) => {
		let hasGlobal = req.authInfo.checkScope('$XSAPPNAME.global');
		let val = (req.query.val) ? '%' + req.query.val + '%' : '%';
		let limit = (req.query.limit) ? req.query.limit : 20;
		let offset = (req.query.offset) ? req.query.offset : 0;
		
		let client = req.db;
		let stmt, query;
		async.waterfall([
			// first, get total count for query
			function (done) {
				query = 'select count(*) as COUNT from ANNOTATION_PACKAGE_DATA_CARD where contains((ANNOTATION_FILE_PATH, ANNOTATION_SOURCE), ?, FUZZY(0.7)) ';
				stmt = client.prepare(query);
				stmt.exec([val], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].COUNT);
				});
			},
			// next, execute the query
			function (count, done) {
				let params = [];
				query = 'select * from ANNOTATION_PACKAGE_DATA_CARD ';
				if (val)  {
					params.push(val)
					query += ' where contains((ANNOTATION_FILE_PATH, ANNOTATION_SOURCE), ?, FUZZY(0.7)) ';
				}
				params.push(limit);
				params.push(offset);
				query += 'limit ? offset ?';
				
				stmt = client.prepare(query);
				stmt.exec([val, limit, offset], function (err, rows) {
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
	
	app.get("/getPackageInfo", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('select CLASSIFICATION, IMAGERY_PACKAGE_TYPE, IMAGERY_PACKAGE_NAME, IMAGERY_PACKAGE_DESCRIPTION, TE_DESIGNATION, IMAGERY_START_TIME_STAMP, ' +
					'IMAGERY_END_TIME_STAMP, DURATION_SECONDS, CLIP_COUNT, FRAME_COUNT from IMAGERY_PACKAGE_SUMMARY_VIEW where IMAGERY_PACKAGE_UUID = ?');
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
	
	app.get("/getImageryCards", (req, res) => {
		let hasGlobal = req.authInfo.checkScope('$XSAPPNAME.global');
		let val = (req.query.val) ? '%' + req.query.val + '%' : '%';
		let limit = (req.query.limit) ? req.query.limit : 20;
		let offset = (req.query.offset) ? req.query.offset : 0;
	
		let client = req.db;
		let stmt;
		async.waterfall([
			// first, get total count for query
			function (done) {
				var query = 'select count(*) as COUNT from IMAGERY_PACKAGE_DATA_CARD where contains (IMAGERY_PACKAGE_NAME, ?, FUZZY(0.7)) ';
				stmt = client.prepare(query);
				stmt.exec([val], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].COUNT);
				});
			},
			// next, execute the query
			function (count, done) {
				var params = [];
				var prefix = ' where ';
				var query = 'select c.*, s.FIRST_FRAME_FILEPATH  from IMAGERY_PACKAGE_DATA_CARD c ' +
							'inner join IMAGERY_PACKAGE_SUMMARY_VIEW s on c.IMAGERY_PACKAGE_UUID = s.IMAGERY_PACKAGE_UUID ';
				// if user does not have global role, they can only view training and validation data
				if (!hasGlobal)  {
					query += prefix + ' s.TE_DESIGNATION in (\'TRAINING\', \'VALIDATION\') ';
					prefix = ' and ';
				}
				if (val)  {
					params.push(val)
					query += prefix + ' contains (c.IMAGERY_PACKAGE_NAME, ?, FUZZY(0.7)) ';
				}
				params.push(limit);
				params.push(offset);
				query += 'limit ? offset ?';
				
				stmt = client.prepare(query);
				stmt.exec([val, limit, offset], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {total: count, limit: limit, offset: offset, results: rows});
				});
			},
			// return the complete result
			function (result, done) {
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

	app.get("/getImageryCard", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		hdbext.loadProcedure(client, marinaConfig.schema, "GET_FMV_IMAGERY_PACKAGE_DATA_CARD_INFO", function(err, sp)  {
			if (err)  {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			sp({"IN_IMAGERY_PACKAGE_UUID": id}, function(spErr, parameters, metadata, videoMetadata, frameCenterTrack, sensorTrack, annotations, annotationStats, sensorMetadata)  {
				if (spErr)  {
					res.json({
						status: 401,
						message: "ERR",
						data: spErr
					});
				}
				else  {
					res.json({
						status: 200,
						message: "OK",
						data: {
							metadata: metadata[0], 
							videoMetadata: videoMetadata[0], 
							frameCenterTrack: frameCenterTrack,
							sensorMetadata: sensorMetadata[0],
							sensorTrack: sensorTrack, 
							annotations: annotations, 
							annotationStats
						}
					});
				}
				
			});	
		});
	});
	
	app.get("/getAnnotationCards", (req, res) => {
		let hasGlobal = req.authInfo.checkScope('$XSAPPNAME.global');
		let val = (req.query.val) ? '%' + req.query.val + '%' : '%';
		let limit = (req.query.limit) ? req.query.limit : 20;
		let offset = (req.query.offset) ? req.query.offset : 0;

		let client = req.db;
		let stmt;
		async.waterfall([
			// first, get total count for query
			function (done) {
				stmt = client.prepare('select count(*) as COUNT from ANNOTATION_PACKAGE_DATA_CARD where contains ((ANNOTATION_FILE_PATH, ANNOTATION_SOURCE), ?, FUZZY(0.7)) ');
				stmt.exec([val], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, rows[0].COUNT);
				});
			},
			// next, execute the query
			function (count, done) {
				let params = [];
				let query = 'select * from ANNOTATION_PACKAGE_DATA_CARD ';
				if (val)  {
					params.push(val)
					query += ' where contains((ANNOTATION_FILE_PATH, ANNOTATION_SOURCE), ?, FUZZY(0.7)) ';
				}
				params.push(limit);
				params.push(offset);
				query += 'limit ? offset ?';
				
				stmt = client.prepare(query);
				stmt.exec([val, limit, offset], function (err, rows) {
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
	
	app.get("/getAnnotationCard", (req, res) => {
		let hasGlobal = req.authInfo.checkScope('$XSAPPNAME.global');
		let id = req.query.id;
		
		let client = req.db;
		hdbext.loadProcedure(client, marinaConfig.schema, "GET_FMV_ANNOTATION_PACKAGE_DATA_CARD_INFO", function(err, sp)  {
			if (err)  {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			sp({"IN_ANNOTATION_PACKAGE_UUID": id, "TRAINING_VALIDATION_DATA_ONLY_FLAG": !hasGlobal}, function(spErr, parameters, metadata, labelTypeStats, imageryPackages, labelTypeStatsByImagery)  {
				if (spErr)  {
					res.json({
						status: 401,
						message: "ERR",
						data: spErr
					});
				}
				else  {
					res.json({
						status: 200,
						message: "OK",
						data: {
							metadata: metadata[0], 
							labelTypeStats: labelTypeStats, 
							imageryPackages: imageryPackages,
							labelTypeStatsByImagery: labelTypeStatsByImagery
						}
					});
				}
				
			});	
		});
	});

	app.get("/updateTeDesignation", (req, res) => {
		let cardId = req.query.id;
		let designation = req.query.designation;
		let client = req.db;
		
		let stmt = client.prepare('update IMAGERY_PACKAGE_DATA_CARD set TE_DESIGNATION = ? where IMAGERY_PACKAGE_UUID = ?');
		stmt.exec([designation, cardId], function (err, rows) {
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
					data: designation
				});
			}
		});
	});
	
	app.post("/getFmvClips", (req, res) => {
		let id = req.body.id;
		let labels = req.body.labels;
		let limit = req.body.limit;
		let offset = req.body.offset;
		
		let client = req.db;
		// setup the parameter array, with the first value being the imagery package uuid
		var params = [id], prefix = ' where ', whereClause = '';
		
		// next, build the where clause for the query.  this clause will be applied to the count query and the query to retrieve the actual results.
		// include annotation query stuff first so we can add the inner join
		if (labels !== undefined && parseInt(labels.length) > 0)  {
			whereClause += 'inner join SEQUENCE_FRAME_TRACK_ANNOTATION FA on FA.SEQUENCE_FRAME_UUID = F.SEQUENCE_FRAME_UUID ';
			var hasAnnotationTable = true;
			// convert the labels string into an array, using the comma as a delimiter
			var labelsArr = labels.split(',');
			var labelsQuery = ' (';
			var labelsPrefix = ' ';
			labelsArr.forEach(function(val)  {
				labelsQuery += labelsPrefix + 'FA.LABEL_NAME = ? ';
				params.push(val);
				labelsPrefix = ' or ';
			})
			labelsQuery += ') '
			whereClause += prefix + labelsQuery;	
			prefix = ' and ';
		}
		
		var stmt;
		async.waterfall([
			// first, execute the query for the total matching rows
			function (done) {
				var query = 'select count(distinct CV.SEQUENCE_CLIP_UUID) as TOTAL from SEQUENCE_CLIP_VIEW CV ' +
							'inner join SEQUENCE_FRAME F on F.SEQUENCE_CLIP_UUID = CV.SEQUENCE_CLIP_UUID ' +
							'inner join (select distinct SEQUENCE_CLIP_UUID, FIRST_VALUE (FRAME_IMAGE_FILE_PATH order by SRC_VIDEO_FRAME) as FIRST_FRAME_FILEPATH ' +
							'from SEQUENCE_FRAME_VIEW where IMAGERY_PACKAGE_UUID = ? group by SEQUENCE_CLIP_UUID ) FF on FF.SEQUENCE_CLIP_UUID = CV.SEQUENCE_CLIP_UUID ';
				query += whereClause;

				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {total: rows[0].TOTAL});
				});
			},
			// now execute the actual query
			function (obj, done) {
				// start forming the query 
				var query = 'select distinct CV.CLASSIFICATION, CV.START_TIMESTAMP, CV.END_TIMESTAMP, CV.CLIP_VIDEO_OFFSET_SECONDS, CV.DURATION_SECONDS, CV.FILE_SIZE_BYTES, ' +
							'CV.SEQUENCE_CLIP_UUID, FF.FIRST_FRAME_FILEPATH, CV.CLIP_NAME from SEQUENCE_CLIP_VIEW CV ' +
							'inner join SEQUENCE_FRAME F on F.SEQUENCE_CLIP_UUID = CV.SEQUENCE_CLIP_UUID ' +
							'inner join (select distinct SEQUENCE_CLIP_UUID, FIRST_VALUE (FRAME_IMAGE_FILE_PATH order by SRC_VIDEO_FRAME) as FIRST_FRAME_FILEPATH ' +
							'from SEQUENCE_FRAME_VIEW where IMAGERY_PACKAGE_UUID = ? group by SEQUENCE_CLIP_UUID ) FF on FF.SEQUENCE_CLIP_UUID = CV.SEQUENCE_CLIP_UUID ';
				query += whereClause;
				query += ' ORDER BY FF.FIRST_FRAME_FILEPATH limit ? offset ? ';
				params.push(limit);
				params.push(offset);

				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					obj.results = rows
					obj.offset = offset;
					obj.limit = limit;
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

	app.get("/getClip", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('select distinct CV.* from SEQUENCE_CLIP_VIEW CV where SEQUENCE_CLIP_UUID = ?');
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

	app.post("/getClipFrames", (req, res) => {
		let id = req.body.id;
		let source = req.body.source;
		let type = req.body.type;
		let labels = req.body.labels;

		let client = req.db;
		// setup the parameter array, with the first value being the imagery package uuid
		let params = [], prefix = ' where ', whereClause = '', hasAnnotationTable = false;
		
		// add necessary joins based on the annotation source and type values
		// label type = SEQUENCE_FRAME_TRACK_ANNOTATION & SEQUENCE_CLIP_FRAME_LABEL
		// faces type = SEQUENCE_FRAME_FACE_ANNOTATION
		// text type = SEQUENCE_FRAME_TEXT_ANNOTATION
		// join also with the annotation_package_data_card so we can filter by source and type
		if (type === 'labels')  {
			whereClause += 'inner join SEQUENCE_FRAME_TRACK_ANNOTATION A on A.SEQUENCE_FRAME_UUID = FV.SEQUENCE_FRAME_UUID ';
			hasAnnotationTable = true;
		}
		else if (type === 'faces')  {
			whereClause += 'inner join SEQUENCE_FRAME_FACE_ANNOTATION A on A.SEQUENCE_FRAME_UUID = FV.SEQUENCE_FRAME_UUID ';
		}
		else if (type === 'text')  {
			whereClause += 'inner join SEQUENCE_FRAME_TEXT_ANNOTATION A on A.SEQUENCE_FRAME_UUID = FV.SEQUENCE_FRAME_UUID ';
		}
		whereClause += 'INNER JOIN ANNOTATION_PACKAGE_DATA_CARD APDC ON APDC.ANNOTATION_PACKAGE_UUID = A.ANNOTATION_PACKAGE_UUID ';
		whereClause += prefix + 'APDC.ANNOTATION_SOURCE = ? and APDC.ANALYSIS_TYPE = ? ';
		params.push(source);
		params.push(type);
		prefix = ' and ';
		
		// next, build the where clause for the query.  this clause will be applied to the count query and the query to retrieve the actual results.
		// include annotation query stuff first so we can add the inner join
		if (labels !== undefined && parseInt(labels.length) > 0)  {
			if (!hasAnnotationTable)  {
				whereClause += 'inner join SEQUENCE_FRAME_TRACK_ANNOTATION A on A.SEQUENCE_FRAME_UUID = FV.SEQUENCE_FRAME_UUID ';
			}
			// convert the labels string into an array, using the comma as a delimiter
			var labelsArr = labels.split(',');
			var labelsQuery = ' (';
			var labelsPrefix = ' ';
			labelsArr.forEach(function(val)  {
				labelsQuery += labelsPrefix + 'A.LABEL_NAME = ? ';
				params.push(val);
				labelsPrefix = ' or ';
			})
			labelsQuery += ') '
			whereClause += prefix + labelsQuery;
			prefix = ' and ';
		}
		// append the id to where clause
		whereClause += prefix + ' FV.SEQUENCE_CLIP_UUID = ? ';
		params.push(id);
		
		let stmt, query;
		async.waterfall([
			// first, execute the query for the total matching rows
			function (done) {
				query = 'select count(distinct FV.SEQUENCE_FRAME_UUID) as TOTAL from SEQUENCE_FRAME_VIEW FV ';
				query += whereClause;

				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {total: rows[0].TOTAL});
				});
			},
			// now execute the actual query
			function (obj, done) {
				// start forming the query 
				query = 'select distinct FV.SEQUENCE_FRAME_UUID, FV.FRAME_FILENAME, FV.SEQ_FRAME, FV.FILE_SIZE_BYTES, FV.ORIGINAL_TIMESTAMP from SEQUENCE_FRAME_VIEW FV ';
				query += whereClause + ' order by FV.SEQ_FRAME asc';

				stmt = client.prepare(query);
				stmt.exec(params, function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					obj.results = rows
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

	app.get("/getFrame", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		
		let stmt, query;
		async.waterfall([
			// first, get the frame data
			function (done) {
				query = 'select * from SEQUENCE_FRAME_VIEW FV where SEQUENCE_FRAME_UUID = ? ';
				stmt = client.prepare(query);
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					done(null, {metadata: rows[0]});
				});
			},
			// now get the frame annotations (if available)
			function (obj, done) {
				// start forming the query 
				query = 'select * from SEQUENCE_FRAME_OBJECTS_VIEW where SEQUENCE_FRAME_UUID = ? ';
				stmt = client.prepare(query);
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					obj.annotations = rows
					done(null, obj);
				});
			},
			// now get the frame labels for chart (if available)
			function (obj, done) {
				// start forming the query 
				query = 'select distinct LABEL_NAME, count(LABEL_NAME) as COUNT from SEQUENCE_FRAME_OBJECTS_VIEW ' +
					'where SEQUENCE_FRAME_UUID = ? group by LABEL_NAME order by count(LABEL_NAME) desc, LABEL_NAME'
				stmt = client.prepare(query);
				stmt.exec([id], function (err, rows) {
					if (err) {
						console.log(err);
						return next(err);
					}
					obj.labelCounts = rows
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
	
	app.get("/getFrameAnnotations", (req, res) => {
		let frameId = req.query.frameId;
		let annoSource = req.query.annoSource;
		let annoType = req.query.annoType;

		let client = req.db;
		hdbext.loadProcedure(client, marinaConfig.schema, "GET_ANNOTATIONS_FOR_SEQUENCE_FRAME", function(err, sp)  {
			if (err)  {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			sp({"IN_SEQUENCE_FRAME_UUID": frameId, "IN_ANNOTATION_SOURCE": annoSource, "IN_ANALYSIS_TYPE": annoType, "MINIMUM_CONFIDENCE": 0}, function(spErr, parameters, annotations)  {
				if (spErr)  {
					res.json({
						status: 401,
						message: "ERR",
						data: spErr
					});
				}
				else  {
					res.json({
						status: 200,
						message: "OK",
						data: annotations
					});
				}
				
			});	
		});
	});

	app.get("/getClipAnnotations", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('select distinct OBJECT_ID, OBJECT_NAME, LABEL_NAME, OBJECT_FRAME_COUNT from SEQUENCE_CLIP_OBJECTS_VIEW ' +
					'where SEQUENCE_CLIP_UUID = ? order by OBJECT_FRAME_COUNT desc, OBJECT_NAME');
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
	
	app.get("/getClipLabels", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('select distinct LABEL_NAME, count(LABEL_NAME) as COUNT from SEQUENCE_CLIP_OBJECTS_VIEW ' +
					'where SEQUENCE_CLIP_UUID = ? group by LABEL_NAME order by count(LABEL_NAME) desc, LABEL_NAME');
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
	
	app.get("/getFrameLabels", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		let stmt = client.prepare('select distinct LABEL_NAME, count(LABEL_NAME) as COUNT from SEQUENCE_FRAME_OBJECTS_VIEW ' +
					'where SEQUENCE_FRAME_UUID = ? group by LABEL_NAME order by count(LABEL_NAME) desc, LABEL_NAME');
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

	app.get("/getAnnotationSources", (req, res) => {
		let id = req.query.imageryId;
		let client = req.db;
		let stmt = client.prepare('select distinct C.ANNOTATION_PACKAGE_UUID, C.ANNOTATION_SOURCE from ANNOTATION_PACKAGE_DATA_CARD C ' +
									'inner join SEQUENCE_FRAME_TRACK_ANNOTATION A on A.ANNOTATION_PACKAGE_UUID = C.ANNOTATION_PACKAGE_UUID ' +
									'where A.IMAGERY_PACKAGE_UUID = ?');
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

	app.get("/writeClipAnnotations", (req, res) => {
		let clipId = req.query.clipId;
		let objectIds = req.query.objectIds;
		let fileName = "/tmp/ip_anno_" + uuidv4() + ".json";
	
		let client = req.db;
		hdbext.loadProcedure(client, marinaConfig.schema, "GET_ANNOTATIONS_FOR_SEQUENCE_CLIP", function(err, sp)  {
			if (err)  {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			sp({"IN_SEQUENCE_CLIP_UUID": clipId, "FILTER_OBJECT_IDS_LIST": objectIds},function(spErr, parameters, dummyRows)  {
				if (spErr)  {
					res.json({
						status: 401,
						message: "ERR",
						data: spErr
					});
				}
				else  {
					fs.writeFile(fileName, JSON.stringify(dummyRows), fsErr =>  {
						if (fsErr)  {
							res.json({
								status: 401,
								message: "ERR",
								data: fsErr
							});
						}
						else  {
							res.json({
								status: 200,
								message: "OK",
								data: {fileName: fileName}
							});
						}
					});
					
				}
				
			});	
		});
	});

	app.route("/callAnnotateClip").get(function (req, resp, next) {
	    var objStr = req.query.obj;
	    var output = "";
	    
	    const pythonProcess = spawn('python3', [videoDataDir + '/AnnotateVideoClipApplication.py', objStr]);

		pythonProcess.stdout.on('data', function (data) {
		    output += data;
		});
		pythonProcess.on('close', function (code) {
		    if (output && output.length > 0) {
		        resp.json({
		            status: 200,
		            message: "OK",
		            data: JSON.parse(output)
		        });
		    } else {
		        resp.json({
		            status: 401,
		            message: "ERR",
		            data: {
		                message: "No data."
		            }
		        });
		    }
		});
		pythonProcess.on('error', function (err) {
		    resp.json({
		        status: 401,
		        message: "ERR",
		        data: err
		    });
		});
	});
	
	app.get("/getFramesHeatMap", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		hdbext.loadProcedure(client, marinaConfig.schema, "GET_FRAMES_HEAT_MAP", function(err, sp)  {
			if (err)  {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			sp({}, function(spErr, parameters, heatMap)  {
				if (spErr)  {
					res.json({
						status: 401,
						message: "ERR",
						data: spErr
					});
				}
				else  {
					res.json({
						status: 200,
						message: "OK",
						data: heatMap
					});
				}
				
			});	
		});
	});
	
	app.get("/getClassificationFilters", (req, res) => {
		let filters = req.query.filters;

		let client = req.db;
		let query = "select CLASSIFICATION as NAME, count(distinct v.IMAGERY_PACKAGE_UUID) as TOTAL, ";
		if (filters && filters["CLASSIFICATION"])  {
			query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM IMAGERY_PACKAGE_SUMMARY_VIEW v2 WHERE " +
					"CLASSIFICATION IN (\'" + filters["CLASSIFICATION"].join("\',\'") + "\') AND v2.CLASSIFICATION = d.CLASSIFICATION ) AS SELECTED ";
		}
		else  {
			query += " 'false' as SELECTED ";
		}
		query += "from IMAGERY_PACKAGE_SUMMARY_VIEW v ";
		if (filters && filters.LABEL_NAME)  {
			query += "INNER JOIN SEQUENCE_FRAME_TRACK_ANNOTATION s ON v.IMAGERY_PACKAGE_UUID = s.IMAGERY_PACKAGE_UUID ";
		}
		if (filters)  {
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by CLASSIFICATION order by count(distinct v.IMAGERY_PACKAGE_UUID) desc ";

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
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});	
	
	app.get("/getPlatformFilters", (req, res) => {
		let filters = req.query.filters;

		let client = req.db;
		let query = "select IFNULL(NAME, 'UNKNOWN') as NAME, TOTAL, SELECTED " +
					"from (select distinct v.PLATFORM_TYPE as NAME, count(1) as TOTAL, 'false' as SELECTED from VIDEO_DETAIL_VIEW v " +
					"group by v.PLATFORM_TYPE) order by TOTAL DESC ";
		
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
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});	
	
	app.get("/getImageryTypeFilters", (req, res) => {
		let filters = req.query.filters;

		let client = req.db;
		let query = "select IMAGERY_PACKAGE_TYPE as NAME, count(distinct v.IMAGERY_PACKAGE_UUID) as TOTAL, ";
		if (filters && filters["IMAGERY_PACKAGE_TYPE"])  {
			query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM IMAGERY_PACKAGE_SUMMARY_VIEW v2 WHERE " +
					"IMAGERY_PACKAGE_TYPE IN (\'" + filters["IMAGERY_PACKAGE_TYPE"].join("\',\'") + "\') AND v2.IMAGERY_PACKAGE_TYPE = d.IMAGERY_PACKAGE_TYPE ) AS SELECTED ";
		}
		else  {
			query += " 'false' as SELECTED ";
		}
		query += "from IMAGERY_PACKAGE_SUMMARY_VIEW v ";
		if (filters && filters.LABEL_NAME)  {
			query += "INNER JOIN SEQUENCE_FRAME_TRACK_ANNOTATION s ON v.IMAGERY_PACKAGE_UUID = s.IMAGERY_PACKAGE_UUID ";
		}
		if (filters)  {
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by IMAGERY_PACKAGE_TYPE order by count(distinct v.IMAGERY_PACKAGE_UUID) desc ";

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
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});	
	
	app.get("/getTeDesignationFilters", (req, res) => {
		let filters = req.query.filters;

		let client = req.db;
		let query = "select TE_DESIGNATION as NAME, count(distinct v.IMAGERY_PACKAGE_UUID) as TOTAL, ";
		if (filters && filters["TE_DESIGNATION"])  {
			query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM IMAGERY_PACKAGE_SUMMARY_VIEW v2 WHERE TE_DESIGNATION " +
					"IN (\'" + filters["TE_DESIGNATION"].join("\',\'") + "\') AND v2.TE_DESIGNATION = v.TE_DESIGNATION ) AS SELECTED ";
		}
		else  {
			query += " 'false' as SELECTED ";
		}
		query += "from IMAGERY_PACKAGE_SUMMARY_VIEW v ";
		if (filters && filters.LABEL_NAME)  {
			query += "INNER JOIN SEQUENCE_FRAME_TRACK_ANNOTATION s ON v.IMAGERY_PACKAGE_UUID = s.IMAGERY_PACKAGE_UUID ";
		}
		if (filters)  {
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by TE_DESIGNATION order by count(distinct v.IMAGERY_PACKAGE_UUID) desc ";

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
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});	
	
	app.get("/getLabelFilters", (req, res) => {
		let filters = req.query.filters;

		let client = req.db;
		let query = 'select v.label_name as NAME, count(distinct v.IMAGERY_PACKAGE_UUID) as TOTAL, ';
		if (filters && filters["LABEL_NAME"])  {
			query += " (SELECT (CASE WHEN count(*) > 0 THEN 'true' ELSE 'false' END ) FROM sequence_frame_track_annotation v2 " +
					"WHERE LABEL_NAME IN (\'" + filters["LABEL_NAME"].join("\',\'") + "\') AND v2.LABEL_NAME = v.LABEL_NAME ) AS SELECTED ";
		}
		else  {
			query += " 'false' as SELECTED ";
		}
		query += 'from sequence_frame_track_annotation v ';
		if (filters)  {
			query += "INNER JOIN IMAGERY_PACKAGE_SUMMARY_VIEW s ON v.IMAGERY_PACKAGE_UUID = s.IMAGERY_PACKAGE_UUID ";
			var keys = Object.keys(filters);
			keys.forEach(function(key)  {
				var vals = filters[key];
				if (vals)  {
					query += " and " + key + " in (\'" + vals.join("\',\'") + "\') ";
				}
			});
		}
		query += "group by v.label_name order by count(distinct v.IMAGERY_PACKAGE_UUID) desc ";
		
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
				res.json({
					status: 200,
					message: "OK",
					data: rows
				});
			}
		});
	});
	
	app.get("/getAnalysisTypesByClipId", (req, res) => {
		let id = req.query.id;
		let client = req.db;
		hdbext.loadProcedure(client, marinaConfig.schema, "GET_ANNOTATION_STATUS_FOR_SEQUENCE_CLIP", function(err, sp)  {
			if (err)  {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			sp({"SEQUENCE_CLIP_UUID": id}, function(spErr, parameters, annotationTypes)  {
				if (spErr)  {
					res.json({
						status: 401,
						message: "ERR",
						data: spErr
					});
				}
				else  {
					res.json({
						status: 200,
						message: "OK",
						data: annotationTypes
					});
				}
				
			});	
		});
	});
	
	app.get("/createAnnotationRequest", (req, res) => {
		let imageryId = req.query.imageryId;
		let clipId = req.query.clipId;
		let source = req.query.source;
		let type = req.query.type;
		let userid = req.user.id;

		let client = req.db;
		hdbext.loadProcedure(client, marinaConfig.schema, "CREATE_ANNOTATION_REQUEST", function(err, sp)  {
			if (err)  {
				res.json({
					status: 401,
					message: "ERR",
					data: err
				});
			}
			sp({"IMAGERY_PACKAGE_UUID": imageryId, "SEQUENCE_CLIP_UUID": clipId, "SEQ_FRAME": null, "ANNOTATION_SOURCE": source, "ANALYSIS_TYPE": type, "USERNAME": userid}, function(spErr, parameters, annotationId)  {
				if (spErr)  {
					res.json({
						status: 401,
						message: "ERR",
						data: spErr
					});
				}
				else  {
					res.json({
						status: 200,
						message: "OK",
						data: parameters
					});
				}
				
			});	
		});
	});
	
	app.get("/getAnnotationRequestStatus", (req, res) => {
		let annotationId = req.query.id;

		let client = req.db;
		let query = "select STATUS, STATUS_MESSAGE, STATUS_TIMESTAMP from ANNOTATION_REQUEST where ANNOTATION_PACKAGE_UUID = ?";
		
		let stmt = client.prepare(query);
		stmt.exec([annotationId], function (err, rows) {
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