var institutionCtrl = [ '$location', '$scope', '$state', 'institutionFactory', 'Env', 'Upload', 
  function ($location, $scope, $state, institutionFactory, Env, Upload) {
    $scope.institution = {};
    $scope.finance = {};
    $scope.management = {};
    $scope.onEditManagement = -1;
    $scope.onEditFinance = -1;

    institutionFactory.getInstitution().then( function(institution) {
      $scope.institution = institution;
    });

    $scope.updateInstitution = function(institution) {
      institutionFactory.updateInstitution(institution).then(function (response) {
        if (response) {
          $scope.institution = institution;
        }
      });
    }

    $scope.addManagement = function(item) {
      $scope.institution.managements.push(item);
      $scope.management = {};
    }

    $scope.addFinance = function(item) {
      $scope.institution.finances.push(item);
      $scope.finance = {};
    }

    $scope.editManagement = function(index) {
      $scope.onEditManagement = index;
    }

    $scope.editFinance = function(index) {
      $scope.onEditFinance = index;
    }

    $scope.cancelEditFinance = function() {
      $scope.onEditFinance = -1;
    }

    $scope.cancelEditManagement = function() {
      $scope.onEditManagement = -1;
    }
    
    $scope.updateManagement = function(index, data) {
      $scope.institution.managements[index] = data;
      $scope.onEditManagement = -1;
    }
    $scope.updateFinance = function(index, data) {
      $scope.institution.finances[index] = data;
      $scope.onEditFinance = -1;
    }

    $scope.removeManagement = function(index) {
      $scope.swalConfirm("Anda yakin untuk menghapus ini?", function(result) {
        try {
          if (result.value) {
            $scope.institution.managements.splice(index, 1);
            $scope.$apply();
          }
        } catch (e) {
          console.log(e.message);
        }
      })
    }

    $scope.removeFinance = function(index) {
      $scope.swalConfirm("Anda yakin untuk menghapus ini?", function(result) {
        if (result.value) { 
          $scope.institution.finances.splice(index, 1);
          $scope.$apply();
        }
      })
    }

    // upload on file select or drop
    $scope.upload = function (file) {
      console.log("gak mau");
      Upload.upload({
          url: Env.base + 'institution/logo',
          data: { file: file }
      }).then(function (resp) {
          console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
      }, function (resp) {
          console.log('Error status: ' + resp.status);
      }, function (evt:any) {
          var progressPercentage = 100.0 * evt.loaded / evt.total;
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      });
    };
}];

export { institutionCtrl };