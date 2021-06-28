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

Please use the [pricing calculator](https://cloud.google.com/products/calculator) to understand your charges based on location and type of instance.

## Granting access to Shikhsha

Shikhsha has been built on GCP Identity Aware Proxy(IAP). IAP provides a single point of control for managing user access to web applications and cloud resources.

### Enabling IAP

1. Go to the [Identity-Aware Proxy Page](https://console.cloud.google.com/security/iap?_ga=2.125505994.1195033545.1624890077-743043344.1620042314)

2. If you don't already have an active project, you'll be prompted to select the project you want to secure with IAP. Select the project to which you deployed the sample application.

3. If you haven't configured your project's OAuth consent screen, you'll be prompted to do so. An email address and product name are required for the OAuth consent screen.

4. Select the resource you wish to modify by checking the box to its left. On the right side panel, click Add Member.

5. In the Add members dialog, add the email addresses of groups or individuals to whom you want to grant the IAP-secured Web App User role for the project.
   The following kinds of accounts can be members:

Google Account: user@gmail.com <br>
Google Group: admins@googlegroups.com <br>
Service account: server@example.gserviceaccount.com <br>
G Suite domain: example.com

### Turning on IAP

1. On the Identity-Aware Proxy page, under HTTPS Resources, find the App Engine app you want to restrict access to. The Published column shows the URL of the app. To turn on IAP for the app, toggle the on/off switch in the IAP column.

> To enable IAP, you need the `appengine.applications.update, clientauthconfig.clients.create, and clientauthconfig.clients.getWithSecret ` permissions. These permissions are granted by roles, such as the Project Editor role. To learn more, see [Managing access to IAP-secured resources](https://cloud.google.com/iap/docs/managing-access#turning_on_and_off).

2. To confirm that you want IAP to secure the application, click Turn On in the Turn on IAP window that appears. After you turn it on, IAP requires login credentials for all connections to your application.
