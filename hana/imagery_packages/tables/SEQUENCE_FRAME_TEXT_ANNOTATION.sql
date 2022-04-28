CREATE COLUMN TABLE SEQUENCE_FRAME_TEXT_ANNOTATION 
(
	ANNOTATION_UUID VARCHAR(36) NOT NULL,
	ANNOTATION_PACKAGE_UUID VARCHAR(36) NOT NULL,
	IMAGERY_PACKAGE_UUID VARCHAR(36) NOT NULL,
	SEQUENCE_CLIP_UUID VARCHAR(36) NOT NULL,
	SEQUENCE_FRAME_UUID VARCHAR(36) NOT NULL,
	SEQ_FRAME INTEGER,
	DETECTED_TEXT NVARCHAR(5000),
	TEXT_TYPE VARCHAR(20),
	ANNOTATION_TYPE VARCHAR(30) NOT NULL,
	ANNOTATION_GEO_POLYGON ST_GEOMETRY(0),
	ORIGINAL_GEOMETRY_JSON VARCHAR(400) NOT NULL,
	WIDTH_PIXELS INTEGER,
	HEIGHT_PIXELS INTEGER,
	AREA_PIXELS INTEGER,
	OBJECT_NAME VARCHAR(100),
	OBJECT_ID VARCHAR(36),
	TRACK_ID VARCHAR(36),
	LABEL_NAME VARCHAR(100),
	CONFIDENCE INTEGER,
	PRIMARY KEY(ANNOTATION_UUID)
)