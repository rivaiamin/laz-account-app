var institutionCtrl = [ '$location', '$scope', '$state', 'institutionFactory', 'Env', 'Upload', 
  function ($location, $scope, $state, institutionFactory, Env, Upload) {
    $scope.institution = {};
    $scope.finance = {};
    $scope.management = {};
    $scope.onEditManagement = -1;
    $scope.onEditFinance = -1;
    $scope.uploadedFile = '';

    institutionFactory.getInstitution().then( function(institution) {
      $scope.institution = institution;
    });

    $scope.updateInstitution = function(institution) {
      institutionFactory.updateInstitution(institution).then(function (response) {
        if (response) {
          $scope.institution = institution;
          return true;
        } else {
          return false;
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

    $scope.removeFile = function(index) {
      $scope.institution.files.splice(index, 1);
      $scope.updateInstitution($scope.institution);
    }

    // upload on file select or drop
    $scope.uploadImage = function (file) {
      Upload.upload({
          url: Env.base + 'institution/logo',
          data: { file: file }
      }).then(function (resp) {
          var time = new Date().getTime();
          var image = "http://localhost:5000/api/institution/logo?random="+time;
          document.getElementById('logoImageForm').setAttribute('src', image);
          document.getElementById('logoImage').setAttribute('src', image);

          console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
      }, function (resp) {
          console.log('Error status: ' + resp.status);
      }, function (evt:any) {
          var progressPercentage = 100.0 * evt.loaded / evt.total;
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      });
    };

    // upload on file select or drop
    $scope.uploadFile = function (file) {
      Upload.upload({
        url: Env.base + 'institution/file',
        data: { file: file }
      }).then(function (resp) {
        var filename = resp.config.data.file.name;

        var ext = filename.split('.').pop();
        filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.' + ext;

        $scope.uploadedFile = filename;

        console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
      }, function (resp) {
        console.log('Error status: ' + resp.status);
      }, function (evt:any) {
        var progressPercentage = 100.0 * evt.loaded / evt.total;
        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      });
    };

    $scope.addFile = function(filename) {
      var institution = $scope.institution;
      if (!institution.files) {
        institution.files = [];
      }
      institution.files.push({
        filename: filename,
        filepath: $scope.uploadedFile,
      })
      if ($scope.updateInstitution(institution)) {
        $scope.uploadedFile = '';
        $scope.document = null;
        $scope.filename = '';
      }
    }
}];

export { institutionCtrl };