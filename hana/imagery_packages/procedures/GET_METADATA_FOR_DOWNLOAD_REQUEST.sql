CREATE OR REPLACE PROCEDURE GET_METADATA_FOR_DOWNLOAD_REQUEST
(
	IN OBJECT_TYPE VARCHAR(20),
	IN OBJECT_UUID VARCHAR(36),
	IN INCLUDE_FRAMES BOOLEAN,
	IN INCLUDE_ANNOTATIONS BOOLEAN,
	OUT CLIP_METADATA_LIST TABLE
		(
			BATCH_NAME VARCHAR(200),
			IMAGERY_PACKAGE_NAME VARCHAR(100),
			CLIP_NAME VARCHAR(200),
			CLIP_METADATA_FILE_PATH VARCHAR(800),
			CLIP_FRAME_TELEMETRY_FILE_PATH VARCHAR(800),
			SEQUENCE_CLIP_FILE_PATH VARCHAR(800),
			FILE_SIZE_BYTES BIGINT
		),
	OUT FRAME_METADATA_LIST TABLE
		(
			SEQ_FRAME INTEGER,
			CLIP_NAME VARCHAR(200),
			FRAME_IMAGE_FILE_PATH VARCHAR(800),
			FILE_SIZE_BYTES BIGINT
		),
	OUT ANNOTATIONS_LIST TABLE
		(
			SEQUENCE_CLIP_FILENAME VARCHAR(200),
			SEQUENCE_CLIP_FILENAME_ID VARCHAR(36),
			SEQ_FRAME INTEGER,
			PROJECT_ID VARCHAR(36),
			OBJECT_NAME VARCHAR(100),
			OBJECT_ID VARCHAR(36),
			TRACK_ID VARCHAR(36),
			ANNOTATION_ID VARCHAR(36),
			ANNOTATION_TYPE VARCHAR(20),
			COORDS VARCHAR(400),
			LABEL_ID VARCHAR(36),
			LABEL_NAME VARCHAR(100),
			LABEL_KEY VARCHAR(100),
			IS_KEY_FRAME BOOLEAN
		)
)
LANGUAGE SQLSCRIPT AS
BEGIN

 	DECLARE ObjectTypeNotValid condition for sql_error_code 10002;
	
	DECLARE FRAME_CLIP_UUID VARCHAR(36);
	DECLARE CURRENT_IMAGERY_PACKAGE_UUID VARCHAR(36);
	DECLARE OBJECT_FOUND INTEGER = 0;
	
	if :OBJECT_TYPE = 'FRAME'
	then
		select count(1) into OBJECT_FOUND
		from SEQUENCE_FRAME_VIEW 
		where SEQUENCE_FRAME_UUID = :OBJECT_UUID;
		
		if :OBJECT_FOUND = 1
		then
			FRAME_METADATA_LIST =
				select 
					F.SEQ_FRAME,
					C.CLIP_NAME, 
					F.FRAME_IMAGE_FILE_PATH,
					F.FILE_SIZE_BYTES
				from SEQUENCE_FRAME F
				inner join SEQUENCE_CLIP C 
					on C.SEQUENCE_CLIP_UUID = F.SEQUENCE_CLIP_UUID
				where F.SEQUENCE_FRAME_UUID = :OBJECT_UUID;
				
			CLIP_METADATA_LIST = 
				select 
					C.BATCH_NAME,
					I.IMAGERY_PACKAGE_NAME,
					C.CLIP_NAME,
					C.BATCH_NAME || '/' || C.CLIP_NAME || '/' || CLIP_NAME || '.json' 
						as CLIP_METADATA_FILE_PATH,
					C.BATCH_NAME || '/' || C.CLIP_NAME || '/mapp_metadata/' || CLIP_NAME || '_mapp_metadata.json'  
						as CLIP_FRAME_TELEMETRY_FILE_PATH,
					C.SEQUENCE_CLIP_FILE_PATH,
					C.FILE_SIZE_BYTES
				from SEQUENCE_CLIP C
				inner join SEQUENCE_FRAME F 
					on F.SEQUENCE_CLIP_UUID = C.SEQUENCE_CLIP_UUID
				inner join IMAGERY_PACKAGE_DATA_CARD I
					on I.IMAGERY_PACKAGE_UUID = C.IMAGERY_PACKAGE_UUID 
				where F.SEQUENCE_FRAME_UUID = :OBJECT_UUID;
				
			if :INCLUDE_ANNOTATIONS = true
			then
				ANNOTATIONS_LIST = 
					select
						A.SEQUENCE_CLIP_FILENAME,
						A.SEQUENCE_CLIP_FILENAME_ID,
						A.SEQ_FRAME,
						A.PROJECT_ID,
						A.OBJECT_NAME,
						A.OBJECT_ID,
						A.TRACK_ID,
						A.ANNOTATION_ID,
						A.ANNOTATION_TYPE,
						A.COORDS,
						A.LABEL_ID,
						A.LABEL_NAME,
						A.LABEL_KEY,
						A.IS_KEY_FRAME
					from SEQUENCE_FRAME_TRACK_ANNOTATION A
					where A.SEQUENCE_FRAME_UUID = :OBJECT_UUID
					and A.ANNOTATION_PACKAGE_UUID 
						in ( select ANNOTATION_PACKAGE_UUID 
							 from ANNOTATION_PACKAGE_DATA_CARD 
							 where INSERTION_TIMESTAMP 
								in ( select max(INSERTION_TIMESTAMP) 
									 from ANNOTATION_PACKAGE_DATA_CARD AP
									 inner join SEQUENCE_FRAME_TRACK_ANNOTATION A2 on
										A2.ANNOTATION_PACKAGE_UUID = AP.ANNOTATION_PACKAGE_UUID
									 where A2.SEQUENCE_FRAME_UUID = :OBJECT_UUID 
									 and LOWER(ANNOTATION_SOURCE) = 'annoai'
								   )
						    )
					order by A.SEQUENCE_CLIP_FILENAME, A.TRACK_ID, A.SEQ_FRAME;	 
						
			end if;
		end if;
	elseif :OBJECT_TYPE = 'CLIP'
	then
		select count(1) into OBJECT_FOUND
		from SEQUENCE_CLIP_VIEW 
		where SEQUENCE_CLIP_UUID = :OBJECT_UUID;

		if :OBJECT_FOUND = 1
		then
			if :INCLUDE_FRAMES = TRUE
			then
				FRAME_METADATA_LIST =
					select 
						F.SEQ_FRAME,
						C.CLIP_NAME, 
						F.FRAME_IMAGE_FILE_PATH,
						F.FILE_SIZE_BYTES
					from SEQUENCE_FRAME F
					inner join SEQUENCE_CLIP C 
						on C.SEQUENCE_CLIP_UUID = F.SEQUENCE_CLIP_UUID
					where F.SEQUENCE_CLIP_UUID = :OBJECT_UUID;
			end if;	
				
			CLIP_METADATA_LIST = 
				select 
					C.BATCH_NAME,
					I.IMAGERY_PACKAGE_NAME,
					C.CLIP_NAME,
					C.BATCH_NAME || '/' || C.CLIP_NAME || '/' || CLIP_NAME || '.json'
						as CLIP_METADATA_FILE_PATH,
					C.BATCH_NAME || '/' || C.CLIP_NAME || '/mapp_metadata/' || CLIP_NAME || '_mapp_metadata.json'  
						as CLIP_FRAME_TELEMETRY_FILE_PATH,
					C.SEQUENCE_CLIP_FILE_PATH,
					C.FILE_SIZE_BYTES
				from SEQUENCE_CLIP C
				inner join IMAGERY_PACKAGE_DATA_CARD I
					on I.IMAGERY_PACKAGE_UUID = C.IMAGERY_PACKAGE_UUID 
				where C.SEQUENCE_CLIP_UUID = :OBJECT_UUID;
				
			if :INCLUDE_ANNOTATIONS = true
			then
				ANNOTATIONS_LIST = 
					select
						A.SEQUENCE_CLIP_FILENAME,
						A.SEQUENCE_CLIP_FILENAME_ID,
						A.SEQ_FRAME,
						A.PROJECT_ID,
						A.OBJECT_NAME,
						A.OBJECT_ID,
						A.TRACK_ID,
						A.ANNOTATION_ID,
						A.ANNOTATION_TYPE,
						A.COORDS,
						A.LABEL_ID,
						A.LABEL_NAME,
						A.LABEL_KEY,
						A.IS_KEY_FRAME
					from SEQUENCE_FRAME_TRACK_ANNOTATION A
					inner join SEQUENCE_FRAME F 
						on F.SEQUENCE_FRAME_UUID = A.SEQUENCE_FRAME_UUID
					where F.SEQUENCE_CLIP_UUID = :OBJECT_UUID
					and A.ANNOTATION_PACKAGE_UUID 
						in ( select ANNOTATION_PACKAGE_UUID 
							 from ANNOTATION_PACKAGE_DATA_CARD 
							 where INSERTION_TIMESTAMP 
								in ( select max(INSERTION_TIMESTAMP) 
									 from ANNOTATION_PACKAGE_DATA_CARD AP
									 inner join SEQUENCE_FRAME_TRACK_ANNOTATION A2 on
										A2.ANNOTATION_PACKAGE_UUID = AP.ANNOTATION_PACKAGE_UUID
									 inner join SEQUENCE_FRAME F on
										F.SEQUENCE_FRAME_UUID = A2.SEQUENCE_FRAME_UUID
									 where F.SEQUENCE_CLIP_UUID = :OBJECT_UUID 
									 and LOWER(ANNOTATION_SOURCE) = 'annoai'
								   )
						    )
					order by A.SEQUENCE_CLIP_FILENAME, A.TRACK_ID, A.SEQ_FRAME;	 
						
			end if;
		end if;
	
	elseif :OBJECT_TYPE = 'IMAGERY_PACKAGE'
	then
		select count(1) into OBJECT_FOUND
		from IMAGERY_PACKAGE_DATA_CARD
		where IMAGERY_PACKAGE_UUID = :OBJECT_UUID;

		if :OBJECT_FOUND = 1
		then
			if :INCLUDE_FRAMES = TRUE
				then
				FRAME_METADATA_LIST =
					select 
						F.SEQ_FRAME,
						C.CLIP_NAME,
						F.FRAME_IMAGE_FILE_PATH,
						F.FILE_SIZE_BYTES
					from SEQUENCE_FRAME F
					inner join SEQUENCE_CLIP C 
						on C.SEQUENCE_CLIP_UUID = F.SEQUENCE_CLIP_UUID
					where F.IMAGERY_PACKAGE_UUID = :OBJECT_UUID;
			end if;
				
			CLIP_METADATA_LIST = 
				select 
					C.BATCH_NAME,
					I.IMAGERY_PACKAGE_NAME,
					C.CLIP_NAME,
					C.BATCH_NAME || '/' || C.CLIP_NAME || '/' || CLIP_NAME || '.json'
						as CLIP_METADATA_FILE_PATH,
					C.BATCH_NAME || '/' || C.CLIP_NAME || '/mapp_metadata/' || CLIP_NAME || '_mapp_metadata.json'  
						as CLIP_FRAME_TELEMETRY_FILE_PATH,
					C.SEQUENCE_CLIP_FILE_PATH,
					C.FILE_SIZE_BYTES
				from SEQUENCE_CLIP C
				inner join IMAGERY_PACKAGE_DATA_CARD I
					on I.IMAGERY_PACKAGE_UUID = C.IMAGERY_PACKAGE_UUID 
				where C.IMAGERY_PACKAGE_UUID = :OBJECT_UUID;
				
			if :INCLUDE_ANNOTATIONS = true
			then
				SEQUENCE_CLIP_LATEST_ANNOTATIONS_TIMESTAMP_TBL =
					
					select distinct 
						F.SEQUENCE_CLIP_UUID, 
						MAX(AP.INSERTION_TIMESTAMP) as INSERTION_TIMESTAMP
					from SEQUENCE_FRAME_TRACK_ANNOTATION A
					inner join ANNOTATION_PACKAGE_DATA_CARD AP
						on AP.ANNOTATION_PACKAGE_UUID = A.ANNOTATION_PACKAGE_UUID
					inner join SEQUENCE_FRAME F 
						on F.SEQUENCE_FRAME_UUID = A.SEQUENCE_FRAME_UUID
					where A.IMAGERY_PACKAGE_UUID = :OBJECT_UUID 
					and LOWER(AP.ANNOTATION_SOURCE) = 'annoai'	
					group by
						F.SEQUENCE_CLIP_UUID;
					
				ANNOTATIONS_LIST = 
					select
						A.SEQUENCE_CLIP_FILENAME,
						A.SEQUENCE_CLIP_FILENAME_ID,
						A.SEQ_FRAME,
						A.PROJECT_ID,
						A.OBJECT_NAME,
						A.OBJECT_ID,
						A.TRACK_ID,
						A.ANNOTATION_ID,
						A.ANNOTATION_TYPE,
						A.COORDS,
						A.LABEL_ID,
						A.LABEL_NAME,
						A.LABEL_KEY,
						A.IS_KEY_FRAME
					from SEQUENCE_FRAME_TRACK_ANNOTATION A
					inner join SEQUENCE_FRAME F 
						on F.SEQUENCE_FRAME_UUID = A.SEQUENCE_FRAME_UUID
					inner join :SEQUENCE_CLIP_LATEST_ANNOTATIONS_TIMESTAMP_TBL T
						on F.SEQUENCE_FRAME_UUID = A.SEQUENCE_FRAME_UUID
					inner join ANNOTATION_PACKAGE_DATA_CARD AP
						on AP.ANNOTATION_PACKAGE_UUID = A.ANNOTATION_PACKAGE_UUID
					where A.IMAGERY_PACKAGE_UUID = :OBJECT_UUID
					and F.SEQUENCE_CLIP_UUID = T.SEQUENCE_CLIP_UUID
					and AP.INSERTION_TIMESTAMP = T.INSERTION_TIMESTAMP
					order by A.SEQUENCE_CLIP_FILENAME, A.TRACK_ID, A.SEQ_FRAME;
			end if;
		end if;
	else
		signal ObjectTypeNotValid
			set message_text = ::CURRENT_OBJECT_NAME ||
							   ': Input parameter OBJECT_TYPE contains value "' ||
							   :OBJECT_TYPE ||
							   '" which is not a valid object type. ' ||
							   ' Valid values are : FRAME, CLIP, or IMAGERY_PACKAGE';
	end if;
	
END	