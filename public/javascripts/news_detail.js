/**
 * Created by Yang on 23/12/2016.
 */
$(function () {
    getNewsDetails();
});

function getNewsDeatails() {
    $.ajax('/', {
        dataType: 'json'
    });
}

var news = $.getJSON('', {
    name: 'test'
}).done(function (data) {
    // data is a json obj
});

