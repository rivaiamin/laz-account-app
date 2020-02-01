var loginCtrl = [ '$location', '$scope', '$state', 'AuthenticationService', function ($location, $scope, $state, AuthenticationService) {

  function initController() {
    // reset login status
    AuthenticationService.Logout();
  };
  
  initController();
  
  $scope.doLogin = function(vm) {
    $scope.isLoading = true;
    AuthenticationService.Login(vm.email, vm.password, function (result) {
      if (result === true) {
        $location.path('/');
      } else {
        var errorMsg = 'Email or password is incorrect';
        $scope.notify(errorMsg, 'error');
        $scope.isLoading = false;
      }
    });
  };
}];

export { loginCtrl };