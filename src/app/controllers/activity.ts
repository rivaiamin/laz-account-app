var activityCtrl = [ '$scope', '$localStorage', 'accountFactory', 'reportFactory',
  function ($scope, $localStorage, accountFactory, reportFactory) {

  $scope.activities = [];
  $scope.tmp_activities = [];
  $scope.activity = {
    date: new Date(),
    debit: 0,
    credit: 0
  };
  $scope.onLoad = true;
  $scope.showContent = false;
  
  accountFactory.getAccounts().then(function (accounts) {
    $scope.accounts = accounts;
  })

  $scope.getAccountName = function(code) {
    var index = $scope.indexSearch($scope.accounts, 'code', code);
    return $scope.accounts[index].name;
  }

  $scope.generateActivities = function(filter) {
    $scope.onLoad = true;
    $scope.showContent = false;

    $localStorage.filter['activity'] = filter;

    reportFactory.getFinpositions(filter).then(function (result) {
      if (result) {
        var finpositions = result.finpositions;
        var totals = result.totals;

        // Unbound Income
        var total_unbound_income = 0;
        var unbound_incomes = [];
        finpositions[4].forEach(finposition => {
          if (finposition.account_code > 440000) {
            unbound_incomes.push(finposition)
            total_unbound_income += finposition.credit - finposition.debit;
          }
        });

        // Unbound Expense
        var total_unbound_expense = 0;
        var unbound_expenses = [];
        finpositions[5].forEach(finposition => {
          if (finposition.account_code > 540000) {
            unbound_expenses.push(finposition)
            total_unbound_expense += finposition.credit - finposition.debit;
          }
        });

        // Bound Income
        var total_bound_income = 0;
        var bound_incomes = [];
        finpositions[4].forEach(finposition => {
          if (finposition.account_code < 440000) {
            bound_incomes.push(finposition)
            total_bound_income += finposition.credit - finposition.debit;
          }
        });

        // Bound Expense
        var total_bound_expense = 0;
        var bound_expenses = [];
        finpositions[5].forEach(finposition => {
          if (finposition.account_code < 540000) {
            bound_expenses.push(finposition)
            total_bound_expense += finposition.credit - finposition.debit;
          }
        });

        // last total
        var last_total = 0;
        if (result.first_journal) {
          result.first_journal.forEach(journal => {
            last_total += journal.credit;
          });
        }

        $scope.unbound_incomes = unbound_incomes;
        $scope.unbound_expenses = unbound_expenses;
        $scope.total_unbound_expense = total_unbound_expense;
        $scope.total_unbound_income = total_unbound_income;
        
        $scope.bound_incomes = bound_incomes;
        $scope.bound_expenses = bound_expenses;
        $scope.total_bound_income = total_bound_income;
        $scope.total_bound_expense = total_bound_expense;
        
        $scope.last_total = last_total;
        $scope.total_final = total_unbound_income + total_unbound_expense + total_bound_income + total_bound_expense;

        $scope.showContent = true;
      }

      $scope.onLoad = false;
    });
  }

  $scope.exportExcel = function(params = {}) {
    reportFactory.exportActivity(params).then(blob => {
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = "Laporan_Aktivitas.xlsx"; 
      a.click();
    })
  }

  if ($localStorage.filter['activity']) {
    $scope.filter = $localStorage.filter['activity'];
    $scope.generateActivities($scope.filter);
  }

}];

export { activityCtrl };