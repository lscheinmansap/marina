CREATE VIEW SEQUENCE_CLIP_ANNOTATION_VIEW 
AS 
select
	CV.SEQUENCE_CLIP_UUID,
	F.SEQUENCE_FRAME_UUID,
	A.ANNOTATION_UUID,
	CV.SEQUENCE_CLIP_FILENAME,
	F.SEQ_FRAME,
	A.OBJECT_NAME,
	A.LABEL_NAME 
from SEQUENCE_FRAME F 
inner join SEQUENCE_CLIP_VIEW CV on CV.SEQUENCE_CLIP_UUID = F.SEQUENCE_CLIP_UUID 
inner join SEQUENCE_FRAME_TRACK_ANNOTATION A on A.SEQUENCE_FRAME_UUID = F.SEQUENCE_FRAME_UUID 