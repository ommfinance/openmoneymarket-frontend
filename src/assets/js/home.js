/*
* Omm
* Home JS
* Version PROTOTYPE
* Last updated 22/10/20
*/

/* ==========================================================================
    Asset expand logic
========================================================================== */

// Bridge

$("#asset-bridge").click(function(){
    $("#asset-bridge").toggleClass('active');
    $("#asset-bridge-expanded").slideToggle();
    // ICON
    $("#asset-icon-expanded").slideUp();
    $("#asset-icon").removeClass('active');

    // Disable supply adjust view
    if ($("#supply").hasClass("adjust")) {
        $('#supply').removeClass("adjust");
        $('.supply-actions').toggleClass("hide");
        $('#supply-deposited').prop('disabled', function(i, v) { return !v; });
        $('#supply-available').prop('disabled', function(i, v) { return !v; });
        bridgeSupplySlider.toggleAttribute('disabled');
        bridgeSupplySlider.noUiSlider.set(10000);
    }

    // Disable borrow adjust view
    if ($("#borrow").hasClass("adjust")) {
        $('#borrow').removeClass("adjust");
        $('.borrow-actions').toggleClass("hide");
        $('#borrow-borrowed').prop('disabled', function(i, v) { return !v; });
        $('#borrow-available').prop('disabled', function(i, v) { return !v; });
        bridgeBorrowSlider.toggleAttribute('disabled');
        bridgeBorrowSlider.noUiSlider.set(1500);
    }
});

// ICON

$("#asset-icon").click(function(){
    $("#asset-icon").toggleClass('active');
    $("#asset-icon-expanded").slideToggle();
    // Bridge
    $("#asset-bridge-expanded").slideUp();
    $("#asset-bridge").removeClass('active');

    // Disable supply adjust view
    if ($("#supply").hasClass("adjust")) {
        $('#supply').removeClass("adjust");
        $('.supply-actions').toggleClass("hide");
        $('#supply-deposited').prop('disabled', function(i, v) { return !v; });
        $('#supply-available').prop('disabled', function(i, v) { return !v; });
        bridgeSupplySlider.toggleAttribute('disabled');
        bridgeSupplySlider.noUiSlider.set(10000);
    }

    // Disable borrow adjust view
    if ($("#borrow").hasClass("adjust")) {
        $('#borrow').removeClass("adjust");
        $('.borrow-actions').toggleClass("hide");
        $('#borrow-borrowed').prop('disabled', function(i, v) { return !v; });
        $('#borrow-available').prop('disabled', function(i, v) { return !v; });
        bridgeBorrowSlider.toggleAttribute('disabled');
        bridgeBorrowSlider.noUiSlider.set(1500);
    }
});

/* ==========================================================================
    Toggle logic
========================================================================== */

// Your overview logic

$("#toggle-your-overview").click(function(){
    $("#toggle-your-overview").addClass('active');
    $("#toggle-market-overview").removeClass('active');
    $("#your-overview-content").show();
    $("#market-overview-content").hide();
});

// Market overview logic

$("#toggle-market-overview").click(function(){
    $("#toggle-your-overview").removeClass('active');
    $("#toggle-market-overview").addClass('active');
    $("#your-overview-content").hide();
    $("#market-overview-content").show();
});

// Your markets logic

$("#toggle-your-markets").click(function(){
    $("#toggle-your-markets").addClass('active');
    $("#toggle-all-markets").removeClass('active');
    $("#your-markets-list").show();
    $("#all-markets-list").hide();
});

// All markets logic

$("#toggle-all-markets").click(function(){
    $("#toggle-your-markets").removeClass('active');
    $("#toggle-all-markets").addClass('active');
    $("#your-markets-list").hide();
    $("#all-markets-list").show();

    // Your markets logic
    $("#asset-bridge-expanded").slideUp();
    $("#asset-bridge").removeClass('active');
    $("#asset-icon-expanded").slideUp();
    $("#asset-icon").removeClass('active');

    // Disable supply adjust view
    if ($("#supply").hasClass("adjust")) {
        $('#supply').removeClass("adjust");
        $('.supply-actions').toggleClass("hide");
        $('#supply-deposited').prop('disabled', function(i, v) { return !v; });
        $('#supply-available').prop('disabled', function(i, v) { return !v; });
        bridgeSupplySlider.toggleAttribute('disabled');
        bridgeSupplySlider.noUiSlider.set(10000);
    }

    // Disable borrow adjust view
    if ($("#borrow").hasClass("adjust")) {
        $('#borrow').removeClass("adjust");
        $('.borrow-actions').toggleClass("hide");
        $('#borrow-borrowed').prop('disabled', function(i, v) { return !v; });
        $('#borrow-available').prop('disabled', function(i, v) { return !v; });
        bridgeBorrowSlider.toggleAttribute('disabled');
        bridgeBorrowSlider.noUiSlider.set(1500);
    }

});

/* ==========================================================================
    Position manager sliders
========================================================================== */

// Bridge supply slider

var bridgeSupplySlider = document.getElementById('bridge-supply-slider');

noUiSlider.create(bridgeSupplySlider, {
    start: [10000],
    padding: [4545],
    connect: 'lower',
    tooltips: [wNumb({decimals: 0, thousand: ',', suffix: ' USDb'})],
    range: {
        'min': [0],
        'max': [15000]
    },
    format: wNumb({
        decimals: 0,
    })
});

// Bridge borrow slider

var bridgeBorrowSlider = document.getElementById('bridge-borrow-slider');

noUiSlider.create(bridgeBorrowSlider, {
    start: [1500],
    padding: [0],
    connect: 'lower',
    tooltips: [wNumb({decimals: 0, thousand: ',', suffix: ' USDb'})],
    range: {
        'min': [0],
        'max': [3300]
    },
    format: wNumb({
        decimals: 0,
    })
});

// Icon supply slider

var iconSupplySlider = document.getElementById('icon-supply-slider');

noUiSlider.create(iconSupplySlider, {
    start: [0],
    padding: [0],
    connect: 'lower',
    tooltips: [wNumb({decimals: 0, thousand: ',', suffix: ' USDb'})],
    range: {
        'min': [0],
        'max': [15000]
    },
    format: wNumb({
        decimals: 0,
    })
});

// Icon borrow slider

var iconBorrowSlider = document.getElementById('icon-borrow-slider');

noUiSlider.create(iconBorrowSlider, {
    start: [9480],
    padding: [0],
    connect: 'lower',
    tooltips: [wNumb({decimals: 0, thousand: ',', suffix: ' USDb'})],
    range: {
        'min': [0],
        'max': [16000]
    },
    format: wNumb({
        decimals: 0,
    })
});

// Risk slider

var riskRatio = document.getElementById('risk-slider');

noUiSlider.create(riskRatio, {
    start: [37],
    connect: 'lower',
    tooltips: [wNumb({decimals: 0, thousand: ',', suffix: '%'})],
    range: {
        'min': [0],
        'max': [100]
    },
});

/*
*
* Formats
*
*/

// %

var percentageFormat = wNumb({
    decimals: 0,
    suffix: '%'
});

// + .00

var prefixPlusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' + '
});

// ICX

var icxFormat = wNumb({
    decimals: 0,
    thousand: ',',
    suffix: ' ICX'
});

// USDb

var usdbFormat = wNumb({
    decimals: 0,
    thousand: ',',
    suffix: ' USDb'
});

// + USDb .00

var usdbPrefixPlusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' + ',
    suffix: ' USDb'
});

// - USDb .00

var usdbPrefixMinusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' - ',
    suffix: ' USDb'
});

// + OMM .00

var ommPrefixPlusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' + ',
    suffix: ' OMM'
});

// ICD

var icdFormat = wNumb({
    decimals: 0,
    thousand: ',',
    suffix: ' ICD'
});

// $

var usdFormat = wNumb({
    decimals: 0,
    thousand: ',',
    prefix: '$'
});

// $ .00

var usdTwoDecimalFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: '$'
});

// +$ .00

var usdTwoDecimalPlusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: '+$'
});

// -$ .00

var usdTwoDecimalMinusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: '-$'
});

// Position manager variables

var supplyDeposited = document.getElementById('supply-deposited');
var supplyAvailable = document.getElementById('supply-available');
var borrowBorrowed = document.getElementById('borrow-borrowed');
var borrowAvailable = document.getElementById('borrow-available');
var borrowAvailableRange = document.getElementById('borrow-limit');
var supplyRewards = document.getElementById('supply-rewards');

/*
*
* Bridge supply slider
*
*/

bridgeSupplySlider.noUiSlider.on('update', function (values, handle) {

    // Supply deposited / available text boxes
    supplyDeposited.value = usdbFormat.to(values[handle] * 1);
    $('.supply-deposited-dollar').text(usdFormat.to(values[handle] * 1));
    supplyAvailable.value = usdbFormat.to(15000 - usdbFormat.from(supplyDeposited.value));

    // Supply interest
	$('.supply-interest').text(usdbPrefixPlusFormat.to((values[handle] * 1) * 0.0647 / 365));
    $('.supply-interest-dollar').text(usdTwoDecimalPlusFormat.to((values[handle] * 1) * 0.0647 / 365));

    // Supply rewards
	$('#supply-rewards').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.447 / 365));
    $('.supply-rewards-total').text(prefixPlusFormat.to(((values[handle] * 1) * 0.447 / 365) + 4.74));

    // Position supply
	$('.position-supply').text(usdFormat.to(values[handle] * 1));

    // Position borrow limit
	$('#position-borrow-limit').text(usdFormat.to(values[handle] * 1 + 10000));

    // Risk ratio
    riskRatio.noUiSlider.set(1 / ((usdbFormat.from(supplyDeposited.value) * 0.66) / usdbFormat.from(borrowBorrowed.value)) * 100);

    // Update risk percentage
    $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(supplyDeposited.value) * 0.66) / usdbFormat.from(borrowBorrowed.value)) * 100));

    // Update borrow limit
    borrowAvailable.value = (usdbFormat.to((usdbFormat.from(supplyDeposited.value) * 0.33) - 1500));

    // Update borrow range
    //updateBorrowRange(parseFloat(values[handle] * 0.33 - usdbFormat.from(borrowAvailable.value)));

});

// Update borrow range

function updateBorrowRange(borrowLimit){
    bridgeBorrowSlider.noUiSlider.updateOptions({
        range: {
            'min': 0,
            'max': borrowLimit
        }
    });
};

/*
*
* Bridge borrow sliders
*
*/

// Bridge borrow slider updates the borrow borrowed editbox

bridgeBorrowSlider.noUiSlider.on('update', function (values, handle) {

    // Bridge borrow text boxes
    borrowBorrowed.value = usdbFormat.to(values[handle] * 1);
    $('.borrow-borrowed-dollar').text(usdFormat.to(values[handle] * 1));
    borrowAvailable.value = (usdbFormat.to(3300 - values[handle]));

    // Supply interest
	$('#borrow-interest').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));
    $('.borrow-interest-dollar').text(usdTwoDecimalMinusFormat.to(((values[handle] * 1) * 0.0725 / 365) + 0.12));

    // Supply rewards
	$('#borrow-rewards').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));

    // Position borrow
	$('.position-borrow').text(usdFormat.to((values[handle] * 1) + 1212));

    // Risk ratio
    riskRatio.noUiSlider.set(1 / ((usdbFormat.from(supplyDeposited.value) * 0.66) / usdbFormat.from(borrowBorrowed.value)) * 100);

    // Update risk percentage
    $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(supplyDeposited.value) * 0.66) / usdbFormat.from(borrowBorrowed.value)) * 100));

    // Adjust locked indicator for collateral
    document.getElementById("locked").style.left = (23 * (usdbFormat.from(borrowBorrowed.value) / 2053)) + "%";

});

/* ==========================================================================
	Position manager logic
========================================================================== */

// supply adjust logic

$(".supply-adjust").click(function(){
    $('#supply').toggleClass("adjust");
    $('.supply-actions').toggleClass("hide");
    $('#supply-deposited').prop('disabled', function(i, v) { return !v; });
    $('#supply-available').prop('disabled', function(i, v) { return !v; });
    bridgeSupplySlider.toggleAttribute('disabled');
    bridgeSupplySlider.noUiSlider.set(10000);

    if ($("#borrow").hasClass("adjust")) {

        $('#borrow').removeClass("adjust");
        $('.borrow-actions').toggleClass("hide");
        $('#borrow-borrowed').prop('disabled', function(i, v) { return !v; });
        $('#borrow-available').prop('disabled', function(i, v) { return !v; });
        bridgeBorrowSlider.toggleAttribute('disabled');
        bridgeBorrowSlider.noUiSlider.set(1500);
    }

});

// Borrow adjust logic

$(".borrow-adjust").click(function(){
    $('#borrow').toggleClass("adjust");
    $('.borrow-actions').toggleClass("hide");
    $('#borrow-borrowed').prop('disabled', function(i, v) { return !v; });
    $('#borrow-available').prop('disabled', function(i, v) { return !v; });
    bridgeBorrowSlider.toggleAttribute('disabled');
    bridgeBorrowSlider.noUiSlider.set(1500);

    if ($("#supply").hasClass("adjust")) {

        $('#supply').removeClass("adjust");
        $('.supply-actions').toggleClass("hide");
        $('#supply-deposited').prop('disabled', function(i, v) { return !v; });
        $('#supply-available').prop('disabled', function(i, v) { return !v; });
        bridgeSupplySlider.toggleAttribute('disabled');
        bridgeSupplySlider.noUiSlider.set(10000);

    }

});
