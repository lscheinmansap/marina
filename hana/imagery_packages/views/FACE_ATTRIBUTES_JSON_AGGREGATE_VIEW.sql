create view FACE_ATTRIBUTES_JSON_AGGREGATE_VIEW as
select ANNOTATION_UUID, 
       '[' || STRING_AGG(
			'{ "attribute": "' || FACE_ATTRIBUTE_VALUE || '", ' ||
            '"confidence": ' || CONFIDENCE || 
			'}',', ') || ']' as "FACE_ATTRIBUTES_AS_JSON"
from SEQUENCE_FRAME_FACE_ANNOTATION_ATTRIBUTE
group by ANNOTATION_UUID