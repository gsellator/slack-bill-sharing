var env = process.env.NODE_ENV || 'dev';

var config = {
  dev: {
    port: 3210,
    bddUri: 'mongodb://localhost/slack-bill-sharing-dev'
  },

  pre: {
    port: 3211,
    bddUri: 'mongodb://localhost/slack-bill-sharing-pre'
  },

  prod: {
    port: 3212,
    bddUri: 'mongodb://localhost/slack-bill-sharing-prod'
  }
};

module.exports = config[env];