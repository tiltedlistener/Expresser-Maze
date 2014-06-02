(function ($, window, document) {
	"use strict";
	
	// Set Namespace
	var App = {};
	window.App = App;
	
	
	// Boot
	App.boot = (function () {
		
		function pull() {
			App.input.init();
			App.draw.init();

			var hash = window.location.hash;
			if (hash !== '') {
				$('#processing').show();
				var val = hash.replace('#','');
				App.input.setUpFromHash(val);
			}
		}
		
		return {
			pull : pull	
		};
	
	})();
	
	
	// Input
	App.input = (function () {
		
		var textarea,
			button,
			data,
			lightBox,
			textFinal,
			returnBtn,
			examples,
			explain,
			shareBtn,
			toolsWrapper;
		
		function init() {
			textarea = $('textarea');	
			button = $('#button');
			lightBox = $('#lightbox');
			textFinal = $('#text-final');
			returnBtn = $('#return');
			examples = $('#examples');
			explain = $('#explain');
			shareBtn = $('#share');
			toolsWrapper = $('#tools-wrapper');
			
			// onkeyup & onchange
			textarea[0].onkeyup = readInput;
			textarea[0].onchange = readInput;
			button.click(process);
			returnBtn.click(backToMain);
			examples.click(showExamples);
			explain.click(showExplain);

			applyUse();
			applyClose();
		}
		
		function readInput() {
			data = textarea.val();

			if (data === '')
				data = false;

			return data;
		}
		
		function getData() {
			return data;	
		}
		
		function process() {
			if (data) {
				generateHash(data);
				App.translate.translateText();	
				App.draw.build();	
				createFinalText();
			}
		}

		function createFinalText() {
			var res = '<span>[</span>' + data + '<span>]</span>';
			textFinal.html(res);
		}

		function closeLightBox() {
			hideAll();
			lightBox.animate({'top' : '-=1000px'}, 'slow', showReturn);
		}

		function openLightBox() {
			lightBox.animate({'top' : '+=1000px'}, 'slow');
		}

		function showReturn() {
			toolsWrapper.animate({'top' : '+=30px'}, 'slow');
		}

		function hideReturn() {
			toolsWrapper.animate({'top' : '-=30px'}, 'fast', openLightBox);
		}

		function backToMain() {
			hideReturn();
		}

		function showExamples() {
			$('#explain-info').fadeOut('fast');
			$('#example-info').fadeIn();
		}

		function showExplain() {
			$('#explain-info').fadeIn();
			$('#example-info').fadeOut('fast');
		}

		function hideAll() {
			$('#explain-info').fadeOut('fast');
			$('#example-info').fadeOut('fast');
		}

		function applyClose() {
			$('.info-close').click(function () {
				$(this).closest('.info').fadeOut();
			});
		}

		function applyUse() {
			$('.example-use').click(function () {
				var text = $(this).siblings('.example-text').text();
				textarea.val(text);
				readInput();
			});
		}

		function setUpFromHash(val) {
			val = val.replace(/\+/g, ' ');
			textarea.val(val);
			readInput();
			process();
			$('#processing').fadeOut();
		}

		function generateHash(val) {
			window.location.hash = '#' + val.replace(/\s/g, '+');
			shareBtn.html(twitterText(window.location.href));
			twttr.widgets.load();
		}

		function twitterText(url) {
			var val = '<a href="https://twitter.com/share" class="twitter-share-button" data-url="'+ url +'" data-text="I made this with words." data-count="none" data-hashtags="Expresser">Tweet</a>';
				val+= "<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>";
			return val;
		}

		return {
			init : init,
			readInput : readInput,
			setUpFromHash : setUpFromHash,
			getData : getData,
			closeLightBox : closeLightBox
		};
		
	})();
	
	// Translate
	App.translate = (function () {
		
		var letters = /^[A-Za-z]+$/,
			result = [],
			color = 0,
			RGB,
			swatch = [	
				'#6E5F16',
				'#C37F18',
				'#C4AE40',
				'#FFCE00',
				'#FFF836',
				'#2A425B',
				'#2A71BF',
				'#8D929D',
				'#E9E1DC',				
				'#AB9BC9'
			];
	
		function translateText() {
			var val = App.input.getData();

			if (val) {
				var cleaned = val.replace(/[^A-Za-z]+/g, '');
			
				var len = cleaned.length,
					total = 0;
				
				// Get Boolean display
				result = [];
				for(var i=0;i<len;i++) {
					var cur = cleaned[i],
						value = cur.charCodeAt(0),
						res = (value % 2 === 0) ? true : false;
					total += value;
					result.push(res);
				}
				
				// Set color code
				var tempColor = getColorCode(total, len);
				color = createRGB(tempColor);
			}
		}
		
		function getColorCode(total, len) {
			var avg = parseInt(total / len, 10);
			return getIntoRange(avg);
		}
		
		function getIntoRange(val) {
			if (val > 255)
				getIntoRange(val - 255);
			else
				return val;
		}
		
		function finalColor() {
			return color;	
		}
		
		function finalSet() {
			return result;	
		}
		
		function createRGB(color) {
			
			var	newColor = color + '',
				rgb,
				red, green, blue;
				
			red = Math.floor(Math.random() * 255);
			green = Math.floor(Math.random() * 255);
			blue = Math.floor(Math.random() * 255);
			
			var newColor = Math.floor(Math.random() * 10);
			
			
			rgb = 'rgb(' + red + ','+ green +',' + blue + ')';	
			return swatch[newColor];
		}
		
		function even(val) {
			return (val % 2 === 0) ? true : false;	
		}
	
		return {
			translateText : translateText,
			finalColor : finalColor,
			finalSet : finalSet
		};
		
	})();
	
	// Draw. Duh.
	App.draw = (function () {
		
		var c,
			ctx,
			width,
			height,
			tileWidth = 20,
			tileHeight = 20,
			columns,
			rows,
			currentX = 0,
			currentY = 0;
		
		function init() {
			c = document.getElementById('c');
			ctx = c.getContext('2d');
			width = c.width;
			height = c.height;
			columns = width / tileWidth;
			rows = height / tileHeight;
			
		}
		
		function build() {
			
			resetPosition();
			ctx.clearRect(0, 0, width, height);	
					
			var set = App.translate.finalSet(),
				color = App.translate.finalColor(),
				len = set.length;
		
			runDrawLoop(set, len, color);
		}
		
		function runDrawLoop(set, len, color) {
			for (var i=0;i<len;i++) {	
				var cur = set[i];
				
				if (cur) {
					ctx.fillStyle = color;
					ctx.fillRect(currentX, currentY, tileWidth, tileHeight);
				}
				currentX += tileWidth;
				if (currentX > width) {
					currentY += tileHeight;
					currentX = 0;	
				}
				
				if (i == len - 1) {
					if (currentY < height) {
						runDrawLoop(set, len, color);
					} else {
						App.input.closeLightBox();
					}
				}
			}			
		}
		
		function randomFromInterval(from,to) {
			return Math.floor(Math.random()*(to-from+1)+from);
		}	

		function resetPosition() {
			currentX = 0;
			currentY = 0;
		}		
		
		return {
			init : init,
			build : build
		};
		
	})();	
	
	// Boot
	window.onload = App.boot.pull;
	
})(jQuery, this, this.document);