// import collect from 'collect.js';
import * as $ from 'jquery';

var finpositionCtrl = [ '$scope', '$localStorage', 'accountFactory', 'reportFactory', 
  function ( $scope, $localStorage, accountFactory, reportFactory) {

  $scope.finpositions = {};
  $scope.finposition = {};
  $scope.onEdit = null;
  $scope.onLoad = true;
  $scope.showContent = false;
  $scope.account = {};

  accountFactory.getAccounts().then(function (accounts) {
    $scope.accounts = accounts;

    var balance_accounts = [];
    accounts.forEach(account => {
      if (account.code > 300000 && account.code < 400000) {
        balance_accounts.push(account);
      }
    });
    $scope.balance_accounts = balance_accounts

  });

  $scope.generateFinposition = function(filter) {
    $scope.onLoad = true;
    $scope.showContent = false;

    $localStorage.filter['finposition'] = filter;

    reportFactory.getFinpositions(filter).then(function (result) {
      try {
        if (result) {
          $scope.finpositions = result.finpositions;
  
          $scope.totals = result.totals;
  
          var total_balance = 0
          // var merge_balances = [];
          Object.values(result.balances).forEach((balance:any) => {
            total_balance += balance.total;
            return true;
          })
          /* Object.values(result.balances).forEach((balance:any) => {
            total_balance += balance.total;
            merge_balances.push(balance);
            return true;
          }); */
          /* result.mas_balances.forEach((balance:any) => {
            if (balance.code == 320005) {
              total_balance += balance.total;
              merge_balances.push(balance);
            }
            return true;
          }) */
          
          $scope.total_balance = total_balance;
          $scope.balances = result.balances;
          // $scope.merge_balances = merge_balances;
          $scope.showContent = true;
        }
  
        $scope.onLoad = false;

      } catch (e) {
        console.log(e);
      }
    });
  }

  $scope.exportExcel = function(params = {}) {
    reportFactory.exportFinpositions(params).then(blob => {
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = "Laporan_Posisi_Keuangan.xlsx"; 
      a.click();
    })
  }

  if ($localStorage.filter['finposition']) {
    $scope.filter = $localStorage.filter['finposition'];
    $scope.generateFinposition($scope.filter);
  }

}];

export { finpositionCtrl };