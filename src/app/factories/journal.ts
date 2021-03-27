
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
    exportJournals: function(params = {}) {
      delete $http.defaults.headers.common['X-Requested-With'];
      return $http.get(Env.base + 'journals/export', 
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
    findJournals: function(code) {
      return $http.get(Env.base + 'journals/' + code).then(function (response) {
        var journal = response.data.journal;
        return journal;
      })
    },
    createJournal: function(request = {}) {
      return $http.post(Env.base + 'journals', request ).then(function (response) {
        var journals = response.data.journals;
        $rootScope.swalNotif(messages.created, 'success');
        return journals;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    updateJournal: function(journal_id, request = []) {
      return $http.put(Env.base + 'journals/' + journal_id, request ).then(function (response) {
        var journal = response.data.journal;
        $rootScope.swalNotif(messages.updated, 'success');
        return journal;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    removeJournal: function(journal_id) {
      return $http.delete(Env.base + 'journals/' + journal_id).then(function (response) {
        $rootScope.swalNotif(messages.deleted, 'success');
        return true;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error');
        return false;
      })
    },
    getCashes: function(params = {}) {
      return $http.get(Env.base + 'cashes', { params: params }).then(function (response) {
        var cashes = response.data.cashes;
        return cashes;
      })
    },
    exportCashes: function(params = {}) {
      delete $http.defaults.headers.common['X-Requested-With'];
      return $http.get(Env.base + 'cashes/export', 
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

export { journalFactory };