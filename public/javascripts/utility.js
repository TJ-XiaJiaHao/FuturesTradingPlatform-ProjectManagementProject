$(function () {
    var height = $('#navbar').height() + 'px';
    $('.username-label').css({
        'line-height': height
    });

    $('.theme-showcase').css({
        'margin-top': height
    });

    var userId = sessionStorage.getItem("userId");
    if (userId == undefined || userId == null || userId == "") {
        $('.login').removeClass('none');
        $('.register').removeClass('none');
    } else {
        $('.welcome').removeClass('none');
        $('#username-span').html(sessionStorage.getItem('username'));
    }
});

function jumpToAccount() {
    window.location.href = "/accountInfo";
}

function jumpToTrade() {
    window.location.href = "/tradeRecord";
}

function jumpToBasic() {
    window.location.href = "/userinfo";
}