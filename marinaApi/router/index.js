/*eslint no-console: 0, no-unused-vars: 0, no-undef:0, no-process-exit:0*/
/*eslint-env node, es6 */
"use strict";

module.exports = (app, server) => {
	app.use("/config", require("./routes/config")());
	app.use("/data", require("./routes/data")());
	app.use("/model", require("./routes/model")());
	app.use("/imagery", require("./routes/imagery")());
	app.use("/mgmt", require("./routes/mgmt")());
	app.use("/dashboard", require("./routes/dashboard")());

	app.use( (err, req, res, next) => {
		console.error(JSON.stringify(err));
		res.status(500).send(`System Error ${JSON.stringify(err)}`);
	});

};