$('.open-panel>span, .close-cross, .show-online-users, .online-users-shadow ').on('click', () => {
    $('.online-users-cart').toggle("slide");
})
/*
$('body').on('click', () => {
    $('.online-panel-right').hide("slide", { direction: "right" }, 1000);
})
*/