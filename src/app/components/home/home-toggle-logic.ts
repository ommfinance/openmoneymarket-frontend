import {PersistenceService} from "../../services/persistence/persistence.service";

declare var $: any;
declare var noUiSlider: any;

/* ==========================================================================
  Toggle logic
========================================================================== */

// On "Market overview" click
export function onToggleMarketOverviewClick(): void {
  $("#toggle-your-overview").removeClass('active');
  $("#toggle-market-overview").addClass('active');
  $("#your-overview-content").hide();
  $("#market-overview-content").show();
}

// On "Your overview" click
export function onToggleYourOverviewClick(): void {
  $("#toggle-your-overview").addClass('active');
  $("#toggle-market-overview").removeClass('active');
  $("#your-overview-content").show();
  $("#market-overview-content").hide();
}

// On "Per day" click
export function onTimeSelectorClick(): void {
  $('#time-selector').toggleClass("active");
  $('#time-tooltip').toggleClass("active");
}

// On "Your markets" click
export function onToggleYourMarketsClick(): void {
  $("#toggle-your-markets").addClass('active');
  $("#toggle-all-markets").removeClass('active');
  $("#your-markets-list").show();
  $("#all-markets-list").hide();
}

// On "All markets" click
export function onToggleAllMarketsClick(bridgeSupplySlider: any, bridgeBorrowSlider: any, iconSupplySlider: any,
                                        iconBorrowSlider: any): void {
  // Hide "Your markets" view
  $("#toggle-your-markets").removeClass('active');
  $("#your-markets-list").hide();

  // Show "All markets" view
  $("#toggle-all-markets").addClass('active');
  $("#all-markets-list").show();

  // Disable any active states on the "Your markets" view
  $("#asset-bridge").removeClass('active');
  $("#asset-bridge-expanded").slideUp();
  $("#asset-icon").removeClass('active');
  $("#asset-icon-expanded").slideUp();
  $("#asset-tap").removeClass('active');
  $("#asset-tap-expanded").slideUp();

  // If "Supply" is in the "adjust" state, this will disable the state and reset the data
  if ($("#supply").hasClass("adjust")) {
      $('#supply').removeClass("adjust");
      $('.supply-actions').toggleClass("hide");
      $('#supply-deposited-bridge').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available-bridge').prop('disabled', (i: any, v: any) => !v);
      bridgeSupplySlider.toggleAttribute('disabled');
      // iconSupplySlider.toggleAttribute('disabled');
      // bridgeSupplySlider.noUiSlider.set(10000);
  }

  // If "Borrow" is in the "adjust" state, this will disable the state and reset the data
  if ($("#borrow").hasClass("adjust")) {
      $('#borrow').removeClass("adjust");
      $('.borrow-actions').toggleClass("hide");
      $('#borrow-borrowed-bridge').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available-bridge').prop('disabled', (i: any, v: any) => !v);
      bridgeBorrowSlider.toggleAttribute('disabled');
      // iconBorrowSlider.toggleAttribute('disabled');
      // bridgeBorrowSlider.noUiSlider.set(1500);
  }
}

// On Supply / Adjust click
export function onSupplyAdjustClick(bridgeSupplySlider: any, iconSupplySlider: any, tapSupplySlider: any,
                                    bridgeBorrowSlider: any, persistenceService: PersistenceService, iconBorrowSlider: any): void {
  $('.supply').toggleClass("adjust");
  $('.supply-actions').toggleClass("hide");

  // Bridge
  $('#supply-deposited-bridge').prop('disabled', (i: any, v: any) => !v);
  $('#supply-available-bridge').prop('disabled', (i: any, v: any) => !v);
  bridgeSupplySlider.toggleAttribute('disabled');
  bridgeSupplySlider.noUiSlider.set(persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0);

  // ICON
  $('#supply-deposited-icon').prop('disabled', (i: any, v: any) => !v);
  $('#supply-available-icon').prop('disabled', (i: any, v: any) => !v);
  // iconSupplySlider.toggleAttribute('disabled');
  iconSupplySlider.noUiSlider.set(persistenceService.userIcxReserve?.currentOTokenBalance ?? 0);

  // TAP
  $('#supply-deposited-tap').prop('disabled', (i: any, v: any) => !v);
  $('#supply-available-tap').prop('disabled', (i: any, v: any) => !v);
  tapSupplySlider.toggleAttribute('disabled');
  // tapSupplySlider.noUiSlider.set(10000);

  if ($(".borrow").hasClass("adjust")) {
    $('.borrow').removeClass("adjust");
    $('.borrow-actions').toggleClass("hide");
    $('#borrow-borrowed-bridge').prop('disabled', (i: any, v: any) => !v);
    $('#borrow-available-bridge').prop('disabled', (i: any, v: any) => !v);
    bridgeBorrowSlider.toggleAttribute('disabled');
    bridgeBorrowSlider.noUiSlider.set(persistenceService.userUSDbReserve?.principalBorrowBalance ?? 0);

    // iconBorrowSlider.toggleAttribute('disabled');
    iconBorrowSlider.noUiSlider.set(persistenceService.userIcxReserve?.principalBorrowBalance ?? 0);
  }
}

export function onBorrowAdjustClick(bridgeBorrowSlider: any, iconSupplySlider: any, tapSupplySlider: any,
                                    bridgeSupplySlider: any, persistenceService: PersistenceService): void {
  $('.borrow').toggleClass("adjust");
  $('.borrow-actions').toggleClass("hide");

  // Bridge
  $('#borrow-borrowed-bridge').prop('disabled', (i: any, v: any) => !v);
  $('#borrow-available-bridge').prop('disabled', (i: any, v: any) => !v);
  bridgeBorrowSlider.toggleAttribute('disabled');
  bridgeBorrowSlider.noUiSlider.set(persistenceService.userUSDbReserve?.principalBorrowBalance ?? 0);

  // ICON
  $('#supply-deposited-icon').prop('disabled', (i: any, v: any) => !v);
  $('#supply-available-icon').prop('disabled', (i: any, v: any) => !v);
  // iconSupplySlider.toggleAttribute('disabled');
  iconSupplySlider.noUiSlider.set(persistenceService.userIcxReserve?.currentOTokenBalance ?? 0);

  // TAP
  $('#supply-deposited-tap').prop('disabled', (i: any, v: any) => !v);
  $('#supply-available-tap').prop('disabled', (i: any, v: any) => !v);
  tapSupplySlider.toggleAttribute('disabled');
  // tapSupplySlider.noUiSlider.set(10000);

  if ($(".supply").hasClass("adjust")) {
    $('.supply').removeClass("adjust");
    $('.supply-actions').toggleClass("hide");

    $('#supply-deposited-bridge').prop('disabled', (i: any, v: any) => !v);
    $('#supply-available-bridge').prop('disabled', (i: any, v: any) => !v);
    bridgeSupplySlider.toggleAttribute('disabled');
    bridgeSupplySlider.noUiSlider.set(persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0);

    // iconSupplySlider.toggleAttribute('disabled');
    iconSupplySlider.noUiSlider.set(persistenceService.userIcxReserve?.currentOTokenBalance ?? 0);
  }
}
