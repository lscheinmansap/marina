#!/bin/bash 
#
# Name: load_schema.sh
#
# Description: 
#      This script is used to install a database schema 
#      into HANA given the generic structure of sub-directories
#      for tables, procedures, views, table types, etc....
#      The order of creating objects is important. The order
#      is tables, indexes, table types, views, then procedures.
#      Further more, for views and procedures, their order as 
#      relates to other objects is important. For instance, 
#      a procedure may call another procedure so the called 
#      procedure must be created first. So to facilitate this 
#      ordering, there is a file called load_order.txt
#      in the procedures sub-directory. The procedures are listed
#      in this file in the order they are to be created. 
#
# Usage: install_tha_sidecar_schema.sh [-U<HANA user>] 
#                                      [-P<HANA password>] 
#									   [-H<HANA Host>]
#                                      [-D<HANA DB>]
#                                      [-S<HANA Schema>]
#                                      [-I<HANA Instance>]
#
# History:
# 
# Date            Name            Comments
# ----------      --------        -------------------------------------------
# 07/31/2020	  Don Howe	      Created
#==========================================================================

#
#Read in command line arguments
#
USER=
PASSWORD=
HOST=
DB=HDB
SCHEMA=
INSTANCE="00"
printusage=0

while getopts ":U:P:H:D:S:I:" opt; do
	case ${opt} in
		U ) USER=$OPTARG 
		    ;;
		P ) PASSWORD=$OPTARG 
		    ;;
		H ) HOST=$OPTARG 
		    ;;
		D ) DB=$OPTARG 
		    ;;
		S ) SCHEMA=$OPTARG 
		    ;;
		I ) INSTANCE=$OPTARG 
		    ;;
		\? ) echo "Invalid option: $OPTARG" 1>&2
            exit 1		
		    ;;
		: ) echo "Invalid option: $OPTARG requires an argument" 1>&2
            exit 1		
		    ;;
	esac
done
shift $((OPTIND -1))

if [ -z "$HOST" ]
then
	read -p "Enter the HANA hostname or IP: " HOST
	if [ -z "$HOST" ]
    then
	    echo "Aborting: You must enter a HANA host or ip"
	    exit 1
	fi;
fi;

if [ -z "$USER" ]
then
	read -p "Enter the database user used to create the schema objects: " USER
	if [ -z "$USER" ]
        then
		echo "Aborting: You must enter a user"
		exit 1
	fi;
fi;


if [ -z "$PASSWORD" ]
then
	echo -n "Enter the $USER user password: "
	read -s PASSWORD
	echo

	if [ -z "$PASSWORD" ]
        then
		echo "Aborting: You must enter the '$USER' user password"
		exit 1
	fi;
fi;


if [ -z "$SCHEMA" ]
then
	read -p "Enter the target schema for the data model: " SCHEMA
	if [ -z "$SCHEMA" ]
        then
		echo "Aborting: You must enter a target schema"
		exit 1
	fi;
fi;



hdbsql_command="hdbsql -quiet -a -x -E 2 -m -n ${HOST} -i ${INSTANCE} -u${USER} -p""${PASSWORD}"" -d ${DB}"


# Need to verfy we can connect to the DB.
sql_command='\s'
OUTPUT=`${hdbsql_command} ${sql_command}`
#hdbsql -quiet -x -E 2 -n $HOST -i ${INSTANCE} -u${USER} -p"${PASSWORD}" #-d ${DB} 
#<< EOF
#\s
#EOF

STATUS=$?
# echo $OUTPUT
if [ "$STATUS" != "0" ]
then
   echo "Aborting: Error connecting to tenant database $DB as user $USER"
   exit 1
fi

# Need to verfy we can set the schema.
sql_command="set schema $SCHEMA;"
#hdbsql -quiet -x -E 2 -n $HOST -mu -i ${INSTANCE} -u${USER} -p"${PASSWORD}" -d ${DB} << EOF
# set schema $SCHEMA;
#EOF
OUTPUT=`${hdbsql_command} ${sql_command}`

STATUS=$?
# echo $OUTPUT
if [ "$STATUS" != "0" ]
then
   echo "Aborting: Error setting the target schema to '$SCHEMA'"
   exit 1
fi

###############
# Load tables
###############
for f in tables/*.sql
do

    table_name=`echo ${f} | cut -f 1 -d "." | cut -f 2 -d "/"`
    echo $table_name
    sql_command=" select count(*) as CNT from OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND SCHEMA_NAME = '$SCHEMA' AND OBJECT_NAME = '$table_name'"
    exists=`${hdbsql_command} ${sql_command}`

    if [ "$exists" != "0" ]
    then
        echo "table ${SCHEMA}.${table_name} already exists. Dropping it first."
        sql_command="drop table ${SCHEMA}.${table_name};"
        ${hdbsql_command} ${sql_command}

        STATUS=$?
        if [ "$STATUS" != "0" ]
        then
            echo "Aborting: Error dropping table $table_name"
            exit 1
        fi
    fi

    echo "Creating table ${SCHEMA}.${table_name}"
	echo "Creating table from file - $f"
	
hdbsql -quiet -x -E 2 -n $HOST -i ${INSTANCE} -u${USER} -p"${PASSWORD}" -d ${DB} << EOF
set schema $SCHEMA;
\read "$f"
EOF

	STATUS=$?
	if [ "$STATUS" != "0" ]
	then
	   echo "Aborting: Error creating table"
	   exit 1
	fi

done


##################
# Load indexes
##################
if [ -d "indexes" ] && [ "$(ls -A indexes)" ]
then
	for f in indexes/*.sql
	do

		index_name=`echo ${f} | cut -f 1 -d "." | cut -f 2 -d "/"`
		echo $index_name
		sql_command=" select count(*) as CNT from OBJECTS WHERE OBJECT_TYPE = 'INDEX' AND SCHEMA_NAME = '$SCHEMA' AND OBJECT_NAME = '$index_name'"
		exists=`${hdbsql_command} ${sql_command}`

		if [ "$exists" != "0" ]
		then
			echo "index ${SCHEMA}.${index_name} already exists. Dropping it first."
			sql_command="drop index ${SCHEMA}.${index_name};"
			${hdbsql_command} ${sql_command}

			STATUS=$?
			if [ "$STATUS" != "0" ]
			then
				echo "Aborting: Error dropping index $index_name"
				exit 1
			fi
		fi

		echo "Creating index ${SCHEMA}.${index_name}"

hdbsql -quiet -x -E 2 -n $HOST -i ${INSTANCE} -u${USER} -p"${PASSWORD}" -d ${DB} << EOF
set schema $SCHEMA;
\read "${f}"
EOF

		STATUS=$?
		if [ "$STATUS" != "0" ]
		then
			echo "Aborting: Error creating index $index_name"
		   exit 1
		fi

	done
fi

##################
# Load table types
##################
if [ -d "table_types" ] && [ "$(ls -A table_types)" ]
then
	for f in table_types/*.sql
	do

		table_type_name=`echo ${f} | cut -f 1 -d "." | cut -f 2 -d "/"`

		sql_command=" select count(*) as CNT from OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND SCHEMA_NAME = '$SCHEMA' AND OBJECT_NAME = '$table_type_name'"
		exists=`${hdbsql_command} ${sql_command}`

		if [ "$exists" != "0" ]
		then
			echo "table type ${SCHEMA}.${table_type_name} already exists. Dropping it first."
			sql_command="drop type ${SCHEMA}.${table_type_name};"
			${hdbsql_command} ${sql_command}

			STATUS=$?
			if [ "$STATUS" != "0" ]
			then
				echo "Aborting: Error dropping table type $table_type_name"
				exit 1
			fi
		fi

		echo "Creating table type ${SCHEMA}.${table_type_name}"

hdbsql -quiet -x -E 2 -n $HOST -i ${INSTANCE} -u${USER} -p"${PASSWORD}" -d ${DB} << EOF
set schema $SCHEMA;
\read "$f"
EOF

		STATUS=$?
		if [ "$STATUS" != "0" ]
		then
			echo "Aborting: Error creating table type $table_type_name"
		   exit 1
		fi

	done
fi

##################
# Load views
##################
if [ -d "views" ] && [ "$(ls -A views)" ]
then 
	if [ -f "views/views_load_order.txt" ]
	then
		view_list_command='cat views/load_order.txt'
	else
		view_list_command='ls -1 views'
	fi
	for f in `${view_list_command}`
	do

		view_name=`echo ${f} | cut -f 1 -d "."`
		echo $view_name
		sql_command=" select count(*) as CNT from OBJECTS WHERE OBJECT_TYPE = 'VIEW' AND SCHEMA_NAME = '$SCHEMA' AND OBJECT_NAME = '$view_name'"
		exists=`${hdbsql_command} ${sql_command}`

		if [ "$exists" != "0" ]
		then
			echo "view ${SCHEMA}.${view_name} already exists. Dropping it first."
			sql_command="drop view ${SCHEMA}.${view_name};"
			${hdbsql_command} ${sql_command}

			STATUS=$?
			if [ "$STATUS" != "0" ]
			then
				echo "Aborting: Error dropping view $view_name"
				exit 1
			fi
		fi

		echo "Creating view ${SCHEMA}.${view_name}"

hdbsql -quiet -x -E 2 -n $HOST -i ${INSTANCE} -u${USER} -p"${PASSWORD}" -d ${DB} << EOF
set schema $SCHEMA;
\read "views/${f}"
EOF

		STATUS=$?
		if [ "$STATUS" != "0" ]
		then
			echo "Aborting: Error creating view $view_name"
		   exit 1
		fi

	done
fi


##################
# Load procedures
##################
if [ -d "procedures" ] && [ "$(ls -A procedures)" ]
then 
	if [ -f "procedures/procedures_load_order.txt" ]
	then
		proc_list_command='cat procedures/load_order.txt'
	else
		proc_list_command='ls -1 procedures'
	fi
	
	for f in `${proc_list_command}`
	do

		proc_name=`echo ${f} | cut -f 1 -d "."`
		echo $proc_name
		sql_command=" select count(*) as CNT from OBJECTS WHERE OBJECT_TYPE = 'PROCEDURE' AND SCHEMA_NAME = '$SCHEMA' AND OBJECT_NAME = '$proc_name'"
		exists=`${hdbsql_command} ${sql_command}`

		if [ "$exists" != "0" ]
		then
			echo "procedure ${SCHEMA}.${proc_name} already exists. Dropping it first."
			sql_command="drop procedure ${SCHEMA}.${proc_name};"
			${hdbsql_command} ${sql_command}

			STATUS=$?
			if [ "$STATUS" != "0" ]
			then
				echo "Aborting: Error dropping procedure $proc_name"
				exit 1
			fi
		fi

		echo "Creating procedure ${SCHEMA}.${proc_name}"

hdbsql -quiet -m -x -E 2 -n $HOST -i ${INSTANCE} -u${USER} -p"${PASSWORD}" -d ${DB} << EOF
set schema $SCHEMA;
\read "procedures/${f}"
EOF

		STATUS=$?
		if [ "$STATUS" != "0" ]
		then
			echo "Aborting: Error creating procedure $proc_name"
		   exit 1
		fi

	done
fi

##################
# Load synonyms
##################
if [ -d "synonyms" ] && [ "$(ls -A synonyms)" ]
then
	for f in synonyms/*.sql
	do

		synonym_name=`echo ${f} | cut -f 1 -d "." | cut -f 2 -d "/"`

		sql_command=" select count(*) as CNT from OBJECTS WHERE OBJECT_TYPE = 'SYNONYM' AND SCHEMA_NAME = '$SCHEMA' AND OBJECT_NAME = '$synonym_name'"
		exists=`${hdbsql_command} ${sql_command}`

		if [ "$exists" != "0" ]
		then
			echo "synonym ${SCHEMA}.${synonym_name} already exists. Dropping it first."
			sql_command="drop synonym ${SCHEMA}.${synonym_name};"
			${hdbsql_command} ${sql_command}

			STATUS=$?
			if [ "$STATUS" != "0" ]
			then
				echo "Aborting: Error dropping synonym $synonym_name"
				exit 1
			fi
		fi

		echo "Creating synonym ${SCHEMA}.${synonym_name}"

hdbsql -quiet -x -E 2 -n $HOST -i ${INSTANCE} -u${USER} -p"${PASSWORD}" -d ${DB} << EOF
set schema $SCHEMA;
\read "$f"
EOF

		STATUS=$?
		if [ "$STATUS" != "0" ]
		then
			echo "Aborting: Error creating synonym $synonym_name"
		   exit 1
		fi

	done
fi


echo "Finished"
