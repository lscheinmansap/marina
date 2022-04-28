CREATE OR REPLACE FUNCTION FN_SPLIT_LIST_STRING
(
	IN_STRING NVARCHAR(5000), 
	IN_DELIMITER VARCHAR(1)
)
RETURNS TABLE (VAL NVARCHAR(5000)) 
AS
BEGIN 
    DECLARE v_out NVARCHAR(5000):='';
    DECLARE v_count INTEGER:=1;
    DECLARE v_substr NVARCHAR(5000):='';
    DECLARE v_substr2 NVARCHAR(5000):='';
    DECLARE VAL NVARCHAR(5000) array;
	
    v_substr := :IN_STRING; 
 
    while(LOCATE (:v_substr, :IN_DELIMITER) > 0 ) do
 
        -- find value
        v_out := TRIM(SUBSTR(v_substr, 0, LOCATE (:v_substr, :IN_DELIMITER) - 1 ));
 
        -- out to output
        val[v_count]:=v_out;
 
        -- increment counter
        v_count:=:v_count+1;
 
        -- new substring for search
        v_substr2 := SUBSTR(:v_substr, LOCATE (:v_substr, :IN_DELIMITER) + 1, LENGTH(:v_substr));
        v_substr := v_substr2;
 
    END while;
 
    IF(LOCATE (:v_substr, :IN_DELIMITER) = 0 AND LENGTH(TRIM(:v_substr)) > 0) THEN
        -- no delimiter in string
        val[v_count]:=TRIM(v_substr);
 
    END IF;
 
    -- convert array of list values to a table variable and return
    rst = unnest(:VAL) AS ("VAL");
    RETURN SELECT * FROM :rst;
END;