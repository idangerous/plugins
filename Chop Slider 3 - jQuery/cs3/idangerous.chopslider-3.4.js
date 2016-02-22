
/*
 * iDangero.us Chop Slider v.3.4
 * 
 
 * http://www.idangero.us/cs
 *
 * Copyright 2012, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us
 
 * Licensed under the iDangero.us Regular License.
 * Licensing Terms: http://www.idangero.us/index.php?content=article&id=21
 
 * Released on: August 1, 2012
 * Updated on: February 24, 2013
 */
 
(function($){

/* 
	=================================
	Chop Slider 3 - Core
	Version 3.4
	by Vladimir Kharlampidi
	The iDangero.us
	http://www.idangero.us
	================================= 
*/
ChopSlider3 = function(container,params) {

	//Helper CSS3 Functions
	$.fn.csTransitionEnd = function(callback) {
		return this.each(function(){
			var _this = this;
			var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
			if (callback) {
				function fireCallBack() {
					callback.call(this);
					for (var i=0; i<events.length; i++) {
						_this.removeEventListener(events[i], fireCallBack, false)
					}
				}
				for (var i=0; i<events.length; i++) {
					_this.addEventListener(events[i], fireCallBack, false)
				}
			}
		})
	};
	$.fn.csTransform = function(params) {
		return this.each(function(){
			var es = $(this)[0].style;
			if (params.transform) {
				if (!cs3.support.threeD && params.transform.indexOf('translate3d')>=0) {
					var tr = params.transform.split('translate3d(')[1].split(')')[0].split(',');
					var before = params.transform.split('translate3d(')[0];
					var after = params.transform.split('translate3d(')[1].split(')')[1];
					params.transform = before+' translateX('+tr[0]+') translateY('+tr[1]+') '+after;
				}
				if (cs3.support.threeD && params.transform.indexOf('translate')<0) {
					params.transform+=' translate3d(0px,0px,0px)'
				}
				es.webkitTransform = es.MsTransform = es.MozTransform = es.OTransform = es.transform = params.transform
			}
			if (params.time||params.time===0) {
				es.webkitTransitionDuration = es.MsTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = params.time/1000+'s'
			}
			if (params.delay||params.delay===0) {
				es.webkitTransitionDelay = es.MsTransitionDelay = es.MozTransitionDelay = es.OTransitionDelay = es.transitionDelay = params.delay/1000+'s'
			}
			if (params.origin) {
				es.webkitTransformOrigin = es.MsTransformOrigin = es.MozTransformOrigin = es.OTransformOrigin = es.transformOrigin = params.origin
			}
			if (params.ease) {
				es.webkitTransitionTimingFunction = es.MsTransitionTimingFunction = es.MozTransitionTimingFunction = es.OTransitionTimingFunction = es.transitionTimingFunction = params.ease
			}
			es.webkitTransitionProperty = es.MsTransitionTransitionProperty = es.MozTransitionTransitionProperty = es.OTransitionProperty = es.transitionProperty = 'all'
			
		})
	};
	



	//Check for container
	if (container.length==0) return {};
	
	//Or check for init
	if (container.hasClass('cs3-initialized')) return {};
	
	//This
	var cs3 = {};
	var _t = cs3 = this;
	
	//Default Options Here
	var params = params || {};
	
	//CS3 Object
	$.extend(cs3 , {
		params: params,
		c:		    container,
		slides :    container.find('.cs3-slide'),
		_plugins : {
			onStartFuncs : [],
			onEndFuncs : [],
			initFuncs : []
		},
		images : [],
		newSlideIndex : false,
		support : {
			touch : ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch,
			css3 : cs3.hasCSS3(),
			threeD : cs3.has3D(),
			canvas : cs3.hasCanvas(),
			fullscreen : (function(){
				var el = document.documentElement;
				var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.oRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
				if (rfs) return true
				else return false
			})()
		},
		user : {}
	});
	//Path to CS3 Folder With Trailing Slash
	cs3.path = cs3.params.pathToCS3 || $('link[href*="idangerous.chopslider-3"]').attr('href').split('idangerous.chopslider-3')[0];
	
	//Check For Callbacks Object
	if (!cs3.params.callbacks) cs3.params.callbacks = {}

	//Video Slides
	var useVideoSlides = false;
	var useYouTubeAPI = false;
	var useVimeoAPI = false;
	cs3.slides.each(function() {
		useVideoSlides = true;
		if ($(this).hasClass('cs3-video-slide')) {
			$(this).append('<img src="'+cs3.path+'assets/video-bg.png">')
			var frame = $(this).find('iframe')
			frame.attr('id', 'cs3-video-'+(new Date()).getTime()+$(this).index())
			if ( frame.attr('src').indexOf('youtube')>=0 ) {
				frame.attr('data-videoservice','youtube')
				useYouTubeAPI = true
			}
			if (frame.attr('src').indexOf('vimeo')>=0) {
				useVimeoAPI = true
				frame.attr('data-videoservice','vimeo')
			}
		}
	});
	if (useVideoSlides) {
		if (useYouTubeAPI) {
			if (!window.YT) {
				// This code loads the IFrame Player API code asynchronously.
				var tag = document.createElement('script');
				tag.src = "//www.youtube.com/player_api";
				var firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			}
			
			window.onYouTubeIframeAPIReady = function() {
				cs3.slides.each(function() {
	    			if ($(this).hasClass('cs3-video-slide') && $(this).find('iframe').data('videoservice')=='youtube') {
						var videoID = $(this).find('iframe').attr('id')
						$(this).data('player',new YT.Player(videoID))
					}
	    		})
			}
		}
		if (useVimeoAPI) {
			$.getScript('http://a.vimeocdn.com/js/froogaloop2.min.js')
		}
		
	}
	//Store Images
	cs3.slides.each(function(){
		var src = $(this).find('img').attr('src');
		cs3.images.push( $(this).find('img').attr('src') )
	});
	
	
	//Add Active Classes on Initialization
	cs3.slides.eq(0).addClass('cs3-active-slide');
	cs3.c.addClass('cs3-initialized');
	
	//Add View Container
	cs3.slides.wrapAll('<div class="cs3-view"></div>');
	cs3.v = cs3.c.children('.cs3-view');
	
	//Add CS3-Loader Container
	cs3.v.append('<div class="cs3-loader"></div>');
	cs3.l = cs3.v.find('.cs3-loader');
	
	//Transition Functions
	cs3.slideNext = function() {
		if (cs3.isAnimating) return false;
		cs3.newSlideIndex = cs3.h.indexes().next;
		cs3.direction = 1;
		cs3.run()
	};
	cs3.slidePrev = function() {
		if (cs3.isAnimating) return false;
		cs3.newSlideIndex = cs3.h.indexes().prev;
		cs3.direction = -1;
		cs3.run()
	};
	cs3.slideTo = function(index) {
		if (cs3.isAnimating) return false;
		if (index<0 || index>=cs3.slides.length) return;
		cs3.newSlideIndex = index;
		if (index>cs3.h.indexes().active) cs3.direction = 1;
		else cs3.direction = -1;
		cs3.run()
	}
	cs3.switchTo = function(index) {
		if (cs3.isAnimating) return false;
		if (index<0 || index>=cs3.slides.length) return;
		if (index==cs3.h.indexes().active) return;
		cs3.newSlideIndex = index;
		cs3._plugins.onStart(cs3);
		cs3.updateSlides();	
	}
	
	//Put All Plugins Functions to Array
	;(function(){
		for (var plug in cs3.plugins) {
			if ('onStart' in cs3.plugins[plug]) cs3._plugins.onStartFuncs.push(cs3.plugins[plug]['onStart']);
			if ('onEnd' in cs3.plugins[plug]) cs3._plugins.onEndFuncs.push(cs3.plugins[plug]['onEnd']);
			if ('init' in cs3.plugins[plug]) cs3._plugins.initFuncs.push(cs3.plugins[plug]['init'])
			cs3._plugins[plug] = {};
		}
	})();
	$.extend(cs3._plugins, {
		onStart : function(a, calledBy){
			for (var i=0; i<cs3._plugins.onStartFuncs.length; i++) cs3._plugins.onStartFuncs[i](a, calledBy)
		},
		onEnd : function(a, calledBy){
			for (var i=0; i<cs3._plugins.onEndFuncs.length; i++) cs3._plugins.onEndFuncs[i](a, calledBy)
		},
		init : function(a, calledBy){
			for (var i=0; i<cs3._plugins.initFuncs.length; i++) cs3._plugins.initFuncs[i](a, calledBy)
		}
		
	});
	//Effects
    cs3.calcEffects = function() {
        var e = cs3.params.effects;
		if (!e) e = 'random-flat';
		var eArr = [];
		var eArrTrim = [];
		if (e.indexOf(',')>=0) eArr = e.split(',');
		else eArr.push(e);
		for (var i=0; i<eArr.length; i++) {
			var eff = $.trim(eArr[i]);
			if (eff.indexOf('random-')>=0) {
				var group = eff.split('-')[1];
				if (group == '2D' || group == '2d') group = 'twoD';
				if (group == '3D' || group == '3d') group = 'threeD';
				for (var randomEff in cs3.e[group]) {
					if (randomEff.charAt(0)!='_') eArrTrim.push(randomEff);
				}
			}
			else {
				eArrTrim.push( $.trim(eArr[i]) );
			}
		}
		//Check For Support;
		var eArrFinal = [];

		for (var i=0; i<eArrTrim.length; i++) {
			var effect = eArrTrim[i];
			//3D Support
			if ( effect in cs3.e.threeD	&& cs3.support.threeD) {
				eArrFinal.push('threeD-'+effect);
			}
			//2D Support
			if ( effect in cs3.e.twoD	&& cs3.support.css3) {
				eArrFinal.push('twoD-'+effect);
			}
			//Canvas Support
			if ( effect in cs3.e.canvas	&& cs3.support.canvas) {
				eArrFinal.push('canvas-'+effect);
			}
			if ( effect in cs3.e.flat) {
				eArrFinal.push('flat-'+effect);
			}
		}
		if (eArrFinal.length==0) {
			for (var eff in cs3.e.flat) {
				eArrFinal.push('flat-'+eff);
			}
		}
		
		if (cs3.params.effectsGroupLock) {
			var eLock = cs3.params.effectsGroupLock;
			var eArrLock=[];
			if (cs3.support.threeD && eLock.support3d) {
				var allowGroups = eLock.support3d.split(',');
				for (var i=0; i<eArrFinal.length; i++) {
					for (var j=0; j<allowGroups.length; j++) {
						var group = $.trim(allowGroups[j]);
						if (eArrFinal[i].indexOf(group)>=0) eArrLock.push(eArrFinal[i]);
					}
				}
				eArrFinal = eArrLock;
			}
			if (cs3.support.css3 && eLock.support2d && !cs3.support.threeD) {
				var allowGroups = eLock.support2d.split(',');
				for (var i=0; i<eArrFinal.length; i++) {
					for (var j=0; j<allowGroups.length; j++) {
						var group = $.trim(allowGroups[j]);
						if (eArrFinal[i].indexOf(group)>=0) eArrLock.push(eArrFinal[i]);
					}
				}
				eArrFinal = eArrLock;
			}
			if (!cs3.support.threeD && eLock.supportCanvasNoCSS3 && cs3.support.canvas && !cs3.support.css3) {
				var allowGroups = eLock.supportCanvasNoCSS3.split(',');
				for (var i=0; i<eArrFinal.length; i++) {
					for (var j=0; j<allowGroups.length; j++) {
						var group = $.trim(allowGroups[j]);
						if (eArrFinal[i].indexOf(group)>=0) eArrLock.push(eArrFinal[i]);
					}
				}
				eArrFinal = eArrLock;
			}
		}
		if (eArrFinal.length==0) {
			for (var e in cs3.e.flat) {
				if (e.charAt(0)!='_') eArrFinal.push('flat-'+e);	
			}
		}
		cs3.effects = eArrFinal;
	};
	cs3.calcEffects();
	
	//Smart Timeout
	cs3.set_timeout = function(func, time) {
		//Get Document State
		var hidden, change, vis = {
				hidden: "visibilitychange",
				mozHidden: "mozvisibilitychange",
				webkitHidden: "webkitvisibilitychange",
				msHidden: "msvisibilitychange",
				oHidden: "ovisibilitychange"
			};             
		for (var hidden in vis) {
			if (vis.hasOwnProperty(hidden) && hidden in document) {
				change = vis[hidden];
				break;
			}
		}
		if(!change){
			//IE6-9
			return setTimeout(function(){
				func();	
			},time);
		}
		var timeStart = (new Date()).getTime();
		var timeLeft = false;
		
		//Timeout Counter
		function countTime() {
			if (document[hidden]) {
				timeLeft = time - (( new Date() ).getTime() - timeStart);
				document.removeEventListener(change, countTime);
			}
		}
		document.addEventListener(change, countTime);
		if (!document[hidden]) {
			return setTimeout(function(){
				if (!document[hidden]) func();
				else {
					function continueTimeOut() {
						if (!document[hidden]) {
							cs3.set_timeout(func, timeLeft);
							document.removeEventListener(change, continueTimeOut);
						}
					}
					document.addEventListener(change, continueTimeOut);
				}
			}, time);	
		}
		else {
			function onChange(e) {
				if (!document[hidden]) {
					document.removeEventListener(change, onChange);
					cs3.set_timeout(func,time);	
				}
			}
			document.addEventListener(change, onChange);
		}
	}
	
	//Auto Play
	cs3.params.autoplay = cs3.params.autoplay || {};
	cs3.params.autoplay.delay = cs3.params.autoplay.delay || 5000;
	cs3.autoplayTimeout = false;
	
	cs3.autoplayStart = function(){
		cs3.params.autoplay.enabled = true;
		cs3.autoplayTimeout = cs3.set_timeout(function(){
			cs3.slideNext();	
		}, cs3.params.autoplay.delay);	
	};
	cs3.autoplayStop = function() {
		clearTimeout(cs3.autoplayTimeout);
		cs3.params.autoplay.enabled = false;
	};
	
	//Helper Functions
	cs3.h = {
		updateDimension : function() {
			if (cs3.params.responsive) {
				if (cs3.params.touch && cs3.params.touch.enabled && cs3.support.touch && ('touch' in cs3.plugins) ) {
					cs3.slides.eq( cs3.h.indexes().active ).show()
				}
				cs3.width = cs3.width || cs3.c.width()
				cs3.height = cs3.height || cs3.c.height()
				var oldWidth = cs3.width;
				var oldHeight = cs3.height;
				if (cs3.params.responsiveSetSize) {
					cs3.c.width('auto')
					cs3.c.height('auto')	
				}
				var activeSlide = cs3.slides.eq( cs3.h.indexes().active );
				if (activeSlide.hasClass('cs3-video-slide')) {
					var fixBySlideIndex = false
					cs3.slides.each(function() {
						if (!$(this).hasClass('cs3-video-slide')) fixBySlideIndex = $(this).index()
					});
					if(fixBySlideIndex!==false) {
						cs3.slides.eq( fixBySlideIndex ).show()
						cs3.width = cs3.slides.eq( fixBySlideIndex ).find('img').width();
						cs3.height = cs3.slides.eq( fixBySlideIndex ).find('img').height();
						cs3.slides.eq( fixBySlideIndex ).hide();
					}
					else {
						cs3.width = cs3.c.width()
					}
				}
				else {
					cs3.width = cs3.slides.eq( cs3.h.indexes().active ).find('img').width();
					cs3.height = cs3.slides.eq( cs3.h.indexes().active ).find('img').height();
				}
				
				if (cs3.params.responsiveSetSize) {
					cs3.c.width(cs3.width)
					cs3.c.height(cs3.height)
				}
				if (cs3.params.touch && cs3.params.touch.enabled && cs3.support.touch && ('touch' in cs3.plugins) ) {
					cs3.slides.eq( cs3.h.indexes().active ).hide()
				}
				if (cs3.width==0 || cs3.height==0) {
					cs3.width = oldWidth;
					cs3.height = oldHeight;
					cs3.c.width(cs3.width)
					cs3.c.height(cs3.height)
				}
			}
			else {
				cs3.width = cs3.c.width();
				cs3.height = cs3.c.height();
			}
		},
		setPerspective : function(a, target){
			a = a || {};
			a.value = a.value || 1200;
			a.origin = a.origin || '50% 50%';
			if (!target) var target = navigator.userAgent.indexOf('MSIE')>=0 ? cs3.l : cs3.c;
			target.css({
				"-webkit-perspective-origin":a.origin,
				"-webkit-perspective":a.value,
				"-moz-perspective-origin":a.origin,
				"-moz-perspective":a.value	,
				"-ms-perspective-origin":a.origin,
				"-ms-perspective":a.value	,
				"-o-perspective-origin":a.origin,
				"-o-perspective":a.value	,
				"perspective-origin":a.origin,
				"perspective":a.value
			})
		},
		triggerIndex : false,
		getDelay : function(p) {
			var newDelay=0;
			if (p.grid.cols && p.grid.rows) {
				var rowIndex = Math.floor(p.index/p.grid.cols),
					colIndex = p.index - p.grid.cols*Math.floor(p.index/p.grid.cols)
			}
			if (!p.startIndex) {
				p.startIndex = 0;
			}
			switch(p.type) {
				case 'linear' : {
					if (p.startIndex == 'middle') p.startIndex = Math.floor(p.grid.rows*p.grid.cols/2); 
					newDelay = Math.abs(p.delay*(p.startIndex-p.index));
					if (p.startIndex >= p.grid.cols*p.grid.rows/2) cs3.h.triggerIndex = 0
					else cs3.h.triggerIndex = p.grid.cols*p.grid.rows-1
				}
				break;
				
				case 'progressive' : {
					newDelay = Math.abs(p.delay*( p.startIndex - (colIndex*p.grid.rows/5+rowIndex) ));
					if (p.startIndex >= p.grid.cols*p.grid.rows/2) cs3.h.triggerIndex = 0
					else cs3.h.triggerIndex = p.grid.cols*p.grid.rows-1
					
				}
				break;
				
				case 'horizontal' : {
					newDelay = Math.abs(p.delay*(p.startIndex - colIndex));
					if (p.startIndex >= p.grid.cols/2) cs3.h.triggerIndex = 0;
					else cs3.h.triggerIndex = p.grid.cols-1;
                }
                    break;
				
				case 'vertical' : {
					newDelay = Math.abs(p.delay*(p.startIndex-rowIndex));
					if (p.startIndex >= p.grid.rows/2) cs3.h.triggerIndex = 0;
					else cs3.h.triggerIndex = p.grid.rows*p.grid.cols-1;
				}
				break;
			}
			return newDelay
		},
		indexes : function() {
			var b={};
			b.active = cs3.c.find('.cs3-active-slide').index();
			b.next = b.active+1>=cs3.slides.length ? 0 : b.active+1;
			b.prev = b.active-1<0 ? cs3.slides.length-1 : b.active-1
			return b
		},
		transformString : function(transform){
			return '-webkit-transform:'+transform+';' + '-moz-transform:'+transform+';' + '-o-transform:'+transform+';' + '-ms-transform:'+transform+';' + 'transform:'+transform+';'
		},
		slice : function(a) {
			if (a.square) {
				if (!a.squareSize) a.squareSize = 100;
				a.cols = Math.ceil(cs3.width/a.squareSize);
				a.rows = Math.ceil(cs3.height/a.squareSize)
			}
			var x = a.cols, y = a.rows;
			if(a.index2===0) a.index2='0';
			//Widths
			var sliceWidth = Math.floor(cs3.width / x);
			var lastWidth = sliceWidth;
			if (sliceWidth*x < cs3.width) {
				lastWidth = cs3.width - sliceWidth*(x-1)
			}
			//Heights
			var sliceHeight = Math.floor(cs3.height/y);
			var lastHeight = sliceHeight;
			if (sliceHeight*y < cs3.height) {
				lastHeight = cs3.height - sliceHeight*(y-1)
			}
			//Generate HTML
			var html = "";
			var img1 = cs3.images[a.index1];
			if (a.index2) {
				var img2 = cs3.images[a.index2];
			}
			var html2='';
			if (a.separate) {
				html+= '<div class="cs3-slices-block">';
				html2+='<div class="cs3-slices-block">'
				
			}
			for (var i = 0; i<x*y; i++) {
				var vIndex = Math.floor(i/x),
					hIndex = i - x*Math.floor(i/x),
					lastInRow = (i+1)%x==0,
					lastInColumn = i>x*y-1-x;
				
				var sWidth = lastInRow ? lastWidth : sliceWidth,
					sHeight = lastInColumn ? lastHeight : sliceHeight,
					sLeft = hIndex*(prevWidth||0),
					sTop = vIndex*(prevHeight||0),
					bgPos = -sLeft+'px -'+sTop+'px';

				if (!a.make3d) {	
					var styleAttr = 'background-position:'+bgPos+'; background-image:url('+img1+'); left:'+sLeft+'px; top:'+sTop+'px; width:'+sWidth+'px; height:'+sHeight+'px;';
					if (a.wrap) styleAttr = 'background-position:'+bgPos+'; background-image:url('+img1+'); left:0px; top:0px; width:'+sWidth+'px; height:'+sHeight+'px;';
					
					if (a.index2&&a.wrap) {
						html+='<div class="cs3-slices-block" style="left:'+sLeft+'px; top:'+sTop+'px; width:'+sWidth+'px; height:'+sHeight+'px;">';
						sLeft = 0;
						sTop = 0
					}
					
					html+='<div class="cs3-slice" style="'+styleAttr+'"></div>';
					if (a.index2) {
						var styleAttr2 = 'background-position:'+bgPos+'; background-image:url('+img2+'); left:'+sLeft+'px; top:'+sTop+'px; width:'+sWidth+'px; height:'+sHeight+'px;';
						var _html = '<div class="cs3-slice" style="'+styleAttr2+'"></div>';
						//Separate Blocks
						if (!a.separate) html+= _html;
						else html2+=_html;
						
					}
					if (a.index2&&a.wrap) {
						html+='</div>';
					}
				}
				else {
					var b = a.make3d;
					var faces = $.extend({
						left:'#555',
						right:'#222',
						top:'#555',
						bottom:'#222',
						back:'#333'
					},b.faces);
					
					html+='<div class="cs3-slice" style="left:'+sLeft+'px; top:'+sTop+'px; width:'+sWidth+'px; height:'+sHeight+'px;">';
					
					//Front Face
					html+='<div style="background-position:'+bgPos+'; background-image:url('+img1+'); width:'+sWidth+'px; height:'+sHeight+'px" class="cs3-front-face"></div>';
					
					//New Face BG
					var newFaceBG = 'background-position:'+bgPos+'; background-image:url('+img2+');';
					
					//Back Face

					var backBG = '';
					var backRotate = 'rotateY(180deg)';
					if (b.newFace=='back') backBG = newFaceBG;
					if (b.newFace && b.newFaceRotate) backRotate = b.newFaceRotate;
					if (!b.depth) b.depth = 0
					var backTransform = backRotate+' translate3d(0,0,'+parseInt(b.depth,10)+'px)';
					html+='<div style="'+backBG+' width:'+sWidth+'px; height:'+sHeight+'px; '+cs3.h.transformString(backTransform)+'" class="cs3-back-face"></div>';
					
					if (b.depth) {
						//Make Right, Left, Top and Bottom faces
						
						//Right Face
						var rightBG = '';
						var rightTransform = 'rotateY(90deg) translate3d('+b.depth/2+'px,0,'+(sWidth - b.depth/2)+'px)';
						if (b.newFace=='right') rightBG = newFaceBG;
						html+='<div style="'+rightBG+' width:'+b.depth+'px; height:'+sHeight+'px; '+cs3.h.transformString(rightTransform)+'" class="cs3-right-face"></div>';	
						
						//Left Face
						var leftBG = '';
						var leftTransform = 'rotateY(-90deg) translate3d('+(-b.depth/2)+'px,0,'+(b.depth/2)+'px)';
						if (b.newFace=='left') leftBG = newFaceBG;
						html+='<div style="'+leftBG+' width:'+b.depth+'px; height:'+sHeight+'px; '+cs3.h.transformString(leftTransform)+'" class="cs3-left-face"></div>';	
						
						//Bottom Face
						var bottomBG = '';
						var bottomTransform = 'rotateX(-90deg) translate3d(0px,'+(b.depth/2)+'px,'+(sHeight-b.depth/2)+'px)';
						if (b.newFace=='bottom') bottomBG = newFaceBG;
						html+='<div style="'+bottomBG+' width:'+sWidth+'px; height:'+b.depth+'px; '+cs3.h.transformString(bottomTransform)+'" class="cs3-bot-face"></div>';
						
						//Top Face
						var topBG = '';
						var topTransform = 'rotateX(90deg) translate3d(0px,'+(-b.depth/2)+'px,'+(b.depth/2)+'px)';
						if (b.newFace=='top') topBG = newFaceBG;
						html+='<div style="'+topBG+' width:'+sWidth+'px; height:'+b.depth+'px; '+cs3.h.transformString(topTransform)+'" class="cs3-top-face"></div>';
						
					}
					
					html+='</div>';
				}
                if (!lastInColumn) {
				    var prevHeight = sHeight;
                }
				if (!lastInRow) {
                	var prevWidth = sWidth;
				}
			};
			if (a.separate) {
				html+= '</div>';
				html2+='</div>';
				html = html+html2;
				
			}
			return {
				html : html,
				cols : x,
				rows : y
			};
			
		},
		animFrame : function(c){
		      if (window.requestAnimationFrame) return window.requestAnimationFrame(c)
		      else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(c)
		      else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(c)
		      else if (window.oRequestAnimationFrame) return window.oRequestAnimationFrame(c)
		      else if (window.msRequestAnimationFrame) return window.msRequestAnimationFrame(c)
			  else if (window.MSRequestAnimationFrame) return window.MSRequestAnimationFrame(c)
		      else return window.setTimeout(c, 1000 / 60);
		      
		}
	};

    //Responsive Resizes
    if (cs3.params.responsive) {
		//--  Update Dimension
        $(window).on('resize', function(){
            cs3.h.updateDimension();
        })
        //--  Update Touch Plugin
        if (cs3.params.touch && cs3.params.touch.enabled && cs3.support.touch && ('touch' in cs3.plugins) ) {
            $(window).on('orientationchange', function(){
				cs3.h.updateDimension();
                cs3.slides.eq(cs3.h.indexes().active).show();
                cs3.plugins.touch.init(cs3);
            })
        }
        //--  Update Ambilight Plugin
        if (cs3.params.ambilight > 0 && ('ambilight' in cs3.plugins) ) {
            if (cs3.support.touch) {
                $(window).on('orientationchange', function(){
                    cs3.plugins.ambilight.init(cs3);
                })
            }
            else {
                $(window).on('resize', function(){
                   cs3.plugins.ambilight.init(cs3);
                })
            }
        }
    }

	
	//Prepare, used in effects
	cs3.prepare = function(a) {
		if (a.l||a.l===0) {
			cs3.l[0].style.display = a.l===1 ? 'block' : 'none'
		}
		if (a['new']||a['new']===0) {
			cs3.slides.eq( cs3.newSlideIndex )[0].style.display = a['new']===1 ? 'block' : 'none'
		}
		if (a.active||a.active===0) {
			cs3.slides.eq( cs3.h.indexes().active )[0].style.display = a.active===1 ? 'block' : 'none'
		}
		if (a.p) {
			cs3.h.setPerspective({value:1200})
		}
		if (cs3.params.responsive) {
			cs3.l.find('*').css({
				backgroundSize : cs3.width+'px '+cs3.height+'px',
				'-webkit-background-size' : cs3.width+'px '+cs3.height+'px'
			});
		}
		else {
			var activeSlide = $(cs3.slides[cs3.h.indexes().active])
			var newSlide = $(cs3.slides[cs3.newSlideIndex])
			if (activeSlide.hasClass('cs3-video-slide') || newSlide.hasClass('cs3-video-slide')) {
				cs3.l.find('*').css({
					backgroundSize : cs3.width+'px '+cs3.height+'px',
					'-webkit-background-size' : cs3.width+'px '+cs3.height+'px'
				});
			}
		}
	}
	//Run Animation
	cs3.run = function(){
		if (cs3.isAnimating) return;
		
		cs3.h.updateDimension();
		
		//Plugins onStart
		cs3._plugins.onStart(cs3)
		
		//Callback
		if (cs3.params.callbacks.onTransitionStart) cs3.params.callbacks.onTransitionStart(cs3)
		
		//Triggers
		if (cs3.e.preventedByPlugin) return;
		cs3.isAnimating = true;

		//Update Video Slide
		if (cs3.slides.eq( cs3.h.indexes().active ).hasClass('cs3-video-slide')) {
			//Hide Video and show Picture
			var slide = cs3.slides.eq( cs3.h.indexes().active )
			if (slide.find('iframe').data('videoservice')=='youtube'){
				if( (typeof slide.data('player')!=='undefined') && (typeof slide.data('player').pauseVideo!=='undefined') ) slide.data('player').pauseVideo()
			}

			if (slide.find('iframe').data('videoservice')=='vimeo')
				if (window.$f) $f(slide.find('iframe')[0]).api('pause')

			slide.find('img').fadeIn(300, function () {
			  	runEffect()
			})
		}
		else runEffect()

		//Run Effect
		function runEffect() {
		    var eIndex = Math.floor( Math.random()*cs3.effects.length );
			var effect = cs3.effects[eIndex].split('-');
			cs3.e[effect[0]][effect[1]](cs3)
		}		
		
	};
	
	//Update Slides after Animation
	cs3.updateSlides = function(){
		if(cs3.newSlideIndex===false) return;
		
		cs3.slides.eq( cs3.h.indexes().active ).removeClass('cs3-active-slide')[0].style.display = 'none';
		cs3.slides.eq( cs3.newSlideIndex ).addClass('cs3-active-slide')[0].style.display = 'block';
		cs3.l.removeAttr('style')[0].innerHTML='';
		cs3.l[0].style.display = 'none';
		cs3.isAnimating = cs3.direction = cs3.newSlideIndex = false;
		
		//Plugins onEnd
		cs3._plugins.onEnd(cs3);
		
		//Continue Auto Play
		if (cs3.params.autoplay.enabled) {
			cs3.autoplayStart();	
		}
		
		//Callback
		if (cs3.params.callbacks.onTransitionEnd) cs3.params.callbacks.onTransitionEnd(cs3)

		//Update Video Slide
		if (cs3.slides.eq( cs3.h.indexes().active ).hasClass('cs3-video-slide')) {
			//Hide Picture and show Video
			var slide = cs3.slides.eq( cs3.h.indexes().active )
			slide.find('img').fadeOut(300)
			slide.find('.cs3-video')//.fadeIn(300)

		}	
	};
	//Init Function
	cs3.init = function(){
		//Update Slider Dimension
		cs3.h.updateDimension();
		//Init Plugins
		cs3._plugins.init(cs3)
		//Start Autoplay
		if (cs3.params.autoplay.enabled) {
			cs3.autoplayStart();	
		}
		//Run Callback
		if (cs3.params.callbacks.onInit) cs3.params.callbacks.onInit(cs3)
	};
	
	//Pre-Loader
	if (cs3.params.preloader != false) {
		cs3.c.append('<div class="cs3-preloader"><div class="cs3-preloader-in"></div></div>');
		var isOldIE = navigator.userAgent.indexOf('MSIE 6')>=0 || navigator.userAgent.indexOf('MSIE 7')>=0 || navigator.userAgent.indexOf('MSIE 8')>=0 || navigator.userAgent.indexOf('MSIE 9')>=0;

		var counter = 0;
		var imagesAreLoaded = false;
		var imagesToLoad = cs3.params.preloadOnlyFirst ? 1 : cs3.images.length;
		for (var i=0; i<imagesToLoad; i++) {
			var img = new Image();
			img.onload = function(){
				counter++;
				if (counter==imagesToLoad) {
					if(imagesAreLoaded) return;
					imagesAreLoaded = true;
					cs3.c.find('.cs3-preloader').remove();
					cs3.slides.eq(0).fadeIn(300);
					cs3.init();	
				}
			};
			img.src = cs3.images[i];	
		}
		
		if (isOldIE)  {
			setTimeout(function(){
				if(imagesAreLoaded) return;
				imagesAreLoaded = true;
				cs3.c.find('.cs3-preloader').remove();
				cs3.slides.eq(0).fadeIn(300);
				cs3.init();	 	
			},3000)	
		}
	}
	else {
		cs3.slides.eq(0).show();
		cs3.init()
	}
	
	//Return cs3
	return cs3;

};

ChopSlider3.prototype = {
	e : {
		flat : {},
		twoD : {},
		threeD : {},
		canvas : {},
		preventedByPlugin : false
	}, // <- End Effects
	
	plugins : {},
	
	//CSS3 Detection
	hasCSS3 : function() {
		$("body").append('<div class="cs3-css3Test"></div>');
		var test = $(".cs3-css3Test")[0].style,
			s = test.transition !== undefined || test.WebkitTransition !== undefined || test.MozTransition !== undefined || test.MsTransition !== undefined || test.OTransition !== undefined;
		$(".cs3-css3Test").remove();
		return s
	
	},
	//3D Detection
	has3D : function() {
		if(this.hasCSS3()) {
			var s3d=false, webkit=false;
			$("body").append('<div class="cs3-css3Test"></div>');
			var test = $(".cs3-css3Test")[0].style;	
			if("webkitPerspective" in test || "MozPerspective" in test || "OPerspective" in test || "MsPerspective" in test || "perspective" in test) s3d=true
			if("webkitPerspective" in test) webkit = true;
			if(s3d&&webkit) {
				var _query = $('<style media="(transform-3d), (-moz-transform-3d), (-webkit-transform-3d), (-o-transform-3d), (-ms-transform-3d)">div.cs3-css3Test { overflow: hidden }</style>');
				$('head').append(_query);
				s3d=false;
				if($(".cs3-css3Test").css("overflow")=="hidden") {
					s3d=true;
				}
				_query.remove();
			}
			$(".cs3-css3Test").remove();
			return s3d;
		}
		else {
			return false
		}
	
	},
	//Canvas Detection
	hasCanvas : function(){
		var elem = document.createElement('canvas');
		return !!(elem.getContext && elem.getContext('2d'));		
	}
};





/* 
	=================================
	Chop Slider 3 - Flat Effects
	================================= 
*/

ChopSlider3.prototype.e.flat = {
	fade : function(cs3) {
		cs3.prepare({l:0, active:1, 'new':1})
		cs3.slides.eq(cs3.h.indexes().active).fadeOut(300, function(){
			cs3.updateSlides();	
		})
	},
	bricks : function(cs3) {
		var sliced = cs3.h.slice({index1:cs3.newSlideIndex, square: true})
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1})
		
		cs3.l.children().each(function(){
			var a = $(this)
			var index = a.index()
			var aWidth = a.width()
			var aHeight = a.height()
			a.css({
				width:0,
				height:0,
				opacity:0
			})
			.delay( cs3.h.getDelay({ type:'progressive', index: index, delay : 150, grid:sliced} ) )
			.animate({width: aWidth, height:aHeight, opacity:1}, 300, function(){
				if ( index == cs3.h.triggerIndex ) {
					cs3.updateSlides()
				}
			})
		})
	}, // <- End Bricks
	blinds_h : function(cs3) {
		var sliced = cs3.h.slice({index1:cs3.newSlideIndex, cols:Math.floor(cs3.width/50), rows:1})
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1})
		
		cs3.l.children().each(function(){
			var a = $(this)
			var index = a.index()
			var aWidth = a.width()
			var aLeft = a.position().left
			a.css({
				width:0,
				opacity:0,
				left : aLeft + (cs3.direction==1 ? 30 : -30)
			})
			.delay( cs3.h.getDelay({ type:'linear', index: index, delay : 50, grid:sliced, startIndex: cs3.direction===1 ? 0 : sliced.cols} ) )
			.animate({width: aWidth, opacity:1, left: aLeft}, 400, function(){
				if ( index == cs3.h.triggerIndex ) {
					cs3.updateSlides()
				}
			})
		})
	}, // <- End Blinds
	blinds_v : function(cs3) {
		var sliced = cs3.h.slice({index1:cs3.newSlideIndex, cols: Math.floor(cs3.width/50), rows:1})
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1})
		cs3.l.css({overflow: 'hidden'})
		cs3.l.children().each(function(){
			var a = $(this)
			var index = a.index()
			a.css({
				top:-cs3.height,
				opacity:0
			})
			.delay( cs3.h.getDelay({ type:'linear', index: index, delay : 50, grid:sliced, startIndex: cs3.direction===1 ? 0 : sliced.cols} ) )
			.animate({top: 0, opacity:1}, 400, function(){
				if ( index == cs3.h.triggerIndex ) {
					cs3.updateSlides()
				}
			})
		})
	}, // <- End Blinds
	zip : function(cs3) {
		var sliced = cs3.h.slice({index1:cs3.newSlideIndex, cols: Math.floor(cs3.width/50), rows:1})
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1})
		cs3.l.css({overflow: 'hidden'})
		cs3.l.children().each(function(){
			var a = $(this)
			var index = a.index()
			a.css({
				top: a.index()%2==0 ? -cs3.height : cs3.height,
				opacity:0
			})
			.delay( cs3.h.getDelay({ type:'linear', index: index, delay : 50, grid:sliced, startIndex: cs3.direction===1 ? 0 : sliced.cols} ) )
			.animate({top: 0, opacity:1}, 400, function(){
				if ( index == cs3.h.triggerIndex ) {
					cs3.updateSlides()
				}
			})
		})
	} // <- End Zip
};

/* 
	=================================
	Chop Slider 3 - 2D Effects
	================================= 
*/
   
ChopSlider3.prototype.e.twoD = {
	smear : function(cs3) {
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active , square: true})
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({ l:1, active : 0, 'new' : 1 })
		setTimeout(function(){
			cs3.l.children().each(function(){
				var tX = cs3.direction ==1 ? 100 : -100;
				var r = cs3.direction ==1 ? 5 : -5;
				var start = cs3.direction == 1 ? 0 : sliced.cols;
				$(this).csTransform({
					time:1000,
					transform: 'scale(2,1.5) rotate('+r+'deg) translate3d('+tX+'px,0,0)',
					delay:cs3.h.getDelay({type:'horizontal', index: $(this).index() , delay : 50, grid : sliced, startIndex : start})
				})
				.csTransitionEnd(function(){
					if ($(this).index()==cs3.h.triggerIndex) cs3.updateSlides()
				})
				.css({opacity:0})
			})
		},50)
	
	},// <!- End Smear
	__bars : function(cs3, p) {
		p = p || {}
		p.cols = p.cols || 1;
		p.rows = p.rows || 6;
		p.type = p.type || 'h';
		var dir = cs3.direction;
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:p.cols, rows:p.rows, wrap:true})
		cs3.l[0].innerHTML = sliced.html
		cs3.l.find('.cs3-slice').each(function(){
			var a = $(this)
			var index = a.index()
			var translateX = p.type=='h' ? ( index%2==0 ? 0 : (a.parent().index()%2==0 ? cs3.width : -cs3.width) ) : 0;
			var translateY = p.type=='h' ? 0 : (  index%2==0 ? 0 : (a.parent().index()%2==0 ? cs3.height : -cs3.height)  );
			translateX = translateX * dir;
			translateY = translateY * dir;
			a.csTransform({
				transform:'translate3d('+translateX+'px, '+translateY+'px, 0px)'
			})
		})
		cs3.l.css({overflow:'hidden'})
		cs3.prepare({ l:1, active : 0, 'new' : 1 })
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this)
				var translateX = p.type=='h' ? (a.index()%2!=0 ? cs3.width : -cs3.width) : 0;
				translateX = translateX * dir;
				var translateY = p.type=='h' ? 0 : (a.index()%2!=0 ? cs3.height : -cs3.height);
				translateY = translateY * dir;
				a.csTransform({
					transform: 'translate3d('+translateX+'px, '+translateY+'px, 0px)',
					time:1000,
					delay: 0,
					ease: 'cubic-bezier(1,0,0.8,0.2)'
				})
				.csTransitionEnd(function(){
					if (a.index()==p.cols-1) cs3.updateSlides()
				})
			})
		},50)
	},
	//Bars Difference
	slide_h : function(cs3) {
		cs3.e.twoD.__bars(cs3,{type:'h', cols:1, rows:1})
	},
	zip_h : function(cs3) {
		cs3.e.twoD.__bars(cs3,{type:'h', cols:1, rows:6})
	},
	slide_v : function(cs3) {
		cs3.e.twoD.__bars(cs3,{type:'v', cols:1, rows:1})
	},
	zip_v : function(cs3) {
		cs3.e.twoD.__bars(cs3,{type:'v', cols:10, rows:1})
	},
	
	gravity : function(cs3, p) {
		p = p || {}
		p.cols = p.cols || 10;
		p.rows = p.rows || 10;
		p.type = p.type || 'v';
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, cols:p.cols, rows:p.rows, square:true})
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, 'new':1})
		
		cs3.l.children().each(function(){
			var a = $(this)
			setTimeout(function(){
				a.csTransform({
					delay:cs3.h.getDelay({type:'progressive', index: a.index() , delay : 220, grid : sliced, startIndex : 0}),
					time:800,
					transform: 'scaleY(1) scaleX(1) translate3d(0, -1500px,0)',
					ease: 'ease-in'
				})
				.csTransitionEnd(function(){
					if (a.index()==cs3.h.triggerIndex) cs3.updateSlides()
				})
			},50)
			
		})
	},
	bulb : function(cs3,p){
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, separate : true, square:true})
		cs3.l[0].innerHTML = sliced.html
		
		var cols = sliced.cols
		var rows = sliced.rows
		
		var block1 = $('.cs3-slices-block:eq(0)', cs3.l)
		var block2 = $('.cs3-slices-block:eq(1)', cs3.l);
		block1.children().csTransform({time:800})
		block2.children().each(function(){
			var rotate = Math.random()*10
			var a = $(this)
			var index = a.index()
			var rowIndex = Math.floor(index/cols),
				colIndex = index - cols*Math.floor(index/cols);
			var offsetX = -10
			var offsetY = -20
			var x = offsetX*colIndex-offsetX*(cols-colIndex);
			var y = offsetY*rowIndex-offsetY*(rows-rowIndex);
			$(this).csTransform({time:1200, transform:'scale(0) rotate('+rotate+'deg) translate3d('+x+'px,'+y+'px,0px)'})
		})
		
		cs3.prepare({l:1, active:0})

		var offsetX = 20
		var offsetY = 50
		setTimeout(function(){
			block1.children().each(function(){
				var a = $(this)
				var index = a.index()
				a.csTransform({
					transform:' scale(0) translate3d(0,0,0px)',
					time:600,
					delay:cs3.h.getDelay({index: index, delay:80, grid: sliced, type: 'progressive'}),
					ease: 'cubic-bezier(1, -1, 0, 0.1)'
				})
			})
			block2.children().each(function(){
				$(this)
				.csTransform({
					transform:'scale(1) rotate(0deg) translate3d(0,0,0)',
					time:800,
					delay:(600)+cs3.h.getDelay({index: $(this).index(), delay:80, grid: sliced, type: 'progressive'}),
					ease: 'cubic-bezier(0, 1, 0, 1.3)'
				})
				.csTransitionEnd(function(){
					if ($(this).index() == cs3.h.triggerIndex) cs3.updateSlides()
				})
			})
		},50)
	
	},
	morpher : function(cs3) {
		var size = Math.min(cs3.width , cs3.height);
		var type = cs3.width>cs3.height ? 'h' : 'v';
		var html = '';
		var activeIndex = cs3.h.indexes().active
		for (var i = size, j=0; i>50; i-=20,j++) {
			var position = type=='h' ? {left:cs3.width-i-10*j, top:size - i-10*j} : {left: size - i-10*j, top:cs3.height-i-10*j};
			var br = '; border-radius:50px' 
			var bg1 = 'background-image :url('+cs3.images[activeIndex]+'); background-position: -'+position.left+'px -'+position.top+'px; ';
			var bg2 = 'background-image :url('+cs3.images[cs3.newSlideIndex]+'); background-position: -'+j*10+'px -'+position.top+'px; ';
			html+='<div class="cs3-slices-block" style="width:'+i+'px; height:'+i+'px; left:'+position.left+'px; top:'+position.top+'px">';
			html+='<div class="cs3-slice" style="'+bg1+' width:'+i+'px; height:'+i+'px; '+br+'"></div>';
			html+='<div class="cs3-slice" style="'+bg2+' width:'+i+'px; height:'+i+'px; opacity:0; '+br+'"></div>';
			html+='</div>'
		}
		
		cs3.l[0].innerHTML = '<div class="cs3-dummy"></div><div class="cs3-dummy">'+html+'</div>';
		
		cs3.l.children().eq(0).css({
			width:cs3.width, 
			height:cs3.height, 
			opacity:0, 
			backgroundImage:'url('+cs3.images[cs3.newSlideIndex]+')',
			position:'absolute'
		});	
		cs3.l.find('.cs3-slices-block').csTransform({transform:'rotate(0deg) translate3d(0px,0,0)'})	
		cs3.prepare({l:1, active:1})
		setTimeout(function(){
			cs3.l.find('.cs3-slices-block').each(function(){
				var a = $(this);
				var index = a.index();
				var left = parseInt(a.css('left'),10);
				var top = parseInt(a.css('top'),10);
				var delay = (j-index-1) * 50;
				var ease = 'ease-in-out'
				a.csTransform({
					delay: delay,
					transform: 'rotate(-360deg) translate3d(30px,0,0)',
					time:2000,
					ease: ease
				})
				.css({left: left-(cs3.width-size)-30 , top: top-(cs3.height-size)});
				a.children().eq(0).csTransform({time:500, delay: delay+1500, ease: ease}).css({opacity:0});
				a.children().eq(1).csTransform({time:1000, delay: delay+1000, ease: ease}).css({opacity:1});
				if (index==0) {
					cs3.l.children().eq(0).csTransform({time:2000, delay:delay, ease: ease}).css({opacity:1})
					.csTransitionEnd(function(){ cs3.updateSlides() })
				}
			})
			
		},50)
	},
	reveal : function (cs3) {
	  	var sliced = cs3.h.slice({index1:cs3.h.indexes().active, cols:1, rows:2})
	  	cs3.l[0].innerHTML = sliced.html
		cs3.l.css({overflow:'hidden'})
		cs3.l[0].innerHTML+='<div style="background-image:url('+cs3.images[cs3.newSlideIndex]+'); width:'+cs3.width+'px; height:'+cs3.height+'px; position:absolute; z-index:0; left:0; top:0"></div>';
		cs3.prepare({ l:1, active : 0, 'new' : 0 })
		var top = cs3.l.children().eq(0).css({position:'absolute', zIndex:10})
		var bot = cs3.l.children().eq(1).css({position:'absolute', zIndex:10})
		var back = cs3.l.children().eq(2)
			.csTransform({
				transform:'scale(0.8) translate3d('+(Math.random()*200-100)+'px,0,0) rotate('+(Math.random()*10-5)+'deg)'
			})
		setTimeout(function () {
		  	top
		  	.css({opacity:1})
		  	.csTransform({
		  		ease: 'ease-in',
				transform:'scale(1.2) translate3d(0,-'+cs3.height+'px,0) rotate('+(Math.random()*30-10)+'deg)',
				time:900
			})
			bot
		  	.css({opacity:1})
		  	.csTransform({
		  		ease:'ease-in',
				transform:'scale(1.2) translate3d(0,'+cs3.height+'px,0) rotate('+(Math.random()*30-10)+'deg)',
				time:900
			})
			back
			.csTransform({
				transform:'scale(1) translate3d(0,0,0) rotate(0deg)',
				time:900
			})
			.csTransitionEnd(function () {
			  	cs3.updateSlides()
			})
		},1000/30)
	}
};

/* 
	=================================
	Chop Slider 3 - 3D Effects
	================================= 
*/

ChopSlider3.prototype.e.threeD = {
	
	/* =======================
		3D Turn
	==========================*/
	
	turn: function(cs3) {
		var dir = cs3.direction;
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, cols:2, rows:1});
		cs3.l[0].innerHTML = sliced.html;
		var dummy = cs3.l.append('<div class="cs3-dummy"></div>').find('.cs3-dummy');
		if (dir===1) {
			cs3.l.children().eq(1).appendTo(dummy);
			dummy.children().clone().appendTo(dummy);
			dummy.children().eq(1).css({
				backgroundImage : 'url('+cs3.images[cs3.newSlideIndex]+')',
				backgroundPosition: '0px 0px'
			})
			.csTransform({transform:'rotateY(-180deg) translate3d(0,0,2px)'});
		}
		else {
			cs3.l.children().eq(0).appendTo(dummy);
			
			dummy.children().clone().appendTo(dummy);
			dummy.children().eq(1).css({
				backgroundImage : 'url('+cs3.images[cs3.newSlideIndex]+')',
				backgroundPosition: cs3.l.children().eq(0).css('background-position')
			})
			.csTransform({transform:'rotateY(-180deg) translate3d(0,0,2px)'});
		}
		cs3.l.find('.cs3-slice:eq(0)').clone().insertAfter(cs3.l.children().eq(0)).addClass('cs3-fade-black').csTransform({time:500, delay:200});
		cs3.prepare({l:1, 'new' : 1, active:0, p: true});
		//cs3.h.setPerspective({value:1200}, dummy)
		setTimeout(function(){
			cs3.l.find('.cs3-fade-black').css({opacity:0.3});
			dummy.csTransform({
				transform: dir===1 ? 'rotateY(-179.9deg)' : 'rotateY(179.9deg)',
				time:700
			})
			.csTransitionEnd(function(){ cs3.updateSlides() });	
		},50);
		
	}, // <- End Turn

	/* =======================
		3D Bars
	==========================*/
	
	_flip : function(cs3, p) {
		p = p || {}
		p.cols = p.cols || 1;
		p.rows = p.rows || 6;
		p.type = p.type || 'h';
		var newFaceRotate;
		var dir = cs3.direction;
		if (dir==1) {
			newFaceRotate = p.type=='h' ? 'rotateY(180deg)' : 'rotateX(180deg)';
		}
		else {
			newFaceRotate = p.type=='h' ? 'rotateY(-180deg)' : 'rotateX(-180deg)';
		}
		var make3d = {
			newFace : 'back',
			newFaceRotate : newFaceRotate
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:p.cols, rows:p.rows, wrap:true, make3d:make3d })
		
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		
		var lastIndex = p.type=='h' ? p.rows-1 : 0
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this)
				var index = a.index()
				var delay = p.type == 'h' ? 50*index : 50*(p.cols-index)
				a.csTransform({
					transform: make3d.newFaceRotate,
					time:1000,
					delay: delay,
					ease: 'cubic-bezier(1, 0 , 0.8, 1.2)'
				})
				.csTransitionEnd(function(){
					if (a.index()==lastIndex) cs3.updateSlides()
				})
			})
		},50)
	},
	//Bars 3D Modifications
	flip_h_single : function(cs3) {
		cs3.e.threeD._flip(cs3,{cols:1, rows:1, type:'h'})
	},
	flip_h_multi : function(cs3) {
		cs3.e.threeD._flip(cs3,{cols:1, rows:6, type:'h'})
	},
	flip_v_single : function(cs3) {
		cs3.e.threeD._flip(cs3,{cols:1, rows:1, type:'v'})
	},
	flip_v_multi : function(cs3) {
		cs3.e.threeD._flip(cs3,{cols:10, rows:1, type:'v'})
	},
	flip_random : function(cs3) {
		var p = p || {}
		var make3d = {
			newFace : 'back',
			newFaceRotate : 'rotateY(180deg)'
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, square: true, wrap:true, make3d:make3d })
		var cols = sliced.cols;
		var rows = sliced.rows;
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		//Random Delays
		var delays = [];
		var maxDelay = 0;
		for (var i=0; i <  cols*rows; i++) {
			var rndDelay = Math.round(Math.random()*500);
			delays.push( rndDelay );
			maxDelay = Math.max( maxDelay , rndDelay );
		}
		var lastIndex =  sliced.rows-1;

		setTimeout(function(){

			cs3.l.children().each(function(){
				var a = $(this)
				var index = a.index()
				var rotateY = index%2==0 ? 180 : 0;
				var rotateX = index%2==0 ? 0 : 180;
				a.find('.cs3-back-face').csTransform({transform:'rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)'})
				a.csTransform({
					transform: 'rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)',
					time:1000,
					delay: delays[index]
				})
				.csTransitionEnd(function(){
					if (delays[index]==maxDelay) cs3.updateSlides()
				})
			})
		},50)
	},
	/* =======================
		3D Blocks V
	==========================*/
	
	_blocks_v : function(cs3, p) {
		var dir = cs3.direction;
		var cols = p.cols
		var depth = p.depth
		var make3d = {
			newFace : dir === 1 ? 'top' : 'bottom',
			depth: depth
		}
		if (p.newFace) {
			make3d.newFace = p.newFace
			make3d.newFaceRotate = p.newFaceRotate
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:cols, rows:1, wrap:true, make3d:make3d })
		
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		
		var lastIndex =  0
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this)
				var index = a.index()
				var delay = p.delay*(cols-index)
				var rotate = dir === 1 ? -p.rotate : p.rotate;
				var translateY = dir === 1 ? depth/2 : -depth/2;
				var translateZ = depth/2
				if (make3d.newFace=='back') {
					translateY = 0;
					translateZ = depth
				}
				a.csTransform({
					transform: 'rotateX('+rotate+'deg) translate3d(0,'+translateY+'px,'+translateZ+'px)',
					time: p.time,
					delay: delay,
					ease: p.ease
				})
				.csTransitionEnd(function(){
					if (a.index()==lastIndex) cs3.updateSlides()
				})
			})
		},50)
	
	},
	
	blocks_v_1 : function(cs3) {
		cs3.e.threeD._blocks_v (cs3, {
			cols:6,
			depth: cs3.height,
			delay: 170,
			time: 500,
			ease : 'ease-in-out',
			rotate : 90
		})
	},
	blocks_v_2 : function(cs3) {
		var dir = cs3.direction;
		var cols = Math.floor(cs3.width/50);
		var depth = cs3.height
		var make3d = {
			newFace : dir==1 ? 'top' : 'bottom',
			depth: depth,
			newFaceRotate : 'rotateX(180deg)'
		}
		
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:cols, rows:1, wrap:true, make3d:make3d })
		
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		
		var lastIndex =  dir==1 ? 0 : sliced.cols-1
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this);
				var index = a.index();
				var delay = dir === 1 ? 50*(cols-index) : 50*index;
				var rotate = dir === 1 ? -90 : 90;
				var translateY = dir === 1 ? depth/2 : -depth/2;
				a.csTransform({
					transform: 'translate3d(0,0px,'+-200+'px)',
					time: 500,
					delay: delay,
					ease: 'ease-in-out'
				})
				.csTransitionEnd(function(){
					a.csTransform({
						transform: 'rotateX('+rotate+'deg) translate3d(0,'+translateY+'px,'+depth/2+'px)',
						delay: 0
					})
					.csTransitionEnd(function(){
						if (a.index()==lastIndex) cs3.updateSlides();
					});
				})
			})
		},50)
	},
	blocks_v_3 : function(cs3) {
		cs3.e.threeD._blocks_v (cs3, {
			cols: Math.floor(cs3.width/100)*2,
			depth: 20,
			delay: 70,
			time: 800,
			ease : 'cubic-bezier(1, 0 , 0.8, 1)',
			rotate: 180,
			newFace : 'back',
			newFaceRotate : 'rotateX(180deg)'
		})
	},
	
	blocks_v_4 : function(cs3, p) {
		var cols = Math.floor(cs3.width/100)*3
		var depth = 10
		var make3d = {
			newFace : 'back',
			newFaceRotate : 'rotateX(180deg)',
			depth:depth
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:cols, rows:1, wrap:true, make3d:make3d })
		
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		
		var lastIndex =  0
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this)
				var index = a.index()
				var delay = 70*(cols-index)
				a.csTransform({
					transform: 'rotateX(30deg) translateZ('+depth+'px)',
					time:800,
					delay: delay,
					ease: 'ease-out',
					origin: '50% 0%'
				})
				.csTransitionEnd(function(){
					setTimeout(function(){
					a.csTransform({
						transform: 'rotateX(-180deg) translateZ('+depth+'px)',
						time:800,
						delay: 0,
						ease: 'cubic-bezier(1, 0 , 0.8, 1)',
						origin: '50% 50%'
					})
					.csTransitionEnd(function(){
					
						if ($(this).index()==lastIndex) cs3.updateSlides()
					})
					},50)
				})
			})
		},50)
	},
	blocks_v_5 : function(cs3, p) {
		var dir = cs3.direction;
		var cols = Math.floor(cs3.width/50)
		var depth = 10
		var make3d = {
			newFace : 'back',
			newFaceRotate : 'rotateX(180deg)',
			depth:depth
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:cols, rows:1, wrap:true, make3d:make3d })
		
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		
		var lastIndex = dir==1 ? 0 : sliced.cols-1;
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this);
				var index = a.index();
				var delay = 50* (dir==1 ? (cols-index) : index);
				a.csTransform({
					transform: 'rotateX(-120deg) translateZ('+depth+'px)',
					time:600,
					delay: delay,
					ease: 'ease-in-out',
					origin: '50% 60%'
				})
				.csTransitionEnd(function(){
					setTimeout(function(){
					a.csTransform({
						transform: 'rotateX(180deg) translateZ('+depth+'px)',
						time:1200,
						delay: 0,
						ease: 'ease-in-out',
						origin: '50% 50%'
					})
					.csTransitionEnd(function(){
						if ($(this).index()==lastIndex) cs3.updateSlides()
					})
					},50)
				})
			})
		},50)
	},
	blocks_v_6 : function(cs3, p) {
		var dir = cs3.direction;
		var cols = Math.floor(cs3.width/50);
		
		var depth = 5;
		var make3d = {
			newFace : 'back',
			newFaceRotate : 'rotateY(180deg)',
			depth:depth
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:cols, rows:1, wrap:true, make3d:make3d })
		
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		
		var lastIndex = dir==1 ? 0 : sliced.cols-1;
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this);
				var index = a.index();
				var delay = 30* (dir==1 ? (cols-index) : index);
				var rotateDiff = dir==1 ? -90 : 90;
				var rotateX = -(-rotateDiff+rotateDiff*2*(index)/(cols-1) );
				a.csTransform({
					transform: 'rotateX('+rotateX+'deg) rotateY(-90deg) translate3d(50px,0,'+depth+'px)',
					time:900,
					delay: cs3.h.getDelay({
						type: 'linear',
						delay : 30,
						index : index,
						grid : sliced,
						startIndex : 'middle'	
					}),
					ease: 'ease-in-out',
					origin: '50% 60%'
				})
				.csTransitionEnd(function(){
					setTimeout(function(){
					a.csTransform({
						transform: 'rotateX(0deg) rotateY(180deg) translate3d(0,0,'+depth+'px)',
						time:900,
						delay: 0,
						ease: 'ease-in-out',
						origin: '50% 50%'
					})
					.csTransitionEnd(function(){
						if ($(this).index()==cs3.h.triggerIndex) cs3.updateSlides()
					})
					},50)
				})
			})
		},50)
	},
	blocks_v_7 : function(cs3, p) {
		var dir = cs3.direction;
		var rows = Math.floor(cs3.height/30);
		var cols = 2;
		var depth = 5;
		var make3d = {
			newFace : 'back',
			newFaceRotate : 'rotateX(180deg)',
			depth:depth
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:2, rows:rows, wrap:true, make3d:make3d })
		
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		
		var lastIndex = dir==1 ? 0 : sliced.cols-1;
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this);
				var index = a.index();
				var delay = 30* (dir==1 ? (cols-index) : index);
				var rotateY = index%2==0 ? -50 : 50;
				if (dir!=1) rotateY = -rotateY;
				a.csTransform({
					transform: 'rotateX('+0+'deg) rotateY('+rotateY+'deg) translate3d(0px,0,'+depth+'px)',
					time:1000,
					delay: cs3.h.getDelay({
						type: 'vertical',
						delay : 60,
						index : index,
						grid : sliced,
						startIndex : 0	
					}),
					ease: 'ease-in-out',
					origin: '50% 60%'
				})
				.csTransitionEnd(function(){
					setTimeout(function(){
						a.csTransform({
							transform: 'rotateX(180deg) rotateY(0deg) translate3d(0,0,'+depth+'px)',
							time:1000,
							delay: 0,
							ease: 'ease-in-out',
							origin: '50% 50%'
						})
						.csTransitionEnd(function(){
							if (index==cs3.h.triggerIndex) cs3.updateSlides()
						})
					},50)
				})
			})
		},50)
	},
	/* =======================
		3D Blocks H
	==========================*/
	_blocks_h : function(cs3, p) {
		var dir = cs3.direction,
			cols = p.cols,
			rows =  p.rows,
			depth = p.depth,
			make3d = {
				newFace : dir===1 ? 'right' : 'left',
				depth:depth
			}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:cols, rows:rows, wrap:true, make3d:make3d })
		
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		
		var lastIndex =  0
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this),
					index = a.index(),
					delay = p.delay*(rows-index),
					rotate = dir===1 ? -p.rotate : p.rotate,
					translateX = dir===1 ? -depth/2 : depth/2;
				a.csTransform({
					transform: 'rotateY('+rotate+'deg) translate3d('+translateX+'px, 0, '+depth/2+'px)',
					time:p.time,
					delay: delay,
					ease: 'ease-in-out'
				})
				.csTransitionEnd(function(){
					if (a.index()==lastIndex) cs3.updateSlides()
				})
				if (p.loader1 && p.loader2) {
					cs3.l.csTransform({transform:p.loader1, time:p.time/2})
					     .csTransitionEnd(function(){$(this).csTransform({transform:p.loader2})})
				}
			})
		},50)
	
	},
	
	blocks_h_1 : function(cs3) {
		cs3.e.threeD._blocks_h (cs3, {
			cols:1,
			rows:5,
			depth: cs3.width,
			delay: 170,
			time: 500,
			ease : 'ease-in-out',
			rotate : 90
		})
	},
	blocks_h_2 : function(cs3) {
		cs3.e.threeD._blocks_h (cs3, {
			cols: 1,
			rows: Math.floor(cs3.height/20),
			depth: cs3.width,
			delay: 30,
			time: 900,
			ease : 'ease-in-out',
			rotate : 90
		})
	},
	cube : function(cs3) {
		cs3.e.threeD._blocks_h (cs3, {
			cols: 1,
			rows: 1,
			depth: cs3.width,
			delay: 0,
			time: 600,
			ease : 'ease-in-out',
			rotate : 90,
			loader1 : 'scale(0.9)',
			loader2 : 'scale(1)'
		})
	},
	blocks_h_3 : function(cs3, p) {
		var cols = 1
		var dir = cs3.direction
		var rows =  Math.floor(cs3.height/100)*4
		var depth = 20
		var make3d = {
			newFace : 'back',
			newFaceRotate : 'rotateY(180deg)',
			depth:depth
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:cols, rows:rows, wrap:true, make3d:make3d })
		
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		
		var lastIndex =  0
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this)
				var index = a.index()
				var delay = 70*(rows-index)
				var rotate1 = dir === 1 ? 30 : -30;
				var rotate2 = dir === 1 ? -180 : 180;
				var translateX = dir === 1 ? 100 : -100;
				a.csTransform({
					transform: 'rotateY('+rotate1+'deg) translate3d('+translateX+'px, 0, 0px)',
					time:800,
					delay: delay,
					ease: 'ease-out'
				})
				.csTransitionEnd(function(){
					a.csTransform({
						transform: 'rotateY('+rotate2+'deg) translate3d(0px, 0, '+depth+'px)',
						delay: 0,
						ease: 'cubic-bezier(1, 0 , 0.8, 1)'
					})
					.csTransitionEnd(function(){ if (a.index()==lastIndex) cs3.updateSlides() })
				})
			})
		},50)
	},
	
	/* =======================
		3D Paper
	==========================*/
	
	_paper : function(cs3, p) {
		p = p || {}
		p.cols = p.cols || 1;
		p.rows = p.rows || 6;
		var make3d = {
			newFace : 'back',
			newFaceRotate : 'rotateY(0deg) rotateZ(0deg)'
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, cols:p.cols, rows:p.rows, wrap:true, make3d:make3d })
		
		cs3.l[0].innerHTML = sliced.html
		cs3.l.find('.cs3-back-face').each(function(){
			var posOffset = p.type=='h' ? cs3.width : cs3.height
			var pos = $(this).parent().index()%2==0 ? posOffset : -posOffset
			var translate = p.type=='h' ? 'translate3d('+pos+'px,0,0)' : 'translate3d(0,'+pos+'px,0)'
			$(this).csTransform({transform : translate})
		})
		cs3.l.find('.cs3-slice').css({overflow : 'hidden'})
		cs3.prepare({l:1, active:0, p:true})
		
		var angle = 35
		var lastIndex =  p.type=='h' ? p.rows-1 : p.cols-1 
		setTimeout(function(){			
			cs3.l.children().each(function(){
				var a = $(this)
				var index = a.index()
				var delay = 0*index
				var isEven = index%2==0;
				var rotate = isEven ? angle : -angle
				
				var aHeight = parseInt(a[0].style.height)
				var aWidth = parseInt(a[0].style.width)
				var offset = p.type=='h' ? Math.sin(2*Math.PI/360*(90 - angle))*aHeight : Math.sin(2*Math.PI/360*(90 - angle))*aWidth
				var aTop = parseInt(a[0].style.top)
				var aLeft = parseInt(a[0].style.left)
				$(this).attr('data-cs3top',aTop)
				$(this).attr('data-cs3left',aLeft)
				//Add Shadow
				if (!isEven) {
					a.append('<div class="cs3-fade-black"></div>')
					a.find('.cs3-fade-black').csTransform({time:500, ease: 'cubic-bezier(1, 0 , 0.8, 1)'})
				}
				setTimeout(function(){ a.find('.cs3-fade-black').css({opacity:0.3}) },50)
				//Animation
				var angleType = p.type=='h' ? 'rotateX('+rotate+'deg)' : 'rotateY('+rotate+'deg)'
				var offsetRule = p.type=='h' 
								? {top: aTop * offset / aHeight + (cs3.height - Math.sin(2*Math.PI/360*(90 - angle))*cs3.height  )/2 } 
								: {left: aLeft * offset / aWidth + (cs3.width - Math.sin(2*Math.PI/360*(90 - angle))*cs3.width  )/2 }
				a.csTransform({
					transform: angleType+' translate3d(0,0px,0px)',
					time:500,
					delay: 0,
					ease: 'cubic-bezier(1, 0 , 0.8, 1)'
				})
				.css(offsetRule)
				.csTransitionEnd(function(){
					a.find('.cs3-back-face').each(function(){
						$(this).csTransform({transform : 'translate3d(0,0,0)', time:500, ease: 'ease-in-out', delay:index*50})
						.csTransitionEnd(function(){
							if (a.index()==lastIndex) {
								cs3.l.children().each(function(){
									var a = $(this)
									setTimeout(function(){
										a.css({top: a.attr('data-cs3top')*1, left: a.attr('data-cs3left')*1})
										 .csTransform({transform: 'rotateX('+0+'deg) translate3d(0,0px,0px)'})
										 .csTransitionEnd(function(){ cs3.updateSlides() })
										 .find('.cs3-fade-black').css({opacity:0})
									},50)
								})
							}
						})
					})
				})
			})
		},50)
	},
	paper_h : function(cs3) {
		cs3.e.threeD._paper(cs3,{cols:1, rows:6, type:'h'})
	},
	paper_v : function(cs3) {
		cs3.e.threeD._paper(cs3,{cols:10, rows:1, type:'v'})
	},
	
	
	
	/* =======================
		3D Galaxy
	==========================*/
	
	galaxy : function(cs3) {
		var make3d = {
			newFace : 'back',
			depth:20
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, square:true, make3d: make3d})
		cs3.l[0].innerHTML = sliced.html
		var cols = sliced.cols
		var rows = sliced.rows
		cs3.l.csTransform({transform:'rotateY(0deg)', time:0, delay:0})
		cs3.prepare({l:1, active:0})
		
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this)
				//change back bg
				var bf = $('.cs3-back-face',a)
				var backBGLeft = bf.css('background-position').split(' ')[0]
				var backBGTop = bf.css('background-position').split(' ')[1]
				backBGLeft = cs3.width - parseInt(backBGLeft) + bf.width()
				bf.css({ backgroundPosition : backBGLeft+'px '+backBGTop })
				//--
				var index = a.index()
				var rotateX = Math.random()*60-30
				var rotateY = Math.random()*60-30
				var rotateZ = Math.random()*60-30
				var tX = Math.random()*50
				var tY = Math.random()*60*(-1)
				var tZ = Math.random()*400-200
				var scale = Math.random()*0.5 + 0.5
				a.csTransform({
					transform:' rotateX('+rotateX+'deg) rotateY('+rotateY+'deg) rotateZ('+rotateZ+'deg) scale('+scale+') translate3d('+tX+'px,'+tY+'px,'+tZ+'px)',
					time:400,
					delay:0,
					ease: 'linear'
				})
				.csTransitionEnd(function(){
					setTimeout(function(){
						a.csTransform({
							transform:' rotateX('+0+'deg) rotateY('+0+'deg) rotateZ('+0+'deg) scale('+1+') translate3d('+0+'px,'+0+'px,'+0+'px)',
							time:400,
							delay:1000,
							ease: 'linear'
						})
						.csTransitionEnd(function(){ if(index==0) {cs3.updateSlides()} })
					},50)
				})
			})
			cs3.l.csTransform({transform:'rotateY(180deg)', time:1800, delay:0, ease:'linear'})
			
			
		},50)
	},
	/* =======================
		Explosion
	==========================*/
	
	explosion : function(cs3) {
		var make3d = {
			newFace : 'back',
			depth:false
		}
		var sliced1 = cs3.h.slice({index1:cs3.h.indexes().active, square:true});
		var sliced2 = cs3.h.slice({index1:cs3.newSlideIndex, square:true});
		cs3.l[0].innerHTML = '<div class="cs3-dummy">'+sliced1.html+'</div>'+'<div class="cs3-dummy">'+sliced2.html+'</div>';
		var cols = sliced1.cols;
		var rows = sliced1.rows;
		cs3.l.csTransform({transform:'rotateY(0deg)', time:0, delay:0});
		var dummy1 = cs3.l.children().eq(0),
			dummy2 = cs3.l.children().eq(1);
		
		dummy2.children().each(function(){
			var rotateX = Math.random()*20 - 10,
				rotateY = Math.random()*60 - 30,
				rotateZ = Math.random()*60 - 30;
				
			$(this).csTransform({
				transform:'rotateX('+180+'deg) rotateY('+0+'deg) rotateZ('+0+'deg) scale3d(1, 1, 1) translate3d(0,0px, 0px)'
			})
		})
		
		cs3.prepare({l:1, active:0, p:true, 'new':0});
		
		setTimeout(function(){
			dummy1.children().each(function(){
				var a = $(this),
					index = a.index();
				
				var rotateX = Math.random()*20 - 10,
					rotateY = Math.random()*60 - 30,
					rotateZ = Math.random()*60 - 30;
					
				a.csTransform({
					time:1000, 
					delay: Math.random()*500, 
					transform : 'rotateX('+rotateX+'deg) rotateY('+rotateY+'deg) rotateZ('+rotateZ+'deg) scale3d(0.5, 0.5, 0.5) translate3d(0,-50px, 300px)',
					ease: 'cubic-bezier(1, -0.5 , 0, 1)'
				})
				.css({opacity:0})
			})
		},50)
		setTimeout(function(){
			dummy2.children().each(function(){
				var a = $(this);
				a.csTransform({
					delay: Math.random()*500, 
					time:1500,
					transform : 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale3d(1,1,1) translate3d(0,0px,0px)',
					ease: 'cubic-bezier(1, 1 , 0, 1.2)'
				})
			})
			setTimeout(function(){ cs3.updateSlides() },2000)
		},1000)
	},
	
	/* =======================
		Polaroid
	==========================*/
	polaroid : function(cs3) {
		cs3.l.html('<div><div class="cs3pl-image"></div><div class="cs3pl-left"></div><div class="cs3pl-top"></div><div class="cs3pl-right"></div><div class="cs3pl-bottom"></div></div><div class="cs3pl-light"></div>');
		cs3.l.find('div').css({position:'absolute'})
		cs3.l.children().eq(0)
			.css({
				left:0,
				top:0,
				width: cs3.width-2,
				height: cs3.height-2,
				border:'1px solid #333',
				display:'none'	
			})
			.find('.cs3pl-left').css({
					width:20,
					height: cs3.height-2,
					left:0,
					top:0,
					background:'#fff'
				}).end()
			.find('.cs3pl-right').css({
					width:20,
					height: cs3.height-2,
					right:0,
					top:0,
					background:'#fff'
				}).end()
			.find('.cs3pl-top').css({
					width:cs3.width-2,
					height: 20,
					left:0,
					top:0,
					background:'#fff'
				}).end()
			.find('.cs3pl-bottom').css({
					width:cs3.width-2,
					height: 50,
					left:0,
					bottom:0,
					background:'#fff'
				}).end()
			.find('.cs3pl-image').css({
					width:cs3.width-2,
					height: cs3.height-2,
					left:0,
					top:0,
					backgroundImage:'url('+cs3.images[cs3.h.indexes().active]+')',
					boxShadow:'0px 0px 0px 21px #000 inset'
				}).csTransform({transform: 'translate3d(0,0,-1px)'}).end()
		
		var light = cs3.l.find('.cs3pl-light').css({
			left:0,
			top:0,
			opacity:0,
			width:cs3.width,
			height:cs3.height,
			background:"#fff"	
		})
		cs3.prepare({active:1, 'new':1, l:1, p:true});
		light.fadeTo(200,1,function(){
			cs3.prepare({active:0});
			cs3.l.children().eq(0).show()
			.csTransform({
				transform:'rotateZ(30deg) rotateX(50deg) rotateY(-90deg) scale(0) translate3d(500px,0,800px)',
				time:1800,
				ease:'ease-in'
			})	
			.csTransitionEnd(function(){
				cs3.updateSlides()	
			})
		}).fadeTo(200,0)	
	},
	
	/* =======================
		Bricks
	==========================*/
	bricks3d : function(cs3) {
		var p = p || {}
		var make3d = {
			newFace : 'back',
			newFaceRotate : 'rotateX(180deg)',
			depth:30
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, square: true, wrap:true, make3d:make3d })
		var cols = sliced.cols;
		var rows = sliced.rows;
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		setTimeout(function(){

			cs3.l.children().each(function(){
				var a = $(this)
				var index = a.index()
				var delay = cs3.h.getDelay({
					type:'progressive', 
					grid:{cols:sliced.cols, rows:sliced.rows},
					index: index,
					delay:300
				})
				a.csTransform({
					transform: 'rotateX('+0+'deg) translate3d(0,-50px,-100px)',
					time:300,
					delay: delay,
					ease:'ease-in'
				}).csTransitionEnd(function(){
					a.csTransform({
						transform: 'rotateX('+180+'deg) translate3d(0,0,30px)',
						time:600,
						delay: 0,
						ease:'ease-out'
					}).csTransitionEnd(function(){
						if (index==cs3.h.triggerIndex) cs3.updateSlides()
					})
				})
			})
		},50)
	},
	
	/* =======================
		Tiles 3D
	==========================*/
	tiles3d : function(cs3) {
		var p = p || {}
		var make3d = {
			newFace : 'back',
			newFaceRotate : 'rotateY(180deg)',
			depth:5
		}
		var sliced = cs3.h.slice({index1:cs3.h.indexes().active, index2: cs3.newSlideIndex, square: true, squareSize:50, wrap:true, make3d:make3d })
		var cols = sliced.cols;
		var rows = sliced.rows;
		cs3.l[0].innerHTML = sliced.html
		cs3.prepare({l:1, active:0, p:true})
		setTimeout(function(){
			cs3.l.children().each(function(){
				var a = $(this)
				var index = a.index()
				var delay = cs3.h.getDelay({
					type:'progressive', 
					grid:{cols:sliced.cols, rows:sliced.rows},
					index: index,
					delay:100,
					startIndex : 0
				})
				//return
				a.csTransform({
					transform: 'rotateY('+540+'deg) translate3d(-'+a.width()+'px,0px,5px)',
					time:1500,
					delay: delay,
					ease:'ease',
					origin: 0+'px 0'
				}).csTransitionEnd(function(){
					if (index==cs3.h.triggerIndex) cs3.updateSlides()
				})
			})
		},50)
	},
	/* =======================
		Panels
	==========================*/
	panels_h : function(cs3) {
		var p = p || {}
		var newHTML = '';
		newHTML+='<div class="cs3-slice" style="width:'+cs3.width+'px; height:'+cs3.height+'px; background-image:url('+cs3.images[cs3.h.indexes().active]+'); left:0; top:0"></div>'
		newHTML+='<div class="cs3-slice" style="z-index:30; width:'+cs3.width+'px; height:'+cs3.height+'px; background-image:url('+cs3.images[cs3.newSlideIndex]+'); left:0; top:0"></div>'
		cs3.h.setPerspective({value:1200, origin:'50% 50%'}, cs3.l)
		cs3.l.css({overflow:'hidden'})
		cs3.l[0].innerHTML = newHTML;
		var transformToRight = 'translate3d('+cs3.width+'px,0,-'+cs3.width/2+'px) rotateY(-90deg)'
		var transformToLeft = 'translate3d(-'+cs3.width+'px,0,-'+cs3.width/2+'px) rotateY(90deg)'
		var oldPanel = cs3.l.children().eq(0)
		var newPanel = cs3.l.children().eq(1).csTransform({
			time:0,
			transform: cs3.direction ==1 ? transformToRight : transformToLeft
		})
		cs3.prepare({l:1, active:0, p:false})
		setTimeout(function(){
			newPanel.csTransform({
				time:1200,
				ease: 'cubic-bezier(1, 0 , 0, 1)',
				transform:'translate3d(0,0,0) rotateY(0deg)'
			})
			oldPanel.csTransform({
				time:1200,
				ease: 'cubic-bezier(1, 0 , 0, 1)',
				transform:cs3.direction ==1 ? transformToLeft : transformToRight
			}).csTransitionEnd(function () {
			  	cs3.updateSlides()
			})
			
		},50)
	},
	panels_v : function(cs3) {
		var p = p || {}
		var newHTML = '';
		newHTML+='<div class="cs3-slice" style="width:'+cs3.width+'px; height:'+cs3.height+'px; background-image:url('+cs3.images[cs3.h.indexes().active]+'); left:0; top:0"></div>'
		newHTML+='<div class="cs3-slice" style="z-index:30; width:'+cs3.width+'px; height:'+cs3.height+'px; background-image:url('+cs3.images[cs3.newSlideIndex]+'); left:0; top:0"></div>'
		cs3.h.setPerspective({value:1200, origin:'50% 50%'}, cs3.l)
		cs3.l.css({overflow:'hidden'})
		cs3.l[0].innerHTML = newHTML;
		var transformToTop = 'translate3d(0px,'+cs3.height+'px,-'+cs3.height/2+'px) rotateX(90deg)'
		var transformToBottom = 'translate3d(0px,-'+cs3.height+'px,-'+cs3.height/2+'px) rotateX(-90deg)'
		var oldPanel = cs3.l.children().eq(0)
		var newPanel = cs3.l.children().eq(1).csTransform({
			time:0,
			transform: cs3.direction ==1 ? transformToTop : transformToBottom
		})
		cs3.prepare({l:1, active:0, p:false})
		setTimeout(function(){
			newPanel.csTransform({
				time:1200,
				ease: 'cubic-bezier(1, 0 , 0, 1)',
				transform:'translate3d(0,0,0) rotateX(0deg)'
			})
			oldPanel.csTransform({
				time:1200,
				ease: 'cubic-bezier(1, 0 , 0, 1)',
				transform:cs3.direction ==1 ? transformToBottom : transformToTop
			}).csTransitionEnd(function () {
			  	cs3.updateSlides()
			})
			
		},50)
	}
};

/* 
	=================================
	Chop Slider 3 - Canvas Effects
	================================= 
*/

ChopSlider3.prototype.e.canvas = {

    /* =======================
     Canvas Burn
     ==========================*/

    burn:function (cs3) {
        cs3.l.html('<canvas></canvas>');

        var canvas = cs3.l.children()[0],
            image = new Image();
        image.src = cs3.images[cs3.h.indexes().active];
        canvas.width = cs3.width;
        canvas.height = cs3.height;
        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, cs3.width, cs3.height);
        var opacity = 1, colorMod = 0;


        function render() {
            opacity -= 0.05;
            context.globalAlpha = opacity;
            var i, x;
            for (x = -10; x <= 10; x += 5) context.drawImage(canvas, x, 0);

            var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
            var pix = imgd.data;
            for (var i = 0, n = pix.length; i < n; i += 4) {
                pix[i  ] = pix[i  ] + colorMod * pix[i  ] > 255 ? 255 : pix[i  ] + colorMod * pix[i  ];
                pix[i + 1] = pix[i + 1] + colorMod * pix[i + 1 ] > 255 ? 255 : pix[i + 1  ] + colorMod * pix[i + 1 ];
                pix[i + 2] = pix[i + 2] + colorMod * pix[i + 2 ] > 255 ? 255 : pix[i + 2  ] + colorMod * pix[i + 2  ];
            }
            colorMod += 0.005
            context.putImageData(imgd, 0, 0);

            if (colorMod < 0.25) {
                cs3.h.animFrame(render);
            }
            else {
                show2slide()
            }
        }

        cs3.h.animFrame(render);
        context.globalAlpha = 1.0;
        cs3.prepare({l:1, active:0, 'new':1 })

        function show2slide() {
            $(canvas).fadeOut(1500, function () {
                cs3.updateSlides()
            })
        }
    },

    /* =======================
     Canvas Melt
     ==========================*/

    melt:function (cs3) {
        cs3.l.html('<canvas></canvas><canvas style="display:none"></canvas>');

        var canvas = cs3.l.children()[0],
            image = new Image();
        image.src = cs3.path + 'assets/melt.png';
        canvas.width = cs3.width;
        canvas.height = cs3.height;
        var context = canvas.getContext("2d");

        //Second Canvas
        var canvas2 = cs3.l.children()[1],
            image2 = new Image();
        image2.src = cs3.images[cs3.newSlideIndex];
        canvas2.width = cs3.width;
        canvas2.height = cs3.height;
        var context2 = canvas2.getContext("2d");
        context2.drawImage(image2, 0, 0, cs3.width, cs3.height);
        //--

        var y = -200;
        var drops = Math.ceil(cs3.width / 370);

        function draw() {
            y += 3;
            for (var i = 0; i < drops; i++) {
                context.drawImage(image, i * 370, y - i * 50);
            }

            var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
            var pix = imgd.data;

            var imgd2 = context2.getImageData(0, 0, canvas2.width, canvas2.height);
            var pix2 = imgd2.data;

            for (var i = 0, n = pix.length; i < n; i += 4) {
                pix[i  ] = pix2[i  ];
                pix[i + 1] = pix2[i + 1];
                pix[i + 2] = pix2[i + 2];

            }
            context.putImageData(imgd, 0, 0);
            if (y < cs3.height + (drops - 1) * 50) cs3.h.animFrame(draw);
            else cs3.updateSlides()
        }

        cs3.h.animFrame(draw);
        cs3.prepare({l:1, active:1, 'new':0})
    },

    /* =======================
     Canvas Scanner
     ==========================*/

    roll:function (cs3) {
        var dir = cs3.direction;
        cs3.l.html('<canvas></canvas><canvas style="display:none"></canvas>');

        var canvas = cs3.l.children()[0],
            image = new Image();
        image.src = cs3.path + 'assets/scanner.png';
        canvas.width = cs3.width;
        canvas.height = cs3.height;
        var context = canvas.getContext("2d");

        //Second Canvas
        var canvas2 = cs3.l.children()[1],
            image2 = new Image();
        image2.src = cs3.images[cs3.newSlideIndex];
        canvas2.width = cs3.width;
        canvas2.height = cs3.height;
        var context2 = canvas2.getContext("2d");
        context2.drawImage(image2, 0, 0, cs3.width, cs3.height);
        //--

        var heights = Math.ceil(cs3.height / 30);
        var x = dir === 1 ? cs3.width : -140;

        function draw() {
            if (dir == 1)    x -= 20;
            else x += 20;
            for (var i = 0; i < heights; i++) {
                context.drawImage(image, x, i * 30);
            }

            var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
            var pix = imgd.data;

            var imgd2 = context2.getImageData(0, 0, canvas2.width, canvas2.height);
            var pix2 = imgd2.data;

            for (var i = 0, n = pix.length; i < n; i += 4) {
                pix[i  ] = pix2[i  ];
                pix[i + 1] = pix2[i + 1];
                pix[i + 2] = pix2[i + 2]
            }
            context.putImageData(imgd, 0, 0);
            if (x < -140 && dir == 1) cs3.updateSlides();
            else if (x > cs3.width + 140 && dir != 1) cs3.updateSlides();
            else cs3.h.animFrame(draw);

        }

        cs3.h.animFrame(draw);
        cs3.prepare({l:1, active:1, 'new':0})
    },

    /* =======================
     Canvas Puzzles
     ==========================*/

    puzzles:function (cs3) {
        //Src Image
        var image = new Image();
        image.src = cs3.images[cs3.newSlideIndex];

        //--
        var pSize = 64;
        var cols = Math.ceil(cs3.width / pSize);
        var rows = Math.ceil(cs3.height / pSize);

        //PuzzleMask
        var puzzleMask = new Image();
        puzzleMask.onload = function () {
            createPuzzles();

        };
        puzzleMask.src = cs3.path + 'assets/puzzle.png';


        //Create Canvases Puzzles
        function createPuzzles() {

            var canvasMask = document.createElement('canvas');
            canvasMask.width = 108;
            canvasMask.height = 108;
            var ctxMask = canvasMask.getContext('2d');
            ctxMask.drawImage(puzzleMask, 0, 0);

            for (var i = 0; i < rows * cols; i++) {
                var canvasPuzzle = document.createElement('canvas');
                canvasPuzzle.width = 108;
                canvasPuzzle.height = 108;
                var ctxPuzzle = canvasPuzzle.getContext('2d');

                var row = Math.floor(i / cols);
                var yOffset = -row * 64 + 22;

                var column = i - row * cols;
                var xOffset = -column * 64 + 22;
                ctxPuzzle.drawImage(image, xOffset, yOffset, cs3.width, cs3.height);

                //Mask Pixels
                var maskData = ctxMask.getImageData(0, 0, 108, 108);
                var pixMask = maskData.data;
                //Puzzle Pixels
                var puzzleData = ctxPuzzle.getImageData(0, 0, 108, 108);
                var pixPuzzle = puzzleData.data;
                //Change Pixels
                for (var j = 0; j < pixPuzzle.length; j += 4) {
                    var index = j / 4,
                        pxRow = Math.floor(index / 108),
                        pxCol = index - 108 * pxRow,
                        prevent = false;
                    if (pxCol < 22 && column == 0) prevent = true;
                    if ((column == cols - 1) && (column * 64 + pxCol) >= (cs3.width + 22)) prevent = true;
                    if ((row == rows - 1) && (row * 64 + pxRow) >= (cs3.height + 22)) prevent = true;
                    if ((row == rows - 2) && (row * 64 + pxRow) >= (cs3.height + 22)) prevent = true;
                    if (row == 0 && pxRow < 22) prevent = true;
                    if (!prevent) {
                        pixMask[j] = pixPuzzle[j];
                        pixMask[j + 1] = pixPuzzle[j + 1];
                        pixMask[j + 2] = pixPuzzle[j + 2];
                    }
                    else {
                        pixMask[j + 3] = 0;
                    }
                }
                ctxPuzzle.putImageData(maskData, 0, 0);
                //Add Shadow To Puzzles
                ctxPuzzle.shadowColor = 'rgb(0,0,0)';
                ctxPuzzle.shadowOffsetX = 0;
                ctxPuzzle.shadowOffsetY = 0;
                ctxPuzzle.shadowBlur = 1;
                ctxPuzzle.drawImage(canvasPuzzle, 0, 0);

                canvasPuzzle.style.left = (column * 64 - 22) + 'px';
                canvasPuzzle.style.top = (row * 64 - 22) + 'px';
                cs3.l.append(canvasPuzzle);

            }
            animatePuzzles();
        }

        function animatePuzzles() {
            cs3.prepare({l:1, active:1, 'new':1});
            cs3.l.children()
                .csTransform({
                    transform:'scale(' + (cs3.support.css3 ? 1.8 : 1) + ')  translate3d(0px,' + (cs3.support.css3 ? -100 : 0) + 'px,0)'}
            )
                .css({opacity:0, marginTop:(cs3.support.css3 ? 0 : -100)});
            setTimeout(function () {
                var delays = [];
                var maxDelay = 0;
                for (var i = 0; i < cols * rows; i++) {
                    var rndDelay = Math.round(Math.random() * 1500);
                    delays.push(rndDelay);
                    maxDelay = Math.max(maxDelay, rndDelay);
                }
                cs3.l.find('canvas').each(function () {
                    var a = $(this);
                    var index = a.index();
                    if (cs3.support.css3) {
                        a.csTransform({
                            transform:'scale(1) translate3d(0,0,0)',
                            time:500,
                            delay:delays[index],
                            ease:'cubic-bezier(1, 0 , 0.8, 1.2)'
                        }).css({opacity:1})
                            .csTransitionEnd(function () {
                                if (delays[index] == maxDelay) showNewSlide();
                            })
                    }
                    else {
                        a
                            .delay(delays[index])
                            .animate({
                                marginTop:0,
                                opacity:1
                            }, 500, function () {
                                if (delays[index] == maxDelay) showNewSlide();
                            })
                    }
                })
            }, 50);
        }

        function showNewSlide() {
            cs3.l.delay(400).fadeOut(400, function () {
                cs3.updateSlides()
            });
            cs3.slides.eq(cs3.h.indexes().active).fadeOut(400)
        }
    },

    /* =======================
     Canvas Diamonds
     ==========================*/

    diamonds:function (cs3) {
        var dir = cs3.direction;
        cs3.l.html('<canvas></canvas><canvas style="display:none"></canvas>');

        var canvas = cs3.l.children()[0],
            image = new Image();
        image.src = cs3.path + 'assets/diamond.png';
        canvas.width = cs3.width;
        canvas.height = cs3.height;
        var context = canvas.getContext("2d");

        //Second Canvas
        var canvas2 = cs3.l.children()[1],
            image2 = new Image();
        image2.src = cs3.images[cs3.newSlideIndex];
        canvas2.width = cs3.width;
        canvas2.height = cs3.height;
        var context2 = canvas2.getContext("2d");
        context2.drawImage(image2, 0, 0, cs3.width, cs3.height);
        //--
        var xCircles = Math.floor(cs3.width / 50);
        var yCircles = Math.floor(cs3.height / 50);
        var size = 0;
        var xCirclesOffset = xCircles;
        var yCirclesOffset = yCircles;

        function draw() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            xCirclesOffset--;
            yCirclesOffset--;
            size += 2;
            var center = (100 - size) / 2;
            for (var x = 0; x < xCircles - xCirclesOffset; x++) {
                for (var y = 0; y < yCircles - yCirclesOffset; y++) {
                    context.drawImage(image, center + x * 50 - 25, center + y * 50 - 25, size, size);
                }
            }

            var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
            var pix = imgd.data;

            var imgd2 = context2.getImageData(0, 0, canvas2.width, canvas2.height);
            var pix2 = imgd2.data;

            for (var i = 0, n = pix.length; i < n; i += 4) {
                pix[i  ] = pix2[i  ];
                pix[i + 1] = pix2[i + 1];
                pix[i + 2] = pix2[i + 2];
            }
            context.putImageData(imgd, 0, 0);
            if (size < 100) cs3.h.animFrame(draw);
            else cs3.updateSlides()
        }

        cs3.h.animFrame(draw);
        cs3.prepare({l:1, active:1, 'new':0})
    },

    /* =======================
     Canvas Circles
     ==========================*/

    circles:function (cs3) {
        var dir = cs3.direction;
        cs3.l.html('<canvas></canvas><canvas style="display:none"></canvas>');

        var canvas = cs3.l.children()[0],
            image = new Image();
        image.src = cs3.path + 'assets/circle.png';
        canvas.width = cs3.width;
        canvas.height = cs3.height;
        var context = canvas.getContext("2d");

        //Second Canvas
        var canvas2 = cs3.l.children()[1],
            image2 = new Image();
        image2.src = cs3.images[cs3.newSlideIndex];
        canvas2.width = cs3.width;
        canvas2.height = cs3.height;
        var context2 = canvas2.getContext("2d");
        context2.drawImage(image2, 0, 0, cs3.width, cs3.height);
        //--
        var xCircles = Math.floor(cs3.width / 50);
        var yCircles = Math.floor(cs3.height / 50);
        var size = 0;

        function draw() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            size += 2;
            var center = (108 - size) / 2;
            for (var x = 0; x < xCircles; x++) {
                for (var y = 0; y < yCircles; y++) {
                    context.drawImage(image, center + x * 50 - 25, center + y * 50 - 25, size, size);
                }
            }

            var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
            var pix = imgd.data;

            var imgd2 = context2.getImageData(0, 0, canvas2.width, canvas2.height);
            var pix2 = imgd2.data;

            for (var i = 0, n = pix.length; i < n; i += 4) {
                pix[i  ] = pix2[i  ];
                pix[i + 1] = pix2[i + 1];
                pix[i + 2] = pix2[i + 2]
            }
            context.putImageData(imgd, 0, 0);
            if (size < 100) cs3.h.animFrame(draw);
            else cs3.updateSlides()
        }

        cs3.h.animFrame(draw);
        cs3.prepare({l:1, active:1, 'new':0})
    },

    /* =======================
     Canvas Brush
     ==========================*/

    brush:function (cs3) {
        var dir = cs3.direction;
        cs3.l.html('<canvas></canvas><canvas style="display:none"></canvas>');

        var canvas = cs3.l.children()[0],
            image = new Image();
        image.src = cs3.path + 'assets/brush.png';
        canvas.width = cs3.width;
        canvas.height = cs3.height;
        var context = canvas.getContext("2d");

        //Second Canvas
        var canvas2 = cs3.l.children()[1],
            image2 = new Image();
        image2.src = cs3.images[cs3.newSlideIndex];
        canvas2.width = cs3.width;
        canvas2.height = cs3.height;
        var context2 = canvas2.getContext("2d");
        context2.drawImage(image2, 0, 0, cs3.width, cs3.height);
        //--


        var x = 0, y = -15;
        var direction = 1;
        var changeRow = false;

        function draw() {

            context.drawImage(image, x, y);
            var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
            var pix = imgd.data;

            var imgd2 = context2.getImageData(0, 0, canvas2.width, canvas2.height);
            var pix2 = imgd2.data;

            for (var i = 0, n = pix.length; i < n; i += 4) {
                pix[i  ] = pix2[i  ];
                pix[i + 1] = pix2[i + 1];
                pix[i + 2] = pix2[i + 2]
            }
            context.putImageData(imgd, 0, 0);

            if (direction === 1 && (x >= (cs3.width - 190) )) {
                direction = -1;
                changeRow = true
            }
            if (direction === -1 && (x < -10)) {
                direction = 1;
                changeRow = true
            }

            if (direction === 1) x += 40;
            else x -= 40;

            if (changeRow === true) {
                y += 50;
                changeRow = false;
            }
            if (y < (canvas.height - 50)) cs3.h.animFrame(draw);
            else show2slide();
        }

        cs3.h.animFrame(draw);
        cs3.prepare({l:1, active:1, 'new':0});

        function show2slide() {
            $(canvas2).fadeIn(500, function () {
                cs3.updateSlides()
            })
        }
    },
	
	/* =======================
     Canvas Typewriter
     ==========================*/

    typewriter:function (cs3) {
        cs3.l.html('<canvas style="font-family:Georgia"></canvas>');
        cs3.l.css({overflow:'hidden'})
		var letters = cs3.user.typewriterLetters ? cs3.user.typewriterLetters.split(' ') : ('1 2 3 4 5 6 7 8 9 ? ! A B C D E F G H I J K L M N O P Q R S T U V W X Y Z').split(' ');
		var size = 60;
		var cols = Math.ceil(cs3.width/size);
		var rows = Math.ceil(cs3.height/size);
        
		html = "";
		for (var i = 0; i < rows; i++) {
			for (var j = 0; j < cols; j++) {
				html+='<div data-col="'+j+'" data-row="'+i+'" style="width:50px; height:50px; position:absolute; left:'+(size*j)+'px; top:'+(size*i)+'px;"><canvas></canvas><canvas></canvas></div>';	
			}
		};
		var imagesCount = 0;
		var image1 = new Image();
		var image2 = new Image();
		
		image1.onload = function(){
			imagesCount++;
			checkCount();
		}
		image2.onload = function(){
			imagesCount++;
			checkCount();
		}
		image1.src = cs3.images[ cs3.h.indexes().active ];
		image2.src = cs3.images[cs3.newSlideIndex];
		function checkCount() {
			if (imagesCount==2) anim();
		}
		
		cs3.l[0].innerHTML = html;
		
		function anim(){
			//Canvas with active image
			var c1 = document.createElement('canvas');
			c1.width = cs3.width;
			c1.height = cs3.height;
			var ctx1 = c1.getContext('2d');
			ctx1.drawImage(image1,0,0, cs3.width, cs3.height);
			var image1Pix = (ctx1.getImageData(0, 0, cs3.width, cs3.height)).data;
			//Canvas with new image
			var c2 = document.createElement('canvas');
			c2.width = cs3.width;
			c2.height = cs3.height;
			var ctx2 = c2.getContext('2d');
			ctx2.drawImage(image2,0,0, cs3.width, cs3.height);
			var image2Pix = (ctx2.getImageData(0, 0, cs3.width, cs3.height)).data;
			
			//Add Letters
			cs3.l.children().each(function(){
				var a = $(this);
				var canvas1 = a.children('canvas').eq(0)[0];
				var canvas2 = a.children('canvas').eq(1)[0];
				canvas1.style.display= 'none';
				canvas2.style.opacity= '0';
				canvas2.style.zIndex= '10'
				var letter = letters[ Math.floor(Math.random()*letters.length) ];
				//Letters 1;
				canvas1.width = size;
				canvas1.height = size;
				var ctx1 = canvas1.getContext('2d');
				ctx1.fillStyle    = '#000';
				ctx1.font         = 'bold '+size+'px "Arial"';
				ctx1.textBaseline = 'top';
				ctx1.fillText  (letter, 0, 0);
				var l1PixData = ctx1.getImageData(0, 0, size, size);
				var l1Pix = l1PixData.data;
				
				//Letters 2
				canvas2.width = size;
				canvas2.height = size;
				var ctx2 = canvas2.getContext('2d');
				ctx2.fillStyle    = '#000';
				ctx2.font         = 'bold '+size+'px "Arial"';
				ctx2.textBaseline = 'top';
				ctx2.fillText  (letter, 0, 0);
				var l2PixData = ctx2.getImageData(0, 0, size, size);
				var l2Pix = l2PixData.data;
				
				
				//Merge Canvas and letters
				var letterOffsetX = parseInt(a.attr('data-col'),10) * size;
				var letterOffsetY = parseInt(a.attr('data-row'),10) * size;
	
	            
	            for (var i = 0, n = l1Pix.length; i < n; i += 4) {
	                var index = i/4;
	                var pixRow = Math.floor(index/size);
	                var pixCol = index - pixRow*size;
	                
	                var imageCol = pixCol + letterOffsetX;
	                var imageRow = pixRow + letterOffsetY;
	                
	                var imagePix = (imageRow*cs3.width+imageCol)*4;
	                
	                if (l1Pix[i]===0) {
		                l1Pix[i  ] = image1Pix[ imagePix  ]/1.2;
		                l1Pix[i + 1] = image1Pix[ imagePix + 1]/1.2;
		                l1Pix[i + 2] = image1Pix[ imagePix + 2]/1.2;
		                
		                l2Pix[i  ] = image2Pix[ imagePix  ];
		                l2Pix[i + 1] = image2Pix[ imagePix + 1];
		                l2Pix[i + 2] = image2Pix[ imagePix + 2];
	                }
	            }
	            ctx1.putImageData(l1PixData, 0, 0);
	            ctx2.putImageData(l2PixData, 0, 0);
				
			})
			
			var slideActive = cs3.slides.eq( cs3.h.indexes().active );
			var slideNew = cs3.slides.eq( cs3.newSlideIndex );
			
			//Start Animation
			cs3.prepare({l:1, active:1, 'new':1});
			//slideActive.fadeOut(1000)
			var letters1 = cs3.l.find('canvas:first-child');
			var letters2 = cs3.l.find('canvas:last-child');
			var lastIndex = cs3.l.children().length-1;
			letters2.each(function(){
				var a = $(this)
				var index = a.parent().index();
				if (cs3.support.css3) {
					$(this).csTransform({
						transform:'scale(2)',
						time:40,
						delay:40* index,
						ease:'ease-in'
					})
					setTimeout(function(){
						a.css({opacity:1}).csTransform({
							transform:'scale(1)'
						})
						.csTransitionEnd(function(){
							a.prev()						
							.css({display: 'block'})
							setTimeout(function(){
								a.prev()
								.csTransform({transform:'scale(1.5)', time:200}).css({opacity:0})
								.csTransitionEnd(function(){
									if (index == lastIndex) {
										slideActive.fadeOut(500, function(){ cs3.updateSlides() })
									}
								})
							},50);
						})
					},50)
				}
				else {
					a.delay(40*index).fadeTo(40,1, function(){
						if (index == lastIndex) {
							slideActive.fadeOut(500, function(){ cs3.updateSlides() })
						}
					})
				}
			})
		}
    },
	
	/* =======================
     Canvas Lines
     ==========================*/

    lines:function (cs3) {
        var dir = cs3.direction;
        cs3.l.html('<canvas></canvas>');
        var canvas = cs3.l.children()[0];
        canvas.width = cs3.width;
        canvas.height = cs3.height;
        var ctx = canvas.getContext("2d");
		
		$(canvas).csTransform({transform:'translate3d(0,0,0)'})
		
		var canvas2 = document.createElement('canvas');
		canvas2.width = cs3.width;
        canvas2.height = cs3.height;
		var ctx2 = canvas2.getContext("2d");
		var image = new Image();
		image.src = cs3.images[cs3.newSlideIndex];
		ctx2.drawImage(image,0,0,cs3.width,cs3.height);
		
		var activeSlide = cs3.slides.eq(cs3.h.indexes().active)[0];
		
		cs3.prepare({l:1, active:1, 'new':1});
		
		var i = 0;
		function draw(){
			
			var opacity = (cs3.height*10-i)/cs3.height*10/100;
			activeSlide.style.opacity = opacity
			
			
			ctx.fillStyle = "#000";
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.bezierCurveTo(0+i, i, cs3.width, cs3.height-i, cs3.width-i/2, cs3.height);
			
			
			ctx.moveTo(cs3.width, 0);
			ctx.bezierCurveTo(cs3.width-i, 0+i, 0, cs3.height-i, 0+i/2, cs3.height);
			ctx.lineWidth = 0.5;
			ctx.stroke();
			
			//Replace Pixels
			var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var pix = imgd.data;

            var imgd2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
            var pix2 = imgd2.data;
			
			for (var j = 0, n = pix.length; j < n; j += 4) {
				pix[j  ] = pix2[j  ];
                pix[j + 1] = pix2[j + 1];
                pix[j + 2] = pix2[j + 2];
            }
            ctx.putImageData(imgd, 0, 0);
			
			i = i+15;
			if (i<cs3.height*10) {
				cs3.h.animFrame(draw);
			}
			else {
				cs3.updateSlides();
				activeSlide.style.opacity = 1	
			}
		}
		
		cs3.h.animFrame(draw);
    },
	
	/* =======================
     Canvas Aquarium
     ==========================*/

    aquarium:function (cs3) {

        cs3.l.html('<canvas></canvas>');
        var canvas = cs3.l.children()[0];
        canvas.width = cs3.width;
        canvas.height = cs3.height;
        var ctx = canvas.getContext("2d");
		
		$(canvas).csTransform({transform:'translate3d(0,0,0)'})
		
		var canvas2 = document.createElement('canvas');
		canvas2.width = cs3.width;
        canvas2.height = cs3.height;
		var ctx2 = canvas2.getContext("2d");
		var image = new Image();
		image.src = cs3.images[cs3.h.indexes().active];
		var image2 = new Image();
		image2.src = cs3.images[cs3.newSlideIndex];
		ctx2.drawImage(image,0,0,cs3.width,cs3.height);
		
		var activeSlide = cs3.slides.eq(cs3.h.indexes().active)[0];
		
		//cs3.prepare({l:1, active:0, 'new':0});
		var i = 0;
		var direction = 1;
		function draw(){
			
			ctx.clearRect(0,0,cs3.width, cs3.height);
			ctx.beginPath();
			ctx.moveTo(0, i);
						
			for (var j=0; j<cs3.width; j++) {
				var y = Math.sin((j+i)*Math.PI/180)*20;
				ctx.lineTo(j,y+i)	
			}
			
			ctx.lineTo(cs3.width, cs3.height);
			ctx.lineTo(0, cs3.height);
			ctx.lineTo(0, i);
			ctx.fill();
			//Replace Pixels
			
			var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var pix = imgd.data;

            var imgd2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
            var pix2 = imgd2.data;
			
			for (var j = 0, n = pix.length; j < n; j += 4) {
				pix[j  ] = pix2[j  ];
                pix[j + 1] = pix2[j + 1];
                pix[j + 2] = pix2[j + 2];
            }
            ctx.putImageData(imgd, 0, 0);
			
			
			if (i==0 && direction===1) cs3.prepare({l:1, active:0, 'new':0});
			
			if (direction===1) i+=5;
			else i-=5;
			
			if ( i >= (cs3.height) ) {
				direction=-1;
				ctx2.drawImage(image2,0,0,cs3.width,cs3.height);
			}
			if (i>0) cs3.h.animFrame(draw);
			if (i==0) cs3.updateSlides();
			
		}
		
		cs3.h.animFrame(draw);
    },
	
	/* =======================
     Canvas Razor
     ==========================*/

    razor:function (cs3) {
        cs3.l.html('<div><canvas></canvas><canvas></canvas></div>');
        var canvas = cs3.l.find('canvas')[0];
        canvas.width = cs3.width;
        canvas.height = cs3.height;
        var ctx = canvas.getContext("2d");
		
		var canvas2 = cs3.l.find('canvas')[1];
		canvas2.width = cs3.width;
        canvas2.height = cs3.height;
		var ctx2 = canvas2.getContext("2d");
		
		var image = new Image();
		image.src = cs3.images[cs3.h.indexes().active];
		var canvasImage = document.createElement('canvas');
		canvasImage.width = cs3.width;
		canvasImage.height = cs3.height;
		var ctxImage = canvasImage.getContext('2d');
		ctxImage.drawImage(image,0,0,cs3.width, cs3.height);
		
		var imagedata = ctxImage.getImageData(0, 0, canvasImage.width, canvasImage.height);
		var pixImg = imagedata.data;
		
		ctx.fillStyle = "#000"
		ctx.beginPath();
		ctx.moveTo(0, 0)
		ctx.lineTo(cs3.width/2+100,0)
		ctx.lineTo(cs3.width/2-100,cs3.height)
		ctx.lineTo(0,cs3.height)
		ctx.fill()  
		
		var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var pix = imgd.data;
		
		for (var j = 0, n = pix.length; j < n; j += 4) {
			pix[j  ] = pixImg[j  ];
			pix[j + 1] = pixImg[j + 1];
			pix[j + 2] = pixImg[j + 2];
		}
		ctx.putImageData(imgd, 0, 0);
		
		ctx2.fillStyle = "#000"
		ctx2.beginPath();
		ctx2.moveTo(cs3.width/2+100, 0)
		ctx2.lineTo(cs3.width,0)
		ctx2.lineTo(cs3.width,cs3.height)
		ctx2.lineTo(cs3.width/2-100,cs3.height)
		ctx2.fill()  
		
		var imgd2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
		var pix2 = imgd2.data;
		for (var j = 0, n = pix2.length; j < n; j += 4) {
			pix2[j  ] = pixImg[j  ];
			pix2[j + 1] = pixImg[j + 1];
			pix2[j + 2] = pixImg[j + 2];
		}
		ctx2.putImageData(imgd2, 0, 0);
		
		//Shadows
		ctx.shadowColor = "rgba(0,0,0,0.5)";
  		ctx.shadowBlur = 10;
  		ctx.shadowOffsetX = 5;
  		ctx.shadowOffsetY = -5;
  		ctx.drawImage(canvas,0,0)
		
		ctx2.shadowColor = "rgba(0,0,0,0.5)";
  		ctx2.shadowBlur = 10;
  		ctx2.shadowOffsetX = -5;
  		ctx2.shadowOffsetY = -5;
  		ctx2.drawImage(canvas2,0,0)
				
		cs3.l.children().css({
			width:cs3.width,
			height:cs3.height,
			position:'relative',
			overflow:'hidden'	
		})
		
		cs3.prepare({l:1, active:0, 'new':1});
		
		$(canvas).animate({
			left:-cs3.width/2-110
		},800)
		$(canvas2).animate({
			left:cs3.width/2+110
		},800, function(){
			cs3.updateSlides()	
		})
    },
    /* =======================
     Canvas Black & White
     ==========================*/
	circle_reveal : function (cs3) {
        cs3.l.html('<canvas></canvas><canvas></canvas>');
        var canvas = cs3.l.children().eq(0).hide()[0],
            image = new Image();
        image.src = cs3.images[cs3.h.indexes().active];
        canvas.width = cs3.width;
        canvas.height = cs3.height;
        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, cs3.width, cs3.height);

        var canvas2 = document.createElement('canvas'),
            image2 = new Image();
        image2.src = cs3.images[cs3.newSlideIndex];
        canvas2.width = cs3.width;
        canvas2.height = cs3.height;
        var context2 = canvas2.getContext("2d");
        context2.drawImage(image2, 0, 0, cs3.width, cs3.height);

        var circle = cs3.l.children()[1]
        circle.width = cs3.width
        circle.height = cs3.height
        var circtx = circle.getContext('2d')
        cs3.l.css({overflow:'hidden'})

        var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
        var imgd2 = context2.getImageData(0, 0, canvas.width, canvas.height);
        var pix = imgd.data;
        var pix2 = imgd2.data;
        for (var i = 0, n = pix.length; i < n; i += 4) {
            var grayscale1 = pix[i  ] * .3 + pix[i+1] * .59 + pix[i+2] * .11;
            pix[i  ] = grayscale1
            pix[i + 1] = grayscale1
            pix[i + 2] = grayscale1
        }
        context.putImageData(imgd, 0, 0);
        $(canvas).show().css({opacity:0})
        cs3.prepare({l:1, active:1, 'new':0 })

        var maxRadius=Math.max(cs3.width/2, cs3.height/2)+Math.min(cs3.width/2,cs3.height/2);
        var radius = 0;
        var step = maxRadius/100;
        function render () {
            radius+=step;
            canvas.style.opacity=radius*2/maxRadius
            circtx.clearRect(0,0,cs3.width,cs3.height);
            circtx.beginPath();
            circtx.arc(cs3.width/2, cs3.height/2, radius, 0, 2 * Math.PI, false);
            circtx.fillStyle = '#000';
            circtx.fill();
            var imgd3 = circtx.getImageData(0, 0, canvas.width, canvas.height);
            var pix3 = imgd3.data;

            for (var i = 0, n = pix2.length; i < n; i += 4) {
                if(pix3[i]==0) {
                    pix3[i  ] = pix2[i]
                    pix3[i + 1] = pix2[i+1]
                    pix3[i + 2] = pix2[i+2]    
                }
                
            }
            circtx.putImageData(imgd3, 0, 0);
            if(radius<maxRadius) cs3.h.animFrame(render)
            else show2slide()
        }
        cs3.h.animFrame(render)
            
        function show2slide() {
            cs3.updateSlides()
        }
    }
};

/* 
	=================================
	Chop Slider 3 - Ambient-Light Plugin
	Version 1.1
	by Vladimir Kharlampidi
	The iDangero.us
	http://www.idangero.us
	================================= 
*/

ChopSlider3.prototype.plugins.ambilight = {
	init : function(cs3) {
		if (!cs3.support.canvas) return;
		if (!cs3.params.ambilight) return;
		if (!cs3.params.ambilight.enabled) return;
		if (cs3.c.find('.cs3-ambilight').length==0) {
			cs3.c.append('<canvas class="cs3-ambilight cs3-ambilight-top"></canvas><canvas class="cs3-ambilight cs3-ambilight-bottom"></canvas>')
		}
		cs3.h.updateDimension()
		var alTop = cs3.c.find('.cs3-ambilight-top'),
			alBot = cs3.c.find('.cs3-ambilight-bottom'),
			
			size = cs3.params.ambilight.size || 50,
			colorIndex = (cs3.params.ambilight.colorIndex) || 1.5,
			fadeIndex = (cs3.params.ambilight.fadeIndex) || 1.3,
			size2 = size*2,
			width = cs3.width,
			height = cs3.height;

		alTop.css({
			left: 0,
			top: -size,
			position: 'absolute',
			zIndex: -1,
			display:'block',
			width: width,
			height : size,
			opacity:0
		}).csTransform({time:1000});
		
		alBot.css({
			left: 0,
			top: height,
			position: 'absolute',
			zIndex: -1,
			display:'block',
			width: width,
			height : size,
			opacity:0
		}).csTransform({time:1000});
		
		var canvasTop = alTop[0],
			canvasBot = alBot[0],
			ctxTop = canvasTop.getContext('2d'),
			ctxBot = canvasBot.getContext('2d');
			
		canvasTop.width = canvasBot.width = width;
		canvasTop.height = canvasBot.height = 50;
		
		var image = new Image();
		
		function ambilight() {
		
			ctxTop.drawImage(image,0,0,width,height);
			ctxBot.drawImage(image,0,-height+50,width,height);
			
			// Blur Layers
			var opacity = 1
			function blur() {
				opacity-=0.2
				ctxTop.globalAlpha = ctxBot.globalAlpha = opacity;
				var x, y;
				for (y = -10; y <= 10; y += 5) {
					for (x = -10; x <= 10; x += 5) {
						ctxTop.drawImage(canvasTop, x, y, width, height);
						ctxBot.drawImage(canvasBot, x, 50-height+y, width, height);
					}
				}			
			}
			for (var i=0; i<5; i++) {
				blur();
			}
			
			//Add Alpha and Enhance Pixels
			var imgTop = ctxTop.getImageData(0, 0, canvasTop.width, canvasTop.height),
				imgBot = ctxBot.getImageData(0, 0, canvasBot.width, canvasBot.height),
				pixTop = imgTop.data,
				pixBot = imgBot.data;
			
			
			for (var i = 0, n = pixTop.length; i < n; i += 4) {
				var redTop = pixTop[i], greenTop = pixTop[i+1], blueTop=pixTop[i+2], alphaTop = 255,
					redBot = pixBot[i], greenBot = pixBot[i+1], blueBot=pixBot[i+2], alphaBot = 255,
					index = i/4,
                    row = Math.floor(index / width),
					col = index - width*row;
				
				//Top	

				alphaTop = 255 - (50-row/fadeIndex)/50*255 ;
				var diff = width/2;
				alphaTop = alphaTop * (1-Math.abs(diff-col)/diff)/fadeIndex;
					
				//Bottom
				alphaBot = 255*(1- row/50)/fadeIndex;
				var diff = width/2;
				alphaBot = alphaBot * (1-Math.abs(diff-col)/diff)/fadeIndex;
				
				
				pixTop[i] = redTop * colorIndex > 255 ? 255 : redTop * colorIndex ;
				pixTop[i+1] = greenTop * colorIndex > 255 ? 255 : greenTop * colorIndex ; 
				pixTop[i+2] = blueTop * colorIndex > 255 ? 255 : blueTop * colorIndex ;
				pixTop[i+3] = alphaTop;
				
				pixBot[i] = redBot * colorIndex > 255 ? 255 : redBot * colorIndex ;
				pixBot[i+1] = greenBot * colorIndex > 255 ? 255 : greenBot * colorIndex ; 
				pixBot[i+2] = blueBot * colorIndex > 255 ? 255 : blueBot * colorIndex ;
				pixBot[i+3] = alphaBot;
			}
			ctxTop.putImageData(imgTop, 0, 0);
			ctxBot.putImageData(imgBot, 0, 0);
			if (cs3.support.css3) {
				alTop.css({opacity:1});
				alBot.css({opacity:1});
			}
			else {
				alTop.animate({opacity:1},1000);
				alBot.animate({opacity:1},1000);	
			}
		
		}
		
		image.onload = function(){
			ambilight();
		};
		image.src = cs3.images[ cs3.h.indexes().active ]
		
		
	},
	onStart : function(cs3) {
		if (!cs3.support.canvas) return;
		if (!cs3.params.ambilight) return;
		if (!cs3.params.ambilight.enabled) return;
		
		if (cs3.support.css3) {
			cs3.c.find('.cs3-ambilight-top,.cs3-ambilight-bottom').css({opacity:0})
			.csTransform({time:300})
		}
		else {
			cs3.c.find('.cs3-ambilight-top,.cs3-ambilight-bottom').animate({opacity:0},300)	
		}
	},
	onEnd : function(cs3) {
		if (!cs3.support.canvas) return;
		if (!cs3.params.ambilight) return;
		if (!cs3.params.ambilight.enabled) return;
		cs3.plugins.ambilight.init(cs3)
	}
};

/* 
	=================================
	Chop Slider 3 - Captions Plugin
	Version 1.0
	by Vladimir Kharlampidi
	The iDangero.us
	http://www.idangero.us
	================================= 
*/

ChopSlider3.prototype.plugins.captions = {
    init:function (cs3) {
        var params = cs3.params.captions;
        if (!params || !params.enabled) return;
        params.type = params.type || 'horizontal';
        params.multiDelay = params.multiDelay || 100;
        params.duration = params.duration || 500;
        var captionsC = cs3.c.find('.cs3-captions');
        var captions = captionsC.find('.cs3-caption')
        cs3._plugins.captions = captions;
        cs3._plugins.captions.active = 0;
        var firstCaption = captions.eq(0);
        if (!params.multi) {
            captions.csTransform({time:params.duration});
            firstCaption.addClass('cs3-active-caption')
                .css({
                    marginLeft:params.type == 'horizontal' ? -20 : 0,
                    marginTop:params.type == 'vertical' ? -20 : 0,
                    display:'block'
                });
            if (cs3.support.css3) {
                setTimeout(function () {
                    firstCaption.css({opacity:1, marginLeft:0, marginTop:0}).csTransform({time:params.duration});
                }, 300)
            }
            else {
                firstCaption.animate({opacity:1, marginLeft:0, marginTop:0}, params.duration);
            }
        }
        else {
            captionsC.addClass('cs3-multi-captions').find('.cs3-caption').css({opacity:1});
            captions.children().each(function(){
                var t = $(this);
                var margin = t.index() % 2 == 0 ? -20 : 20;
                t.css({
                    marginLeft:params.type == 'horizontal' ? margin : 0,
                    marginTop:params.type == 'vertical' ? margin : 0,
                    display:'block',
                    opacity:0
                })
                .csTransform({time:params.duration, delay:t.index() * params.multiDelay});
            })
            firstCaption.css('display','block');
			firstCaption.children().each(function(){
				var t = $(this);
				if (cs3.support.css3) {
				setTimeout(function () {
					t.css({opacity:1, marginLeft:0, marginTop:0}).csTransform({time:params.duration});
				}, 300)
                }
                else {
                   t.animate({opacity:1, marginLeft:0, marginTop:0}, params.duration);
                }	
			});
        }

    },
    onStart:function (cs3) {
        var params = cs3.params.captions;
        if (!params || !params.enabled) return;
        var activeCaption = cs3._plugins.captions.eq(cs3.h.indexes().active);
        if (!params.multi) {
            if (cs3.support.css3) {
                setTimeout(function(){
					activeCaption.css({
						opacity:0,
						marginLeft:params.type == 'horizontal' ? -20 : 0,
						marginTop:params.type == 'vertical' ? -20 : 0
					})
					.csTransitionEnd(function () {
						$(this).css({display:'none'}).removeClass('cs3-active-caption');
					});
				},50);
            }
            else {
                activeCaption.animate({
                    opacity:0,
                    marginLeft:params.type == 'horizontal' ? -20 : 0,
                    marginTop:params.type == 'vertical' ? -20 : 0
                }, params.duration, function () {
                    $(this).css({display:'none'}).removeClass('cs3-active-caption');
                })
            }
        }
        else {
            activeCaption.children().each(function () {
                var t = $(this);
                var margin = t.index() % 2 == 0 ? -20 : 20;
                if (cs3.support.css3) {
                    t.css({
                        opacity:0,
                        marginLeft:params.type == 'horizontal' ? margin : 0,
                        marginTop:params.type == 'vertical' ? margin : 0
                    })
                }
                else {
                    t.animate({
                        opacity:0,
                        marginLeft:params.type == 'horizontal' ? margin : 0,
                        marginTop:params.type == 'vertical' ? margin : 0
                    }, params.duration, function () {
                        activeCaption.css({display:'none'}).removeClass('cs3-active-caption');
                    })
                }
            })

        }
    },
    onEnd:function (cs3) {
        var params = cs3.params.captions;
        if (!params || !params.enabled) return;
		
        var newCaption = cs3._plugins.captions.eq(cs3.h.indexes().active).css({display:'block'}).addClass('active-caption');
        if (params.multi) {
            newCaption.children().each(function () {
                var t = $(this);
                var margin = t.index() % 2 == 0 ? -20 : 20;
                t.css({
                    marginLeft:params.type == 'horizontal' ? margin : 0,
                    marginTop:params.type == 'vertical' ? margin : 0,
                    opacity:0
                }).csTransform({time:params.duration, delay:t.index() * params.multiDelay});
                if (cs3.support.css3) {
                    setTimeout(function () {
                        t.css({opacity:1, marginLeft:0, marginTop:0})
                            .csTransitionEnd(function () {
                                if (t.index() == 0) {
									cs3.c.find('.cs3-captions .active-caption').css({display:'none'}).removeClass('cs3-active-caption');	
									cs3._plugins.captions.eq(cs3.h.indexes().active).css({display:'block'}).addClass('cs3-active-caption')
								}
                            })
                    }, 50);
                }
                else {
                    t.animate({opacity:1, marginLeft:0, marginTop:0}, params.duration, function () {
                        if (t.index() == 0) {
							cs3.c.find('.cs3-captions .active-caption').css({display:'none'}).removeClass('cs3-active-caption');	
							cs3._plugins.captions.eq(cs3.h.indexes().active).css({display:'block'}).addClass('cs3-active-caption');
						}
                    })
                }
            })
        }
        else {
            var margin = -20;
            newCaption.css({
                marginLeft:params.type == 'horizontal' ? margin : 0,
                marginTop:params.type == 'vertical' ? margin : 0,
                opacity:0
            }).csTransform({time:params.duration});
            if (cs3.support.css3) {
                setTimeout(function () {
                    newCaption.css({opacity:1, marginLeft:0, marginTop:0})
                        .csTransitionEnd(function () {
                            newCaption.css({display:'block'}).addClass('cs3-active-caption');
                        })
                }, 50);
            }
            else {
                newCaption.animate({opacity:1, marginLeft:0, marginTop:0}, params.duration, function () {
                    newCaption.css({display:'block'}).addClass('cs3-active-caption');
                })
            }

        }

    }
};

/* 
	======================================
	Chop Slider 3 - Navigation Plugin
	Version 1.0
	by Vladimir Kharlampidi
	The iDangero.us
	http://www.idangero.us
	====================================== 
*/

ChopSlider3.prototype.plugins.navigation = {
	init : function(cs3) {
		var nav = cs3.params.navigation;
		var stopAutoplay = true;
		if (cs3.params.autoplay.disableOnInteraction===false) stopAutoplay = false;
		if (nav) {
			var next = $(nav.next);
			var prev = $(nav.prev);
			function nextClick(e) {
				e.preventDefault();
				cs3.slideNext();
				if (cs3.params.autoplay.enabled && stopAutoplay) cs3.autoplayStop();
				return false;
			}
			function prevClick(e) {
				e.preventDefault();
				cs3.slidePrev();
				if (cs3.params.autoplay.enabled && stopAutoplay) cs3.autoplayStop();
				return false;
			}
			if (next.length>0) next.click(function(e){nextClick(e)});
			
			if (prev.length>0) prev.click(function(e){prevClick(e)});
			
			if (nav.showOnlyOnHover) {
				next.hide();
				prev.hide();
				cs3.c.hover(
					function(){
						if (cs3.isAnimating) return false;
						next.fadeIn(300);
						prev.fadeIn(300);
					},
					function(){
						if (cs3.isAnimating) return false;
						next.fadeOut(300);
						prev.fadeOut(300);
					}
				)
			}
		}
	},
	onStart : function(cs3) {
		var nav = cs3.params.navigation
		if (nav && (nav.hideOnStart || nav.showOnlyOnHover)) {
			$(nav.next).fadeOut(200);
			$(nav.prev).fadeOut(200);
		}
	},
	onEnd : function(cs3) {
		var nav = cs3.params.navigation
		if (nav && (nav.hideOnStart && !nav.showOnlyOnHover)) {
			$(nav.next).fadeIn(200);
			$(nav.prev).fadeIn(200);
		}
	}
};

/* 
	======================================
	Chop Slider 3 - Pagination Plugin
	Version 1.0
	by Vladimir Kharlampidi
	The iDangero.us
	http://www.idangero.us
	====================================== 
*/

ChopSlider3.prototype.plugins.pagination = {
	init : function(cs3) {
		if (cs3.params.pagination && cs3.params.pagination.container) {
			var nav = cs3.params.navigation;
			var stopAutoplay = true;
			
			var pag = cs3.params.pagination
			var container = pag.container;
			if ( $(container).length==0 ) return false;
			
			var html = '';
			for (var i = 0; i< cs3.slides.length; i++) {
				var addClass = i==0 ? ' cs3-active-switch': '';
				html+='<div class="cs3-pagination-switch'+addClass+'"></div>'
			}
			$(container)[0].innerHTML = html
			
			$(container).find('.cs3-pagination-switch').click(function(e){
				var el = $(this);
				if (el.hasClass('cs3-active-switch')) return false;
				if (cs3.params.autoplay.enabled && stopAutoplay) cs3.autoplayStop();
				cs3.slideTo(el.index())
			})
			
			if (pag.showOnlyOnHover) {
				$(container).css({display:'none'})
				cs3.c.hover(
					function(){
						if (cs3.isAnimating) return false;
						$(container).fadeIn(300);
					},
					function(){
						if (cs3.isAnimating) return false;
						$(container).fadeOut(300)
					}
				)
			}
		}
	},
	onStart : function(cs3) {
		var pag = cs3.params.pagination
		if (pag && pag.container) {
			var container = pag.container;
			if ( $(container).length==0 ) return false;
			$(container).find('.cs3-active-switch').removeClass('cs3-active-switch');
			$(container).find('.cs3-pagination-switch:eq('+cs3.newSlideIndex+')').addClass('cs3-active-switch');
			
			if (pag.hideOnStart || pag.showOnlyOnHover) {
				$(container).fadeOut(200);
			}
		}
		
		
	},
	onEnd : function(cs3) {
		var pag = cs3.params.pagination
		if (pag && pag.container) {
			var container = pag.container;
			if ( $(container).length==0 ) return false;
			$(container).find('.cs3-active-switch').removeClass('cs3-active-switch');
			$(container).find('.cs3-pagination-switch:eq('+cs3.h.indexes().active+')').addClass('cs3-active-switch');

			if (pag.hideOnStart && !pag.showOnlyOnHover) {
				$(container).fadeIn(200);
			}
		}
	}
};


/* 
	=================================
	Chop Slider 3 Touch
	Version 1.2
	by Vladimir Kharlampidi
	The iDangero.us
	http://www.idangero.us
	================================= 
*/

ChopSlider3.prototype.plugins.touch = {
	
	/*====
	  Initialization
	  ====*/
	init : function(cs3) {
		if (!cs3.params.touch || !cs3.support.touch || !cs3.support.css3) return;
		if (cs3.params.touch && cs3.params.touch.enabled !== true) return;
		var plugin = cs3.plugins.touch
		cs3.params.touch.effect = cs3.params.touch.effect || 'flip-s';
		if (cs3.params.responsive)	cs3.h.updateDimension();
		//FallBack to 2D Effect
		if (cs3.params.touch.effect.indexOf('flip')>=0 && !cs3.support.threeD) {
			cs3.params.touch.effect = cs3.params.touch.effect.replace('flip','slide');
		}
		if (cs3.params.touch.effect === 'cube' && !cs3.support.threeD) {
			cs3.params.touch.effect = 'slide';
		}
		var effect = cs3.params.touch.effect;
		var t = cs3._plugins.touch;
		t.params = cs3.params.touch;
		t.isTouched = false;
		t.isAnimating = false;
		
		t.make3d = {
			newFace : effect == 'cube' ? 'right' : 'back',
			depth: effect == 'cube' ? cs3.width : false
		}
		var rows = 1;
		if (effect == 'flip-m') rows = Math.floor(cs3.height/100);
		if (effect == 'slide-m') rows = 5;
		
		var sliced = {
			index1 : cs3.h.indexes().active, 
			index2 : cs3.h.indexes().next,
			cols: (effect == 'flip-m') ? Math.floor(cs3.width/200) : 1,
			rows: rows,
			wrap : (effect == 'slide-m' || effect == 'slide-s') ? true : false,
			make3d : (effect == 'flip-m' || effect == 'flip-s' || effect == 'cube') ? t.make3d : false
		
		};
		
		t.sliced = cs3.h.slice(sliced)
		cs3.l[0].innerHTML = t.sliced.html;
		
		//Click trigger
		var allowClick = true;


		//Append Slide Slices
		if (effect == 'slide-m' || effect == 'slide-s') {
			cs3.l.find('.cs3-slice:nth-child(2)').each(function(){
				var a = $(this);
				a.clone().appendTo(a.parent())
			})
			cs3.l.find('.cs3-slice').each(function(){
				var a = $(this);
				var index = a.index();
				if (index==2) {
					a.css({'background-image'  : 'url('+cs3.images[ cs3.h.indexes().next ]+')'	})
					a.csTransform({transform:'translate3d('+cs3.width+'px,0,0)'})
				}
				if (index==1) {
					a.css({'background-image'  : 'url('+cs3.images[ cs3.h.indexes().prev ]+')'	})
					a.csTransform({transform:'translate3d(-'+cs3.width+'px,0,0)'})
				}
			})
			cs3.l.css({overflow:'hidden'})
		}
		if (effect == 'cube') {
			cs3.l.find('.cs3-left-face').css({
				backgroundImage : 'url('+cs3.images[ cs3.h.indexes().prev ]+')'
			})
		}
		//--
		
		
		cs3.prepare({active:0, l:1, p:true})
		var moveStart = false;
		var isScrolling = undefined;
		cs3.l.children().each(function(){
			this.addEventListener('touchstart', function(e){
				if (t.isTouched==true) return;
				e.preventDefault()
				t.isAnimating = false;
				t.startIndex = $(this).index();
				t.isTouched = true;
				t.isMoved = false;
				t.startX = e.targetTouches[0].pageX;
				t.startY = e.targetTouches[0].pageY;
				t.currX = e.targetTouches[0].pageX;
				t.diff = 0;
				t.angle = 0;
				handleTouch(this);
				isScrolling = undefined;
				//Callback
				if (cs3.params.callbacks.onTouchStart) cs3.params.callbacks.onTouchStart(cs3)
			})
		})
		
		function handleTouch (el) {
			el.addEventListener('touchmove', function(e){
				if (!t.isTouched || t.isAnimating || cs3.isAnimating) return;
				
				t.currX = e.targetTouches[0].pageX;
				t.diff = t.currX - t.startX;
				
				isScrolling = !!( isScrolling || Math.abs(e.targetTouches[0].pageY - t.startY) > Math.abs( e.targetTouches[0].pageX - t.startX ) )
				//if (isScrolling) return;
				e.preventDefault()
				if (!moveStart) {
					//Animation Start, run callback for all other plugins
					cs3._plugins.onStart(cs3, 'touch');
					//Disable Auto Play
					if (cs3.params.autoplay.enabled && cs3.params.autoplay.disableOnInteraction) cs3.autoplayStop();
				}
				moveStart = true;

				//Disallow Clicks:
				allowClick = false;

				//---
				if (effect == 'flip-m' || effect == 'flip-s') {
					t.angle = t.diff*180/cs3.width;
					if ( Math.abs(t.angle)>180) return;
					if (t.angle > 0) {
						cs3.l.find('.cs3-back-face').css({
							'background-image'  : 'url('+cs3.images[ cs3.h.indexes().prev ]+')'
						})
					}
					else {
						cs3.l.find('.cs3-back-face').css({
							'background-image' : 'url('+cs3.images[ cs3.h.indexes().next ]+')'
						})
					}
					plugin.rotateSlices(cs3,t.angle,0);
				}
				else if (effect == 'cube') {
					t.angle = t.diff*90/cs3.width;
					if ( Math.abs(t.angle)>90) return;
					plugin.rotateCube (cs3, t.angle,0);
				}
				else {
					
					plugin.slideSlices(cs3,t.diff,0);
					
				}
				
				//Callback
				if (cs3.params.callbacks.onTouchMove) cs3.params.callbacks.onTouchMove(cs3)

			});
			el.addEventListener('touchend', function(e){
				//Click Links
				var link = cs3.slides.eq(cs3.h.indexes().active).find('img').parent('a')
				if(link.length>0) {
					if (allowClick)
						document.location = link.attr('href')
				}
				setTimeout(function(){
					allowClick = true
				},50)

				moveStart = false;
				
				if ( (effect == 'slide-s' || effect == 'slide-m') && t.diff==0 ) {
					t.currX = t.startX;
					t.isTouched = false;
					return;
				}
				if ( (effect == 'flip-s' || effect == 'flip-m' || effect == 'cube') && t.angle==0 ) {
					t.currX = t.startX;
					t.isTouched = false;
					return;
				}
				
				//----
				if (effect == 'flip-s' || effect == 'flip-m') {
					t.isAnimating = cs3.isAnimating = true;
					if (t.angle > 30) plugin.rotateSlices(cs3, 180, 400, 1);
					if (t.angle < -30) plugin.rotateSlices(cs3, -180, 400, -1)
					if (t.angle>=-30 && t.angle<=30)  plugin.rotateSlices(cs3, 0,400, 0)
				}
				else if (effect == 'cube') {
					t.isAnimating = cs3.isAnimating = true;
					if (t.angle > 30) plugin.rotateCube(cs3, 90, 300, 1);
					if (t.angle < -30) plugin.rotateCube(cs3, -90, 300, -1)
					if (t.angle>=-30 && t.angle<=30)  plugin.rotateCube(cs3, 0, 300, 0)
				}
				else {
					t.isAnimating  = cs3.isAnimating = true;
					if (t.diff > cs3.width/5) plugin.slideSlices(cs3, cs3.width, 300, 1);
					if (t.diff < -cs3.width/5) plugin.slideSlices(cs3, -cs3.width, 300, -1)
					if (t.diff <= cs3.width/5 && t.diff >= -cs3.width/5)  plugin.slideSlices(cs3, 0, 300, 0)
				}
				//Callback
				if (cs3.params.callbacks.onTouchEnd) cs3.params.callbacks.onTouchEnd(cs3)
			});
		}
		
		// Calc Max Index
		t.maxDelay = 0;
		cs3.l.children().each(function(){
			var delay = cs3.h.getDelay({index: $(this).index(), grid:t.sliced, delay:-0.8, type:'linear', startIndex: t.startIndex});
			if (delay>t.maxDelay) t.maxDelay = delay;
		});
	},
	
	/*====
	  onStart Interception
	  ====*/
	onStart : function(cs3, calledBy) {
		if (calledBy == 'touch') return;
		if (!cs3.params.touch || !cs3.support.touch || !cs3.support.css3) return;
		if (cs3.params.touch && cs3.params.touch.enabled!=true) return;
		cs3.e.preventedByPlugin = true;
		var dir = cs3.direction;
		
		
		var effect = cs3.params.touch.effect;
        if (cs3.params.responsive) {
            cs3.slides.eq( cs3.h.indexes().active).show();
            cs3.h.updateDimension();
            cs3.slides.eq( cs3.h.indexes().active).hide();
        }
		if ( effect.indexOf('flip')>=0) {
			cs3.l.find('.cs3-back-face').css({ 'background-image'  : 'url('+cs3.images[ cs3.newSlideIndex ]+')' });
			if (dir===1) cs3.plugins.touch.rotateSlices(cs3, -180, 400, -1, true);
			else cs3.plugins.touch.rotateSlices(cs3, 180, 400, 1, true);
		}
		else if (effect == 'cube') {

			if (dir===1) {
				cs3.l.find('.cs3-right-face').css({ 'background-image'  : 'url('+cs3.images[ cs3.newSlideIndex ]+')' });
				cs3.plugins.touch.rotateCube(cs3, -90, 400, -1, true);
			}
			else {
				cs3.l.find('.cs3-left-face').css({ 'background-image'  : 'url('+cs3.images[ cs3.newSlideIndex ]+')' });
				cs3.plugins.touch.rotateCube(cs3, 90, 400, 1, true);
			}
		}
		else {
			if (dir===1) {
				cs3.l.find('.cs3-slice').each(function(){
					var a = $(this);
					if ( a.index() == 2 ) {
						a.css({'background-image'  : 'url('+cs3.images[ cs3.newSlideIndex ]+')'	})
					}
				})
				cs3.plugins.touch.slideSlices(cs3, -cs3.width, 400, -1, true);
			}
			else {
				cs3.l.find('.cs3-slice').each(function(){
					var a = $(this);
					if ( a.index() == 1 ) {
						a.css({'background-image'  : 'url('+cs3.images[ cs3.newSlideIndex ]+')'	})
					}
				})
				cs3.plugins.touch.slideSlices(cs3, cs3.width, 400, 1, true);
			}
		}
		
		
	},
	/*====
	  onEnd Callbacks and Updates
	  ====*/
	onEnd : function(cs3, calledBy) {
		if (calledBy == 'touch') return;
		if (!cs3.params.touch || !cs3.support.touch || !cs3.support.css3) return;
		if (cs3.params.touch && cs3.params.touch.enabled!=true) return;
		cs3.plugins.touch.init(cs3);
		cs3.e.preventedByPlugin = false;
	},
	
	/*====
	  Flip Function
	  ====*/
	rotateSlices : function (cs3, angle, time, update, external) {
		var t = cs3._plugins.touch;
		var time = time || 0;
		cs3.l.children().each(function(){
			var a = $(this)
			var index = a.index()
			if (time===0 && t.params.effect == 'flip-m') {	
				var delay = cs3.h.getDelay({index:index, grid:t.sliced, delay:-0.8, type:'linear', startIndex: t.startIndex});
				var angle2 = angle  - delay/t.maxDelay*angle/2
			}
			else {
				var angle2 = angle;
			}
			a.csTransform({
				transform: 'rotateY('+angle2+'deg) translate3d(0,0,0)',
				time: time,
				delay: 0,
				ease: 'linear'
			}) 
		})
		if (update===1 || update===-1 || update === 0) {
			if (update === -1 && !external) cs3.newSlideIndex = cs3.h.indexes().next;
			if (update ===  1 && !external) cs3.newSlideIndex = cs3.h.indexes().prev;
			cs3.l.children().eq(0).csTransitionEnd(function(){
				t.isTouched = false;
				t.isAnimating = cs3.isAnimating = false;

				//Animation End, run callback for all other plugins
				if (update===0) cs3._plugins.onEnd(cs3, 'touch');
				if (update===1 || update===-1) cs3.updateSlides();
				cs3.plugins.touch.init(cs3);
			})
			
		}
	},
	
	/*====
	  Cube Function
	  ====*/
	rotateCube : function (cs3, angle, time, update, external) {
		var t = cs3._plugins.touch;
		var time = time || 0;
		cs3.l.children().each(function(){
			var a = $(this)
			var index = a.index()
			
			//Translates
			var translateX =   cs3.width * Math.sin( angle * 2 * Math.PI/360 ) / 2;
			var translateZ =   - cs3.width * Math.cos( angle * 2 * Math.PI/360 ) / 2 + cs3.width /2;
			translateX = Math.round(translateX);
			a.csTransform({
				transform: 'rotateY('+angle+'deg) translate3d('+translateX+'px,0,'+translateZ+'px)',
				time: time,
				delay: 0,
				ease: 'linear'
			}) 
		})
		if (update===1 || update===-1 || update === 0) {
			if (update === -1 && !external) cs3.newSlideIndex = cs3.h.indexes().next;
			if (update ===  1 && !external) cs3.newSlideIndex = cs3.h.indexes().prev;
			cs3.l.children().eq(0).csTransitionEnd(function(){
				t.isTouched = false;
                t.isAnimating = cs3.isAnimating = false;

				//Animation End, run callback for all other plugins
				if (update===0) cs3._plugins.onEnd(cs3, 'touch');
				if (update===1 || update===-1) cs3.updateSlides();
				cs3.plugins.touch.init(cs3);
			})
			
		}
	},
	
	/*====
	  Slide Function
	  ====*/
	slideSlices : function (cs3, size, time, update, external) {
		
		var time = time || 0;
		var t = cs3._plugins.touch;
		cs3.l.children().each(function(){
			var a = $(this)
			var index = a.index()
			if (time===0 && t.params.effect == 'slide-m') {	
				var delay = cs3.h.getDelay({index:index, grid:t.sliced, delay:0.5, type:'linear', startIndex: t.startIndex});
				var size2 = (t.maxDelay-delay/3)/t.maxDelay * size
			}
			else var size2 = size
			if (time!==0) size2 = size
			a.csTransform({
				transform: 'translate3d('+size2+'px,0,0)',
				ease: 'linear',
				delay:0,
				time:time
				
			})
		})
		if (update===1 || update===-1 || update === 0) {
			if (update === -1 && !external) cs3.newSlideIndex = cs3.h.indexes().next;
			if (update ===  1 && !external) cs3.newSlideIndex = cs3.h.indexes().prev;
			cs3.l.children().eq(0).csTransitionEnd(function(){
				t.isTouched = false;
                t.isAnimating = cs3.isAnimating = false;
				//Animation End, run callback for all other plugins
				if (update===0) cs3._plugins.onEnd(cs3, 'touch');
				if (update===1 || update===-1) cs3.updateSlides();
				cs3.plugins.touch.init(cs3);
			})
		}
	}
	
};


/* 
	======================================
	Chop Slider 3 - Gallery Plugin
	Version 1.1 With Videos
	by Vladimir Kharlampidi
	The iDangero.us
	http://www.idangero.us
	====================================== 
*/

ChopSlider3.prototype.plugins.gallery = {
	init : function(cs3) {
		if (!cs3.params.gallery) return;
		if (cs3.params.gallery && cs3.params.gallery.enabled!=true) return;
		if (!cs3.params.gallery.trigger) return;
		var params = cs3.params.gallery;
		
		if ($('.cs3-gallery').length==0) {
			$('body').append('<div class="cs3-gallery"></div>');
		}
		var gallery = $('.cs3-gallery')
		
		if (!window.Swiper)
			$.getScript(cs3.path+'assets/idangerous.swiper.min.js',function(){
				$(params.trigger).click(function(e){
					if (!cs3.isAnimating) cs3.plugins.gallery.start(cs3)	
				})
			})
		else 
			$(params.trigger).click(function(e){
				if (!cs3.isAnimating) cs3.plugins.gallery.start(cs3)	
			})
		
		if (params.showOnlyOnHover) {
			$(params.trigger).css({display:'none'})
			cs3.c.hover(
				function(){
					if (cs3.isAnimating) return false;
					$(params.trigger).fadeIn(300);
				},
				function(){
					if (cs3.isAnimating) return false;
					$(params.trigger).fadeOut(300)
				}
			)
		}
	},
	onStart : function(cs3) {
		if (!cs3.params.gallery) return;
		if (cs3.params.gallery && cs3.params.gallery.enabled!=true) return;
		if (!cs3.params.gallery.trigger) return;
		
		var params = cs3.params.gallery
		
		if (params.hideOnStart || params.showOnlyOnHover) {
			$(params.trigger).fadeOut(200);
		}
		
		
	},
	onEnd : function(cs3) {
		if (!cs3.params.gallery) return;
		if (cs3.params.gallery && cs3.params.gallery.enabled!=true) return;
		if (!cs3.params.gallery.trigger) return;
		
		var params = cs3.params.gallery
		
		if (params.hideOnStart || params.showOnlyOnHover) {
			$(params.trigger).fadeIn(200);
		}
	},
	start : function(cs3) {
		if (!cs3.params.gallery) return;
		if (cs3.params.gallery && cs3.params.gallery.enabled!=true) return;
		if (!cs3.params.gallery.trigger) return;
		
		cs3.autoplayStop();
		
		//FS Classes
		$('body').addClass('cs3-gallery-enabled')
		$('body').children().not('.cs3-gallery').each(function(index, element) {
            $(this).addClass('cs3-gallery-hidden')
        });
		
		//FullScreen Open
		var el = document.documentElement;
        var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.oRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
   	    if (rfs) rfs.call(el);
		
		//Gallery
		var gallery = $('.cs3-gallery').html('').append('<div class="cs3-gt-left"></div><div class="cs3-gt-right"></div>');
		gallery.append('<div class="cs3-gallery-thumbs"><div class="cs3-gallery-thumbs-inner"></div></div>');
		gallery.append('<div class="cs3-gallery-close"></div><div class="cs3-gallery-right"></div><div class="cs3-gallery-left"></div>')

		//Wrapper and Inner
		$('.cs3-gallery').append('<div class="cs3-gallery-wrapper"><div class="cs3-gallery-inner"></div></div>')
		var innerHTML = '';
		for(var i=0; i<cs3.images.length; i++) {
			if (!cs3.slides.eq(i).hasClass('cs3-video-slide'))
				innerHTML+='<div class="cs3-gallery-slide"><img src="'+cs3.images[i]+'"></div>';
			else {
				var frame = cs3.slides.eq(i).find('iframe') 
				if (frame.data('videoservice')=='youtube' && 'stopVideo' in cs3.slides.eq(i).data('player')) cs3.slides.eq(i).data('player').stopVideo()
				if (frame.data('videoservice')=='vimeo' && window.$f) $f(frame[0]).api('pause')	

				var videoClass = frame.length>0?'cs3-gallery-video-slide':'';
				innerHTML+='<div class="'+videoClass+' cs3-gallery-slide">'+cs3.slides.eq(i).find('.cs3-video').html()+'</div>';
			}
		}
		$('.cs3-gallery-inner').html(innerHTML)
		


		//Captions
		if (cs3.params.captions && cs3.params.captions.enabled && cs3.params.gallery.showCaptions) {
			$('.cs3-gallery-slide').each(function(){
				var caption = cs3.c.find('.cs3-captions .cs3-caption').eq($(this).index()).clone().removeAttr('style').appendTo($(this))
				caption.find('.cs3-caption-text, .cs3-caption-title').removeAttr('style')
				
			})	
		}
		
		//Init Swiper
		var image = $('.cs3-gallery-slide img')
		cs3._plugins.gallery.swiper = $('.cs3-gallery-wrapper').swiper({
			wrapperClass : 'cs3-gallery-inner',
			slideClass : 'cs3-gallery-slide',
			loop:true,
			pagination : '.cs3-gallery-thumbs-inner',
			paginationClass: 'cs3-gallery-thumb',
			paginationActiveClass : 'cs3-gallery-active-thumb',
			onSlideChangeStart : function(){updateThumbs()},
			onSlideChangeEnd : function () {
				$('.cs3-gallery iframe').each(function(index, val) {
					var src = $(this).attr('src')
					if (!src) return;
					var frame = $(this)
					frame.attr('src','')
					setTimeout(function () {
						frame.attr('src',src)
					},100)
				});
			}
			
		},cs3)
		$('.cs3-gallery-thumb').each(function(index, element) {
			if(cs3.slides.eq(index).hasClass('cs3-video-slide')) {
            	$(this).css({backgroundImage:'url('+cs3.path+'assets/gallery-video.png)'})
			}
            else {
            	$(this).css({backgroundImage:'url('+cs3.images[$(this).index()]+')'})
            }
        }).csTransform({time:400})
		
		
		cs3._plugins.gallery.swiper.swipeTo(cs3.h.indexes().active,0, false)
		setTimeout(function(){
			cs3._plugins.gallery.swiper.swipeTo(cs3.h.indexes().active,0, false)
		},0)
		
		//Init Thumbs Inner
		$('.cs3-gallery-thumbs-inner').css({width: $('.cs3-gallery-thumb').length*(44+10)})
		
		
		//Clicks
		$('.cs3-gallery-thumb').click(function(e) {
            e.preventDefault();
			cs3._plugins.gallery.swiper.swipeTo($(this).index())
        });
		$('.cs3-gallery-right').click(function(e) {
            if (!$(this).hasClass('cs3-hidden-control'))
				cs3._plugins.gallery.swiper.swipeNext()
        });
		$('.cs3-gallery-left').click(function(e) {
            if (!$(this).hasClass('cs3-hidden-control'))
				cs3._plugins.gallery.swiper.swipePrev()
        });
		$('.cs3-gallery-close').click(function(e) {
            if ($(this).hasClass('cs3-hidden-control')) return;
			if (!cs3.support.fullscreen) {
				cs3.plugins.gallery.exit(cs3)
				return	
			}
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			}
			else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
			else if (document.oCancelFullScreen) {
				document.oCancelFullScreen();
			}
			else if (document.msCancelFullScreen) {
				document.msCancelFullScreen();
			}
			
        });
		
		//Toggle Controls
		var startPos
		var endPos
		$('.cs3-gallery-slide').mousedown(function(e) {
			startPos = e.pageX;	
		})
		$('.cs3-gallery-slide').mouseup(function(e) {
			endPos = e.pageX;	
		})
		$('.cs3-gallery-slide').click(function(e) {
           if (cs3.support.touch) {
			    toggleControls()
				return;
		   }
		   var diff = Math.abs(endPos - startPos)
		   if (diff<10) toggleControls()
        });
		function toggleControls() {
			$('.cs3-gallery-left, .cs3-gallery-right, .cs3-gallery-close').csTransform({time:300}).toggleClass('cs3-hidden-control')		
			if (cs3.params.captions && cs3.params.captions.enabled) {
				$('.cs3-gallery .cs3-caption').csTransform({time:300}).toggleClass('cs3-hidden-control')		
			}
		}
		
		//Thumbs Animation
		$('.cs3-gallery-thumbs-inner').css({left:0}).csTransform({time:300})
		$('.cs3-gt-right').click(function(e) {
            e.preventDefault()
			var maxPos = -($('.cs3-gallery-thumbs-inner').width() - $('.cs3-gallery-thumbs').width())
			var newPos = $('.cs3-gallery-thumbs-inner').position().left-54
			if (newPos<maxPos) newPos=maxPos;
			$('.cs3-gallery-thumbs-inner').css({left:newPos})
        });
		$('.cs3-gt-left').click(function(e) {
            e.preventDefault()
			var newPos = $('.cs3-gallery-thumbs-inner').position().left+54
			if (newPos>0) newPos=0;
			$('.cs3-gallery-thumbs-inner').css({left:newPos})
        });
		function updateThumbs() {
			if ($('.cs3-gt-arrows').length>0)
			var newIndex = cs3._plugins.gallery.swiper.activeSlide
			var newPos = -newIndex*54
			var maxPos = -($('.cs3-gallery-thumbs-inner').width() - $('.cs3-gallery-thumbs').width())
			if (newPos<maxPos) newPos=maxPos;
			$('.cs3-gallery-thumbs-inner').css({left:newPos})
		}
		
		//Resize
		function resize() {
			var h = $(window).height() - $('.cs3-gallery-thumbs').height()
			$('.cs3-gallery-wrapper').css({
				height:h	
			})
			$('.cs3-gallery-wrapper .cs3-gallery-slide').css({
				lineHeight : h+'px'	
			})
			$('.cs3-gallery-thumbs').css({width:$(window).width()})
			if ($('.cs3-gallery-thumbs-inner').width()>$('.cs3-gallery-thumbs').width()) {
				$('.cs3-gallery-thumbs').css({
					width:$('.cs3-gallery').width()-50,	
					margin:'0 25px'
				})	
				gallery.addClass('cs3-gt-arrows')
			}
			else {
				$('.cs3-gallery-thumbs').css({
					width:$('.cs3-gallery').width(),
					margin:'0'
				})	
				$('.cs3-gallery-thumbs-inner').css({left:0})
				gallery.removeClass('cs3-gt-arrows')	
			}
			updateThumbs()
		}
		resize();
		$(window).resize(resize)
		
		
		
		
		//Detect FullScreen Exit
		if (cs3.support.fullscreen) {
			document.addEventListener("fullscreenchange", function () {
				checkFS(document.fullscreen);
			}, false);
			
			document.addEventListener("ofullscreenchange", function () {
				checkFS(document.fullscreen);
			}, false);
			
			document.addEventListener("msfullscreenchange", function () {
				checkFS(document.fullscreen);
			}, false);
			
			document.addEventListener("mozfullscreenchange", function () {
				checkFS (document.mozFullScreen);
			}, false);
			
			document.addEventListener("webkitfullscreenchange", function () {
				checkFS (document.webkitIsFullScreen);
			}, false);
		}
		function checkFS(state) {
			if (!state) cs3.plugins.gallery.exit(cs3);
			else {
				cs3._plugins.gallery.swiper.swipeTo(cs3.h.indexes().active,0, false)
				
			}
		}
		
	},
	exit : function (cs3) {
		if (!cs3.params.gallery) return;
		if (cs3.params.gallery && cs3.params.gallery.enabled!=true) return;
		if (!cs3.params.gallery.trigger) return;
		
		$('body').removeClass('cs3-gallery-enabled')
		$('.cs3-gallery-hidden').removeClass('cs3-gallery-hidden')	
		$('.cs3-gallery').html('')
		cs3.switchTo(cs3._plugins.gallery.swiper.activeSlide)
		cs3._plugins.gallery.swiper.destroy(true)
		
	}
};

//Chop Slider 3 jQuery Plugin
$.fn.cs3 = function(a){
	return new ChopSlider3( $(this), a);
}; 

})(jQuery);