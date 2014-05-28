define(
  ['angular'],
  function(angular) {
    'use strict';

    // Array indexOf() polyfill for IE8
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function (searchElement, fromIndex) {
        if ( this === undefined || this === null ) {
          throw new TypeError( '"this" is null or not defined' );
        }

        var length = this.length >>> 0; // Hack to convert object.length to a UInt32

        fromIndex = +fromIndex || 0;

        if (Math.abs(fromIndex) === Infinity) {
          fromIndex = 0;
        }

        if (fromIndex < 0) {
          fromIndex += length;
          if (fromIndex < 0) {
            fromIndex = 0;
          }
        }

        for (;fromIndex < length; fromIndex++) {
          if (this[fromIndex] === searchElement) {
            return fromIndex;
          }
        }

        return -1;
      };
    }

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