/*
 * jQuery mOover v.1.5
 
 * http://www.idangero.us/sliders/moover/
 *
 * Copyright 2012, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us
 
 * Licensed under the iDangero.us Limited Regular License (RL Limited)
 * Licensing Terms: http://www.idangero.us/index.php?content=article&id=21
 
 * Released on: May 7, 2012
 */
(function($){
$.fn.moover = function(a) {
	//mOover Transforms
	var mooverTransforms = {
		'typewriter' : {
			'default' : {
				initCharTransform : "scale(0,0) rotate(0deg)",
				middleCharTransform : "scale(1.2,1.3) rotate(5deg)",
				finalCharTransform : "scale(1,1) rotate(0deg)",
				charOrigin : 'center bottom'
			},
			'rotators' : {
				initCharTransform : "scale(0,0) rotate(-180deg)",
				middleCharTransform : "scale(0.8,0.8) rotate(180deg)",
				finalCharTransform : "scale(1,1) rotate(0deg)",
				charOrigin : 'center center'
			},
			'fall' : {
				initCharTransform : "scale(1,1) translateY(-1000px)",
				middleCharTransform : "scale(1,1) translateY(0px)" ,
				finalCharTransform : "scale(1,1) translateY(0px)",
				charOrigin : 'center bottom'
			},
			'fall-elastic' : {
				initCharTransform : "scale(1,1) translateY(-1000px)",
				middleCharTransform : "scale(1,0.5) translateY(0px)" ,
				finalCharTransform : "scale(1,1) translateY(0px)",
				charOrigin : 'center bottom'
			},
			'fall-reverse' : {
				initCharTransform : "scale(1,1) translateY(-1000px)",
				middleCharTransform : "scale(1,-0.5) translateY(0px)" ,
				finalCharTransform : "scale(1,1) translateY(0px)",
				charOrigin : 'center bottom'
			},
			'flippers-v' : {
				initCharTransform : "scale(0,0)",
				middleCharTransform : "scale(1,-1)" ,
				finalCharTransform : "scale(1,1)",
				charOrigin : 'center center'
			},
			'flippers-h' : {
				initCharTransform : "scale(0,0)",
				middleCharTransform : "scale(-1,1)" ,
				finalCharTransform : "scale(1,1)",
				charOrigin : 'center center'
			},
			'rain-elastic' : {
				initCharTransform : "scale(1,30) rotate(80deg) translate(0px, -500px)",
				middleCharTransform : "scale(1,-0.8) rotate(10deg) translate(0px, 0px)",
				finalCharTransform : "scale(1,1) rotate(0deg) translate(0px, 0px)",
				charOrigin : 'center bottom'
			},
			'hurricane' : {
				initCharTransform : "scale(0,0) rotate(0deg) translate(500px, 0px)",
				middleCharTransform : "scale(1,1) rotate(30deg) translate(-500px, 0px)",
				finalCharTransform : "scale(1,1) rotate(0deg) translate(0px, 0px)",
				charOrigin : 'center center'
			}
		},
		'slide': {
			'none' : {
				initTextTransform: "scale(1,1)",
				middleTextTransform : "scale(1,1)",
				finalTextTransform: "scale(1,1)"
			},
			'skew' : {
				initTextTransform: "skewX(-40deg) scale(1,0)",
				middleTextTransform : "skewX(0deg) scale(1,1)",
				finalTextTransform: "skewX(-40deg) scale(1,0)"
			},
			'flippers-h' : {
				initTextTransform: "scale(-1,0)",
				middleTextTransform : "scale(1,1)",
				finalTextTransform: "scale(-1,0)"
			},
			'flippers-v' : {
				initTextTransform: "scale(0,-1)",
				middleTextTransform : "scale(1,1)",
				finalTextTransform: "scale(0,-1)"
			},
			'scale-full' : {
				initTextTransform: "scale(0,0)",
				middleTextTransform : "scale(1,1)",
				finalTextTransform: "scale(0,0)"
			},
			'scale-y' : {
				initTextTransform: "scale(1,0)",
				middleTextTransform : "scale(1,1)",
				finalTextTransform: "scale(1,0)"
			},
			'scale-x' : {
				initTextTransform: "scale(0,1)",
				middleTextTransform : "scale(1,1)",
				finalTextTransform: "scale(0,1)"
			},
			'rotation' : {
				initTextTransform: "scale(0,0) rotate(180deg)",
				middleTextTransform : "scale(1,1) rotate(0deg)",
				finalTextTransform: "scale(0,0) rotate(-180deg)"
			},
			'hurricane' : {
				initTextTransform: "scale(0,0) rotate(360deg) translate(-200px,500px)",
				middleTextTransform : "scale(1,1) rotate(0deg) translate(0px, 0px)",
				finalTextTransform: "scale(0,0) rotate(-360deg) translate(-200px,500px)"
			}
		},
		'timings' : {
			'very-fast' : {
				charTime:60,
				charDelay:20
			},
			'fast' : {
				charTime:100,
				charDelay:40
			},
			'medium' : {
				charTime:180,
				charDelay:70
			},
			'slow-short' : {
				charTime:300,
				charDelay:50
			},
			'slow' : {
				charTime:300,
				charDelay:300
			},
			'slow-long' : {
				charTime:300,
				charDelay:600
			},
			'very-slow' : {
				charTime:500,
				charDelay:500
			}
		}
	};
	//--
	
	if(!a) a = {}
	var container = $(this);
	var mv = {
		queues : [],
		isStopped : false,
		play : function(){
			for (var i=0; i<mv.queues.length; i++) {
				mv.queues[i]()	
			}
			mv.queues=[]
			mv.isStopped = false;
		},
		next : function() {
			for (var i=0; i<mv.queues.length; i++) {
				mv.queues[i]()	
			}
			mv.queues=[]
		},
		prev : function() {
			mv.slideToPrev = true
			if (mv.isStopped||a.manualMode) {
				for (var i=0; i<mv.queues.length; i++) {
					mv.queues[i]()	
				}
				mv.queues=[]
			}
			
		},
		stop : function() {
			if(!a.navIsBlinking) {
				mv.isStopped = true	
			}
		},
		manualMode : a.manualMode,
		container : container,
		version: '1.5'
	}
	
	/* Default Options and Global Parameters */
		
	a.width = container.width();
	a.height = container.height();
	
	a.moveTime = a.moveTime || 3000;
	a.slideTime = a.slideTime || 1000;
	a.moveWidth = a.moveWidth || 100;
	
	//Preloader
	if (a.preloader===false) a.preloader = false;
	else a.preloader = true
	
	//Image Settings
	a.moveImage = a.moveImage || false
	a.moveImageWidth = a.moveImageWidth || a.moveWidth/2
	if (a.scaleImage===0) a.scaleImage=0
	if (!a.scaleImage&&a.scaleImage!==0) a.scaleImage = false;
	
	//f.moveOutImage
	if (a.moveOutImage===false) a.moveOutImage = false;
	else a.moveOutImage = true
	
	//Navigation
	a.navigation = a.navigation || false;
	a.navigationActive = a.navigationActive || false;
	a.nextButton = a.nextButton ||false
	a.prevButton = a.prevButton || false
	a.playButton = a.playButton || false
	a.stopButton = a.stopButton || false
	
	//Default Effect
	a.effect = a.effect || "slide"
	
	//Slide Effect Defaults
	a.lineFrom = a.lineFrom || "right"
	if (a.crossSideLines===false) a.crossSideLines = false;
	else a.crossSideLines = true
	a.textLineDelay = a.textLineDelay||0
	a.initTextTransform = a.initTextTransform || "scale(1,0) skewX(40deg)"
	a.middleTextTransform = a.middleTextTransform || "scale(1,1) skewX(0deg)"
	a.finalTextTransform = a.finalTextTransform || "scale(1,0) skewX(-40deg)"
	a.afterSlideHoldTime = a.afterSlideHoldTime || 0;
	
	//TW Effect Defaults
	if (a.waitForImage===false) a.waitForImage = false;
	else a.waitForImage = true
	if (a.charDelay!==0)
		a.charDelay = a.charDelay || 40
	if (a.charTime!==0)
		a.charTime = a.charTime || 100
	if (a.textHoldTime!==0)
		a.textHoldTime = a.textHoldTime || 1500
	a.charOrigin = a.charOrigin || "center bottom"
	a.initCharTransform = a.initCharTransform || "scale(0,0) rotate(0deg)"
	a.middleCharTransform = a.middleCharTransform || "scale(1.2,1.3) rotate(5deg)"
	a.finalCharTransform = a.finalCharTransform || "scale(1,1) rotate(0deg)"
	
	//Pusher Effect Defaults
	if(a.pushDelay!==0)
		a.pushDelay = a.pushDelay || 300
	if(a.pushTime!==0)
		a.pushTime = a.pushTime ||100
	if(a.afterPushHoldTime!==0)
		a.afterPushHoldTime = a.afterPushHoldTime||1500;
	
	//Fader Effect Defaults
	a.afterFadeHoldTime = a.afterFadeHoldTime || 1500;
	a.fadeTime  = a.fadeTime || 500;
	a.fadeDelay = a.fadeDelay || 300;
	a.fadeType = a.fadeType || 'horizontal';
	/* --------------------------------- CSS3 Transform Functions -------------------------------*/
	
	/* CSS3 Transitions Test */
	
	(function() {
		$("body").append('<div class="idMoover-css3Test"></div>');
		var bds = $(".idMoover-css3Test")[0].style;
		var s = bds.transition !== undefined || bds.WebkitTransition !== undefined || bds.MozTransition !== undefined || bds.MsTransition !== undefined || bds.OTransition !== undefined;
		mv.hasCSS3 = function(){return s};
		$(".idMoover-css3Test").remove()
	})();

	function withCSS3(){
		if(a.disableCSS3===true) return false
		else return mv.hasCSS3()
	}
	/* End of Test */
	
	// Transition End Function
	$.fn.mvTransitionEnd = function(callback) {
		var _this = this[0];
		var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd'];
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
		return this;
	};
	$.fn.mvTransform = function(params,callback) {
			if(!withCSS3()) return this;
			return this.each(function(){
				var es = $(this)[0].style
				if (params.transform) {
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
	}
	/* --------------------------------- End of CSS3 Transform Functions -------------------------------*/	
	
	/* Navigation */
	if (a.navigation) {
		for (var i = 1; i <= container.find('.moover-slide').length; i++) {
			$(a.navigation).append('<div class="moover-switch"></div>')
		}
	}
	function initControls() {
		if (a.navigationActive) {
			$(a.navigation).find('.moover-switch').click(function(e){
				e.preventDefault()
				var _this = $(this)
				if (a.navIsBlinking) return;
				if (_this.hasClass('moover-switch-active')) return
				a.navIsBlinking = true;
				a.navWhichBlinking = _this;
				a.navNewSlideIndex = _this.index();
				a.navInterval = setInterval(function(){
					_this.fadeTo(150,0.3).fadeTo(150,1)
				}, 300)
				if (mv.isStopped||a.manualMode) mv.next()
			})
			.css({cursor:'pointer'})
		}
		//Control Buttons
		if (a.nextButton) {
			$(a.nextButton).click(function(e){
				e.preventDefault();
				if(a.navIsBlinking) return;
				//if(!mv.isStopped) {
					_this=$(this)
					a.navIsBlinking = true;
					a.navWhichBlinking = _this;
					a.navInterval = setInterval(function(){
						_this.fadeTo(150,0.3).fadeTo(150,1)
					}, 300)
				//}
				mv.next()	
			})	
		}
		if (a.prevButton) {
			$(a.prevButton).click(function(e){
				e.preventDefault();
				if(a.navIsBlinking) return;
				//if(!mv.isStopped) {
					_this=$(this)
					a.navIsBlinking = true;
					a.navWhichBlinking = _this;
					a.navInterval = setInterval(function(){
						_this.fadeTo(150,0.3).fadeTo(150,1)
					}, 300)
				//}
				mv.prev()	
			})	
		}
		if (a.playButton) {
			$(a.playButton).click(function(e){
				e.preventDefault();
				mv.play()	
			})	
		}
		if (a.stopButton) {
			$(a.stopButton).click(function(e){
				e.preventDefault();
				mv.stop()	
			})	
		}
	}
	/* End of Navigation */
	
	/* Preloader */
	if (!a.preloader) {
		initControls()
		moove(a)	
	}
	else {
		(function(){
			mv.container.addClass('moover-loading')
			var numOfImages = mv.container.find("img").length
			if (numOfImages==0 || navigator.userAgent.indexOf('MSIE 7')>=0 || navigator.userAgent.indexOf('MSIE 6')>=0 ) {
				initControls()
				moove(a)
				mv.container.removeClass('moover-loading')
				return	
			}
			var mooverImages = [];
			var loaderCounter = 0;
			for (var i=0; i<numOfImages; i++) {
				mooverImages[i] = new Image();
				mooverImages[i].onload = function(){
					loaderCounter++;
					if (loaderCounter == numOfImages) {
						initControls()
						moove(a)
						mv.container.removeClass('moover-loading')
					}
				}
				mooverImages[i].src = mv.container.find("img")[i].src
			}	
		})();
	}
	/* Main Function */
	function moove(f, direction, index) {		
		
		//We need to store init Vars
		if(!f.defaults) {
			f.defaults = {}
			$.extend(f.defaults, f)
		}
		
		//Width and Height of the Moover container
		f.width = container.width()
		f.height = container.height()
		
		var activeSlide = container.find('.moover-active-slide');
		if (activeSlide.length>0) {
			if(f.onSlideSwitch) f.onSlideSwitch()
			var nextSlide = activeSlide.next('.moover-slide').length>0 ? activeSlide.next('.moover-slide') : container.find('.moover-slide:eq(0)');
			var prevSlide = activeSlide.prev('.moover-slide').length>0 ? activeSlide.prev('.moover-slide') : container.find('.moover-slide:last-child');
		}
		else {
			if(f.onStart) f.onStart()
			var nextSlide = container.find('.moover-slide:eq(0)');
			var prevSlide = container.find('.moover-slide:last-child');
		}
		
		if (a.navNewSlideIndex || a.navNewSlideIndex===0) {
			nextSlide = container.find('.moover-slide').eq(a.navNewSlideIndex);
			a.navNewSlideIndex = false
		}
		
		if (mv.slideToPrev==true) {
			nextSlide = prevSlide
			mv.slideToPrev = false	
		}
		
		//If We have different settings for different slides
		if(f.effects) {
			$.extend(f, f.defaults)
			if(f.effects[nextSlide.index()+1]) {
				$.extend(f, f.effects[nextSlide.index()+1])
			}
		}
		//Redefine function
		mv.redefine = function(newVars) {
			$.extend(f.defaults, newVars)
			$.extend(f, newVars)	
		}
		//IE6
		var isIE6 = navigator.userAgent.indexOf('MSIE 6')>=0;
		//Activation Function
		function activateNextSlide(){
			nextSlide.css({zIndex:""})
			moove(f)
			if (f.moveOutImage) movePrevImage()
		}
		function removePrevSlide() {
			nextSlide.removeClass('moover-active-slide').html(initSlideContent).css({display:'none'})
			if (a.afterSlideSwitch) a.afterSlideSwitch()
		}
		function movePrevImage() {
			var prevSlideImg = nextSlide.children('img')
			if (prevSlideImg.length>0) {
				if (withCSS3()) {
					prevSlideImg
					.mvTransform({time:f.slideTime, ease:"linear"})
					.css({ left:-prevSlideImg.width() })
					
				}
				else {
					prevSlideImg.animate({left:-prevSlideImg.width()},{duration:f.slideTime, easing:"linear"	})
				}
			}
		}
		// Navigation
		if (f.navigation) {
			if (f.navIsBlinking) {
				a.navIsBlinking = false;
				a.navWhichBlinking.fadeTo(150,1)
				clearInterval(a.navInterval)
			}
			var navContent = $(f.navigation);
			navContent.find('.moover-switch-active').removeClass('moover-switch-active').end()
			.find('.moover-switch:eq('+nextSlide.index()+')').addClass('moover-switch-active')	
		}
		
		//Common Manupulation with Slide
		var img = nextSlide.children('img').css({left:f.width})
		var imgInitWidth = img.width()
		var initSlideContent = nextSlide.html()
		var withImg = img.length>0
		
		nextSlide.addClass('moover-active-slide').css({
			display:"block",
			zIndex:110
		})
		
		//Action
		switch (f.effect) {
		
		case "slide" : {
			//Apply Transform Preset
			if (f.transformPreset) {
				if (mooverTransforms['slide'][f.transformPreset]) {
					$.extend(f, mooverTransforms['slide'][f.transformPreset]);
				}
			}	
			
			//Calculate Height and Top positions
			var textBlock = nextSlide.find(".moover-text");
			var isAbsolute = nextSlide.hasClass('moover-absolute')
			if (!isAbsolute) {
				textBlock.css({
					width : f.width - f.moveWidth
				})
				textBlock.css({
					top: (f.height-textBlock.outerHeight(true) )/2
				})
				var topFix = isIE6 ? (f.height-textBlock.outerHeight(true))/2 : 0;
				textBlock.children("p").each(function(){
					$(this).css({top: $(this).offset().top - textBlock.offset().top+topFix})
				})
			}
			else  {
				textBlock.css({
					width : '100%',
					top:0
				})
				var topFix = 0;
			}
			//Actions with a text lines
			textBlock.children("p").each(function(){
				var text = $(this);
				if (isAbsolute) {
					if (text.css('left').indexOf('%')>=0) {
						text.finalLeft = parseInt(text.css('left'),10)/100*f.width
					}
					else {
						text.finalLeft = parseInt(text.css('left'),10)
					}
					text.css({left:'0px', width:'auto'})
				}
				var textIndex = text.index()
				var isEven
				if (f.crossSideLines) {
					isEven = textIndex%2==0;
					if(f.lineFrom=="left") isEven = !isEven
				}
				else {
					isEven = true
					if(f.lineFrom=="left") isEven = false
				}
				text.css({
					display:"block",
					width : !isAbsolute ? f.width - f.moveWidth : Math.ceil(text.width())+5,
					position : "absolute"
				})
				
				if (withCSS3()) {
					//Slide In Stage
					if (!isAbsolute) {
						text.css({left: isEven?f.width:-f.width})
					}
					else {
						text.css({left: isEven?f.width:-text.width()})	
					}
					text.mvTransform({transform:f.initTextTransform})
					//Image
					if(withImg&&textIndex==0) {
						img
						.mvTransform({time:f.slideTime, ease:'linear'})
						.css({left:0})
						.mvTransitionEnd(function(){
							img
							.mvTransform({time:f.moveTime, ease: 'linear'})
							if (f.moveImage) {
								img.css({left:-f.moveWidth/2})
							}
							if (f.scaleImage||f.scaleImage===0) {
								img.css({width:imgInitWidth*f.scaleImage})
							}
						})
					}
					
					setTimeout(function(){
						text
						.css({
							left:!isAbsolute ? (isEven?f.moveWidth:0) : (isEven? text.finalLeft+f.moveWidth : text.finalLeft-f.moveWidth )
						})
						.mvTransform({transform:f.middleTextTransform, time:f.slideTime, ease:'linear'})
						
						if(f.textLineDelay||f.textLineDelay===0) {
							text.mvTransform({delay:f.textLineDelay*textIndex})	
						}
						
						//Middle Moving
						text.mvTransitionEnd(function(){
							text
							.css({
								left: !isAbsolute ? (isEven ? 0 : f.moveWidth) : text.finalLeft
							})
							.mvTransform({transform:f.middleTextTransform, time: f.moveTime, ease:"linear", delay:0})	
							
							//SlideOut
							setTimeout(function(){
								text.mvTransitionEnd(function(){
									setTimeout(function(){
										var mvQueue = function() {
											text
											.css({left:isEven ? -f.width : f.width})
											.mvTransform({transform:f.finalTextTransform, time:f.slideTime, ease:"linear", delay:0})
											.mvTransitionEnd(function(){
												if(text.index()==0) removePrevSlide();
											})
											if(text.index()==0)
												activateNextSlide()
										};
										if ( (mv.isStopped||mv.manualMode)&&!a.navIsBlinking  ) mv.queues.push(mvQueue);
										else mvQueue();
									}, a.afterSlideHoldTime);
								})
							},0)
						})
					},0)
				}
				//End of With CSS3
				
				//jQuery Fallback
				else {
					//Slide In Stage
					if(withImg&&textIndex==0) {
						img.css({left:f.width})
						.animate({left:0}, {easing: "linear", duration: f.slideTime, complete:function(){
							if(f.moveImage)	
								img.animate({left:-f.moveWidth/2}, {easing: "linear", duration: f.moveTime, queue:false})
							if(f.scaleImage||f.scaleImage===0)
								img.animate({width:imgInitWidth*f.scaleImage}, {easing: "linear", duration: f.moveTime, queue:false})
						}})
						
					}
					if (!isAbsolute) {
						text.css({left: isEven?f.width:-f.width})
					}
					else {
						text.css({left: isEven?f.width:-text.width()})
					}
					text.delay(f.textLineDelay*textIndex)
					.animate({
						left: !isAbsolute ? (isEven?f.moveWidth:0) : (isEven? text.finalLeft+f.moveWidth : text.finalLeft-f.moveWidth )
					
					}, {easing: "linear", duration: f.slideTime})
					.animate({left: !isAbsolute ? (isEven ? 0 : f.moveWidth) : text.finalLeft}, {easing: "linear", duration:f.moveTime, complete:function(){
						setTimeout( function(){
						
							var mvQueue = function() {
								if (textIndex==0) {
									activateNextSlide()	;
								}
								text.animate({left: isEven ? -f.width : f.width}, {easing: "linear", duration: f.slideTime, complete:function(){
									if(textIndex==0) {
										removePrevSlide();
									}
								}})
							};
						
							if ( ! ( (mv.isStopped||mv.manualMode)&&!a.navIsBlinking ) ) mvQueue();
							else mv.queues.push(mvQueue);
							
						}, a.afterSlideHoldTime);
					}})
				}
				//End of No CSS3
			})
			
		};
		break;//--End of Slide Effect
		
		case "typewriter" : {
			//Apply Transform Preset
			if (mooverTransforms && f.transformPreset) {
				if (mooverTransforms['typewriter'][f.transformPreset]) {
					$.extend(f, mooverTransforms['typewriter'][f.transformPreset])
				}
			}
			if (mooverTransforms && f.timingPreset) {
				if (mooverTransforms['timings'][f.timingPreset]) {
					$.extend(f, mooverTransforms['timings'][f.timingPreset])
				}
			}
			//--
			var img = nextSlide.children('img').css({left:f.width})
			var initSlideContent = nextSlide.html()
			var imgInitWidth = img.width()
			var withImg = img.length>0
			nextSlide.addClass('moover-active-slide').css({
				display:"block",
				zIndex:110
			})
			//Calculate Height and Tops positions
			var isAbsolute = nextSlide.hasClass('moover-absolute')
			var textBlock = nextSlide.children(".moover-text");
				textBlock.css({
					width : f.width	
				})
				textBlock.css({top: (f.height - textBlock.outerHeight(true) )/2})
				var topFix = isIE6 ? (f.height-textBlock.outerHeight(true))/2 : 0;
				if (!isAbsolute) {
					textBlock.children("p").each(function(){
						$(this).css({top: $(this).offset().top - textBlock.offset().top+topFix})
					})
				}
				if (isAbsolute) {
					textBlock.css ({left:0,top:0, width:f.width, height:f.height})
				}
			//Image Slide In
			if(withImg) {
				if (withCSS3()) {
					img
					.mvTransform({time:f.slideTime, ease:"linear"})
					.mvTransitionEnd(function(){
						setTimeout(function(){
							img
							.mvTransform({time:f.moveTime,ease:'linear'})
							if (f.moveImage) {
								img.css({left:-f.moveWidth/2})
							}
							if (f.scaleImage||f.scaleImage===0) {
								img.css({width:imgInitWidth*f.scaleImage})	
							}
							if(f.waitForImage) drawTWChars()	
						},0)
					})
					.css({left:0})
				}
				else {
					img.animate({left:0},{duration:f.slideTime, easing:"linear", complete:function(){
						if (f.moveImage===true) {	
							$(this).animate({left:-f.moveWidth/2},{duration:f.moveTime, easing:"linear", queue:false})
						}
						if (f.scaleImage||f.scaleImage===0) {
							$(this).animate({width:imgInitWidth*f.scaleImage}, {queue:false, duration:f.moveTime, easing:"linear"})	
						}
						if(f.waitForImage) drawTWChars()
					}})
				}
				if(!f.waitForImage) 
					var _temp1 = setTimeout(function(){
						clearTimeout(_temp1)
						drawTWChars()	
					},0)
				
			}
			else {
				var _temp1 = setTimeout(function(){
					clearTimeout(_temp1)
					drawTWChars()	
				},0)
				
			}
		//Actions with a text lines
			textBlock.children("p").css({display:"none"})
			function drawTWChars() {
		//Create Smart Spans
				var charIndex = 0
				textBlock.children("p").each(function(){
					var text = $(this);
					if (text.find('.moover-TW').length>0) return;
					var textIndex = text.index()
					if (!isAbsolute) {
						text.css({left:f.moveWidth/2, position:"absolute", width : f.width - f.moveWidth});
					}
					var newContent="";
					
					for(var i=0; i<text[0].childNodes.length; i++) {
						var node = text[0].childNodes[i];
						
						if(!node.innerHTML && node.innerHTML!="") {
							var j = 0;
							for(var j=0; j < node.nodeValue.length; j++) {
								newContent+='<span class="moover-TW" data-mvindex="'+charIndex+'">'+node.nodeValue.charAt(j).replace(" ","&nbsp;")+'</span>';
								charIndex++;
							}
						}
						else {
							newContent+='<span class="moover-TW" data-mvindex="'+charIndex+'">'+$(node).html()+'</span>';
							charIndex++;
						}
					}
					text.html(newContent)
				})
			//Default Char Easings
				var charEase1, charEase2, charEase3;
				if(!f.charEase) {
					charEase1 = "ease-out";
					charEase2 = "ease-out";
					charEase3 = "ease"		
				}
				else {
					charEase1 = charEase2 = charEase3 = f.charEase
				}
			//Animation Part
				/* For modern browsers with CSS3 */
				if (withCSS3()) {
					textBlock.find('.moover-TW').each(function(){
						$(this).parent().css({display:"block"})
						var charIndex2 = $(this).attr('data-mvindex');
						var character = $(this);
						character.mvTransform({transform:f.initCharTransform, origin:f.charOrigin, ease:charEase1, time:0, delay:0})
						setTimeout(function(){
							character.mvTransform({transform:f.middleCharTransform, origin:f.charOrigin, ease:charEase2, time:f.charTime, delay:charIndex2*f.charDelay})
							.mvTransitionEnd(function(){
								$(this).mvTransform({transform:f.finalCharTransform, origin:f.charOrigin, ease:charEase3,  time:f.charTime, delay:0})
								.mvTransitionEnd(function(){
									if(charIndex2==charIndex-1) {
										setTimeout(function(){
											var mvQueue = function(){
												setTimeout(function(){
													removePrevSlide()	
												},f.slideTime)
												character.parents('.moover-slide').find('.moover-TW').each(function(){
													$(this).mvTransform({transform:f.finalCharTransform, origin:f.charOrigin, ease:charEase1, time:f.slideTime/2, delay:0})
													.css({opacity:0})
												})
												//Run Function Again
												if(nextSlide.prev('.moover-slide').css('display')=="block") {
													var _wait = setInterval(function(){
														if(nextSlide.prev('.moover-slide').css('display')!="block") {
															activateNextSlide()
															clearInterval(_wait)	
														}
													},30)
												}
												else activateNextSlide()
											}
											if ((mv.isStopped||mv.manualMode)&&!a.navIsBlinking) mv.queues.push(mvQueue);
											else mvQueue();

										},f.textHoldTime)
									}
								})
							})
						},50)
					})
				} // <- End of WithCSS3
				
				/* For old browsers and IE */
				else {
					textBlock.find('.moover-TW').each(function(){
						$(this).parent().css({display:"block"})
						var charIndex2 = $(this).attr('data-mvindex')
						var character = $(this)
						.css({opacity:0, position:'relative'})
						.delay(f.charDelay*charIndex2)
						.animate({opacity:1, top:"-7px", left:"-5px", fontSize:"-=0px" }, f.charTime)
						.animate({opacity:1, top:0, left:0, fontSize:"+=0px"}, f.charTime,function(){
							if(charIndex2==charIndex-1) {
								setTimeout(function(){
									var mvQueue = function() {
										var _temp3 = setTimeout(function(){
											clearTimeout(_temp3)
											removePrevSlide()	
										},f.slideTime)
										
										character.parents('.moover-text').fadeOut(f.slideTime/2)
										.parents('.moover-slide').css({zIndex:""})
										
										//Run Function Again
										if(nextSlide.prev('.moover-slide').css('display')=="block") {
											var _wait = setInterval(function(){
												if(nextSlide.prev('.moover-slide').css('display')!="block") {
													activateNextSlide()
													clearInterval(_wait)	
												}
											},30)
										}
										else activateNextSlide()
									}
									if (! ( (mv.isStopped||mv.manualMode)&&!a.navIsBlinking ) ) mvQueue()
									else mv.queues.push(mvQueue)
									
								},f.textHoldTime)
							}
						})
					})
				} // <- End of Fallback for IE
			}
		};
		break;//<-End of Typewriter Effect
		
		case "pusher": {
			var img = nextSlide.children('img').css({left:f.width})
			var imgInitWidth = img.width()
			var initSlideContent = nextSlide.html()
			var isAbsolute = nextSlide.hasClass('moover-absolute')
			var withImg = img.length>0
			nextSlide.addClass('moover-active-slide').css({
				display:"block",
				zIndex:110
			})
			//Calculate Height and Top positions
			var textBlock = nextSlide.find(".moover-text");
			if (!isAbsolute) {
				textBlock.css({
					width : f.width - f.moveWidth
				})
				textBlock.css({
					top: (f.height-textBlock.outerHeight(true) )/2
				})
				textBlock.children("p").each(function(){
					$(this).css({top: $(this).offset().top - textBlock.offset().top})
				})
			}
			else  {
				textBlock.css({
					width : '100%',
					top:0
				})
				textBlock.children("p").each(function(){
					var pushLeftPos 
					if ($(this).css('left').indexOf('%')>=0) {
						pushLeftPos = parseInt($(this).css('left'),10)/100*f.width
					}
					else {
						pushLeftPos = parseInt($(this).css('left'),10)
					}
					$(this).attr('data-moover-left', pushLeftPos )
					$(this).css({top: $(this).offset().top - textBlock.offset().top})
				})
			}
			
			
			//Actions with a text lines
			var totalLines = textBlock.children("p").length
			var topFix = !isAbsolute ? (isIE6 ? (f.height-textBlock.outerHeight(true))/2 : 0) : 0;
			var fallToTop
			textBlock.children("p").each(function(){
				var textLine = $(this);
				var textIndex = textLine.index()
				if (isAbsolute) {
					textLine.css({left:0, width:'auto', position:'absolute'})
				}
				var lineWidth = !isAbsolute ? f.width - f.moveWidth : textLine.width()+5
				textLine.css({
					display:"block",
					width : lineWidth,
					position : "absolute",
					left:!isAbsolute ? f.moveWidth/2 : textLine.attr('data-moover-left')*1
				})
				.attr({'data-moover-top': textLine.position().top})
				textLine.css({top:-textLine.outerHeight()-textBlock.position().top})
				if (textLine.index()==0) fallToTop = textLine.attr('data-moover-top')*1
			})
			
			function dropLines() {
				textBlock.children("p").each(function(){
					var textLine = $(this);
					textLine.initTop = textLine.attr('data-moover-top')*1
					var textIndex = textLine.index()
					var pushDelay = (totalLines-textLine.index()-1)*f.pushDelay
					var pushDelay2 = f.pushDelay>100 ? f.pushDelay-50 : f.pushDelay
					var randRotate = textLine.index()==0 ? 0 : Math.round(Math.random()*20-10)
					if(withCSS3()) {
						var fallTo = textIndex!==0 ? ( isAbsolute ? fallToTop : 0 ) : ( textLine.initTop )
						var fallToLeft = !isAbsolute ? false : (textLine.attr('data-moover-left')*1) 
						textLine
						.css({top:fallTo, left: fallToLeft})
						.mvTransform({transform: 'rotate('+randRotate+'deg) scale(1) translate(0px,0px)', ease:'linear', time:f.pushTime, delay: pushDelay})
						.mvTransitionEnd(function(){
							var finalLeft = !isAbsolute ? false : textLine.attr('data-moover-left')*1
							textLine.css({top:textLine.initTop, left:finalLeft})
							.mvTransform({delay:pushDelay2, transform: 'rotate(0deg) scale(1) translate(0px,0px)'})
							if(textIndex==0) {
								var mvQueue = function(){
									textBlock.children("p").mvTransform({time:f.slideTime/2, delay:0})
									.css({top:"+="+f.height})
									setTimeout(function(){
										removePrevSlide()
									},f.slideTime)
									activateNextSlide()
								}
								setTimeout(function(){
									if ((mv.isStopped||mv.manualMode)&&!a.navIsBlinking) mv.queues.push(mvQueue);
									else mvQueue();
								},f.afterPushHoldTime)
							}
						})
					}
					else {
						var fallTo = textIndex!==0 ? ( isAbsolute ? fallToTop : 0 ) : ( textLine.initTop )
						var fallToLeft = !isAbsolute ? 'none' : textLine.attr('data-moover-left')*1 
						textLine
						.delay(pushDelay)
						.animate({top:fallTo+topFix, left:fallToLeft}, f.pushTime, function(){
							var finalLeft = !isAbsolute ? false : textLine.attr('data-moover-left')*1
							textLine.delay(pushDelay2).animate({top:textLine.initTop+topFix, left:finalLeft}, f.pushTime,function(){
								if(textIndex==0) {
									var timeout1 = setTimeout(function(){
										var mvQueue = function() {
											clearTimeout(timeout1)
											textBlock.children("p").animate({top:"+="+f.height}, f.slideTime/2)
											activateNextSlide()
											
											setTimeout(function(){
												removePrevSlide()
											},f.slideTime)
										}
										if (! ((mv.isStopped||mv.manualMode)&&!a.navIsBlinking) ) mvQueue()
										else mv.queues.push(mvQueue)
										
									},f.afterPushHoldTime)
								}
							})
						})
					}
				})
			}
			
			setTimeout(function(){
				dropLines()
			},f.slideTime)
			
			if(withImg) {
				if(withCSS3()) {
					img
					.css({left:0})
					.mvTransform({time:f.slideTime, ease:'linear'})
					.mvTransitionEnd(function(){
						img
						.mvTransform({time:f.moveTime, ease:'linear'})
						if (f.moveImage) {
							img.css({left:-f.moveWidth/2})
						}
						if (f.scaleImage||f.scaleImage===0) {
							img.css({width:imgInitWidth*f.scaleImage})	
						}
					})
				}
				else {
					img.animate({left:0},{duration:f.slideTime, easing:"linear", complete: function(){
						if(f.moveImage) {
							img.animate({left:-f.moveWidth/2},{duration:f.moveTime, easing:"linear", queue:false})
						}
						if(f.scaleImage||f.scaleImage===0) {
							img.animate({width:imgInitWidth*f.scaleImage},{duration:f.moveTime, easing:"linear", queue:false})	
						}
					}})
				}
			}
		};
		break;//<-End of Pusher Effect
		
		case "fader": {
			var img = nextSlide.children('img').css({left:f.width})
			var imgInitWidth = img.width()
			var initSlideContent = nextSlide.html()
			var withImg = img.length>0
			nextSlide.addClass('moover-active-slide').css({
				display:"block",
				zIndex:110
			})
			var textBlock = nextSlide.find(".moover-text");
				textBlock.css({width:f.width, height:f.height});
			var tX ,tY;
			//Actions with a text lines
			var totalLines = textBlock.children("p").length
			textBlock.children("p").each(function(){
				var el = $(this);
				var isEven = el.index()%2==0;
				tX = f.fadeType=='horizontal' ? (isEven ? -20 : 20) : 0;
				tY = f.fadeType=='horizontal' ?  0 : (isEven ? -20 : 20);
				el.css({position:'relative', 'float':'left', opacity:0})
				var width = el.outerWidth(true)+50
				el
				.mvTransform({
					time: 0,
					transform: 'translate('+tX+'px,'+tY+'px)'
				})
				.css({
					width: width,
					position:'absolute',
					'float':'none',
					'textAlign':'left'
				});
			})
			
			function fadeLines() {
				textBlock.children("p").each(function(){
					var el = $(this);
					var index = el.index();
					if(withCSS3()) {
						el
						.mvTransform({time: f.fadeTime, transform:'translate(0,0)', delay : f.fadeDelay*index})
						.css({opacity:1})
						.mvTransitionEnd(function(){
							if (index==totalLines-1) {
								var mvQueue = function(){
									textBlock.children("p")
									.mvTransform({transform:'translate('+tX+'px,'+tY+'px)', time:f.slideTime, delay:0})
									.css({opacity:0});
									setTimeout(function(){
										removePrevSlide();
									},f.slideTime)
									activateNextSlide();
								}
								setTimeout(function(){
									if ((mv.isStopped||mv.manualMode)&&!a.navIsBlinking) mv.queues.push(mvQueue);
									else mvQueue();
								},f.afterFadeHoldTime)
							}
						});
					}
					else {
						var leftPos = el.css('left');
						var topPos = parseInt(el.css('top'),10);
						if (leftPos.indexOf('%')>=0) {
							leftPos = parseInt(leftPos,10)/100*f.width;
						}
						else {
							leftPos = parseInt(leftPos,10);
						}
						var isEven = index%2==0;
						tX = f.fadeType=='horizontal' ? (isEven ? -20 : 20) : 0;
						tY = f.fadeType=='horizontal' ?  0 : (isEven ? -20 : 20);
						el.css({left: leftPos+tX, top: topPos+tY}).delay(index*f.fadeDelay).animate({left:leftPos, top:topPos, opacity:1}, f.fadeTime, function(){
							if (index==totalLines-1) {
								var mvQueue = function(){
									textBlock.children("p")
									.animate({left: leftPos*1+tX, top: topPos*1+tY, opacity:0}, f.slideTime, function(){
										removePrevSlide();
									})
									activateNextSlide();
								}
								setTimeout(function(){
									if ((mv.isStopped||mv.manualMode)&&!a.navIsBlinking) mv.queues.push(mvQueue);
									else mvQueue();
								},f.afterFadeHoldTime)
							}
						})
					}
				})
			}
			setTimeout(function(){
				fadeLines();
			},f.slideTime)
				
			if (withImg) {
				if(withCSS3()) {
					img
					.css({left:0})
					.mvTransform({time:f.slideTime, ease:'linear'})
					.mvTransitionEnd(function(){
						if (f.moveImage || f.scaleImage || f.scaleImage===0) {
							img.mvTransform({time:f.moveTime, ease:'linear'})
							if (f.moveImage) img.css({left:-f.moveWidth/2});
							if (f.scaleImage||f.scaleImage===0) img.css({width:imgInitWidth*f.scaleImage});						
						}
					})
				}
				else {
					img.animate({left:0},{duration:f.slideTime, easing:"linear", complete: function(){
						if(f.moveImage) {
							img.animate({left:-f.moveWidth/2},{duration:f.moveTime, easing:"linear", queue:false})
						}
						if(f.scaleImage||f.scaleImage===0) {
							img.animate({width:imgInitWidth*f.scaleImage},{duration:f.moveTime, easing:"linear", queue:false})	
						}
					}})
				}
			}
		};
		break;//<-End of Fader Effect
		
		};//<-End of Effects Switch
		//Put All Vars to global Var
		mv.parameters = f
	}
	return mv;
}
})(jQuery);