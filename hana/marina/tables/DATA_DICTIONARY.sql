CREATE COLUMN TABLE DATA_DICTIONARY
(
	"RRC" 				INTEGER,
  "DATA_FILE_ID" 		NVARCHAR(32),
	"FILE_NAME" 		VARCHAR(2000),
	"COLUMN" 			VARCHAR(2000),
	"CTYPE" 			VARCHAR(256),
	"LAST_MOD_DATE" 	TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY ("RRC",	"DATA_FILE_ID")
) 
