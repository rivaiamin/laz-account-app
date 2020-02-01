import collect from 'collect.js';
import * as $ from 'jquery';

// finposCtrl means Financial Position
var finposCtrl = [ '$location', '$scope', '$state', 'journalFactory', 'accountFactory', 
  function ($location, $scope, $state, journalFactory, accountFactory) {

  $scope.finposs = [];
  $scope.finpos = {};
  $scope.onEdit = null;
  $scope.onLoad = true;
  $scope.finposs = [];
  $scope.account = {};

  accountFactory.getAccounts().then(function (accounts) {
    $scope.accounts = accounts;
  });   

  $scope.generateFinpos = function(filter) {
    $scope.onLoad = true;
    journalFactory.getJournals(filter).then(function (journals) {
      journals.forEach(journal => {
        journal.date = new Date(journal.date);
        return journal;
      });
      
      journals = collect(journals).groupBy('account_code').all();
      var journal_keys = Object.keys(journals);
      var totals = {};
      journal_keys.forEach(key => {
        totals[key] = {
          debit: journals[key].sum('debit'),
          credit: journals[key].sum('credit')
        } 
      })
      console.log(totals);
    });
  }

}];

export { finposCtrl };