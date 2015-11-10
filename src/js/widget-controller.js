var widget = angular.module('widget', ['templates-dist']);
widget.run(function($rootScope){});
widget.controller('WidgetController', function($scope,$rootScope,$http, $timeout, $element){

	var _cropApi;

	function init() {
		$scope.selectedTabIndex = 0;
		$scope.userId = window.localStorage.getItem("userId");
		if (!$scope.userId) {
			var newUserId = generateGUID();
			window.localStorage.setItem("userId", newUserId);
			$scope.userId = newUserId;
		}

		$element.toggleClass("iframed", $rootScope.isIFramed());
		$element.toggleClass("standalone", !$rootScope.isIFramed());
		FastClick.attach($element.get(0));
	}

	function generateGUID() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return [s4(), s4(), '-', s4(), '-', s4(), '-', s4(), '-', s4(), s4(), s4()].join('');
	}

	function isTouchScreen() {
		return 'ontouchstart' in document.documentElement;
	}

	$rootScope.openCropWindow = function(imageUrl, imageWidth, imageHeight, cb) {
		var boxWidth = 320,
			boxHeight = 320;

		$rootScope.cropWindow = {
			modified: false,
			imageUrl: imageUrl,
			cropData: {
				x:Math.floor(imageWidth * 0.1),
				y:Math.floor(imageHeight * 0.1),
				width:Math.floor(imageWidth - (imageWidth * 0.2)),
				height: Math.floor(imageHeight - (imageHeight * 0.2)),
				imageWidth: imageWidth,
				imageHeight: imageHeight
			},
			cb: cb
		};
		$timeout(function() {
			var jCropSettings = {
				addClass: 'jcrop-marlin',
				bgOpacity: 0.52,
				bgFade: true,
				boxWidth: boxWidth,
				boxHeight: boxHeight,
				trueSize: [imageWidth, imageHeight],
				onChange: function(p) {
					if($(".jcrop-tracker.mark").length===0) {$(".jcrop-tracker").toggleClass("mark", true);} 
					if (this.tellSelect) {
						var p = this.tellSelect();
						$rootScope.cropWindow.cropData.x = Math.floor(p.x);
						$rootScope.cropWindow.cropData.y = Math.floor(p.y);
						$rootScope.cropWindow.cropData.width = Math.floor(p.w);
						$rootScope.cropWindow.cropData.height = Math.floor(p.h);
						$rootScope.cropWindow.modified = true;
					}
				},
				onSelect: function() {
					$(".jcrop-tracker").toggleClass("mark", false);
				},
				onRelease: function() {
					$(".jcrop-tracker").toggleClass("mark", false);
				}
			};
			if ($rootScope.isMobileScreen()) {
				$rootScope.cropWindow.modified = true;
				jCropSettings.setSelect = [
					$rootScope.cropWindow.cropData.x,
					$rootScope.cropWindow.cropData.y,
					($rootScope.cropWindow.cropData.x + $rootScope.cropWindow.cropData.width),
					($rootScope.cropWindow.cropData.y + $rootScope.cropWindow.cropData.height)
				];
			}
			$element.find('.crop-dialog img').Jcrop(jCropSettings, function(){
				_cropApi = this;
				$(".jcrop-tracker").each(function() {
		    		if ($(this).css("cursor")!=="move") {
		    			$(this).toggleClass("main", true);
		    		} else {
		    			$(this).toggleClass("move", true);
		    		}
				});
			});
			$rootScope.cropWindow.done = true;
		},100);
	};

	$rootScope.closeCropWindow = function(doSearch) {
		var cropData = null;
		if ($rootScope.cropWindow.modified) {
			cropData = $.extend({}, $rootScope.cropWindow.cropData);
		}
		if (_cropApi) {
			_cropApi.destroy();
			$element.find('.jcrop-holder').remove();
			$element.find('.crop-dialog img').removeAttr('style');
		}
		if (doSearch) {
			$rootScope.cropWindow.cb(null, cropData);
		}
		$rootScope.cropWindow = null;
	};

	$rootScope.isIFramed = function() {
		return (window.top != window.self);
	};

	$rootScope.isMobileScreen = function() {
		var w = screen.width;
		if (w <= 480) {
			return true;
		}
		return false;
	};

	init();

});