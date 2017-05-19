$(function () {
    getAccountInfo();

    $("#apply-for-banlance").click(function(){
        $.ajax({
            url: '/ApplyAids',
            type: 'get',
            success: function (json) {
                var data = eval("(" + json + ")");
                if(data.status == 0){
                    alert("申请补助成功！");
                }
                else{
                    alert("申请补助失败");
                }
            },
            error: function () {
                alert("服务器连接失败");
            }
        })
    })
});

function getAccountInfo() {
    $.ajax({
        url: '/AccountInfo',
        type: 'get',
        success: function (json) {
            var data = eval("(" + json + ")");
            $('#name').val(data.name);
            $('#balance').val(data.account_balance);
            $('#contract-info').val(data.contract_info);
        },
        error: function () {

        }
    })
}

function jump() {
    window.location.href = "/tradeRecord";
}
