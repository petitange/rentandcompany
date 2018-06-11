require([
	'jquery'
	/* 'mgs/waypoints',
	'mgs/counterup' */
], function(jQuery){
	(function($) {
		$(document).ready(function(){
			$('.header .switcher-dropdown').hide();
			var widthScreen = $(window).width();
			var widthContainer = $('.header .middle-header-content .container').width();
			var rightPadding = (widthScreen-widthContainer-24)/2;
			$('.header .top-bar-right .minicart-wrapper.switcher').css("right", rightPadding+"px");
			$('.vertical-menu-home .vertical-title').click(function(){
				$(this).parent().find('.vertical-menu-content').slideToggle('fast');
			});
			$('.product-content .controls .towishlist.no-active').mouseover(function(){
				$(this).find('.fa').addClass('fa-heart');
				$(this).find('.fa').removeClass('fa-heart-o');
			});
			$('.product-content .controls .towishlist.no-active').mouseout(function(){
				$(this).find('.fa').addClass('fa-heart-o');
				$(this).find('.fa').removeClass('fa-heart');
			});
			$('.filter-options-block .block-title').click(function(){
				$(this).parent().find('.panel-body').slideToggle('fast');
				if($(this).hasClass('closed')){
					$(this).removeClass('closed');
					$(this).parent().removeClass('closed');
				}else{
					$(this).addClass('closed');
					$(this).parent().addClass('closed');
				}
			});
			$('.btn-responsive-nav').click(function(){
			   $('.navigation').addClass('show-menu') 
			});
			$('.navigation .fa-times').click(function(){
				$('.nav-main').removeClass('show-menu');
			});
                                                
			$('.mega-menu-item ul.dropdown-menu .level1 .toggle-menu .fa-plus').click(function(){
				$(this).parent().siblings('ul').slideDown('fade');		
					$(this).addClass('hide-plus');
					$(this).siblings('.fa-minus').addClass('show-minus');
			});

			$('.mega-menu-item ul.dropdown-menu .level1 .toggle-menu .fa-minus').click(function(){
					$(this).parent().siblings('ul').slideUp('fade');
					$(this).siblings('.fa-plus').removeClass('hide-plus');
					$(this).removeClass('show-minus');
			});
			
			$('.static-menu .dropdown-submenu .toggle-menu .fa-plus').click(function(){
				$(this).parent().siblings('ul').slideDown('fade');
					$(this).addClass('hide-plus');
					$(this).siblings('.fa-minus').addClass('show-minus');
			});

			$('.static-menu .dropdown-submenu .toggle-menu .fa-minus').click(function(){
				$(this).parent().siblings('ul').slideUp('fade');
					$(this).siblings('.fa-plus').removeClass('hide-plus');
					$(this).removeClass('show-minus');
			});
		});
		$(window).load(function(){
			$('.header .switcher-dropdown').show();
		});
	})(jQuery);
	
});
