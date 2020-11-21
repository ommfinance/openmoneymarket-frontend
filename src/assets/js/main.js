/*
* Omm
* Home JS
* Version PROTOTYPE
* Last updated 22/10/20
*/

/* ==========================================================================
    Replace all SVG images with class "svg" to inline SVG (For hover styles)
========================================================================== */

$(function(){
    jQuery('img.svg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
    
        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Check if the viewport is set, else we gonna set it if we can.
            if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, 'xml');

    });
});

/* ==========================================================================
    Prevent hashlink jump
========================================================================== */

( function( $ ) {
   $( 'a[href="#"]' ).click( function(e) {
      e.preventDefault();
   } );
} )( jQuery );

/* ==========================================================================
    Header tooltips
========================================================================== */

// Wallet tooltip

$(".profile").click(function(){
    $('#notifications-tooltip').removeClass("active");
    $('.notifications').removeClass("active");
    $('#profile-tooltip').toggleClass("active");
    $('.profile').toggleClass("active");
});

// On "main" click, hide header tooltips

$('main').click(function () {
    $('#notifications-tooltip').removeClass("active");
    $('.notifications').removeClass("active");
    $('#profile-tooltip').removeClass("active");
    $('.profile').removeClass("active");
});

/* ==========================================================================
    Modal logic
========================================================================== */

var ModalEffects = (function() {

    function init() {

        var overlay = document.querySelector( '.modal-overlay' );

        [].slice.call( document.querySelectorAll( '.modal-trigger' ) ).forEach( function( el, i ) {

            var modal = document.querySelector( '#' + el.getAttribute( 'data-modal' ) ),
                close = modal.querySelector( '.modal-close' );

            function removeModal( hasPerspective ) {
                classie.remove( modal, 'modal-show' );

                if( hasPerspective ) {
                    classie.remove( document.documentElement, 'md-perspective' );
                }
            }

            function removeModalHandler() {
                removeModal( classie.has( el, 'md-setperspective' ) ); 
            }

            el.addEventListener( 'click', function( ev ) {
                classie.add( modal, 'modal-show' );
                overlay.removeEventListener( 'click', removeModalHandler );
                overlay.addEventListener( 'click', removeModalHandler );
            });

            close.addEventListener( 'click', function( ev ) {
                ev.stopPropagation();
                removeModalHandler();
            });

        } );

    }

    init();

})();