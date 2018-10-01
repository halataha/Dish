(function($) { "use strict";
    
    /* Animate loader off screen */
    jQuery(window).load(function() {
        jQuery('body').addClass('loaded');
    });
    
	/* niceScroll */
	$(function() {  
          $("html").niceScroll({
            scrollspeed: 80,
			mousescrollstep: 80,
			cursorwidth: 6,
			cursorborder: 0,
			cursorcolor: '#6c6c6c', // color
			autohidemode: false,
			zindex: 9999999,
			horizrailenabled: false,
			cursorborderradius: 0,
			autohidemode:"true",
          });
      }); 
	$("html").mouseover(function() {
	  $("html").getNiceScroll().resize();
	});
	
    /* add class sticky in header */
    jQuery(window).on('scroll', function () {
        if (jQuery(this).scrollTop() > 1) {
            jQuery('.sticky header').addClass('sticky')
        } else {
            jQuery('.sticky header').removeClass('sticky')
        }
        return false;
    });
    

    

    /* main menu */
    jQuery('a.open_close').on('click', function() {
        jQuery('#main-menu').toggleClass('show');
        jQuery('.layer').toggleClass('layer-is-visible');
    });
    
    jQuery('a.show-submenu').on('click', function() {
        jQuery(this).next().toggleClass('show_normal');
    });
    
    jQuery('a.show-submenu-mega').on('click', function() {
        jQuery(this).next().toggleClass('show_mega');
    });
    
    jQuery(window).width() <= 600 && jQuery('a.open_close').on('click', function() {
        jQuery('.np-toggle-switch').removeClass('active');
    });
    
	/* Go up */
	jQuery(window).on('scroll', function () {
		if(jQuery(this).scrollTop() > 100 ) {
			jQuery(".go-up").css("right","20px");
		}else {
			jQuery(".go-up").css("right","-60px");
		}
	});
    
	jQuery(".go-up").on('click', function(){
		jQuery("html,body").animate({scrollTop:0},500);
		return false;
	});
    
    /* sticky sidebar */
    jQuery('.sticky-sidebar').theiaStickySidebar({
      // Settings
      additionalMarginTop: 100,
      additionalMarginBottom: 25,
    });
    
    /* slideshow */
	if (jQuery(".tp-banner").length) {
		jQuery('.tp-banner').revolution({
			delay:5000,
			startwidth:1170,
			startheight:700,
			hideThumbs:10,
			fullWidth:"off",
			fullScreen:"off"
		});
	}
	if (jQuery(".tp-banner-2").length) {
		jQuery('.tp-banner-2').revolution({
			delay:5000,
			startwidth:1170,
			startheight:500,
			hideThumbs:10,
			fullWidth:"off",
			fullScreen:"off"
		});
	}
    
    // remove-recipe-col
    jQuery(".remove-recipe-col").on('click', function(){
		jQuery(this).parent().remove();
		return false;
	});
    
    // Products Filter
    $("#range_slider").ionRangeSlider({
        type: "double",
        grid: true,
        min: 1,
        max: 1000,
        from: 250,
        to: 600,
        prefix: "$"
    });
    
    // Check Also Box
	jQuery(function(){
		var $check_also_box = jQuery("#check-also-box");
		if( $check_also_box.length > 0 ){
			var articleHeight   =  jQuery('#the-post').outerHeight();
			var checkAlsoClosed = false ;
			jQuery(window).scroll(function() {
				if( !checkAlsoClosed ) {
					var articleScroll = jQuery(document).scrollTop();
					if ( articleScroll > articleHeight ){ 
					   $check_also_box.addClass('show-check-also');
                    }
					else { 
					   $check_also_box.removeClass('show-check-also');
                    }
				}
			});
		}
		jQuery('#check-also-close').click(function() {
			$check_also_box.removeClass("show-check-also");
			checkAlsoClosed = true ;
			return false;
		});
	});
    
    // Reading Position Indicator
	var reading_content = jQuery('#the-post');
	if( reading_content.length > 0 ){
		reading_content.imagesLoaded(function() {
			var content_height	= reading_content.height();
			var window_height	= jQuery(window).height();
			jQuery(window).scroll(function() {
				var percent 		= 0,
                    content_offset	= reading_content.offset().top,
					window_offest	= jQuery(window).scrollTop();
				if (window_offest > content_offset) {
					percent = 100 * (window_offest - content_offset) / (content_height - window_height);
				}
				jQuery('#reading-position-indicator').css('width', percent + '%');
			});
		});
	}
	
	/* My JS */
	 // tabbed content
    // http://www.entheosweb.com/tutorials/css/tabs.asp
    $(".tab-content").hide();
    $(".tab-content:first").show();

  /* if in tab mode */
    $(".tabs li").click(function() {
		
      $(".tab-content").hide();
      var activeTab = $(this).attr("rel"); 
      $("#"+activeTab).fadeIn();		
		
      $(".tabs li").removeClass("active");
      $(this).addClass("active");

	  $(".tab_drawer_heading").removeClass("d_active");
	  $(".tab_drawer_heading[rel^='"+activeTab+"']").addClass("d_active");
	  
    });
	/* if in drawer mode */
	$(".tab_drawer_heading").click(function() {
      
      $(".tab-content").hide();
      var d_activeTab = $(this).attr("rel"); 
      $("#"+d_activeTab).fadeIn();
	  
	  $(".tab_drawer_heading").removeClass("d_active");
      $(this).addClass("d_active");
	  
	  $(".tabs li").removeClass("active");
	  $(".tabs li[rel^='"+d_activeTab+"']").addClass("active");
    });
	
	
	/* Extra class "tab_last" 
	   to add border to right side
	   of last tab */
	$('.tabs li').last().addClass("tab_last");
	

// Fixed recipe category
// function fixDiv() {
//     var $div = $(".above-sidebar.full-width");
//     if ($(window).scrollTop() > $div.data("top")) { 
//         $('.above-sidebar.full-width').css({'position': 'fixed', 'top': '0', 'width': '100%'}); 
//     }
//     else {
//         $('.above-sidebar.full-width').css({'position': 'static', 'top': 'auto', 'width': '100%'});
//     }
// }

// $(".above-sidebar.full-width").data("top", $(".above-sidebar.full-width").offset().top); // set original position on load
// $(window).scroll(fixDiv);

 $('input.rating').rating('refresh', {
        showClear: false,
        showCaption: false
    });
  $('input').keypress(function(e) {
        if(e.which == 13) {
            jQuery(this).blur();
            jQuery('button').focus().click();
        }
    });

  	var maxLength = 350;
	$(".blog-char-limit p").each(function(){
		var myStr = $(this).text();
		if($.trim(myStr).length > maxLength){
			var newStr = myStr.substring(0, maxLength);
			var removedStr = myStr.substring(maxLength, $.trim(myStr).length);
			$(this).empty().html(newStr);
			$(this).append('...');
		}
	});

})(jQuery);