
var bankFactory = [ '$http', '$rootScope', 'Env', function($http, $rootScope, Env) {
  return {
    getBanks: function(params = {}) {
      return $http.get(Env.base + 'banks', { params: params }).then(function (response) {
        var banks = response.data.banks;
        return banks;
      })
    }
  }
}];

export { bankFactory };