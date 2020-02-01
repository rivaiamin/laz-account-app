
var journalFactory = [ '$http', '$rootScope', 'Env', function($http, $rootScope, Env) {
  var messages = {
    created: 'Jurnal baru telah ditambahkan', 
    updated: 'Jurnal telah diperbarui', 
    deleted: 'Jurnal telah dihapus', 
  }

  return {
    getJournals: function(params = {}) {
      return $http.get(Env.base + 'journals', { params: params }).then(function (response) {
        var journals = response.data.journals;
        return journals;
      })
    },
    findJournals: function(code) {
      return $http.get(Env.base + 'journals/' + code).then(function (response) {
        var journal = response.data.journal;
        return journal;
      })
    },
    createJournal: function(request = {}) {
      return $http.post(Env.base + 'journals', request ).then(function (response) {
        var journal = response.data.journal;
        $rootScope.swalNotif(messages.created, 'success');
        return journal;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    updateJournal: function(code, request = {}) {
      return $http.put(Env.base + 'journals/' + code, request ).then(function (response) {
        var journal = response.data.journal;
        $rootScope.swalNotif(messages.updated, 'success');
        return journal;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    removeJournal: function(code) {
      return $http.delete(Env.base + 'journals/' + code).then(function (response) {
        $rootScope.swalNotif(messages.deleted, 'success');
        return true;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
  }
}];

export { journalFactory };