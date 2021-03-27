import $ from 'jquery';

var dashboardCtrl = [ '$location', '$scope', '$rootScope', '$state', 'Env', function ($location, $scope, $rootScope, $state, Env) {
  
  $("select.dropdown").dropdown();
  $('.menu .item').tab();
  /* if ($rootScope.startup) {
  } */
  $('#welcomeModal').modal('show');
  
  $scope.closeModal = function() {
    $('#welcomeModal').modal('hide');
    $rootScope.startup = false;
  }

  $scope.env = Env;
}];

export { dashboardCtrl };