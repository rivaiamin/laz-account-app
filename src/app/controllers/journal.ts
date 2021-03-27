import collect from 'collect.js';
import * as $ from 'jquery';

var journalCtrl = [ '$scope', '$localStorage', 'journalFactory', 'accountFactory', 'Upload', 'Env',
  function ($scope, $localStorage, journalFactory, accountFactory, Upload, Env) {

  $scope.journals = [];
  $scope.tmp_journals = [];
  $scope.journal = {
    date: new Date(),
    debit: 0,
    credit: 0
  };
  $scope.onEdit = null;
  $scope.onLoad = true;
  $scope.code_length = 0;

  /* accountFactory.getAccounts().then(function (accounts) {
    accounts.push({ code: 0, name: "-- Pilih Akun --" });
    $scope.accounts = accounts;
  }) */

  /* $scope.getAccountName = function(code) {
    var index = $scope.indexSearch($scope.accounts, 'code', code);
    if ($scope.accounts[index]) {
      return $scope.accounts[index].name;
    } else {
      return "";
    }
  } */

  $scope.getJournals = function(params = {}) {

    $localStorage.filter['journal'] = params;
    try {
      journalFactory.getJournals(params).then(function (journals) {
    
        journals.forEach(journal => {
          journal.date = new Date(journal.date);
          return;
        });
        
        var tmp_journals = {};
        journals.forEach((journal) => {
          var key = 'i' + journal.journal_id.toString();
          if (!tmp_journals[key]) tmp_journals[key] = { date: null, items: [] };
          tmp_journals[key].date = journal.date;
          tmp_journals[key].items.push(journal);
        });

        var tmp_journals2 = []; 
        Object.keys(tmp_journals).forEach(key => {
          tmp_journals2.push(tmp_journals[key]);
        });

        // $scope.journals = collect(journals).groupBy('journal_id').all();
        $scope.journals = tmp_journals2;
        $scope.onLoad = false;
      });
    } catch (e) {
      console.log(e);
    }
  }

  $scope.addJournal = function(journal) {
    if (journal.date && journal.account_code && journal.debit >= 0 && journal.credit >= 0) {
      /* var journalIDs = Object.keys($scope.journals);
      if (journalIDs.length < 1) {
        journal.journal_id = 1;
        journal.id = 1 + $scope.tmp_journals.length;
      } else {
        var journalID = parseInt(journalIDs[journalIDs.length - 1]);
        journal.journal_id = journalID + 1; 
        journal.id = journalID + $scope.tmp_journals.length;
      } */

      journal.account_code = parseInt(journal.account_code);
      $scope.tmp_journals.push(journal);
      $scope.journal = {
        date: new Date(),
        debit: 0,
        credit: 0,
      };
    } else {
      $scope.swalNotif('Masih ada kolom input yang kosong', 'error');
    }
  }

  $scope.removeTmpJournal = function(index) {
    $scope.tmp_journals.splice(index, 1);
  }

  $scope.createJournal = function() {
    // Check balance validation
    var total_debit = 0; 
    var total_credit = 0;
    $scope.tmp_journals.forEach(journal => {
      total_debit += journal.debit;
      total_credit += journal.credit;
    })

    if (total_credit == total_debit) {
      $scope.onSave = true;
      journalFactory.createJournal($scope.tmp_journals).then(function (journals) {
        if (journals.length > 0) {
          try {
            $scope.journals[journals[0].journal_id] = {
              date: journals[0].date,
              items: journals
            }
            $scope.journal = {};
            $scope.tmp_journals = [];
          } catch (e) {
            console.log(e);
          }
        }
        $scope.onSave = false;
      });
    } else {
      $scope.swalNotif('Jurnal anda belum balance, tolong direvisi', 'error')
    }
  }

  $scope.updateJournal = function(journals) {

    var debit = 0; 
    var credit = 0;
    journals.forEach(journal => {
      debit += journal.debit; 
      credit += journal.credit; 
    })

    if (credit == debit) {
      var journal_id = journals[0].journal_id;
  
      journalFactory.updateJournal(journal_id, journals).then(function (journal) {
        if (journal) {
          $scope.journals[journal_id] = journal;
          $scope.onEdit = false;
        }
      })
    } else {
      $scope.swalNotif('Jurnal belum balance, tolong direvisi', 'error');
    }
  }

  $scope.editJournals = function(journals) {
    $scope.onEdit = journals[0].journal_id;
    journals.forEach(journal => {
      journal.date = new Date(journal.date);
    })
    $scope.journalEdit = journals;
    $('#editJournal').modal('show');
  }

  $scope.removeJournals = function(journal_id) {
    $scope.swalConfirm('Anda yakin menghapus jurnal ini?', function(result) {
      if (result.value) {
        journalFactory.removeJournal(journal_id).then(result => {
          if (result) {
            delete $scope.journals[journal_id];
          }
        });
      }
    });
  }

  $scope.exportExcel = function(params = {}) {
    journalFactory.exportJournals(params).then(blob => {
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = "Jurnal.xlsx"; 
      a.click();
    })
  }

  // upload on file select or drop
  $scope.importExcel = function (file) {
    Upload.upload({
        url: Env.base + 'journals/import',
        data: { file: file }
    }).then(function (resp) {
      $scope.swalNotif('Jurnal berhasil terimpor', 'success');
      if (resp.data.journals.length > 0) {
        var journals = collect(resp.data.journals).groupBy('journal_id').all();
        for (var id in journals) {
          $scope.journals[id] = journals[id];
        }
      }
      
      console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
    }, function (resp) {
      $scope.swalNotif(resp.data.message, 'error');
      console.log('Error status: ' + resp.status);
    }, function (evt:any) {
        var progressPercentage = 100.0 * evt.loaded / evt.total;
        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
    });
  };

  $scope.addAccount = function() {
    $('#addAccount').modal('show');
  }

  $scope.saveAccount = function(account) {

    if (account.level && account.parent_code && account.code && account.name) {
      $scope.onSave = true;
  
      if (account.code.length <= 1) {
        account.level = 1;
        account.sequence = account.code * 100000;
      } else if (account.code.length <= 2) {
        account.level = 2;
        account.sequence = account.code * 10000;
      } else {
        account.level = 3;
        account.sequence = account.code;
      }
  
      account.code = parseInt(account.code);
      account.sequence = parseInt(account.sequence);
  
      accountFactory.createAccount(account).then(function (account) {
        if (account) {
          $scope.accounts.push(account);
          $scope.account = {};
          $scope.journal.account_code = account.code;
        }
        $scope.onSave = false;
      });
    } else {
      $scope.swalNotif('Masih ada kolom input yang kosong', 'error');
    }
  }

  $scope.resetFilter = function() {
    $scope.filter = {};
    $localStorage.filter['journal'] = {};
  }

  $scope.setCodeLength = function(level) {
    var length = 0;
    if (level == 1) {
      length = 1;
    } else if (level == 2) {
      length = 2;
    } else if (level == 3) {
      length = 6;
    }

    $scope.code_length = length;
  }

  if ($localStorage.filter['journal']) {
    $scope.filter = $localStorage.filter['journal'];
    $scope.getJournals($scope.filter);
  } else {
    $localStorage.filter['journal'] = {};
    $scope.getJournals();
  }
}];

export { journalCtrl };