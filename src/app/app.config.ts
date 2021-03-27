var appConfig = ['$stateProvider', '$qProvider', '$httpProvider', '$urlRouterProvider', '$locationProvider',
	function ($stateProvider, $qProvider, $httpProvider, $urlRouterProvider, $locationProvider) {
		$stateProvider.state('main', {
      url: '/',
      templateUrl: '/views/dashboard.html',
      controller: 'dashboardCtrl'
    }).state('account', {
      url: '/account',
      templateUrl: '/views/account.html',
      controller: 'accountCtrl'
    }).state('institution', {
      url: '/institution',
      templateUrl: '/views/institution.html',
      controller: 'institutionCtrl'
    }).state('ledger', {
      url: '/ledger',
      templateUrl: '/views/ledger.html',
      controller: 'ledgerCtrl'
    }).state('finposition', {
      url: '/finposition',
      templateUrl: '/views/finposition.html',
      controller: 'finpositionCtrl'
    }).state('initbalance', {
      url: '/initbalance',
      templateUrl: '/views/initbalance.html',
      controller: 'initbalanceCtrl'
    }).state('netasset', {
      url: '/netasset',
      templateUrl: '/views/netasset.html',
      controller: 'netassetCtrl'
    }).state('activity', {
      url: '/activity',
      templateUrl: '/views/activity.html',
      controller: 'activityCtrl'
    }).state('cash', {
      url: '/cash',
      templateUrl: '/views/cash.html',
      controller: 'cashCtrl'
    }).state('journal', {
      url: '/journal',
      templateUrl: '/views/journal.html',
      controller: 'journalCtrl'
    });

		$locationProvider.html5Mode(true);
		$urlRouterProvider.otherwise('/');
		$qProvider.errorOnUnhandledRejections(false);

		//$authProvider.loginUrl = Env.site + '/api/login';

		//$qProvider.errorOnUnhandledRejections(false);
		/* $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
			return {
				'request': function (config) {
					config.headers = config.headers || {};
					if ($localStorage.token) {
						config.headers.Authorization = 'Bearer ' + $localStorage.token;
					}
					return config;
				},
				'responseError': function (response) {
					if (response.status === 401 || response.status === 403) {
						$location.path('/login');
					}
					return $q.reject(response);
				}
			};
		}]); */

	}
];

export {
	appConfig
};