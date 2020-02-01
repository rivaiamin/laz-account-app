// import collect from 'collect.js';
import * as $ from 'jquery';

var ledgerCtrl = [ '$location', '$scope', '$state', 'journalFactory', 'accountFactory', 
  function ($location, $scope, $state, journalFactory, accountFactory) {

  $scope.ledgers = [];
  $scope.ledger = {};
  $scope.onEdit = null;
  $scope.onLoad = true;
  $scope.ledgers = [];
  $scope.account = {};

  accountFactory.getAccounts().then(function (accounts) {
    $scope.accounts = accounts;
  });

  $scope.generateLedger = function(filter) {
    $scope.onLoad = true;
    journalFactory.getJournals(filter).then(function (journals) {
      journals.forEach(ledger => {
        ledger.date = new Date(ledger.date);
        return;
      });
      
      var index = $scope.indexSearch($scope.accounts, 'code', filter.account_code);
      $scope.account = $scope.accounts[index];

      var ledgers = [];
      var balance = 0;
      var total = {
        debit: 0,
        credit: 0,
        balance: 0,
      };
      journals.forEach(journal => {
        balance += journal.debit;
        balance -= journal.credit;
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
      total.balance = balance;

      $scope.ledgers = ledgers;
      $scope.total = total;

      $scope.onLoad = false;
    });
  }

}];

export { ledgerCtrl };