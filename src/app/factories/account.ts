
var accountFactory = [ '$http', '$rootScope', 'Env', function($http, $rootScope, Env) {
  var messages = {
    created: 'Akun baru telah tersimpan', 
    updated: 'Akun telah diperbarui', 
    deleted: 'Akun telah dihapus', 
  }

  return {
    getAccounts: function(params = {}) {
      return $http.get(Env.base + 'accounts', { params: params }).then(function (response) {
        var accounts = response.data.accounts;
        return accounts;
      })
    },
    findAccounts: function(code) {
      return $http.get(Env.base + 'accounts/' + code).then(function (response) {
        var account = response.data.account;
        return account;
      })
    },
    createAccount: function(request = {}) {
      return $http.post(Env.base + 'accounts', request ).then(function (response) {
        var account = response.data.account;
        $rootScope.swalNotif(messages.created, 'success');
        return account;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    updateAccount: function(code, request = {}) {
      return $http.put(Env.base + 'accounts/' + code, request ).then(function (response) {
        var account = response.data.account;
        $rootScope.swalNotif(messages.updated, 'success');
        return account;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    removeAccount: function(code) {
      return $http.delete(Env.base + 'accounts/' + code)
        .then(function (response) {
          $rootScope.swalNotif(messages.deleted, 'success');
          return true;
        }, function(response) {
          $rootScope.swalNotif(response.data.message, 'error');
          return false;
        });
    }
  }
}];

export { accountFactory };