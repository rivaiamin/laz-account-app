
var userFactory = [ '$http', '$rootScope', 'Env', function($http, $rootScope, Env) {
  return {
    getAccounts: function(params = {}) {
      return $http.get(Env.base + 'accounts', { params: params }).then(function (response) {
        var accounts = response.data.accounts;
        $rootScope.$broadcast('handlesubjectFactorys', accounts);
        return accounts;
      })
    },
    postAccount: function(request = {}) {
      return $http.post(Env.base + 'accounts', request ).then(function (response) {
        var accounts = response.data.accounts;
        $rootScope.$broadcast('handlesubjectFactorys', accounts);
        return accounts;
      })
    },
  }
}];

export { userFactory };