CREATE FUNCTION GET_DS_ID_FUNC(TEXT nvarchar(5000))
RETURNS DATA_SET
LANGUAGE SQLSCRIPT READS SQL DATA 
AS
BEGIN
  declare _text nvarchar(100);
  declare _path nvarchar(100);
  declare _ds nvarchar(32);
  declare _rowcount integer;
  declare _ofset integer;
  declare _index integer;
  _text := :TEXT;
  _ds := '0';
  _index := -1;
  
  WHILE LOCATE(:_text,'/', :_index) > 0 DO
     select LOCATE (:_text, '/', :_index) into _ofset from dummy;
     select SUBSTRING (:_text,0, :_ofset) into _path from dummy;
     select count(*) into _rowcount FROM DATA_SET WHERE DATANODE_PATH = :_path; 
     IF :_rowcount = 1 THEN 
         _ds := :_path;
         BREAK;
     ELSE
         _index := :_index - 1;
     END IF;
  END WHILE; 
  RETURN select * FROM DATA_SET WHERE DATANODE_PATH = :_path;  
END; 
