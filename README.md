# Marina
Marina is an SAP UI5 based User Experience (UX) that surfaces federated data orchestrated by SAP Data Intelligence and SAP HANA. It additionally focuses on the Networkgraph library and Graph ready data. The Networkgraph enables exploration of connected data such as shortest paths and neighbors separated by n degrees. Additionally, it provides a timeline and geo map for which to run spatial searches. The objective of the app is to provide a UX that highlights the value of SAP HANA Graph and Spatial engines.

The current release of Marina is a prototype stage with an api for the graph specific functions written in python and the data orchestration marinaApi written in node. The plan is to merge these 2 APIs into a single folder and code base. 

The HANA folder contains the setup of the HANA tables for data orchestration. It includes an env_template which should contain the endpoints and credentials for your SAP HANA instance. When these are added, it should be saved as .env which is otherwise ignored by git verioning to ensure security detals are not published. When running the hana/main.py, it will use the env_template to access and then create the SAP HANA tables. 

# License details
The use of the SAP UI5 libraries stored in the webaoo is not license free but is included with the license that comes with SAP HANA Enterprise or SAP HANA Cloud subscription. The remaining code in the repository is covered under MIT License.

## SAP HANA requirements
The files included in the api/data folder will be loaded into an SAP HANA instance when you first run the application, either locally or in Cloud Foundry. Therefore, you need to have a HANA DB running with a recommended 50 GB of memory and 120 GB of storage. In most cases, the application will only require at most 10 GB of memory and 5 GB of storage so the minimum SAP HANA Cloud settings should be fine. 

Once you have the HANA instance, copy the endpoint and use it when updating the environment file (api/.env) that you will need to make as explained below.

## Local development
The following instructions describe the steps to set up for local development but assumes a connection with either an SAP HANA cloud instance, S/4 system or both. These details will be needed when creating the .env file from which the api will read.

1. Fork this GitHub Repo into your account.
1. Install the python based API server:
    * Open a terminal at the root of the compass-api folder
    * Initialize a virtual python environment ensuring it is python3:
        ```python
        pip install virtualenv
        virtualenv venv
        # Windows
        venv\Scripts\activate 
        # MacOS or Linux
        source venv/bin/activate
        ```
    * Install the requirements
        ```python
        pip install -r api/requirements.txt
        ```
1. Update the api/.env-sample file with your variables to ensure back-end connection. This includes the HANA endpoint and its technical user details. When saving the .env-sample, save it as .env to ensure the credentials are not updated to github if you do any push. The .env file is ignored but the .env-sample is not.

1. Start the API server from the api folder
    ```python
        python main.py

        # You should see the following message:
        # Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
    ```
1. Install webapp dependencies by navigating to the compass-app directory.
    * `npm install`
    * This will result in a new folder `node_modules` and new file `package-lock.json`
1. Edit the compass-app/webapp/utils/fastAPI.js endpoints to match your S/4 system address. These details are are provided with an example found at lines 31-38.
1. Run the app:
    * `npm run start`
1. The application is available on your browser at: [http://localhost:8080](http://localhost:8080)

## Hosting on Cloud Foundry

You can host the application on Cloud Foundry using the SAP Business Technology Platform. You will need to set up a space and ensure the Disk Quota size meets the application requirements. The suggested sizing requirements are as following:

* API: 1560 MB Disk Quota and 1024 MB Memory
* App: 256 MB Disk Quota and 128 MB Memory 

The requirements are hard-coded in the manifest.yml but can of course be changed.

Ensure you have the Cloud Foundry CLI. Detailed instructions can be found at [Getting started with CF CLI](https://docs.cloudfoundry.org/cf-cli/getting-started.html). Then open a command line in the directory where you downloaded the repository. Ensure the manifest.yml is in the directory.

Log into your Cloud Foundry Space. Detailed instructions can be found at: [Cloud Foundry documentation, deploying apps with a manifest.](https://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html)
    
``` bash
cf login

cf push
```
You should see output in the logs as the application sets up the HANA artifacts. Once the API and App are deployed, you will see that both are in a running state and you can navigate to your cockpit to see the details.

Once the setup is complete, you can go to the App URL and it should have 3 notifications, each one representing a use case.

## Screenshots and Use Cases

The following screen shots give a preview of the UX that combines the Fiori NetworkGraph, GeoMap and Timeline controls. For the ready Use Cases, SAP HANA Graph builds "Situations" which are customized alerts based on data aggregated from multiple sources.

![Overview](/imgs/Overview.png)

![ShortestPath](/imgs/ShortestPath2.png)

![ShortestPath 2](/imgs/Situations.png)

![ShortestPath 2](/imgs/ShortestPath.png)

![ShortestPath 2](/imgs/GraphZoom.png)

The Marina Compass PDF included in this main folder gives further detail.