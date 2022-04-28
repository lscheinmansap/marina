CREATE VIEW SEQUENCE_CLIP_VIEW 
AS select
    V.DERIVATION_TYPE,
	V.ORIGIN_ID,
	V.SRC_RECORD_KEY,
	V.CODEC_NAME,
	V.HEIGHT,
	V.WIDTH,
	V.PIX_FMT,
	V.BIT_RATE,
	V.DURATION_SECONDS,
	V.BITS_PER_RAW_SAMPLE,
	V.KLV_NAME,
	V.FRAME_COUNT,
	V.STREAM_COUNT,
	V.FORMAT_NAME,
	V.FPS,
	V.VIDEO_SIZE_BYTES,
	C.*,
	C.CLIP_NAME || '.mp4' as SEQUENCE_CLIP_FILENAME
from SEQUENCE_CLIP C inner join
VIDEO V on V.IMAGERY_PACKAGE_UUID = C.IMAGERY_PACKAGE_UUID
	