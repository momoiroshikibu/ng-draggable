define(
  ['angular'],
  function(angular) {
    'use strict';

    angular
      .module('ng-draggable-demo.movie-service', [])
      .factory('MovieService', function() {
        return {
          watchList: [
            { name: 'Rushmore' },
            { name: 'Blown Away' },
            { name: 'Stranger Than Fiction' },
            { name: 'Captain Phillips' }
          ],
          seenList: [
            { name: 'The Departed' },
            { name: 'Moneyball' },
            { name: 'Dogma' }
          ],
          addToWatch: function(movie) {
            if (this.watchList.indexOf(movie) === -1) {
              var index = this.seenList.indexOf(movie);
              this.watchList.push(movie);
              this.seenList.splice(index, 1);
            }
          },
          addToSeen: function(movie) {
            if (this.seenList.indexOf(movie) === -1) {
              var index = this.watchList.indexOf(movie);
              this.seenList.push(movie);
              this.watchList.splice(index, 1);
            }
          }
        };
      });
  }
);