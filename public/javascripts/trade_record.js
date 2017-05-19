$(function () {
    $('input[name="query-radio"]').iCheck({
        checkboxClass: 'icheckbox_minimal-red',
        radioClass: 'iradio_minimal-red',
        increaseArea: '20%' // optional
    });

    $('.search-icon').click(function () {
        searchTradeRecord();
    });
});

function searchTradeRecord() {
    var type = $("input[name='query-radio']:checked").val();
    var value = $('#search_input').val();
    var body = $('#trade_record_table').find('tbody');
    $.ajax({
        url: '/SearchTradeRecord',
        type: 'get',
        data: {
            type: type,
            value: value
        },
        success: function (json) {
            var data = eval("(" + json + ")");
            body.html('');
            for (var i = 0; i < data.length; i++) {
                var current = data[i];
                var tr = $('<tr>');
                var td1 = $('<td>').html(current.id);
                var td2 = $('<td>').html(current.time);
                var td3 = $('<td>').html(current.trading_type);
                var td4 = $('<td>').html(current.amount);
                var td5 = $('<td>').html(current.purchasing_price);
                var td6 = $('<td>').html(current.selling_price);
                tr.append(td1).append(td2).append(td3).append(td4).append(td5).append(td6);
                body.append(tr);
            }
        },
        error: function () {
            alert('获取trade record失败');
        }
    })
}
