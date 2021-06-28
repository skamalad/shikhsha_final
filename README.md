# Project Shiksha

## Please read first before proceeding

Application Shikhsha was built to ensure streamlined and secure access for school administrators to reset passwords of students across different Google Workspace groups.

---

## How is Shiksha built?

Shikhsha is built on Google's highly scalable and fully managed serverless platform using Node.js as the language environment. App Engine offers a choice between two Node.js environments.

Shikhsha is built using the <b>Flexible Environment : which supports any Node.js version</b>

Any changes to the environment can be configured in the app.yaml file.

More information about Node.js on [Google App Engine](https://cloud.google.com/appengine/docs/nodejs)

Please read below for more details on deployment

---

## Deploying Shikhsha - Deploying Shikhsha in your GCP environment

Clone code from the [github repository](https://github.com/skamalad/shikhsha_final)

-       git clone https://github.com/skamalad/shikhsha_final.git

Once cloned, please install the node/npm dependencies

-       npm install

Please note:
The <i>app.yaml</i> file contains the configuration for the deployment into App engine. In our case we decided to build it on the Flex environment with a single machine always on. This may incur charges, however it prevents from cold starting machines.

You could also decide to run this on a standard App Engine Environment to prevent any dormant charges

Sample <i>app.yaml</i> code

    runtime: nodejs
    env: flex

    manual_scaling:
    instances: 1

    resources:
    cpu: 1
    memory_gb: 0.5
    disk_size_gb: 10

Please use the [pricing calculator](https://cloud.google.com/products/calculator) to understand you
