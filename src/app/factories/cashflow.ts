
var cashflowFactory = [ '$http', '$rootScope', 'Env', function($http, $rootScope, Env) {
  var messages = {
    created: 'Jurnal baru telah ditambahkan', 
    updated: 'Jurnal telah diperbarui', 
    deleted: 'Jurnal telah dihapus', 
  }

  return {
    getCashflows: function(params = {}) {
      return $http.get(Env.base + 'cashflows', { params: params }).then(function (response) {
        var cashflows = response.data.cashflows;
        return cashflows;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    reportCashflows: function(params = {}) {
      return $http.get(Env.base + 'cashflows/reports', { params: params, responseType: 'arrayBuffer' }).then(function (response) {
        try {
          var type = response.headers()['content-type'];
          var blob = new Blob([response.data], { type: type });
          return blob;
        } catch (e) {
          console.log(e);
        }
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'errror');
        return false;
      })
    }
  }
}];

export { cashflowFactory };