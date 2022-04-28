CREATE COLUMN TABLE ANNOTATION_PACKAGE_DATA_CARD
(
	ANNOTATION_PACKAGE_UUID VARCHAR(36) NOT NULL,
	CLASSIFICATION VARCHAR(20) NOT NULL,
	INSERTION_TIMESTAMP TIMESTAMP NOT NULL,
	ANNOTATION_FILE_PATH VARCHAR(400) NOT NULL,
	ANNOTATION_SOURCE VARCHAR(50),
	ANALYSIS_TYPE VARCHAR(20),
	PRIMARY KEY (ANNOTATION_PACKAGE_UUID)
);