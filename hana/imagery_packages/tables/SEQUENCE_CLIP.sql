CREATE COLUMN TABLE SEQUENCE_CLIP 
(
	SEQUENCE_CLIP_UUID VARCHAR(36) NOT NULL,
	IMAGERY_PACKAGE_UUID VARCHAR(36) NOT NULL,
	CLASSIFICATION     VARCHAR(20) NOT NULL,
	BATCH_NAME VARCHAR(200) NOT NULL,
	CLIP_NAME VARCHAR(200) NOT NULL,
	CLIP_VIDEO_OFFSET_SECONDS INTEGER,
	TE_DESIGNATION VARCHAR(20) NOT NULL,
	START_TIMESTAMP TIMESTAMP,
	END_TIMESTAMP TIMESTAMP,
	MASK_ID INTEGER,
	INSERTION_TIMESTAMP TIMESTAMP,
	SEQUENCE_CLIP_FILE_PATH VARCHAR(200),
	FILE_LAST_MODIFIED_TIMESTAMP TIMESTAMP,
	FILE_SIZE_BYTES BIGINT,
	PRIMARY KEY (SEQUENCE_CLIP_UUID)
);