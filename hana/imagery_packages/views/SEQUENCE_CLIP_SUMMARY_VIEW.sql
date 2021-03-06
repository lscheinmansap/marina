CREATE VIEW SEQUENCE_CLIP_SUMMARY_VIEW
as
select distinct 
	CV.IMAGERY_PACKAGE_UUID,
	CV.SEQUENCE_CLIP_UUID,
	CV.CLASSIFICATION,
	CV.SEQUENCE_CLIP_FILE_PATH,
	CV.SEQUENCE_CLIP_FILENAME,
	CV.START_TIMESTAMP,
	CV.END_TIMESTAMP,
    FIRST_VALUE (F.FRAME_IMAGE_FILE_PATH order by F.SRC_VIDEO_FRAME) as FIRST_FRAME_FILEPATH,
    count(1) as FRAME_COUNT
from SEQUENCE_CLIP_VIEW CV
inner join SEQUENCE_FRAME F on F.SEQUENCE_CLIP_UUID = CV.SEQUENCE_CLIP_UUID
group by 
	CV.IMAGERY_PACKAGE_UUID,
	CV.SEQUENCE_CLIP_UUID,
	CV.CLASSIFICATION,
	CV.SEQUENCE_CLIP_FILE_PATH,
	CV.SEQUENCE_CLIP_FILENAME,
	CV.START_TIMESTAMP,
	CV.END_TIMESTAMP
	