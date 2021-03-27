
var reportFactory = [ '$http', '$rootScope', 'Env', function($http, $rootScope, Env) {
  return {
    getLedgers: function(params = {}) {
      return $http.get(Env.base + 'ledgers', { params: params }).then(function (response) {
        var data = {
          ledgers: response.data.ledgers,
          total: response.data.total
        } 
        return data;
      }, function(response) {
        console.log(response.data.message);
      })
    },
    exportLedgers: function(params = {}) {
      delete $http.defaults.headers.common['X-Requested-With'];
      return $http.get(Env.base + 'ledgers/export', 
        { params: params, responseType: 'arraybuffer' })
      .then(function (response) {
        var type = response.headers()['content-type'];
        var blob = new Blob([response.data], { type: type })
        return blob;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    getFinpositions: function(params = {}) {
      return $http.get(Env.base + 'finpositions', { params: params }).then(function (response) {
        var data = {
          finpositions: response.data.finpositions,
          totals: response.data.totals,
          balances: response.data.balances,
          mas_balances: response.data.mas_balances,
          first_journal: response.data.first_journal,
        } 
        return data;
      }, function(response) {
        console.log(response.data.message);
      })
    },
    exportFinpositions: function(params = {}) {
      delete $http.defaults.headers.common['X-Requested-With'];
      return $http.get(Env.base + 'finpositions/export', 
        { params: params, responseType: 'arraybuffer' })
      .then(function (response) {
        var type = response.headers()['content-type'];
        var blob = new Blob([response.data], { type: type })
        return blob;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    exportNetasset: function(params = {}) {
      delete $http.defaults.headers.common['X-Requested-With'];
      return $http.get(Env.base + 'finpositions/export/netasset', 
        { params: params, responseType: 'arraybuffer' })
      .then(function (response) {
        var type = response.headers()['content-type'];
        var blob = new Blob([response.data], { type: type })
        return blob;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    exportCashflow: function(params = {}) {
      delete $http.defaults.headers.common['X-Requested-With'];
      return $http.get(Env.base + 'finpositions/export/cashflow', 
        { params: params, responseType: 'arraybuffer' })
      .then(function (response) {
        var type = response.headers()['content-type'];
        var blob = new Blob([response.data], { type: type })
        return blob;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    exportActivity: function(params = {}) {
      delete $http.defaults.headers.common['X-Requested-With'];
      return $http.get(Env.base + 'finpositions/export/activity', 
        { params: params, responseType: 'arraybuffer' })
      .then(function (response) {
        var type = response.headers()['content-type'];
        var blob = new Blob([response.data], { type: type })
        return blob;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
  }
}];

export { reportFactory };