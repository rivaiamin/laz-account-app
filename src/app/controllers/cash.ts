import { collect } from "collect.js";

var cashCtrl = [ '$scope', '$localStorage', 'accountFactory', 'reportFactory',
  function ($scope, $localStorage, accountFactory, reportFactory) {

  $scope.cashes = [];
  $scope.tmp_cashes = [];
  $scope.cash = {
    date: new Date(),
    debit: 0,
    credit: 0
  };
  $scope.onLoad = true;
  $scope.showContent = false;
  $scope.cash_accounts = [];
  
  accountFactory.getAccounts().then(function (accounts) {
    $scope.accounts = accounts;
    $scope.cash_accounts = collect(accounts).filter((value:any) => value.parent_code == 11).pluck('code').all();
  })

  $scope.getAccountName = function(code) {
    var index = $scope.indexSearch($scope.accounts, 'code', code);
    return $scope.accounts[index].name;
  }

  $scope.generateCashflows = function(filter) {
    $scope.onLoad = true;
    $scope.showContent = false;

    $localStorage.filter['cashflow'] = filter;

    reportFactory.getFinpositions(filter).then(function (result) {
      if (result) {
        var finpositions = result.finpositions;
        var totals = result.totals;

        // Incomse
        var incomes = finpositions[4];
        var total_income = totals[4].credit - totals[4].debit;

        // Expenses
        var total_expense = 0;
        var expenses = [];
        finpositions[5].forEach(finposition => {
          if (finposition.account_code < 570000) {
            expenses.push(finposition)
            total_expense += finposition.credit - finposition.debit;
          }
        });

        // Invest 
        var total_invest = 0;
        var invests = [];
        finpositions[5].forEach(finposition => {
          if (finposition.account_code > 570000) {
            invests.push(finposition)
            total_invest += finposition.credit - finposition.debit;
          }
        });

        var balances = [];
        var total_balance = 0;
        // var balances = finpositions[3];
        // var total_balance = totals[3].credit - totals[3].debit;

        // last total
        var last_total = 0;
        if (result.first_journal) {
          result.first_journal.forEach(journal => {
            if (journal.account_code > 110000 && journal.account_code <= 120000) {
              last_total += journal.debit - journal.credit;
            }
          });
        }

        $scope.incomes = incomes;
        $scope.expenses = expenses;
        $scope.invests = invests;
        $scope.balances = balances;
        $scope.total_income = total_income;
        $scope.total_expense = total_expense;
        $scope.total_invest = total_invest;
        $scope.total_balance = total_balance;
        $scope.last_total = last_total;
        $scope.total_all = total_income + total_expense + total_invest + total_balance + last_total;

        $scope.showContent = true;
      }

      $scope.onLoad = false;
    });
  }

  /* $scope.generateCashes = function(params = {}) {
    try {
      $scope.onLoad = true;
      journalFactory.getCashes(params).then(function (cashes) {
        var total = 0;
        var cashflows = [];
        cashes.forEach(group => {
          group.forEach(cash => {
            if (!$scope.cash_accounts.includes(cash.account_code)) {
              var date = new Date(cash.date);
              var amount = cash.credit - cash.debit;
              total += amount;
              
              cashflows.push({
                date: date,
                desc: $scope.getAccountName(cash.account_code),
                amount: amount
              })
            }
          })
        });
  
        $scope.cashflows = cashflows;
        $scope.total = total;
        $scope.onLoad = false;
        $scope.showContent = true;
      });

    } catch (e) {
      console.log(e.message());
    }
  } */

  $scope.exportExcel = function(params = {}) {
    reportFactory.exportCashflow(params).then(blob => {
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = "Arus_Kas.xlsx"; 
      a.click();
    })
  }

  if ($localStorage.filter['cashflow']) {
    $scope.filter = $localStorage.filter['cashflow'];
    $scope.generateCashflows($scope.filter);
  }

}];

export { cashCtrl };