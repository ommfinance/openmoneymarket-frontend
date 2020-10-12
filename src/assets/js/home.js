/*
* Omm
* Home JS
* Version PROTOTYPE
* Last updated 9/10/20
*/

/* ==========================================================================
    Expand logic
========================================================================== */

$("#send-button-1").click(function(){
    $('#send-button-1').toggleClass("active");
    $("#wallet-expanded-1").slideToggle();
});