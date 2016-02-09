var env = process.env.NODE_ENV || 'dev';

var config = {
  dev: {
    port: 3210,
    bddUri: 'candidate.62.mongolayer.com:10098,candidate.61.mongolayer.com:10413/compta-prod?replicaSet=set-568151a379f11e24e7000a65'
  },

  pre: {
    port: 3211,
    bddUri: 'candidate.62.mongolayer.com:10098,candidate.61.mongolayer.com:10413/compta-prod?replicaSet=set-568151a379f11e24e7000a65'
  },

  prod: {
    port: 3212,
    bddUri: 'candidate.62.mongolayer.com:10098,candidate.61.mongolayer.com:10413/compta-prod?replicaSet=set-568151a379f11e24e7000a65'
  }
};

module.exports = config[env];