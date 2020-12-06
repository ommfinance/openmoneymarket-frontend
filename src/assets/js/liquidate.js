/*
* Omm
* Liquidate JS
* Version PROTOTYPE
* Last updated 30/11/20
*/

/* ==========================================================================
    Liquidate expand logic
========================================================================== */

// Liquidation 1

$("#liquidation-1").click(function(){
    // Liquidation 1
    $("#liquidation-1").toggleClass('active');
    $("#liquidation-1-expanded").slideToggle();

    // Liquidation 2
    $("#liquidation-2").removeClass('active');
    $("#liquidation-2-expanded").slideUp();

    // Liquidation 3
    $("#liquidation-3").removeClass('active');
    $("#liquidation-3-expanded").slideUp();
});

// Liquidation 2

$("#liquidation-2").click(function(){
    // Liquidation 1
    $("#liquidation-1").removeClass('active');
    $("#liquidation-1-expanded").slideUp();

    // Liquidation 2
    $("#liquidation-2").toggleClass('active');
    $("#liquidation-2-expanded").slideToggle();

    // Liquidation 3
    $("#liquidation-3").removeClass('active');
    $("#liquidation-3-expanded").slideUp();
});

// Liquidation 3

$("#liquidation-3").click(function(){
    // Liquidation 1
    $("#liquidation-1").removeClass('active');
    $("#liquidation-1-expanded").slideUp();

    // Liquidation 2
    $("#liquidation-2").removeClass('active');
    $("#liquidation-2-expanded").slideUp();

    // Liquidation 3
    $("#liquidation-3").toggleClass('active');
    $("#liquidation-3-expanded").slideToggle();
});