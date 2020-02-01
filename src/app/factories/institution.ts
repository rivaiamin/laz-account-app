
var institutionFactory = [ '$http', '$rootScope', 'Env', function($http, $rootScope, Env) {
  var messages = {
    updated: "Data lembaga telah diperbarui"
  }
  
  return {
    getInstitution: function(params = {}) {
      return $http.get(Env.base + 'institution', { params: params }).then(function (response) {
        var institution = response.data.institution;
        return institution;
      })
    },
    updateInstitution: function(request = {}) {
      return $http.put(Env.base + 'institution', request ).then(function (response) {
        var institution = response.data.institution;
        $rootScope.swalNotif(messages.updated, 'success')
        return institution;
      }, function(response) {
        $rootScope.swalNotif(response.data.message, 'error')
        return false;
      })
    }
  }
}];

export { institutionFactory };