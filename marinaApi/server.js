const compression = require('compression');
const server = require("http").createServer();
const express = require('express');
const hdbext = require('@sap/hdbext');
const xsenv = require('@sap/xsenv');
const passport = require('passport');
const JWTStrategy = require('@sap/xssec').JWTStrategy;
const bodyParser = require('body-parser');

//logging
let logging = require("@sap/logging");
let appContext = logging.createAppContext();

// set the config file directory for the config module to read
// first, figure out which XSA Space we're in...
let vcap = JSON.parse(process.env.VCAP_APPLICATION);
let space = vcap.space_name;
// then, append the space to the config directory
process.env["NODE_CONFIG_DIR"] = "/home/saphdbxsa/config/marina/" + space;

const config = require('config');
const marinaConfig = config.get("HANA.DATA_BROKER");

var services = xsenv.getServices({
	uaa: {
		tag: 'xsuaa'
	}
});

var port = process.env.PORT || 3000;
var app = express();
app.use(compression());

//Add XS Logging to Express
app.use(logging.middleware({
	appContext: appContext,
	logNetwork: true
}));

passport.use(new JWTStrategy(services.uaa));

app.use(bodyParser.urlencoded({limit: '50MB', extended: true, parameterLimit:50000}));

app.use(passport.initialize());
app.use(
	hdbext.middleware(marinaConfig),
	passport.authenticate('JWT', {
		session: false
	})
);

//Setup Additional Node.js Routes
require("./router")(app, server);

//Start the Server
server.on("request", app);
server.listen(port, function () {
	console.info(`HTTP Server: ${server.address().port}`);
});