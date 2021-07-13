// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { auth } = require('google-auth-library');
var cache = require('../util/memoryCache');

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// const app = express();

const scopes = [
  'https://www.googleapis.com/auth/admin.directory.user',
  'https://www.googleapis.com/auth/admin.directory.group',
  'https://www.googleapis.com/auth/admin.directory.group.member',
];

const authorizeDirectory = async function () {
  var admin = cache.get('admin');

  if (!admin) {
    const client = new SecretManagerServiceClient();

    async function accessSecretVersion() {
      const [version] = await client.accessSecretVersion({
        name: `projects/codename-shikhsha/secrets/${process.env.APP_ENGINE_NAME}/versions/latest`,
      });

      // Extract the payload as a string.
      const payload = version.payload.data.toString();
      return payload;
    }

    const key = await accessSecretVersion();
    const jsonKey = JSON.parse(key);

    var jwt = new google.auth.JWT({
      email: jsonKey.client_email,
      key: jsonKey.private_key,
      subject: process.env.JWT_SUBJECT,
      scopes: scopes,
    });

    admin = await google.admin({
      version: 'directory_v1',
      auth: jwt,
    });

    cache.set('admin', admin);
  } else {
    console.log('admin found in cache');
  }

  return admin;
};

/**
 * Lists the first 10 users in the domain.
 *
 */
const listUsers = async function (res) {
  const admin = await authorizeDirectory();
  // list the first 10 users
  admin.users.list(
    {
      domain: process.env.DOMAIN,
      maxResults: 10,
      orderBy: 'email',
    },
    (err, resp) => {
      if (err) return console.error('The API returned an error:', err);

      const users = resp.data.users;
      //   res.status(200);
      var usersStr = '';
      if (users.length) {
        console.log('Users:');
        users.forEach((user) => {
          usersStr =
            usersStr + `${user.primaryEmail} (${user.name.fullName})<br>`;
          console.log(`${user.primaryEmail} (${user.name.fullName})`);
        });
      } else {
        usersStr = 'No users found.';
        console.log('No users found.');
      }
      //   res.send(usersStr);
      res.end();
    }
  );
};

// **** Lists the groups ****

const listGroups = async function (email) {
  var groups = [];
  const admin = await authorizeDirectory();

  // list the first 10 users
  const resp = await admin.groups.list({
    maxResults: 200,
    userKey: email,
  });
  console.log('***** LINE SEPARATOR ***********');
  groups = resp.data.groups;
  // console.log(groups)
  // var resultGroups = groups.map(a => a.name)
  var resultGroups = groups.filter((a) =>
    a.name.includes(process.env.GROUP_PREFIX)
  );
  console.log(resultGroups);
  return resultGroups;
};

module.exports = {
  authorizeDirectory,
  listUsers,
  listGroups,
};
