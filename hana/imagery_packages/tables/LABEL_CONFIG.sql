CREATE COLUMN TABLE LABEL_CONFIG
(
	LABEL_CONFIG_ID		VARCHAR(40) NOT NULL,
	LABEL_NAME			VARCHAR(100) NOT NULL,
	LABEL_COLOR			VARCHAR(50) NOT NULL,
	LABEL_ICON			VARCHAR(300) NOT NULL,
	LABEL_COLOR_B       INTEGER,
	LABEL_COLOR_G       INTEGER,
	LABEL_COLOR_R       INTEGER,
	PRIMARY KEY (LABEL_CONFIG_ID)
) 