// import collect from 'collect.js';
import * as $ from 'jquery';

var journalCtrl = [ '$location', '$scope', '$state', 'journalFactory', 'accountFactory', 
  function ($location, $scope, $state, journalFactory, accountFactory) {

  $scope.journals = [];
  $scope.journal = {};
  $scope.onEdit = null;
  $scope.onLoad = true;

  accountFactory.getAccounts().then(function (accounts) {
    $scope.accounts = accounts;
  })

  $scope.getAccountName = function(code) {
    var index = $scope.indexSearch($scope.accounts, 'code', code);
    console.log(code);
    return $scope.accounts[index].name;
  }

  journalFactory.getJournals().then(function (journals) {

    journals.forEach(journal => {
      journal.date = new Date(journal.date);
      return;
    });

    $scope.journals = journals;
    $scope.onLoad = false;
  });

  $scope.createJournal = function(journal) {
    if (journal.date && journal.code && journal.account_code && journal.debit >= 0 && journal.credit >= 0) {
      $scope.onSave = true;
  
      journal.account_code = parseInt(journal.account_code);
  
      journalFactory.createJournal(journal).then(function (journal) {
        if (journal) {
          $scope.journals.push(journal);
          $scope.journal = {};
        }
        $scope.onSave = false;
      });
    } else {
      $scope.swalNotif('Masih ada kolom input yang kosong', 'error');
    }
  }

  $scope.updateJournal = function(journal) {
    var code = journal.code;

    journalFactory.updateJournal(code, journal).then(function (journal) {
      if (journal) {
        var index = $scope.indexSearch($scope.journals, 'code', code);
        $scope.journals[index] = journal;
        $scope.onEdit = false;
      }
    })
  }

  $scope.editJournal = function(journal) {
    $scope.onEdit = journal.code;
    $scope.journalEdit = journal;
    $('.ui.modal').modal('show');
  }

  $scope.removeJournal = function(code) {
    $scope.swalConfirm('Anda yakin menghapus jurnal ini?', function(result) {
      if (result.value) {
        journalFactory.removeJournal(code).then(result => {
          if (result) {
            var index = $scope.indexSearch($scope.journals, 'code', code);
            $scope.journals.splice(index, 1);
          }
        });
      }
    });
  }

}];

export { journalCtrl };