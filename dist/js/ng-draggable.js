/**
 * ng-draggable.js - v0.0.9 - A lean AngularJS drag and drop directive.
 * Based on ngDraggable (https://github.com/fatlinesofcode/ngDraggable)
 * Planned changes:
 *    - Remove event system
 *    - Improve code quality
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */

/* global angular */
angular
  .module('ng-draggable', [])
  .factory('DraggableService', function() {
    return {};
  })
  .directive('ngDrag', ['$rootScope', '$document', 'DraggableService', function($rootScope, $document, DraggableService) {
    return {
      restrict: 'A',
      scope: {
        'callback': '&ngDrag',
        'disabled': '&ngDragDisabled'
      },
      link: function($scope, element) {
        var _mx, _my, _tx, _ty;
        var _hasTouch = ('ontouchstart' in document.documentElement);
        var _pressEvents = 'touchstart mousedown';
        var _moveEvents = 'touchmove mousemove';
        var _releaseEvents = 'touchend mouseup';

        var _pressTimer = null;

        var initialize = function() {
          // Prevent native drag
          element.attr('draggable', 'false');
          element.on(_pressEvents, onpress);
          if (!_hasTouch) {
            element.on('mousedown', function() {
              return false;
            });
          }
        };

        var onpress = function(evt) {
          if (_hasTouch) {
            cancelPress();
            _pressTimer = setTimeout(function() {
              cancelPress();
              onLongPress(evt);
            }, 100);
            $document.on(_moveEvents, cancelPress);
            $document.on(_releaseEvents, cancelPress);
          } else {
            onLongPress(evt);
          }
        };

        var cancelPress = function() {
          clearTimeout(_pressTimer);
          $document.off(_moveEvents, cancelPress);
          $document.off(_releaseEvents, cancelPress);
        };

        var onLongPress = function(evt) {
          evt.preventDefault();

          element[0].style.width = element[0].offsetWidth + 'px';
          element[0].style.height = element[0].offsetHeight + 'px';
          element.centerX = evt.offsetX || evt.layerX;
          element.centerY = evt.offsetY || evt.layerY;
          element.addClass('dragging');

          _mx = evt.pageX || evt.clientX + $document[0].body.scrollLeft;
          _my = evt.pageY || evt.clientY + $document[0].body.scrollTop;
//          _mx = (evt.pageX || evt.originalEvent.touches[0].pageX);
//          _my = (evt.pageY || evt.originalEvent.touches[0].pageY);

          _tx = _mx - element.centerX - $document[0].body.scrollLeft;
          _ty = _my - element.centerY - $document[0].body.scrollTop;

          moveElement(_tx, _ty);

          $document.on(_moveEvents, onMove);
          $document.on(_releaseEvents, onRelease);

          $rootScope.$broadcast('draggable:start', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element });

          if ($scope.callback) {
            DraggableService.data = $scope.callback();
          }
        };

        var onMove = function(evt) {
          evt.preventDefault();

          _mx = evt.pageX || evt.clientX + $document[0].body.scrollLeft;
          _my = evt.pageY || evt.clientY + $document[0].body.scrollTop;
          _tx = _mx - element.centerX - $document[0].body.scrollLeft;
          _ty = _my - element.centerY - $document[0].body.scrollTop;
          moveElement(_tx, _ty);

          $rootScope.$broadcast('draggable:move', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element });
        };

        var onRelease = function(evt) {
          evt.preventDefault();

          $rootScope.$broadcast('draggable:end', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element, callback: onDragComplete});
          element.removeClass('dragging');

          reset();

          $document.off(_moveEvents, onMove);
          $document.off(_releaseEvents, onRelease);
        };

        var onDragComplete = function() {
          if ($scope.callback) {
            $scope.callback();
          }
        };

        var reset = function() {
          element.css({left: '', top: '', position: '', 'z-index': ''});
        };

        var moveElement = function(x, y) {
          element.css({ left: x + 'px', top: y + 'px' });
        };

        initialize();
      }
    };
  }])
  .directive('ngDrop', ['DraggableService', function(DraggableService) {
    return {
      restrict: 'A',
      scope: {
        'callback': '&ngDrop',
        'disabled': '&ngDropDisabled'
      },
      link: function($scope, element) {
        var initialize = function() {
          $scope.$on('draggable:start', onDragStart);
          $scope.$on('draggable:move', onDragMove);
          $scope.$on('draggable:end', onDragEnd);
        };

        var onDragStart = function(evt, obj) {
          isTouching(obj.x, obj.y, obj.element);
        };

        var onDragMove = function(evt, obj) {
          isTouching(obj.x, obj.y, obj.element);
        };

        var onDragEnd = function(evt, obj) {
          if (!$scope.disabled() && isTouching(obj.x, obj.y, obj.element)) {
            $scope.$apply(function() {
              $scope.callback({ $data: DraggableService.data });
            });
          }
          updateDragStyles(false, obj.element);
        };

        var isTouching = function(mouseX, mouseY, dragElement) {
          var touching = isTouchingElement(mouseX, mouseY);
          updateDragStyles(touching, dragElement);
          return touching;
        };

        var updateDragStyles = function(touching, dragElement) {
          if (touching) {
            element.addClass('drag-enter');
            dragElement.addClass('drag-over');
          } else {
            element.removeClass('drag-enter');
            dragElement.removeClass('drag-over');
          }
        };

        var isTouchingElement = function(x, y) {
          var rect = element[0].getBoundingClientRect();
          return x >= rect.left &&
            x <= rect.right &&
            y <= rect.bottom &&
            y >= rect.top;
        };

        initialize();
      }
    };
  }]);
