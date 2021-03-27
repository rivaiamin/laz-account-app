import collect from 'collect.js';

var accountCtrl = [ '$scope', '$rootScope', 'accountFactory', 
function ($scope, $rootScope, accountFactory) {

  $scope.accounts = [];
  $scope.account = {};
  $scope.onEdit = null;
  $scope.onLoad = true;
  $scope.code_length = 0;
  accountFactory.getAccounts().then(function (accounts) {
    $scope.accounts = accounts;
    $scope.onLoad = false;
  });

  $scope.createAccount = function(account) {

    if (account.level && account.parent_code && account.code && account.name) {
      $scope.onSave = true;
  
      if (account.level == 1) {
        account.sequence = account.code * 100000;
      } else if (account.level == 2) {
        account.sequence = account.code * 10000;
      } else {
        account.sequence = account.code;
      }
  
      account.code = parseInt(account.code);
      account.level = parseInt(account.level);
      account.sequence = parseInt(account.sequence);
  
      accountFactory.createAccount(account).then(function (account) {
        if (account) {
          $scope.accounts.push(account);
          $rootScope.accounts.push(account);
          $scope.account = {};
        }
        $scope.onSave = false;
      });
    } else {
      $scope.swalNotif('Masih ada kolom input yang kosong', 'error');
    }
  }

  $scope.updateAccount = function(account) {
    var code = account.code;
    account = collect(account).only(['name', 'description', 'balance']);

    accountFactory.updateAccount(code, account).then(function (account) {
      if (account) {
        var index = $scope.indexSearch($scope.accounts, 'code', code);
        $scope.accounts[index] = account;
        $scope.onEdit = false;
      }
    })
  }

  $scope.editAccount = function(code) {
    $scope.onEdit = code;
  }

  $scope.cancelEdit = function() {
    $scope.onEdit = null;
  }

  $scope.removeAccount = function(code) {
    $scope.swalConfirm('Anda yakin menghapus akun ini?', function(result) {
      if (result.value) {
        accountFactory.removeAccount(code).then(result => {
          if (result) {
            var index = $scope.indexSearch($scope.accounts, 'code', code);
            $scope.accounts.splice(index, 1);
          }
        });
      }
    });
  }

  $scope.exportExcel = function(params = {}) {
    accountFactory.exportAccounts(params).then(blob => {
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = "Akun.xlsx"; 
      a.click();
    })
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

}];

export { accountCtrl };