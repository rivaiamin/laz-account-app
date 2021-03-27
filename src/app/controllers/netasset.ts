// import collect from 'collect.js';
var netassetCtrl = [ '$scope', '$localStorage', 'accountFactory', 'reportFactory', 
  function ( $scope, $localStorage, accountFactory, reportFactory) {

  $scope.netassets = {};
  $scope.netasset = {};
  $scope.onEdit = null;
  $scope.onLoad = true;
  $scope.showContent = false;
  $scope.account = {};

  accountFactory.getAccounts().then(function (accounts) {
    $scope.accounts = accounts;
    
    var balance_accounts = [];
    accounts.forEach(account => {
      var p = account.code.toString().substring(0, 1);
      var q = account.code.toString().substring(1, 2);

      if (p == 3 && account.level == 3) {
        account.subparent = q;
        balance_accounts.push(account);
      }
      $scope.balance_accounts = balance_accounts;
    })
  });

  $scope.generateNetasset = function(filter) {
    $scope.onLoad = true;
    $scope.showContent = false;

    $localStorage.filter['netasset'] = filter;

    reportFactory.getFinpositions(filter).then(function (result) {
      if (result) {
        $scope.netassets = result.finpositions;

        $scope.totals = result.totals;
        $scope.showContent = true;
      }

      $scope.onLoad = false;
    });
  }

  $scope.exportExcel = function(params = {}) {
    reportFactory.exportNetasset(params).then(blob => {
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = "Perubahan_Aset_Bersih.xlsx"; 
      a.click();
    })
  }

  if ($localStorage.filter['netasset']) {
    $scope.filter = $localStorage.filter['netasset'];
    $scope.generateNetasset($scope.filter);
  }

}];

export { netassetCtrl };