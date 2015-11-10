widget.directive("tabContent", function($rootScope, $http, $timeout){

	var MAX_HEIGHT = 600;
	var MAX_WIDTH = 600;
	var API_KEY = "@@APIKey";
	var DESKTOP_RESULT_LIST_COLUMNS = 1;
	var DESKTOP_IFRAMED_RESULT_LIST_COLUMNS = 1;
	var MOBILE_RESULT_LIST_COLUMNS = 1;
	var _currentSearchForRecropData = null;

	function base64encode(input) {
		var keyStr = 'ABCDEFGHIJKLMNOP' +
		            'QRSTUVWXYZabcdef' +
		            'ghijklmnopqrstuv' +
		            'wxyz0123456789+/' +
		            '=';
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    }

	function dataURItoBlob(dataURI) {
	    // convert base64/URLEncoded data component to raw binary data held in a string
	    var byteString;
	    if (dataURI.split(',')[0].indexOf('base64') >= 0)
	        byteString = atob(dataURI.split(',')[1]);
	    else
	        byteString = unescape(dataURI.split(',')[1]);

	    // separate out the mime component
	    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	    // write the bytes of the string to a typed array
	    var ia = new Uint8Array(byteString.length);
	    for (var i = 0; i < byteString.length; i++) {
	        ia[i] = byteString.charCodeAt(i);
	    }

	    return new Blob([ia], {type:mimeString});
	}

	function updateGalleryPath(arr) {
		var absPath = window.location.origin + window.location.pathname + "img/gallery/";
		// var absPath = "http://demo.justvisual.com/img/gallery/";
		if (arr && arr.length) {
			for (var i = 0; i < arr.length; i++) {
				arr[i] = absPath + arr[i];
			}
		}
		return arr;
	}

	return {
		restrict: 'E',
		replace: true,
		scope: {
            selected: '='
        },
		templateUrl: 'view/tabcontent.html',
		link: function($scope, element, attrs){
			$scope.tabIndex = Number(attrs.tabIndex);
			$scope.title = attrs.title;
			$scope.subtitle = attrs.subtitle;
			$scope.gallerytitle = attrs.gallerytitle;
			$scope.searchIndex = attrs.searchIndex;

			if (attrs.galleryitems) {
				var galleryDisplayItems = updateGalleryPath(attrs.galleryitems.split(",")),
					gallerySearchItems = [],
					galleryItems = [];
				if (attrs.gallerysearchitems) {
					gallerySearchItems = updateGalleryPath(attrs.gallerysearchitems.split(","));
				}
				for (var i = 0; i < galleryDisplayItems.length; i++) {
					galleryItems.push({
						displayUrl: galleryDisplayItems[i],
						searchUrl: gallerySearchItems[i] ? gallerySearchItems[i] : galleryDisplayItems[i]
					});
				}
				$scope.galleryItems = galleryItems;
			}
		
			$scope.$watch('selected', function(selected){
				$scope.selected = selected;
				$timeout(function(){
					$scope.show = selected;
				},50);
			});

			$scope.openImageSelector = function() {
				setTimeout(function(){
					var inputFile = $(element).find('input[type="file"]');
					inputFile.trigger('click');
					inputFile.bind('change', function(){
						$scope.$apply(function(){
							$scope.imageSelectedFromFile();
						});
					});
				},0);
			};

			// 1 - media type error
			// 2 - image size error
			$scope.imageUploadError = function(errorType) {
				$scope.imageUploadErrorType = errorType;
			};

			$scope.loadImageUrlAndCrop = function(imageUrl, $event) {
				if ($event) {
					$event.stopPropagation();
				}
				$scope.imageUploadError(null);
				var img = new Image();
				img.src = imageUrl;
				img.onload = function(){
					$scope.$apply(function(){
						_currentSearchForRecropData = {url: imageUrl, imageWidth: img.width, imageHeight: img.height};
						$rootScope.openCropWindow(imageUrl, img.width, img.height, function(err, cropData){
							if (!err) {
								$scope.startVisualSearch(imageUrl, null, cropData);
							}
						});
					});
				};
			};

			$scope.loadFileAndCrop = function(imageFile) {
				if (!imageFile) {return;}
				$scope.imageUploadError(null);
				if (imageFile.type.indexOf("jpeg") === -1 && imageFile.type.indexOf("png") === -1 && imageFile.type.indexOf("gif") === -1) {
					$scope.imageUploadError(1);
					return;
				}
				var img = new Image();
				var url = window.URL ? window.URL : window.webkitURL;
				img.src = url.createObjectURL(imageFile);
				img.onload = function(){
					var width;
					var height;
					var binaryReader = new FileReader();
					if (img.width < 100 || img.height < 100) {
						$scope.imageUploadError(2);
						return;
					}
					binaryReader.onloadend=function(d) {
						var exif, transform = "none";
						exif = EXIF.readFromBinaryFile(d.target.result);
						if (exif.Orientation === 8) {
						    width = img.height;
						    height = img.width;
						    transform = "left";
						} else if (exif.Orientation === 6) {
						    width = img.height;
						    height = img.width;
						    transform = "right";
						} else {
							width = img.width;
						    height = img.height;
						}
						if (width/MAX_WIDTH > height/MAX_HEIGHT) {
						    if (width > MAX_WIDTH) {
						        height *= MAX_WIDTH / width;
						        width = MAX_WIDTH;
						    }
						} else {
						    if (height > MAX_HEIGHT) {
						        width *= MAX_HEIGHT / height;
						        height = MAX_HEIGHT;
						    }
						}
						var canvas = document.createElement('canvas');
						canvas.width = width;
						canvas.height = height;
						var ctx = canvas.getContext("2d");
						ctx.fillStyle = 'white';
						ctx.fillRect(0, 0, 700, 600);
						if(transform === 'left') {
						    ctx.setTransform(0, -1, 1, 0, 0, height);
						    ctx.drawImage(img, 0, 0, height, width);
						} else if(transform === 'right') {
						    ctx.setTransform(0, 1, -1, 0, width, 0);
						    ctx.drawImage(img, 0, 0, height, width);
						} else if(transform === 'flip') {
						    ctx.setTransform(1, 0, 0, -1, 0, height);
						    ctx.drawImage(img, 0, 0, width, height);
						} else {
						    ctx.setTransform(1, 0, 0, 1, 0, 0);
						    ctx.drawImage(img, 0, 0, width, height);
						}
						ctx.setTransform(1, 0, 0, 1, 0, 0);
						var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
						var r, g, b, i;
						for (var py = 0; py < pixels.height; py += 1) {
						    for (var px = 0; px < pixels.width; px += 1) {
						         i = (py*pixels.width + px)*4;
						         r = pixels.data[i];
						         g = pixels.data[i+1];
						         b = pixels.data[i+2];
						         if(g > 100 &&
						            g > r*1.35 &&
						            g > b*1.6) pixels.data[i+3] = 0;
						    }
						}
						ctx.putImageData(pixels, 0, 0);
						var data = canvas.toDataURL('image/jpeg');
						var blob = dataURItoBlob(data);
						$scope.$apply(function(){
							_currentSearchForRecropData = {url: data, imageWidth: width, imageHeight: height, blob: blob};
							$rootScope.openCropWindow(data, width, height, function(err, cropData){
								if (!err) {
									$scope.startVisualSearch(data, blob, cropData);
								}
							});
						});
					};
					binaryReader.readAsArrayBuffer(imageFile);
				};
			};

			$scope.imageSelectedFromFile = function() {
				var $el = $(element).find('input[type="file"]');
				var imageFile = $el.get(0).files[0];
				$el.val("");
				$scope.loadFileAndCrop(imageFile);
			};

			$scope.recrop = function() {
				$rootScope.openCropWindow(_currentSearchForRecropData.url, _currentSearchForRecropData.imageWidth, _currentSearchForRecropData.imageHeight, function(err, cropData){
					if (!err) {
						$scope.startVisualSearch(_currentSearchForRecropData.url, _currentSearchForRecropData.blob, cropData);
					}
				});
			};

			$scope.startVisualSearch = function(queryImageUrl, blob, cropData) {
				delete $http.defaults.headers.common['Authorization'];
				$scope.queryImageUrl = queryImageUrl;
				$scope.queryImageCropData = cropData;
				$scope.visualLists = null;
				$scope.wtf = false;
				$scope.visualResultsTotal = 0;
				$(element).find(".search-image img").load(function(){
					$scope.$apply(function(){
						scanAnim($(element).find(".search-image img"), $(element).find(".scanner"));
					});
				});
				
				// show crop area only
				$(element).find('.scanner-container').removeAttr("style");
				$(element).find('.scanner-container img').removeAttr("style");
				if (cropData) {
					var ratio = 190 / cropData.width;
					if ((cropData.height * ratio) > 220) {
						ratio = 220 / cropData.height;
					}
					$(element).find('.scanner-container').css({
						width: (cropData.width * ratio) + "px",
						height: (cropData.height * ratio) + "px"
					});
					$(element).find('.scanner-container img').css({
						"marginLeft": -(cropData.x * ratio) + "px",
						"marginTop": -(cropData.y * ratio) + "px",
						"width": (cropData.imageWidth * ratio) + "px"
					});
				} else {
					$(element).find('.scanner-container img').css("max-width", "190px");
					$(element).find('.scanner-container img').css("max-height", "300px");
				}

				var successCallback = function(results) {
					$scope.visualSearchStarted = false;
					if (results && results.images) {
						if (results.wtf || results.images.length === 0) {
							$scope.wtf = true;
							return;
						}
						results.images = results.images.slice(0,10);
						$scope.visualResultsTotal = results.images.length;
						var visualLists = [],
							resultListColumn;
						if ($rootScope.isMobileScreen()) {
							resultListColumn = MOBILE_RESULT_LIST_COLUMNS;
						} else if ($rootScope.isIFramed()) {
							resultListColumn = DESKTOP_IFRAMED_RESULT_LIST_COLUMNS;
						} else {
							resultListColumn = DESKTOP_RESULT_LIST_COLUMNS;
						}
						for (var i = 0; i < resultListColumn; i++) {
							visualLists.push([]);
						}
						var l = 0;
						for (var i = 0; i < results.images.length; i++) {
							visualLists[l].push(results.images[i]);
							l++;
							if (l == resultListColumn) {
								l = 0;
							}
						}
						$scope.visualLists = visualLists;
						$timeout(initResultScroll,500);
					}
				};
				var errorCallback = function() {
					$scope.visualSearchStarted = false;
				};
				$scope.visualSearchStarted = true;
				var cropDataParams = "";
				if (cropData) {
					cropDataParams = "&crop-x=" + cropData.x + "&crop-y=" + cropData.y + "&crop-width=" + cropData.width + "&crop-height=" + cropData.height;
				}
				if (blob) {
					var formData = new FormData();
					formData.append("file", blob);
					$http.post("http://" + attrs.searchServer + ".vsapi01.com/api-search?index=" + $scope.searchIndex + "&n-results=20&image-origin=album&user-id=" + attrs.userId + "&apikey=" + API_KEY + cropDataParams, formData, { transformRequest: angular.identity, headers: {'Content-Type': undefined} }).success(successCallback).error(errorCallback);
				} else {
					$http({
						url: "http://" + attrs.searchServer + ".vsapi01.com/api-search/by-url?index=" + $scope.searchIndex + "&url="+encodeURIComponent(queryImageUrl) + "&n-results=20&image-origin=web&user-id=" + attrs.userId + "&apikey=" + API_KEY + cropDataParams
					}).success(successCallback).error(errorCallback);
				}
			};

			$scope.imageDragStart = function(url) {
				$scope.imageDragStartUrl = url;
			};

			$scope.dragOver = function(event) {
				event.preventDefault();
				$scope.dragover = true;
				$scope.$apply();
			};

			$scope.dragLeave = function(event) {
				event.preventDefault();
				$timeout(function(){
					$scope.dragover = false;
					$scope.$apply();
				},500);
				
			};

			$scope.drop = function(event) {
				event.preventDefault();
				$scope.$apply(function(){
					$scope.dragover = false;
					var files = event.target.files || event.dataTransfer.files;
					// debugger;
					if (files[0]) {
						$scope.loadFileAndCrop(files[0]);
					} else if ($scope.dragImageUrl) {
						$scope.startVisualSearch($scope.dragImageUrl);
					}
				});
			};

			$scope.tryNewSearch = function(cb) {
				$scope.queryImageUrl = null;
				$timeout(function(){
					$scope.imageUploadError(null);
					$scope.visualLists = null;
					$scope.visualResultsTotal = null;
					$scope.wtf = false;
					if (cb) {
						cb();
					}
				},500);
			};

			$scope.getTitle = function(photo) {
				var title = photo.plantNames || photo.petName || photo.title;
				if (title.length > 40) {
					title = title.substr(0,40) + "...";
				}
				return title;
			};

			$scope.openLink = function(link) {
				window.open(link, '_blank');
			};

			$scope.onDragStart = function(event) {
				$scope.dragImageUrl = event.srcElement.currentSrc;
			};

			$scope.canScrollLeft = function() {
				var $c = $(element).find(".list-images .lists");
				var $l = $(element).find(".list-images .lists ul");
			};

			$scope.canScrollRight = function() {
				var $c = $(element).find(".list-images .lists");
				var $l = $(element).find(".list-images .lists ul");
			};

			function scanAnim(imageEl, scanEl) {
				var width = imageEl.width();
				var scanWidth = scanEl.width();
				scanEl.css("visibility", "visible");
				scanEl.css("left", "0");
				$timeout(function(){
					scanEl.css("left", (width - scanWidth +7) + "px");
				},100);
				$timeout(function(){
					scanEl.css("left", 0);
				},500);
				$timeout(function(){
					scanEl.css("visibility", "invisible");
				},600);
			}

			// attach scroll
			function initResultScroll() {
				testResultScroll();
				var $c = $(element).find(".list-images .lists");
				$c.scroll(function(){
					$scope.$apply(testResultScroll);
				});
			}

			function testResultScroll() {
				var $c = $(element).find(".list-images .lists");
				var sl = $c.scrollLeft();
				var mw = $c.outerWidth();
				$(element).find(".list-images .arrow-left").toggleClass("enable", (sl != 0));
				$(element).find(".list-images .arrow-right").toggleClass("enable", (sl + 60 < mw));
			}

			$scope.scrollLeft = function() {
				var $c = $(element).find(".list-images .lists");
				$c.animate({
					scrollLeft: $c.scrollLeft()-200
				},200);
			};

			$scope.scrollRight = function() {
				var $c = $(element).find(".list-images .lists");
				$c.animate({
					scrollLeft: $c.scrollLeft()+200
				},200);
			};

		}
	}
});