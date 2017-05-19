/**
 * Created by Yang on 23/12/2016.
 */
$(document).ready(function ( $ ) {
    $("#my-gallery-container").mpmansory();
});

$(function () {
    //getNews();
});

$(document).ready(function ( $ ) {
    $("#news-quilt").mpmansory(
        {
            childrenClass: '', // default is a div
            columnClasses: '', //add classes to items
            breakpoints:{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
            },
            distributeBy: { order: false, height: false, attr: 'data-order', attrOrder: 'asc' },
            onload: function (items) {
                //make somthing with items
            }
        }
    );
});

function getNews() {
    var body = $('#news-quilt');
    $.ajax({
        url: '/',
        type: 'GET',
        success: function (json) {
            for (var i = 0; i < json.length; i++) {
                var current = json[i];
                $('div#news-quilt p.news-title').html(current.title);
                $('div#news-quilt p.news-content').html(current.content);
            }
        },
        error: function () {
            alert("获取新闻失败");
        }
    })
}