CREATE OR REPLACE PROCEDURE GET_IMAGERY_PACKAGES_SUMMARY_STATISTICS
(
	OUT SUMMARY_COUNTS TABLE 
	(
		IMAGERY_PACKAGE_COUNT BIGINT,
		ANNOTATION_PACKAGE_COUNT BIGINT,
		SEQUENCE_CLIP_COUNT BIGINT,
		SEQUENCE_FRAME_COUNT BIGINT,
		IMAGERY_TYPE_COUNT BIGINT,
		SENSOR_TYPE_COUNT BIGINT,
		OBJECT_CATEGORIES_COUNT BIGINT,
		FMV_VIDEO_COUNT BIGINT
	),
	OUT IMAGERY_PACKAGES_STATS TABLE 
	(
		IMAGERY_PACKAGE_TYPE VARCHAR(20),
		IMAGERY_PACKAGE_COUNT BIGINT,
		ANNOTATION_PACKAGE_COUNT BIGINT
	),
	OUT FMV_PACKAGES_STATS TABLE
	(
		PACKAGE_COUNT BIGINT,
		CLIP_COUNT BIGINT,
		FRAME_COUNT BIGINT,
		AVG_FRAMES_PER_FMV_PACKAGE DECIMAL,
		AVG_CLIPS_PER_FMV_PACKAGE DECIMAL
	),
	OUT ANNOTATION_LABEL_STATS TABLE
	(
		LABEL_CATEGORY VARCHAR(100),
		ANNOTATION_COUNT BIGINT,
		ANNOTATION_CLIP_COUNT BIGINT,
		ANNOTATION_FRAME_COUNT BIGINT,
		UNIQUE_OBJECT_COUNT BIGINT,
		PERCENTAGE_OF_ALL_ANNOTATIONS DECIMAL,
		PERCENTAGE_OF_ALL_CLIPS DECIMAL,
		PERCENTAGE_OF_ALL_FRAMES DECIMAL	
	),
	OUT SEQUENCE_FRAMES_HEATMAP TABLE
	(
		CLUSTER_CENTER_POINT_WKT VARCHAR(50),
		LON DOUBLE,
		LAT DOUBLE,
		COUNTER BIGINT
	) 
	--, OUT ANNOTATIONS_HEATMAP TABLE
	--(
	--	CLUSTER_CENTER_POINT_WKT VARCHAR(50),
	--	LON DOUBLE,
	--	LAT DOUBLE,
	--	COUNTER BIGINT
	--)
)
LANGUAGE SQLSCRIPT AS
BEGIN
	
	SUMMARY_COUNTS =
	select 
		IMAGERY_PACKAGE_COUNT,
		ANNOTATION_PACKAGE_COUNT,
		SEQUENCE_CLIP_COUNT,
		SEQUENCE_FRAME_COUNT,
		IMAGERY_TYPE_COUNT,
		SENSOR_TYPE_COUNT,
		OBJECT_CATEGORIES_COUNT,
		FMV_VIDEO_COUNT
	from
	(
		select count(1) as IMAGERY_PACKAGE_COUNT,
               count(distinct IMAGERY_PACKAGE_TYPE) as IMAGERY_TYPE_COUNT
		from IMAGERY_PACKAGE_DATA_CARD
	),
	(
		select count(distinct ANNOTATION_PACKAGE_UUID) as ANNOTATION_PACKAGE_COUNT,
               count(distinct LABEL_NAME) as OBJECT_CATEGORIES_COUNT		
		from SEQUENCE_FRAME_TRACK_ANNOTATION
	),
	(
		select count(1) as SEQUENCE_CLIP_COUNT from SEQUENCE_CLIP
	),
	(
		select count(1) as SEQUENCE_FRAME_COUNT,
			   count(distinct IMAGE_SOURCE_SENSOR) as SENSOR_TYPE_COUNT
		from SEQUENCE_FRAME
	),
	(
		select count(1) as FMV_VIDEO_COUNT
		from IMAGERY_PACKAGE_DATA_CARD
		where IMAGERY_PACKAGE_TYPE = 'FMV'
	);
	
	
	IMAGERY_PACKAGES_STATS =
		select distinct 
			I.IMAGERY_PACKAGE_TYPE,
			count(distinct I.IMAGERY_PACKAGE_UUID) as IMAGERY_PACKAGE_COUNT, 
			count(distinct A.ANNOTATION_PACKAGE_UUID) as ANNOTATION_PACKAGE_COUNT
		from IMAGERY_PACKAGE_DATA_CARD I
		left join SEQUENCE_FRAME_TRACK_ANNOTATION A 
			on A.IMAGERY_PACKAGE_UUID = I.IMAGERY_PACKAGE_UUID
		group by I.IMAGERY_PACKAGE_TYPE;
		
	FMV_PACKAGES_STATS =
		select 
			PACKAGE_COUNT, 
			CLIP_COUNT, 
			FRAME_COUNT,
			FRAME_COUNT / PACKAGE_COUNT as AVG_FRAMES_PER_FMV_PACKAGE,
			CLIP_COUNT / PACKAGE_COUNT as AVG_CLIPS_PER_FMV_PACKAGE
		from 
			(
				select 
					count(distinct IMAGERY_PACKAGE_UUID) as PACKAGE_COUNT,
					count(distinct SEQUENCE_CLIP_UUID) as CLIP_COUNT,
					count(1) as FRAME_COUNT
				from SEQUENCE_FRAME
			);
		
	ANNOTATION_LABEL_STATS =
		select
			LABEL_CATEGORY,
			ANNOTATION_COUNT,
			ANNOTATION_CLIP_COUNT,
			ANNOTATION_FRAME_COUNT,
			UNIQUE_OBJECT_COUNT,
			ANNOTATION_COUNT / TOTAL_ANNOTATION_COUNT as PERCENTAGE_OF_ALL_ANNOTATIONS,
			ANNOTATION_CLIP_COUNT / CLIP_COUNT as PERCENTAGE_OF_ALL_CLIPS,
			ANNOTATION_FRAME_COUNT / FRAME_COUNT as PERCENTAGE_OF_ALL_FRAMES
		from
			(
				select 
					distinct A.LABEL_NAME as LABEL_CATEGORY,
					count(1) as ANNOTATION_COUNT,
					count(distinct F.SEQUENCE_CLIP_UUID) as ANNOTATION_CLIP_COUNT,
					count(distinct A.SEQUENCE_FRAME_UUID) as ANNOTATION_FRAME_COUNT,
					count(distinct A.OBJECT_ID) as UNIQUE_OBJECT_COUNT
				from SEQUENCE_FRAME_TRACK_ANNOTATION A
				inner join SEQUENCE_FRAME F 
					on F.SEQUENCE_FRAME_UUID = A.SEQUENCE_FRAME_UUID
				group by A.LABEL_NAME
			),
		    :FMV_PACKAGES_STATS,
			(select count(1) as TOTAL_ANNOTATION_COUNT 
			 from SEQUENCE_FRAME_TRACK_ANNOTATION);
	
	SEQUENCE_FRAMES_HEATMAP =
		select 
			CAST(ST_ClusterCentroid().ST_ASWKT() as VARCHAR(50)) 
				AS CLUSTER_CENTER_POINT_WKT,
			ST_ClusterCentroid().ST_X() as LON, 
			ST_ClusterCentroid().ST_Y() as LAT, 
			count(1) as COUNTER
		from SEQUENCE_FRAME
		where FRAME_CENTER_GEO_POINT is not null
		group cluster by FRAME_CENTER_GEO_POINT 
		using KMEANS CLUSTERS 1024;
	/*	
	 * Removed this as it isn't currently used and takes a long time
	ANNOTATIONS_HEATMAP =
		select 
			CAST(ST_ClusterCentroid().ST_ASWKT() as VARCHAR(50)) 
				AS CLUSTER_CENTER_POINT_WKT,
			ST_ClusterCentroid().ST_X() as LON, 
			ST_ClusterCentroid().ST_Y() as LAT, 
			count(1) as COUNTER
		from SEQUENCE_FRAME F
		inner join SEQUENCE_FRAME_TRACK_ANNOTATION A
			on F.SEQUENCE_FRAME_UUID = A.SEQUENCE_FRAME_UUID
		where FRAME_CENTER_GEO_POINT is not null
		group cluster by F.FRAME_CENTER_GEO_POINT 
		using KMEANS CLUSTERS 1024;
	*/
END