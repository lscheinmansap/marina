CREATE OR REPLACE PROCEDURE GET_ANNOTATION_REQUESTS_READY_FOR_INGEST
(
	OUT ANNOTATIONS_READY_FOR_INGEST TABLE
			(
				ANNOTATION_PACKAGE_UUID VARCHAR(36),
				IMAGERY_PACKAGE_UUID 	VARCHAR(36),
				SEQUENCE_CLIP_UUID 		VARCHAR(36),
				SEQ_FRAME	 			INTEGER,
				ANNOTATION_SOURCE 		VARCHAR(50),
				ANALYSIS_TYPE 			VARCHAR(20),
				ANNOTATION_FILE_PATH 	VARCHAR(200)
			)
)
LANGUAGE SQLSCRIPT AS
BEGIN

	ANNOTATIONS_READY_FOR_INGEST =
		select 
			R.ANNOTATION_PACKAGE_UUID,
			R.IMAGERY_PACKAGE_UUID,
			R.SEQUENCE_CLIP_UUID,
			R.SEQ_FRAME,
			R.ANNOTATION_SOURCE,
			R.ANALYSIS_TYPE,
			R.ANNOTATION_FILE_PATH
		from ANNOTATION_REQUEST R
		where R.STATUS = 'READY FOR INGEST'
		order by R.STATUS_TIMESTAMP;

END