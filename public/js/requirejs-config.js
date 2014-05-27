var requirejsConfig = {
  baseUrl: '.',
  paths: {
    'angular': [
      '//ajax.googleapis.com/ajax/libs/angularjs/1.2.11/angular.min',
      'public/lib/angular/angular'
    ],
    'angular-route': [
      '//ajax.googleapis.com/ajax/libs/angularjs/1.2.11/angular-route.min',
      'public/lib/angular-route/angular-route.min'
    ],
    'ng-draggable': [
      'dist/js/ng-draggable.min',
      '//ianwalter.github.io/ng-draggable/dist/js/ng-draggable.min'
    ],
    'angular-mocks': 'public/lib/angular-mocks/angular-mocks'
  },
  shim: {
    'angular' : { 'exports' : 'angular' },
    'angular-route': { deps:['angular'] },
    'ng-draggable': { deps:['angular'] },
    'angular-mocks': {
      deps: ['angular']
    }
  }
};