/**
 * ng-draggable.js - v0.0.2 - A lean AngularJS drag and drop directive.
 * Based on ngDraggable (https://github.com/fatlinesofcode/ngDraggable)
 * Planned changes:
 *    - Remove jQuery dependency
 *    - Remove event system
 *    - Improve code quality
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */

/* global angular */
angular
  .module('ng-draggable', [])
  .directive('ngDrag', ['$rootScope', '$parse', '$document', function($rootScope, $parse, $document) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        //   console.log("ngDraggable", "link", "", scope.value);
        //  return;
        var _mx, _my, _tx, _ty;
        var _hasTouch = ('ontouchstart' in document.documentElement);
        var _pressEvents = 'touchstart mousedown';
        var _moveEvents = 'touchmove mousemove';
        var _releaseEvents = 'touchend mouseup';

        var _data = null;

        var _dragEnabled = false;

        var _pressTimer = null;

        var onDragSuccessCallback = $parse(attrs.ngDrag) || null;

        var initialize = function() {
          element.attr('draggable', 'false'); // prevent native drag
          toggleListeners(true);
        };


        var toggleListeners = function(enable) {
          // remove listeners

          if (!enable)return;
          // add listeners.

          scope.$on('$destroy', onDestroy);
          attrs.$observe("ngDrag", onEnableChange);
          scope.$watch(attrs.ngDragData, onDragDataChange);
          element.on(_pressEvents, onpress);
          if (!_hasTouch) {
            element.on('mousedown', function() {
              return false;
            }); // prevent native drag
          }
        };
        var onDestroy = function() {
          toggleListeners(false);
        };
        var onDragDataChange = function(newVal) {
          _data = newVal;
          //   console.log("69","onDragDataChange","data", _data);
        };
        var onEnableChange = function(newVal) {
          _dragEnabled = scope.$eval(newVal);

        };
        /*
         * When the element is clicked start the drag behaviour
         * On touch devices as a small delay so as not to prevent native window scrolling
         */
        var onpress = function(evt) {
          if (!_dragEnabled)return;


          if (_hasTouch) {
            cancelPress();
            _pressTimer = setTimeout(function() {
              cancelPress();
              onlongpress(evt);
            }, 100);
            $document.on(_moveEvents, cancelPress);
            $document.on(_releaseEvents, cancelPress);
          } else {
            onlongpress(evt);
          }

        };
        var cancelPress = function() {
          clearTimeout(_pressTimer);
          $document.off(_moveEvents, cancelPress);
          $document.off(_releaseEvents, cancelPress);
        };
        var onlongpress = function(evt) {
          if (!_dragEnabled)return;
          evt.preventDefault();
          element.centerX = (element[0].offsetWidth / 2);
          element.centerY = (element[0].offsetHeight / 2);
          element.addClass('dragging');
          _mx = (evt.pageX || evt.originalEvent.touches[0].pageX);
          _my = (evt.pageY || evt.originalEvent.touches[0].pageY);
          //_tx=_mx-element.centerX-$window.scrollLeft();
          _tx = _mx - element.centerX - $document[0].body.scrollLeft;
          //_ty=_my -element.centerY-$window.scrollTop();
          _ty = _my - element.centerY - $document[0].body.scrollTop;
          moveElement(_tx, _ty);
          $document.on(_moveEvents, onmove);
          $document.on(_releaseEvents, onrelease);
          $rootScope.$broadcast('draggable:start', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element, data: _data});

        };
        var onmove = function(evt) {
          if (!_dragEnabled)return;
          evt.preventDefault();

          _mx = (evt.pageX || evt.originalEvent.touches[0].pageX);
          _my = (evt.pageY || evt.originalEvent.touches[0].pageY);
          _tx = _mx - element.centerX - $document[0].body.scrollLeft;
          _ty = _my - element.centerY - $document[0].body.scrollTop;
          moveElement(_tx, _ty);

          $rootScope.$broadcast('draggable:move', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element, data: _data});

        };
        var onrelease = function(evt) {
          if (!_dragEnabled)return;
          evt.preventDefault();
          $rootScope.$broadcast('draggable:end', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element, data: _data, callback: onDragComplete});
          element.removeClass('dragging');
          reset();
          $document.off(_moveEvents, onmove);
          $document.off(_releaseEvents, onrelease);

        };
        var onDragComplete = function(evt) {

          if (!onDragSuccessCallback)return;

          scope.$apply(function() {
            onDragSuccessCallback(scope, {$data: _data, $event: evt});
          });
        };
        var reset = function() {
          element.css({left: '', top: '', position: '', 'z-index': ''});
        };
        var moveElement = function(x, y) {
          element.css({left: x, top: y, position: 'fixed', 'z-index': 99999});
        };
        initialize();
      }
    }
  }])
  .directive('ngDrop', ['$parse', '$timeout', function($parse) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var onDropCallback = $parse(attrs.ngDrop);// || function(){};
        var initialize = function() {
          toggleListeners(true);
        };

        var toggleListeners = function(enable) {
          // remove listeners

          if (!enable)return;
          // add listeners.

          scope.$on('$destroy', onDestroy);
          //scope.$watch(attrs.uiDraggable, onDraggableChange);
          scope.$on('draggable:start', onDragStart);
          scope.$on('draggable:move', onDragMove);
          scope.$on('draggable:end', onDragEnd);
        };
        var onDestroy = function() {
          toggleListeners(false);
        };

        var onDragStart = function(evt, obj) {

          isTouching(obj.x, obj.y, obj.element);
        };
        var onDragMove = function(evt, obj) {

          isTouching(obj.x, obj.y, obj.element);
        };
        var onDragEnd = function(evt, obj) {

          if (isTouching(obj.x, obj.y, obj.element)) {
            // call the ngDraggable element callback
            if (obj.callback) {
              obj.callback(evt);
            }

            // Call the ng-drop callback
            scope.$apply(function() {
              onDropCallback(scope, { $data: obj.data, $event: evt });
            });
          }
          updateDragStyles(false, obj.element);
        };
        var isTouching = function(mouseX, mouseY, dragElement) {
          var touching = hitTest(mouseX, mouseY);
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
        var hitTest = function(x, y) {
          var rect = element[0].getBoundingClientRect();
          rect.right = rect.left + element[0].outerWidth;
          rect.bottom = rect.top + element[0].outerHeight;
          return x >= rect.left
            && x <= rect.right
            && y <= rect.bottom
            && y >= rect.top;

          //var bounds = element.offset();
          //bounds.right = bounds.left + element.outerWidth();
          //bounds.bottom = bounds.top + element.outerHeight();
        };

        initialize();
      }
    }
  }]);
