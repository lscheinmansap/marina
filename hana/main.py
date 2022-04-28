import os
import hana_ml
import dotenv
import hdbcli
from loguru import logger

dotenv.load_dotenv('.env')
HANA_ADDRESS = os.environ.get('HANA_ADDRESS')
HANA_PORT = int(os.environ.get('HANA_PORT'))
HANA_USER = os.environ.get('HANA_USER')
HANA_PASS = os.environ.get('HANA_PASS')
MARINA_USER = os.environ.get('MARINA_USER')
MARINA_PASS = os.environ.get('MARINA_PASS')

# Load all the artifacts from the known folders. This needs to be updated only if new folders are added.
# The order of loading is tables, indexes, views, procedures. Individual load orders are defined in txt files
MARINA_TABLES = {
    sql: open(os.path.join(os.getcwd(), "marina", "tables", sql)).read()
    for sql in os.listdir(os.path.join(os.getcwd(), "marina", "tables"))
}
MARINA_PROCEDURES = {
    sql: open(os.path.join(os.getcwd(), "marina", "procedures", sql)).read()
    for sql in os.listdir(os.path.join(os.getcwd(), "marina", "procedures"))
}
IMAGERY_TABLES = {
    sql: open(os.path.join(os.getcwd(), "imagery_packages", "tables", sql)).read()
    for sql in os.listdir(os.path.join(os.getcwd(), "imagery_packages", "tables"))
}
IMAGERY_PROCEDURES = {
    sql: open(os.path.join(os.getcwd(), "imagery_packages", "procedures", sql)).read()
    for sql in os.listdir(os.path.join(os.getcwd(), "imagery_packages", "procedures"))
}
IMAGERY_VIEWS = {
    sql: open(os.path.join(os.getcwd(), "imagery_packages", "views", sql)).read()
    for sql in os.listdir(os.path.join(os.getcwd(), "imagery_packages", "views"))
}
IMAGERY_INDEXES = {
    sql: open(os.path.join(os.getcwd(), "imagery_packages", "indexes", sql)).read()
    for sql in os.listdir(os.path.join(os.getcwd(), "imagery_packages", "indexes"))
}
ARTIFACTS = {
    "TABLE": [MARINA_TABLES, IMAGERY_TABLES],
    "INDEX": [IMAGERY_INDEXES],
    "VIEW": [IMAGERY_VIEWS],
    "PROCEDURE": [MARINA_PROCEDURES, IMAGERY_PROCEDURES],
}


def get_connection_context():
    """
    Create a connection with HANA to use with hana_ml.

    :return: hana_ml.ConnectionContext
    """
    def connect():
        return hana_ml.ConnectionContext(
            address=HANA_ADDRESS,
            port=HANA_PORT,
            user=HANA_USER,
            password=HANA_PASS,
            encrypt='true',
            autocommit=True,
            sslValidateCertificate='false'
        )

    try:
        cc = connect()
        logger.info(f'Connected to {cc.connection.getaddress()} version {cc.hana_version()}')
    except hdbcli.dbapi.Error as err:
        logger.info(err.errortext)
        cc = connect()

    return cc


def create_marina_user_and_schema(cc):

    try:
        cc.connection.cursor().execute(f"""
        CREATE USER {MARINA_USER} PASSWORD {MARINA_PASS} NO FORCE_FIRST_PASSWORD_CHANGE SET USERGROUP DEFAULT;
        """)
    except hdbcli.dbapi.Error:
        logger.info("User already exists")

    mc = hana_ml.ConnectionContext(
        address=HANA_ADDRESS,
        port=HANA_PORT,
        user=MARINA_USER,
        password=MARINA_PASS,
        encrypt='true',
        autocommit=True,
        sslValidateCertificate='false'
    )
    return mc


def check_load_order(art):
    """
    Check the dictionary of sqls for a text file in which case it has a load order. If it does have a load order,
    return that order as a list otherwise return None.
    """
    load_order = [art[v].split("\n") for v in art if v[-3:] == "txt"]
    if len(load_order) == 1:
        try:
            return {sql: art[sql] for sql in load_order[0]}
        except KeyError:
            print(art)
    else:
        return None


def create_artifact(mc, art, sql, art_type):
    """
    Create any type of sql based artifact. If it fails creation, return False.
    """
    try:
        mc.connection.cursor().execute(sql)
        logger.info(f"Created {art_type} {art}")
    except hdbcli.dbapi.ProgrammingError as err:
        if err.errorcode == 288:
            logger.info(f"{art} already exists")
        elif err.errorcode == 289:
            logger.info(f"{art} already exists")
        elif err.errorcode == 322:
            logger.info(f"{art} already exists")
        else:
            logger.info(f"Error with {art_type} {art}: \n {sql}")
            logger.info(err.errortext)
            return False
    except hdbcli.dbapi.Error as err:
        if err.errorcode == 329:
            logger.info(f"{art} already exists")
    return True


def load_artifacts(mc):
    """
    Iterate through the order dict. If there is a load order, use it as the guide for creation.
    """
    for arts in ARTIFACTS:
        logger.info(f"Loading {arts}")
        for art in ARTIFACTS[arts]:
            load_order = check_load_order(art)
            if not load_order:
                load_order = art
            for sql in load_order:
                if sql[-3:] != "txt":
                    if not create_artifact(mc, sql, load_order[sql], arts) and arts != "TABLE":
                        logger.error(f"Aborting {arts} creation")
                        break


def drop_all(mc):
    for arts in ARTIFACTS:
        for art in ARTIFACTS[arts]:
            for sql in art:
                if sql[-3:] == "txt":
                    try:
                        mc.connection.cursor().execute(f"DROP {art} {sql[:-3]};")
                    except hdbcli.dbapi.Error as err:
                        logger.info(err.errortext)


def run_setup():
    # Run the entire setup
    cc = get_connection_context()
    mc = create_marina_user_and_schema(cc)
    drop_all(mc)
    load_artifacts(mc)
    logger.info("Complete with HANA setup")


if __name__ == '__main__':
    run_setup()

