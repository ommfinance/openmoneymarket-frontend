/*
* Omm
* Vote JS
* Version PROTOTYPE
* Last updated 30/11/20
*/

/* ==========================================================================
    Formats
========================================================================== */

// No format

var noFormat = wNumb({
    decimals: 0,
    thousand: ',',
});

/* ==========================================================================
    Vote sliders
========================================================================== */

// Stake slider

var stakeSlider = document.getElementById('stake-slider');

noUiSlider.create(stakeSlider, {
    start: [100],
    connect: 'lower',
    range: {
        'min': [0],
        'max': [150]
    },
});

// On Stake slider update

stakeSlider.noUiSlider.on('update', function (values, handle) {
    // Update the stake amount
    $('.omm-stake-amount').text(noFormat.to(values[handle] * 1));
});