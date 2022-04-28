const compression = require('compression');
const server = require("http").createServer();
const express = require('express');
const hdbext = require('@sap/hdbext');
const xsenv = require('@sap/xsenv');
const passport = require('passport');
const fs = require('fs')
const stream = require('stream')
const JWTStrategy = require('@sap/xssec').JWTStrategy;
const bodyParser = require('body-parser');
var cors = require('cors')
require('dotenv').config();

//logging
let logging = require("@sap/logging");
let appContext = logging.createAppContext();
let URL = process.env.URL;

const config = require('config');
const marinaConfig = config.get("HANA.DATA_BROKER");

/*
var services = xsenv.getServices({
	uaa: {
		tag: 'xsuaa'
	}
});
*/
var port = process.env.PORT || 3000;
var app = express();
app.use(cors())
app.get("/config/getCurrentUser", (req, res) => {
	
	res.send({
		status: 200,
		message: "OK",
		data:{
			"username": "TEST",
			"firstname": "Test",
			"lastname": "User",
			"admin": true,
			"approver": true,
			"approverType": "MARINA_DB_APPROVER1",
			"cui": true,
			"uncontrolled": true,
			"editor": true
		  }
    });
});

app.get("/config/getAppConfig", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: {
		  DI_URL: "https://ae5fc0f718e1249419ed6c0006a6bc7d-586177789.us-gov-west-1.elb.amazonaws.com/login/?redirectUrl=%2Fapp%2Fdatahub-app-launchpad%2F",
		  BOBJ_URL: "http://ec2-3-32-89-150.us-gov-west-1.compute.amazonaws.com:8080/BOE/OpenDocument/opendoc/custom.jsp?sIDType=CUID&iDocID=AeggPH6LHy1MpPCpeIAYwgw&sStoryName=Story%20-01&sPageNumber=1&sRefresh=true"
		}
	  });
});

app.get("/config/getDataSetSources", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"NAME": "ACLED"
			},
			{
				"NAME": "Air Force"
			},
			{
				"NAME": "Apple"
			},
			{
				"NAME": "AutoTrader"
			},
			{
				"NAME": "BEA"
			},
			{
				"NAME": "BLS"
			},
			{
				"NAME": "CBP"
			},
			{
				"NAME": "CDC"
			},
			{
				"NAME": "CMS"
			},
			{
				"NAME": "COVID Tracking Project"
			},
			{
				"NAME": "Census"
			},
			{
				"NAME": "Change Healthcare"
			},
			{
				"NAME": "Columbia University"
			},
			{
				"NAME": "CoronaDataScraper.com"
			},
			{
				"NAME": "CovidActNow.com"
			},
			{
				"NAME": "CovidTracking.com"
			},
			{
				"NAME": "DATA.GOV"
			},
			{
				"NAME": "DHS"
			},
			{
				"NAME": "DOL"
			},
			{
				"NAME": "Data.gov"
			},
			{
				"NAME": "Definitive Healthcare"
			},
			{
				"NAME": "EU Data Portal"
			},
			{
				"NAME": "Education Week"
			},
			{
				"NAME": "Equifax"
			},
			{
				"NAME": "Esri"
			},
			{
				"NAME": "European Center for Disease Prevention and Control"
			},
			{
				"NAME": "Eurostat"
			},
			{
				"NAME": "FDA"
			},
			{
				"NAME": "Feeding America"
			},
			{
				"NAME": "Fouresquare"
			},
			{
				"NAME": "GBSP"
			},
			{
				"NAME": "Google"
			},
			{
				"NAME": "HHS"
			},
			{
				"NAME": "HUD"
			},
			{
				"NAME": "Hc1"
			},
			{
				"NAME": "Healthdata.org"
			},
			{
				"NAME": "Humetrix"
			},
			{
				"NAME": "IRS"
			},
			{
				"NAME": "JHUAPL"
			},
			{
				"NAME": "JRC"
			},
			{
				"NAME": "KFF"
			},
			{
				"NAME": "Kaggle"
			},
			{
				"NAME": "Kaiser Family Foundation (KFF)"
			},
			{
				"NAME": "Medicare.gov"
			},
			{
				"NAME": "Microsoft"
			},
			{
				"NAME": "NIFC"
			},
			{
				"NAME": "NPGEO"
			},
			{
				"NAME": "NYTimes"
			},
			{
				"NAME": "National Association of Counties"
			},
			{
				"NAME": "New York Times"
			},
			{
				"NAME": "Open Street Maps"
			},
			{
				"NAME": "Our World in Data"
			},
			{
				"NAME": "Oxford University"
			},
			{
				"NAME": "Park City Group"
			},
			{
				"NAME": "RelevantData"
			},
			{
				"NAME": "Safe Graph"
			},
			{
				"NAME": "Sciensano (Belgium Institute of Health)"
			},
			{
				"NAME": "Shoreland"
			},
			{
				"NAME": "SouperBowlofCaring"
			},
			{
				"NAME": "Surgo Foundation"
			},
			{
				"NAME": "UNKNOWN"
			},
			{
				"NAME": "US Census Bureau"
			},
			{
				"NAME": "USAFacts"
			},
			{
				"NAME": "USDA"
			},
			{
				"NAME": "Unacast"
			},
			{
				"NAME": "United Nations"
			},
			{
				"NAME": "WHO"
			},
			{
				"NAME": "Wikipedia"
			}
		]
	});
});

app.get("/config/getDataSetCategoryWithIcons", (req, res) => {
	
	res.send({
		status: 200,
		message: "OK",
		data: [
			{
				"NAME": "Location/Map Data",
				"ICON": "sap-icon://map-2"
			},
			{
				"NAME": "Government",
				"ICON": "sap-icon://official-service"
			},
			{
				"NAME": "Disaster",
				"ICON": "sap-icon://BusinessSuiteInAppSymbols/icon-fire"
			},
			{
				"NAME": "Mobility",
				"ICON": "sap-icon://BusinessSuiteInAppSymbols/icon-foot-steps"
			},
			{
				"NAME": "Infection Statistics",
				"ICON": "sap-icon://syringe"
			},
			{
				"NAME": "Financial",
				"ICON": "sap-icon://BusinessSuiteInAppSymbols/icon-bank-account"
			},
			{
				"NAME": "Other",
				"ICON": "sap-icon://database"
			},
			{
				"NAME": "Hospital/PPE Statistics",
				"ICON": "sap-icon://accidental-leave"
			},
			{
				"NAME": "Population/Economics",
				"ICON": "sap-icon://family-care"
			},
			{
				"NAME": "Transportation",
				"ICON": "sap-icon://car-rental"
			},
			{
				"NAME": "Food Supply Chain",
				"ICON": "sap-icon://BusinessSuiteInAppSymbols/icon-goods"
			},
			{
				"NAME": "Agriculture",
				"ICON": "sap-icon://e-care"
			}
		]
    });
});

app.get("/config/getS3Config", (req, res) => {
	res.send({
		imageryBucket: "marina-imagery-packages-dev",
		dataBrokerBucket: "marina-download",
		bucketRegion: "us-gov-west-1"
	  });
});

app.get("/config/getLabelConfig", (req, res) => {
	res.send({
		labelConfig: [
		  {
			LABEL_CONFIG_ID: "817D00601AB2775D1700500239205622",
			LABEL_NAME: "person",
			LABEL_COLOR: "red",
			LABEL_ICON: "sap-icon://SAP-icons-TNT/actor",
			LABEL_COLOR_B: 0,
			LABEL_COLOR_G: 0,
			LABEL_COLOR_R: 255
		  },
		  {
			LABEL_CONFIG_ID: "807D00601AB2775D1700500239205622",
			LABEL_NAME: "truck",
			LABEL_COLOR: "blue",
			LABEL_ICON: "sap-icon://BusinessSuiteInAppSymbols/icon-box-truck-empty",
			LABEL_COLOR_B: 255,
			LABEL_COLOR_G: 0,
			LABEL_COLOR_R: 0
		  },
		  {
			LABEL_CONFIG_ID: "837D00601AB2775D1700500239205622",
			LABEL_NAME: "animal",
			LABEL_COLOR: "darkviolet",
			LABEL_ICON: "sap-icon://Netweaver-business-client",
			LABEL_COLOR_B: 211,
			LABEL_COLOR_G: 0,
			LABEL_COLOR_R: 148
		  },
		  {
			LABEL_CONFIG_ID: "847D00601AB2775D1700500239205622",
			LABEL_NAME: "uncategorized",
			LABEL_COLOR: "orange",
			LABEL_ICON: "sap-icon://question-mark",
			LABEL_COLOR_B: 0,
			LABEL_COLOR_G: 165,
			LABEL_COLOR_R: 255
		  },
		  {
			LABEL_CONFIG_ID: "827D00601AB2775D1700500239205622",
			LABEL_NAME: "car",
			LABEL_COLOR: "green",
			LABEL_ICON: "sap-icon://car-rental",
			LABEL_COLOR_B: 0,
			LABEL_COLOR_G: 128,
			LABEL_COLOR_R: 0
		  }
		]
	  });
});

app.get("/data/getUserSubscriptions", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
			{
				NAME: "subscription 1",
				LAST_UPDATED_TIMESTAMP: "Feb 01, 2022 09:09:09",
				PRIME_CATEGORY: "icon",
				DATA_SET_ID: "ID1"
			}
		]
    });
});

app.get("/data/getDownloadsCount", (req, res) => {
	
	res.send({
		status: 200,
		message: "OK",
		data: 1
    });
});

app.get("/data/getRejectedCount", (req, res) => {
	
	res.send({
		status: 200,
		data: 3
    });
});

app.get("/data/getApprovalsCount", (req, res) => {
	
	res.send({
		status: 200,
		data: 7
    });
});

app.get("/model/getClassificationFilters", (req, res) => {
	
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			NAME: "UNCLASSIFIED",
			TOTAL: 11,
			SELECTED: "false"
		  },
		  {
			NAME: "CUI",
			TOTAL: 1,
			SELECTED: "false"
		  }
		]
	  });
});

app.get("/model/getModelTypeFilters", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			NAME: "Supervised Neural Network",
			TOTAL: 2,
			SELECTED: "false"
		  },
		  {
			NAME: "Other",
			TOTAL: 2,
			SELECTED: "false"
		  },
		  {
			NAME: "Supervised",
			TOTAL: 1,
			SELECTED: "false"
		  },
		  {
			NAME: "Neural Network",
			TOTAL: 1,
			SELECTED: "false"
		  },
		  {
			NAME: "N/A",
			TOTAL: 1,
			SELECTED: "false"
		  },
		  {
			NAME: "Linear Regression",
			TOTAL: 1,
			SELECTED: "false"
		  },
		  {
			NAME: "Supervised - Lasso Regression",
			TOTAL: 1,
			SELECTED: "false"
		  },
		  {
			NAME: "Agent Based Modeling",
			TOTAL: 1,
			SELECTED: "false"
		  },
		  {
			NAME: "Random Forest/Generalized Linear",
			TOTAL: 1,
			SELECTED: "false"
		  },
		  {
			NAME: "Apriori",
			TOTAL: 1,
			SELECTED: "false"
		  }
		]
	  });
});

app.get("/model/getDeveloperFilters", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"NAME": "Amazon Web Services",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "IBM",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Dell Technologies",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "SAP NS2",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Humetrix",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Covid Act Now",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "MSFT",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Lucd Inc.",
			"TOTAL": 1,
			"SELECTED": "false"
		  }
		]
	  });
});

app.get("/model/searchModelCards", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: {
		  "total": 12,
		  "limit": "10",
		  "offset": "0",
		  "results": [
			{
			  "MODEL_CARD_ID": "866500C0CB9CD49C1700C40210085FCE",
			  "LAST_UPDATED_TIMESTAMP": "2021-06-17 13:34:26.767000000",
			  "MODEL_NAME": "ACLED",
			  "DESCRIPTION": "The Apriori algorithm runs through the ACLED (Armed Conflict Location and Event Dataset) and builds clusters of similar events in order to find trends in activity across the globe",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Apriori",
			  "MODEL_DEVELOPER": "SAP NS2",
			  "NUM_DATA_SETS": 2,
			  "NUM_VIEWS": 32
			},
			{
			  "MODEL_CARD_ID": "7DD200B0714E9B7F1700480269F90446",
			  "LAST_UPDATED_TIMESTAMP": "2021-04-14 14:25:41.531000000",
			  "MODEL_NAME": "U.S. Veteran Mental Health",
			  "DESCRIPTION": "Analyzes the rate of suicide and mental health issues of U.S. veterans as a comparison to the general U.S. civilian population using Random Forest and Generalized Linear Regression",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Random Forest/Generalized Linear",
			  "MODEL_DEVELOPER": "SAP NS2",
			  "NUM_DATA_SETS": 2,
			  "NUM_VIEWS": 258
			},
			{
			  "MODEL_CARD_ID": "587200F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2021-03-09 20:30:46.596000000",
			  "MODEL_NAME": "Food Supply Chain Index - Meat",
			  "DESCRIPTION": "Supply Chain Comparative Risk Score",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Other",
			  "MODEL_DEVELOPER": "IBM",
			  "NUM_DATA_SETS": 4,
			  "NUM_VIEWS": 42
			},
			{
			  "MODEL_CARD_ID": "037200F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2021-01-22 18:21:31.784000000",
			  "MODEL_NAME": "Disease Progression Model",
			  "DESCRIPTION": "Infection and Hospitalization Numbers",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Other",
			  "MODEL_DEVELOPER": "Covid Act Now",
			  "NUM_DATA_SETS": 0,
			  "NUM_VIEWS": 40
			},
			{
			  "MODEL_CARD_ID": "E86F00F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2021-01-19 15:09:30.191000000",
			  "MODEL_NAME": "Medicare COVID-19 Hospitalization Risk by county or zip code",
			  "DESCRIPTION": "Hospital, ICU, and Ventilator Use for Medicare COVID-19 cases",
			  "MODEL_CLASSIFICATION": "CUI",
			  "MODEL_TYPE": "Supervised",
			  "MODEL_DEVELOPER": "Humetrix",
			  "NUM_DATA_SETS": 5,
			  "NUM_VIEWS": 32
			},
			{
			  "MODEL_CARD_ID": "036C00F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2021-01-07 14:12:52.289000000",
			  "MODEL_NAME": "DeepAR Repositrak SC",
			  "DESCRIPTION": "Forecast commodities up to 4 weeks out",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Supervised Neural Network",
			  "MODEL_DEVELOPER": "Amazon Web Services",
			  "NUM_DATA_SETS": 0,
			  "NUM_VIEWS": 10
			},
			{
			  "MODEL_CARD_ID": "A76900F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2021-01-07 13:50:20.980000000",
			  "MODEL_NAME": "DeepAR COVID-19 Clusters",
			  "DESCRIPTION": "Forecast cases 7 days or 4 weeks into future",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Supervised Neural Network",
			  "MODEL_DEVELOPER": "Amazon Web Services",
			  "NUM_DATA_SETS": 4,
			  "NUM_VIEWS": 33
			},
			{
			  "MODEL_CARD_ID": "9D8D00F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2020-12-07 18:48:19.284000000",
			  "MODEL_NAME": "Avicenna",
			  "DESCRIPTION": "Predicts Pandemic Spread into the future and impact on population given defined parameters.",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Agent Based Modeling",
			  "MODEL_DEVELOPER": "Lucd Inc.",
			  "NUM_DATA_SETS": 0,
			  "NUM_VIEWS": 151
			},
			{
			  "MODEL_CARD_ID": "CB7200F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2020-08-17 14:23:18.000000000",
			  "MODEL_NAME": "Pandemic Disruption Index",
			  "DESCRIPTION": "COVID Index Risk Score",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Neural Network",
			  "MODEL_DEVELOPER": "IBM",
			  "NUM_DATA_SETS": 0,
			  "NUM_VIEWS": 6
			},
			{
			  "MODEL_CARD_ID": "C68C00F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2020-08-17 14:23:18.000000000",
			  "MODEL_NAME": "Action recommendation",
			  "DESCRIPTION": "Recommended action",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "N/A",
			  "MODEL_DEVELOPER": "Dell Technologies",
			  "NUM_DATA_SETS": 0,
			  "NUM_VIEWS": 6
			}
		  ]
		}
	  });
});

app.get("/dashboard/getLoadStatus", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"LOAD_STATUS": "Ingest Ongoing",
			"COUNT": 51
		  },
		  {
			"LOAD_STATUS": "Available, Load Complete",
			"COUNT": 45
		  },
		  {
			"LOAD_STATUS": "Unknown",
			"COUNT": 20
		  },
		  {
			"LOAD_STATUS": "SAMPLE",
			"COUNT": 6
		  },
		  {
			"LOAD_STATUS": "Ingest Paused",
			"COUNT": 5
		  },
		  {
			"LOAD_STATUS": "Ingest Ongoing, Manual",
			"COUNT": 1
		  },
		  {
			"LOAD_STATUS": "Sample",
			"COUNT": 1
		  },
		  {
			"LOAD_STATUS": "",
			"COUNT": 1
		  }
		]
	});		
});

app.get("/dashboard/getLoadFreq", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"LOAD_FREQUENCY": "One Time",
			"COUNT": 39
		  },
		  {
			"LOAD_FREQUENCY": "Daily",
			"COUNT": 21
		  },
		  {
			"LOAD_FREQUENCY": "Weekly",
			"COUNT": 20
		  },
		  {
			"LOAD_FREQUENCY": "Unknown",
			"COUNT": 20
		  },
		  {
			"LOAD_FREQUENCY": "Periodically",
			"COUNT": 15
		  },
		  {
			"LOAD_FREQUENCY": "Bi-Weekly",
			"COUNT": 4
		  },
		  {
			"LOAD_FREQUENCY": "",
			"COUNT": 3
		  },
		  {
			"LOAD_FREQUENCY": "Monthly",
			"COUNT": 3
		  },
		  {
			"LOAD_FREQUENCY": "Quarterly",
			"COUNT": 3
		  },
		  {
			"LOAD_FREQUENCY": "Bi-Monthly",
			"COUNT": 1
		  },
		  {
			"LOAD_FREQUENCY": "TBD",
			"COUNT": 1
		  }
		]
	});		
});

app.get("/dashboard/getAccessType", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"ACCESS_TYPE": "Open",
			"COUNT": 93
		  },
		  {
			"ACCESS_TYPE": "Unknown",
			"COUNT": 21
		  },
		  {
			"ACCESS_TYPE": "Procured",
			"COUNT": 11
		  },
		  {
			"ACCESS_TYPE": "CUI",
			"COUNT": 3
		  },
		  {
			"ACCESS_TYPE": "FOUO",
			"COUNT": 2
		  }
		]
	});		
});

app.get("/dashboard/getDataSetDownloadsByMonth", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"MONTH": '2019-08-03T12:34:56',
			"COUNT": 11
		  },
		  {
			"MONTH": '2019-09-03T12:34:56',
			"COUNT": 10
		  },
		  {
			"MONTH": '2019-10-03T12:34:56',
			"COUNT": 74
		  },
		  {
			"MONTH": '2019-11-03T12:34:56',
			"COUNT": 27
		  },
		  {
			"MONTH": '2019-12-03T12:34:56',
			"COUNT": 28
		  },
		  {
			"MONTH": '2020-01-03T12:34:56',
			"COUNT": 42
		  },
		  {
			"MONTH": '2020-02-03T12:34:56',
			"COUNT": 23
		  },
		  {
			"MONTH": '2020-03-03T12:34:56',
			"COUNT": 14
		  },
		  {
			"MONTH": '2020-04-03T12:34:56',
			"COUNT": 2
		  },
		  {
			"MONTH": '2019-05-03T12:34:56',
			"COUNT": 1
		  }
		]
	  });	
});	

app.get("/dashboard/getImageryDownloadsByMonth", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"MONTH": '2019-08-03T12:34:56',
			"COUNT": 1
		  },
		  {
			"MONTH": '2019-10-03T12:34:56',
			"COUNT": 2
		  }
		]
	  });	
});	

app.get("/dashboard/getModelViewsByMonth", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"MONTH": '2019-01-03T12:34:56',
			"COUNT": 74
		  },
		  {
			"MONTH": '2019-02-03T12:34:56',
			"COUNT": 8
		  },
		  {
			"MONTH": '2019-03-03T12:34:56',
			"COUNT": 130
		  },
		  {
			"MONTH": '2019-04-03T12:34:56',
			"COUNT": 71
		  },
		  {
			"MONTH": '2019-05-03T12:34:56',
			"COUNT": 110
		  },
		  {
			"MONTH": '2019-06-03T12:34:56',
			"COUNT": 49
		  },
		  {
			"MONTH": '2019-07-03T12:34:56',
			"COUNT": 48
		  },
		  {
			"MONTH": '2019-08-03T12:34:56',
			"COUNT": 40
		  },
		  {
			"MONTH": '2019-09-03T12:34:56',
			"COUNT": 70
		  },
		  {
			"MONTH": '2019-10-03T12:34:56',
			"COUNT": 61
		  },
		  {
			"MONTH": '2019-11-03T12:34:56',
			"COUNT": 11
		  }
		]
	  });	
});	

app.get("/dashboard/getCategoriesChart", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"PRIME_CATEGORY": "Population/Economics",
			"SUB_CATEGORY": "Education",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 29
		  },
		  {
			"PRIME_CATEGORY": "Population/Economics",
			"SUB_CATEGORY": "Employment",
			"SUB_COUNT": 5,
			"PRIME_COUNT": 29
		  },
		  {
			"PRIME_CATEGORY": "Population/Economics",
			"SUB_CATEGORY": "Food Security",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 29
		  },
		  {
			"PRIME_CATEGORY": "Population/Economics",
			"SUB_CATEGORY": "Infection Statistics",
			"SUB_COUNT": 4,
			"PRIME_COUNT": 29
		  },
		  {
			"PRIME_CATEGORY": "Population/Economics",
			"SUB_CATEGORY": "Medical",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 29
		  },
		  {
			"PRIME_CATEGORY": "Population/Economics",
			"SUB_CATEGORY": "Mobility",
			"SUB_COUNT": 2,
			"PRIME_COUNT": 29
		  },
		  {
			"PRIME_CATEGORY": "Population/Economics",
			"SUB_CATEGORY": "Unknown",
			"SUB_COUNT": 14,
			"PRIME_COUNT": 29
		  },
		  {
			"PRIME_CATEGORY": "Population/Economics",
			"SUB_CATEGORY": "Government",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 29
		  },
		  {
			"PRIME_CATEGORY": "Infection Statistics",
			"SUB_CATEGORY": "Government",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 24
		  },
		  {
			"PRIME_CATEGORY": "Infection Statistics",
			"SUB_CATEGORY": "Medicare Claims Data",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 24
		  },
		  {
			"PRIME_CATEGORY": "Infection Statistics",
			"SUB_CATEGORY": "Unknown",
			"SUB_COUNT": 22,
			"PRIME_COUNT": 24
		  },
		  {
			"PRIME_CATEGORY": "Food Supply Chain",
			"SUB_CATEGORY": "Food Security",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 15
		  },
		  {
			"PRIME_CATEGORY": "Food Supply Chain",
			"SUB_CATEGORY": "Location/Addresses",
			"SUB_COUNT": 4,
			"PRIME_COUNT": 15
		  },
		  {
			"PRIME_CATEGORY": "Food Supply Chain",
			"SUB_CATEGORY": "Supply Chain",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 15
		  },
		  {
			"PRIME_CATEGORY": "Food Supply Chain",
			"SUB_CATEGORY": "Unknown",
			"SUB_COUNT": 9,
			"PRIME_COUNT": 15
		  },
		  {
			"PRIME_CATEGORY": "Hospital/PPE Statistics",
			"SUB_CATEGORY": "Infection Statistics",
			"SUB_COUNT": 2,
			"PRIME_COUNT": 12
		  },
		  {
			"PRIME_CATEGORY": "Hospital/PPE Statistics",
			"SUB_CATEGORY": "Medical",
			"SUB_COUNT": 3,
			"PRIME_COUNT": 12
		  },
		  {
			"PRIME_CATEGORY": "Hospital/PPE Statistics",
			"SUB_CATEGORY": "Unknown",
			"SUB_COUNT": 7,
			"PRIME_COUNT": 12
		  },
		  {
			"PRIME_CATEGORY": "Location/Map Data",
			"SUB_CATEGORY": "Government",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 8
		  },
		  {
			"PRIME_CATEGORY": "Location/Map Data",
			"SUB_CATEGORY": "Unknown",
			"SUB_COUNT": 7,
			"PRIME_COUNT": 8
		  },
		  {
			"PRIME_CATEGORY": "Government",
			"SUB_CATEGORY": "Government",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 6
		  },
		  {
			"PRIME_CATEGORY": "Government",
			"SUB_CATEGORY": "Location/Addresses",
			"SUB_COUNT": 2,
			"PRIME_COUNT": 6
		  },
		  {
			"PRIME_CATEGORY": "Government",
			"SUB_CATEGORY": "Unknown",
			"SUB_COUNT": 3,
			"PRIME_COUNT": 6
		  },
		  {
			"PRIME_CATEGORY": "Mobility",
			"SUB_CATEGORY": "Aggregated Mobility",
			"SUB_COUNT": 2,
			"PRIME_COUNT": 5
		  },
		  {
			"PRIME_CATEGORY": "Mobility",
			"SUB_CATEGORY": "Granular Mobility",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 5
		  },
		  {
			"PRIME_CATEGORY": "Mobility",
			"SUB_CATEGORY": "Unknown",
			"SUB_COUNT": 2,
			"PRIME_COUNT": 5
		  },
		  {
			"PRIME_CATEGORY": "Disaster",
			"SUB_CATEGORY": "Government",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 4
		  },
		  {
			"PRIME_CATEGORY": "Disaster",
			"SUB_CATEGORY": "Multiple Types",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 4
		  },
		  {
			"PRIME_CATEGORY": "Disaster",
			"SUB_CATEGORY": "Unknown",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 4
		  },
		  {
			"PRIME_CATEGORY": "Disaster",
			"SUB_CATEGORY": "Wildfire",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 4
		  },
		  {
			"PRIME_CATEGORY": "Other",
			"SUB_CATEGORY": "Multiple Types",
			"SUB_COUNT": 3,
			"PRIME_COUNT": 4
		  },
		  {
			"PRIME_CATEGORY": "Other",
			"SUB_CATEGORY": "Unknown",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 4
		  },
		  {
			"PRIME_CATEGORY": "Agriculture",
			"SUB_CATEGORY": "Food Security",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 1
		  },
		  {
			"PRIME_CATEGORY": "Financial",
			"SUB_CATEGORY": "Employment",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 1
		  },
		  {
			"PRIME_CATEGORY": "Transportation",
			"SUB_CATEGORY": "Supply Chain",
			"SUB_COUNT": 1,
			"PRIME_COUNT": 1
		  }
		]
	  });	
});	

app.get("/dashboard/getTeDesignationsChart", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"TE_DESIGNATION": "UNASSIGNED",
			"COUNT": 26
		  },
		  {
			"TE_DESIGNATION": "TEST",
			"COUNT": 6
		  },
		  {
			"TE_DESIGNATION": "TRAINING",
			"COUNT": 4
		  },
		  {
			"TE_DESIGNATION": "VALIDATION",
			"COUNT": 4
		  }
		]
	  });	
});	

app.get("/dashboard/getSourceFilters?val=", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"NAME": "UNKNOWN",
			"TOTAL": 17
		  },
		  {
			"NAME": "CDC",
			"TOTAL": 6
		  },
		  {
			"NAME": "USDA",
			"TOTAL": 6
		  },
		  {
			"NAME": "Census",
			"TOTAL": 4
		  },
		  {
			"NAME": "Equifax",
			"TOTAL": 3
		  },
		  {
			"NAME": "European Center for Disease Prevention and Control",
			"TOTAL": 3
		  },
		  {
			"NAME": "Feeding America",
			"TOTAL": 3
		  },
		  {
			"NAME": "Medicare.gov",
			"TOTAL": 3
		  },
		  {
			"NAME": "Sciensano (Belgium Institute of Health)",
			"TOTAL": 3
		  },
		  {
			"NAME": "BEA",
			"TOTAL": 2
		  },
		  {
			"NAME": "BLS",
			"TOTAL": 2
		  },
		  {
			"NAME": "CMS",
			"TOTAL": 2
		  },
		  {
			"NAME": "DHS",
			"TOTAL": 2
		  },
		  {
			"NAME": "EU Data Portal",
			"TOTAL": 2
		  },
		  {
			"NAME": "FDA",
			"TOTAL": 2
		  },
		  {
			"NAME": "HUD",
			"TOTAL": 2
		  },
		  {
			"NAME": "NYTimes",
			"TOTAL": 2
		  },
		  {
			"NAME": "Open Street Maps",
			"TOTAL": 2
		  },
		  {
			"NAME": "Park City Group",
			"TOTAL": 2
		  },
		  {
			"NAME": "US Census Bureau",
			"TOTAL": 2
		  },
		  {
			"NAME": "Unacast",
			"TOTAL": 2
		  },
		  {
			"NAME": "ACLED",
			"TOTAL": 1
		  },
		  {
			"NAME": "Air Force",
			"TOTAL": 1
		  },
		  {
			"NAME": "Apple",
			"TOTAL": 1
		  },
		  {
			"NAME": "AutoTrader",
			"TOTAL": 1
		  },
		  {
			"NAME": "CBP",
			"TOTAL": 1
		  },
		  {
			"NAME": "COVID Tracking Project",
			"TOTAL": 1
		  },
		  {
			"NAME": "Change Healthcare",
			"TOTAL": 1
		  },
		  {
			"NAME": "Columbia University",
			"TOTAL": 1
		  },
		  {
			"NAME": "CoronaDataScraper.com",
			"TOTAL": 1
		  },
		  {
			"NAME": "CovidActNow.com",
			"TOTAL": 1
		  },
		  {
			"NAME": "CovidTracking.com",
			"TOTAL": 1
		  },
		  {
			"NAME": "DATA.GOV",
			"TOTAL": 1
		  },
		  {
			"NAME": "DOL",
			"TOTAL": 1
		  },
		  {
			"NAME": "Data.gov",
			"TOTAL": 1
		  },
		  {
			"NAME": "Definitive Healthcare",
			"TOTAL": 1
		  },
		  {
			"NAME": "Education Week",
			"TOTAL": 1
		  },
		  {
			"NAME": "Esri",
			"TOTAL": 1
		  },
		  {
			"NAME": "Eurostat",
			"TOTAL": 1
		  },
		  {
			"NAME": "Fouresquare",
			"TOTAL": 1
		  },
		  {
			"NAME": "GBSP",
			"TOTAL": 1
		  },
		  {
			"NAME": "Google",
			"TOTAL": 1
		  },
		  {
			"NAME": "HHS",
			"TOTAL": 1
		  },
		  {
			"NAME": "Hc1",
			"TOTAL": 1
		  },
		  {
			"NAME": "Healthdata.org",
			"TOTAL": 1
		  },
		  {
			"NAME": "Humetrix",
			"TOTAL": 1
		  },
		  {
			"NAME": "IRS",
			"TOTAL": 1
		  },
		  {
			"NAME": "JHUAPL",
			"TOTAL": 1
		  },
		  {
			"NAME": "JRC",
			"TOTAL": 1
		  },
		  {
			"NAME": "KFF",
			"TOTAL": 1
		  },
		  {
			"NAME": "Kaggle",
			"TOTAL": 1
		  },
		  {
			"NAME": "Kaiser Family Foundation (KFF)",
			"TOTAL": 1
		  },
		  {
			"NAME": "Microsoft",
			"TOTAL": 1
		  },
		  {
			"NAME": "NIFC",
			"TOTAL": 1
		  },
		  {
			"NAME": "NPGEO",
			"TOTAL": 1
		  },
		  {
			"NAME": "National Association of Counties",
			"TOTAL": 1
		  },
		  {
			"NAME": "New York Times",
			"TOTAL": 1
		  },
		  {
			"NAME": "Our World in Data",
			"TOTAL": 1
		  },
		  {
			"NAME": "Oxford University",
			"TOTAL": 1
		  },
		  {
			"NAME": "RelevantData",
			"TOTAL": 1
		  },
		  {
			"NAME": "Safe Graph",
			"TOTAL": 1
		  },
		  {
			"NAME": "Shoreland",
			"TOTAL": 1
		  },
		  {
			"NAME": "SouperBowlofCaring",
			"TOTAL": 1
		  },
		  {
			"NAME": "Surgo Foundation",
			"TOTAL": 1
		  },
		  {
			"NAME": "USAFacts",
			"TOTAL": 1
		  },
		  {
			"NAME": "United Nations",
			"TOTAL": 1
		  },
		  {
			"NAME": "WHO",
			"TOTAL": 1
		  },
		  {
			"NAME": "Wikipedia",
			"TOTAL": 1
		  },
		  {
			"NAME": null,
			"TOTAL": 0
		  }
		]
	  });	
});	

app.get("/dashboard/getDataSetFileTypes", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"NAME": "CSV",
			"TOTAL": 49
		  },
		  {
			"NAME": "JSON",
			"TOTAL": 18
		  },
		  {
			"NAME": "TXT",
			"TOTAL": 18
		  },
		  {
			"NAME": "PDF",
			"TOTAL": 13
		  },
		  {
			"NAME": "DOCX",
			"TOTAL": 12
		  },
		  {
			"NAME": "XML",
			"TOTAL": 12
		  },
		  {
			"NAME": "DBF",
			"TOTAL": 10
		  },
		  {
			"NAME": "PRJ",
			"TOTAL": 10
		  },
		  {
			"NAME": "SHP",
			"TOTAL": 10
		  },
		  {
			"NAME": "SHX",
			"TOTAL": 10
		  },
		  {
			"NAME": "CPG",
			"TOTAL": 9
		  },
		  {
			"NAME": "XLSX",
			"TOTAL": 8
		  },
		  {
			"NAME": "SBN",
			"TOTAL": 5
		  },
		  {
			"NAME": "SBX",
			"TOTAL": 5
		  },
		  {
			"NAME": "ZIP",
			"TOTAL": 3
		  },
		  {
			"NAME": "ARFF",
			"TOTAL": 2
		  },
		  {
			"NAME": "NAMES",
			"TOTAL": 2
		  },
		  {
			"NAME": "XLS",
			"TOTAL": 2
		  },
		  {
			"NAME": "DEMO",
			"TOTAL": 1
		  },
		  {
			"NAME": "E00",
			"TOTAL": 1
		  },
		  {
			"NAME": "GEOJSON",
			"TOTAL": 1
		  },
		  {
			"NAME": "LYR",
			"TOTAL": 1
		  },
		  {
			"NAME": "M",
			"TOTAL": 1
		  },
		  {
			"NAME": "MD",
			"TOTAL": 1
		  },
		  {
			"NAME": "MINES",
			"TOTAL": 1
		  },
		  {
			"NAME": "PPTX",
			"TOTAL": 1
		  },
		  {
			"NAME": "ROCKS",
			"TOTAL": 1
		  },
		  {
			"NAME": "SDW",
			"TOTAL": 1
		  },
		  {
			"NAME": "SID",
			"TOTAL": 1
		  },
		  {
			"NAME": "SQL",
			"TOTAL": 1
		  },
		  {
			"NAME": "SVG",
			"TOTAL": 1
		  }
		]
	  });	
});	

app.get("/data/getCategoryFilters", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"NAME": "Population/Economics",
			"TOTAL": 29
		  },
		  {
			"NAME": "Infection Statistics",
			"TOTAL": 24
		  },
		  {
			"NAME": "Food Supply Chain",
			"TOTAL": 15
		  },
		  {
			"NAME": "Hospital/PPE Statistics",
			"TOTAL": 12
		  },
		  {
			"NAME": "Location/Map Data",
			"TOTAL": 8
		  },
		  {
			"NAME": "Government",
			"TOTAL": 6
		  },
		  {
			"NAME": "Mobility",
			"TOTAL": 5
		  },
		  {
			"NAME": "Disaster",
			"TOTAL": 4
		  },
		  {
			"NAME": "Other",
			"TOTAL": 4
		  },
		  {
			"NAME": "Financial",
			"TOTAL": 1
		  },
		  {
			"NAME": "Transportation",
			"TOTAL": 1
		  },
		  {
			"NAME": "Agriculture",
			"TOTAL": 1
		  },
		  {
			"NAME": null,
			"TOTAL": 0
		  }
		]
	  });	
});	

app.get("/data/getLoadFreqFilters", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"NAME": "One Time",
			"TOTAL": 39
		  },
		  {
			"NAME": "Daily",
			"TOTAL": 21
		  },
		  {
			"NAME": "Weekly",
			"TOTAL": 20
		  },
		  {
			"NAME": "Periodically",
			"TOTAL": 15
		  },
		  {
			"NAME": "Bi-Weekly",
			"TOTAL": 4
		  },
		  {
			"NAME": "",
			"TOTAL": 3
		  },
		  {
			"NAME": "Monthly",
			"TOTAL": 3
		  },
		  {
			"NAME": "Quarterly",
			"TOTAL": 3
		  },
		  {
			"NAME": "Bi-Monthly",
			"TOTAL": 1
		  },
		  {
			"NAME": "TBD",
			"TOTAL": 1
		  },
		  {
			"NAME": null,
			"TOTAL": 0
		  }
		]
	  });	
});	

app.get("/data/getClassificationFilters", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"NAME": "UNCLASSIFIED",
			"TOTAL": 127
		  },
		  {
			"NAME": "CUI",
			"TOTAL": 2
		  },
		  {
			"NAME": "CLASSIFIED",
			"TOTAL": 1
		  }
		]
	  });	
});	

app.get("/data/searchDataSet", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: {
		  "total": 130,
		  "limit": "10",
		  "offset": "0",
		  "results": [
			{
			  "DATA_SET_ID": "3d35985760c44ee5bffa29be94a2d561",
			  "SOURCE": "Source Not Available",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/D&BSupplier-ImpliedRiskAtributes/",
			  "DESCRIPTION": null,
			  "LAST_MOD_DATE": "2021-08-19 21:34:26.944000000",
			  "PRIME_CATEGORY": null,
			  "NUM_FILES": 5,
			  "NUM_VIEWS": 13,
			  "URL": null
			},
			{
			  "DATA_SET_ID": "69c664d56f464d5abba3bc7221cc6bbd",
			  "SOURCE": "Source Not Available",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/tl_2019_us_county/",
			  "DESCRIPTION": null,
			  "LAST_MOD_DATE": "2021-08-19 20:47:07.993000000",
			  "PRIME_CATEGORY": null,
			  "NUM_FILES": 8,
			  "NUM_VIEWS": 1,
			  "URL": null
			},
			{
			  "DATA_SET_ID": "cb5f393492b94f8988d5b3e11ec5c5a2",
			  "SOURCE": "Source Not Available",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/installations_ranges/",
			  "DESCRIPTION": null,
			  "LAST_MOD_DATE": "2021-08-19 20:45:19.162000000",
			  "PRIME_CATEGORY": null,
			  "NUM_FILES": 18,
			  "NUM_VIEWS": 1,
			  "URL": null
			},
			{
			  "DATA_SET_ID": "bd8e9fe52a3f4d23b1afc3e8995c094a",
			  "SOURCE": "Source Not Available",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Geothermal/favorabilitysurface/",
			  "DESCRIPTION": null,
			  "LAST_MOD_DATE": "2021-08-19 20:42:22.383000000",
			  "PRIME_CATEGORY": null,
			  "NUM_FILES": 11,
			  "NUM_VIEWS": 1,
			  "URL": null
			},
			{
			  "DATA_SET_ID": "ff0c6bed04e54ffc9a4d2a4e274d2971",
			  "SOURCE": "Source Not Available",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CommodityTonnage/",
			  "DESCRIPTION": null,
			  "LAST_MOD_DATE": "2021-08-19 20:39:13.578000000",
			  "PRIME_CATEGORY": null,
			  "NUM_FILES": 7,
			  "NUM_VIEWS": 1,
			  "URL": null
			},
			{
			  "DATA_SET_ID": "4752f3cbe9274ca18dcf0206755f7a31",
			  "SOURCE": "Source Not Available",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/",
			  "DESCRIPTION": null,
			  "LAST_MOD_DATE": "2021-08-19 20:35:37.907000000",
			  "PRIME_CATEGORY": null,
			  "NUM_FILES": 7,
			  "NUM_VIEWS": 0,
			  "URL": null
			},
			{
			  "DATA_SET_ID": "4a30c47cc38245bfbc40fa4ffd28c045",
			  "SOURCE": "Source Not Available",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChainInstitute/",
			  "DESCRIPTION": null,
			  "LAST_MOD_DATE": "2021-08-19 20:31:48.221000000",
			  "PRIME_CATEGORY": null,
			  "NUM_FILES": 6,
			  "NUM_VIEWS": 0,
			  "URL": null
			},
			{
			  "DATA_SET_ID": "572e83c1abf14112bd4437ca75f84e5c",
			  "SOURCE": "Source Not Available",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Mandeley/",
			  "DESCRIPTION": null,
			  "LAST_MOD_DATE": "2021-08-19 20:28:59.117000000",
			  "PRIME_CATEGORY": null,
			  "NUM_FILES": 3,
			  "NUM_VIEWS": 0,
			  "URL": null
			},
			{
			  "DATA_SET_ID": "1579f0fdea524ab78faab5eefb1c5ef9",
			  "SOURCE": "Source Not Available",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Brunel/",
			  "DESCRIPTION": null,
			  "LAST_MOD_DATE": "2021-08-19 20:27:22.311000000",
			  "PRIME_CATEGORY": null,
			  "NUM_FILES": 3,
			  "NUM_VIEWS": 0,
			  "URL": null
			},
			{
			  "DATA_SET_ID": "7413130bf3e14170a3cd479300d685c7",
			  "SOURCE": "Source Not Available",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/ml_scenario/",
			  "DESCRIPTION": null,
			  "LAST_MOD_DATE": "2021-08-17 21:54:53.502000000",
			  "PRIME_CATEGORY": null,
			  "NUM_FILES": 1,
			  "NUM_VIEWS": 0,
			  "URL": null
			}
		  ]
		}
	  });	
});	

app.get("/model/getClassificationFilters?val=", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"NAME": "UNCLASSIFIED",
			"TOTAL": 11,
			"SELECTED": "false"
		  },
		  {
			"NAME": "CUI",
			"TOTAL": 1,
			"SELECTED": "false"
		  }
		]
	  });	
});	

app.get("/model/getModelTypeFilters?val=", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"NAME": "Supervised Neural Network",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Other",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Supervised",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Neural Network",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "N/A",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Linear Regression",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Supervised - Lasso Regression",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Agent Based Modeling",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Random Forest/Generalized Linear",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Apriori",
			"TOTAL": 1,
			"SELECTED": "false"
		  }
		]
	  });	
});	

app.get("/model/getDeveloperFilters?val=", (req, res) => {
	res.send({
		status: 200,
		message: "OK",
		data: [
		  {
			"NAME": "Amazon Web Services",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "IBM",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Dell Technologies",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "SAP NS2",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Humetrix",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Covid Act Now",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "MSFT",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Lucd Inc.",
			"TOTAL": 1,
			"SELECTED": "false"
		  }
		]
	  });	
});	

app.get("/model/searchModelCards?val=&limit=10&offset=0&start=&end=", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
		  "total": 12,
		  "limit": "10",
		  "offset": "0",
		  "results": [
			{
			  "MODEL_CARD_ID": "866500C0CB9CD49C1700C40210085FCE",
			  "LAST_UPDATED_TIMESTAMP": "2021-06-17 13:34:26.767000000",
			  "MODEL_NAME": "ACLED",
			  "DESCRIPTION": "The Apriori algorithm runs through the ACLED (Armed Conflict Location and Event Dataset) and builds clusters of similar events in order to find trends in activity across the globe",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Apriori",
			  "MODEL_DEVELOPER": "SAP NS2",
			  "NUM_DATA_SETS": 2,
			  "NUM_VIEWS": 32
			},
			{
			  "MODEL_CARD_ID": "7DD200B0714E9B7F1700480269F90446",
			  "LAST_UPDATED_TIMESTAMP": "2021-04-14 14:25:41.531000000",
			  "MODEL_NAME": "U.S. Veteran Mental Health",
			  "DESCRIPTION": "Analyzes the rate of suicide and mental health issues of U.S. veterans as a comparison to the general U.S. civilian population using Random Forest and Generalized Linear Regression",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Random Forest/Generalized Linear",
			  "MODEL_DEVELOPER": "SAP NS2",
			  "NUM_DATA_SETS": 2,
			  "NUM_VIEWS": 258
			},
			{
			  "MODEL_CARD_ID": "587200F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2021-03-09 20:30:46.596000000",
			  "MODEL_NAME": "Food Supply Chain Index - Meat",
			  "DESCRIPTION": "Supply Chain Comparative Risk Score",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Other",
			  "MODEL_DEVELOPER": "IBM",
			  "NUM_DATA_SETS": 4,
			  "NUM_VIEWS": 42
			},
			{
			  "MODEL_CARD_ID": "037200F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2021-01-22 18:21:31.784000000",
			  "MODEL_NAME": "Disease Progression Model",
			  "DESCRIPTION": "Infection and Hospitalization Numbers",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Other",
			  "MODEL_DEVELOPER": "Covid Act Now",
			  "NUM_DATA_SETS": 0,
			  "NUM_VIEWS": 40
			},
			{
			  "MODEL_CARD_ID": "E86F00F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2021-01-19 15:09:30.191000000",
			  "MODEL_NAME": "Medicare COVID-19 Hospitalization Risk by county or zip code",
			  "DESCRIPTION": "Hospital, ICU, and Ventilator Use for Medicare COVID-19 cases",
			  "MODEL_CLASSIFICATION": "CUI",
			  "MODEL_TYPE": "Supervised",
			  "MODEL_DEVELOPER": "Humetrix",
			  "NUM_DATA_SETS": 5,
			  "NUM_VIEWS": 32
			},
			{
			  "MODEL_CARD_ID": "036C00F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2021-01-07 14:12:52.289000000",
			  "MODEL_NAME": "DeepAR Repositrak SC",
			  "DESCRIPTION": "Forecast commodities up to 4 weeks out",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Supervised Neural Network",
			  "MODEL_DEVELOPER": "Amazon Web Services",
			  "NUM_DATA_SETS": 0,
			  "NUM_VIEWS": 10
			},
			{
			  "MODEL_CARD_ID": "A76900F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2021-01-07 13:50:20.980000000",
			  "MODEL_NAME": "DeepAR COVID-19 Clusters",
			  "DESCRIPTION": "Forecast cases 7 days or 4 weeks into future",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Supervised Neural Network",
			  "MODEL_DEVELOPER": "Amazon Web Services",
			  "NUM_DATA_SETS": 4,
			  "NUM_VIEWS": 33
			},
			{
			  "MODEL_CARD_ID": "9D8D00F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2020-12-07 18:48:19.284000000",
			  "MODEL_NAME": "Avicenna",
			  "DESCRIPTION": "Predicts Pandemic Spread into the future and impact on population given defined parameters.",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Agent Based Modeling",
			  "MODEL_DEVELOPER": "Lucd Inc.",
			  "NUM_DATA_SETS": 0,
			  "NUM_VIEWS": 151
			},
			{
			  "MODEL_CARD_ID": "CB7200F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2020-08-17 14:23:18.000000000",
			  "MODEL_NAME": "Pandemic Disruption Index",
			  "DESCRIPTION": "COVID Index Risk Score",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "Neural Network",
			  "MODEL_DEVELOPER": "IBM",
			  "NUM_DATA_SETS": 0,
			  "NUM_VIEWS": 6
			},
			{
			  "MODEL_CARD_ID": "C68C00F03684983317004802DFA4BD6A",
			  "LAST_UPDATED_TIMESTAMP": "2020-08-17 14:23:18.000000000",
			  "MODEL_NAME": "Action recommendation",
			  "DESCRIPTION": "Recommended action",
			  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
			  "MODEL_TYPE": "N/A",
			  "MODEL_DEVELOPER": "Dell Technologies",
			  "NUM_DATA_SETS": 0,
			  "NUM_VIEWS": 6
			}
		  ]
		}
	  });	
});	

app.get("/compass/get_neighbors", (req, res) => {
	res.send({
		"nodes": [
			{
				"key": "dbf00aec1d578bdc5a5faad76f16fd4a",
				"title": "TSE Beacon 7",
				"icon": "sap-icon://status-negative",
				"status": null,
				"attributes": [
					{
						"label": "type",
						"value": "Object"
					},
					{
						"label": "category",
						"value": "Technical Surveillance"
					},
					{
						"label": "section",
						"value": "classified operations"
					}
				]
			},
			{
				"key": "3a912e3e9750659d7cc45b761be00524",
				"title": "TSE 7 bread crumb",
				"icon": "sap-icon://map",
				"status": null,
				"attributes": [
					{
						"label": "type",
						"value": "Location"
					},
					{
						"label": "category",
						"value": "Surveillance"
					},
					{
						"label": "lat",
						"value": "48.177386"
					},
					{
						"label": "lon",
						"value": "16.3893907"
					},
					{
						"label": "section",
						"value": "classified operations"
					}
				]
			},
			{
				"key": "46ec516dd94dd28acabd7037150a9251",
				"title": "Space-time coincidence with TSE 7 2021-09-01 09:27:14 ping TSE 6 2021-09-01 09:27:16 ping",
				"icon": "sap-icon://share-2",
				"status": null,
				"attributes": [
					{
						"label": "type",
						"value": "Event"
					},
					{
						"label": "category",
						"value": "Space time coincidence"
					},
					{
						"label": "section",
						"value": "classified operations"
					}
				]
			}
		],
		"lines": [
			{
				"from": "3a912e3e9750659d7cc45b761be00524",
				"to": "dbf00aec1d578bdc5a5faad76f16fd4a",
				"title": "SourcedFrom",
				"description": "classified operations"
			},
			{
				"from": "46ec516dd94dd28acabd7037150a9251",
				"to": "3a912e3e9750659d7cc45b761be00524",
				"title": "SpatialTemporalCoincidence",
				"description": "classified operations"
			}
		],
		"groups": [],
		"status": 200,
		"message": "Returned 3 nodes and 2 edges"
	});	
});	

app.get("/data/search", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
		  "total": 82,
		  "datasetTotal": 30,
		  "modelTotal": 12,
		  "imageryTotal": 40,
		  "limit": 50,
		  "offset": 0,
		  "results": [
			{
			  "OBJECT_ID": "3d35985760c44ee5bffa29be94a2d561",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/D&BSupplier-ImpliedRiskAtributes/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-19 21:34:26.944000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "69c664d56f464d5abba3bc7221cc6bbd",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/tl_2019_us_county/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-19 20:47:07.993000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "cb5f393492b94f8988d5b3e11ec5c5a2",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/installations_ranges/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-19 20:45:19.162000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "bd8e9fe52a3f4d23b1afc3e8995c094a",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Geothermal/favorabilitysurface/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-19 20:42:22.383000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "ff0c6bed04e54ffc9a4d2a4e274d2971",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CommodityTonnage/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-19 20:39:13.578000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "4752f3cbe9274ca18dcf0206755f7a31",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-19 20:35:37.907000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "4a30c47cc38245bfbc40fa4ffd28c045",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChainInstitute/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-19 20:31:48.221000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "572e83c1abf14112bd4437ca75f84e5c",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Mandeley/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-19 20:28:59.117000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "1579f0fdea524ab78faab5eefb1c5ef9",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Brunel/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-19 20:27:22.311000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "7413130bf3e14170a3cd479300d685c7",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/ml_scenario/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-17 21:54:53.502000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "a2e21182d6384f25a537120c582e8931",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Test_Files/",
			  "SOURCE": null,
			  "OBJECT_TIMESTAMP": "2021-08-17 21:54:49.340000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "P6V2T1WHSHmfPSCcUOzn8g",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "young_people_in_discussion_for_project",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:09.857000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "ZT-KklJaTx-peSMT4yyGLg",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "woman_with_face_mask",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:09.622000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "6AX_FFdlSEylQP_EIGLlag",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "two_people_reading_a_book.",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:09.151000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "ctc-neRpQLCdQccZNxwVGw",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "traffic_video",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:07.794000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "nAU_DtIRT7WRFJylF2ecOQ",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "people_rooftop_dancing",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:07.516000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "ZbOZvyqNRVyLhWZLYzytYQ",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "people_dancing_drinking_wine",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:07.228000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "cFcmtpnpRNy8FEEVRdxTfw",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "happy_woman_drinking",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:06.946000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "TKY6hqgoQLiHEB1YGwzdRw",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "group_dancing_public",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:06.476000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "1dVbFt2RQJiQSjJEdGDCAA",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "elders_drinking_wine",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:06.228000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "bkGV6aZDR62YV6yRxowJ3w",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "dancing_zombies",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:05.742000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "26xPOGi1QIiz3oD0RqdC4w",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "dancing_man",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:04.937000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "7JrzuXA6TBO07qSxUrukdw",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "crowd_at_concert",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:04.516000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "vSL4phPjTtGnIdAOi2yFfg",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "basketball_shot",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:04.290000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "yr2JojpFQyC78vTXkSY4aQ",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "5_women_serious_faces",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:04.058000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "k-owpyLOT4Okx2E0nyWkGA",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "4_women_heads_on_top_of_each_other",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:03.741000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "72ECgX8_TfisobzRFHMKJA",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "3_young_woman_purple_background",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:03.511000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "MIXoglWFT0WGXqUJUNBHPA",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "3_women_profile_view",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:03.289000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "NaWC3vQDTvOIU8jXSp2KIA",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "3_women_from_view",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:03.052000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "aTeA1YL3TUqjlmfhe1Q1mA",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "3_women_bday",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-23 11:47:02.785000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "FmYUniRTTc-3YfqWMyC93A",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "text_woman_holding_cardboard_sign",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-22 15:12:30.553000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "XtGPsJnmTY6xPJDyNnAr0w",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "text_on_paper_on_wall_with_person",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-22 15:12:30.393000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "rR2GmSgGSvGm87mMyEKJmw",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "text_in_video_2",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-22 15:12:30.227000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "me9QJAkEREubTZwDDk26cQ",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "license_plates_on_wall_man_standing",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-06-22 15:12:29.855000000",
			  "DESCRIPTION": null
			},
			{
			  "OBJECT_ID": "866500C0CB9CD49C1700C40210085FCE",
			  "OBJECT_TYPE": "MODEL",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "ACLED",
			  "SOURCE": "SAP NS2",
			  "OBJECT_TIMESTAMP": "2021-06-17 13:34:26.767000000",
			  "DESCRIPTION": "The Apriori algorithm runs through the ACLED (Armed Conflict Location and Event Dataset) and builds clusters of similar events in order to find trends in activity across the globe"
			},
			{
			  "OBJECT_ID": "7DD200B0714E9B7F1700480269F90446",
			  "OBJECT_TYPE": "MODEL",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "U.S. Veteran Mental Health",
			  "SOURCE": "SAP NS2",
			  "OBJECT_TIMESTAMP": "2021-04-14 14:25:41.531000000",
			  "DESCRIPTION": "Analyzes the rate of suicide and mental health issues of U.S. veterans as a comparison to the general U.S. civilian population using Random Forest and Generalized Linear Regression"
			},
			{
			  "OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "VA Mental Health Information",
			  "SOURCE": "DATA.GOV",
			  "OBJECT_TIMESTAMP": "2021-04-13 16:18:10.205000000",
			  "DESCRIPTION": "Statistics on veterans mental health. "
			},
			{
			  "OBJECT_ID": "7021746b0efb449490c0e6c88491ed29",
			  "OBJECT_TYPE": "DATASET",
			  "CLASSIFICATION": "UNCLASSIFIED",
			  "NAME": "Health COVID",
			  "SOURCE": "CDC",
			  "OBJECT_TIMESTAMP": "2021-03-19 17:13:34.701000000",
			  "DESCRIPTION": "Statistics on COVID infections.  "
			},
			{
			  "OBJECT_ID": "rbP6BrznS5KYW2yWJe1ezw",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "quad_video1",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:41:14.962000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the northeast section of the Main Quad near the President's Office."
			},
			{
			  "OBJECT_ID": "vet9HkUfSAWhsmTEawnGjw",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "quad_video0",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:41:14.519000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the northeast section of the Main Quad near the President's Office."
			},
			{
			  "OBJECT_ID": "1bjIhSIeSgqIUMLE3H3EWQ",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "nexus_video1",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:41:04.004000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the Discovery Walk on the west side of the James H Clark Center and the south side of the Fairchild Science Building that houses the Department of Structural Biology."
			},
			{
			  "OBJECT_ID": "FX8pOxDTS3azqZuBhtHvlA",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "nexus_video0",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:40:47.655000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the Discovery Walk on the west side of the James H Clark Center and the south side of the Fairchild Science Building that houses the Department of Structural Biology."
			},
			{
			  "OBJECT_ID": "pa85_JrKRQKxonwq81qfPg",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "little_video1",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:40:30.037000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the traffic circle at the intersection of Jane Standford Way and Lasuen Mall."
			},
			{
			  "OBJECT_ID": "uCJmbLoMQxqQ5fNore5IlA",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "little_video0",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:40:21.726000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the traffic circle at the intersection of Jane Standford Way and Lasuen Mall."
			},
			{
			  "OBJECT_ID": "2GFLA55YQTm1tjsHOB4Orw",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "hyang_video1",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:40:10.106000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the North South Axis pathway to the east side of the Science & Engineering Quad Courtyard."
			},
			{
			  "OBJECT_ID": "-J8rb12ZR26hZ5uNS_vMfQ",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "hyang_video0",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:39:54.377000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the North South Axis pathway to the east side of the Science & Engineering Quad Courtyard."
			},
			{
			  "OBJECT_ID": "sM_Ihn1BRvCYArSyWI2JMA",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "gates_video1",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:39:41.330000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the N-South Axis roadway between the Stanford University Computer Science Department Building and the Gilbert Biological Sciences Building."
			},
			{
			  "OBJECT_ID": "Ik7z6ZQeStW4cH2-OW8clQ",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "gates_video0",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:39:29.158000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the N-South Axis roadway between the Stanford University Computer Science Department Building and the Gilbert Biological Sciences Building."
			},
			{
			  "OBJECT_ID": "kg5BTZMXRruiD7ENHJNvmA",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "death_circle_video1",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:38:13.569000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the traffic circle at the intersection of Escondido Mall and Lasuen Mall."
			},
			{
			  "OBJECT_ID": "zzoc4mK6TNiq2ioLM0uXcg",
			  "OBJECT_TYPE": "IMAGERY",
			  "CLASSIFICATION": "Unclassified",
			  "NAME": "coupa_video1",
			  "SOURCE": "FMV",
			  "OBJECT_TIMESTAMP": "2021-03-19 14:37:56.913000000",
			  "DESCRIPTION": "Stanford University campus drone footage above the Science & Engineering Quad Courtyard."
			}
		  ]
		}
	  });	
});	

app.get("/data/getDataSetById", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
		  "DATA_SET_ID": "ac99796928504dd7a3fd6bbfde054b4f",
		  "DATA_CARD_ID": "77F401B0714E9B7F1700480269F90446",
		  "HUMAN_ID": "VA-OTR-001",
		  "NAME": "VA Mental Health Information",
		  "SOURCE": "DATA.GOV",
		  "DESCRIPTION": "Statistics on veterans mental health. ",
		  "PRIME_CATEGORY": "Hospital/PPE Statistics",
		  "SUB_CATEGORY": "Medical",
		  "ACCESS_TYPE": "Open",
		  "LOAD_STATUS": "Available, Load Complete",
		  "LOAD_FREQUENCY": "Quarterly",
		  "DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/VA-SAC/",
		  "PATH": null,
		  "URL": null,
		  "CLASSIFICATION": "UNCLASSIFIED",
		  "CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
		  "DATA_CARD_STATUS": "",
		  "COMMENTS": null,
		  "MODEL_INPUT": null,
		  "MODEL_VENDORS": null,
		  "LAST_MOD_DATE": "2021-04-13 16:18:10.205000000",
		  "LAST_MOD_BY": "MICHELLE",
		  "FILES": {
			"total": 2,
			"results": [
			  {
				"DATA_SET_ID": "ac99796928504dd7a3fd6bbfde054b4f",
				"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
				"FILE_NAME": "mentalHealthOnline.csv",
				"CLASSIFICATION": "UNCLASSIFIED",
				"DATA_SET_URL": "https://marina-data-broker-ingest.s3-us-gov-west-1.amazonaws.com/S3-Publish/LOE1/UNCLASSIFIED/VA-SAC/mentalHealthOnline.csv",
				"DATA_SET_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/VA-SAC/",
				"FILE_TYPE": "CSV",
				"FILE_SIZE_MB": "0.330",
				"NUMBER_ROWS": 936,
				"LAST_MOD_DATE": "2021-08-23 20:53:16.004000000",
				"EXPORTABLE": "N",
				"SEARCH_MATCHES": "0"
			  },
			  {
				"DATA_SET_ID": "ac99796928504dd7a3fd6bbfde054b4f",
				"DATA_FILE_ID": "9c31c3c0dc7e430398e4c8c02df85174",
				"FILE_NAME": "vaFull.csv",
				"CLASSIFICATION": "UNCLASSIFIED",
				"DATA_SET_URL": "https://marina-data-broker-ingest.s3-us-gov-west-1.amazonaws.com/S3-Publish/LOE1/UNCLASSIFIED/VA-SAC/vaFull.csv",
				"DATA_SET_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/VA-SAC/",
				"FILE_TYPE": "CSV",
				"FILE_SIZE_MB": "0.920",
				"NUMBER_ROWS": 3500,
				"LAST_MOD_DATE": "2021-08-23 20:53:16.230000000",
				"EXPORTABLE": "Y",
				"SEARCH_MATCHES": "0"
			  }
			]
		  },
		  "dataCard": {
			"DATA_CARD_ID": "77F401B0714E9B7F1700480269F90446",
			"DATASET_NAME": "VA Mental Health Information",
			"DATASET_SUMMARY": "A collection of data from an online mental health survey used to help identify signs of mental illness and potential suicide in veterans",
			"PRIMARY_POC_NAME": "SAP NS2",
			"PRIMARY_POC_EMAIL": "pathfinder@sapns2.com",
			"PRIMARY_POC_PHONE": "703-555-5555",
			"EXTIMATED_SIZE_GB": "10MB",
			"INDUSTRY_TYPE": "Government",
			"KEY_APPLICATION": "Pattern of Life",
			"INTENDED_USE_CASE": "Intended to be used by analytic models that can determine the most critical factors indicating a threat of mental illness in veterans",
			"PRIMARY_DATA_TYPE": "CSV",
			"DATASET_FUNCTION": "TRAINING,TESTING,OPERATIONAL",
			"DATASET_METADATA_TOTAL_INSTANCES": "",
			"DATASET_METADATA_TOTAL_CLASSES": "",
			"DATASET_METADATA_TOTAL_LABELS": "",
			"DATASET_METADATA_ALGORITM_GEN": "",
			"DATASET_METADATA_USER_CONTRIBUTED": "",
			"DATASET_METADATA_HUMAN_VERIFIED_LABEL": "",
			"CONTENT_NATURE": "Characteristics of veterans both with and without mental illness",
			"EXCLUDED_DATA": "None",
			"PRIVACY_PII": "",
			"CLASSIFICATION": "UNCLASSIFIED",
			"LAST_MOD_DATELICENSE_TYPE": "2021-03-11 00:00:00.000000000",
			"LICENSE_VERSION": "1.0",
			"LICENSE_STATUS": "License Not Required",
			"ACCESS_COST": "N/A",
			"DATA_COLLECTION_METHOD": "Survey Result collection",
			"CLOUD": "AWS",
			"DATA_INTEGRATOR_CARD_ID": "",
			"MAXIMUM_FILE_SIZE_GB": "1GB",
			"JCF_DATA_SOURCE_DMZ": "N/A",
			"JCF_DATA_TARGET_CLEAN": "N/A",
			"TRANS_SPECIAL_REQUESTS": "N/A",
			"SAMPLING_METHODS": "UNSAMPLED",
			"DATA_DISTRIBUTION": "N/A",
			"FILTERING_CRITERIA": "No filtering criteria defined",
			"LABELING_METHODS": "ALGORITHMIC LABELS",
			"LABEL_TYPES_HUMAN": "",
			"LABEL_TYPES_ALGORITHM": "Sequence Labeling",
			"LABEL_SOURCE_HUMAN": "",
			"LABEL_SOURCE_ALGORITHM": "R",
			"LABEL_PROCEDURE_HUMAN": "",
			"LABEL_PROCEDURE_ALGORITHM": "",
			"VALIDATION_METHOD": "NOT APPLICABLE",
			"VALIDATION_TASKS": "N/A",
			"VALIDATION_DESCRIPTION": "N/A",
			"VALIDATION_POLICY_SUMMARY": "N/A",
			"LICENSE_TYPE": "N/A",
			"LICENSE_SUMMARY": "Open source data, no license required",
			"PUBLISHER_NAME": "VA",
			"SOURCE_NAME": "Data.gov online VA Mental Health Survey",
			"DATA_SELECTION": "All data is used",
			"CREATION_USERID": "JHOFFNER",
			"CREATION_TIMESTAMP": "2021-03-19 02:29:33.000000000",
			"IS_APPROVED": 1,
			"WF_ID": "991001F03684983317004802DFA4BD6A",
			"LAST_UPDATED_BY": "DEMO",
			"LAST_UPDATED_TIMESTAMP": "2021-04-26 12:55:33.030000000",
			"DATA_PREVIEW_TABLE": null,
			"STATUTORY_AUTHORIZATION": "",
			"COLLECTION_MECHANISM": "Online survey results collection",
			"DATA_MINIMIZATION": "",
			"PRIVACY_RISK": "Critical PII used to create survey result data needs to be carefully guarded.  Prior to upload any PII contained within survey results has been removed",
			"ETHICS_RISK": "N/A",
			"KEY_APPLICATION_OTHER": "",
			"ESTIMATED_SIZE_OTHER": "",
			"DATASET_FUNCTION_OTHER": "",
			"IS_PRIVACY_PII": "N",
			"PRIMARY_DATA_TYPE_OTHER": "",
			"MAXIMUM_FILE_SIZE_OTHER": "N/A",
			"CLOUD_OTHER": "N/A",
			"SAMPLING_METHODS_OTHER": "",
			"LABELING_METHODS_OTHER": "",
			"VALIDATION_METHODS_OTHER": "",
			"INDUSTRY_TYPE_OTHER": "",
			"CURRENT_STATE": null,
			"CURRENT_STATE_ID": null,
			"ACTION_TAKEN": null
		  },
		  "IS_SUBSCRIBED": true
		}
	  });	
});	

app.get("/data/getDataSetFileCounts", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"FILE_TYPE": "CSV",
			"COUNT": 1
		  },
		  {
			"FILE_TYPE": "TXT",
			"COUNT": 1
		  }
		]
	  });	
});	

app.get("/data/getCardWorkflow", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"STATE_ID": "5447000094283A381700480256ECB7F3",
			"STATE_NAME": "Submit Card",
			"LANE_ID": 0,
			"ICON": "sap-icon://paper-plane",
			"ACTION_TAKEN": "SUBMITTED",
			"ACTION_TIMESTAMP": "2021-03-19 02:29:34.097000000",
			"ACTION_APPROVER": "JHOFFNER",
			"ASSIGNED_TIMESTAMP": "2021-03-19 02:29:34.097000000",
			"ACTION_COMMENTS": ""
		  },
		  {
			"STATE_ID": "5547000094283A381700480256ECB7F3",
			"STATE_NAME": "Data Review",
			"LANE_ID": 1,
			"ICON": "sap-icon://employee-approvals",
			"ACTION_TAKEN": "APPROVED",
			"ACTION_TIMESTAMP": "2021-03-19 02:35:57.263000000",
			"ACTION_APPROVER": "APPROVER1",
			"ASSIGNED_TIMESTAMP": "2021-03-19 02:29:34.108000000",
			"ACTION_COMMENTS": ""
		  },
		  {
			"STATE_ID": "5747000094283A381700480256ECB7F3",
			"STATE_NAME": "Business Review",
			"LANE_ID": 2,
			"ICON": "sap-icon://employee-approvals",
			"ACTION_TAKEN": false,
			"ACTION_TIMESTAMP": "2021-03-19 02:36:24.594000000",
			"ACTION_APPROVER": "APPROVER2",
			"ASSIGNED_TIMESTAMP": "2021-03-19 02:35:57.268000000",
			"ACTION_COMMENTS": ""
		  }
		]
	  });	
});	

app.get("/data/getDataSetFileCounts?id=cb5f393492b94f8988d5b3e11ec5c5a2", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"FILE_TYPE": "CSV",
			"COUNT": 1
		  },
		  {
			"FILE_TYPE": "TXT",
			"COUNT": 1
		  }
		]
	  });
});

app.get("/config/audit", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": 1
	  });	
});	

app.get("/config/getPageHelp", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
			"sections": []
		}
	});	
});	

app.get("/config/getSourceSensor", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"NAME": "",
				"TOTAL": 4440
			}
		]
	});	
});	

app.get("/config/getPlatformTypes", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"NAME": "C208B",
				"TOTAL": 4440
			},
			{
				"NAME": "DRONE",
				"TOTAL": 12721
			}
		]
	});	
});	

app.get("/config/getSensorBand", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": []
	});	
});	

app.get("/data/getDataFileColumns", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"RRC": 1,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "AccountId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 2,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "AccountDescription",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 3,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "AccountParentId",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 4,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "genderId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 5,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "genderDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 6,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "sexuallityId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 7,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "sexuallityDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 8,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "incomeId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 9,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "incomeDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 10,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "raceId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 11,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "raceDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 12,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "bodyweightId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 13,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "bodyweightDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 14,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "virginId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 15,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "virginDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 16,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "prostitution_legalId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 17,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "prostitution_legalDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 18,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "pay_for_sexId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 19,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "pay_for_sexDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 20,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "social_fearId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 21,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "social_fearDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 22,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "depressedId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 23,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "depressedDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 24,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "what_help_from_othersId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 25,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "what_help_from_othersDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 26,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "attempt_suicideId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 27,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "attempt_suicideDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 28,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "employmentId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 29,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "employmentDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 30,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "job_titleId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 31,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "job_titleDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 32,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "edu_levelId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 33,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "edu_levelDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 34,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "improve_yourself_howId",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 35,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "improve_yourself_howDescription",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 36,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "timeYear",
			"CTYPE": "int64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 37,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "timeQuarter",
			"CTYPE": "int64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 38,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "timeMonth",
			"CTYPE": "int64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 39,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "timeDAY",
			"CTYPE": "int64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 40,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "CategoryVersion",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 41,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "CategoryCategory",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 42,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "CategoryType",
			"CTYPE": "string",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 43,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "Value",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  },
		  {
			"RRC": 44,
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"COLUMN": "ValueUnit",
			"CTYPE": "float64",
			"LAST_MOD_DATE": "2021-08-23 20:53:16.310000000"
		  }
		]
	  });	
});	

app.get("/data/getDataFileHistory", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"DATA_SET_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"DATA_FILE_ID": "824f2c1837764353849e62e55c2828aa",
			"FILE_NAME": "mentalHealthOnline.csv",
			"CLASSIFICATION": "UNCLASSIFIED",
			"DATA_SET_URL": "https://marina-data-broker-ingest.s3-us-gov-west-1.amazonaws.com/S3-Publish/LOE1/UNCLASSIFIED/VA-SAC/mentalHealthOnline.csv",
			"DATA_SET_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/VA-SAC/",
			"FILE_TYPE": "CSV",
			"FILE_SIZE_MB": "0.330",
			"NUMBER_ROWS": 936,
			"LAST_MOD_DATE": "2021-08-23 20:53:16.004000000",
			"EXPORTABLE": "Y"
		  }
		]
	  });	
});	

app.get("/data/getFileColTypeCounts", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"CTYPE": "float64",
			"COUNT": 19
		  },
		  {
			"CTYPE": "string",
			"COUNT": 21
		  },
		  {
			"CTYPE": "int64",
			"COUNT": 4
		  }
		]
	  });	
});	

app.get("/data/getDataPreview", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": "vet_suicides,vet_suicides,,Texas,,11,,#,,33,,#,,#,,55,,#,,#,,89,,#,,#,,95,,#,,#,,230,,#,,2005,20051,200501,1,498,,Actual,Actuals,public,Texas < United States,Texas,509.0,\nvet_pop,vet_pop,,Oklahoma,,#,,5,,#,,#,,14,,#,,#,,17,,#,,#,,28,,#,,#,,35,,#,,42,,2011,20111,201101,1,#,,Actual,Actuals,public,Oklahoma < United States,Oklahoma,319724.0,\nvet_suicides,vet_suicides,,Washington,,10,,13,,#,,#,,22,,#,,#,,22,,#,,#,,34,,#,,#,,41,,#,,90,,2010,20101,201001,1,212,,Actual,Actuals,public,Washington < United States,Washington,222.0,\nvet_pop,vet_pop,,Oregon,,6,,1,,#,,#,,9,,#,,#,,24,,#,,#,,23,,#,,#,,34,,#,,59,,2011,20111,201101,1,144,,Actual,Actuals,public,Oregon < United States,Oregon,319194.0,\nvet_suicides,vet_suicides,,Minnesota,,3,,4,,#,,#,,11,,#,,#,,8,,#,,#,,21,,#,,#,,26,,#,,36,,2009,20091,200901,1,103,,Actual,Actuals,public,Minnesota < United States,Minnesota,106.0,\nvet_pop,vet_pop,,Arizona,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2011,20111,201101,1,#,,Actual,Actuals,public,Arizona < United States,Arizona,533608.0,\nvet_suicides,vet_suicides,,Idaho,,6,,1,,#,,#,,5,,#,,#,,#,,#,,25,,#,,#,,#,,13,,#,,22,,2009,20091,200901,1,60,,Actual,Actuals,public,Idaho < United States,Idaho,66.0,\nvet_pop,vet_pop,,Alabama,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2009,20091,200901,1,#,,Actual,Actuals,public,Alabama < United States,Alabama,397405.0,\nvet_suicides,vet_suicides,,Nebraska,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2011,20111,201101,1,#,,Actual,Actuals,public,Nebraska < United States,Nebraska,34.0,\nvet_pop,vet_pop,,Nevada,,#,,3,,#,,#,,7,,#,,#,,12,,#,,#,,17,,#,,#,,34,,#,,52,,2011,20111,201101,1,#,,Actual,Actuals,public,Nevada < United States,Nevada,228213.0,\nvet_suicides,vet_suicides,,Nevada,,#,,3,,#,,#,,2,,#,,#,,7,,#,,#,,20,,#,,#,,28,,#,,47,,2007,20071,200701,1,#,,Actual,Actuals,public,Nevada < United States,Nevada,104.0,\nall_suicides,all_suicides,,South Dakota,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2008,20081,200801,1,#,,Actual,Actuals,public,South Dakota < United States,South Dakota,124.0,\nvet_pop,vet_pop,,New Hampshire,,1,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2009,20091,200901,1,27,,Actual,Actuals,public,New Hampshire < United States,New Hampshire,114796.0,\nvet_suicides,vet_suicides,,New Mexico,,5,,8,,#,,#,,6,,#,,#,,9,,#,,#,,14,,#,,#,,11,,#,,35,,2011,20111,201101,1,78,,Actual,Actuals,public,New Mexico < United States,New Mexico,83.0,\nvet_pop_p,vet_pop_p,,Nevada,,#,,5,,#,,#,,4,,#,,#,,9,,#,,#,,23,,#,,#,,37,,#,,53,,2008,20081,200801,1,#,,Actual,Actuals,public,Nevada < United States,Nevada,0.11823430000000001,\nall_suicides,all_suicides,,New Mexico,,7,,6,,#,,#,,4,,#,,#,,10,,#,,#,,20,,#,,#,,18,,#,,38,,2007,20071,200701,1,89,,Actual,Actuals,public,New Mexico < United States,New Mexico,401.0,\nvet_pop,vet_pop,,Montana,,1,,1,,#,,#,,#,,#,,7,,#,,#,,#,,#,,#,,25,,#,,#,,15,,2009,20091,200901,1,47,,Actual,Actuals,public,Montana < United States,Montana,96661.0,\nvet_suicides,vet_suicides,,New Jersey,,1,,2,,#,,#,,6,,#,,#,,13,,#,,#,,10,,#,,#,,21,,#,,41,,2006,20061,200601,1,92,,Actual,Actuals,public,New Jersey < United States,New Jersey,93.0,\nall_suicides,all_suicides,,Nebraska,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2007,20071,200701,1,#,,Actual,Actuals,public,Nebraska < United States,Nebraska,181.0,\nvet_pop_p,vet_pop_p,,Tennessee,,5,,3,,#,,#,,9,,#,,#,,15,,#,,#,,27,,#,,#,,46,,#,,83,,2005,20051,200501,1,178,,Actual,Actuals,public,Tennessee < United States,Tennessee,0.11555239999999999,\nvet_pop,vet_pop,,Georgia,,#,,9,,#,,#,,25,,#,,#,,27,,#,,#,,41,,#,,#,,56,,#,,86,,2009,20091,200901,1,#,,Actual,Actuals,public,Georgia < United States,Georgia,693809.0,\nvet_suicides,vet_suicides,,Montana,,1,,1,,#,,#,,#,,#,,10,,#,,#,,#,,#,,#,,17,,#,,#,,22,,2008,20081,200801,1,49,,Actual,Actuals,public,Montana < United States,Montana,50.0,\nall_suicides,all_suicides,,Idaho,,3,,3,,#,,#,,4,,#,,#,,#,,#,,16,,#,,#,,#,,17,,#,,30,,2010,20101,201001,1,67,,Actual,Actuals,public,Idaho < United States,Idaho,290.0,\nvet_pop_p,vet_pop_p,,Connecticut,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2010,20101,201001,1,#,,Actual,Actuals,public,Connecticut < United States,Connecticut,0.08183739999999999,\nvet_pop,vet_pop,,Wyoming,,0,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2011,20111,201101,1,#,,Actual,Actuals,public,Wyoming < United States,Wyoming,52415.0,\nvet_suicides,vet_suicides,,Pennsylvania,,3,,9,,#,,#,,13,,#,,#,,28,,#,,#,,41,,#,,#,,60,,#,,141,,2009,20091,200901,1,289,,Actual,Actuals,public,Pennsylvania < United States,Pennsylvania,292.0,\nvet_pop_p,vet_pop_p,,Indiana,,2,,#,,9,,#,,#,,12,,#,,#,,23,,#,,#,,37,,#,,#,,67,,#,,2009,20091,200901,1,148,,Actual,Actuals,public,Indiana < United States,Indiana,0.09765139999999999,\nall_suicides,all_suicides,,New Jersey,,1,,2,,#,,#,,4,,#,,#,,7,,#,,#,,10,,#,,#,,16,,#,,41,,2005,20051,200501,1,79,,Actual,Actuals,public,New Jersey < United States,New Jersey,536.0,\nvet_pop,vet_pop,,Kansas,,4,,2,,#,,#,,5,,#,,#,,16,,#,,#,,15,,#,,#,,19,,#,,28,,2005,20051,200501,1,82,,Actual,Actuals,public,Kansas < United States,Kansas,238506.0,\noverall_pop_18,overall_pop_18,,Oklahoma,,#,,0,,#,,#,,8,,#,,#,,12,,#,,#,,23,,#,,#,,19,,#,,50,,2007,20071,200701,1,#,,Actual,Actuals,public,Oklahoma < United States,Oklahoma,2694837.0,\nciv_rate,civ_rate,,Alaska,,0,,2,,#,,#,,9,,#,,#,,5,,#,,#,,4,,#,,#,,10,,#,,4,,2009,20091,200901,1,34,,Actual,Actuals,public,Alaska < United States,Alaska,25.342236399999997,UNI\nvet_suicides,vet_suicides,,South Carolina,,3,,11,,#,,#,,8,,#,,#,,17,,#,,#,,13,,#,,#,,36,,#,,47,,2010,20101,201001,1,129,,Actual,Actuals,public,South Carolina < United States,South Carolina,132.0,\nvet_pop_p,vet_pop_p,,Utah,,1,,2,,#,,#,,7,,#,,#,,5,,#,,#,,9,,#,,#,,10,,#,,16,,2005,20051,200501,1,48,,Actual,Actuals,public,Utah < United States,Utah,0.0850978,\nvet_pop,vet_pop,,New York,,4,,2,,#,,#,,#,,#,,#,,7,,#,,#,,6,,#,,#,,54,,#,,155,,2008,20081,200801,1,220,,Actual,Actuals,public,New York < United States,New York,1032622.0,\nall_suicides,all_suicides,,New Jersey,,1,,2,,#,,#,,5,,#,,#,,7,,#,,#,,13,,#,,#,,20,,#,,47,,2010,20101,201001,1,93,,Actual,Actuals,public,New Jersey < United States,New Jersey,719.0,\nvet_suicides_p,vet_suicides_p,,New Mexico,,5,,3,,#,,#,,7,,#,,#,,10,,#,,#,,15,,#,,#,,26,,#,,24,,2009,20091,200901,1,80,,Actual,Actuals,public,New Mexico < United States,New Mexico,0.22606379999999998,\noverall_pop_18,overall_pop_18,,Nevada,,#,,3,,#,,#,,2,,#,,#,,7,,#,,#,,20,,#,,#,,30,,#,,48,,2006,20061,200601,1,#,,Actual,Actuals,public,Nevada < United States,Nevada,1852592.0,\nvet_suicides,vet_suicides,,Minnesota,,2,,5,,#,,#,,6,,#,,#,,11,,#,,#,,19,,#,,#,,34,,#,,50,,2007,20071,200701,1,123,,Actual,Actuals,public,Minnesota < United States,Minnesota,125.0,\nciv_rate,civ_rate,,Hawaii,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2008,20081,200801,1,#,,Actual,Actuals,public,Hawaii < United States,Hawaii,13.240904800000001,UNI\nvet_pop_p,vet_pop_p,,Florida,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2008,20081,200801,1,#,,Actual,Actuals,public,Florida < United States,Florida,0.1160661,\nvet_pop,vet_pop,,Nevada,,#,,1,,#,,#,,5,,#,,#,,13,,#,,#,,19,,#,,#,,23,,#,,57,,2009,20091,200901,1,#,,Actual,Actuals,public,Nevada < United States,Nevada,218908.0,\nall_suicides,all_suicides,,Minnesota,,6,,2,,#,,#,,8,,#,,#,,15,,#,,#,,23,,#,,#,,16,,#,,49,,2006,20061,200601,1,107,,Actual,Actuals,public,Minnesota < United States,Minnesota,554.0,\nvet_suicides_p,vet_suicides_p,,West Virginia,,3,,1,,#,,#,,6,,#,,#,,8,,#,,#,,13,,#,,#,,17,,#,,25,,2011,20111,201101,1,67,,Actual,Actuals,public,West Virginia < United States,West Virginia,0.2527076,\nvet_suicides,vet_suicides,,Missouri,,3,,6,,#,,#,,12,,#,,#,,24,,#,,#,,33,,#,,#,,33,,#,,72,,2007,20071,200701,1,177,,Actual,Actuals,public,Missouri < United States,Missouri,180.0,\noverall_pop_18,overall_pop_18,,North Dakota,,1,,0,,#,,#,,0,,#,,#,,0,,#,,#,,3,,#,,#,,5,,#,,5,,2008,20081,200801,1,13,,Actual,Actuals,public,North Dakota < United States,North Dakota,493281.0,\nciv_rate,civ_rate,,Utah,,3,,0,,#,,#,,0,,#,,#,,0,,#,,#,,14,,#,,#,,16,,#,,31,,2011,20111,201101,1,68,,Actual,Actuals,public,Utah < United States,Utah,22.252851800000002,UNI\nvet_pop_p,vet_pop_p,,Nebraska,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2011,20111,201101,1,#,,Actual,Actuals,public,Nebraska < United States,Nebraska,0.10607249999999999,\nvet_pop,vet_pop,,West Virginia,,2,,4,,#,,#,,3,,#,,#,,9,,#,,#,,7,,#,,#,,12,,#,,23,,2008,20081,200801,1,56,,Actual,Actuals,public,West Virginia < United States,West Virginia,171744.0,\nall_suicides,all_suicides,,Iowa,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,#,,2011,20111,201101,1,#,,Actual,Actuals,public,Iowa < United States,Iowa,370.0,\nvet_suicides,vet_suicides,,Mississippi,,4,,3,,#,,#,,4,,#,,#,,9,,#,,#,,11,,#,,#,,12,,#,,38,,2009,20091,200901,1,73,,Actual,Actuals,public,Mississippi < United States,Mississippi,77.0,\n"
	  });	
});	

app.get("/data/getApproverNotificaions", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"ASSIGNED_TIMESTAMP": "2022-01-14 14:23:49.157000000",
			"CARD_NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/",
			"CARD_ID": "F45C00D059C95BE41700C402E246BAF3",
			"ICON": "sap-icon://form",
			"WF_NAME": "Data Card",
			"CREATED_BY": "DEMO"
		  },
		  {
			"ASSIGNED_TIMESTAMP": "2021-06-14 19:27:12.406000000",
			"CARD_NAME": "My Test Model",
			"CARD_ID": "9F6C00C0CB9CD49C1700C40210085FCE",
			"ICON": "sap-icon://overview-chart",
			"WF_NAME": "Model Card",
			"CREATED_BY": "MICHELLE"
		  },
		  {
			"ASSIGNED_TIMESTAMP": "2021-06-02 12:26:26.076000000",
			"CARD_NAME": "/S3-Publish/LOE1/UNCLASSIFIED/JSON/",
			"CARD_ID": "478B01203AC39E981700C402E1D52F82",
			"ICON": "sap-icon://form",
			"WF_NAME": "Data Card",
			"CREATED_BY": "MICHELLE"
		  },
		  {
			"ASSIGNED_TIMESTAMP": "2021-01-29 14:09:06.531000000",
			"CARD_NAME": "European Daily Hospital/ICU Admission rate   ",
			"CARD_ID": "E8B00530DFFA9E6B17005002BA3C7DE6",
			"ICON": "sap-icon://form",
			"WF_NAME": "Data Card",
			"CREATED_BY": "sarah.bacharach"
		  }
		]
	  });	
});	

app.get("/model/getModelCardById", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
		  "MODEL_CARD_ID": "7DD200B0714E9B7F1700480269F90446",
		  "MODEL_NAME": "U.S. Veteran Mental Health",
		  "MODEL_DEVELOPER": "SAP NS2",
		  "DEV_DATE": "2021-03-11",
		  "VERSION": "v1",
		  "VERSION_CHANGES": "",
		  "MODEL_TYPE": "Random Forest/Generalized Linear",
		  "DESCRIPTION": "Analyzes the rate of suicide and mental health issues of U.S. veterans as a comparison to the general U.S. civilian population using Random Forest and Generalized Linear Regression",
		  "POC_NAME": "SAP NS2",
		  "POC_EMAIL": "NS2Demo@sapns2.com",
		  "POC_PHONE": "703-555-5555",
		  "INTENDED_USERS": "VA staff and Mental Health Experts",
		  "INTENDED_USES": "This data is intended to be used to train mental health professionals to look for traits or behaviors that could be precursors to mental health issues",
		  "LIMITATIONS": "No Limitations",
		  "IMPACT": "Undetermined",
		  "LINKED_DATACARDS": "",
		  "SOURCE_OF_DATA": "TESTING",
		  "TYPE_OF_DATA": "Tabular",
		  "DATASET_TIME_PERIOD": "",
		  "TRAINING_DATA_SELECTION": "",
		  "TRAINING_DATA_MOD": "No",
		  "ML_MISREP": "",
		  "MODEL_SECURITY": "Unidentified",
		  "MODEL_TESTING": "A random subset of data was selected",
		  "MODEL_VALIDATION": "Internal validation",
		  "PERFORMANCE_MEASURES": "Actual Mental Health Rates",
		  "DESCION_THRES_DETERMINATION": null,
		  "DECISION_THRES_PROPS": "",
		  "CONFIDENCE_INTERVALS": "Confidence intervals are not currently available",
		  "DEPLOYMENT_CONTROLS": "N/A",
		  "MODEL_DRIFT": "Model is recomputed as new data is introduced",
		  "STOP_MECHANISM": "There are no feedback loops or stop mechanisms currently in place.",
		  "RISKS": "N/A",
		  "HARM_MIN": "Unknown at this time",
		  "RISK_MITIGATION": "Continual Validation",
		  "CREATION_TIMESTAMP": "2021-03-11 14:24:02.000000000",
		  "TRAINING_LIMITATIONS": "No LImitations",
		  "LINKED_MODEL_CARDS": null,
		  "LICENSES": "No Licenses Required",
		  "MODEL_OS": "",
		  "MODEL_CLASSIFICATION": "UNCLASSIFIED",
		  "MODEL_INFO_ASSURANCE": "",
		  "DATA_FILE_FORMAT": "",
		  "RESULT_OUTPUT": "",
		  "MODEL_PRIVACY": "",
		  "CREATION_USERID": "JHOFFNER",
		  "IS_APPROVED": 1,
		  "WF_ID": "981001F03684983317004802DFA4BD6A",
		  "LAST_UPDATED_BY": "MICHELLE",
		  "LAST_UPDATED_TIMESTAMP": "2021-04-14 14:25:41.531000000",
		  "MODEL_URL": "https://k274e6.us2.sapbusinessobjects.cloud/sap/fpa/ui/tenants/274e6/app.html#;view_id=story;storyId=6619E2F279AB4228107408AB9A6157A2",
		  "CURRENT_STATE": null,
		  "CURRENT_STATE_ID": null,
		  "ACTION_TAKEN": "APPROVED",
		  "DATA_SETS": [
			{
			  "DATA_SET_ID": "97323d7480454b56862cec6d6c5595a6",
			  "NAME": "Military Locations",
			  "DATANODE_PATH": "/S3-Publish/LOE1/CLASSIFIED/DI-Data/",
			  "URL": null,
			  "LAST_MOD_DATE": "2021-03-09 21:51:45.319000000",
			  "CLASSIFICATION": "UNCLASSIFIED"
			},
			{
			  "DATA_SET_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			  "NAME": "VA Mental Health Information",
			  "DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/VA-SAC/",
			  "URL": null,
			  "LAST_MOD_DATE": "2021-04-13 16:18:10.205000000",
			  "CLASSIFICATION": "UNCLASSIFIED"
			}
		  ],
		  "ATTACHMENTS": [
			{
			  "ATTACHMENT_ID": "2FE700B0714E9B7F1700480269F90446",
			  "FILE_NAME": "us-vet-health-model.PNG",
			  "FILE_TYPE": "image/png",
			  "FILE_SIZE": 430252,
			  "UPLOAD_DATE": "2021-03-11 21:44:43.907000000"
			}
		  ]
		}
	  });	
});	

app.get("/model/getModelDataSetCategories", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"PRIME_CATEGORY": "Location/Map Data",
			"COUNT": 1
		  },
		  {
			"PRIME_CATEGORY": "Hospital/PPE Statistics",
			"COUNT": 1
		  }
		]
	  });	
});	

app.get("/model/getModelCardAttachments", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"ATTACHMENT_ID": "2FE700B0714E9B7F1700480269F90446",
			"FILE_NAME": "us-vet-health-model.PNG",
			"FILE_TYPE": "image/png",
			"FILE_SIZE": 430252,
			"UPLOAD_DATE": "2021-03-11 21:44:43.907000000"
		  }
		]
	  });	
});	

app.get("/data/getAudit", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "LYNN",
			"ACTION_TIMESTAMP": "2022-03-01 10:24:48.300000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "LYNN",
			"ACTION_TIMESTAMP": "2022-02-28 20:10:15.161000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "LYNN",
			"ACTION_TIMESTAMP": "2022-02-28 20:10:07.054000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "LYNN",
			"ACTION_TIMESTAMP": "2022-02-28 16:00:57.964000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-21 07:31:08.346000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-15 14:55:09.347000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-15 13:46:53.794000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-15 13:45:39.302000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-13 18:28:57.229000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-08 19:28:36.671000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-02 21:37:54.624000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-02 21:30:52.657000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-02 21:30:26.117000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-02 17:50:21.405000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-12-02 17:48:43.538000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-08-25 21:00:17.314000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-08-25 20:52:20.435000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-07-21 14:35:29.397000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-06-28 19:38:01.714000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-06-13 18:00:53.873000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-06-13 18:00:13.209000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-06-11 16:28:11.830000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-06-11 16:24:23.504000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-06-11 16:23:38.261000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-06-11 16:22:40.363000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-06-11 16:21:24.811000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-06-11 16:20:34.107000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-06-02 16:58:04.030000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-06-02 16:25:09.750000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-06-02 16:25:01.981000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-06-02 16:22:49.281000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-06-02 16:22:35.370000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-06-01 19:40:12.320000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-27 12:48:54.411000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-27 12:47:31.060000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-24 14:32:37.946000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-24 14:06:44.312000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-24 14:02:51.333000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-21 21:29:11.414000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-21 20:07:01.121000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-21 20:03:39.453000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-21 19:29:14.555000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-21 19:24:25.503000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-21 18:48:26.940000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-21 18:47:07.611000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-21 18:46:40.014000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-21 18:46:07.868000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-21 16:19:12.006000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-21 14:32:18.576000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-21 14:31:04.469000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-21 14:24:24.012000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-21 13:36:25.769000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-21 13:06:55.979000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-21 00:29:47.538000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-20 18:28:44.527000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-20 18:13:04.316000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-20 18:11:57.126000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-20 18:10:39.109000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-20 17:54:03.733000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-20 17:49:07.100000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-20 17:48:39.131000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-20 17:48:05.736000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-20 16:15:27.878000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-20 15:16:31.025000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 23:07:49.010000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 19:38:46.853000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:39:42.965000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:37:15.317000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:35:22.816000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:33:37.621000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:31:03.015000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:29:50.573000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:20:16.420000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:18:31.925000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:17:08.102000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:11:09.605000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:10:18.970000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:05:52.067000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 17:03:38.789000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 16:03:45.570000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 15:51:05.623000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-19 15:40:38.277000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 18:49:27.024000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 18:17:45.792000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 18:12:48.532000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 18:10:56.887000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 18:10:04.300000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 18:06:39.684000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 18:06:30.086000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 18:01:24.385000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 17:59:39.136000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 17:57:37.587000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 17:50:12.981000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 17:47:22.504000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 17:44:56.747000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 17:36:18.890000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 17:27:42.860000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 15:30:04.669000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 15:13:36.498000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 15:12:11.019000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 15:07:58.586000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 14:45:53.505000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 14:43:07.540000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 13:59:12.202000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 13:56:56.770000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-18 13:54:14.493000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 13:44:16.430000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 13:42:07.765000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 13:38:32.932000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 13:38:09.867000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-18 13:37:47.746000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 20:29:52.872000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 18:43:19.738000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 18:11:49.827000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 18:10:46.471000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 18:10:32.490000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 18:08:08.204000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 18:06:49.133000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 18:03:50.005000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 18:03:32.504000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 18:00:13.302000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 17:57:45.372000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 17:57:23.213000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 17:38:20.664000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 17:38:10.640000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:42:47.114000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:41:34.857000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:38:24.400000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:38:05.168000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:37:00.700000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:13:27.351000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:11:55.325000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:10:51.294000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:09:04.339000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:08:15.337000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:05:01.649000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:03:28.437000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:02:26.135000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 15:00:45.102000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 14:58:52.285000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 14:57:56.231000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 14:52:35.233000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 14:47:19.356000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 14:43:05.635000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 14:37:22.635000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 14:09:58.212000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 14:09:22.051000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 13:43:40.592000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 13:42:13.235000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 13:11:53.293000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:49:08.840000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:48:58.235000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:48:08.248000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:47:59.533000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:42:31.384000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:40:29.756000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:40:03.199000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:38:50.535000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:38:04.399000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:37:19.320000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:37:11.324000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:28:31.889000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:23:50.822000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:23:39.593000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:19:33.886000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-17 12:18:19.513000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-14 20:36:46.787000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-14 20:35:32.776000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 20:44:56.225000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 20:44:01.593000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 18:11:36.340000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 14:23:33.425000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 14:18:35.005000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 14:13:25.819000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 14:13:13.489000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 13:55:18.782000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 13:53:20.977000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 13:52:02.829000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-13 13:48:32.632000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-12 19:29:13.232000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-12 19:26:12.612000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-12 19:25:14.871000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-12 19:19:13.574000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-12 18:02:31.541000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-11 18:47:02.865000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-11 18:46:43.160000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 18:20:40.399000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 18:20:33.539000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 18:20:23.869000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 18:18:00.435000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 18:17:49.670000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 18:13:14.030000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 15:37:57.125000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 15:36:50.344000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 15:36:29.692000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 15:31:47.451000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-11 15:30:43.064000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-11 14:30:51.254000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-11 14:30:00.601000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-11 14:29:47.019000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-11 14:29:29.956000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-11 14:24:57.394000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-10 19:57:24.655000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-05-07 12:15:11.626000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-05-07 12:13:44.521000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-06 20:06:39.811000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-06 20:06:38.175000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-05-06 13:28:52.063000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-06 13:25:30.586000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-06 13:20:16.977000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-06 13:18:07.097000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-06 12:54:39.564000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-06 12:46:48.139000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-06 12:46:41.527000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-05-06 12:42:05.998000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-05-06 12:40:26.263000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-05-06 12:37:54.789000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-05-06 12:05:32.118000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-05-05 19:56:37.684000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-05 17:38:09.112000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-05 17:37:08.650000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-05 16:43:49.584000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-05 16:43:15.739000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-05 16:41:50.532000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-05 16:29:41.187000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-05 16:29:04.969000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-05-05 16:28:40.002000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-29 17:19:23.051000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-29 17:18:19.921000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-29 17:09:44.041000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-29 16:23:06.550000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-29 16:21:06.638000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 18:00:56.392000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 17:53:10.177000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 17:52:58.930000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 17:38:18.687000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 17:31:28.537000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 17:31:03.202000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 17:30:13.809000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 17:27:21.626000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 17:26:42.464000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 15:18:39.960000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 15:18:14.967000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 12:55:45.570000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 12:49:52.724000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 12:47:36.483000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 12:45:57.724000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 12:45:40.551000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 12:45:27.954000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 12:44:49.346000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 12:44:26.241000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-26 12:43:57.299000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-25 23:36:15.564000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-25 23:36:01.002000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-25 23:35:51.480000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-25 23:35:29.435000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-25 23:35:02.291000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-21 16:39:04.230000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-21 12:38:22.317000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-21 12:38:04.530000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-21 12:37:54.734000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-14 22:11:40.283000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-14 16:48:01.935000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-14 16:47:58.857000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-14 13:03:12.228000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:38:45.374000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:29:20.172000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:28:34.476000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:28:10.041000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:27:53.772000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:27:31.959000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:27:23.783000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:25:45.137000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:25:41.086000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:15:38.381000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:06:45.059000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:05:57.135000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 18:05:51.479000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 17:52:58.789000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-13 17:49:59.789000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 17:44:45.426000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-13 17:43:41.330000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 17:25:32.780000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-13 17:19:24.566000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-12 22:09:43.954000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "DEMO",
			"ACTION_TIMESTAMP": "2021-04-12 22:09:21.775000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-02 14:27:05.483000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-04-01 18:17:34.906000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-01 18:17:29.724000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-01 18:17:13.706000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-04-01 18:11:57.835000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-04-01 18:10:25.872000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-04-01 18:08:37.976000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-04-01 18:06:12.843000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-31 19:23:54.582000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-31 19:18:45.675000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-03-30 14:46:56.166000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-03-30 14:39:45.222000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-03-30 14:39:14.365000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-30 14:34:19.304000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-30 14:34:12.496000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-26 15:31:09.217000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-26 14:42:58.310000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-26 14:42:11.500000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-26 13:36:13.920000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-26 00:10:28.348000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-26 00:09:51.881000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-03-25 15:09:33.779000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-03-25 15:03:58.712000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-24 15:37:19.844000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-24 15:34:35.869000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-24 15:29:08.909000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-24 15:27:25.465000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-24 15:24:24.972000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-24 00:12:45.320000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-23 22:43:32.547000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-03-22 15:24:21.213000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "OFER",
			"ACTION_TIMESTAMP": "2021-03-22 15:14:24.207000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 19:38:13.224000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 19:35:42.856000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 19:34:22.941000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 19:30:51.799000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 18:46:47.790000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 18:36:06.447000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 17:57:57.620000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 17:39:09.195000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 17:15:48.900000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 17:10:19.777000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 17:09:22.220000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "WAYNE",
			"ACTION_TIMESTAMP": "2021-03-19 17:07:19.304000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-19 15:07:39.919000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JAIC1",
			"ACTION_TIMESTAMP": "2021-03-19 03:03:39.550000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JAIC1",
			"ACTION_TIMESTAMP": "2021-03-19 03:03:28.914000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JAIC1",
			"ACTION_TIMESTAMP": "2021-03-19 02:47:32.247000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JAIC1",
			"ACTION_TIMESTAMP": "2021-03-19 02:39:54.315000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JAIC1",
			"ACTION_TIMESTAMP": "2021-03-19 02:39:43.354000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JAIC1",
			"ACTION_TIMESTAMP": "2021-03-19 02:39:35.950000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JAIC1",
			"ACTION_TIMESTAMP": "2021-03-19 02:39:18.042000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JAIC1",
			"ACTION_TIMESTAMP": "2021-03-19 02:39:08.540000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JAIC1",
			"ACTION_TIMESTAMP": "2021-03-19 02:38:54.773000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 02:18:48.562000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 02:18:39.842000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 02:16:14.166000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 02:14:07.926000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 00:16:23.504000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 00:05:48.839000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 00:05:20.195000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 00:04:26.744000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 00:03:12.886000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 00:03:08.781000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 00:03:01.623000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 00:02:55.369000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "JHOFFNER",
			"ACTION_TIMESTAMP": "2021-03-19 00:02:49.232000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "DOWNLOAD",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-18 19:24:53.446000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-18 19:23:41.337000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-18 19:02:07.635000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-18 18:59:06.626000000"
		  },
		  {
			"OBJECT_ID": "ac99796928504dd7a3fd6bbfde054b4f",
			"OBJECT_TYPE": "DATA SET",
			"ACTION": "VIEW",
			"USERID": "MICHELLE",
			"ACTION_TIMESTAMP": "2021-03-17 23:48:48.076000000"
		  }
		]
	  });	
});	

app.get("/data/getSourceFilters", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"NAME": "UNKNOWN",
			"TOTAL": 17
		  },
		  {
			"NAME": "CDC",
			"TOTAL": 6
		  },
		  {
			"NAME": "USDA",
			"TOTAL": 6
		  },
		  {
			"NAME": "Census",
			"TOTAL": 4
		  },
		  {
			"NAME": "Equifax",
			"TOTAL": 3
		  },
		  {
			"NAME": "European Center for Disease Prevention and Control",
			"TOTAL": 3
		  },
		  {
			"NAME": "Feeding America",
			"TOTAL": 3
		  },
		  {
			"NAME": "Medicare.gov",
			"TOTAL": 3
		  },
		  {
			"NAME": "Sciensano (Belgium Institute of Health)",
			"TOTAL": 3
		  },
		  {
			"NAME": "BEA",
			"TOTAL": 2
		  },
		  {
			"NAME": "BLS",
			"TOTAL": 2
		  },
		  {
			"NAME": "CMS",
			"TOTAL": 2
		  },
		  {
			"NAME": "DHS",
			"TOTAL": 2
		  },
		  {
			"NAME": "EU Data Portal",
			"TOTAL": 2
		  },
		  {
			"NAME": "FDA",
			"TOTAL": 2
		  },
		  {
			"NAME": "HUD",
			"TOTAL": 2
		  },
		  {
			"NAME": "NYTimes",
			"TOTAL": 2
		  },
		  {
			"NAME": "Open Street Maps",
			"TOTAL": 2
		  },
		  {
			"NAME": "Park City Group",
			"TOTAL": 2
		  },
		  {
			"NAME": "US Census Bureau",
			"TOTAL": 2
		  },
		  {
			"NAME": "Unacast",
			"TOTAL": 2
		  },
		  {
			"NAME": "ACLED",
			"TOTAL": 1
		  },
		  {
			"NAME": "Air Force",
			"TOTAL": 1
		  },
		  {
			"NAME": "Apple",
			"TOTAL": 1
		  },
		  {
			"NAME": "AutoTrader",
			"TOTAL": 1
		  },
		  {
			"NAME": "CBP",
			"TOTAL": 1
		  },
		  {
			"NAME": "COVID Tracking Project",
			"TOTAL": 1
		  },
		  {
			"NAME": "Change Healthcare",
			"TOTAL": 1
		  },
		  {
			"NAME": "Columbia University",
			"TOTAL": 1
		  },
		  {
			"NAME": "CoronaDataScraper.com",
			"TOTAL": 1
		  },
		  {
			"NAME": "CovidActNow.com",
			"TOTAL": 1
		  },
		  {
			"NAME": "CovidTracking.com",
			"TOTAL": 1
		  },
		  {
			"NAME": "DATA.GOV",
			"TOTAL": 1
		  },
		  {
			"NAME": "DOL",
			"TOTAL": 1
		  },
		  {
			"NAME": "Data.gov",
			"TOTAL": 1
		  },
		  {
			"NAME": "Definitive Healthcare",
			"TOTAL": 1
		  },
		  {
			"NAME": "Education Week",
			"TOTAL": 1
		  },
		  {
			"NAME": "Esri",
			"TOTAL": 1
		  },
		  {
			"NAME": "Eurostat",
			"TOTAL": 1
		  },
		  {
			"NAME": "Fouresquare",
			"TOTAL": 1
		  },
		  {
			"NAME": "GBSP",
			"TOTAL": 1
		  },
		  {
			"NAME": "Google",
			"TOTAL": 1
		  },
		  {
			"NAME": "HHS",
			"TOTAL": 1
		  },
		  {
			"NAME": "Hc1",
			"TOTAL": 1
		  },
		  {
			"NAME": "Healthdata.org",
			"TOTAL": 1
		  },
		  {
			"NAME": "Humetrix",
			"TOTAL": 1
		  },
		  {
			"NAME": "IRS",
			"TOTAL": 1
		  },
		  {
			"NAME": "JHUAPL",
			"TOTAL": 1
		  },
		  {
			"NAME": "JRC",
			"TOTAL": 1
		  },
		  {
			"NAME": "KFF",
			"TOTAL": 1
		  },
		  {
			"NAME": "Kaggle",
			"TOTAL": 1
		  },
		  {
			"NAME": "Kaiser Family Foundation (KFF)",
			"TOTAL": 1
		  },
		  {
			"NAME": "Microsoft",
			"TOTAL": 1
		  },
		  {
			"NAME": "NIFC",
			"TOTAL": 1
		  },
		  {
			"NAME": "NPGEO",
			"TOTAL": 1
		  },
		  {
			"NAME": "National Association of Counties",
			"TOTAL": 1
		  },
		  {
			"NAME": "New York Times",
			"TOTAL": 1
		  },
		  {
			"NAME": "Our World in Data",
			"TOTAL": 1
		  },
		  {
			"NAME": "Oxford University",
			"TOTAL": 1
		  },
		  {
			"NAME": "RelevantData",
			"TOTAL": 1
		  },
		  {
			"NAME": "Safe Graph",
			"TOTAL": 1
		  },
		  {
			"NAME": "Shoreland",
			"TOTAL": 1
		  },
		  {
			"NAME": "SouperBowlofCaring",
			"TOTAL": 1
		  },
		  {
			"NAME": "Surgo Foundation",
			"TOTAL": 1
		  },
		  {
			"NAME": "USAFacts",
			"TOTAL": 1
		  },
		  {
			"NAME": "United Nations",
			"TOTAL": 1
		  },
		  {
			"NAME": "WHO",
			"TOTAL": 1
		  },
		  {
			"NAME": "Wikipedia",
			"TOTAL": 1
		  },
		  {
			"NAME": null,
			"TOTAL": 0
		  }
		]
	  });	
});	

app.get("/data/getDataSetFileTypes", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"NAME": "CSV",
			"TOTAL": 49
		  },
		  {
			"NAME": "JSON",
			"TOTAL": 18
		  },
		  {
			"NAME": "TXT",
			"TOTAL": 18
		  },
		  {
			"NAME": "PDF",
			"TOTAL": 13
		  },
		  {
			"NAME": "DOCX",
			"TOTAL": 12
		  },
		  {
			"NAME": "XML",
			"TOTAL": 12
		  },
		  {
			"NAME": "DBF",
			"TOTAL": 10
		  },
		  {
			"NAME": "PRJ",
			"TOTAL": 10
		  },
		  {
			"NAME": "SHP",
			"TOTAL": 10
		  },
		  {
			"NAME": "SHX",
			"TOTAL": 10
		  },
		  {
			"NAME": "CPG",
			"TOTAL": 9
		  },
		  {
			"NAME": "XLSX",
			"TOTAL": 8
		  },
		  {
			"NAME": "SBN",
			"TOTAL": 5
		  },
		  {
			"NAME": "SBX",
			"TOTAL": 5
		  },
		  {
			"NAME": "ZIP",
			"TOTAL": 3
		  },
		  {
			"NAME": "ARFF",
			"TOTAL": 2
		  },
		  {
			"NAME": "NAMES",
			"TOTAL": 2
		  },
		  {
			"NAME": "XLS",
			"TOTAL": 2
		  },
		  {
			"NAME": "DEMO",
			"TOTAL": 1
		  },
		  {
			"NAME": "E00",
			"TOTAL": 1
		  },
		  {
			"NAME": "GEOJSON",
			"TOTAL": 1
		  },
		  {
			"NAME": "LYR",
			"TOTAL": 1
		  },
		  {
			"NAME": "M",
			"TOTAL": 1
		  },
		  {
			"NAME": "MD",
			"TOTAL": 1
		  },
		  {
			"NAME": "MINES",
			"TOTAL": 1
		  },
		  {
			"NAME": "PPTX",
			"TOTAL": 1
		  },
		  {
			"NAME": "ROCKS",
			"TOTAL": 1
		  },
		  {
			"NAME": "SDW",
			"TOTAL": 1
		  },
		  {
			"NAME": "SID",
			"TOTAL": 1
		  },
		  {
			"NAME": "SQL",
			"TOTAL": 1
		  },
		  {
			"NAME": "SVG",
			"TOTAL": 1
		  }
		]
	  });	
});	

app.get("/imagery/getClassificationFilters", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"NAME": "Unclassified",
			"TOTAL": 40,
			"SELECTED": "false"
		  }
		]
	  });	
});	

app.get("/imagery/getLabelFilters", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"NAME": "Person",
			"TOTAL": 24,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Pedestrian",
			"TOTAL": 16,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Biker",
			"TOTAL": 16,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Car",
			"TOTAL": 11,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Skater",
			"TOTAL": 10,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Cart",
			"TOTAL": 10,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Bus",
			"TOTAL": 9,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Glasses",
			"TOTAL": 4,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Shoe",
			"TOTAL": 4,
			"SELECTED": "false"
		  },
		  {
			"NAME": "jeans",
			"TOTAL": 3,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Jeans",
			"TOTAL": 3,
			"SELECTED": "false"
		  },
		  {
			"NAME": "person",
			"TOTAL": 3,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Shirt",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "luggage & bags",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "hat",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "pants",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Hat",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "outerwear",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Sunglasses",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "top",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Bird",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Truck",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Wheel",
			"TOTAL": 2,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Skirt",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "sneakers",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Suit",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "t-shirt",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "tableware",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "scarf",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Pizza",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Tie",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "tire",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "traffic sign",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Train",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Airplane",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "backpack",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "belt",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Birthday Cake",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Book",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Box",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "building",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "cake",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "car",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "clothing",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "curtain",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Diaper",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Door",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Fire Hydrant",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "food",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Helicopter",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "High Heel",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Jacket",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Laptop",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "laptop",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Microphone",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Mobile Phone",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "Necklace",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "necklace",
			"TOTAL": 1,
			"SELECTED": "false"
		  }
		]
	  });	
});	

app.get("/imagery/getPlatformFilters", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"NAME": "UNKNOWN",
			"TOTAL": 38,
			"SELECTED": "false"
		  },
		  {
			"NAME": "C208B",
			"TOTAL": 1,
			"SELECTED": "false"
		  },
		  {
			"NAME": "DRONE",
			"TOTAL": 1,
			"SELECTED": "false"
		  }
		]
	  });	
});	

app.get("/imagery/getImageryTypeFilters", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"NAME": "FMV",
			"TOTAL": 40,
			"SELECTED": "false"
		  }
		]
	  });	
});	

app.get("/imagery/getTeDesignationFilters", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"NAME": "UNASSIGNED",
			"TOTAL": 26,
			"SELECTED": "false"
		  },
		  {
			"NAME": "TEST",
			"TOTAL": 6,
			"SELECTED": "false"
		  },
		  {
			"NAME": "TRAINING",
			"TOTAL": 4,
			"SELECTED": "false"
		  },
		  {
			"NAME": "VALIDATION",
			"TOTAL": 4,
			"SELECTED": "false"
		  }
		]
	  });	
});	

app.post("/imagery/searchImagery", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
		  "total": 40,
		  "results": [
			{
			  "IMAGERY_PACKAGE_UUID": "aTeA1YL3TUqjlmfhe1Q1mA",
			  "CLASSIFICATION": "Unclassified",
			  "IMAGERY_PACKAGE_NAME": "bookstore_video0",
			  "INSERTION_TIMESTAMP": "2021-06-23 11:47:02.785000000",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000000-000001.jpeg",
			  "CLIP_COUNT": 1,
			  "FRAME_COUNT": 79,
			  "CLIP_HIT_COUNT": 1,
			  "FRAME_HIT_COUNT": 79,
			  "IMAGERY_START_TIME_STAMP": "2021-06-14 16:32:19.773183000",
			  "IMAGERY_PACKAGE_TYPE": "FMV",
			  "IMAGERY_PACKAGE_DESCRIPTION": null,
			  "TE_DESIGNATION": "UNASSIGNED",
			  "DURATION_SECONDS": 2.63,
			  "NUM_VIEWS": 215
			},
			{
			  "IMAGERY_PACKAGE_UUID": "me9QJAkEREubTZwDDk26cQ",
			  "CLASSIFICATION": "Unclassified",
			  "IMAGERY_PACKAGE_NAME": "Vehicles",
			  "INSERTION_TIMESTAMP": "2021-06-22 15:12:29.855000000",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=objects2.png",
			  "CLIP_COUNT": 2,
			  "FRAME_COUNT": 431,
			  "CLIP_HIT_COUNT": 2,
			  "FRAME_HIT_COUNT": 431,
			  "IMAGERY_START_TIME_STAMP": "2021-06-13 22:58:39.202286000",
			  "IMAGERY_PACKAGE_TYPE": "FMV",
			  "IMAGERY_PACKAGE_DESCRIPTION": null,
			  "TE_DESIGNATION": "UNASSIGNED",
			  "DURATION_SECONDS": 17.24,
			  "NUM_VIEWS": 29
			},
			{
			  "IMAGERY_PACKAGE_UUID": "NaWC3vQDTvOIU8jXSp2KIA",
			  "CLASSIFICATION": "Unclassified",
			  "IMAGERY_PACKAGE_NAME": "Street scene",
			  "INSERTION_TIMESTAMP": "2021-06-23 11:47:03.052000000",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=objects3.jpg",
			  "CLIP_COUNT": 1,
			  "FRAME_COUNT": 194,
			  "CLIP_HIT_COUNT": 1,
			  "FRAME_HIT_COUNT": 194,
			  "IMAGERY_START_TIME_STAMP": "2021-06-13 17:02:25.887399000",
			  "IMAGERY_PACKAGE_TYPE": "FMV",
			  "IMAGERY_PACKAGE_DESCRIPTION": null,
			  "TE_DESIGNATION": "UNASSIGNED",
			  "DURATION_SECONDS": 7.76,
			  "NUM_VIEWS": 3
			},
			{
			  "IMAGERY_PACKAGE_UUID": "rR2GmSgGSvGm87mMyEKJmw",
			  "CLASSIFICATION": "Unclassified",
			  "IMAGERY_PACKAGE_NAME": "Street scene",
			  "INSERTION_TIMESTAMP": "2021-06-22 15:12:30.227000000",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=Objects4.jpeg",
			  "CLIP_COUNT": 1,
			  "FRAME_COUNT": 55,
			  "CLIP_HIT_COUNT": 1,
			  "FRAME_HIT_COUNT": 55,
			  "IMAGERY_START_TIME_STAMP": "2021-06-12 23:29:09.813281000",
			  "IMAGERY_PACKAGE_TYPE": "FMV",
			  "IMAGERY_PACKAGE_DESCRIPTION": null,
			  "TE_DESIGNATION": "UNASSIGNED",
			  "DURATION_SECONDS": 1.83,
			  "NUM_VIEWS": 3
			},
			{
			  "IMAGERY_PACKAGE_UUID": "MIXoglWFT0WGXqUJUNBHPA",
			  "CLASSIFICATION": "Unclassified",
			  "IMAGERY_PACKAGE_NAME": "Street scene",
			  "INSERTION_TIMESTAMP": "2021-06-23 11:47:03.289000000",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=Objects5.jpeg",
			  "CLIP_COUNT": 1,
			  "FRAME_COUNT": 198,
			  "CLIP_HIT_COUNT": 1,
			  "FRAME_HIT_COUNT": 198,
			  "IMAGERY_START_TIME_STAMP": "2021-06-12 17:32:38.347399000",
			  "IMAGERY_PACKAGE_TYPE": "FMV",
			  "IMAGERY_PACKAGE_DESCRIPTION": null,
			  "TE_DESIGNATION": "UNASSIGNED",
			  "DURATION_SECONDS": 7.92,
			  "NUM_VIEWS": 0
			},
			{
			  "IMAGERY_PACKAGE_UUID": "XtGPsJnmTY6xPJDyNnAr0w",
			  "CLASSIFICATION": "Unclassified",
			  "IMAGERY_PACKAGE_NAME": "text_on_paper_on_wall_with_person",
			  "INSERTION_TIMESTAMP": "2021-06-22 15:12:30.393000000",
			  "FIRST_FRAME_FILEPATH": "text_test1/text_on_paper_on_wall_with_person_000000/seq_jpeg/text_on_paper_on_wall_with_person_000000-000001.jpeg",
			  "CLIP_COUNT": 1,
			  "FRAME_COUNT": 80,
			  "CLIP_HIT_COUNT": 1,
			  "FRAME_HIT_COUNT": 80,
			  "IMAGERY_START_TIME_STAMP": "2021-06-11 23:59:13.432284000",
			  "IMAGERY_PACKAGE_TYPE": "FMV",
			  "IMAGERY_PACKAGE_DESCRIPTION": null,
			  "TE_DESIGNATION": "UNASSIGNED",
			  "DURATION_SECONDS": 2.67,
			  "NUM_VIEWS": 2
			},
			{
			  "IMAGERY_PACKAGE_UUID": "72ECgX8_TfisobzRFHMKJA",
			  "CLASSIFICATION": "Unclassified",
			  "IMAGERY_PACKAGE_NAME": "3_young_woman_purple_background",
			  "INSERTION_TIMESTAMP": "2021-06-23 11:47:03.511000000",
			  "FIRST_FRAME_FILEPATH": "faces_test1/3_young_woman_purple_background_000000/seq_jpeg/3_young_woman_purple_background_000000-000001.jpeg",
			  "CLIP_COUNT": 1,
			  "FRAME_COUNT": 97,
			  "CLIP_HIT_COUNT": 1,
			  "FRAME_HIT_COUNT": 97,
			  "IMAGERY_START_TIME_STAMP": "2021-06-11 18:02:50.480399000",
			  "IMAGERY_PACKAGE_TYPE": "FMV",
			  "IMAGERY_PACKAGE_DESCRIPTION": null,
			  "TE_DESIGNATION": "UNASSIGNED",
			  "DURATION_SECONDS": 3.23,
			  "NUM_VIEWS": 3
			},
			{
			  "IMAGERY_PACKAGE_UUID": "FmYUniRTTc-3YfqWMyC93A",
			  "CLASSIFICATION": "Unclassified",
			  "IMAGERY_PACKAGE_NAME": "text_woman_holding_cardboard_sign",
			  "INSERTION_TIMESTAMP": "2021-06-22 15:12:30.553000000",
			  "FIRST_FRAME_FILEPATH": "text_test1/text_woman_holding_cardboard_sign_000000/seq_jpeg/text_woman_holding_cardboard_sign_000000-000001.jpeg",
			  "CLIP_COUNT": 1,
			  "FRAME_COUNT": 53,
			  "CLIP_HIT_COUNT": 1,
			  "FRAME_HIT_COUNT": 53,
			  "IMAGERY_START_TIME_STAMP": "2021-06-11 00:29:18.854281000",
			  "IMAGERY_PACKAGE_TYPE": "FMV",
			  "IMAGERY_PACKAGE_DESCRIPTION": null,
			  "TE_DESIGNATION": "UNASSIGNED",
			  "DURATION_SECONDS": 1.77,
			  "NUM_VIEWS": 1
			},
			{
			  "IMAGERY_PACKAGE_UUID": "k-owpyLOT4Okx2E0nyWkGA",
			  "CLASSIFICATION": "Unclassified",
			  "IMAGERY_PACKAGE_NAME": "4_women_heads_on_top_of_each_other",
			  "INSERTION_TIMESTAMP": "2021-06-23 11:47:03.741000000",
			  "FIRST_FRAME_FILEPATH": "faces_test1/4_women_heads_on_top_of_each_other_000000/seq_jpeg/4_women_heads_on_top_of_each_other_000000-000001.jpeg",
			  "CLIP_COUNT": 1,
			  "FRAME_COUNT": 340,
			  "CLIP_HIT_COUNT": 1,
			  "FRAME_HIT_COUNT": 340,
			  "IMAGERY_START_TIME_STAMP": "2021-06-10 18:32:57.827407000",
			  "IMAGERY_PACKAGE_TYPE": "FMV",
			  "IMAGERY_PACKAGE_DESCRIPTION": null,
			  "TE_DESIGNATION": "UNASSIGNED",
			  "DURATION_SECONDS": 13.6,
			  "NUM_VIEWS": 2
			},
			{
			  "IMAGERY_PACKAGE_UUID": "yr2JojpFQyC78vTXkSY4aQ",
			  "CLASSIFICATION": "Unclassified",
			  "IMAGERY_PACKAGE_NAME": "5_women_serious_faces",
			  "INSERTION_TIMESTAMP": "2021-06-23 11:47:04.058000000",
			  "FIRST_FRAME_FILEPATH": "faces_test1/5_women_serious_faces_000000/seq_jpeg/5_women_serious_faces_000000-000001.jpeg",
			  "CLIP_COUNT": 1,
			  "FRAME_COUNT": 323,
			  "CLIP_HIT_COUNT": 1,
			  "FRAME_HIT_COUNT": 323,
			  "IMAGERY_START_TIME_STAMP": "2021-06-09 19:04:02.618432000",
			  "IMAGERY_PACKAGE_TYPE": "FMV",
			  "IMAGERY_PACKAGE_DESCRIPTION": null,
			  "TE_DESIGNATION": "UNASSIGNED",
			  "DURATION_SECONDS": 13.46,
			  "NUM_VIEWS": 0
			}
		  ],
		  "limit": "10",
		  "offset": "0"
		}
	  });	
});	

app.get("/imagery/getFramesHeatMap", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-122.16892 37.426073)",
			"LON": -122.16892000008374,
			"LAT": 37.426072999835014,
			"COUNTER": 26786
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.8506157985 41.099056137)",
			"LON": -104.85061579849571,
			"LAT": 41.09905613679439,
			"COUNTER": 194
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.852429458 41.085439503)",
			"LON": -104.85242945794016,
			"LAT": 41.0854395031929,
			"COUNTER": 137
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.854142112 41.082274951)",
			"LON": -104.8541421117261,
			"LAT": 41.082274951040745,
			"COUNTER": 131
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.856261106 41.079116507)",
			"LON": -104.85626110620797,
			"LAT": 41.079116507433355,
			"COUNTER": 144
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-122.173524 37.428235)",
			"LON": -122.17352399975061,
			"LAT": 37.428234999999404,
			"COUNTER": 24806
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-122.168126 37.428643)",
			"LON": -122.16812600009143,
			"LAT": 37.42864300031215,
			"COUNTER": 15588
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.85979447 41.07539482)",
			"LON": -104.85979446955025,
			"LAT": 41.075394820421934,
			"COUNTER": 137
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-122.175042 37.431264)",
			"LON": -122.17504199966788,
			"LAT": 37.43126400001347,
			"COUNTER": 25362
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.850494306 41.094156745)",
			"LON": -104.8504943056032,
			"LAT": 41.094156744889915,
			"COUNTER": 208
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-122.172953 37.429993)",
			"LON": -122.17295300029218,
			"LAT": 37.429992999881506,
			"COUNTER": 18012
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.851476222 41.087917678)",
			"LON": -104.85147622227669,
			"LAT": 41.08791767805815,
			"COUNTER": 176
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-122.174807 37.42856)",
			"LON": -122.17480699997395,
			"LAT": 37.42855999991298,
			"COUNTER": 23932
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.850790107 41.090879062)",
			"LON": -104.85079010669142,
			"LAT": 41.09087906219065,
			"COUNTER": 188
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-122.169665 37.424495)",
			"LON": -122.16966500040144,
			"LAT": 37.4244950003922,
			"COUNTER": 27893
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.851913959 41.086602889)",
			"LON": -104.85191395878792,
			"LAT": 41.08660288900137,
			"COUNTER": 143
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.850549837 41.092461396)",
			"LON": -104.85054983664304,
			"LAT": 41.09246139600873,
			"COUNTER": 199
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.85299321 41.08434631)",
			"LON": -104.85299320984632,
			"LAT": 41.08434631023556,
			"COUNTER": 132
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.85475485 41.081173819)",
			"LON": -104.85475485026836,
			"LAT": 41.081173818558455,
			"COUNTER": 140
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.8589096805 41.076300924)",
			"LON": -104.85890968050808,
			"LAT": 41.07630092371255,
			"COUNTER": 125
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.860774417 41.074495359)",
			"LON": -104.86077441740781,
			"LAT": 41.07449535932392,
			"COUNTER": 142
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.861845221 41.073660104)",
			"LON": -104.86184522137046,
			"LAT": 41.0736601036042,
			"COUNTER": 143
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.8509217845 41.104755141)",
			"LON": -104.8509217845276,
			"LAT": 41.10475514084101,
			"COUNTER": 155
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.850625947 41.100582937)",
			"LON": -104.8506259471178,
			"LAT": 41.100582936778665,
			"COUNTER": 180
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-73.9513 40.6952)",
			"LON": -73.95129999984056,
			"LAT": 40.69519999995828,
			"COUNTER": 1920
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.8511232305 41.089365667)",
			"LON": -104.85112323053181,
			"LAT": 41.08936566673219,
			"COUNTER": 183
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.853543817 41.083312573)",
			"LON": -104.85354381706566,
			"LAT": 41.08331257291138,
			"COUNTER": 130
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.8580209175 41.077176078)",
			"LON": -104.85802091751248,
			"LAT": 41.07717607822269,
			"COUNTER": 137
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.851002795 41.106093357)",
			"LON": -104.85100279469043,
			"LAT": 41.10609335731715,
			"COUNTER": 166
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.850845932 41.103417116)",
			"LON": -104.85084593202919,
			"LAT": 41.103417116217315,
			"COUNTER": 162
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.850738967 41.102054579)",
			"LON": -104.85073896683753,
			"LAT": 41.10205457918346,
			"COUNTER": 163
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.855433459 41.0800325265)",
			"LON": -104.85543345939368,
			"LAT": 41.080032526515424,
			"COUNTER": 150
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.8628431475 41.072770761)",
			"LON": -104.862843147479,
			"LAT": 41.072770761325955,
			"COUNTER": 133
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.850561874 41.097501398)",
			"LON": -104.85056187398732,
			"LAT": 41.097501398064196,
			"COUNTER": 205
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.850508245 41.09586624)",
			"LON": -104.85050824470818,
			"LAT": 41.095866239629686,
			"COUNTER": 207
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-104.85713297 41.078146114)",
			"LON": -104.85713297035545,
			"LAT": 41.07814611401409,
			"COUNTER": 130
		  },
		  {
			"CLUSTER_CENTER_POINT_WKT": "POINT (-122.169869 37.427547)",
			"LON": -122.16986900009215,
			"LAT": 37.42754700034857,
			"COUNTER": 1018
		  }
		]
	  });	
});	

app.get("/imagery/getImageryCard", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
		  "metadata": {
			"IMAGERY_PACKAGE_UUID": "lSqyMsJTQgSDdSSAQFhINA",
			"CLASSIFICATION": "Unclassified",
			"IMAGERY_PACKAGE_TYPE": "FMV",
			"IMAGERY_PACKAGE_NAME": "bookstore_video0",
			"IMAGERY_PACKAGE_DESCRIPTION": "Stanford University campus drone footage above the common area between Dinkelspiel Auditorium and the White Memorial Plaza.",
			"INSERTION_TIMESTAMP": "2021-03-18 23:47:59.763000000",
			"TE_DESIGNATION": "TEST",
			"IMAGERY_START_TIME_STAMP": "2021-03-17 23:03:36.067970000",
			"IMAGERY_END_TIME_STAMP": "2021-03-17 23:11:00.534637000",
			"DURATION_SECONDS": 444.94,
			"FIRST_FRAME_FILEPATH": "bookstore_video0/bookstore_video0_000000/seq_jpeg/bookstore_video0_000000-000001.jpeg",
			"CLIP_COUNT": 45,
			"FRAME_COUNT": 13335,
			"IMAGERY_PACKAGE_GEO_AREA_GEOJSON": "{\"type\": \"Point\", \"coordinates\": [-122.169665, 37.424495]}"
		  },
		  "videoMetadata": {
			"IMAGERY_PACKAGE_UUID": "lSqyMsJTQgSDdSSAQFhINA",
			"CLASSIFICATION": "Unclassified",
			"DERIVATION_TYPE": "fmv_sequence",
			"ORIGIN_ID": "bookstore_video0.mov",
			"SRC_RECORD_KEY": "-6628196244797874003",
			"CODEC_NAME": "h264",
			"HEIGHT": 1088,
			"WIDTH": 1424,
			"PIX_FMT": "yuv420p",
			"BIT_RATE": 16599,
			"DURATION_SECONDS": 444.94,
			"BITS_PER_RAW_SAMPLE": null,
			"KLV_NAME": null,
			"FRAME_COUNT": 13335,
			"STREAM_COUNT": 1,
			"FORMAT_NAME": "mpegts",
			"FPS": 30,
			"VIDEO_SIZE_BYTES": 923235378,
			"INSERTION_TIMESTAMP": "2021-03-18 23:47:59.761000000"
		  },
		  "frameCenterTrack": [
			{
			  "SRC_VIDEO_FRAME": 1,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 301,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 601,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 901,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 1201,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 1501,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 1801,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 2101,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 2401,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 2701,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 3001,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 3301,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 3601,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 3901,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 4201,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 4501,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 4801,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 5101,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 5401,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 5701,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 6001,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 6301,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 6601,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 6901,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 7201,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 7501,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 7801,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 8101,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 8401,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 8701,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 9001,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 9301,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 9601,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 9901,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 10201,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 10501,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 10801,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 11101,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 11401,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 11701,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 12001,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 12301,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 12601,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 12901,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 13201,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 13335,
			  "FRAME_CENTER_LON": -122.169665,
			  "FRAME_CENTER_LAT": 37.424495
			}
		  ],
		  "sensorMetadata": {
			"IMAGERY_PACKAGE_UUID": "lSqyMsJTQgSDdSSAQFhINA",
			"MISSION_ID": null,
			"TAIL_NUMBER": null,
			"PLATFORM_TYPE": null,
			"MIN_SENSOR_TRUE_ALTITUDE": null,
			"MAX_SENSOR_TRUE_ALTITUDE": null,
			"MIN_SENSOR_RELATIVE_PITCH_ANGLE": null,
			"MAX_SENSOR_RELATIVE_PITCH_ANGLE": null,
			"MIN_SENSOR_RELATIVE_ROLL_ANGLE": null,
			"MAX_SENSOR_RELATIVE_ROLL_ANGLE": null,
			"MIN_PLATFORM_GROUND_SPEED": null,
			"MAX_PLATFORM_GROUND_SPEED": null,
			"MIN_PLATFORM_HEADING": null,
			"MAX_PLATFORM_HEADING": null,
			"MIN_PLATFORM_TRUE_AIRSPEED": null,
			"MAX_PLATFORM_TRUE_AIRSPEED": null,
			"MIN_PLATFORM_PITCH_ANGLE": null,
			"MAX_PLATFORM_PITCH_ANGLE": null,
			"IMAGE_SOURCE_SENSOR": null
		  },
		  "sensorTrack": [
			{
			  "SRC_VIDEO_FRAME": 1,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 301,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 601,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 901,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 1201,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 1501,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 1801,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 2101,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 2401,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 2701,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 3001,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 3301,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 3601,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 3901,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 4201,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 4501,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 4801,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 5101,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 5401,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 5701,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 6001,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 6301,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 6601,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 6901,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 7201,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 7501,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 7801,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 8101,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 8401,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 8701,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 9001,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 9301,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 9601,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 9901,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 10201,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 10501,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 10801,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 11101,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 11401,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 11701,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 12001,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 12301,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 12601,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 12901,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 13201,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			},
			{
			  "SRC_VIDEO_FRAME": 13335,
			  "SENSOR_LON": -122.169665,
			  "SENSOR_LAT": 37.424495
			}
		  ],
		  "annotations": [
			{
			  "ANNOTATION_PACKAGE_UUID": "_uCge7qWTfqls7GJCZYXWw",
			  "CLASSIFICATION": "Unclassified",
			  "INSERTION_TIMESTAMP": "2021-03-19 12:41:42.294000000",
			  "ANNOTATION_FILE_PATH": "ACTIVE_ANNOTATIONS/bookstore_video0_annotations.json",
			  "ANNOTATION_SOURCE": "Stanford",
			  "ANNOTATION_COUNT": 249850,
			  "OBJECT_COUNT": 237
			}
		  ],
		  "annotationStats": [
			{
			  "ANNOTATION_PACKAGE_UUID": "_uCge7qWTfqls7GJCZYXWw",
			  "LABEL_NAME": "Biker",
			  "LABEL_ANNOTATION_COUNT": 44259,
			  "LABEL_OBJECT_COUNT": 102
			},
			{
			  "ANNOTATION_PACKAGE_UUID": "_uCge7qWTfqls7GJCZYXWw",
			  "LABEL_NAME": "Bus",
			  "LABEL_ANNOTATION_COUNT": 730,
			  "LABEL_OBJECT_COUNT": 2
			},
			{
			  "ANNOTATION_PACKAGE_UUID": "_uCge7qWTfqls7GJCZYXWw",
			  "LABEL_NAME": "Car",
			  "LABEL_ANNOTATION_COUNT": 441,
			  "LABEL_OBJECT_COUNT": 3
			},
			{
			  "ANNOTATION_PACKAGE_UUID": "_uCge7qWTfqls7GJCZYXWw",
			  "LABEL_NAME": "Cart",
			  "LABEL_ANNOTATION_COUNT": 2521,
			  "LABEL_OBJECT_COUNT": 1
			},
			{
			  "ANNOTATION_PACKAGE_UUID": "_uCge7qWTfqls7GJCZYXWw",
			  "LABEL_NAME": "Pedestrian",
			  "LABEL_ANNOTATION_COUNT": 200021,
			  "LABEL_OBJECT_COUNT": 116
			},
			{
			  "ANNOTATION_PACKAGE_UUID": "_uCge7qWTfqls7GJCZYXWw",
			  "LABEL_NAME": "Skater",
			  "LABEL_ANNOTATION_COUNT": 1878,
			  "LABEL_OBJECT_COUNT": 13
			}
		  ]
		}
	  });	
});	

app.post("/imagery/getFmvClips", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
		  "total": 45,
		  "results": [
			{
			  "CLASSIFICATION": "Unclassified",
			  "START_TIMESTAMP": "2021-03-17 23:03:36.067970000",
			  "END_TIMESTAMP": "2021-03-17 23:03:46.034637000",
			  "CLIP_VIDEO_OFFSET_SECONDS": 0,
			  "DURATION_SECONDS": 444.94,
			  "FILE_SIZE_BYTES": 3985509,
			  "SEQUENCE_CLIP_UUID": "DEykG34FR2WQ_Z8yOC7Sow",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000000-000001.jpeg",
			  "CLIP_NAME": "bookstore_video0_000000"
			},
			{
			  "CLASSIFICATION": "Unclassified",
			  "START_TIMESTAMP": "2021-03-17 23:03:46.067970000",
			  "END_TIMESTAMP": "2021-03-17 23:03:56.034637000",
			  "CLIP_VIDEO_OFFSET_SECONDS": 10,
			  "DURATION_SECONDS": 444.94,
			  "FILE_SIZE_BYTES": 4251268,
			  "SEQUENCE_CLIP_UUID": "wMll8OQPSQOK_e1K4fz1Rw",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000001-000001.jpeg",
			  "CLIP_NAME": "bookstore_video0_000001"
			},
			{
			  "CLASSIFICATION": "Unclassified",
			  "START_TIMESTAMP": "2021-03-17 23:03:56.067970000",
			  "END_TIMESTAMP": "2021-03-17 23:04:06.034637000",
			  "CLIP_VIDEO_OFFSET_SECONDS": 20,
			  "DURATION_SECONDS": 444.94,
			  "FILE_SIZE_BYTES": 4157161,
			  "SEQUENCE_CLIP_UUID": "DHC51dhBTg-qRmWTmHdPNQ",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000002-000001.jpeg",
			  "CLIP_NAME": "bookstore_video0_000002"
			},
			{
			  "CLASSIFICATION": "Unclassified",
			  "START_TIMESTAMP": "2021-03-17 23:04:06.067970000",
			  "END_TIMESTAMP": "2021-03-17 23:04:16.034637000",
			  "CLIP_VIDEO_OFFSET_SECONDS": 30,
			  "DURATION_SECONDS": 444.94,
			  "FILE_SIZE_BYTES": 4042844,
			  "SEQUENCE_CLIP_UUID": "g3ljA5k3R3KHwwAwWvcsnA",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000003-000001.jpeg",
			  "CLIP_NAME": "bookstore_video0_000003"
			},
			{
			  "CLASSIFICATION": "Unclassified",
			  "START_TIMESTAMP": "2021-03-17 23:04:16.067970000",
			  "END_TIMESTAMP": "2021-03-17 23:04:26.034637000",
			  "CLIP_VIDEO_OFFSET_SECONDS": 40,
			  "DURATION_SECONDS": 444.94,
			  "FILE_SIZE_BYTES": 4112954,
			  "SEQUENCE_CLIP_UUID": "2aHV2Ai3R4G4pfEuuFxIoQ",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000004-000001.jpeg",
			  "CLIP_NAME": "bookstore_video0_000004"
			},
			{
			  "CLASSIFICATION": "Unclassified",
			  "START_TIMESTAMP": "2021-03-17 23:04:26.067970000",
			  "END_TIMESTAMP": "2021-03-17 23:04:36.034637000",
			  "CLIP_VIDEO_OFFSET_SECONDS": 50,
			  "DURATION_SECONDS": 444.94,
			  "FILE_SIZE_BYTES": 4008666,
			  "SEQUENCE_CLIP_UUID": "xih-frOnQZegAk92CrKb5g",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000005-000001.jpeg",
			  "CLIP_NAME": "bookstore_video0_000005"
			},
			{
			  "CLASSIFICATION": "Unclassified",
			  "START_TIMESTAMP": "2021-03-17 23:04:36.067970000",
			  "END_TIMESTAMP": "2021-03-17 23:04:46.034637000",
			  "CLIP_VIDEO_OFFSET_SECONDS": 60,
			  "DURATION_SECONDS": 444.94,
			  "FILE_SIZE_BYTES": 4019608,
			  "SEQUENCE_CLIP_UUID": "xoKdHAs8TFCCI-ODUIIYPA",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000006-000001.jpeg",
			  "CLIP_NAME": "bookstore_video0_000006"
			},
			{
			  "CLASSIFICATION": "Unclassified",
			  "START_TIMESTAMP": "2021-03-17 23:04:46.067970000",
			  "END_TIMESTAMP": "2021-03-17 23:04:56.034637000",
			  "CLIP_VIDEO_OFFSET_SECONDS": 70,
			  "DURATION_SECONDS": 444.94,
			  "FILE_SIZE_BYTES": 3984406,
			  "SEQUENCE_CLIP_UUID": "Y7h_uv0dQyeYu43vd2q0NA",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000007-000001.jpeg",
			  "CLIP_NAME": "bookstore_video0_000007"
			},
			{
			  "CLASSIFICATION": "Unclassified",
			  "START_TIMESTAMP": "2021-03-17 23:04:56.067970000",
			  "END_TIMESTAMP": "2021-03-17 23:05:06.034637000",
			  "CLIP_VIDEO_OFFSET_SECONDS": 80,
			  "DURATION_SECONDS": 444.94,
			  "FILE_SIZE_BYTES": 4046147,
			  "SEQUENCE_CLIP_UUID": "9Kcbv8B6QTWvC-2ds4q2MA",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000008-000001.jpeg",
			  "CLIP_NAME": "bookstore_video0_000008"
			},
			{
			  "CLASSIFICATION": "Unclassified",
			  "START_TIMESTAMP": "2021-03-17 23:05:06.067970000",
			  "END_TIMESTAMP": "2021-03-17 23:05:16.034637000",
			  "CLIP_VIDEO_OFFSET_SECONDS": 90,
			  "DURATION_SECONDS": 444.94,
			  "FILE_SIZE_BYTES": 4105657,
			  "SEQUENCE_CLIP_UUID": "1GCgWuxhRz2pB23FqBJusA",
			  "FIRST_FRAME_FILEPATH": URL + "/imagery/getImageryFromBucket?file=bookstore_video0_000009-000001.jpeg",
			  "CLIP_NAME": "bookstore_video0_000009"
			}
		  ],
		  "offset": "0",
		  "limit": "10"
		}
	  });	
});	

app.get("/imagery/getAnalysisTypesByClipId", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"ANNOTATION_SOURCE": "Amazon Rekognition",
			"ANALYSIS_TYPE": "labels",
			"ANNOTATION_PACKAGE_EXISTS_FLAG": false
		  },
		  {
			"ANNOTATION_SOURCE": "Amazon Rekognition",
			"ANALYSIS_TYPE": "text",
			"ANNOTATION_PACKAGE_EXISTS_FLAG": false
		  },
		  {
			"ANNOTATION_SOURCE": "Amazon Rekognition",
			"ANALYSIS_TYPE": "faces",
			"ANNOTATION_PACKAGE_EXISTS_FLAG": false
		  },
		  {
			"ANNOTATION_SOURCE": "Google VI",
			"ANALYSIS_TYPE": "labels",
			"ANNOTATION_PACKAGE_EXISTS_FLAG": false
		  },
		  {
			"ANNOTATION_SOURCE": "Google VI",
			"ANALYSIS_TYPE": "text",
			"ANNOTATION_PACKAGE_EXISTS_FLAG": false
		  },
		  {
			"ANNOTATION_SOURCE": "Google VI",
			"ANALYSIS_TYPE": "faces",
			"ANNOTATION_PACKAGE_EXISTS_FLAG": false
		  },
		  {
			"ANNOTATION_SOURCE": "Stanford",
			"ANALYSIS_TYPE": "labels",
			"ANNOTATION_PACKAGE_EXISTS_FLAG": true
		  }
		]
	  });	
});	

app.get("/imagery/getClip", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
		  "DERIVATION_TYPE": "fmv_sequence",
		  "ORIGIN_ID": "bookstore_video0.mov",
		  "SRC_RECORD_KEY": "-6628196244797874003",
		  "CODEC_NAME": "h264",
		  "HEIGHT": 1088,
		  "WIDTH": 1424,
		  "PIX_FMT": "yuv420p",
		  "BIT_RATE": 16599,
		  "DURATION_SECONDS": 444.94,
		  "BITS_PER_RAW_SAMPLE": null,
		  "KLV_NAME": null,
		  "FRAME_COUNT": 13335,
		  "STREAM_COUNT": 1,
		  "FORMAT_NAME": "mpegts",
		  "FPS": 30,
		  "VIDEO_SIZE_BYTES": 923235378,
		  "SEQUENCE_CLIP_UUID": "DEykG34FR2WQ_Z8yOC7Sow",
		  "IMAGERY_PACKAGE_UUID": "lSqyMsJTQgSDdSSAQFhINA",
		  "CLASSIFICATION": "Unclassified",
		  "BATCH_NAME": "bookstore_video0",
		  "CLIP_NAME": "bookstore_video0_000000",
		  "CLIP_VIDEO_OFFSET_SECONDS": 0,
		  "TE_DESIGNATION": "UNDEFINED",
		  "START_TIMESTAMP": "2021-03-17 23:03:36.067970000",
		  "END_TIMESTAMP": "2021-03-17 23:03:46.034637000",
		  "MASK_ID": 0,
		  "INSERTION_TIMESTAMP": "2021-03-18 23:47:59.765000000",
		  "SEQUENCE_CLIP_FILE_PATH": "bookstorevideo.mp4",
		  "FILE_LAST_MODIFIED_TIMESTAMP": "2021-03-18 23:38:25.000000000",
		  "FILE_SIZE_BYTES": 3985509,
		  "SEQUENCE_CLIP_FILENAME": "bookstore_video0_000000.mp4"
		}
	  });	
});	

app.get("/imagery/getClipLabels", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"LABEL_NAME": "Pedestrian",
			"COUNT": 15
		  },
		  {
			"LABEL_NAME": "Biker",
			"COUNT": 4
		  }
		]
	  });	
});	

app.get("/imagery/getClipLabels", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"LABEL_NAME": "Pedestrian",
			"COUNT": 15
		  },
		  {
			"LABEL_NAME": "Biker",
			"COUNT": 4
		  }
		]
	  });	
});	

app.get("/imagery/getClipAnnotations", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": []
	});
});	

app.get("/mgmt/getWorkflowByName", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
			"WF_ID": "991001F03684983317004802DFA4BD6A",
			"WF_NAME": "Data Card",
			"DESCRIPTION": "Data Card",
			"ICON": "sap-icon://form"
		}
	});	
});	

app.get("/config/getLookupValues", (req, res) => {
	
	var data = [
		{
			"KEY": "AWS",
			"VALUE": "AWS",
			"ICON": null
		},
		{
			"KEY": "AZURE",
			"VALUE": "AZURE",
			"ICON": null
		},
		{
			"KEY": "GOOGLE",
			"VALUE": "GOOGLE",
			"ICON": null
		},
		{
			"KEY": "ORACLE",
			"VALUE": "ORACLE",
			"ICON": null
		},
		{
			"KEY": "IBM",
			"VALUE": "IBM",
			"ICON": null
		},
		{
			"KEY": "OTHER",
			"VALUE": "OTHER",
			"ICON": null
		}
	]
	if(res.req.query.name === "INDUSTRY_TYPE"){
		data = [
			{
				"KEY": "Government",
				"VALUE": "Government",
				"ICON": null
			},
			{
				"KEY": "Private",
				"VALUE": "Private",
				"ICON": null
			},
			{
				"KEY": "Non-Government",
				"VALUE": "Non-Government",
				"ICON": null
			},
			{
				"KEY": "Academia",
				"VALUE": "Academia",
				"ICON": null
			},
			{
				"KEY": "Other",
				"VALUE": "Other",
				"ICON": null
			}
		]
	} else if(res.req.query.name === "LABELING_METHOD"){
		data = [
			{
				"KEY": "HUMAN LABELS",
				"VALUE": "HUMAN LABELS",
				"ICON": null
			},
			{
				"KEY": "ALGORITHMIC LABELS",
				"VALUE": "ALGORITHMIC LABELS",
				"ICON": null
			},
			{
				"KEY": "OTHER",
				"VALUE": "OTHER",
				"ICON": null
			},
			{
				"KEY": "NOT APPLICABLE",
				"VALUE": "NOT APPLICABLE",
				"ICON": null
			}
		]
	} else if(res.req.query.name === "CLASSIFICATION"){
		data = [
			{
				"KEY": "UNCLASSIFIED",
				"VALUE": "UNCLASSIFIED",
				"ICON": null
			},
			{
				"KEY": "CUI",
				"VALUE": "CUI",
				"ICON": null
			}
		]
	} else if(res.req.query.name === "KEY_APPLICATION"){
		data = [
			{
				"KEY": "Computer Visualization",
				"VALUE": "Computer Visualization",
				"ICON": null
			},
			{
				"KEY": "Natural Language",
				"VALUE": "Natural Language",
				"ICON": null
			},
			{
				"KEY": "Predictive Analytics",
				"VALUE": "Predictive Analytics",
				"ICON": null
			},
			{
				"KEY": "Search",
				"VALUE": "Search",
				"ICON": null
			},
			{
				"KEY": "Pattern of Life",
				"VALUE": "Pattern of Life",
				"ICON": null
			},
			{
				"KEY": "Points of Interest",
				"VALUE": "Points of Interest",
				"ICON": null
			},
			{
				"KEY": "Other",
				"VALUE": "Other",
				"ICON": null
			}
		]
	} else if(res.req.query.name === "EST_SIZE"){
		data = [
			{
				"KEY": "1MB",
				"VALUE": "1MB",
				"ICON": null
			},
			{
				"KEY": "10MB",
				"VALUE": "10MB",
				"ICON": null
			},
			{
				"KEY": "500MB",
				"VALUE": "500MB",
				"ICON": null
			},
			{
				"KEY": "1GB",
				"VALUE": "1GB",
				"ICON": null
			},
			{
				"KEY": "10GB",
				"VALUE": "10GB",
				"ICON": null
			},
			{
				"KEY": "500GB",
				"VALUE": "500GB",
				"ICON": null
			},
			{
				"KEY": "1TB",
				"VALUE": "1TB",
				"ICON": null
			},
			{
				"KEY": "10TB",
				"VALUE": "10TB",
				"ICON": null
			},
			{
				"KEY": "500TB",
				"VALUE": "500TB",
				"ICON": null
			},
			{
				"KEY": "1PB",
				"VALUE": "1PB",
				"ICON": null
			},
			{
				"KEY": "OTHER",
				"VALUE": "OTHER",
				"ICON": null
			}
		]
	} else if(res.req.query.name === "PRIMARY_DATA_TYPE"){
		data = [
			{
				"KEY": "CSV",
				"VALUE": "CSV",
				"ICON": null
			},
			{
				"KEY": "JSON",
				"VALUE": "JSON",
				"ICON": null
			},
			{
				"KEY": "XML",
				"VALUE": "XML",
				"ICON": null
			},
			{
				"KEY": "TAB",
				"VALUE": "TAB",
				"ICON": null
			},
			{
				"KEY": "MOV",
				"VALUE": "MOV",
				"ICON": null
			},
			{
				"KEY": "AVI",
				"VALUE": "AVI",
				"ICON": null
			},
			{
				"KEY": "MPEG-4",
				"VALUE": "MPEG-4",
				"ICON": null
			},
			{
				"KEY": "WAV",
				"VALUE": "WAV",
				"ICON": null
			},
			{
				"KEY": "AIF",
				"VALUE": "AIF",
				"ICON": null
			},
			{
				"KEY": "MP3",
				"VALUE": "MP3",
				"ICON": null
			},
			{
				"KEY": "GeoTIFF",
				"VALUE": "GeoTIFF",
				"ICON": null
			},
			{
				"KEY": "GeoPDF",
				"VALUE": "GeoPDF",
				"ICON": null
			},
			{
				"KEY": "SHP",
				"VALUE": "SHP",
				"ICON": null
			},
			{
				"KEY": "DBF",
				"VALUE": "DBF",
				"ICON": null
			},
			{
				"KEY": "SHX",
				"VALUE": "SHX",
				"ICON": null
			},
			{
				"KEY": "JPEG2000",
				"VALUE": "JPEG2000",
				"ICON": null
			},
			{
				"KEY": "TIFF",
				"VALUE": "TIFF",
				"ICON": null
			},
			{
				"KEY": "PNG",
				"VALUE": "PNG",
				"ICON": null
			},
			{
				"KEY": "JPEG",
				"VALUE": "JPEG",
				"ICON": null
			},
			{
				"KEY": "JFIF",
				"VALUE": "JFIF",
				"ICON": null
			},
			{
				"KEY": "DNG",
				"VALUE": "DNG",
				"ICON": null
			},
			{
				"KEY": "BMP",
				"VALUE": "BMP",
				"ICON": null
			},
			{
				"KEY": "GIF",
				"VALUE": "GIF",
				"ICON": null
			},
			{
				"KEY": "PDF",
				"VALUE": "PDF",
				"ICON": null
			},
			{
				"KEY": "HTML",
				"VALUE": "HTML",
				"ICON": null
			},
			{
				"KEY": "PLAIN TEXT",
				"VALUE": "PLAIN TEXT",
				"ICON": null
			},
			{
				"KEY": "OTHER",
				"VALUE": "OTHER",
				"ICON": null
			}
		]
	} else if(res.req.query.name === "DATASET_FUNCTION"){
		data = [
			{
				"KEY": "TRAINING",
				"VALUE": "TRAINING",
				"ICON": null
			},
			{
				"KEY": "TESTING",
				"VALUE": "TESTING",
				"ICON": null
			},
			{
				"KEY": "OPERATIONAL",
				"VALUE": "OPERATIONAL",
				"ICON": null
			},
			{
				"KEY": "OTHER",
				"VALUE": "OTHER",
				"ICON": null
			}
		]
	} else if(res.req.query.name === "IS_PRIVACY_PII"){
		data = [
			{
				"KEY": "Y",
				"VALUE": "Yes (Explain)",
				"ICON": null
			},
			{
				"KEY": "N",
				"VALUE": "No",
				"ICON": null
			}
		]
	} else if(res.req.query.name === "VALIDATION_METHOD"){
		data = [
			{
				"KEY": "HUMAN VALIDATED",
				"VALUE": "HUMAN VALIDATED",
				"ICON": null
			},
			{
				"KEY": "ALGORITHMIC VALIDATED",
				"VALUE": "ALGORITHMIC VALIDATED",
				"ICON": null
			},
			{
				"KEY": "OTHER",
				"VALUE": "OTHER",
				"ICON": null
			},
			{
				"KEY": "NOT APPLICABLE",
				"VALUE": "NOT APPLICABLE",
				"ICON": null
			}
		]
	} 

	res.send({
		"status": 200,
		"message": "OK",
		"data": data
	});	
});	

app.get("/config/getNewGuid", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
			"GUID": "8D2300508C6704F41700C402B8B7FD53"
		}
	});	
});	

app.get("/data/getUnlinkedDataSets", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"DATA_SET_ID": "0CB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "% of Multigenerational Households",
				"DESCRIPTION": "% of multigenerational families living under the same roof by state provided by the 2019 US Census Bureau American Community Survey",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "aa063fd5067847e7b14abb139bab65b2",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "2efcac99b3a148b58c1c30b55e164008",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/Greater_Downtown_Alleys-shp/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "a488cf004e99469ca6b8303fae854d68",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CommodityTonnage/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "5d600791849b4286a37893c317eead71",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/D&BSupplier-ImpliedRiskAtributes/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "05aaca8514a7477d9d6d157a05a14f86",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Geothermal/favorabilitysurface/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "d5650d40f6f443fab1ad9ebf3b132d16",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/PDF/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "a8fad77b5d624e9ebdff10176b189ad0",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Brunel/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "2dd78c823ded4c90aa7d2790c54dff19",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Mandeley/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "8d8c4fd58b3b4df2ad7a446b4eaa81ce",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChainInstitute/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "d08fd4c7a0c344bc9b8591c865ae8cb7",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Test_Files/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "eedd0f9d48414be9a92146181c9545b7",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/US-County-Boundaries/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "3150b50172b942b3beb5199a39091662",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/installations_ranges/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "3aa860d4a7b54adc96926329b79c8a26",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/military-installations-ranges-and-training-areas/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "264545d6d3864eeabf42d2c82fdb65bb",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/ml_scenario/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "54827403f6e649618599d8574cf56bbe",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/tl_2019_us_county/",
				"DESCRIPTION": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "4BB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "ADP City NAICS - SAMPLE",
				"DESCRIPTION": "Description to be provided at a later date.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "11B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Aadministrative County boundaries of Germany",
				"DESCRIPTION": "The administrative County boundaries of Germany as of January 1st, 2019. This layer only contains land surfaces at a 1:250,000 scale.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "4FB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Activity Feed - SAMPLE",
				"DESCRIPTION": "Unacast stream of GPS pings is collected from Unacast, standardized, and purged of overlapping and fraudulent data. Using the GPS pings from Unacast Pure Feed, the Unacast data engine clusters them into events that indicate human activity, such as dwell and travel events. Unacast proprietary algorithms contextualize events by placing them in certain locations using one or more maps.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "28B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Apple Maps Mobility Trends Data",
				"DESCRIPTION": "Apple mobility data at the county/city level providing percentage change in driving, transit, and walking activity from Apple Maps compared to the baseline of early 2020.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "58B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Belgium Mortality Rate by age, date, sex, region",
				"DESCRIPTION": "COVID-19 Mortality rate by age, date, sex and region. Reported by the Belgium Institute of Health.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "57B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Belgium total number of COVID-19 tests performed",
				"DESCRIPTION": "Total number of COVID-19 Tests performed in Belgian by date, region, and province",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "48B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "CDC COVID-19 Infection and Death Statistics",
				"DESCRIPTION": "CDC COVID-19 Infection and Death Statistics, Daily",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "52B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "CDC Provisional COVID-19 Death Counts by Sex, Age, and State",
				"DESCRIPTION": "Deaths involving coronavirus disease 2019 (COVID-19) stratified by age, sex, and state",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "46B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "CDC RedSky: Global Health Event Data",
				"DESCRIPTION": "RedSky is a situational awareness viewer used by the Centers for Disease Control and Prevention (CDC) and state and local public health departments to manage and share certain public health data. The CDC-internal version of RedSky tracks global events which may require CDC assistance or which currently involve CDC resources. Provided by GBSP.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "24B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "CMS: Medicare Claims Data - FOUO",
				"DESCRIPTION": "This Medicare claims data set includes all Inpatient, Outpatient, Carrier (Part B), Skilled Nursing Facility, and Hospice claims dating back to January 1 2020, the Master Beneficiary Summary file (MBSF) and the 2019 MBSF Chronic Conditions segment file of the Project Salus Medicare Fee for Service (FFS) population cohort extracted from the CMS Chronic Conditions Data Warehouse. As of July 21, this cohort included 9.2M beneficiaries who since March 1st have either been hospitalized, received Emergency Department, Urgent Care or telehealth services, or had a COVID-19 test billed to Medicare.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "53B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "COV-19: Total (cumulative) number of persons having been infected by district sanitary stations, including laboratories, number of deaths  and tests performed in the Czech Republic",
				"DESCRIPTION": "Data set containing cumulative daily numbers of persons with proven COVID-19 disease as reported by regional sanitary stations in the Czech Republic",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "5CB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "COVID- 19 Restriction Measures",
				"DESCRIPTION": "COVID-19 Restriction Measures put in place by country",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "59B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "COVID-19 Case Surveillance Public Use Data",
				"DESCRIPTION": "The COVID-19 case surveillance system database includes patient-level data reported to U.S. states and autonomous reporting entities. This dataset includes cdc report data, date of first postiive specimen collection, case status, symptom onset date, sex, age group, race/ethnicity. (*does not include any geogrpahy*)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "30B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "COVID-19 Case, Hospital, and Death Statistics by State",
				"DESCRIPTION": "Latest (Hospitalized, tested, positive, negative, deaths)  by State",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "3CB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "COVID-19 Cases and Deaths By County (NYTimes)",
				"DESCRIPTION": "Ongoing repository of data on coronavirus cases and deaths in the U.S.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "2DB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "COVID-19 Claims: Explicit Codes and Interim Billing Guidelines (ADX)",
				"DESCRIPTION": "Daily aggregate counts of medical claims containing the explicit COVID-19 diagnosis codes and testing procedure codes (HCPCs/CPTs) as well as the interim diagnosis codes specified by CDC for use until the explicit COVID-19 diagnosis codes were issued in February.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "2CB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "COVID-19 Daily Infection Statistics",
				"DESCRIPTION": "Corona Data Scraper pulls COVID-19 Coronavirus case data from verified sources, finds the corresponding GeoJSON features, and adds population data.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "27B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "COVID-19 Medicare Analytics Dataset, Full Cohort and Medicare Recipients – FOUO",
				"DESCRIPTION": "This dataset is a CSV data file containing individual residence zip codes, demographic, socio-economic and medical characteristics (diagnoses, prescribed medications, prior health service utilization) of the entire 9+ million Project Salus Medicare cohort with COVID-19 diagnosis status and outcome data including COVID-19 hospitalizations, ICU admissions, ventilator use and death. The dataset also includes a Medicare beneficiaries-specific subset with matching statistics.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "2BB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "COVID-19 State & County Risk Levels",
				"DESCRIPTION": "COVID Infection statistics and risk analysis. State and County level data. - Real-time modeling and metrics to understand where we stand against COVID. 50 states. 2100+ counties.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "09B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Census 2019 US County Geometry Files",
				"DESCRIPTION": "Shape files and other Geo-Map files provided by the Census for 2019",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "2FB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Columbia University - COVID-19 Projections",
				"DESCRIPTION": "Shaman Labs, with Columbia University. Projections of COVID-19 in the US at county level generated based on latest data.\nCounty-level case and death data are compiled from Johns Hopkins University and USAFACTS.\nProjections are generated for daily new confirmed case, daily new infection (both reported and unreported), cumulative demand of hospital beds, ICU and ventilators as well as daily mortality (2.5, 25, 50, 75 and 97.5 percentiles).",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "4CB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Commercial Firmographics - SAMPLE",
				"DESCRIPTION": "Description to be provided at a later date.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "61B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Community Vulnerability Index",
				"DESCRIPTION": "This index - developed by Surgo Foundation and featured as a CDC resource - identifies which communities may need the most support as coronavirus takes hold. Mapped to US census tract, county, and state levels, the CCVI helps inform COVID-19 planning and mitigation at a granular level.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "01B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Coronavirus Cases by Race/Ethnicity",
				"DESCRIPTION": "The COVID Racial Data Tracker is a collaboration between the COVID Tracking Project and the Boston University Center for Antiracist Research. It is the most complete and up-to-date race and ethnicity data on COVID-19 in the United States.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "02B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Coronavirus and School re-opening plans by Districts",
				"DESCRIPTION": "From July to September of 2020, Education Week documented reopening plans from over 900 school districts around the country. This table provides information on which instructional model a district chose to use on the first day of classes. It is a list gleaned from district websites, local media reports, and Education Week reporting. It includes 2018-19 enrollment data from the National Center for Education Statistics. It is not nationally representative, and not meant to be a comprehensive collection.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "04B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "County Level Income",
				"DESCRIPTION": "County Level Income Statistics, 2017-2019",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "5EB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Covid-19 Cases in Europe",
				"DESCRIPTION": "Subnational View of COVID-19 Cases in Euope",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "2EB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Covid-19 Nursing Home Data (Free and Open)",
				"DESCRIPTION": "Data reported by nursing homes to the CDC’s National Healthcare Safety Network (NHSN) system COVID-19 Long Term Care Facility Module, including Resident Impact, Facility Capacity, Staff & Personnel, and Supplies & Personal Protective Equipment, and Ventilator Capacity and Supplies Data Elements.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "4DB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Credit Trends - SAMPLE",
				"DESCRIPTION": "Description to be provided at a later date.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "1CB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Crop Planting and Harvest Schedule",
				"DESCRIPTION": "Schedule of common crops and their harvest times throughout the year",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "26B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "DHS HSIN HIFLD:  FOUO Datasets",
				"DESCRIPTION": "DHS, Homeland Infrastructure Foundation-Level Data (HIFLD). Data Catalog:\nhttps://gii.dhs.gov/hifld/sites/default/files/2020-07/HIFLD2020_Data_Catalog.xlsx",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "37B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "DHS HSIN HIFLD:  Open Datasets",
				"DESCRIPTION": "DHS, Homeland Infrastructure Foundation-Level Data (HIFLD). Data Catalog:\nhttps://gii.dhs.gov/hifld/sites/default/files/2020-07/HIFLD2020_Data_Catalog.xlsx",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "5BB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Daily Hospital/ICU  admission rate",
				"DESCRIPTION": "The downloadable data files contain information about hospitalisation and Intensive Care Unit (ICU) admission rates and current occupancy for COVID-19 by date and country. Each row contains the corresponding data for a certain date (day or week) and per country.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "51B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Daily confirmed  Cases in Belgium by age group and sex",
				"DESCRIPTION": "Total confirmed cases of COVID-19 in Belgian stratified by age group, sex, provice, and region reportedby the Belgian Institute of Health",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "0AB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Employment & Payroll by Zip Code, 2010-2016",
				"DESCRIPTION": "Census Bureau data of county business patterns showing payroll for establishments, grouped by ZIP Code. - AWX, Enigma",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "05B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Employment Statistics, Aggregated by NAICS Code",
				"DESCRIPTION": "Total Full-time and Part-time employment statistics by NAICS Industry",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "06B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Estimated County-Level Prevalence of Selected Underlying Medical Conditions Associated with Increased Risk for Severe COVID-19 Illness — United States, 2018",
				"DESCRIPTION": "Older adults and those with chronic obstructive pulmonary disease, heart disease, diabetes, chronic kidney disease, and obesity who are at higher risk for severe COVID-19–associated illness, from 2018 data",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "33B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "FDA Drug Shortages",
				"DESCRIPTION": "FDA data on drug shortages, availability, and demand. The data provides additional information on dosages, treatment type, and shipping status.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "34B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "FDA Open Data",
				"DESCRIPTION": "FDA Open Data for recalls, adverse events, labels, and registrations for food, drugs, and devices.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "35B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "FOURESQUARE: COVID-19 Foot Traffic Data (ADX)",
				"DESCRIPTION": "indexed foot traffic to 19 categories of venues. The indexed data is broken out geographically, with included data for National, SF, NYC, LA, and Seattle. The data is normalized against U.S. Census data to remove age, gender and geographical bias. Data is provided daily from 02/19/2020.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "1DB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Farm to School Survey, 2015",
				"DESCRIPTION": "2015 USDA Farm to School Survey to identify Schools/Districts that participate in a direct Farm to School food service.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "0FB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Feeding America Locations",
				"DESCRIPTION": "Feeding America Locations",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "0EB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Food Insecurity Data, 2019",
				"DESCRIPTION": "Feeding America Food Insecurity Data, Major cities (200 cities), 2019",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "08B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Food Security Survey, Census 2019",
				"DESCRIPTION": "Survey conducted by the Census to measure household food security/insecurity statistics, December 2019",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "1EB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "FoodAPS National Household Food Acquisition and Purchase Survey, 2017",
				"DESCRIPTION": "Detailed information was collected about foods purchased or otherwise acquired for consumption at home and away from home, including foods acquired through food and nutrition assistance programs. From 2017.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "55B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Global COVID-19 Travel Restrictions",
				"DESCRIPTION": "This dataset shows current travel restrictions. Information is collected from various sources: IATA, media, national sources, WFP internal or any other.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "36B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Google Community Mobility Reports Data",
				"DESCRIPTION": "CSV data of the information provided within Google's Community Mobility Reports. The reports chart movement trends over time by geography, across different categories of places such as retail and recreation, groceries and pharmacies, parks, transit stations, workplaces, and residential. Provides the percentage change of visits at the county level compared to the early 2020 baseline.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "25B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "HHS Protect - FOUO",
				"DESCRIPTION": "Multiple Datasets. Focuses on Lab results and other testing metrics, demographic data, case information, hospital statistics, and more. FOUO.",
				"CLASSIFICATION": "CUI"
			},
			{
				"DATA_SET_ID": "47B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Hc1 COVID-9 Local Risk Index (ADX)",
				"DESCRIPTION": "The Local Risk Index (LRI) is derived from the COVID19 Diagnostic Test results conducted by more than 20k testing locations across the US. The data contains a daily LRI, detected rate, and patient count for each state, county, and Public Use Micro Area within the US",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "7021746b0efb449490c0e6c88491ed29",
				"NAME": "Health COVID",
				"DESCRIPTION": "Statistics on COVID infections.  ",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "15B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Hospital Beds Per Capita, 2018",
				"DESCRIPTION": "Hospital bed data broken out by government, non-profit, and for-profit establishments.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "17B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Hospital Compare",
				"DESCRIPTION": "Zip/county level hospital data comparing services and capabilities to the national average.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "16B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Hospital ICU Bed Data and Population Statistics per Bed",
				"DESCRIPTION": "KHN totaled the ICU beds per county and matched the data with county population figures from the Census Bureau’s American Community Survey. KHN focused on the number of people 60 and older in each county because older people are considered the most likely group to require hospitalization, given their increased frailty and existing health conditions compared with younger people.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "38B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "IHME COVID-19 Projections (Healthdata.org)",
				"DESCRIPTION": "Hospital resources (beds, ICU beds, and invasive ventilators) and deaths due to COVID-19 by locality within the United States.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "14B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "IRS Tax Return Data, 2017",
				"DESCRIPTION": "Zip code level IRS statistics from 2017",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "4177d69f61014c76bff070db38c2db2b",
				"NAME": "Ionosphere",
				"DESCRIPTION": "The layer of the earth's atmosphere that contains a high concentration of ions and free electrons and is able to reflect radio waves. It lies above the mesosphere and extends from about 50 to 600 miles (80 to 1,000 km) above the earth's surface.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "39B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "JHU: APL COVID Surveillance Dashboard",
				"DESCRIPTION": "Global dashboard of confirmed COVID-19 cases, deaths, and recoveries. The dashboard compares global rates to US rates. The dashboard also provides data on cumulative US hospitalizations and testing.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "54B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "JRC (Joint Research Center) COVID-19 Statistics",
				"DESCRIPTION": "Regional and County level COIVD-19 Statistics from 34 UCPM Participating States plus Switzerland including positive cases, recovered cases, hospitilized cases, ICU cases, and deaths",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "29B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Local Area Unemployment Statistics, 14-month",
				"DESCRIPTION": "Local area (county) unemployment statistics for the last 14 months.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "10B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "MapTheGap",
				"DESCRIPTION": "Meal cost estimates for Feeding America locations, 2017&2018",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "22B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Mask Usage by County",
				"DESCRIPTION": "The NYT estimates of mask usage by county in the United States. The data comes from interviews conducted between July 2, 2020 through July 14, 2020",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "20B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Meat Processing Facility Directory",
				"DESCRIPTION": "Directory of USDA Meat Processing Facilities",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "19B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Medical Physician Compare",
				"DESCRIPTION": "These files contains general information about individual eligible professionals (EPs) such as address and demographic information and Medicare quality program participation.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "0DB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Military Installations, Ranges and Training Areas (MIRTA)",
				"DESCRIPTION": "This dataset, released by DoD, contains geographic information for major installations, ranges, and training areas in the United States and its territories.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "97323d7480454b56862cec6d6c5595a6",
				"NAME": "Military Locations",
				"DESCRIPTION": "Location data is information about the geographic position of a person or object.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "23B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "NUTS3 Population",
				"DESCRIPTION": "Population change - Demographic balance and crude rates at regional level (NUTS 3) ",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "3AB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "National Association of Counties (NAC) - County Policies and Declarations",
				"DESCRIPTION": "This tool provides easy access to data that offer a snapshot on a variety of topics relevant to counties nationwide. County Declarations and policies in response to COVID-19 pandemic.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "3BB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "National Interagency Fire Center - Wildfire Perimeter",
				"DESCRIPTION": "Geographical data on the current locations of US-based wildfires.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "18B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Nursing Home Data",
				"DESCRIPTION": "Nursing home general characteristic/demographics data for the US (Non COVID specific)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "1AB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Open Street Maps, Hospital Locations",
				"DESCRIPTION": "Open Street Maps NDJSON for Hopsital locations",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "1BB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Open Street Maps, North America PBF",
				"DESCRIPTION": "Open Street Maps PBF of North America",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "3DB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "OxCGRT - Oxford University COVID Government Response Tracker",
				"DESCRIPTION": "Time series of the global government responses to the COVID-19 outbreak, including 11 indicators such as school closings, travel bans, or other measures.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "1e3bed096b9349e9a6c17c6d04648ae2",
				"NAME": "Plants",
				"DESCRIPTION": "",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "13B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Point in time Estimates  of US homeloess population by  US Sate (2001-2019)",
				"DESCRIPTION": "These raw data sets contain Point-in-Time (PIT) estimates and national PIT estimates of homelessness as well as national estimates of homelessness by state and estimates of chronic homelessness from 2007 - 2019. ",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "2AB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Quarterly Unemployment Statistics",
				"DESCRIPTION": "County level quarterly employment and wages, 2019 update Q4 latest.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "4EB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "RelevantData - Product Supply Metrics - SAMPLE",
				"DESCRIPTION": "Product Supply Data. Sample includes 4 retailers (85 stores), for 50+ zip codes within northern Virginia and DC. Includes 25 different products within 22 product categories.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "42B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Repositrak (Park City Group) Sales & Delivery SKU Data, Daily",
				"DESCRIPTION": "SKU inventory level information by store by county on a daily basis. Sales and Delivery counts.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "43B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Repositrak:  Sell Through Stats 2020",
				"DESCRIPTION": "Supplemental ReposiTrak data",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "21B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "SNAP - Participation by County (2019)",
				"DESCRIPTION": "Participation Levels within Supplemental Nutrition Assistance Program (SNAP) Programs by County, 2019 July",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "41B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Safe Graph Mobility Data",
				"DESCRIPTION": "Mobility Data at the county level showing place data and foot traffic insights",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "d21d56a0793c4b6b87cf8278755e3ac9",
				"NAME": "Seismic Bumps",
				"DESCRIPTION": "The seismic bumps dataset is one of the lesser-known binary classification datasets that capture geological conditions using seismic and seismo-acoustic systems in longwall coal mines to assess if they are prone to rockburst causing seismic hazards or not.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "4AB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Small Buisness Pulse Survey",
				"DESCRIPTION": "The Small Business Pulse Survey (SBPS) complements existing U.S. Census Bureau data collections by providing high-frequency, detailed information on the challenges small businesses are facing during the Coronavirus pandemic as well as their participation in federal programs such as the Paycheck Protection Program.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "50B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Social Distancing Metrics - SAMPLE",
				"DESCRIPTION": "Sample Unacast Social Distancing Metrics data for the state of Virginia, April through June",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "07B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Social Vulnerability Dataset, 2018",
				"DESCRIPTION": "Uses 15 U.S. census variables at tract level to help local officials identify communities that may need support in preparing for hazards; or recovering from disaster.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "4b09fa1f7d324fb88f4084244725cb23",
				"NAME": "Sonar",
				"DESCRIPTION": "Sonar is a technique that uses sound propagation to navigate, communicate with or detect objects on or under the surface of the water, such as other vessels.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "44B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "SouperBowlofCaring - Locations",
				"DESCRIPTION": "SBoC Locations and Need Metrics",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "3FB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "State COVID-19 Lock-down and Phase Status Data",
				"DESCRIPTION": "State Level lock down status information. This includes information on public gatherings, facemask requirements, travel restrictions, and facility closures.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "0BB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "State Level Population Totals",
				"DESCRIPTION": "Population counts, per state, for the past 85 years.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "60B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Status of State Medicaid Expansion Decision",
				"DESCRIPTION": "States who expandad medicaid programs prior to entering the COVID-19 crisis with had lower uninsured rates than non-expansion states.Those uninsured may forgo testing or treatment for COVID-19 due to concerns that they cannot afford it, endangering their health while slowing detection of the virus’ spread.  Current status for each state in datatset  is based on KFF tracking and analysis of state expansion activity.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "5FB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Summary of epidemic activity indicators in France",
				"DESCRIPTION": "Dataset includes  incidence rate (The number of new positive cases per 100 000 inhabitants over 7 rolling days), incidence rate for the elderly (The number of new positive cases per 100 000 inhabitants over the age of 65, over 7 rolling days) and the share of COVID patients in reanimations  (the number of COVID + patients on the total number of nursery beds) in France",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "45B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "TRAVAX Data (Shoreland)",
				"DESCRIPTION": "In person surveys of OCONUS and CONUS hospitals and clinics and rates their departments on a number of measures - it also counts equipment and staff. It is PII compliant, all anonymized.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "56B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Total Deaths and Total Cases for every Country by day worldwide",
				"DESCRIPTION": "Includes total number of cases and deaths for everycoutry wholedwide.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "03B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "US Base Locations",
				"DESCRIPTION": "Table form (csv) of Unclassified US Base Locations",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "40B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "US College Case Count",
				"DESCRIPTION": "Since late July, NYT have been conducting a rolling survey of American colleges and universities — including every four-year public institution and every private college that competes in N.C.A.A. sports — to track the number of coronavirus cases reported among students and employees. The survey now includes more than 1,700 colleges.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "3EB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "US County Level COVID-19 Timeseries Statistics (USAFacts)",
				"DESCRIPTION": "Time series data of confirmed cases of COVID-19 and number of deaths, by county. Data is collated by USAFacts, a not-for-profit nonpartisan civic organization. Enigma searches for updates and publishes data every 6 hours.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "49B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "US Imports - Automated Manifest System (AMS) Shipments 2018-2020 (ADX, Enigma)",
				"DESCRIPTION": "Data includes manufacturers, shipper contact details, vessel country codes, carriers, cargo descriptions and HTS codes, for use in the analysis of international supply chains, global trade, the effect of tariffs and trafficking investigations.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "5DB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "USA Current Wildfires",
				"DESCRIPTION": "point and perimeter locations of wildfire occurrences within the United States over the past 7 days.  Points mark a location within the wildfire area and provide current information about that wildfire. Perimeters are the line surrounding land that has been impacted by a wildfire.",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "31B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "USA Hospital Bed, ICU Bed, Ventilator Data",
				"DESCRIPTION": "Hospital bed counts, utilization, inclusive of ICU and ventilator data",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "1FB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "USDA Food Hub Directory",
				"DESCRIPTION": "Directory of USDA Food Hubs (group farmer's markets, on-farm markets, CSAs, and food hubs)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "32B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Weekly State Unemployment Claims (539 & 902) (DOL) and LAUS Metro Data",
				"DESCRIPTION": "DOL's Employment and Training Administration (ETS) Unemployment Insurance claims, weekly.\nState level unemployment and pandemic unemployment claims",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "5AB27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Weekly subnational 14-day notification rate of new COVID-19 cases",
				"DESCRIPTION": "The downloadable data file contains information on the 14-day notification rate of newly reported COVID-19 cases per 100 000 population by week and subnational region. ",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "b0316106f6d04e97a39a31ab64bcf5af",
				"NAME": "Zip Code Tabulation Area 2010 Statistics",
				"DESCRIPTION": "",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"DATA_SET_ID": "12B27E5A9AB12D00F0000002B2A64A00",
				"NAME": "Zip and County Crosswalk Data",
				"DESCRIPTION": "USPS Crosswalk and zip/county level borders data, for map boundaries",
				"CLASSIFICATION": "UNCLASSIFIED"
			}
		]
	});	
});	

app.get("/mgmt/getMyCards", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"CARD_ID": "312400508C6704F41700C402B8B7FD53",
				"CARD_NAME": "Social Vulnerability Dataset, 2018",
				"STATE_NAME": "Not Submitted",
				"ACTION_TAKEN": "Not Submitted",
				"CREATED_TIMESTAMP": "2022-03-01 13:23:36.000000000",
				"ICON": "sap-icon://form",
				"WF_NAME": "Data Card"
			}
		]
	});	
});	

app.get("/data/searchManifest", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
			"total": 128,
			"limit": 50,
			"offset": 0,
			"results": [
				{
					"DATA_SET_ID": "3d35985760c44ee5bffa29be94a2d561",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/D&BSupplier-ImpliedRiskAtributes/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/D&BSupplier-ImpliedRiskAtributes/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-19 21:34:26.944000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "69c664d56f464d5abba3bc7221cc6bbd",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/tl_2019_us_county/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/tl_2019_us_county/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-19 20:47:07.993000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "cb5f393492b94f8988d5b3e11ec5c5a2",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/installations_ranges/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/installations_ranges/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-19 20:45:19.162000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "bd8e9fe52a3f4d23b1afc3e8995c094a",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Geothermal/favorabilitysurface/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Geothermal/favorabilitysurface/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-19 20:42:22.383000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "ff0c6bed04e54ffc9a4d2a4e274d2971",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CommodityTonnage/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/CommodityTonnage/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-19 20:39:13.578000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "4752f3cbe9274ca18dcf0206755f7a31",
					"DATA_CARD_ID": "F45C00D059C95BE41700C402E246BAF3",
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-19 20:35:37.907000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "4a30c47cc38245bfbc40fa4ffd28c045",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChainInstitute/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChainInstitute/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-19 20:31:48.221000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "572e83c1abf14112bd4437ca75f84e5c",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Mandeley/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Mandeley/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-19 20:28:59.117000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "1579f0fdea524ab78faab5eefb1c5ef9",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Brunel/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Brunel/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-19 20:27:22.311000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "7413130bf3e14170a3cd479300d685c7",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/ml_scenario/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/ml_scenario/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-17 21:54:53.502000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "a2e21182d6384f25a537120c582e8931",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Test_Files/",
					"SOURCE": null,
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Test_Files/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-08-17 21:54:49.340000000",
					"LAST_MOD_BY": "S3FileProcessor"
				},
				{
					"DATA_SET_ID": "dff0f1d6f68043ccba3739a3710d6822",
					"DATA_CARD_ID": "A46300C0CB9CD49C1700C40210085FCE",
					"HUMAN_ID": "",
					"NAME": "ACLED",
					"SOURCE": "ACLED",
					"DESCRIPTION": "The Armed Conflict Location & Event Data Project (ACLED) is a non-governmental organization specializing in disaggregated conflict data collection, analysis, and crisis mapping. ACLED codes the dates, actors, locations, fatalities, and types of all reported political violence and demonstration events in over 190 countries and territories in real time. As of 2021, ACLED has recorded more than a million individual events across Africa, the Middle East, Latin America & the Caribbean, East Asia, South Asia, Southeast Asia, Central Asia & the Caucasus, Europe, and the United States of America. The ACLED team conducts analysis to describe, explore, and test conflict scenarios, making both data and analysis open for use by the public.",
					"PRIME_CATEGORY": "Location/Map Data",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "Periodically",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/ACLED/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-06-15 13:17:51.120000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "12B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "HUD-MAP-001",
					"NAME": "Zip and County Crosswalk Data",
					"SOURCE": "HUD",
					"DESCRIPTION": "USPS Crosswalk and zip/county level borders data, for map boundaries",
					"PRIME_CATEGORY": "Location/Map Data",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "One Time",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/HUD/ZipAndCountyCrosswalkData/",
					"PATH": "/NON-FOUO/HUD/ZipAndCountyCrosswalkData/",
					"URL": "https://www.huduser.gov/portal/datasets/usps_crosswalk.html",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Submitted to Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "",
					"MODEL_VENDORS": "",
					"LAST_MOD_DATE": "2021-05-11 14:06:57.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "15B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "KFF-MED-001",
					"NAME": "Hospital Beds Per Capita, 2018",
					"SOURCE": "KFF",
					"DESCRIPTION": "Hospital bed data broken out by government, non-profit, and for-profit establishments.",
					"PRIME_CATEGORY": "Hospital/PPE Statistics",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "One Time",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/KFF/Hospital_Beds/",
					"PATH": "/NON-FOUO/KFF/Hospital_Beds/",
					"URL": "https://github.com/COVID19Tracking/associated-data/blob/master/kff_hospital_beds/kff_usa_hospital_beds_per_capita_2018.csv",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Submitted to Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "",
					"MODEL_VENDORS": "",
					"LAST_MOD_DATE": "2021-05-10 16:57:49.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "0FB27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "FA-FSC-002",
					"NAME": "Feeding America Locations",
					"SOURCE": "Feeding America",
					"DESCRIPTION": "Feeding America Locations",
					"PRIME_CATEGORY": "Food Supply Chain",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "One Time",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/FeedingAmerica/FA_Locations/",
					"PATH": "/NON-FOUO/FeedingAmerica/FA_Locations/",
					"URL": "E-mail Attachment, Colin 4/15",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Submitted to Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "",
					"MODEL_VENDORS": "",
					"LAST_MOD_DATE": "2021-05-10 16:57:49.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "0EB27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "FA-FSC-001",
					"NAME": "Food Insecurity Data, 2019",
					"SOURCE": "Feeding America",
					"DESCRIPTION": "Feeding America Food Insecurity Data, Major cities (200 cities), 2019",
					"PRIME_CATEGORY": "Food Supply Chain",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "One Time",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/FeedingAmerica/Food_Insecurity/",
					"PATH": "/NON-FOUO/FeedingAmerica/Food_Insecurity/",
					"URL": "E-mail Attachment, Colin 4/21",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Submitted to Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "Yes",
					"MODEL_VENDORS": "IBM",
					"LAST_MOD_DATE": "2021-05-09 16:57:28.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "08B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "CENSUS-FSC-001",
					"NAME": "Food Security Survey, Census 2019",
					"SOURCE": "Census",
					"DESCRIPTION": "Survey conducted by the Census to measure household food security/insecurity statistics, December 2019",
					"PRIME_CATEGORY": "Food Supply Chain",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "One Time",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Census/Food_Security/",
					"PATH": "/NON-FOUO/Census/Food_Security/",
					"URL": "https://thedataweb.rm.census.gov/ftp/cps_ftp.html#cpssupps",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Approved by Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "",
					"MODEL_VENDORS": "",
					"LAST_MOD_DATE": "2021-05-08 16:59:35.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "54B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "JRC-COV-001",
					"NAME": "JRC (Joint Research Center) COVID-19 Statistics",
					"SOURCE": "JRC",
					"DESCRIPTION": "Regional and County level COIVD-19 Statistics from 34 UCPM Participating States plus Switzerland including positive cases, recovered cases, hospitilized cases, ICU cases, and deaths",
					"PRIME_CATEGORY": "Infection Statistics",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Daily",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/JRC/County_level/",
					"PATH": "/NON-FOUO/JRC/County_level/NON-FOUO/JRC/Regional_level/",
					"URL": "https://github.com/ec-jrc/COVID-19",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "",
					"COMMENTS": "",
					"MODEL_INPUT": "",
					"MODEL_VENDORS": "",
					"LAST_MOD_DATE": "2021-05-07 16:48:53.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "39B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "JHU-COV-001",
					"NAME": "JHU: APL COVID Surveillance Dashboard",
					"SOURCE": "JHUAPL",
					"DESCRIPTION": "Global dashboard of confirmed COVID-19 cases, deaths, and recoveries. The dashboard compares global rates to US rates. The dashboard also provides data on cumulative US hospitalizations and testing.",
					"PRIME_CATEGORY": "Infection Statistics",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Daily",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/JHU_CSSE/COVID-19/",
					"PATH": "/NON-FOUO/JHU_CSSE/COVID-19/",
					"URL": "https://github.com/CSSEGISandData/COVID-19",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Approved by Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "Yes",
					"MODEL_VENDORS": "IBM",
					"LAST_MOD_DATE": "2021-05-07 16:48:53.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "1EB27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "USDA-FSC-003",
					"NAME": "FoodAPS National Household Food Acquisition and Purchase Survey, 2017",
					"SOURCE": "USDA",
					"DESCRIPTION": "Detailed information was collected about foods purchased or otherwise acquired for consumption at home and away from home, including foods acquired through food and nutrition assistance programs. From 2017.",
					"PRIME_CATEGORY": "Food Supply Chain",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "One Time",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/USDA/FoodAPSNationalHouseholdFoodAcquisitionandPurchaseSurvey_02212017/",
					"PATH": "/NON-FOUO/USDA/FoodAPSNationalHouseholdFoodAcquisitionandPurchaseSurvey_02212017/",
					"URL": "https://www.ers.usda.gov/data-products/foodaps-national-household-food-acquisition-and-purchase-survey/",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Submitted to Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "",
					"MODEL_VENDORS": "",
					"LAST_MOD_DATE": "2021-05-07 16:48:53.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "31B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "DHCR-MED-001",
					"NAME": "USA Hospital Bed, ICU Bed, Ventilator Data",
					"SOURCE": "Definitive Healthcare",
					"DESCRIPTION": "Hospital bed counts, utilization, inclusive of ICU and ventilator data",
					"PRIME_CATEGORY": "Hospital/PPE Statistics",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Periodically",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/DefinitiveHealthcare/",
					"PATH": "/NON-FOUO/DefinitiveHealthcare/",
					"URL": "https://services7.arcgis.com/LXCny1HyhQCUSueu/arcgis/rest/services/Definitive_Healthcare_USA_Hospital_Beds/FeatureServer/0/",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Approved by Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "Yes",
					"MODEL_VENDORS": "Microsoft",
					"LAST_MOD_DATE": "2021-05-06 14:06:57.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "49B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "CBP-FSC-001",
					"NAME": "US Imports - Automated Manifest System (AMS) Shipments 2018-2020 (ADX, Enigma)",
					"SOURCE": "CBP",
					"DESCRIPTION": "Data includes manufacturers, shipper contact details, vessel country codes, carriers, cargo descriptions and HTS codes, for use in the analysis of international supply chains, global trade, the effect of tariffs and trafficking investigations.",
					"PRIME_CATEGORY": "Food Supply Chain",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Ingest Paused",
					"LOAD_FREQUENCY": "Weekly",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/AWS/DataExchange/Enigma/CBP_Imports_AMS/",
					"PATH": "/NON-FOUO/AWS/DataExchange/Enigma/CBP_Imports_AMS/",
					"URL": "https://console.aws.amazon.com/dataexchange/home?region=us-east-1#/products",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Approved by Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "",
					"MODEL_VENDORS": "",
					"LAST_MOD_DATE": "2021-05-06 14:06:57.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "44B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "SBOC-FSC-001",
					"NAME": "SouperBowlofCaring - Locations",
					"SOURCE": "SouperBowlofCaring",
					"DESCRIPTION": "SBoC Locations and Need Metrics",
					"PRIME_CATEGORY": "Food Supply Chain",
					"SUB_CATEGORY": "Location/Addresses",
					"ACCESS_TYPE": "Procured",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Weekly",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/SouperBowlOfCaring/",
					"PATH": "/NON-FOUO/SouperBowlOfCaring/",
					"URL": "Dell Provided (e-mail)",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Approved by Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "Yes",
					"MODEL_VENDORS": "Dell",
					"LAST_MOD_DATE": "2021-05-06 14:06:57.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "55B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "UN-POP-001",
					"NAME": "Global COVID-19 Travel Restrictions",
					"SOURCE": "United Nations",
					"DESCRIPTION": "This dataset shows current travel restrictions. Information is collected from various sources: IATA, media, national sources, WFP internal or any other.",
					"PRIME_CATEGORY": "Population/Economics",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Daily",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/United_Nations/Global_Travel_Restrictions/",
					"PATH": "/NON-FOUO/United_Nations/",
					"URL": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTxATUFm0tR6Vqq-UAOuqQ-BoQDvYYEe-BmJ20s50yBKDHEifGofP2P1LJ4jWFIu0Pb_4kRhQeyhHmn/pub?gid=0&single=true&output=csv",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "",
					"COMMENTS": "",
					"MODEL_INPUT": "",
					"MODEL_VENDORS": "",
					"LAST_MOD_DATE": "2021-05-06 14:06:57.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "5FB27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "FR-COV-001",
					"NAME": "Summary of epidemic activity indicators in France",
					"SOURCE": "EU Data Portal",
					"DESCRIPTION": "Dataset includes  incidence rate (The number of new positive cases per 100 000 inhabitants over 7 rolling days), incidence rate for the elderly (The number of new positive cases per 100 000 inhabitants over the age of 65, over 7 rolling days) and the share of COVID patients in reanimations  (the number of COVID + patients on the total number of nursery beds) in France",
					"PRIME_CATEGORY": "Infection Statistics",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "One Time",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/EUCOM/France/",
					"PATH": "/NON-FOUO/EUCOM/France/",
					"URL": "https://www.data.gouv.fr/fr/datasets/r/bdb43ecc-6e99-4f53-ad22-3903b84661de",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "N/A",
					"COMMENTS": "When dataset is updated, past data is deleted, .CSV presents data for past 7 days only",
					"MODEL_INPUT": "",
					"MODEL_VENDORS": "",
					"LAST_MOD_DATE": "2021-05-06 14:06:57.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "3FB27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "WIKI-GOV-001",
					"NAME": "State COVID-19 Lock-down and Phase Status Data",
					"SOURCE": "Wikipedia",
					"DESCRIPTION": "State Level lock down status information. This includes information on public gatherings, facemask requirements, travel restrictions, and facility closures.",
					"PRIME_CATEGORY": "Government",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Weekly",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Wiki/",
					"PATH": "/NON-FOUO/Wiki/",
					"URL": "https://en.wikipedia.org/wiki/U.S._state_and_local_government_response_to_the_2020_coronavirus_pandemic",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "",
					"COMMENTS": "",
					"MODEL_INPUT": "Yes",
					"MODEL_VENDORS": "Microsoft",
					"LAST_MOD_DATE": "2021-05-06 14:06:57.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "36B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "GOOG-MOB-001",
					"NAME": "Google Community Mobility Reports Data",
					"SOURCE": "Google",
					"DESCRIPTION": "CSV data of the information provided within Google's Community Mobility Reports. The reports chart movement trends over time by geography, across different categories of places such as retail and recreation, groceries and pharmacies, parks, transit stations, workplaces, and residential. Provides the percentage change of visits at the county level compared to the early 2020 baseline.",
					"PRIME_CATEGORY": "Mobility",
					"SUB_CATEGORY": "Aggregated Mobility",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Daily",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Google/",
					"PATH": "/NON-FOUO/Google/",
					"URL": "https://www.google.com/covid19/mobility/",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Submitted to Business Review",
					"COMMENTS": "https://support.google.com/covid19-mobility#topic=9822927",
					"MODEL_INPUT": "Yes",
					"MODEL_VENDORS": "AWS",
					"LAST_MOD_DATE": "2021-05-05 14:10:57.000000000",
					"LAST_MOD_BY": "DEMO"
				},
				{
					"DATA_SET_ID": "ac99796928504dd7a3fd6bbfde054b4f",
					"DATA_CARD_ID": "77F401B0714E9B7F1700480269F90446",
					"HUMAN_ID": "VA-OTR-001",
					"NAME": "VA Mental Health Information",
					"SOURCE": "DATA.GOV",
					"DESCRIPTION": "Statistics on veterans mental health. ",
					"PRIME_CATEGORY": "Hospital/PPE Statistics",
					"SUB_CATEGORY": "Medical",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "Quarterly",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/VA-SAC/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-04-13 16:18:10.205000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "7021746b0efb449490c0e6c88491ed29",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "",
					"NAME": "Health COVID",
					"SOURCE": "CDC",
					"DESCRIPTION": "Statistics on COVID infections.  ",
					"PRIME_CATEGORY": "Hospital/PPE Statistics",
					"SUB_CATEGORY": "Infection Statistics",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "Periodically",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/COVID/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-19 17:13:34.701000000",
					"LAST_MOD_BY": "WAYNE"
				},
				{
					"DATA_SET_ID": "27B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "HUM-MED-001",
					"NAME": "COVID-19 Medicare Analytics Dataset, Full Cohort and Medicare Recipients – FOUO",
					"SOURCE": "Humetrix",
					"DESCRIPTION": "This dataset is a CSV data file containing individual residence zip codes, demographic, socio-economic and medical characteristics (diagnoses, prescribed medications, prior health service utilization) of the entire 9+ million Project Salus Medicare cohort with COVID-19 diagnosis status and outcome data including COVID-19 hospitalizations, ICU admissions, ventilator use and death. The dataset also includes a Medicare beneficiaries-specific subset with matching statistics.",
					"PRIME_CATEGORY": "Infection Statistics",
					"SUB_CATEGORY": "Medicare Claims Data",
					"ACCESS_TYPE": "FOUO",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Weekly",
					"DATANODE_PATH": "/S3-Publish/LOE1/CUI/CMS_Humetrix/",
					"PATH": "/FOUO/CMS_Humetrix/",
					"URL": "Humetrix Analysis/Provided",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Approved by Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "Yes",
					"MODEL_VENDORS": "Humetrix/AWS/LUCD",
					"LAST_MOD_DATE": "2021-03-19 15:15:23.196000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "46B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "REDSKY-MAP-001",
					"NAME": "CDC RedSky: Global Health Event Data",
					"SOURCE": "GBSP",
					"DESCRIPTION": "RedSky is a situational awareness viewer used by the Centers for Disease Control and Prevention (CDC) and state and local public health departments to manage and share certain public health data. The CDC-internal version of RedSky tracks global events which may require CDC assistance or which currently involve CDC resources. Provided by GBSP.",
					"PRIME_CATEGORY": "Location/Map Data",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "CUI",
					"LOAD_STATUS": "Ingest Paused",
					"LOAD_FREQUENCY": "Daily",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/GBSP/CDCRedSky/",
					"PATH": "/FOUO/GBSP/CDCRedSky/",
					"URL": "NFS Mount, Data Node",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Submitted to Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "",
					"MODEL_VENDORS": "",
					"LAST_MOD_DATE": "2021-03-19 15:15:18.114000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "26B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "HIFLD-OTR-001",
					"NAME": "DHS HSIN HIFLD:  FOUO Datasets",
					"SOURCE": "DHS",
					"DESCRIPTION": "DHS, Homeland Infrastructure Foundation-Level Data (HIFLD). Data Catalog:\nhttps://gii.dhs.gov/hifld/sites/default/files/2020-07/HIFLD2020_Data_Catalog.xlsx",
					"PRIME_CATEGORY": "Other",
					"SUB_CATEGORY": "Multiple Types",
					"ACCESS_TYPE": "FOUO",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Periodically",
					"DATANODE_PATH": "/S3-Publish/LOE1/CUI/HIFLD/",
					"PATH": "/FOUO/HIFLD/",
					"URL": "https://gii.dhs.gov/hifld/sites/default/files/2020-07/HIFLD2020_Data_Catalog.xlsx",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Submitted to Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "Yes",
					"MODEL_VENDORS": "LUCD",
					"LAST_MOD_DATE": "2021-03-19 15:15:12.865000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "24B27E5A9AB12D00F0000002B2A64A00",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "CMS-COV-001",
					"NAME": "CMS: Medicare Claims Data - FOUO",
					"SOURCE": "CMS",
					"DESCRIPTION": "This Medicare claims data set includes all Inpatient, Outpatient, Carrier (Part B), Skilled Nursing Facility, and Hospice claims dating back to January 1 2020, the Master Beneficiary Summary file (MBSF) and the 2019 MBSF Chronic Conditions segment file of the Project Salus Medicare Fee for Service (FFS) population cohort extracted from the CMS Chronic Conditions Data Warehouse. As of July 21, this cohort included 9.2M beneficiaries who since March 1st have either been hospitalized, received Emergency Department, Urgent Care or telehealth services, or had a COVID-19 test billed to Medicare.",
					"PRIME_CATEGORY": "Infection Statistics",
					"SUB_CATEGORY": "",
					"ACCESS_TYPE": "CUI",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Weekly",
					"DATANODE_PATH": "/CMS/CCW/",
					"PATH": "/CMS/CCW/",
					"URL": "sfts.ccwdata.org",
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "S3_DEV_SALUS",
					"DATA_CARD_STATUS": "Approved by Business Review",
					"COMMENTS": "",
					"MODEL_INPUT": "Yes",
					"MODEL_VENDORS": "Humetrix",
					"LAST_MOD_DATE": "2021-03-19 15:15:06.978000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "a23f5dfe68c344d981bae1482f59670d",
					"DATA_CARD_ID": "D18D01203AC39E981700C402E1D52F82",
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Hospitals/",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Hospitals/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-17 17:17:52.378000000",
					"LAST_MOD_BY": null
				},
				{
					"DATA_SET_ID": "872ee01d46934ffd81a2d1b9de721857",
					"DATA_CARD_ID": "3A7001203AC39E981700C402E1D52F82",
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Public_Refrigerated_Warehouses/",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Public_Refrigerated_Warehouses/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-17 17:10:45.282000000",
					"LAST_MOD_BY": null
				},
				{
					"DATA_SET_ID": "eedd0f9d48414be9a92146181c9545b7",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/US-County-Boundaries/",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/US-County-Boundaries/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-17 16:03:43.655000000",
					"LAST_MOD_BY": null
				},
				{
					"DATA_SET_ID": "3aa860d4a7b54adc96926329b79c8a26",
					"DATA_CARD_ID": null,
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/military-installations-ranges-and-training-areas/",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/military-installations-ranges-and-training-areas/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-17 15:51:42.519000000",
					"LAST_MOD_BY": null
				},
				{
					"DATA_SET_ID": "9b9e97fed9a9408f970eb72ea93c5add",
					"DATA_CARD_ID": "A4D700B0714E9B7F1700480269F90446",
					"HUMAN_ID": "TRANS-01-001",
					"NAME": "Swedish Auto",
					"SOURCE": "AutoTrader",
					"DESCRIPTION": "The automotive industry in Sweden is mainly associated with passenger car manufacturers Volvo Cars and Saab Automobile but Sweden is also home of two of the largest truck manufacturers in the world: Volvo AB and Scania AB. The automotive industry is heavily dependent on export as some 85 percent of the passenger cars and 95 percent of the heavy vehicles are sold outside of Sweden. The automotive industry and its sub-contractors is a major part of Swedish industry.",
					"PRIME_CATEGORY": "Transportation",
					"SUB_CATEGORY": "Supply Chain",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "Periodically",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/SwedishAuto/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-11 21:28:28.676000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "4f306d1b759648f5a6d7ef8e80b4f327",
					"DATA_CARD_ID": "0ED500B0714E9B7F1700480269F90446",
					"HUMAN_ID": "",
					"NAME": "Bank Note",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": "Data were extracted from images that were taken from genuine and forged banknote-like specimens. For digitization, an industrial camera usually used for print inspection was used. The final images have 400x 400 pixels. Due to the object lens and distance to the investigated object gray-scale pictures with a resolution of about 660 dpi were gained. Wavelet Transform tool were used to extract features from images",
					"PRIME_CATEGORY": "Financial",
					"SUB_CATEGORY": "Employment",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "Periodically",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/BankNote/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-11 16:52:13.976000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "1e3bed096b9349e9a6c17c6d04648ae2",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "",
					"NAME": "Plants",
					"SOURCE": "Microsoft",
					"DESCRIPTION": "",
					"PRIME_CATEGORY": "Agriculture",
					"SUB_CATEGORY": "Food Security",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Ingest Ongoing",
					"LOAD_FREQUENCY": "Monthly",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/MicroSoft/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-10 00:23:01.767000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "c8248ae31ed2492fac988dcf0fbb7e69",
					"DATA_CARD_ID": "C6D700B0714E9B7F1700480269F90446",
					"HUMAN_ID": "",
					"NAME": "Wine Quality",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": "Factors like climate, weather and soil affect the quantity and quality of the fruit. Heat is essential: the plant uses sunlight and chlorophyll to produce the glucose it needs for growth and vigor by combining CO2 and water.",
					"PRIME_CATEGORY": "Food Supply Chain",
					"SUB_CATEGORY": "Food Security",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "Periodically",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Wine/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-10 00:21:08.153000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "d21d56a0793c4b6b87cf8278755e3ac9",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "",
					"NAME": "Seismic Bumps",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": "The seismic bumps dataset is one of the lesser-known binary classification datasets that capture geological conditions using seismic and seismo-acoustic systems in longwall coal mines to assess if they are prone to rockburst causing seismic hazards or not.",
					"PRIME_CATEGORY": "Disaster",
					"SUB_CATEGORY": "Government",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "Periodically",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/SeismicBumps/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-10 00:12:26.564000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "4b09fa1f7d324fb88f4084244725cb23",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "",
					"NAME": "Sonar",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": "Sonar is a technique that uses sound propagation to navigate, communicate with or detect objects on or under the surface of the water, such as other vessels.",
					"PRIME_CATEGORY": "Government",
					"SUB_CATEGORY": "Government",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "Quarterly",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Sonar/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-10 00:11:07.378000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "6af4b64978f74fe1b0d0396d26af36e5",
					"DATA_CARD_ID": "8FD500B0714E9B7F1700480269F90446",
					"HUMAN_ID": "",
					"NAME": "Marathon",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": "The marathon is a long-distance race with an official distance of 42.195 kilometres, usually run as a road race. The event was instituted in commemoration of the fabled run of the Greek soldier Pheidippides, a messenger from the Battle of Marathon to Athens, who reported the victory.",
					"PRIME_CATEGORY": "Population/Economics",
					"SUB_CATEGORY": "Mobility",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "Weekly",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Marathon/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-10 00:10:43.962000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "d5650d40f6f443fab1ad9ebf3b132d16",
					"DATA_CARD_ID": "",
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/PDF/",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/PDF/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-09 22:39:02.670000000",
					"LAST_MOD_BY": null
				},
				{
					"DATA_SET_ID": "4f599addf22a4c91a753f52cee6bd83b",
					"DATA_CARD_ID": "3A7001203AC39E981700C402E1D52F82",
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/OTHER/",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/OTHER/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-09 22:39:01.897000000",
					"LAST_MOD_BY": null
				},
				{
					"DATA_SET_ID": "6ff25f7f0187475aab3de7521c554878",
					"DATA_CARD_ID": "038C01203AC39E981700C402E1D52F82",
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CSV/",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/CSV/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-09 22:17:39.358000000",
					"LAST_MOD_BY": null
				},
				{
					"DATA_SET_ID": "4a5197bec873455b9a21815802657f13",
					"DATA_CARD_ID": "C41E02B0714E9B7F1700480269F90446",
					"HUMAN_ID": null,
					"NAME": "/S3-Publish/LOE1/CLASSIFIED/TestData/",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": null,
					"PRIME_CATEGORY": null,
					"SUB_CATEGORY": null,
					"ACCESS_TYPE": null,
					"LOAD_STATUS": null,
					"LOAD_FREQUENCY": null,
					"DATANODE_PATH": "/S3-Publish/LOE1/CLASSIFIED/TestData/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "CLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": null,
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-09 22:17:38.337000000",
					"LAST_MOD_BY": null
				},
				{
					"DATA_SET_ID": "97323d7480454b56862cec6d6c5595a6",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "MIL-001-01",
					"NAME": "Military Locations",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": "Location data is information about the geographic position of a person or object.",
					"PRIME_CATEGORY": "Location/Map Data",
					"SUB_CATEGORY": "Government",
					"ACCESS_TYPE": "Procured",
					"LOAD_STATUS": "Available, Load Complete",
					"LOAD_FREQUENCY": "Monthly",
					"DATANODE_PATH": "/S3-Publish/LOE1/CLASSIFIED/DI-Data/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-09 21:51:45.319000000",
					"LAST_MOD_BY": "MICHELLE"
				},
				{
					"DATA_SET_ID": "4177d69f61014c76bff070db38c2db2b",
					"DATA_CARD_ID": "",
					"HUMAN_ID": "",
					"NAME": "Ionosphere",
					"SOURCE": "UNKNOWN",
					"DESCRIPTION": "The layer of the earth's atmosphere that contains a high concentration of ions and free electrons and is able to reflect radio waves. It lies above the mesosphere and extends from about 50 to 600 miles (80 to 1,000 km) above the earth's surface.",
					"PRIME_CATEGORY": "Disaster",
					"SUB_CATEGORY": "Multiple Types",
					"ACCESS_TYPE": "Open",
					"LOAD_STATUS": "Sample",
					"LOAD_FREQUENCY": "Periodically",
					"DATANODE_PATH": "/S3-Publish/LOE1/UNCLASSIFIED/Ionosphere/",
					"PATH": null,
					"URL": null,
					"CLASSIFICATION": "UNCLASSIFIED",
					"CONNECTION_ID": "MARINA_DATA_BROKER_INGEST",
					"DATA_CARD_STATUS": "",
					"COMMENTS": null,
					"MODEL_INPUT": null,
					"MODEL_VENDORS": null,
					"LAST_MOD_DATE": "2021-03-09 21:25:14.041000000",
					"LAST_MOD_BY": "MICHELLE"
				}
			]
		}
	});	
});	

app.get("/dashboard/getLoadStatusReport", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"LOAD_STATUS": "",
				"NAME": "Zip Code Tabulation Area 2010 Statistics",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "ACLED",
				"SOURCE": "ACLED",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "US Base Locations",
				"SOURCE": "Air Force",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Swedish Auto",
				"SOURCE": "AutoTrader",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "County Level Income",
				"SOURCE": "BEA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Employment Statistics, Aggregated by NAICS Code",
				"SOURCE": "BEA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Social Vulnerability Dataset, 2018",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Estimated County-Level Prevalence of Selected Underlying Medical Conditions Associated with Increased Risk for Severe COVID-19 Illness — United States, 2018",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Health COVID",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Census 2019 US County Geometry Files",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Food Security Survey, Census 2019",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Employment & Payroll by Zip Code, 2010-2016",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "State Level Population Totals",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "VA Mental Health Information",
				"SOURCE": "DATA.GOV",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Military Installations, Ranges and Training Areas (MIRTA)",
				"SOURCE": "Data.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Coronavirus and School re-opening plans by Districts",
				"SOURCE": "Education Week",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "NUTS3 Population",
				"SOURCE": "Eurostat",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Feeding America Locations",
				"SOURCE": "Feeding America",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "MapTheGap",
				"SOURCE": "Feeding America",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Food Insecurity Data, 2019",
				"SOURCE": "Feeding America",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Point in time Estimates  of US homeloess population by  US Sate (2001-2019)",
				"SOURCE": "HUD",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Zip and County Crosswalk Data",
				"SOURCE": "HUD",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "IRS Tax Return Data, 2017",
				"SOURCE": "IRS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Hospital Beds Per Capita, 2018",
				"SOURCE": "KFF",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Hospital ICU Bed Data and Population Statistics per Bed",
				"SOURCE": "Kaggle",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Medical Physician Compare",
				"SOURCE": "Medicare.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Nursing Home Data",
				"SOURCE": "Medicare.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Hospital Compare",
				"SOURCE": "Medicare.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Aadministrative County boundaries of Germany",
				"SOURCE": "NPGEO",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Mask Usage by County",
				"SOURCE": "New York Times",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Open Street Maps, North America PBF",
				"SOURCE": "Open Street Maps",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Open Street Maps, Hospital Locations",
				"SOURCE": "Open Street Maps",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Community Vulnerability Index",
				"SOURCE": "Surgo Foundation",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Bank Note",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Seismic Bumps",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Wine Quality",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Marathon",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Sonar",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Military Locations",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "% of Multigenerational Households",
				"SOURCE": "US Census Bureau",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Farm to School Survey, 2015",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "USDA Food Hub Directory",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "SNAP - Participation by County (2019)",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Crop Planting and Harvest Schedule",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "FoodAPS National Household Food Acquisition and Purchase Survey, 2017",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Available, Load Complete",
				"NAME": "Meat Processing Facility Directory",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Apple Maps Mobility Trends Data",
				"SOURCE": "Apple",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Quarterly Unemployment Statistics",
				"SOURCE": "BLS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Local Area Unemployment Statistics, 14-month",
				"SOURCE": "BLS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "CDC Provisional COVID-19 Death Counts by Sex, Age, and State",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "COVID-19 Case Surveillance Public Use Data",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Covid-19 Nursing Home Data (Free and Open)",
				"SOURCE": "CMS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "CMS: Medicare Claims Data - FOUO",
				"SOURCE": "CMS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Coronavirus Cases by Race/Ethnicity",
				"SOURCE": "COVID Tracking Project",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "COVID-19 Claims: Explicit Codes and Interim Billing Guidelines (ADX)",
				"SOURCE": "Change Healthcare",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Columbia University - COVID-19 Projections",
				"SOURCE": "Columbia University",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "COVID-19 Daily Infection Statistics",
				"SOURCE": "CoronaDataScraper.com",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "COVID-19 State & County Risk Levels",
				"SOURCE": "CovidActNow.com",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "COVID-19 Case, Hospital, and Death Statistics by State",
				"SOURCE": "CovidTracking.com",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "DHS HSIN HIFLD:  Open Datasets",
				"SOURCE": "DHS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "DHS HSIN HIFLD:  FOUO Datasets",
				"SOURCE": "DHS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Weekly State Unemployment Claims (539 & 902) (DOL) and LAUS Metro Data",
				"SOURCE": "DOL",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "USA Hospital Bed, ICU Bed, Ventilator Data",
				"SOURCE": "Definitive Healthcare",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "COV-19: Total (cumulative) number of persons having been infected by district sanitary stations, including laboratories, number of deaths  and tests performed in the Czech Republic",
				"SOURCE": "EU Data Portal",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Summary of epidemic activity indicators in France",
				"SOURCE": "EU Data Portal",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Weekly subnational 14-day notification rate of new COVID-19 cases",
				"SOURCE": "European Center for Disease Prevention and Control",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Daily Hospital/ICU  admission rate",
				"SOURCE": "European Center for Disease Prevention and Control",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "COVID- 19 Restriction Measures",
				"SOURCE": "European Center for Disease Prevention and Control",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "FDA Drug Shortages",
				"SOURCE": "FDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "FDA Open Data",
				"SOURCE": "FDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "FOURESQUARE: COVID-19 Foot Traffic Data (ADX)",
				"SOURCE": "Fouresquare",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Google Community Mobility Reports Data",
				"SOURCE": "Google",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "HHS Protect - FOUO",
				"SOURCE": "HHS",
				"CLASSIFICATION": "CUI"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "IHME COVID-19 Projections (Healthdata.org)",
				"SOURCE": "Healthdata.org",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "COVID-19 Medicare Analytics Dataset, Full Cohort and Medicare Recipients – FOUO",
				"SOURCE": "Humetrix",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "JHU: APL COVID Surveillance Dashboard",
				"SOURCE": "JHUAPL",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "JRC (Joint Research Center) COVID-19 Statistics",
				"SOURCE": "JRC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Status of State Medicaid Expansion Decision",
				"SOURCE": "Kaiser Family Foundation (KFF)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Plants",
				"SOURCE": "Microsoft",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "National Interagency Fire Center - Wildfire Perimeter",
				"SOURCE": "NIFC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "COVID-19 Cases and Deaths By County (NYTimes)",
				"SOURCE": "NYTimes",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "US College Case Count",
				"SOURCE": "NYTimes",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "National Association of Counties (NAC) - County Policies and Declarations",
				"SOURCE": "National Association of Counties",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Total Deaths and Total Cases for every Country by day worldwide",
				"SOURCE": "Our World in Data",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "OxCGRT - Oxford University COVID Government Response Tracker",
				"SOURCE": "Oxford University",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Repositrak (Park City Group) Sales & Delivery SKU Data, Daily",
				"SOURCE": "Park City Group",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Repositrak:  Sell Through Stats 2020",
				"SOURCE": "Park City Group",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Safe Graph Mobility Data",
				"SOURCE": "Safe Graph",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Belgium total number of COVID-19 tests performed",
				"SOURCE": "Sciensano (Belgium Institute of Health)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Daily confirmed  Cases in Belgium by age group and sex",
				"SOURCE": "Sciensano (Belgium Institute of Health)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Belgium Mortality Rate by age, date, sex, region",
				"SOURCE": "Sciensano (Belgium Institute of Health)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "TRAVAX Data (Shoreland)",
				"SOURCE": "Shoreland",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "SouperBowlofCaring - Locations",
				"SOURCE": "SouperBowlofCaring",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "US County Level COVID-19 Timeseries Statistics (USAFacts)",
				"SOURCE": "USAFacts",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Global COVID-19 Travel Restrictions",
				"SOURCE": "United Nations",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "Covid-19 Cases in Europe",
				"SOURCE": "WHO",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing",
				"NAME": "State COVID-19 Lock-down and Phase Status Data",
				"SOURCE": "Wikipedia",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Ongoing, Manual",
				"NAME": "USA Current Wildfires",
				"SOURCE": "Esri",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Paused",
				"NAME": "US Imports - Automated Manifest System (AMS) Shipments 2018-2020 (ADX, Enigma)",
				"SOURCE": "CBP",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Paused",
				"NAME": "CDC COVID-19 Infection and Death Statistics",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Paused",
				"NAME": "CDC RedSky: Global Health Event Data",
				"SOURCE": "GBSP",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Paused",
				"NAME": "Hc1 COVID-9 Local Risk Index (ADX)",
				"SOURCE": "Hc1",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Ingest Paused",
				"NAME": "Small Buisness Pulse Survey",
				"SOURCE": "US Census Bureau",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "SAMPLE",
				"NAME": "ADP City NAICS - SAMPLE",
				"SOURCE": "Equifax",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "SAMPLE",
				"NAME": "Credit Trends - SAMPLE",
				"SOURCE": "Equifax",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "SAMPLE",
				"NAME": "Commercial Firmographics - SAMPLE",
				"SOURCE": "Equifax",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "SAMPLE",
				"NAME": "RelevantData - Product Supply Metrics - SAMPLE",
				"SOURCE": "RelevantData",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "SAMPLE",
				"NAME": "Activity Feed - SAMPLE",
				"SOURCE": "Unacast",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "SAMPLE",
				"NAME": "Social Distancing Metrics - SAMPLE",
				"SOURCE": "Unacast",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Sample",
				"NAME": "Ionosphere",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CommodityTonnage/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/D&BSupplier-ImpliedRiskAtributes/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Geothermal/favorabilitysurface/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Brunel/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Mandeley/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChainInstitute/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Test_Files/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/installations_ranges/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/ml_scenario/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/tl_2019_us_county/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/Greater_Downtown_Alleys-shp/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Public_Refrigerated_Warehouses/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Hospitals/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/military-installations-ranges-and-training-areas/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/US-County-Boundaries/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/CLASSIFIED/TestData/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "CLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/PDF/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/JSON/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/OTHER/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_STATUS": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CSV/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			}
		]
	});	
});

app.get("/dashboard/getLoadFreqReport", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"LOAD_FREQUENCY": "",
				"NAME": "DHS HSIN HIFLD:  Open Datasets",
				"SOURCE": "DHS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "",
				"NAME": "Community Vulnerability Index",
				"SOURCE": "Surgo Foundation",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "",
				"NAME": "Zip Code Tabulation Area 2010 Statistics",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Bi-Monthly",
				"NAME": "TRAVAX Data (Shoreland)",
				"SOURCE": "Shoreland",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Bi-Weekly",
				"NAME": "COVID-19 Case Surveillance Public Use Data",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Bi-Weekly",
				"NAME": "Coronavirus and School re-opening plans by Districts",
				"SOURCE": "Education Week",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Bi-Weekly",
				"NAME": "US College Case Count",
				"SOURCE": "NYTimes",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Bi-Weekly",
				"NAME": "Total Deaths and Total Cases for every Country by day worldwide",
				"SOURCE": "Our World in Data",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "Apple Maps Mobility Trends Data",
				"SOURCE": "Apple",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "CDC COVID-19 Infection and Death Statistics",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "Columbia University - COVID-19 Projections",
				"SOURCE": "Columbia University",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "COVID-19 Daily Infection Statistics",
				"SOURCE": "CoronaDataScraper.com",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "COVID-19 State & County Risk Levels",
				"SOURCE": "CovidActNow.com",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "COVID-19 Case, Hospital, and Death Statistics by State",
				"SOURCE": "CovidTracking.com",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "COV-19: Total (cumulative) number of persons having been infected by district sanitary stations, including laboratories, number of deaths  and tests performed in the Czech Republic",
				"SOURCE": "EU Data Portal",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "FDA Drug Shortages",
				"SOURCE": "FDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "FDA Open Data",
				"SOURCE": "FDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "CDC RedSky: Global Health Event Data",
				"SOURCE": "GBSP",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "Google Community Mobility Reports Data",
				"SOURCE": "Google",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "Hc1 COVID-9 Local Risk Index (ADX)",
				"SOURCE": "Hc1",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "JHU: APL COVID Surveillance Dashboard",
				"SOURCE": "JHUAPL",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "JRC (Joint Research Center) COVID-19 Statistics",
				"SOURCE": "JRC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "National Interagency Fire Center - Wildfire Perimeter",
				"SOURCE": "NIFC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "COVID-19 Cases and Deaths By County (NYTimes)",
				"SOURCE": "NYTimes",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "National Association of Counties (NAC) - County Policies and Declarations",
				"SOURCE": "National Association of Counties",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "OxCGRT - Oxford University COVID Government Response Tracker",
				"SOURCE": "Oxford University",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "Repositrak (Park City Group) Sales & Delivery SKU Data, Daily",
				"SOURCE": "Park City Group",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "US County Level COVID-19 Timeseries Statistics (USAFacts)",
				"SOURCE": "USAFacts",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Daily",
				"NAME": "Global COVID-19 Travel Restrictions",
				"SOURCE": "United Nations",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Monthly",
				"NAME": "Local Area Unemployment Statistics, 14-month",
				"SOURCE": "BLS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Monthly",
				"NAME": "Plants",
				"SOURCE": "Microsoft",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Monthly",
				"NAME": "Military Locations",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "US Base Locations",
				"SOURCE": "Air Force",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Employment Statistics, Aggregated by NAICS Code",
				"SOURCE": "BEA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "County Level Income",
				"SOURCE": "BEA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Social Vulnerability Dataset, 2018",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Estimated County-Level Prevalence of Selected Underlying Medical Conditions Associated with Increased Risk for Severe COVID-19 Illness — United States, 2018",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Food Security Survey, Census 2019",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Employment & Payroll by Zip Code, 2010-2016",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "State Level Population Totals",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Census 2019 US County Geometry Files",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Military Installations, Ranges and Training Areas (MIRTA)",
				"SOURCE": "Data.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Summary of epidemic activity indicators in France",
				"SOURCE": "EU Data Portal",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "ADP City NAICS - SAMPLE",
				"SOURCE": "Equifax",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Commercial Firmographics - SAMPLE",
				"SOURCE": "Equifax",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Credit Trends - SAMPLE",
				"SOURCE": "Equifax",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "NUTS3 Population",
				"SOURCE": "Eurostat",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Feeding America Locations",
				"SOURCE": "Feeding America",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Food Insecurity Data, 2019",
				"SOURCE": "Feeding America",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "MapTheGap",
				"SOURCE": "Feeding America",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Zip and County Crosswalk Data",
				"SOURCE": "HUD",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Point in time Estimates  of US homeloess population by  US Sate (2001-2019)",
				"SOURCE": "HUD",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "IRS Tax Return Data, 2017",
				"SOURCE": "IRS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Hospital Beds Per Capita, 2018",
				"SOURCE": "KFF",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Hospital ICU Bed Data and Population Statistics per Bed",
				"SOURCE": "Kaggle",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Medical Physician Compare",
				"SOURCE": "Medicare.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Hospital Compare",
				"SOURCE": "Medicare.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Nursing Home Data",
				"SOURCE": "Medicare.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Aadministrative County boundaries of Germany",
				"SOURCE": "NPGEO",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Mask Usage by County",
				"SOURCE": "New York Times",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Open Street Maps, North America PBF",
				"SOURCE": "Open Street Maps",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Open Street Maps, Hospital Locations",
				"SOURCE": "Open Street Maps",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "% of Multigenerational Households",
				"SOURCE": "US Census Bureau",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "FoodAPS National Household Food Acquisition and Purchase Survey, 2017",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "SNAP - Participation by County (2019)",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "USDA Food Hub Directory",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Meat Processing Facility Directory",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Crop Planting and Harvest Schedule",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Farm to School Survey, 2015",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Social Distancing Metrics - SAMPLE",
				"SOURCE": "Unacast",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "One Time",
				"NAME": "Activity Feed - SAMPLE",
				"SOURCE": "Unacast",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "ACLED",
				"SOURCE": "ACLED",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "Swedish Auto",
				"SOURCE": "AutoTrader",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "Health COVID",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "DHS HSIN HIFLD:  FOUO Datasets",
				"SOURCE": "DHS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "USA Hospital Bed, ICU Bed, Ventilator Data",
				"SOURCE": "Definitive Healthcare",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "HHS Protect - FOUO",
				"SOURCE": "HHS",
				"CLASSIFICATION": "CUI"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "IHME COVID-19 Projections (Healthdata.org)",
				"SOURCE": "Healthdata.org",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "Status of State Medicaid Expansion Decision",
				"SOURCE": "Kaiser Family Foundation (KFF)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "Belgium Mortality Rate by age, date, sex, region",
				"SOURCE": "Sciensano (Belgium Institute of Health)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "Belgium total number of COVID-19 tests performed",
				"SOURCE": "Sciensano (Belgium Institute of Health)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "Daily confirmed  Cases in Belgium by age group and sex",
				"SOURCE": "Sciensano (Belgium Institute of Health)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "Bank Note",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "Wine Quality",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "Seismic Bumps",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Periodically",
				"NAME": "Ionosphere",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Quarterly",
				"NAME": "Quarterly Unemployment Statistics",
				"SOURCE": "BLS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Quarterly",
				"NAME": "VA Mental Health Information",
				"SOURCE": "DATA.GOV",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Quarterly",
				"NAME": "Sonar",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "TBD",
				"NAME": "RelevantData - Product Supply Metrics - SAMPLE",
				"SOURCE": "RelevantData",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/tl_2019_us_county/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/ml_scenario/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/installations_ranges/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Test_Files/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChainInstitute/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Mandeley/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Brunel/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Geothermal/favorabilitysurface/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/D&BSupplier-ImpliedRiskAtributes/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CommodityTonnage/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/Greater_Downtown_Alleys-shp/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Public_Refrigerated_Warehouses/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/military-installations-ranges-and-training-areas/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/US-County-Boundaries/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/CLASSIFIED/TestData/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "CLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/PDF/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/JSON/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Hospitals/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CSV/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/OTHER/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "US Imports - Automated Manifest System (AMS) Shipments 2018-2020 (ADX, Enigma)",
				"SOURCE": "CBP",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "CDC Provisional COVID-19 Death Counts by Sex, Age, and State",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "CMS: Medicare Claims Data - FOUO",
				"SOURCE": "CMS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "Covid-19 Nursing Home Data (Free and Open)",
				"SOURCE": "CMS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "Coronavirus Cases by Race/Ethnicity",
				"SOURCE": "COVID Tracking Project",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "COVID-19 Claims: Explicit Codes and Interim Billing Guidelines (ADX)",
				"SOURCE": "Change Healthcare",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "Weekly State Unemployment Claims (539 & 902) (DOL) and LAUS Metro Data",
				"SOURCE": "DOL",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "USA Current Wildfires",
				"SOURCE": "Esri",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "Daily Hospital/ICU  admission rate",
				"SOURCE": "European Center for Disease Prevention and Control",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "Weekly subnational 14-day notification rate of new COVID-19 cases",
				"SOURCE": "European Center for Disease Prevention and Control",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "COVID- 19 Restriction Measures",
				"SOURCE": "European Center for Disease Prevention and Control",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "FOURESQUARE: COVID-19 Foot Traffic Data (ADX)",
				"SOURCE": "Fouresquare",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "COVID-19 Medicare Analytics Dataset, Full Cohort and Medicare Recipients – FOUO",
				"SOURCE": "Humetrix",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "Repositrak:  Sell Through Stats 2020",
				"SOURCE": "Park City Group",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "Safe Graph Mobility Data",
				"SOURCE": "Safe Graph",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "SouperBowlofCaring - Locations",
				"SOURCE": "SouperBowlofCaring",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "Marathon",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "Small Buisness Pulse Survey",
				"SOURCE": "US Census Bureau",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "Covid-19 Cases in Europe",
				"SOURCE": "WHO",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"LOAD_FREQUENCY": "Weekly",
				"NAME": "State COVID-19 Lock-down and Phase Status Data",
				"SOURCE": "Wikipedia",
				"CLASSIFICATION": "UNCLASSIFIED"
			}
		]
	});	
});

app.get("/dashboard/getAccessTypeReport", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"ACCESS_TYPE": "CUI",
				"NAME": "CMS: Medicare Claims Data - FOUO",
				"SOURCE": "CMS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "CUI",
				"NAME": "CDC RedSky: Global Health Event Data",
				"SOURCE": "GBSP",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "CUI",
				"NAME": "HHS Protect - FOUO",
				"SOURCE": "HHS",
				"CLASSIFICATION": "CUI"
			},
			{
				"ACCESS_TYPE": "FOUO",
				"NAME": "DHS HSIN HIFLD:  FOUO Datasets",
				"SOURCE": "DHS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "FOUO",
				"NAME": "COVID-19 Medicare Analytics Dataset, Full Cohort and Medicare Recipients – FOUO",
				"SOURCE": "Humetrix",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "ACLED",
				"SOURCE": "ACLED",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "US Base Locations",
				"SOURCE": "Air Force",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Apple Maps Mobility Trends Data",
				"SOURCE": "Apple",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Swedish Auto",
				"SOURCE": "AutoTrader",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "County Level Income",
				"SOURCE": "BEA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Employment Statistics, Aggregated by NAICS Code",
				"SOURCE": "BEA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Local Area Unemployment Statistics, 14-month",
				"SOURCE": "BLS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Quarterly Unemployment Statistics",
				"SOURCE": "BLS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "US Imports - Automated Manifest System (AMS) Shipments 2018-2020 (ADX, Enigma)",
				"SOURCE": "CBP",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Social Vulnerability Dataset, 2018",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "COVID-19 Case Surveillance Public Use Data",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Estimated County-Level Prevalence of Selected Underlying Medical Conditions Associated with Increased Risk for Severe COVID-19 Illness — United States, 2018",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Health COVID",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "CDC Provisional COVID-19 Death Counts by Sex, Age, and State",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "CDC COVID-19 Infection and Death Statistics",
				"SOURCE": "CDC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Covid-19 Nursing Home Data (Free and Open)",
				"SOURCE": "CMS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Coronavirus Cases by Race/Ethnicity",
				"SOURCE": "COVID Tracking Project",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Census 2019 US County Geometry Files",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Employment & Payroll by Zip Code, 2010-2016",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "State Level Population Totals",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Food Security Survey, Census 2019",
				"SOURCE": "Census",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "COVID-19 Claims: Explicit Codes and Interim Billing Guidelines (ADX)",
				"SOURCE": "Change Healthcare",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Columbia University - COVID-19 Projections",
				"SOURCE": "Columbia University",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "COVID-19 Daily Infection Statistics",
				"SOURCE": "CoronaDataScraper.com",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "COVID-19 State & County Risk Levels",
				"SOURCE": "CovidActNow.com",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "COVID-19 Case, Hospital, and Death Statistics by State",
				"SOURCE": "CovidTracking.com",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "VA Mental Health Information",
				"SOURCE": "DATA.GOV",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "DHS HSIN HIFLD:  Open Datasets",
				"SOURCE": "DHS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Weekly State Unemployment Claims (539 & 902) (DOL) and LAUS Metro Data",
				"SOURCE": "DOL",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Military Installations, Ranges and Training Areas (MIRTA)",
				"SOURCE": "Data.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "USA Hospital Bed, ICU Bed, Ventilator Data",
				"SOURCE": "Definitive Healthcare",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Summary of epidemic activity indicators in France",
				"SOURCE": "EU Data Portal",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "COV-19: Total (cumulative) number of persons having been infected by district sanitary stations, including laboratories, number of deaths  and tests performed in the Czech Republic",
				"SOURCE": "EU Data Portal",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Coronavirus and School re-opening plans by Districts",
				"SOURCE": "Education Week",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "USA Current Wildfires",
				"SOURCE": "Esri",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Weekly subnational 14-day notification rate of new COVID-19 cases",
				"SOURCE": "European Center for Disease Prevention and Control",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "COVID- 19 Restriction Measures",
				"SOURCE": "European Center for Disease Prevention and Control",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Daily Hospital/ICU  admission rate",
				"SOURCE": "European Center for Disease Prevention and Control",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "NUTS3 Population",
				"SOURCE": "Eurostat",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "FDA Open Data",
				"SOURCE": "FDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "FDA Drug Shortages",
				"SOURCE": "FDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Food Insecurity Data, 2019",
				"SOURCE": "Feeding America",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "MapTheGap",
				"SOURCE": "Feeding America",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Feeding America Locations",
				"SOURCE": "Feeding America",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "FOURESQUARE: COVID-19 Foot Traffic Data (ADX)",
				"SOURCE": "Fouresquare",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Google Community Mobility Reports Data",
				"SOURCE": "Google",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Zip and County Crosswalk Data",
				"SOURCE": "HUD",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Point in time Estimates  of US homeloess population by  US Sate (2001-2019)",
				"SOURCE": "HUD",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Hc1 COVID-9 Local Risk Index (ADX)",
				"SOURCE": "Hc1",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "IHME COVID-19 Projections (Healthdata.org)",
				"SOURCE": "Healthdata.org",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "IRS Tax Return Data, 2017",
				"SOURCE": "IRS",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "JHU: APL COVID Surveillance Dashboard",
				"SOURCE": "JHUAPL",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "JRC (Joint Research Center) COVID-19 Statistics",
				"SOURCE": "JRC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Hospital Beds Per Capita, 2018",
				"SOURCE": "KFF",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Hospital ICU Bed Data and Population Statistics per Bed",
				"SOURCE": "Kaggle",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Status of State Medicaid Expansion Decision",
				"SOURCE": "Kaiser Family Foundation (KFF)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Nursing Home Data",
				"SOURCE": "Medicare.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Hospital Compare",
				"SOURCE": "Medicare.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Medical Physician Compare",
				"SOURCE": "Medicare.gov",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Plants",
				"SOURCE": "Microsoft",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "National Interagency Fire Center - Wildfire Perimeter",
				"SOURCE": "NIFC",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Aadministrative County boundaries of Germany",
				"SOURCE": "NPGEO",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "COVID-19 Cases and Deaths By County (NYTimes)",
				"SOURCE": "NYTimes",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "US College Case Count",
				"SOURCE": "NYTimes",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "National Association of Counties (NAC) - County Policies and Declarations",
				"SOURCE": "National Association of Counties",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Mask Usage by County",
				"SOURCE": "New York Times",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Open Street Maps, North America PBF",
				"SOURCE": "Open Street Maps",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Open Street Maps, Hospital Locations",
				"SOURCE": "Open Street Maps",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Total Deaths and Total Cases for every Country by day worldwide",
				"SOURCE": "Our World in Data",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "OxCGRT - Oxford University COVID Government Response Tracker",
				"SOURCE": "Oxford University",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Safe Graph Mobility Data",
				"SOURCE": "Safe Graph",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Daily confirmed  Cases in Belgium by age group and sex",
				"SOURCE": "Sciensano (Belgium Institute of Health)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Belgium total number of COVID-19 tests performed",
				"SOURCE": "Sciensano (Belgium Institute of Health)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Belgium Mortality Rate by age, date, sex, region",
				"SOURCE": "Sciensano (Belgium Institute of Health)",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Community Vulnerability Index",
				"SOURCE": "Surgo Foundation",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Ionosphere",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Sonar",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Seismic Bumps",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Wine Quality",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Bank Note",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Marathon",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "% of Multigenerational Households",
				"SOURCE": "US Census Bureau",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Small Buisness Pulse Survey",
				"SOURCE": "US Census Bureau",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "US County Level COVID-19 Timeseries Statistics (USAFacts)",
				"SOURCE": "USAFacts",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Farm to School Survey, 2015",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Meat Processing Facility Directory",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Crop Planting and Harvest Schedule",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "USDA Food Hub Directory",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "SNAP - Participation by County (2019)",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "FoodAPS National Household Food Acquisition and Purchase Survey, 2017",
				"SOURCE": "USDA",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Global COVID-19 Travel Restrictions",
				"SOURCE": "United Nations",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "Covid-19 Cases in Europe",
				"SOURCE": "WHO",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Open",
				"NAME": "State COVID-19 Lock-down and Phase Status Data",
				"SOURCE": "Wikipedia",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "ADP City NAICS - SAMPLE",
				"SOURCE": "Equifax",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "Credit Trends - SAMPLE",
				"SOURCE": "Equifax",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "Commercial Firmographics - SAMPLE",
				"SOURCE": "Equifax",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "Repositrak (Park City Group) Sales & Delivery SKU Data, Daily",
				"SOURCE": "Park City Group",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "Repositrak:  Sell Through Stats 2020",
				"SOURCE": "Park City Group",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "RelevantData - Product Supply Metrics - SAMPLE",
				"SOURCE": "RelevantData",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "TRAVAX Data (Shoreland)",
				"SOURCE": "Shoreland",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "SouperBowlofCaring - Locations",
				"SOURCE": "SouperBowlofCaring",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "Military Locations",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "Social Distancing Metrics - SAMPLE",
				"SOURCE": "Unacast",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Procured",
				"NAME": "Activity Feed - SAMPLE",
				"SOURCE": "Unacast",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/tl_2019_us_county/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/ml_scenario/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/installations_ranges/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Test_Files/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChainInstitute/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Mandeley/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/SupplyChain/Brunel/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Geothermal/favorabilitysurface/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/D&BSupplier-ImpliedRiskAtributes/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CommodityTonnage/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Alleyways/Greater_Downtown_Alleys-shp/",
				"SOURCE": null,
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "Zip Code Tabulation Area 2010 Statistics",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Public_Refrigerated_Warehouses/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/military-installations-ranges-and-training-areas/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/Hospitals/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/US-County-Boundaries/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/CLASSIFIED/TestData/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "CLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/PDF/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/JSON/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/OTHER/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			},
			{
				"ACCESS_TYPE": "Unknown",
				"NAME": "/S3-Publish/LOE1/UNCLASSIFIED/CSV/",
				"SOURCE": "UNKNOWN",
				"CLASSIFICATION": "UNCLASSIFIED"
			}
		]
	});	
});

app.get("/dashboard/topDataCardViews", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"DATA_CARD_ID": "6ECB0100AC22B43C170050022EA2A31A",
				"DATASET_NAME": "COVID-19 Hospital Needs and Death Projections",
				"COUNT": 273
			},
			{
				"DATA_CARD_ID": "77F401B0714E9B7F1700480269F90446",
				"DATASET_NAME": "VA Mental Health Information",
				"COUNT": 93
			},
			{
				"DATA_CARD_ID": "9F280100AC22B43C170050022EA2A31A",
				"DATASET_NAME": "COVID-19 Medicare Analytics",
				"COUNT": 89
			}
		]
	});	
});

app.get("/dashboard/topDataSetExports", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"DATA_SET_ID": "ac99796928504dd7a3fd6bbfde054b4f",
				"NAME": "VA Mental Health Information",
				"COUNT": 32
			},
			{
				"DATA_SET_ID": "7021746b0efb449490c0e6c88491ed29",
				"NAME": "Health COVID",
				"COUNT": 9
			},
			{
				"DATA_SET_ID": "dff0f1d6f68043ccba3739a3710d6822",
				"NAME": "ACLED",
				"COUNT": 4
			}
		]
	});	
});

app.get("/dashboard/getDownloadsByMonthReport", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": []
	});	
});

app.get("/data/getDataCardsTotal", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": 61
	});	
});

app.get("/data/getModelCardsTotal", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": 12
	});	
});

app.get("/data/getRejectedNotifications", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": []
	});	
});

app.get("/data/getDownloadsByUser", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": []
	});	
});

app.get("/data/getApproverNotifications", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": []
	});	
});

app.get("/data/downloadDataSet", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": []
	});	
});

app.get("/data/removeDownload", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": []
	});	
});

app.get("/imagery/getImageryFromBucket", (req, res) => {
	let file = req.query.file;
	const r = fs.createReadStream("./marinaUi/images/test/" + file);
	const ps = new stream.PassThrough();
	stream.pipeline(
		r,
		ps,
		(err) => {
			if (err) {
				console.log(err)
				return res.sendStatus(400)
			}
		})
		ps.pipe(res)
});

app.get("/data/getCollaboratePosts", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
		  {
			"COLLABORATE_ID": "1A8F0270F36A799E1700C402C870D044",
			"OBJECT_ID": "866500C0CB9CD49C1700C40210085FCE",
			"OBJECT_TYPE": "MODEL CARD",
			"SENDER": "DEMO",
			"MESSAGE": "This model could use a bit more training to make it more accurate.",
			"MESSAGE_TIMESTAMP": "2021-06-29 10:01:14.401000000",
			"COLLABORATE_REF_ID": null,
			"COLLABORATE_TYPE": "Post",
			"LAST_MOD_TIMESTAMP": "2021-06-29 10:01:14.401000000",
			"REF_SENDER": null
		  },
		  {
			"COLLABORATE_ID": "3F420670FB60BCB21700C402B8B7FD53",
			"OBJECT_ID": "866500C0CB9CD49C1700C40210085FCE",
			"OBJECT_TYPE": "MODEL CARD",
			"SENDER": "DEMO",
			"MESSAGE": "This model looks good.  I plan to use it on some additional training data that is available.  Any tips would be helpful!",
			"MESSAGE_TIMESTAMP": "2021-09-27 03:21:44.154000000",
			"COLLABORATE_REF_ID": null,
			"COLLABORATE_TYPE": "Post",
			"LAST_MOD_TIMESTAMP": "2021-09-27 03:21:44.154000000",
			"REF_SENDER": null
		  },
		  {
			"COLLABORATE_ID": "42AA0070F36A799E1700C402C870D044",
			"OBJECT_ID": "866500C0CB9CD49C1700C40210085FCE",
			"OBJECT_TYPE": "MODEL CARD",
			"SENDER": "DEMO",
			"MESSAGE": "Testing",
			"MESSAGE_TIMESTAMP": "2021-06-13 22:39:55.571000000",
			"COLLABORATE_REF_ID": null,
			"COLLABORATE_TYPE": "Post",
			"LAST_MOD_TIMESTAMP": "2021-06-13 22:39:55.571000000",
			"REF_SENDER": null
		  },
		  {
			"COLLABORATE_ID": "FF8E0270F36A799E1700C402C870D044",
			"OBJECT_ID": "866500C0CB9CD49C1700C40210085FCE",
			"OBJECT_TYPE": "MODEL CARD",
			"SENDER": "DEMO",
			"MESSAGE": "Looks like its working",
			"MESSAGE_TIMESTAMP": "2021-06-29 09:57:14.490000000",
			"COLLABORATE_REF_ID": "42AA0070F36A799E1700C402C870D044",
			"COLLABORATE_TYPE": "Reply",
			"LAST_MOD_TIMESTAMP": "2021-06-29 09:57:14.490000000",
			"REF_SENDER": "DEMO"
		  },
		  {
			"COLLABORATE_ID": "6B6D00A00F40C5D61700C402F32C9AF5",
			"OBJECT_ID": "866500C0CB9CD49C1700C40210085FCE",
			"OBJECT_TYPE": "MODEL CARD",
			"SENDER": "DEMO",
			"MESSAGE": "This model needs a bit of tuning :)",
			"MESSAGE_TIMESTAMP": "2021-12-02 21:45:01.336000000",
			"COLLABORATE_REF_ID": null,
			"COLLABORATE_TYPE": "Post",
			"LAST_MOD_TIMESTAMP": "2021-12-02 21:45:01.336000000",
			"REF_SENDER": null
		  }
		]
	  });	
});

app.get("/data/getDataCardById", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
			"DATA_CARD_ID": "77F401B0714E9B7F1700480269F90446",
			"DATASET_NAME": "VA Mental Health Information",
			"DATASET_SUMMARY": "A collection of data from an online mental health survey used to help identify signs of mental illness and potential suicide in veterans",
			"PRIMARY_POC_NAME": "SAP NS2",
			"PRIMARY_POC_EMAIL": "pathfinder@sapns2.com",
			"PRIMARY_POC_PHONE": "703-555-5555",
			"EXTIMATED_SIZE_GB": "10MB",
			"INDUSTRY_TYPE": "Government",
			"KEY_APPLICATION": "Pattern of Life",
			"INTENDED_USE_CASE": "Intended to be used by analytic models that can determine the most critical factors indicating a threat of mental illness in veterans",
			"PRIMARY_DATA_TYPE": "CSV",
			"DATASET_FUNCTION": "TRAINING,TESTING,OPERATIONAL",
			"DATASET_METADATA_TOTAL_INSTANCES": "",
			"DATASET_METADATA_TOTAL_CLASSES": "",
			"DATASET_METADATA_TOTAL_LABELS": "",
			"DATASET_METADATA_ALGORITM_GEN": "",
			"DATASET_METADATA_USER_CONTRIBUTED": "",
			"DATASET_METADATA_HUMAN_VERIFIED_LABEL": "",
			"CONTENT_NATURE": "Characteristics of veterans both with and without mental illness",
			"EXCLUDED_DATA": "None",
			"PRIVACY_PII": "",
			"CLASSIFICATION": "UNCLASSIFIED",
			"LAST_MOD_DATELICENSE_TYPE": "2021-03-11 00:00:00.000000000",
			"LICENSE_VERSION": "1.0",
			"LICENSE_STATUS": "License Not Required",
			"ACCESS_COST": "N/A",
			"DATA_COLLECTION_METHOD": "Survey Result collection",
			"CLOUD": "AWS",
			"DATA_INTEGRATOR_CARD_ID": "",
			"MAXIMUM_FILE_SIZE_GB": "1GB",
			"JCF_DATA_SOURCE_DMZ": "N/A",
			"JCF_DATA_TARGET_CLEAN": "N/A",
			"TRANS_SPECIAL_REQUESTS": "N/A",
			"SAMPLING_METHODS": "UNSAMPLED",
			"DATA_DISTRIBUTION": "N/A",
			"FILTERING_CRITERIA": "No filtering criteria defined",
			"LABELING_METHODS": "ALGORITHMIC LABELS",
			"LABEL_TYPES_HUMAN": "",
			"LABEL_TYPES_ALGORITHM": "Sequence Labeling",
			"LABEL_SOURCE_HUMAN": "",
			"LABEL_SOURCE_ALGORITHM": "R",
			"LABEL_PROCEDURE_HUMAN": "",
			"LABEL_PROCEDURE_ALGORITHM": "",
			"VALIDATION_METHOD": "NOT APPLICABLE",
			"VALIDATION_TASKS": "N/A",
			"VALIDATION_DESCRIPTION": "N/A",
			"VALIDATION_POLICY_SUMMARY": "N/A",
			"LICENSE_TYPE": "N/A",
			"LICENSE_SUMMARY": "Open source data, no license required",
			"PUBLISHER_NAME": "VA",
			"SOURCE_NAME": "Data.gov online VA Mental Health Survey",
			"DATA_SELECTION": "All data is used",
			"CREATION_USERID": "JHOFFNER",
			"CREATION_TIMESTAMP": "2021-03-19 02:29:33.000000000",
			"IS_APPROVED": 1,
			"WF_ID": "991001F03684983317004802DFA4BD6A",
			"LAST_UPDATED_BY": "DEMO",
			"LAST_UPDATED_TIMESTAMP": "2021-04-26 12:55:33.030000000",
			"DATA_PREVIEW_TABLE": null,
			"STATUTORY_AUTHORIZATION": "",
			"COLLECTION_MECHANISM": "Online survey results collection",
			"DATA_MINIMIZATION": "",
			"PRIVACY_RISK": "Critical PII used to create survey result data needs to be carefully guarded.  Prior to upload any PII contained within survey results has been removed",
			"ETHICS_RISK": "N/A",
			"KEY_APPLICATION_OTHER": "",
			"ESTIMATED_SIZE_OTHER": "",
			"DATASET_FUNCTION_OTHER": "",
			"IS_PRIVACY_PII": "N",
			"PRIMARY_DATA_TYPE_OTHER": "",
			"MAXIMUM_FILE_SIZE_OTHER": "N/A",
			"CLOUD_OTHER": "N/A",
			"SAMPLING_METHODS_OTHER": "",
			"LABELING_METHODS_OTHER": "",
			"VALIDATION_METHODS_OTHER": "",
			"INDUSTRY_TYPE_OTHER": "",
			"CURRENT_STATE": null,
			"CURRENT_STATE_ID": null,
			"ACTION_TAKEN": "APPROVED"
		}
	});	
});

app.get("/imagery/getStreams", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": [
			{
				"ICON": "sap-icon://flight",
				"TYPE": "Active",
				"TITLE": "Reagan National Airport",
				"DECRIPTION": "Washington, DC",
				"ID": "1",
				"URL": "https://www.youtube.com/embed/nPsaWA2HkCY?autoplay=1"
			}, 
			{
				"ICON": "sap-icon://flight",
				"TYPE": "Active",
				"TITLE": "LAX Airport",
				"DECRIPTION": "Los Angeles, CA",
				"ID": "2",
				"URL": "https://www.youtube.com/embed/t0GrpAgdBFI?autoplay=1"
			},
			{
				"ICON": "sap-icon://flight",
				"TYPE": "Active",
				"TITLE": "Dallas Fort Worth Airport",
				"DECRIPTION": "Dallas, TX",
				"ID": "3",
				"URL": "https://www.youtube.com/embed/gZ8qhsdMvTU?autoplay=1"
			},
			{
				"ICON": "sap-icon://building",
				"TYPE": "Active",
				"TITLE": "Times Square",
				"DECRIPTION": "New York, New York",
				"ID": "4",
				"URL": "https://www.youtube.com/embed/AdUw5RdyZxI?autoplay=1"
			},
			{
				"ICON": "sap-icon://BusinessSuiteInAppSymbols/icon-outdoor",
				"TYPE": "Active",
				"TITLE": "Tropical Reef",
				"DECRIPTION": "Aquarium of the Pacific",
				"ID": "5",
				"URL": "https://www.youtube.com/embed/F109TZt3nRc?autoplay=1"
			},
			{
				"ICON": "sap-icon://BusinessSuiteInAppSymbols/icon-outdoor",
				"TYPE": "Active",
				"TITLE": "Waimea Bay",
				"DECRIPTION": "Hawaii",
				"ID": "6",
				"URL": "https://www.youtube.com/embed/wnNrd-VjLsQ?autoplay=1"
			}

		]
	});	
});

app.get("/mgmt/getMyApprovals", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
			results: [
				{
					"CARD_ID": "312400508C6704F41700C402B8B7FD53",
					"CARD_NAME": "Social Vulnerability Dataset, 2018",
					"ACTION_TAKEN": "Not Submitted",
					"ACTION_TIMESTAMP": "2022-03-01 13:23:36.000000000",
					"ICON": "sap-icon://form",
					"WF_NAME": "Data Card"
				}
			],
			total: 1
		}
	});		
});

app.get("/mgmt/getPriorApprovals", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
			results: [
				{
					"CARD_ID": "312400508C6704F41700C402B8B7FD53",
					"CARD_NAME": "Social Vulnerability Dataset, 2018",
					"ACTION_TAKEN": "Not Submitted",
					"ACTION_TIMESTAMP": "2022-03-01 13:23:36.000000000",
					"ICON": "sap-icon://form",
					"WF_NAME": "Data Card"
				}
			],
			total: 1
		}
	});		
});

app.get("/mgmt/getPriorRejections", (req, res) => {
	res.send({
		"status": 200,
		"message": "OK",
		"data": {
			results: [
				{
					"CARD_ID": "312400508C6704F41700C402B8B7FD53",
					"CARD_NAME": "Social Vulnerability Dataset, 2018",
					"ACTION_TAKEN": "Not Submitted",
					"ACTION_TIMESTAMP": "2022-03-01 13:23:36.000000000",
					"ICON": "sap-icon://form",
					"WF_NAME": "Data Card"
				}
			],
			total: 1
		}
	});		
});


//Start the Server
server.on("request", app);
server.listen(port, function () {
	console.info(`HTTP Server: ${server.address().port}`);
});