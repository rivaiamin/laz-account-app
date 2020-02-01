import collect from 'collect.js';

var accountCtrl = [ '$location', '$scope', '$state', 'accountFactory', function ($location, $scope, $state, accountFactory) {

  $scope.accounts = [];
  $scope.account = {};
  $scope.onEdit = null;
  $scope.onLoad = true;
  accountFactory.getAccounts().then(function (accounts) {
    $scope.accounts = accounts;
    $scope.onLoad = false;
  });

  $scope.createAccount = function(account) {

    if (account.code && account.name && account.balance) {
      $scope.onSave = true;
  
      if (account.code.length <= 1) {
        account.level = 1;
        account.sequence = account.code * 100000;
      } else if (account.code.length <= 2) {
        account.level = 2;
        account.sequence = account.code * 10000;
      } else {
        account.level = 2;
        account.sequence = account.code;
      }
  
      account.code = parseInt(account.code);
  
      accountFactory.createAccount(account).then(function (account) {
        if (account) {
          $scope.accounts.push(account);
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

}];

export { accountCtrl };