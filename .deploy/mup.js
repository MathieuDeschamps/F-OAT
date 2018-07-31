module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: '131.254.150.70',
      username: 'root',
      pem: '/home/esnault/.ssh/id_rsa'
      // password: 'server-password'
      // or neither for authenticate from ssh-agent
    }
  },

  app: {
    // TODO: change app name and path
    name: 'F-OAT',
    path: '../',

    servers: {
      one: {},
    },

    // All options are optional.
    buildOptions: {
      serverOnly: true,
      // defaults to a a folder in your tmp folder.
      // buildLocation: '/var',
    },

    env: {
      // TODO: Change to your app's url
      // If you are using ssl, it needs to start with https://
      ROOT_URL: 'http://foat-backend.irisa.fr',
      MONGO_URL: 'mongodb://mongodb/meteor',
      MONGO_OPLOG_URL: 'mongodb://mongodb/local',
    },

    docker: {
      // change to 'abernix/meteord:base' if your app is using Meteor 1.4 - 1.5
      // image: 'abernix/meteord:base',
      image: 'abernix/meteord:node-8-base',
    },

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true
  },

  mongo: {
    version: '3.4.1',
    servers: {
      one: {}
    }
  },

  // (Optional)
  // Use the proxy to setup ssl or to route requests to the correct
  // app when there are several apps

  // proxy: {
  //   domains: 'mywebsite.com,www.mywebsite.com',

  //   ssl: {
  //     // Enable Let's Encrypt
  //     letsEncryptEmail: 'email@domain.com'
  //   }
  // }
};
