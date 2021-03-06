CREATE OR REPLACE PROCEDURE GET_FMV_IMAGERY_PACKAGE_DATA_CARD_INFO
(
	IN IN_IMAGERY_PACKAGE_UUID VARCHAR(40),
	OUT IMAGERY_DATA_CARD_METADATA TABLE
		(
			IMAGERY_PACKAGE_UUID VARCHAR(36),
			CLASSIFICATION VARCHAR(20),
			IMAGERY_PACKAGE_TYPE VARCHAR(20),
			IMAGERY_PACKAGE_NAME VARCHAR(100),
			IMAGERY_PACKAGE_DESCRIPTION VARCHAR(1000),
			INSERTION_TIMESTAMP TIMESTAMP,
			TE_DESIGNATION VARCHAR(20),
			IMAGERY_START_TIME_STAMP TIMESTAMP,
			IMAGERY_END_TIME_STAMP TIMESTAMP,
			DURATION_SECONDS DOUBLE,
			FIRST_FRAME_FILEPATH VARCHAR(800),
			CLIP_COUNT BIGINT,
			FRAME_COUNT BIGINT,
			IMAGERY_PACKAGE_GEO_AREA_GEOJSON CLOB
			
		),
	OUT VIDEO_METADATA TABLE
		(
			IMAGERY_PACKAGE_UUID VARCHAR(36),
			CLASSIFICATION VARCHAR(20),
			DERIVATION_TYPE VARCHAR(50),
			ORIGIN_ID VARCHAR(100),
			SRC_RECORD_KEY BIGINT,
			CODEC_NAME VARCHAR(20),
			HEIGHT INTEGER,
			WIDTH INTEGER,
			PIX_FMT VARCHAR(20),
			BIT_RATE INTEGER,
			DURATION_SECONDS DOUBLE,
			BITS_PER_RAW_SAMPLE INTEGER,
			KLV_NAME VARCHAR(20),
			FRAME_COUNT INTEGER,
			STREAM_COUNT INTEGER,
			FORMAT_NAME VARCHAR(50),
			FPS DOUBLE,
			VIDEO_SIZE_BYTES BIGINT,
			INSERTION_TIMESTAMP TIMESTAMP
		),
	OUT FRAME_CENTER_TRACK TABLE
		(
			SRC_VIDEO_FRAME INTEGER,
			FRAME_CENTER_LON DOUBLE,
			FRAME_CENTER_LAT DOUBLE
		),
	OUT SENSOR_TRACK TABLE
		(
			SRC_VIDEO_FRAME INTEGER,
			SENSOR_LON DOUBLE,
			SENSOR_LAT DOUBLE
		),
	OUT ANNOTATION_PACKAGES TABLE
		(
			ANNOTATION_PACKAGE_UUID VARCHAR(36),
			CLASSIFICATION VARCHAR(20),
			INSERTION_TIMESTAMP TIMESTAMP,
			ANNOTATION_FILE_PATH VARCHAR(400),
			ANNOTATION_SOURCE VARCHAR(50),
			ANNOTATION_COUNT BIGINT,
			OBJECT_COUNT BIGINT
		),
	OUT ANNOTATION_PACKAGE_LABEL_TYPE_STATS TABLE
		(
			ANNOTATION_PACKAGE_UUID VARCHAR(40),
			LABEL_NAME VARCHAR(100),
			LABEL_ANNOTATION_COUNT BIGINT,
			LABEL_OBJECT_COUNT BIGINT
		),
	OUT SENSOR_INFO TABLE
		(
			IMAGERY_PACKAGE_UUID VARCHAR(40),
			MISSION_ID VARCHAR(50), 
			TAIL_NUMBER VARCHAR(100), 
			PLATFORM_TYPE VARCHAR(100),
			MIN_SENSOR_TRUE_ALTITUDE DOUBLE,
			MAX_SENSOR_TRUE_ALTITUDE DOUBLE,		
			MIN_SENSOR_RELATIVE_PITCH_ANGLE DOUBLE,
			MAX_SENSOR_RELATIVE_PITCH_ANGLE DOUBLE,
			MIN_SENSOR_RELATIVE_ROLL_ANGLE DOUBLE,
			MAX_SENSOR_RELATIVE_ROLL_ANGLE DOUBLE,
			MIN_PLATFORM_GROUND_SPEED DOUBLE, 
			MAX_PLATFORM_GROUND_SPEED DOUBLE,
			MIN_PLATFORM_HEADING DOUBLE, 
			MAX_PLATFORM_HEADING DOUBLE,
			MIN_PLATFORM_TRUE_AIRSPEED DOUBLE,
			MAX_PLATFORM_TRUE_AIRSPEED DOUBLE,		
			MIN_PLATFORM_PITCH_ANGLE DOUBLE,
			MAX_PLATFORM_PITCH_ANGLE DOUBLE,
			IMAGE_SOURCE_SENSOR VARCHAR(5000)
		)
)
LANGUAGE SQLSCRIPT AS
BEGIN
	DECLARE IMAGERY_PACKAGE_GEO_AREA_STR CLOB;
	
	select ST_ConvexHullAggr(FRAME_CENTER_GEO_POINT).ST_AsGeoJSON()
	into IMAGERY_PACKAGE_GEO_AREA_STR
	from SEQUENCE_FRAME 
	where IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID;
	
	
	-- IMAGERY DATA CARD METADATA
	IMAGERY_DATA_CARD_METADATA =
		select 
			V.*, 
			:IMAGERY_PACKAGE_GEO_AREA_STR as IMAGERY_PACKAGE_GEO_AREA_GEOJSON
		from IMAGERY_PACKAGE_SUMMARY_VIEW V
		where V.IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID;
	
	-- VIDEO METADATA INCLUDING COUNT OF CLIPS AND FRAMES
	VIDEO_METADATA =
		select 
			IMAGERY_PACKAGE_UUID,
			CLASSIFICATION,
			DERIVATION_TYPE,
			ORIGIN_ID,
			SRC_RECORD_KEY,
			CODEC_NAME,
			HEIGHT ,
			WIDTH ,
			PIX_FMT ,
			BIT_RATE ,
			DURATION_SECONDS ,
			BITS_PER_RAW_SAMPLE ,
			KLV_NAME,
			FRAME_COUNT ,
			STREAM_COUNT ,
			FORMAT_NAME,
			FPS ,
			VIDEO_SIZE_BYTES ,
			INSERTION_TIMESTAMP 
		from VIDEO 
		where IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID;
		
	-- TRACK OF CENTER POINT OF FRAMES
	-- We do not include all frame centerpoints. Only include the center points for
	-- the first frame in each clip of the video and the centerpoint of the last frame 
	-- of the video. NOTE: This could be mileading if there are clips for the video that
	-- are not stored in the system.
	FRAME_CENTER_TRACK =
		select 
			SRC_VIDEO_FRAME,
			FRAME_CENTER_LON, 
			FRAME_CENTER_LAT
		from SEQUENCE_FRAME
		where IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID
		and ( SEQ_FRAME = 1
		      OR
			  SRC_VIDEO_FRAME in (select max(SRC_VIDEO_FRAME)
			                from SEQUENCE_FRAME 
							where IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID
			               )
            )
		and FRAME_CENTER_LON is not null
		and FRAME_CENTER_LAT is not null
		order by SRC_VIDEO_FRAME;
		
	-- TRACK OF SENSOR PLATFORM LOCATION
	-- We do not include all sensor locations. Only include the sensor location for
	-- the first frame in each clip of the video and the sensor location for last frame 
	-- of the video. NOTE: This could be mileading if there are clips for the video that
	-- are not stored in the system.
	SENSOR_TRACK =
		select 
			SRC_VIDEO_FRAME,
			SENSOR_LON, 
			SENSOR_LAT
		from SEQUENCE_FRAME
		where IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID
		and ( SEQ_FRAME = 1
		      OR
			  SRC_VIDEO_FRAME in (select max(SRC_VIDEO_FRAME)
			                from SEQUENCE_FRAME 
							where IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID
			               )
            )
		and SENSOR_LON is not null
		and SENSOR_LAT is not null			
		order by SRC_VIDEO_FRAME;	
		
	-- ANNOTATION_PACKAGES INCLUDING # OF SEQUENCE_CLIPS AND 
	-- SEQUENCE_FRAMES WITH ANNOTATIONS
	ANNOTATION_PACKAGES =
		select distinct 
			C.ANNOTATION_PACKAGE_UUID,
			C.CLASSIFICATION,
			C.INSERTION_TIMESTAMP,
			C.ANNOTATION_FILE_PATH,
			C.ANNOTATION_SOURCE,
			count(1) as ANNOTATION_COUNT,
			count(distinct A.OBJECT_ID) as OBJECT_COUNT
		from ANNOTATION_PACKAGE_DATA_CARD C
		inner join SEQUENCE_FRAME_TRACK_ANNOTATION A
			on A.ANNOTATION_PACKAGE_UUID = C.ANNOTATION_PACKAGE_UUID
		where A.IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID
		group by 
			C.ANNOTATION_PACKAGE_UUID,
			C.CLASSIFICATION,
			C.INSERTION_TIMESTAMP,
			C.ANNOTATION_FILE_PATH,
			C.ANNOTATION_SOURCE;
	
	-- FOR EACH ANNOTATION PACKAGE NUMBER OF OBJECTS OF EACH LABEL TYPE
	-- AND NUMBER OF OCCURANCES OF EACH TYPE
	ANNOTATION_PACKAGE_LABEL_TYPE_STATS =
		select distinct
		ANNOTATION_PACKAGE_UUID,
		LABEL_NAME, 
		count(1) as LABEL_ANNOTATION_COUNT,
		count(distinct OBJECT_ID) LABEL_OBJECT_COUNT
		from SEQUENCE_FRAME_TRACK_ANNOTATION
		where IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID
		group by 
			ANNOTATION_PACKAGE_UUID,
			LABEL_NAME;
			
	SENSOR_INFO = 
		select distinct 
			F.*,
			A.IMAGE_SOURCE_SENSOR 
		from 
		(
			select distinct
				IMAGERY_PACKAGE_UUID,
				MISSION_ID, 
				TAIL_NUMBER, 
				PLATFORM_TYPE,
				min(SENSOR_TRUE_ALTITUDE) as MIN_SENSOR_TRUE_ALTITUDE,
				max(SENSOR_TRUE_ALTITUDE) as MAX_SENSOR_TRUE_ALTITUDE,		
				min(SENSOR_RELATIVE_PITCH_ANGLE) as MIN_SENSOR_RELATIVE_PITCH_ANGLE,
				max(SENSOR_RELATIVE_PITCH_ANGLE) as MAX_SENSOR_RELATIVE_PITCH_ANGLE,
				min(SENSOR_RELATIVE_ROLL_ANGLE) as MIN_SENSOR_RELATIVE_ROLL_ANGLE,
				max(SENSOR_RELATIVE_ROLL_ANGLE) as MAX_SENSOR_RELATIVE_ROLL_ANGLE,
				min(PLATFORM_GROUND_SPEED) as MIN_PLATFORM_GROUND_SPEED, 
				max(PLATFORM_GROUND_SPEED) as MAX_PLATFORM_GROUND_SPEED,
				min(PLATFORM_HEADING) as MIN_PLATFORM_HEADING, 
				max(PLATFORM_HEADING) as MAX_PLATFORM_HEADING,
				min(PLATFORM_TRUE_AIRSPEED) as MIN_PLATFORM_TRUE_AIRSPEED,
				max(PLATFORM_TRUE_AIRSPEED) as MAX_PLATFORM_TRUE_AIRSPEED,		
				min(PLATFORM_PITCH_ANGLE) as MIN_PLATFORM_PITCH_ANGLE,
				max(PLATFORM_PITCH_ANGLE) as MAX_PLATFORM_PITCH_ANGLE		
			from SEQUENCE_FRAME
			where IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID
			group by
				IMAGERY_PACKAGE_UUID,
				MISSION_ID, 
				TAIL_NUMBER, 
				PLATFORM_TYPE			
		) as F
		inner join
		(
			select
				IMAGERY_PACKAGE_UUID,
				STRING_AGG(IMAGE_SOURCE_SENSOR, ', ' order by IMAGE_SOURCE_SENSOR)
				as IMAGE_SOURCE_SENSOR 
			from
			(
				select distinct 
					IMAGERY_PACKAGE_UUID,
					IMAGE_SOURCE_SENSOR
				from SEQUENCE_FRAME
				where IMAGERY_PACKAGE_UUID = :IN_IMAGERY_PACKAGE_UUID
			)
			group by IMAGERY_PACKAGE_UUID
		) as A on A.IMAGERY_PACKAGE_UUID = F.IMAGERY_PACKAGE_UUID;

END