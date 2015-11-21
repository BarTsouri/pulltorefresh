(function(){
	const transform = '-webkit-transform',
	      translate1 = 'translate3d(0,',
	      translate2 = 'px,0)',
	      rotate = ' rotate(',
	      deg = 'deg)';

	var list ,refreshEl ,refreshSpan;

	var startBoundary = 80,
	    slowAnimationBoundary = 100;

	var fetchSpinBezier = new Bezier(.26,.72,.57,.83);

	document.addEventListener('DOMContentLoaded', initAndroid);

	function isTablet(){
		return window.innerHeight > 599 && window.innerWidth > 599
	}

	function initAndroid(){
		list = $("#list")[0];
		refreshEl = $(document.getElementById("refresher"));
		refreshSpan = $('span', refreshEl);

		if (isTablet()) refreshSpan.addClass('tablet');
		refreshSpan.addClass('fa-repeat');

		list.addEventListener('touchstart', onTouchStart);
		list.addEventListener('touchmove', onTouchMove);
		list.addEventListener('touchend', onTouchEnd);
		list.addEventListener('touchcancel', onTouchEnd);
	}

	var isStart = false;

	function onTouchStart(){
		isStart = true;
		startScroll = list.scrollTop;
	}

	var isManualAnim = false,
	    startTop,
	    startScroll,
	    y,
	    isNegativeScroll;

	const regularFactor = 0.9,
	      slowFactor = 0.72;

	function onTouchMove(e){
		if (!isInteractive) return;

		if (isStart) {
			startTop =  e.touches[0].screenY;
			isStart = false;
		}

		y = startTop - e.touches[0].screenY + startScroll;
		isNegativeScroll = y < 0;
		y = Math.abs(y);

		if (list.scrollTop == 0 && isNegativeScroll) {
			e.preventDefault(); // makes the touch event synchronous

			var slowAnimationDiff = y - slowAnimationBoundary,
			    isRegularAnimation = slowAnimationDiff <= 0;

			if (isRegularAnimation) {
				y = Math.pow(y, regularFactor);
			} else {
				y = (Math.pow(slowAnimationBoundary, regularFactor) + Math.pow(slowAnimationDiff, slowFactor));
			}

			if (!isManualAnim){
				window.cancelAnimationFrame(manualAnimation);
				window.requestAnimationFrame(manualAnimation);
				isManualAnim = true;
			}
		}
	}

	var isInteractive = true;

	function onTouchEnd(){
		if (isInteractive && list.scrollTop == 0 && isNegativeScroll) {
			isInteractive = false;

			window.requestAnimationFrame(manualAnimation);

			if(y > startBoundary) {
				console.log('pull to refresh is triggered');
				autoMove.toFetchPos(function(){
					var stopSpin = fetchSpin();
					setTimeout(function(){
						console.log('pull to refresh - finished');
						stopSpin();
						autoMove.toInitPos(function(){ isInteractive = true; });
					}, 5000);
				});
			} else {
				autoMove.toInitPos(function(){isInteractive = true});
			}
		}
	}

	const inactiveOpacity = 0.45;

	function manualAnimation(){
		manualMove();
		manualRotate();
		manualOpacity();
		isManualAnim = false;
	}

	function manualMove(){
		refreshEl.css('transform', translate1 + y  + translate2);
	}

	var lastR;
	function manualRotate(){
		var normalizedDist =  Math.max(y / startBoundary, 0),
		    r = normalizedDist;

		if (r > 1) r = Math.pow(r, 0.82); // rotate slower after we are pull to refresh ready
		r *= 360;
		lastR = r;

		refreshSpan.css('transform', rotate + r + deg);
	}

	function manualOpacity(){
		const addOpacityBoundary = 0.925;

		var normalizedDist =  Math.max(y / startBoundary, 0),
		    opacity = inactiveOpacity;

		if (normalizedDist >= 1) {
			opacity = 1;
		} else if (normalizedDist > addOpacityBoundary) {
			opacity += (1 - inactiveOpacity) * ((normalizedDist - addOpacityBoundary) / (1 - addOpacityBoundary));
		}

		refreshSpan.css('opacity', opacity);
	}

	var autoMove = (function(){
		function move(pos, duration, f){
			var startTime;

			function step(timestamp){
				if (!startTime) startTime = timestamp;
				var timeDiff = timestamp - startTime;
				y -= timeDiff / duration * (Math.abs(pos - y));
				if (y > pos){
					manualMove();
					window.requestAnimationFrame(step);
				} else {
					f();
				}
			}

			window.requestAnimationFrame(step);
		}

		return {
			toFetchPos: function(f){
				move(startBoundary, 250, f);
			},

			toInitPos: function(f){
				move(0, 250, function(){f(); refreshSpan.css('opacity', inactiveOpacity); refreshEl.css('transform', '')});
			}
		}
	}());

	function fetchSpin(){
		var startTime,
		    myReq;

		function step(timestamp){
			if (!startTime) startTime = timestamp;
			var diff = timestamp - startTime;
			var r = fetchSpinBezier((diff % 1000) / 1000) * 360;
			r += lastR % 360;
			refreshSpan.css('transform', rotate + r + deg);
			myReq = window.requestAnimationFrame(step);
		}

		myReq = window.requestAnimationFrame(step);
		return function(){
			window.cancelAnimationFrame(myReq);
		}
	}
}());