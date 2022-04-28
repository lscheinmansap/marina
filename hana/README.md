# Marina Data Model setup in SAP HANA
The main.py file executes an automated setup of all the HANA tables, views, indexes and procedures required for Marina. 

1. Setup your HANA cloud instance taking note of the password and host address
2. Change the .env_template variables:
    * HANA_ADDRESS with the host address
    * HANA_PASS with the hana password
    * MARINA_PASS with a password you choose
3. Save the .env_template as .env
4. Run python main.py
 
The output statements will be executed in the console. The order in which executions take place is:

1. Create Marina schema
2. Drop all artifacts
3. Create tables
4. Create indexes
5. Create views
6. Create procedures
