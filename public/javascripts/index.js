/**
 * Created by rui on 2016/12/4.
 */
var timeInterval = 5000;

$(function () {
    getTradeInfo();
    //setInterval(getImageInfo, timeInterval);
});

function getTradeInfo() {
    var body = $('#table').find('tbody');
    $.ajax({
        url: '/TradeInfo',
        type: 'get',
        success: function (json) {
            body.html('');
            var tradeInfo = eval("(" + json + ")");
            for (var i = 0; i < (tradeInfo.length > 341 ? 341 : tradeInfo.length); i++) {
                var current = tradeInfo[i];
                var tr = $('<tr>');
                var td1 = $('<td>').html(current.id);
                var td2 = $('<td>').html(current.name);
                var td3 = $('<td>').html(current.open);
                var td4 = $('<td>').html(current.highest);
                var td5 = $('<td>').html(current.lowest);
                var td7 = $('<td>').html(current.closed);
                var td8 = $('<td>').html(current.sell);
                var td9 = $('<td>').html(current.buy);
                var td10 = $('<td>').html(current.latest_price);
                var td11 = $('<td>').html(current.settlement_price);
                var td12 = $('<td>').html(current.yesterday_settlement_price);
                var td13 = $('<td>').html(current.buyRate);
                var td14 = $('<td>').html(current.sellRate);
                //var td15 = $('<td>').html(current.date);
                tr.append(td1).append(td2).append(td3).append(td4).append(td5).append(td7).append(td8)
                    .append(td9).append(td10).append(td11).append(td12).append(td13).append(td14);//.append(td15);
                body.append(tr);
            }
        },
        error: function () {
            //alert("获取交易信息表失败--in getTradeInfo");
        }
    });
    setTimeout(getTradeInfo,5000);
}

function getImageInfo() {
    $.ajax({
        url: '/CarouselFigure',
        type: 'get',
        success: function (json) {
            $('.imageInfo').each(function (index, data) {
                $('img', data).attr('src', json[index]);
            })
        },
        error: function () {
            alert("fail");
        }
    });
}

function login() {
    var username = $('#login_username').val();
    var password = $('#login_password').val();
    console.log(username + " " + password);
    $.ajax({
        url: '/Login',
        type: 'get',
        data: {
            username: username,
            password: password
        },
        success: function (json) {
            console.log(json);
            if(json == null){
                alert("服务器连接失败");
            }
            var tradeInfo = eval("(" + json + ")");
            if(tradeInfo.status == 0){
                alert("登陆成功");
                location.reload();
            }
            else{
                alert("登陆失败，请检查用户名和密码");
            }
        },
        error: function () {
            alert("服务器连接失败");
        }
    })
}

function register() {
    var username = $('#register_username').val();
    var password = $('#register_password').val();
    var confirm_password = $('#confirm_password').val();
    var email = $('#register_email').val();
    var age = $('#register_age').val();
    if(email == "" || age == "" || confirm_password == "" || password == "" || username == ""){
        alert("请补全用户资料！")
        return;
    }
    if (password != confirm_password) {
        alert('password not the same');
        return;
    }
    $.ajax({
        url: '/Register?username=' + username + '&password=' + password + '&email=' + email + '&age=' + age,
        type: 'post',
        data: {},
        success: function (json) {
            if(json == null){
                alert("服务器连接失败");
            }
            var tradeInfo = eval("(" + json + ")");
            if(tradeInfo.status == 0){
                alert("注册成功");
                location.reload();
            }
            //1:邮箱不规范、2：年龄填写错误
            else{
                alert("邮箱已存在");
            }
        },
        error: function () {
            alert("无法连接服务器");
        }
    })
}

function logout() {
    $.ajax({
        url: '/Logout',
        data: {},
        success: function (json) {
            location.href = "/index";
            alert("登出成功！");
        },
        error: function () {
            alert("无法连接服务器");
        }
    })
}