// import * as $ from 'jquery';
import Swal from 'sweetalert2';

var psakCtrl = ['$scope', '$rootScope', '$localStorage', '$location', '$state', 'Env', 'accountFactory', 'institutionFactory',
  function ($scope, $rootScope, $localStorage, $location, $state, Env, accountFactory, institutionFactory) {

    $rootScope.env = Env;
    $scope.state = $state;
    $rootScope.messages = {
      saved: "Data telah tersimpan",
      deleted: "Data telah terhapus",
      notLoggedIn: "Email atau password salah"
    }
    if (!$localStorage.filter) {
      $localStorage.filter = [];
    }
    $rootScope.startup = true;

    $rootScope.getInitial = function(name) {
      var result = '';
      var split = name.split(" ");
      var suffix = ""
      if (name.length < 3) {
        result = name.substr(0);
      } else {
        result = split[0][0] + (split[split.length-1][0] !== undefined ? split[split.length-1][0] : split[split.length-2][0]);
      }
      return result.toUpperCase();
    }

    institutionFactory.startup().then(valid => {
      $localStorage.licensed = valid;
      $scope.licensed = valid;
    });

    $scope.isLoggedIn = function () {
      if ($localStorage.currentUser != undefined) {
        $scope.currentUser = $localStorage.currentUser;
        return true;
      } else return false;
    }

    $scope.isAdmin = function () {
      if ($scope.currentUser.role_id === 1) return true
      else return false;
    }
    $scope.isTeacher = function() {
      if ($scope.currentUser.role_id === 3) return true
      else return false;
    }

    /* $scope.notify = function (message, type = "info", icon = 'nc-icon nc-app') {
      $.notify({
        icon: icon,
        message: message
      }, {
        type: type
      });
    } */

    accountFactory.getAccounts().then(function (accounts) {
      accounts.push({ code: '', name: "-- Pilih Akun --" });
      $scope.accounts = accounts;
    })
  
    $scope.getAccountName = function(code) {
      var index = $scope.indexSearch($scope.accounts, 'code', code);
      if ($scope.accounts[index]) {
        return $scope.accounts[index].name;
      } else {
        return "";
      }
    }

    $scope.upgradeLicense = function() {
      institutionFactory.upgradeLicense().then(success => {
        console.log("upgrade license: " + success);
      })
    }

    $rootScope.swalNotif = function (message: string, type) {
      Swal.fire({
        position: 'center',
        type: type,
        title: message,
        showConfirmButton: false,
        timer: 1500
      });
    };

    $rootScope.swalConfirm = function (message:string, callback) {
      Swal.fire({
        title: 'Apa anda yakin?',
        text: message,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, tolong hapus!',
        cancelButtonText: 'Batal'
      }).then((result) => callback(result));
    }

    $scope.indexSearch = function(array, key, id) {
      return array.map(function(el) {
        return el[key];
      }).indexOf(id);
    }

    $scope.groupBy = function (array, f) {
      var groups = {};
      array.forEach(function (o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
      });
      return Object.keys(groups).map(function (group) {
        return groups[group];
      })
    };

    $scope.isMinus = function($num) {
      if ($num < 0) return true;
      else return false;
    }

    $scope.toAccountCur = function(num) {
      if (!num) return num;
      var text = '';
      if (num < 0) {
        num *= -1;
        text = num.toLocaleString('id-ID');
        text = '(' + text + ')';
      } else {
        text = num.toLocaleString('id-ID');
      }
      return text;
    }
  }
];

export {
  psakCtrl
};