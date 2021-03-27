// import collect from 'collect.js';
import * as $ from 'jquery';

var ledgerCtrl = [ '$scope', '$localStorage', 'accountFactory', 'reportFactory', 
  function ( $scope, $localStorage, accountFactory, reportFactory) {

  $scope.ledgers = [];
  $scope.ledger = {};
  $scope.onEdit = null;
  $scope.onLoad = true;
  $scope.ledgers = [];
  $scope.account = {};

  /* accountFactory.getAccounts().then(function (accounts) {
    $scope.accounts = accounts;
  }); */

  $scope.generateLedger = function(filter) {
    $scope.onLoad = true;

    $localStorage.filter['ledger'] = filter;

    reportFactory.getLedgers(filter).then(function (result) {
      /* journals.forEach(ledger => {
        ledger.date = new Date(ledger.date);
        return;
      });
      
      var ledgers = [];
      var balance = 0;
      var total = {
        debit: 0,
        credit: 0,
        balance: 0,
      };
      journals.forEach(journal => {
        balance -= journal.debit;
        balance += journal.credit;
        total.debit += journal.debit;
        total.credit += journal.credit;
        ledgers.push({
          journal_code: journal.code,
          date: journal.date,
          description: journal.description,
          debit: journal.debit,
          credit: journal.credit,
          balance: balance
        })
      });
      total.balance = balance; */

      $scope.ledgers = result.ledgers;
      $scope.total = result.total;
      var index = $scope.indexSearch($scope.accounts, 'code', filter.account_code);
      $scope.account = $scope.accounts[index];

      $scope.onLoad = false;
    });
  }

  $scope.exportExcel = function(params:any = {}) {
    reportFactory.exportLedgers(params).then(blob => {
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = "Buku_Besar_"+ params.account_code +".xlsx"; 
      a.click();
    })
  }

  if ($localStorage.filter['ledger']) {
    $scope.filter = $localStorage.filter['ledger'];
    $scope.generateLedger($scope.filter);
  }

}];

export { ledgerCtrl };