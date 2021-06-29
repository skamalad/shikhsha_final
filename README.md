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

## Granting Admin access to Shikhsha

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

### Getting the user's identity with signed headers

All requests made to the application on the App Engine environment is authorized by IAP by checking the `x-goog-iap-jwt-assertion` HTTP request header. These headers are available for compatibility, but you shouldn't rely on them as a security mechanism.

### Consent Screen

When IAP is enabled, the first time a user accesses your app, they're redirected to a consent screen to confirm that they want to share their identity with your app. This occurs even if the user granted consent to this app before you enabled IAP, and will occur again if you disable IAP and then re-enable it.

---

## How does Shikhsha work and access Workspace APIs?

### Understanding the construct of interactions between Google App Engine and Google Workspace

1. Starting with the Admin SDK
   The Admin console allows for running and managing admin tasks inside of your Workspace instance.

2. Connect your service to Admin Console
   Use the REST APIs (in this case Directory API) to interact programmatically with the Admin console. Read more [here](https://developers.google.com/admin-sdk/directory)

3. You will need to enable the admin SDK on your project
   `https://console.developers.google.com/apis/api/admin.googleapis.com/overview?project=<your-project-name>`

### Perform Google Workspace Domain-Wide Delegation of Authority

In enterprise applications you may want to programmatically access a user's data without any manual authorization on their part. In Google Workspace domains, the domain administrator can grant third-party applications with domain-wide access to its users' data — this is known as domain-wide delegation of authority. To delegate authority this way, domain administrators can use service accounts with OAuth 2.0.

### Create the service account and credentials

> It is recommended to create a separate service account for this and not use the default create app engine service account

1. Open the [Service accounts page](https://console.developers.google.com/iam-admin/serviceaccounts). If prompted, select your project.
2. Click <b>+ Create Service Account</b>, enter a name and description for the service account. You can use the default service account ID, or choose a different, unique one. When done click <b>Create</b>.

3. On the <b>Grant users access to this service account</b>screen, scroll down to the Create key section. Click <b>+ Create key</b>.

4. In the side panel that appears, select the format for your key: JSON is recommended.

5. Click <b>Create</b>. Your new public/private key pair is generated and downloaded to your machine; it serves as the only copy of this key. For information on how to store it securely, see [Managing service account keys](https://cloud.google.com/iam/docs/understanding-service-accounts#managing_service_account_keys).

6. Click <b>Close</b> on the Private key saved to your computer dialog, then click Done to return to the table of your service accounts.

### Enable Google Workspace domain-wide delegation

1. Locate the newly-created service account in the table. Under <b>Actions</b>, click the ellipsis and then Edit.

2. In the service account details, click <b>Show domain-wide delegation</b>, then ensure the <b>Enable G Suite Domain-wide Delegation </b>checkbox is checked.

3. If you haven't yet configured your app's OAuth consent screen, you must do so before you can enable domain-wide delegation. Follow the on-screen instructions to configure the OAuth consent screen, then repeat the above steps and re-check the checkbox.

4. Click <b>Save</b> to update the service account, and return to the table of service accounts. A new column, <b>Domain-wide delegation</b>, can be seen. Click <b>View Client ID</b>, to obtain and make a note of the client ID.

### Delegate domain-wide authority to your service account

To access user data on a Google Workspace domain, the service account that you created needs to be granted access by a super administrator for the domain

To delegate domain-wide authority to a service account:

1. From your Google Workspace domain’s Admin console, go to <b>Main menu => Security => API controls</b>.

2. In the <b>Domain wide delegation </b> pane, select <b>Manage Domain Wide Delegation</b>.

3. Click <b>Add new</b>.

4. In the <b>Client ID field</b>, enter the client ID obtained from the service account creation steps above.

5. In the <b>OAuth Scopes</b> field, enter a comma-delimited list of the scopes required for your application

The scopes we need are:
`https://www.googleapis.com/auth/admin.directory.user`
`https://www.googleapis.com/auth/admin.directory.group`
`https://www.googleapis.com/auth/admin.directory.group.member`

Click <b>Authorize</b>.

### Making the Service Account communicate with the Admin SDK securely

1. Create a secret on Google Secret Manager. This can be found in the cloud console => Menu => Security => Secret Manager

2. Click <b>Create Secret</b> using the content of JSON file you had downloaded earlier. You can name the secret anything you want.

3. Give the `roles/secretmanager.secretAccessor` role to App Engine default service account. Best practice here would be to follow the least privilege access and only allow the app to read your specific secret and not any other secrets. This has to be done in the IAM section under IAM & Admin

4. You must have a GCP user on your domain that has admin access, as the Service account will impersonate the user when using the Directory API. In the code, you will notice this user is `admin@cloudworker.solutions` in the `auth.js` file

5. Please modify the path to the secret inside the `auth.js`

```
async function accessSecretVersion() {
      const [version] = await client.accessSecretVersion({
        name:
          '<your path to secret goes here'>,
          // ** This can be found in the secret manager when you select your secret ** //
      });

```
