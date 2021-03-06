CREATE OR REPLACE PROCEDURE CREATE_ANNOTATION_REQUEST
(
	IN IMAGERY_PACKAGE_UUID VARCHAR(36),
	IN SEQUENCE_CLIP_UUID	VARCHAR(36),
	IN SEQ_FRAME       INTEGER,
	IN ANNOTATION_SOURCE    VARCHAR(50),
	IN ANALYSIS_TYPE		VARCHAR(20),
	IN USERNAME				VARCHAR(40),
	OUT NEW_ANNOTATION_PACKAGE_UUID VARCHAR(36)
)
LANGUAGE SQLSCRIPT AS
BEGIN

	-- Another process reads this table and initiates the actual 
	-- request for annotation.
	NEW_ANNOTATION_PACKAGE_UUID = SYSUUID;
	

	insert into ANNOTATION_REQUEST 
	(
		ANNOTATION_PACKAGE_UUID,
		IMAGERY_PACKAGE_UUID,
		SEQUENCE_CLIP_UUID,
		SEQ_FRAME,
		ANNOTATION_SOURCE,
		ANALYSIS_TYPE,
		USERNAME,
		INSERTION_TIMESTAMP,
		STATUS,
		STATUS_TIMESTAMP,
		STATUS_MESSAGE
	)
	values
	(
		:NEW_ANNOTATION_PACKAGE_UUID,
		:IMAGERY_PACKAGE_UUID,
		:SEQUENCE_CLIP_UUID,
		:SEQ_FRAME,
		:ANNOTATION_SOURCE,
		:ANALYSIS_TYPE,
		:USERNAME,
		CURRENT_TIMESTAMP,
		'NEW',
		CURRENT_TIMESTAMP,
		'new request'
	);
	
END;