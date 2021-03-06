CREATE OR REPLACE PROCEDURE ADD_FMV_IMAGERY_PACKAGE_DATA_CARD
(
	IN  IMAGERY_PACKAGE_UUID  VARCHAR(36),
	IN  BATCH_NAME 			  VARCHAR(200),
	IN IMAGERY_PACKAGE_NAME VARCHAR(100)
)
LANGUAGE SQLSCRIPT AS
BEGIN
	
	insert into IMAGERY_PACKAGE_DATA_CARD
	(
		IMAGERY_PACKAGE_UUID,
		IMAGERY_PACKAGE_NAME,
		CLASSIFICATION,
		INSERTION_TIMESTAMP,
		BATCH_NAME,
		IMAGERY_PACKAGE_TYPE,
		TE_DESIGNATION
	)
	values
	(
		:IMAGERY_PACKAGE_UUID,
		:IMAGERY_PACKAGE_NAME,
		'Unclassified',
		CURRENT_TIMESTAMP,
		:BATCH_NAME,
		'FMV',
		'UNASSIGNED'
	);

END;