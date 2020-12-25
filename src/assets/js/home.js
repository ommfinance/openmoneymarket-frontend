/*
* Omm
* Home JS
* Version 1.0
* Last updated 10/12/20
*/

/* ==========================================================================
    1.0) On load logic
========================================================================== */

$(document).ready(function() {

    //
    // Initialize cookies
    //

    if (!Cookies.get('supplied-icx')) {
        Cookies.set('wallet-usdb', 15000);
        Cookies.set('supplied-usdb', 0);
        Cookies.set('borrowed-usdb', 0);
        Cookies.set('wallet-icx', 0);
        Cookies.set('supplied-icx', 0);
        Cookies.set('borrowed-icx', 0);
        location.reload();
    };

    //
    // Set values
    //

    // Total values
    $('.value-supplied-total').text(usdFormat.to(parseFloat(Cookies.get('supplied-usdb')) + parseFloat(Cookies.get('supplied-icx'))));
    $('.value-borrowed-total').text(usdFormat.to(parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))));
    $('.value-risk-total').text(percentageFormat.to(((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) + parseFloat(Cookies.get('supplied-icx'))) * 0.66)) * 100));
    $('.value-supply-interest-total').text(usdTwoDecimalPlusFormat.to(inputSupplyUsdb.value * 0.0647 / 365));
    $('.value-borrow-interest-total').text(usdTwoDecimalMinusFormat.to(inputBorrowUsdb.value * 0.0725 / 365));
    $('.value-rewards-total').text(prefixPlusFormat.to(inputSupplyUsdb.value * 0.447 / 365));

    // Bridge values
    $('.value-supplied-usdb').text(usdbFormat.to(parseFloat(Cookies.get('supplied-usdb'))));
    $('.value-borrowed-usdb').text(usdbFormat.to(parseFloat(Cookies.get('borrowed-usdb'))));
    $('.value-supplied-usdb-dollar').text(usdFormat.to(parseFloat(Cookies.get('supplied-usdb'))));
    $('.value-borrowed-usdb-dollar').text(usdFormat.to(parseFloat(Cookies.get('borrowed-usdb'))));

    // ICON values
    $('.value-supplied-icx').text(icxFormat.to(parseFloat(Cookies.get('supplied-icx'))));
    $('.value-borrowed-icx').text(icxFormat.to(parseFloat(Cookies.get('borrowed-icx'))));
    $('.value-supplied-icx-dollar').text(usdFormat.to(parseFloat(Cookies.get('supplied-icx'))));
    $('.value-borrowed-icx-dollar').text(usdFormat.to(parseFloat(Cookies.get('borrowed-icx'))));

    //
    // Cookie logic
    //

    //
    // Combination logic
    //

    // If USDb & ICX supply = 0
    if (parseFloat(Cookies.get('supplied-usdb')) == 0 && parseFloat(Cookies.get('supplied-icx')) == 0) {

        // Hide Performance and Risk
        $('.performance-risk').css("display", "none");

        // Hide risk from borrow container
        $('.risk-outer').css("display", "none");

        // Hide borrow button
        $('.button.borrow-adjust').css("display", "none");

        // Hide table headers
        $("#all-markets-header").css("display", "none");
        $("#your-markets-header").css("display", "none");

        // Hide markets
        $('.asset').css("display", "none");

        // Show available assets
        $('.available-to-supply').css("display", "table-row");

        // Block borrowing
        $('.borrow-deny').css("display", "block");
        $('.borrow-allow').css("display", "none");

        // Set values to 0%
        $('.value-risk-total').text("0%");
        $('.value-supplied-apy').text("0%");
    };

    // If USDb & ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {

        // Hide risk data
        $('.risk-container').css("display", "none");

        // Show risk message
        $('.risk-message-noassets').css("display", "block");

        // Set values to 0%
        $('.value-risk-total').text("0%");
    };

    // If USDb or ICX borrow is greater than 0
    if (parseFloat(Cookies.get('borrowed-usdb')) > 0 || parseFloat(Cookies.get('borrowed-icx')) > 0) {

        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
    };

    //
    // Bridge Dollars (USDb)
    //

    // If USDb wallet = 0 
    if (parseFloat(Cookies.get('wallet-usdb')) == 0) {

        // Block supplying
        $('.supply-allow.usdb').css("display", "none");
        $('.supply-deny.usdb').css("display", "block");
    };

    // If USDb wallet does not = 0 & Supply = 0
    if (parseFloat(Cookies.get('wallet-usdb')) !== 0 && parseFloat(Cookies.get('supplied-usdb')) == 0) {

        // Show USDb as an available asset
        $('.usdb.asset-available').css("display", "table-row");
    };

    // If USDb supply = 0
    if (parseFloat(Cookies.get('supplied-usdb')) == 0) {

        // Change USDb button text to "Supply"
        $('.button.supply-adjust.usdb').text("Supply");
    };

    // If USDb supply does not = 0
    if (parseFloat(Cookies.get('supplied-usdb')) !== 0) {
        // Set APY
        $('.value-supplied-apy').text("6.47%");

        // Hide available
        $('.usdb.asset-available').css("display", "none");
    };

    // If USDb supply = max
    if (parseFloat(Cookies.get('supplied-usdb')) == parseFloat(Cookies.get('wallet-usdb'))) {

        // Change button label to "Withdraw"
        $('.button.supply-adjust.usdb').text("Withdraw");
    };

    // If USDb borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0) {

        // Change button label to "Borrow"
        $('.button.borrow-adjust.usdb').text("Borrow");
    };

    // If USDb borrow does not = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) !== 0) {

        // Set APY
        $('.value-borrowed-apy').text("7.25%");
    };

    //
    // ICON (ICX)
    //

    // If ICX wallet = 0 
    if (parseFloat(Cookies.get('wallet-icx')) == 0) {
        // Deny ICX
        $('.supply-allow.icx').css("display", "none");
        // Show available
        $('.supply-deny.icx').css("display", "block");
    };



    // If ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-icx')) == 0) {

        // Change button label to "Borrow"
        $('.button.borrow-adjust.icx').text("Borrow");
    };

    //
    // Asset logic
    //

    // If USDb supply or borrow does not = 0
    if (parseFloat(Cookies.get('supplied-usdb')) !== 0 || parseFloat(Cookies.get('borrowed-usdb')) !== 0) {
        // Hide available usdb version
        $('.usdb.asset-available').css("display", "none");
        // Show your usdb version
        $('.usdb.your').css("display", "table-row");
    };
    // If USDb wallet, supply, and borrow = 0
    if (parseFloat(Cookies.get('wallet-usdb')) == 0 && parseFloat(Cookies.get('supplied-usdb')) == 0 && parseFloat(Cookies.get('borrowed-usdb')) == 0) {
        // Hide all USDb versions
        $('.usdb.asset').css("display", "none");
    };
    // If USDb wallet does not = 0, and Supply = 0, and Borrow = 0 ()
    if (parseFloat(Cookies.get('wallet-usdb')) !== 0 && parseFloat(Cookies.get('supplied-usdb')) == 0 && parseFloat(Cookies.get('borrowed-usdb')) == 0) {
        // Show available usdb version
        $('.usdb.asset-available').css("display", "table-row");
        // Hide your usdb version
        $('.usdb.your').css("display", "none");
    };

    // If ICX wallet does not = 0, and Supply = 0, and Borrow = 0 ()
    if (parseFloat(Cookies.get('wallet-icx')) !== 0 && parseFloat(Cookies.get('supplied-icx')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {
        // Show available ICX version
        $('.icx.asset-available').css("display", "table-row");
        // Hide your ICX version
        $('.icx.your').css("display", "none");
    };
    // If ICX supply or borrow does not = 0
    if (parseFloat(Cookies.get('supplied-icx')) !== 0 || parseFloat(Cookies.get('borrowed-icx')) !== 0) {
        // Hide available ICX version
        $('.icx.asset-available').css("display", "none");
        // Show your ICX version
        $('.icx.your').css("display", "table-row");
    };
    // If ICX wallet, supply, and borrow = 0
    if (parseFloat(Cookies.get('wallet-icx')) == 0 && parseFloat(Cookies.get('supplied-icx')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {
        // Hide all ICX versions
        $('.icx.asset').css("display", "none");
    };

    // If USDb and ICX supply = 0
    if (parseFloat(Cookies.get('supplied-usdb')) == 0 && parseFloat(Cookies.get('supplied-icx')) == 0) {
        // Hide available ICX version
        $(".available-to-supply").css("display", "table-row");

        $(".value-supplied-total").text("—");
        $('.value-supplied-total').css("opacity", "0.5");
        $(".value-supplied-apy").text("—");
        $('.value-supplied-apy').css("opacity", "0.5");
    };

    // If USDb and ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {
        $(".value-borrowed-total").text("—");
        $('.value-borrowed-total').css("opacity", "0.5");
        $(".value-borrowed-apy").text("—");
        $('.value-borrowed-apy').css("opacity", "0.5");
    };

    if (parseFloat(Cookies.get('borrowed-usdb')) == 0) {
        $('.value-borrow-interest-total').text("—");
        $('.value-borrow-interest-total').css("opacity", "0.5");

        $('.value-borrowed-usdb-dollar').text("—");
        $('.value-borrowed-usdb-dollar').css("opacity", "0.5");

        $('.value-borrowed-usdb').text("—");
        $('.value-borrowed-usdb').css("opacity", "0.5");

        $('.borrow-interest-container').css("display", "none");
    };

    if (parseFloat(Cookies.get('supplied-icx')) == 0) {
        $('.value-supplied-icx').text("—");
        $('.value-supplied-icx').css("opacity", "0.5");

        $('.value-supplied-icx-dollar').text("—");
        $('.value-supplied-icx-dollar').css("opacity", "0.5");
    };

    // If USDb & ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {

        // Hide risk data
        $('.risk-container').css("display", "none");

        // Show risk message
        $('.risk-message-noassets').css("display", "block");

        // Set values to 0%
        $('.value-risk-total').text("0%");

    };

    // If borrowed ICX
    if (parseFloat(Cookies.get('borrowed-icx')) !== 0) {
        $('.button.supply-adjust.icx').text("Adjust");

        // Set APYborrow-interest-container
        $('.value-borrowed-apy').text("5.11%");

        // Set APY
        $('.borrow-interest-container').css("display", "block");
        $('.value-borrow-interest-total').text(usdTwoDecimalMinusFormat.to(inputBorrowIcx.value * 0.0725 / 365));
        $('.value-borrow-interest-total').css("opacity", "1");
    };

});

/* ==========================================================================
    Toggle logic
========================================================================== */

//
// Overview toggle
//

// On "Your overview" click
$("#toggle-your-overview").click(function(){
    $("#toggle-your-overview").addClass('active');
    $("#toggle-market-overview").removeClass('active');
    $("#your-overview-content").show();
    $("#market-overview-content").hide();
});

// On "Market overview" click
$("#toggle-market-overview").click(function(){
    $("#toggle-your-overview").removeClass('active');
    $("#toggle-market-overview").addClass('active');
    $("#your-overview-content").hide();
    $('#market-overview-content').css("display", "flex");
});

//
// Market toggle
//

// On "Your markets" click
$("#toggle-your-markets").click(function(){

    // If USDb and ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {

        // show risk data
        $('.risk-container').css("display", "none");

        // Hide risk message
        $('.risk-message-noassets').css("display", "block");
    };
    // If USDb or ICX borrow is greater than 0
    if (parseFloat(Cookies.get('borrowed-usdb')) > 0 || parseFloat(Cookies.get('borrowed-icx')) > 0) {

        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
    };

    //
    // Toggles
    //

    // Active toggle
    $("#toggle-your-markets").addClass('active');
    $("#toggle-all-markets").removeClass('active');
    $("#all-markets-header").css("display", "none");
    $("#your-markets-header").css("display", "table-row");

    // If USDb & ICX supply = 0
    if (parseFloat(Cookies.get('supplied-usdb')) == 0 && parseFloat(Cookies.get('supplied-icx')) == 0) {
        $("#your-markets-header").css("display", "none");
    };

    // Collapse USDb table
    $(".asset.usdb").removeClass('active');
    $(".market-usdb-expanded").hide();

    // Collapse ICX table
    $(".asset.icx").removeClass('active');
    $(".market-icx-expanded").hide();

    //
    // Asset logic
    //

    // Hide "All market" table data
    $('.asset.all').css("display", "none");

    // If USDb supply or borrow does not = 0
    if (parseFloat(Cookies.get('supplied-usdb')) !== 0 || parseFloat(Cookies.get('borrowed-usdb')) !== 0) {
        // Hide available usdb version
        $('.usdb.asset-available').css("display", "none");
        // Show your usdb version
        $('.usdb.your').css("display", "table-row");
    };
    // If USDb wallet, supply, and borrow = 0
    if (parseFloat(Cookies.get('wallet-usdb')) == 0 && parseFloat(Cookies.get('supplied-usdb')) == 0 && parseFloat(Cookies.get('borrowed-usdb')) == 0) {
        // Hide all USDb versions
        $('.usdb.asset').css("display", "none");
    };
    // If USDb wallet does not = 0, and Supply = 0, and Borrow = 0
    if (parseFloat(Cookies.get('wallet-usdb')) !== 0 && parseFloat(Cookies.get('supplied-usdb')) == 0 && parseFloat(Cookies.get('borrowed-usdb')) == 0) {
        // Show available usdb version
        $('.usdb.asset-available').css("display", "table-row");
        // Hide your usdb version
        $('.usdb.your').css("display", "none");
    };

    // If ICX wallet does not = 0, and Supply = 0, and Borrow = 0
    if (parseFloat(Cookies.get('wallet-icx')) !== 0 && parseFloat(Cookies.get('supplied-icx')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {
        // Show available ICX version
        $('.icx.asset-available').css("display", "table-row");
        // Hide your ICX version
        $('.icx.your').css("display", "none");
    };
    // If ICX supply or borrow does not = 0
    if (parseFloat(Cookies.get('supplied-icx')) !== 0 || parseFloat(Cookies.get('borrowed-icx')) !== 0) {
        // Hide available ICX version
        $('.icx.asset-available').css("display", "none");
        // Show your ICX version
        $('.icx.your').css("display", "table-row");
    };
    // If ICX wallet, supply, and borrow = 0
    if (parseFloat(Cookies.get('wallet-icx')) == 0 && parseFloat(Cookies.get('supplied-icx')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {
        // Hide all ICX versions
        $('.icx.asset').css("display", "none");
    };

    // If USDb and ICX supply = 0
    if (parseFloat(Cookies.get('supplied-usdb')) == 0 && parseFloat(Cookies.get('supplied-icx')) == 0) {
        // Hide available ICX version
        $(".available-to-supply").css("display", "table-row");
    };

    //
    // Set everything to default
    //

    // Remove adjust class
    $('.supply').removeClass("adjust");
    $('.borrow').removeClass("adjust");

    // Show default actions
    $('.supply-actions.actions-1').removeClass("hide");
    $('.supply-actions.actions-2').addClass("hide");
    $('.borrow-actions.actions-1').removeClass("hide");
    $('.borrow-actions.actions-2').addClass("hide");

    // Disable USDb supply sliders (Your markets)
    sliderSupplyUsdb.noUiSlider.set(Cookies.get('supplied-usdb'));
    sliderSupplyUsdb.setAttribute("disabled", "");

    // Disable USDb borrow sliders (Your markets)
    sliderBorrowUsdb.noUiSlider.set(Cookies.get('borrowed-usdb'));
    sliderBorrowUsdb.setAttribute("disabled", "");

    // Disable ICX borrow sliders (Your markets)
    sliderSupplyIcx.noUiSlider.set(Cookies.get('supplied-icx'));
    sliderSupplyIcx.setAttribute("disabled", "");

    // Disable ICX borrow sliders (Your markets)
    sliderBorrowIcx.noUiSlider.set(Cookies.get('borrowed-icx'));
    sliderBorrowIcx.setAttribute("disabled", "");

    // Disable USDb inputs (Your markets)
    $('#input-supply-usdb').setAttribute('disabled');
    $('#input-supply-available-usdb').setAttribute('disabled');
    $('#input-borrow-usdb').setAttribute('disabled');
    $('#input-borrow-available-usdb').setAttribute('disabled');

    // Disable ICX inputs (All markets)
    $('#input-borrow-icx').setAttribute('disabled');
    $('#input-borrow-available-icx').setAttribute('disabled');
});

// On "All markets" click
$("#toggle-all-markets").click(function(){

    // If USDb and ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {

        // show risk data
        $('.risk-container').css("display", "none");

        // Hide risk message
        $('.risk-message-noassets').css("display", "block");
    };
    // If USDb or ICX borrow is greater than 0
    if (parseFloat(Cookies.get('borrowed-usdb')) > 0 || parseFloat(Cookies.get('borrowed-icx')) > 0) {

        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
    };

    //
    // Toggles
    //

    // Active toggle
    $("#toggle-all-markets").addClass('active');
    $("#toggle-your-markets").removeClass('active');
    $("#your-markets-header").css("display", "none");
    $("#all-markets-header").css("display", "table-row");
    $(".available-to-supply").css("display", "none");

    // Collapse USDb table
    $(".asset.usdb").removeClass('active');
    $(".market-usdb-expanded").hide();

    // Collapse ICX table
    $(".asset.icx").removeClass('active');
    $(".market-icx-expanded").hide();

    //
    // Asset logic
    //

    // Hide available assets data
    $('.asset-available').css("display", "none");
    $('.asset.your').css("display", "none");

    // Show "All market" table data
    $('.asset.all').css("display", "table-row");

    //
    // Set everything to default
    //

    // Remove adjust class
    $('.supply').removeClass("adjust");
    $('.borrow').removeClass("adjust");

    // Show default actions
    $('.supply-actions.actions-1').removeClass("hide");
    $('.supply-actions.actions-2').addClass("hide");
    $('.borrow-actions.actions-1').removeClass("hide");
    $('.borrow-actions.actions-2').addClass("hide");

    // Disable USDb supply sliders (Your markets)
    sliderSupplyUsdb.noUiSlider.set(Cookies.get('supplied-usdb'));
    sliderSupplyUsdb.setAttribute("disabled", "");

    // Disable USDb borrow sliders (Your markets)
    sliderBorrowUsdb.noUiSlider.set(Cookies.get('borrowed-usdb'));
    sliderBorrowUsdb.setAttribute("disabled", "");

    // Disable ICX borrow sliders (Your markets)
    sliderSupplyIcx.noUiSlider.set(Cookies.get('supplied-icx'));
    sliderSupplyIcx.setAttribute("disabled", "");

    // Disable ICX borrow sliders (Your markets)
    sliderBorrowIcx.noUiSlider.set(Cookies.get('borrowed-icx'));
    sliderBorrowIcx.setAttribute("disabled", "");

    // Disable USDb inputs (Your markets)
    $('#input-supply-usdb').setAttribute('disabled');
    $('#input-supply-available-usdb').setAttribute('disabled');
    $('#input-borrow-usdb').setAttribute('disabled');
    $('#input-borrow-available-usdb').setAttribute('disabled');

    // Disable ICX inputs (All markets)
    $('#input-borrow-icx').setAttribute('disabled');
    $('#input-borrow-available-icx').setAttribute('disabled');
});

// On "Bridge wallet" click
$(function() {
    $(".wallet.bridge").on("click", function(e) {
        $(".wallet.bridge").addClass("active");
        $(".wallet-content.bridge").addClass("active");
        e.stopPropagation()
    });
    $(document).on("click", function(e) {
        if ($(e.target).is(".wallet.bridge") === false) {
            $(".wallet.bridge").removeClass("active");
            $(".wallet-content.bridge").removeClass("active");
        }
    });
});

// On "Bridge wallet" click
$(function() {
    $("#time-selector").on("click", function(e) {
        $("#time-selector").addClass("active");
        $(".time-selector-content").addClass("active");
        e.stopPropagation()
    });
    $(document).on("click", function(e) {
        if ($(e.target).is("#time-selector") === false) {
            $("#time-selector").removeClass("active");
            $(".time-selector-content").removeClass("active");
        }
    });
});

// On "Notification" click
$(".notification-trigger").click(function() {
    $('.notification').toggleClass('active');
});

// On "ICON wallet" click
$(".wallet.icon").click(function() {
    $('.wallet-content.icon').toggleClass('active');
});

/* ==========================================================================
    Asset expand logic
========================================================================== */

// On "Bridge Dollars" click
$(".asset.usdb").click(function() {

    //
    // Layout
    //

    // Expand USDb table
    $(".asset.usdb").toggleClass('active');
    $(".market-usdb-expanded").slideToggle();

    // Collapse ICX table
    $(".asset.icx").removeClass('active');
    $(".market-icx-expanded").slideUp();

    //
    // Set everything to default
    //

    // Remove adjust class
    $('.supply').removeClass("adjust");
    $('.borrow').removeClass("adjust");

    // Show default actions
    $('.actions-1').removeClass("hide");
    $('.actions-2').addClass("hide");

    // Disable USDb supply sliders (Your markets)
    sliderSupplyUsdb.noUiSlider.set(Cookies.get('supplied-usdb'));
    sliderSupplyUsdb.setAttribute("disabled", "");

    // Disable USDb borrow sliders (Your markets)
    sliderBorrowUsdb.noUiSlider.set(Cookies.get('borrowed-usdb'));
    sliderBorrowUsdb.setAttribute("disabled", "");

    // Disable ICX supply sliders
    sliderSupplyIcx.noUiSlider.set(Cookies.get('supplied-icx'));
    sliderSupplyIcx.setAttribute("disabled", "");

    // Disable ICX borrow sliders  (Your markets)
    sliderBorrowIcx.noUiSlider.set(Cookies.get('borrowed-icx'));
    sliderBorrowIcx.setAttribute("disabled", "");

    // Disable USDb inputs
    $('#input-supply-usdb').attr('disabled', 'disabled');
    $('#input-supply-available-usdb').attr('disabled', 'disabled');
    $('#input-borrow-usdb').attr('disabled', 'disabled');
    $('#input-borrow-available-usdb').attr('disabled', 'disabled');

    // Disable ICX inputs
    $('#input-supply-icx').attr('disabled', 'disabled');
    $('#input-supply-available-icx').attr('disabled', 'disabled');
    $('#input-borrow-icx').attr('disabled', 'disabled');
    $('#input-borrow-available-icx').attr('disabled', 'disabled');

    // If USDb and ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {

        // show risk data
        $('.risk-container').css("display", "none");

        // Hide risk message
        $('.risk-message-noassets').css("display", "block");
    };

    // If USDb or ICX borrow is greater than 0
    if (parseFloat(Cookies.get('borrowed-usdb')) > 0 || parseFloat(Cookies.get('borrowed-icx')) > 0) {

        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
    };
});

// On "ICON" click
$(".asset.icx").click(function() {

    //
    // Layout
    //

    // Collapse USDb table
    $(".asset.usdb").removeClass('active');
    $(".market-usdb-expanded").slideUp();

    // Expand ICX table
    $(".asset.icx").toggleClass('active');
    $(".market-icx-expanded").slideToggle();

    //
    // Set everything to default
    //

    // Remove adjust class
    $('.supply').removeClass("adjust");
    $('.borrow').removeClass("adjust");

    // Show default actions
    $('.actions-1').removeClass("hide");
    $('.actions-2').addClass("hide");

    // Disable USDb supply sliders
    sliderSupplyUsdb.noUiSlider.set(Cookies.get('supplied-usdb'));
    sliderSupplyUsdb.setAttribute("disabled", "");

    // Disable USDb borrow sliders
    sliderBorrowUsdb.noUiSlider.set(Cookies.get('borrowed-usdb'));
    sliderBorrowUsdb.setAttribute("disabled", "");

    // Disable ICX supply sliders
    sliderSupplyIcx.noUiSlider.set(Cookies.get('supplied-icx'));
    sliderSupplyIcx.setAttribute("disabled", "");

    // Disable ICX borrow sliders
    sliderBorrowIcx.noUiSlider.set(Cookies.get('borrowed-icx'));
    sliderBorrowIcx.setAttribute("disabled", "");

    // Disable USDb inputs
    $('#input-supply-usdb').attr('disabled', 'disabled');
    $('#input-supply-available-usdb').attr('disabled', 'disabled');
    $('#input-borrow-usdb').attr('disabled', 'disabled');
    $('#input-borrow-available-usdb').attr('disabled', 'disabled');

    // Disable ICX inputs
    $('#input-supply-icx').attr('disabled', 'disabled');
    $('#input-supply-available-icx').attr('disabled', 'disabled');
    $('#input-borrow-icx').attr('disabled', 'disabled');
    $('#input-borrow-available-icx').attr('disabled', 'disabled');

    // If USDb and ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {

        // show risk data
        $('.risk-container').css("display", "none");

        // Hide risk message
        $('.risk-message-noassets').css("display", "block");
    };

    // If USDb or ICX borrow is greater than 0
    if (parseFloat(Cookies.get('borrowed-usdb')) > 0 || parseFloat(Cookies.get('borrowed-icx')) > 0) {

        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
    };
});

/* ==========================================================================
    Adjust logic
========================================================================== */

//
// Supply adjust
//

$(".supply-adjust").click(function(){
    // Setup actions
    $('.supply').addClass("adjust");
    $('.borrow').removeClass("adjust");
    $('.supply-actions.actions-1').addClass("hide");
    $('.supply-actions.actions-2').removeClass("hide");
    $('.borrow-actions.actions-1').removeClass("hide");
    $('.borrow-actions.actions-2').addClass("hide");

    // Reset Borrow sliders
    sliderBorrowUsdb.noUiSlider.set(Cookies.get('borrowed-usdb'));
    sliderBorrowUsdb.setAttribute("disabled", "");
    sliderBorrowIcx.noUiSlider.set(Cookies.get('borrowed-icx'));
    sliderBorrowIcx.setAttribute("disabled", "");

    // Reset Borrow inputs
    $('#input-borrow-usdb').attr('disabled', 'disabled');
    $('#input-borrow-available-usdb').attr('disabled', 'disabled');
    $('#input-borrow-icx').attr('disabled', 'disabled');
    $('#input-borrow-available-icx').attr('disabled', 'disabled');

    // Enable Supply USDb
    $('#input-supply-usdb').removeAttr("disabled");
    $('#input-supply-available-usdb').removeAttr("disabled");
    $('#slider-supply-usdb').removeAttr("disabled");
    sliderSupplyUsdb.noUiSlider.set(Cookies.get('supplied-usdb'));

    // Enable Supply ICX
    $('#input-supply-icx').removeAttr("disabled");
    $('#input-supply-available-icx').removeAttr("disabled");
    $('#slider-supply-icx').removeAttr("disabled");
    sliderSupplyIcx.noUiSlider.set(Cookies.get('supplied-icx'));

    // If USDb and ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {

        // show risk data
        $('.risk-container').css("display", "none");

        // Hide risk message
        $('.risk-message-noassets').css("display", "block");
    };

    // If USDb or ICX borrow is greater than 0
    if (parseFloat(Cookies.get('borrowed-usdb')) > 0 || parseFloat(Cookies.get('borrowed-icx')) > 0) {

        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
    };
});

//
// Borrow adjust
//

$(".borrow-adjust").click(function(){
    // Setup actions
    $('.borrow').addClass("adjust");
    $('.supply').removeClass("adjust");
    $('.supply-actions.actions-1').removeClass("hide");
    $('.supply-actions.actions-2').addClass("hide");
    $('.borrow-actions.actions-1').addClass("hide");
    $('.borrow-actions.actions-2').removeClass("hide");

    // Reset Supply sliders
    sliderSupplyUsdb.noUiSlider.set(Cookies.get('supplied-usdb'));
    sliderSupplyUsdb.setAttribute("disabled", "");
    sliderSupplyIcx.noUiSlider.set(Cookies.get('supplied-icx'));
    sliderSupplyIcx.setAttribute("disabled", "");

    // Reset Supply inputs
    $('#input-supply-usdb').attr('disabled', 'disabled');
    $('#input-supply-available-usdb').attr('disabled', 'disabled');
    $('#input-supply-icx').attr('disabled', 'disabled');
    $('#input-supply-available-icx').attr('disabled', 'disabled');

    // Enable Borrow USDb
    $('#input-borrow-usdb').removeAttr("disabled");
    $('#input-borrow-available-usdb').removeAttr("disabled");
    $('#slider-borrow-usdb').removeAttr("disabled");
    sliderBorrowUsdb.noUiSlider.set(Cookies.get('borrowed-usdb'));

    // Enable Borrow ICX
    $('#input-borrow-icx').removeAttr("disabled");
    $('#input-borrow-available-icx').removeAttr("disabled");
    $('#slider-borrow-icx').removeAttr("disabled");
    sliderBorrowIcx.noUiSlider.set(Cookies.get('borrowed-icx'));

    // If USDb and ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {

        // show risk data
        $('.risk-container').css("display", "none");

        // Hide risk message
        $('.risk-message-noassets').css("display", "block");
    };

    // If USDb or ICX borrow is greater than 0
    if (parseFloat(Cookies.get('borrowed-usdb')) > 0 || parseFloat(Cookies.get('borrowed-icx')) > 0) {

        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
    };
});

//
// Adjust cancel
//

$(".adjust-cancel").click(function(){
    // Reset actions
    $('.actions-2').addClass("hide");
    $('.actions-1').removeClass("hide");

    // Remove adjust
    $('.supply').removeClass("adjust");
    $('.borrow').removeClass("adjust");

    // Reset Bridge sliders
    sliderSupplyUsdb.noUiSlider.set(Cookies.get('supplied-usdb'));
    sliderBorrowUsdb.noUiSlider.set(Cookies.get('borrowed-usdb'));
    sliderSupplyUsdb.setAttribute("disabled", "");
    sliderBorrowUsdb.setAttribute("disabled", "");

    // Disable Bridge inputs
    $('#input-supply-usdb').attr('disabled', 'disabled');
    $('#input-supply-available-usdb').attr('disabled', 'disabled');
    $('#input-borrow-usdb').attr('disabled', 'disabled');
    $('#input-borrow-available-usdb').attr('disabled', 'disabled');

    // Reset ICON sliders
    sliderSupplyIcx.noUiSlider.set(Cookies.get('supplied-icx'));
    sliderBorrowIcx.noUiSlider.set(Cookies.get('borrowed-icx'));
    sliderSupplyIcx.setAttribute("disabled", "");
    sliderBorrowIcx.setAttribute("disabled", "");

    // Disable ICON inputs
    $('#input-supply-icx').attr('disabled', 'disabled');
    $('#input-supply-available-icx').attr('disabled', 'disabled');
    $('#input-borrow-icx').attr('disabled', 'disabled');
    $('#input-borrow-available-icx').attr('disabled', 'disabled');

    // If USDb and ICX borrow = 0
    if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {

        // show risk data
        $('.risk-container').css("display", "none");

        // Hide risk message
        $('.risk-message-noassets').css("display", "block");
    };

    // If USDb or ICX borrow is greater than 0
    if (parseFloat(Cookies.get('borrowed-usdb')) > 0 || parseFloat(Cookies.get('borrowed-icx')) > 0) {

        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
    };
});

/* ==========================================================================
    Commit values to cookies
========================================================================== */

// Commit USDb supply
$(".supply-usdb-commit").click(function() {
    Cookies.set('supplied-usdb', (inputSupplyUsdb.value));
    location.reload();
});

// Commit USDb borrow
$(".borrow-usdb-commit").click(function() {
    Cookies.set('borrowed-usdb', (inputBorrowUsdb.value));
    location.reload();
});

// Commit ICX supply
$(".supply-icx-commit").click(function() {
    Cookies.set('supplied-icx', (inputSupplyIcx.value));
    location.reload();
});

// Commit USDb borrow
$(".borrow-icx-commit").click(function() {
    Cookies.set('borrowed-icx', (inputBorrowIcx.value));
    location.reload();
});

/* ==========================================================================
    Risk
========================================================================== */

// Risk slider
var sliderRisk = document.getElementById('slider-risk');
noUiSlider.create(sliderRisk, {
    start: [0],
    connect: 'lower',
    tooltips: [wNumb({decimals: 0, thousand: ',', suffix: '%'})],
    range: {
        'min': [0],
        'max': [100]
    },
});

/* ==========================================================================
    Supply / Borrow input variables
========================================================================== */

//
// Bridge variables
//

// Bridge (Your markets)
var inputSupplyUsdb = document.getElementById('input-supply-usdb');
var inputSupplyAvailableUsdb = document.getElementById('input-supply-available-usdb');
var inputBorrowUsdb = document.getElementById('input-borrow-usdb');
var inputBorrowAvailableUsdb = document.getElementById('input-borrow-available-usdb');

//
// ICON variables
//

// ICON (Your markets)
var inputSupplyIcx = document.getElementById('input-supply-icx');
var inputSupplyAvailableIcx = document.getElementById('input-supply-available-icx');
var inputBorrowIcx = document.getElementById('input-borrow-icx');
var inputBorrowAvailableIcx = document.getElementById('input-borrow-available-icx');

/* ==========================================================================
    Supply / Borrow sliders
========================================================================== */

//
// Bridge supply sliders
//

// Bridge supply slider (Your markets)
var sliderSupplyUsdb = document.getElementById('slider-supply-usdb');
noUiSlider.create(sliderSupplyUsdb, {
    start: [Cookies.get('supplied-usdb')],
    padding: [0],
    connect: 'lower',
    range: {
        'min': [0],
        'max': [15000]
    },
});

//
// Bridge borrow sliders
//

// Bridge borrow slider (Your markets)
var sliderBorrowUsdb = document.getElementById('slider-borrow-usdb');
noUiSlider.create(sliderBorrowUsdb, {
    start: [Cookies.get('borrowed-usdb')],
    padding: [0],
    connect: 'lower',
    range: {
        'min': [0],
        'max': [3300]
    },
});

//
// ICON supply sliders
//

// ICON borrow slider (Your markets)
var sliderSupplyIcx = document.getElementById('slider-supply-icx');
noUiSlider.create(sliderSupplyIcx, {
    start: [Cookies.get('supplied-icx')],
    padding: [0],
    connect: 'lower',
    range: {
        'min': [0],
        'max': [3300]
    },
});

// ICON borrow slider (Your markets)
var sliderBorrowIcx = document.getElementById('slider-borrow-icx');
noUiSlider.create(sliderBorrowIcx, {
    start: [Cookies.get('borrowed-icx')],
    padding: [0],
    connect: 'lower',
    range: {
        'min': [0],
        'max': [3300]
    },
});

/* ==========================================================================
    Supply / Borrow slider logic
========================================================================== */

//
// Bridge supply slider
//

// On Bridge supply slider update (Your markets)
sliderSupplyUsdb.noUiSlider.on('update', function (values, handle) {

    // Update Bridge supplied text box
    inputSupplyUsdb.value = (parseFloat(values[handle]));

    // Update Bridge available text box
    inputSupplyAvailableUsdb.value = usdbFormat.to(parseFloat(Cookies.get('wallet-usdb')) - inputSupplyUsdb.value);

    // Update Bridge's supply interest
    $('.value-supply-interest-usdb').text(usdbPrefixPlusFormat.to((parseFloat(values[handle])) * 0.0647 / 365));

    // Update Bridge's supply omm rewards
    $('.value-supply-rewards-usdb').text(ommPrefixPlusFormat.to((parseFloat(values[handle])) * 0.447 / 365));

    // Update before / after / difference values
    $('.value-supply-usdb-after').text(usdbFormat.to(parseFloat(values[handle])));
    $('.value-supply-usdb-difference').text(usdbFormat.to((parseFloat(values[handle])) - parseFloat(Cookies.get('supplied-usdb'))));

    // Update the risk percentage
    $('.value-risk-total').text(percentageFormat.to((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((inputSupplyUsdb.value * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100));

    // Update the risk slider v2
    sliderRisk.noUiSlider.set((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((inputSupplyUsdb.value * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100);

    // Change text to red if over 100
    if (((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((inputSupplyUsdb.value * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100) > 100) {
        // Hide supply actions
        $('.supply-actions.actions-2').css("display", "none");
        // Show supply warning
        $('.supply-actions.actions-2').css("display", "none");
    };

    // Change text to red if over 75
    if (((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((inputSupplyUsdb.value * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100) > 75) {
        $('.value-risk-total').addClass("alert");
    };
    // Change text to normal if under 75
    if (((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((inputSupplyUsdb.value * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100) < 75) {
        $('.value-risk-total').removeClass("alert");
    };
});

//
// Bridge borrow slider
//

// On Bridge borrow slider update (Your markets)
sliderBorrowUsdb.noUiSlider.on('update', function (values, handle) {

    // Update Bridge borrowed text box
    inputBorrowUsdb.value = (parseFloat(values[handle]));

    // Update Bridge available text box
    inputBorrowAvailableUsdb.value = usdbFormat.to(3300 - inputBorrowUsdb.value);

    // Update Bridge's borrow interest
    $('.value-borrow-interest-usdb').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));

    // Update Bridge's borrow omm rewards
    $('.value-borrow-rewards-usdb').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));

    // Update before / after / difference values
    $('.value-borrow-usdb-after').text(usdbFormat.to(parseFloat(values[handle])));
    $('.value-borrow-usdb-difference').text(usdbFormat.to((parseFloat(values[handle])) - parseFloat(Cookies.get('borrowed-usdb'))));

    // Update the risk percentage
    $('.value-risk-total').text(percentageFormat.to(((parseFloat(values[handle])) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100));

    // Update the risk slider v2
    sliderRisk.noUiSlider.set((((parseFloat(values[handle])) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100));

    // Change text to red if over 75
    if ((((parseFloat(values[handle])) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100) > 75) {
        $('.value-risk-total').addClass("alert");
    };
    // Change text to normal if under 75
    if ((((parseFloat(values[handle])) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100) < 75) {
        $('.value-risk-total').removeClass("alert");
    };

    if (inputBorrowUsdb.value > 0) {
        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
    };
});

/* ==========================================================================
    ICON
========================================================================== */

// On ICON supply slider update
sliderSupplyIcx.noUiSlider.on('update', function (values, handle) {

    // Update ICON supplied text box
    inputSupplyIcx.value = (parseFloat(values[handle]));

    // Update ICON available text box
    inputSupplyAvailableIcx.value = icxFormat.to(parseFloat(Cookies.get('wallet-icx')) - inputSupplyIcx.value);

    // Update ICON's supply interest
    $('.value-supply-interest-icx').text(icxFormat.to((parseFloat(values[handle])) * 1.247 / 365));

    // Update ICON's supply omm rewards
    $('.value-supply-rewards-icx').text(ommPrefixPlusFormat.to((parseFloat(values[handle])) * 0.447 / 365));

    // Update before / after / difference values
    $('.value-supply-icx-after').text(icxFormat.to(parseFloat(values[handle])));
    $('.value-supply-icx-difference').text(icxFormat.to((parseFloat(values[handle])) - parseFloat(Cookies.get('supplied-icx'))));

    // Update the risk percentage
    $('.value-risk-total').text(percentageFormat.to( (parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (inputSupplyIcx.value * 0.66)) * 100 ));

    // Update the risk slider v2
    sliderRisk.noUiSlider.set( (parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (inputSupplyIcx.value * 0.66)) * 100 );
});

// On ICON borrow slider update
sliderBorrowIcx.noUiSlider.on('update', function (values, handle) {

    // Update ICON borrowed text box
    inputBorrowIcx.value = (parseFloat(values[handle]));

    // Update ICON available text box
    inputBorrowAvailableIcx.value = icxFormat.to(3300 - inputBorrowIcx.value);

    // Update ICON's borrow interest
    $('.value-borrow-interest-icx').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));

    // Update ICON's borrow omm rewards
    $('.value-borrow-rewards-icx').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));

    // Update ICON's before / after / difference values
    $('.value-borrow-icx-after').text(icxFormat.to(parseFloat(values[handle])));
    $('.value-borrow-icx-difference').text((parseFloat(values[handle])) - parseFloat(Cookies.get('borrowed-icx')));

    // Update the risk percentage
    $('.value-risk-total').text(percentageFormat.to(((parseFloat(values[handle])) + parseFloat(Cookies.get('borrowed-usdb'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100));

    // Update the risk slider v2
    sliderRisk.noUiSlider.set((((parseFloat(values[handle])) + parseFloat(Cookies.get('borrowed-usdb'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100));



    if (inputBorrowIcx.value > 0) {
        // show risk data
        $('.risk-container').css("display", "block");
        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
    };
});

/* ==========================================================================
    Supply / Borrow input logic
========================================================================== */

//
// Bridge
//

// Supply input updates the slider
inputSupplyUsdb.addEventListener('input', function () {
    sliderSupplyUsdb.noUiSlider.set(this.value);
});

// Supply available input updates the slider
inputSupplyAvailableUsdb.addEventListener('input', function () {
    sliderSupplyUsdb.noUiSlider.set((parseFloat(Cookies.get('supplied-usdb'))) - this.value);
});

// Borrow input updates the slider
inputBorrowUsdb.addEventListener('input', function () {
    sliderBorrowUsdb.noUiSlider.set(this.value);
});

// Borrow available input updates the slider
inputBorrowAvailableUsdb.addEventListener('input', function () {
    sliderBorrowUsdb.noUiSlider.set((parseFloat(Cookies.get('borrowed-usdb'))) - this.value);
});

//
// ICON
//

// Supply input updates the slider
inputSupplyIcx.addEventListener('input', function () {
    sliderSupplyIcx.noUiSlider.set(this.value);
});

// Supply available input updates the slider
inputSupplyAvailableIcx.addEventListener('input', function () {
    sliderSupplyIcx.noUiSlider.set((parseFloat(Cookies.get('supplied-icx'))) - this.value);
});

// Borrow input updates the slider
inputBorrowIcx.addEventListener('input', function () {
    sliderBorrowIcx.noUiSlider.set(this.value);
});

// Borrow available input updates the slider
inputBorrowAvailableIcx.addEventListener('input', function () {
    sliderBorrowIcx.noUiSlider.set((parseFloat(Cookies.get('borrowed-icx'))) - this.value);
});