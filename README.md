#### Overview:

Project Shikhsha _(in Hindi, शिक्षा, meaning Education)_ is a proof of concept application to support scaled access to reset user passwords in a Google Workspace for Education tenant. It will also work for non-Edu Google Workspace tenants. 

Whilst the Google admin console facilitates delegated administration, it is not scalable or tightly scoped enough for education entities at country or state level to allow (for example) tens of thousands of individual teachers to reset _only_ the Google account password for students directly in their classes.

This project is not maintained or distributed by Google. Please use it as a basis to explore your own solution.

---

#### How is Shikhsha built?

Shikhsha is built on Google Cloud Platform App Engine: a highly scalable and fully managed serverless platform using [Node.js ](https://nodejs.org/en/)as the language environment.

Read about [App Engine here](https://cloud.google.com/appengine) and information about[ Node.js on App Engine here](https://cloud.google.com/appengine/docs/nodejs).

---

#### Google Cloud Platform components overview:

**App Engine** is used to deploy the core application. The app uses publicly available [Google Admin SDK](https://developers.google.com/admin-sdk) APIs to read user objects and reset passwords. [App Engine is a chargeable service](https://cloud.google.com/appengine/pricing), with a free tier available when apps are deployed in the standard environment.  This proof-of-concept is built using the Flexible Environment which supports any Node.js version.

**Identity Aware Proxy** is used to control access to the App Engine app itself. IAP restricts resource access to only specified Google user accounts and groups. Depending on how IAP is configured,[ there is no charge for the service.](https://cloud.google.com/iap?hl=en#:~:text=Identity-Aware%20Proxy%20includes%20a%20number%20of%20features%20that%20can%20be%20used%20to%20protect%20access%20to%20Google%20Cloud%20hosted%20resources%20and%20applications%20hosted%20on%20Google%20Cloud%20at%20no%20charge)

**Secret Manager** secures the private oauth JSON key used by a service account to [authenticate ](https://cloud.google.com/docs/authentication)the Shikhsha application against Admin SDK APIs. [Secret Manager is a chargeable service](https://cloud.google.com/secret-manager/pricing), but has a free tier. 

**Service account:** is used for app authentication against the Admin SDK APIs. The[ service account ](https://cloud.google.com/iam/docs/service-accounts)is granted domain-wide delegation in order to be able to trigger a password reset for all users in scope.

**APIs:** REST APIs which allow the application to programmatically interact with the Google Workspace tenant and specific GCP components to support building the app and [securing/calling the JSON key](https://cloud.google.com/iam/docs/understanding-service-accounts#managing_service_account_keys) used for authentication.

---

#### GCP Costs:

Depending on how the resources used in this app are configured and the extent of usage, GCP charges may be incurred. Ensure you read the documentation thoroughly before deploying and consult the [GCP pricing calculator](https://cloud.google.com/products/calculator) for an estimate.

---

#### Prerequisites before beginning deployment:



*   Super admin access to your Google Workspace tenant 
*   Create a custom delegated administrator role with Admin API privileges for: Users > Read, Users > Reset Password and Groups > Read.
*   Create an account to assign to the custom delegated administrator role. This account will effectively "operate" the application and service account which will be created during the walkthrough. This account will act on behalf of the Shikhsha application to reset user passwords. As this account will not use any Workspace applications, it has no need for a Workspace license and can have all Workspace apps and services disabled. 
*   Ability to create a new Google Cloud Platform project, or appropriate permissions to enable required APIs and services if using an existing project.
*   GCP billing configured: whilst this proof-of-concept can be deployed in a manner to use services which all run on the free tier, billing is required as they are chargeable based on usage or configuration.
*   _For the following, ensure you read Groups considerations below:_
    *   Workspace Groups created and populated to control IAP access to the application
    *   Workspace Groups created and populated for controlling access to groups of users whose passwords can be reset by authorised entities (e.g teachers can see their direct students and reset only those passwords)
*   Define a prefix to be used in front of all Groups that may be visible within the Shikhsha application.
*   Email address to be used (individual or group) as a contact on the OAuth consent screen.
*   Developer email address to be used in OAuth contact information

_While not essential, a good understanding of GCP/App Engine, Google Workspace and JavaScript/HTML/CSS is highly recommended in order to understand how the application works._

---

#### Groups:

Google Groups are used in this proof-of-concept as a method of creating logical units of user objects as well as access controls and filtering. Workspace has two methods of logical grouping: [Organizational Units](https://support.google.com/a/answer/4352075?hl=en) and [Google Groups](https://support.google.com/groups/answer/46601?hl=en). 

_Groups are used for two primary reasons:_



*   Identity Aware Proxy only functions with users or groups.
*   Most Educational customers (and many Enterprise) already have logical groupings of users in a third party directory service (e.g. Active Directory) which are being synced to their Workspace tenant. These existing groups can be used simply by adding a prefix to the group name.

_Considerations:_



*   A group or groups must be created which contain all users who are allowed to access the application
*   Groups of users which are going to be visible in the reset tool _must_ include a prefix that you specify for controlling user search. The prefix needs to be prepended to the group name, not the email address.
*   The user who is responsible for resetting passwords must be a member of the group which they want to reset passwords for.
*   If the two prerequisites above are not met, then a group (and subsequently users of the group) which is expected to be visible in the application will not be available.
*   Nested groups (groups within a group) are not supported within the Shikhsha application itself and are logically filtered out so end users will not see them.
*   Nested groups _are_ supported by Identity-Aware Proxy, which streamlines management of accounts allowed to access the Shikhsha application.

---

#### Security:

_Best practice security considerations should always apply._ In the case of Project Shikhsha, the intent is to allow a “normal” user account permission to reset another “normal” account’s password. This carries significant risk, so planning, caution and thorough testing should be used when configuring and deploying the application. Some things to consider:



*   The deployed GCP application and component parts are only available to developers who have been directly added to the GCP project, with access levels as defined. Developers should follow best practice and use the principle of least privilege.
*   Shikhsha is only available to users from the Google tenant to which it is deployed. 
*   The application has [domain wide delegation](https://support.google.com/a/answer/162106?hl=en&ref_topic=10021546) to make changes to user passwords. 
*   The app is further restricted in the operations it can perform by [OAuth scopes](https://developers.google.com/identity/protocols/oauth2/scopes#admin-directory): only user and group access is specified.
*   The user account which is created to "act" as Shikhsha has permission to operate over API only, and to read users,groups and reset passwords. It has no access to any other Google service.
*   The service account used for server to server (Shikhsha > Google APIs) authentication generates a unique key. Secret Manager is used to securely store this key, which is retrieved by the app only when making a call which requires authentication. Secret Manager can be configured to rotate this key on a regular basis, amongst other things.
*   The following points elaborate on more granular access control.
    *   App access is restricted to allowed Google Groups only by IAP. 
    *   **Strongly consider** creating or using Groups whose single purpose is accessing this application.
    *   For allowed Groups, be sure that [membership is invite only](https://support.google.com/groups/answer/2464926?hl=en&ref_topic=2458761#:~:text=Only%20invited%20users%E2%80%94People%20have%20to%20be%20invited%20to%20join%20the%20group.%20They%20can%27t%20add%20themselves%20directly%20or%20ask%20to%20join.), users added are only [Group Members](https://support.google.com/groups/answer/2464926?hl=en&ref_topic=2458761#:~:text=By%20default%2C%20group,managers%20and%20owners.) and consider disabling all other visibility/functionality.
    *   **Strongly consider** forcing all users who will be able to reset passwords (e.g teachers) to turn on 2FA. As users who would already have access to student PII and communications, it’s expected that this is likely already in place.

---

#### Logging:

App Engine and other GCP services will create logs in Cloud Logging both during deployment and operation of the application. This includes access logs, errors and actions taken by users (e.g - reset a password. Just like other GCP components, Cloud Logging is only accessible to developers who have been granted access to the project with appropriate permissions.

When a password is changed via Shikhsha, Google Workspace will report this in the [admin audit log](https://support.google.com/a/answer/4579579?hl=en) as being changed by the delegated admin user (acting on behalf of the “service” account), regardless of which specific end user actually made the change - this single user is specified during the app configuration and deployment process (see below). This is standard behaviour when delegating permission to a third party application which is performing operations via API.

The following query can be used to check activity within the Shikhsha application:

_resource.type="gae_app"
severity="NOTICE"
log_name="projects/**project-name**/logs/cloudaudit.googleapis.com%2Factivity"_

Replace **project-name** with your own.

---

#### Deploying to Google Cloud Platform:

This guide makes use of [Cloud Shell](https://cloud.google.com/shell) in order to simplify deployment. For those familiar with using the [Cloud SDK](https://cloud.google.com/sdk), feel free to use your development environment of choice and execute required steps from the command line.

If you are unfamiliar with Google Cloud Platform, use the hamburger icon in the upper left corner to pop out the navigation menu. 

---

#### Walkthrough:


##### Create project in GCP

Open the [Google Cloud console](https://console.cloud.google.com/) in your browser and create a new project. Optionally, use an existing project if you prefer.


##### Enable APIs

Navigate to APIs and Services > Library. Enable the following APIs:



*   Admin SDK API
*   Secret Manager API
*   Cloud Build API
*   Cloud Identity-Aware Proxy API


##### Link/create billing account

The Shikhsha application can operate using only free tier GCP components, however all can be chargeable depending on configuration and usage. As such, billing (or GCP free trial credit) needs to be set up before being able to deploy.


##### Create App Engine app

Navigate to App Engine and create a new application. Select a region to deploy the application to. Note: region is permanent and can’t be changed after deployment.

Deployment will take a few minutes as the App Engine environment is being provisioned. Once you are presented with the “Get started” screen proceed to the next step - language and environment are set by the app.yaml file when the code is deployed.


##### Configure OAuth consent

Navigate to APIs and Services > OAuth consent screen to configure the OAuth consent screen.



*   Select User Type: Internal and click create.
*   Give your application a name.
*   Provide a contact email address for user support. This must be on the domain which is used by Workspace/GCP.
*   Provide an email address for developer contact information.
*   All other fields, including OAuth scopes, are not required. Save and continue to the summary screen, and then click save and continue again.


##### Create service account and generate key

Navigate to IAM and Admin > Service Accounts. You may be prompted to select your project again.



*   Click Create Service Account, enter a name and description, then click Create.
*   Under grant this service account access to project search for "Secret Manager Secret Assessor", select it and click continue.
*   Under Grant users access to this service account, enter the email address of the account you created to act on behalf of the Shikhsha application and click done.
*   Click the three dots listed under the Action menu next to the newly created service account, then choose Manage keys.
*   From the Add Key dropdown click Create new key. 
*   Choose JSON and click create.
*   The JSON key is downloaded to your local machine. This will be used in a later step.
*   Click Close and then the back arrow to return to the list of service accounts.
*   _Make a note of the service account name (e.g serviceaccountname@appspot.gserviceaccount.com) - you’ll need this in a later step._


##### Enable domain wide delegation

 Remaining in IAM and Admin > Service Accounts: click the newly created service account. 



*   Expand the Show domain-wide delegation section, check the box to enable Google Workspace Domain-wide Delegation, then save.
*   _Make a note of the Unique ID._

In a new browser tab, navigate to the[ Google admin console](https://admin.google.com) and log in as a super administrator. 



*   Using the hamburger menu in the upper left go to Security > API Controls, then under the Domain wide delegation section click Manage domain wide delegation.
*   Click Add new.
*   In the Client ID field, enter the Unique ID from the previous step.
*   In the OAuth scopes field, copy and paste the following scopes (comma delimited format required):

```https://www.googleapis.com/auth/admin.directory.user,https://www.googleapis.com/auth/admin.directory.group,https://www.googleapis.com/auth/admin.directory.group.member```



*   Click Authorize.


##### Additional IAM accounts

Return to the Google Cloud Console and via the hamburger menu go to IAM & Admin > IAM. Two additional accounts need to be added:

*   Click the Add button
*   In the New Members box type the name of the user assigned to the custom delegated admin role.
*   Under Select a role search for App Engine Admin and click save.
*   Click the Add button again.
*   In the New Members box type the name of your project followed by @appspot.gserviceaccount.com. This is the default service account for App Engine in your project.
*   Under Select a role search for Editor and select it.
*   Click Add another role, search for Secret Manager Secret Assessor and select it, then click save.


##### Configure secret manager

Navigate to Security > Secret Manager.


*   Click Create Secret
*   Name your secret, and use the Browse option to upload the JSON key you previously saved to your local machine.
*   _Replication policy, Encryption, Rotation, Notifications and Expiration can all be optionally configured, however are not required. Consult the [Secret Manager documentation](https://cloud.google.com/secret-manager/docs) for further details._
*   Click Create Secret.


##### Launch Cloudshell

Click on the Activate Cloud Shell link in the top right corner of the window or open the [Shell editor](https://shell.cloud.google.com/) in another tab. Alternatively you can use your local development environment to complete the rest of the steps.



*   Set the GCP project by running  ```gcloud config set project [PROJECT_ID]```
*   Clone the code from the Github repository: ```git clone https://github.com/XXXXX/XXXXXXXX.git```
*   Change directory into the new folder with the Shikhsha PoC code.
*   Install dependencies: ```npm install```
*   All configuration is read from the config.env file. Navigate to /config/sample_config.env file. Modify the file with appropriate variables and save it as config.env.
    *   ```PORT = 8080``` (Do not modify)
    *   ```GROUP_PREFIX = 'UM_'``` (Prefix used to filter groups visible in the application)
    *   ```PROJECT_ID = 'your_project``` (Replace your_project with the name of the GCP project)
    *   ```SECRET_KEY_NAME = 'secret_key'``` (Replace secret_key with the secret key name)
    *   ```JWT_SUBJECT = 'xxxxxx@xxxxxx.xxxxxxx'``` (Replace with the name of the delegated admin "user" who will act on behalf of the Shikhsha app)
    *   ```DOMAIN = 'xxxxxx.xxxxxxx'``` (Replace with the Workspace domain name).

*Ensure that any comments are deleted from the config.env file before deploying. Comments in an environment file that aren't on their own line will be read as a part of the variable and cause the app to be non functional.*


##### Deploy

To deploy, ensure you are in the root folder of the project (check the app.yaml file is in the same directory) and run:

```gcloud app deploy```

A prompt will appear to authorise Cloud Shell to make a GCP API call - click Authorise. You will be presented with a summary of services to enable: type y and enter to continue.

The app will take a while to deploy. On first run the error: ```ERROR: (gcloud.app.deploy) NOT_FOUND: Unable to retrieve P4SA:``` may appear while the deployment service account (automatically created) propagates. If so, run ```gcloud app deploy``` again.

Once complete, it will still take a few minutes to spin up - grab a coffee. 

##### Enable  Identity Aware Proxy

Note that login to the application *will fail* if IAP is not enabled - you will see NGINX errors if you try to access it before turning on IAP.

In order to only allow specified domain users to access the application,[ Identity-Aware Proxy](https://cloud.google.com/iap/docs/managing-access#turning_on_and_off) must be enabled. _Note non-domain users will not be able to access the application regardless of whether IAP is enabled as it is configured as an internal application only: [Google has hard review requirements](https://support.google.com/cloud/answer/9110914?hl=en) before it will allow apps hosted on GCP to request OAuth permissions for public account access._



*   Navigate to Security > Identity-Aware Proxy
*   Under HTTPS Resources, your application should be listed as an App Engine app.
*   The toggle under the IAP column will be off - click to enable it.
*   In the pop up dialog box click Turn On.
*   Click on the application name and in the popover window on the right, click the Add Member button.
*   Search for the appropriate user/group, then under the Select a role dropdown choose Cloud IAP > IAP-secured Web App User, then click save.
*   Repeat to add more users/groups.
*   It’s highly recommended to manage IAP access via  Groups as doing so by individual users is not scalable.

Once IAP is enabled, the first time a user accesses your app they will be redirected to a consent screen to confirm that they want to share their identity with your app. 

This occurs even if the user granted consent to the app _before you enabled IAP_, and will occur again if you disable IAP and then re-enable it.

##### Test the app

Navigate back to App Engine > Dashboard. In the upper right of the window you'll see a link to launch the app - click it.

At this point the application should be deployed and functional. If there is a blank screen when you try to access the app, or NGINX shows a timeout error, view app errors that are listed at the bottom of App Engine > Dashboard.
