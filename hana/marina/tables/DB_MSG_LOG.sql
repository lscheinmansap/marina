CREATE COLUMN TABLE "DB_MSG_LOG" (
	 "GRAPH_NAME" VARCHAR(100) NOT NULL ,
	 "OPERATOR_NAME" VARCHAR(100) NOT NULL ,
	 "MESSAGE_TIMESTAMP" TIMESTAMP NOT NULL ,
	 "MESSAGE_GROUP_NAME" VARCHAR(200),
	 "MESSAGE_LEVEL" VARCHAR(10),
	 "MESSAGE" VARCHAR(5000))  