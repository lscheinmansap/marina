CREATE COLUMN TABLE SEQUENCE_CLIP_FRAME_LABEL 
(
	ANNOTATION_UUID VARCHAR(36) NOT NULL,
	ANNOTATION_PACKAGE_UUID VARCHAR(36) NOT NULL,
	LABEL NVARCHAR(100) NOT NULL,
	CONFIDENCE INTEGER,
	SEQUENCE_CLIP_UUID VARCHAR(36),
	SEQ_FRAME INTEGER,
	OFFSET_MILLISECONDS INTEGER,
	PRIMARY KEY(ANNOTATION_UUID)
)