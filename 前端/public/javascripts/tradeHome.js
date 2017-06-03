/**
 * Created by Administrator on 2016/12/6.
 */
var accountInfoBefore = 0;  //轮播特效中将要移出的板块索引号
var historyLi = 0;          //历史价格列表中当前的个数

var trade_data = [];        //k线图交易信息，开盘，收盘，最低，最高
var x_data  = [];           //K线图日期信息
var myChart;                //K线图画布
var option;                 //k线图操作
var nowContract;            //当前合约
var KlineTimeOut;           //k线图定时器

var ContractTimeOut;        //合约实时交易信息定时器
var ContractArr = [];       //合约列表

var tradeWaitImg = "images/处理中.png";        //蒙版处理中的图标
var tradeSuccImg = "images/打勾.png";          //蒙版中处理成功的图标


var klineType = "mini";
var klineCircle = 5;

var analyzeX = [];
var analyzeY = [];
var analyzeY0 = [];
var minY;
var maxY;

$(document).ready(function () {
    /*消息提示框初始化摄者*/
    toastr.options = {
        closeButton: true,
        progressBar: true,
        showMethod: 'slideDown',
        positionClass:'toast-bottom-right',
        timeOut: 2000
    };

    /*动态设置合约基本信息宽度*/
    UpdateConBasicInfoWidth();

    /*加载账户信息*/
    AccountRefresh();

    /*点击事件初始化*/
    eventInit();

    // /*添加持仓列表*/
    HandsRefresh();

    //时间定时器
    var time = timeRefresh();

});

function eventInit(){
    /*买卖合约按钮点击效果*/
    setSellBtn();
    setBuyBtn();

    /*添加当切换合约时的特效*/
    SetChangeContract();

    /*设置账户信息主体部分特效*/
    SetAccountBodyBanner();

    /*设置5/15/30/60/1d的点击特效*/
    setCircleClick();

    /*登陆相关*/
    setLoginClick();
    setRegisterClick();

    $(".config-step").click(function(){
        $("#config-hands-text").val($(this).text());
    });
    $("#open-mask-box-btn").click(function(){
        $("#open-mask").css("visibility","hidden");
    });
    $("#account-total-info-header").children().eq(0).click(function(){
        HandsRefresh();
    });
    $("#account-total-info-header").children().eq(1).click(function(){
        DoneRefresh();
    });
    $("#account-total-info-header").children().eq(2).click(function(){
        ProfileRefresh();
    });
}


/*显示蒙版*/
function showmask(imgSrc,title,time,type,dir,hands,price,ID){
    $("#open-mask--box-body img").attr("src", imgSrc);
    $("#open-mask--box-body h1").text(title);
    $("#open-mask--box-body").find("label").eq(0).text(time);
    $("#open-mask--box-body").find("label").eq(1).text(type + " " + dir + " " + hands + "hands @" + price);
    $("#open-mask--box-body").find("label").eq(2).text("ID:" + ID);
    $("#open-mask").css("visibility","visible");
}




/******************************************************/
/*                  数据自动加载和刷新                */
/****************************************************/

/*合约详情刷新*/
function ContractDetailRefresh(){
    $.ajax({
        type: "post",
        async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: '/ContractDetailRefresh?name=' + nowContract,    //请求发送到TestServlet处
        data: {},
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            //请求成功时执行该函数内容，result即为服务器返回的json对象
            if (result) {
                $("#contract-detail-table").children().eq(0).children().eq(0).children().eq(1).text(result[0].name);
                $("#contract-detail-table").children().eq(0).children().eq(0).children().eq(3).text(result[0].contMultUnit);
                $("#contract-detail-table").children().eq(0).children().eq(0).children().eq(5).text(result[0].priceUnit);
                $("#contract-detail-table").children().eq(0).children().eq(0).children().eq(7).text(result[0].minChgPriceUnit);
                $("#contract-detail-table").children().eq(0).children().eq(0).children().eq(9).text(result[0].limitUpUnit);
                $("#contract-detail-table").children().eq(0).children().eq(1).children().eq(1).text(result[0].deliMonth);
                $("#contract-detail-table").children().eq(0).children().eq(1).children().eq(3).text(result[0].tradingTime);
                $("#contract-detail-table").children().eq(0).children().eq(1).children().eq(5).text(result[0].lastTradeDate);
                $("#contract-detail-table").children().eq(0).children().eq(1).children().eq(7).text(result[0].lastDeliDate);
                $("#contract-detail-table").children().eq(0).children().eq(1).children().eq(9).text(result[0].deliGrade);
                $("#contract-detail-table").children().eq(0).children().eq(2).children().eq(1).text(result[0].tradeMarginRatio);
                $("#contract-detail-table").children().eq(0).children().eq(2).children().eq(3).text(result[0].tradeCommi);
                $("#contract-detail-table").children().eq(0).children().eq(2).children().eq(5).text(result[0].deliMethod);
                $("#contract-detail-table").children().eq(0).children().eq(2).children().eq(7).text(result[0].contractObject);
                $("#contract-detail-table").children().eq(0).children().eq(2).children().eq(9).text(result[0].exchangeCD);

            }
        },
        error: function (errorMsg) {
            //请求失败时执行该函数
            console.log("合约详情刷新失败!");
        }
    });
}


/*合约实时动态数据刷新*/
function addNewHistoryTradeItem(time,price,color){
    var url;
    if(color == "red") url = "images/priceDown.png";
    else if(color == "green") url = "images/priceUp.png";
    else return;
    $("#contract-op-history-con").prepend("<label class='history-con-time'>"
        + time + "</label><label id='price-"
        + historyLi.toString() + "' class='history-con-price'>"
        + price + "</label><img class='history-img' src = '"
        + url + "'/>");
    $("#price-" + historyLi.toString()).css("color",color);
    historyLi = historyLi + 1;

    var num = $(".history-con-time").length;

    if(num > 50) $("#contract-op-history-con").eq(50).remove();

    if(num > 8){
        $("#contract-op-history-con").css("width","108%");
    }

}
function UpdateContractArr(){
    ContractArr = [];
    var num = $("#contract-basic-info-con").children().length;
    for(var i = 0;i < num ; i++){
        ContractArr.push($("#contract-basic-info-con").children().eq(i).children().eq(0).text());
    }
}
function ContractTradeRefresh(){
    /*获取合约列表信息*/
    UpdateContractArr();
    var URL;
    URL = "/ContractRefresh?names="+ContractArr;
    $.ajax({
        type: "post",
        async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: URL,    //请求发送到TestServlet处
        data: {},
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            //请求成功时执行该函数内容，result即为服务器返回的json对象
            if (result && result.length != 0) {
                for (var i = 0; i < result.length; i++) {
                    var num = $("#contract-basic-info-con").children().length;
                    /*更新信息列表*/
                    for(var j = 0; j < num ; j++){
                        var items = $("#contract-basic-info-con").children().eq(j).children();
                        if(items.eq(0).text() == result[i].name) {
                            items.eq(1).text(result[i].sell);
                            items.eq(2).text(result[i].buy);
                            items.eq(3).text(result[i].point);
                            var background = result[i].sell >result[i].closed ? "green" : "red";
                            items.eq(1).css("background",background);
                            items.eq(2).css("background",background);
                        }
                    }

                    /*更新持仓列表*/
                    if($(".handing-table-" + result[i].name).length != 0) {
                        for (var n = 0; n < $(".handing-table-" + result[i].name).length; n++) {
                            var dir = $(".handing-table-" + result[i].name).eq(n).children().eq(1).text() == "卖出" ? -1 : 1;

                            var liquidation = dir == -1 ? result[i].buy : result[i].sell;

                            $(".handing-table-" + result[i].name).eq(n).children().eq(4).text(liquidation);

                            var openPrice = parseFloat($(".handing-table-" + result[i].name).eq(n).children().eq(3).text());

                            var liquidationPrice = parseFloat(liquidation);


                            var color = (openPrice - liquidationPrice) * dir > 0 ? "red" : "green";

                            $(".handing-table-" + result[i].name).eq(n).children().eq(4).css("color", color);

                            $(".handing-table-" + result[i].name).eq(n).children().eq(9).text(Math.round((liquidation - openPrice) * dir * 100) / 100);

                            $(".handing-table-" + result[i].name).eq(n).children().eq(9).css("color", color);
                        }
                    }

                    /*更新右边的实时信息*/
                    if(result[i].name == nowContract){
                        var img = result[i].sell > result[i].closed ? "priceUp.png" : "priceDown.png";
                        var color = result[i].sell >result[i].closed ? "green" : "red";
                        $("#contract-op-sell-price").text(result[i].sell);
                        $("#contract-op-sell-price").css("color",color);
                        $("#contract-op-sell-info-price-up").css("color",color);
                        $("#contract-op-sell-info-img").attr("src", "images/" + img);
                        $("#contract-op-button-sell").css("background",color);
                        $("#contract-op-button-buy").css("background",color);
                        $("#contract-op-button-sell .price").text(result[i].sell);
                        $("#contract-op-button-buy .price").text(result[i].buy);
                        $("#op-trade-info-highest").text(result[i].highest);
                        $("#op-trade-info-highest").css("color",result[i].highest > result[i].closed ? "green" : "red");
                        $("#op-trade-info-begin").text(result[i].open);
                        $("#op-trade-info-begin").css("color",result[i].open > result[i].closed ? "green" : "red");
                        $("#op-trade-info-lowest").text(result[i].lowest);
                        $("#op-trade-info-lowest").css("color",result[i].lowest > result[i].closed ? "green" : "red");
                        $("#op-trade-info-closed").text(result[i].closed);
                        $("#op-trade-info-open-interest").text(result[i].volume);
                        $("#op-trade-info-volume").text(result[i].hands);


                        /*添加一条价格变动历史*/
                        var data = new Date();
                        var time = data.getYear() + "-" + data.getMonth() + "-" + data.getDay() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
                        addNewHistoryTradeItem(time,result[i].sell,color);

                    }
                }
            }
            ContractTimeOut = setTimeout(ContractTradeRefresh,1000);
        },
        error: function (errorMsg) {
            //请求失败时执行该函数
            console.log("数据刷新异常！");
        }
    });
}

/*k线图的画布初始化和数据加载*/
function KlineInit(id){
    $("#kline").text("分析");
    require.config({
        paths: {
            echarts: 'javascripts/echarts/build/dist'
        }
    });

    // 使用
    require(
        [
            'echarts',
            'echarts/chart/bar', // 使用柱状图就加载bar模块，按需加载
            'echarts/chart/k'
        ],
        function (ec) {
            // 基于准备好的dom，初始化echarts图表
            myChart = ec.init(document.getElementById(id));

            option = {
                title : {
                    text: nowContract,
                    textStyle:{
                        fontSize:14,
                        fontWeight:'bolder',
                        color:'white'
                    }
                },
                tooltip : {
                    trigger: 'axis',
                    formatter: function (params) {
                        var res = params[0].seriesName + ' ' + params[0].name;
                        res += '<br/>  open : ' + params[0].value[0] + '  highest : ' + params[0].value[3];
                        res += '<br/>  close : ' + params[0].value[1] + '  lowest : ' + params[0].value[2];
                        return res;
                    }
                },
                legend: {
                    data:['SSE'],
                    textStyle:{
                        color:'white'
                    }
                },
                toolbox: {
                    show : true,
                    feature : {
                        mark : {show: true},
                        dataZoom : {show: true},
                        dataView : {show: true, readOnly: false},
                        magicType: {show: true, type: ['line', 'bar']},
                        restore : {show: true},
                        saveAsImage : {show: true}
                    }
                },
                dataZoom : {
                    show : true,
                    realtime: true,
                    start : 50,
                    end : 100
                },
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : true,
                        axisTick: {onGap:false},
                        splitLine: {show:false},
                        data : x_data
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        scale:true,
                        boundaryGap: [0.01, 0.01]
                    }
                ],
                series : [
                    {
                        name:'SSE',
                        type:'k',
                        data:trade_data
                    }
                ]
            };


            // 为echarts对象加载数据
            myChart.setOption(option);
            KlineRefresh(nowContract);
        });
}
function KlineRefresh(name){
    myChart.showLoading();
    var URL;
    //if(x_data.length == 0)
    URL = "/KLineInit?name="+name + "&type=" + klineType + "&circle=" + klineCircle;
    //else URL = "/KLineRefresh?name="+name+"&time="+x_data[x_data.length - 1];
    $.ajax({
        type: "post",
        async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: URL,    //请求发送到TestServlet处
        data: {},
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            //请求成功时执行该函数内容，result即为服务器返回的json对象
            if (result) {

                /*如果数据长度为0，说明没有相关数据*/
                if(result.length == 0){
                    alert("该合约交割日期较晚，暂时没有相关数据！");
                    trade_data = [];
                    x_data =[];
                    myChart.setOption(option);
                }
                else{
                    var isPush = false;
                    var pos = -1;

                    /*检测是否有新数据需要添加到数组中 */
                    for (var i = 0; i < result.length; i++) {
                        if(isPush){
                            //alert("push data:" + result[i].x_data + " ; " +result[i].trade_data );
                            trade_data.push(result[i].trade_data);    //挨个取出类别并填入类别数组
                            x_data.push(result[i].x_data);    //挨个取出销量并填入销量数组
                        }
                        if(!isPush && result[i].x_data == x_data[x_data.length - 1]){
                            //alert("lastTime:" + x_data[x_data.length - 1] + "totoleLen : " + result.length + "nowPos:" + i);
                            isPush = true;
                            pos = i;
                        }
                    }
                    /*如果pos为-1，说明现在图中的所有数据都是旧数据*/
                    if(pos == -1){
                        for (var i = 0; i < result.length; i++) {
                            trade_data.push(result[i].trade_data);    //挨个取出类别并填入类别数组
                            x_data.push(result[i].x_data);    //挨个取出销量并填入销量数组
                        }
                    }
                    /*如果pos不是数组的倒数第一个，那么说明有新数据需要加载，刷新画布*/
                    if(pos != result.length -1){
                        //alert("refresh myChart");
                        myChart.setOption(option);
                    }
                }
                myChart.hideLoading();    //隐藏加载动画
            }
            KlineTimeOut = setTimeout(KlineRefresh,60000,name);
        },
        error: function (errorMsg) {
            //请求失败时执行该函数
            console.log("图表请求数据失败!");
            myChart.hideLoading();
        }
    });
}

/******************************************************/
/*                  设置界面中的js特效                */
/****************************************************/
/*设置账户信息轮播特效*/
function SetAccountBodyBanner(){
    $("#account-total-info-body").children().eq(0).animate({left:'0px'},0);
    var totalInfoNum = $("#account-total-info-header").children().length;
    for(var i=0; i < totalInfoNum ; i++){
        $("#account-total-info-header").children().eq(i).click(function () {
            var index = $(this).index();

            /*改变header属性*/
            $(this).css("background","#5e5e5e");
            $(this).siblings().css("background","black");

            /*设置对应页面切换效果*/
            var pos = 100;
            if(index > accountInfoBefore)pos = 100;
            else if(index == accountInfoBefore)return;
            else pos = -100;
            $("#account-total-info-body").children().eq(index).animate({left:pos + '%'},0);
            $("#account-total-info-body").children().eq(accountInfoBefore).animate({left: (-1*pos) + '%'},500);
            $("#account-total-info-body").children().eq(index).animate({left:'0%'},500);
            accountInfoBefore = index;
        })
    }
}

/*设置合约切换动作*/
function SetChangeContract() {

    /*获取合约基本信息列表的长度*/
    var num = $("#contract-basic-info-con").children().length;

    /*遍历所有的列表元素为其添加js特效*/
    for(var i = 0; i < num; i ++){

        $("#contract-basic-info-con").children().eq(i).click(function () {

            /*如果点击的合约就是当前的合约，则不做任何操作*/
            if(nowContract == $(this).children().eq(0).text())return;

            /*更改当前的合约名字*/
            nowContract = $(this).children().eq(0).text();

            x_data = [];
            trade_data = [];

            /*重新加载k线图*/
            clearTimeout(KlineTimeOut);
            KlineInit("contract-kline");

            /*立即刷新一遍交易实时信息*/
            $("#contract-op-name").text(nowContract);
            clearTimeout(ContractTimeOut);
            ContractTradeRefresh();

            /*重新加载合约历史交易记录*/
            $("#contract-op-history-con").html("");

            /*刷新合约详情*/
            ContractDetailRefresh();

        });
    }

    /*界面初始化时模拟点击第一条合约*/
    if($("#contract-basic-info-con").children().length != 0){
        $("#contract-basic-info-con").children().eq(0).click();
    }

    console.log("Set left contract click event,contract nums:" + num);
}

/*设置合约列表的宽度*/
function UpdateConBasicInfoWidth(){
    var num = $("#contract-basic-info-con").children().length;
    if(num > 15){
        console.log("Update left info width calc(100% + 20px)");
        $("#contract-basic-info-con").css("width","calc(100% + 20px)");
    }
    else console.log("Update left info width 100%");
}



/******************************************************/
/*              用户相关数据获取并加载                */
/****************************************************/
/*持仓列表刷新*/
function HandsRefresh(){
    toastr.info("正在为您加载持仓信息...");
    $.ajax({
        type: "post",
        async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: '/HandsRefresh',    //请求发送到TestServlet处
        data: {},
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            //请求成功时执行该函数内容，result即为服务器返回的json对象
            if (result) {
                console.log("result " + result);
                $("#handing-table").children().eq(0).children().eq(0).siblings().remove();
                for (var i = 0; i < result.length; i++) {
                    var dir = result[i].dir == "卖出" ? -1 :1;
                    var color = (result[i].closePrice - result[i].openPrice)*dir > 0 ? "green" : "red";
                    addHandingItem(result[i].name,result[i].dir,result[i].hands,result[i].openPrice,result[i].closePrice,color,result[i].stopLoss,result[i].stopWin,result[i].rebate,result[i].interest,result[i].profit,color,result[i].time,result[i].order);
                }
                toastr.success("持仓信息加载成功！");
            }
        },
        error: function (errorMsg) {
            //请求失败时执行该函数
            toastr.error("持仓信息请求失败！请确认网络是否畅通，可以尝试刷新！");
            console.log("持仓信息加载失败！");
        }
    });
}
function addHandingItem(name,dir,hands,openPrice,closePrice,closePriceColor,stopLoss,stopWin,rebate,interest,profit,profitColor,time,order){
    $("#handing-table").append("<tr id = 'handing-table-" + order + "' class = 'handing-table-" + name + "'><td>"
        + name + "</td><td>"
        + dir + "</td><td>"
        + hands + "</td><td>"
        + openPrice + "</td><td style='color:" + closePriceColor + "'>"
        + closePrice + "</td><td>"
        + stopLoss + "</td><td>"
        + stopWin + "</td><td>"
        + rebate + "</td><td>"
        + interest + "</td><td style='color:" + profitColor + "'>"
        + profit + "</td><td>"
        + time + "</td><td>"
        + order + "</td></tr>");
    $("#handing-table-" + order).dblclick(function(){
        offHands(name,hands,order,dir);
    })
    $(".handing-table-" + name).css("cursor","pointer");
    $(".handing-table-" + name).mouseover(function(){
        $(this).css("background","#3F3F3F");
    });
    $(".handing-table-" + name).mouseout(function(){
        $(this).css("background","none");
    });

    var num = $("#handing-table tr").length;
    if(num > 8){
        $("#dv-handing-table").css("width","calc(100% + 10px)");

    }
}

/*当日成交刷新*/
function DoneRefresh(){
    toastr.info("正在为您加载当日成交信息...");
    $.ajax({
        type: "post",
        async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: '/DoneRefresh',    //请求发送到TestServlet处
        data: {},
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            //请求成功时执行该函数内容，result即为服务器返回的json对象
            if (result) {
                $("#done-table").children().eq(0).children().eq(0).siblings().remove();
                for (var i = 0; i < result.length; i++) {
                    addDoneItem(result[i].doneID,result[i].orderID,result[i].name,result[i].tradeType,result[i].opType,result[i].dir,result[i].hands,result[i].rebate,result[i].donePrice,result[i].time,result[i].note)  ;
                }
                toastr.success("当日成交信息加载成功！");
            }
            else{
                toastr.error("当日成交信息加载失败！请确认是否已经登陆！");
            }
        },
        error: function (errorMsg) {
            //请求失败时执行该函数
            toastr.error("当日成交信息请求失败！请确认网络是否畅通，可以尝试刷新！");
            console.log("成交信息加载失败！");
        }
    });
}
function addDoneItem(doneID,orderID,name,tradeType,opType,dir,hands,rebate,donePrice,time,note){
    $("#done-table").append("<tr><td>"
        + doneID + "</td><td>"
        + orderID + "</td><td>"
        + name + "</td><td>"
        + tradeType + "</td><td>"
        + opType + "</td><td>"
        + dir + "</td><td>"
        + hands + "</td><td>"
        + rebate + "</td><td>"
        + donePrice + "</td><td>"
        + time + "</td><td>"
        + note + "</td><td>");


    var num = $("#done-table tr").length;
    if(num > 8){
        $("#dv-done-table").css("width","calc(100% + 10px)");
    }
}

/*当日盈亏刷新*/
function ProfileRefresh(){
    toastr.info("正在为您加载盈亏信息...");
    $.ajax({
        type: "post",
        async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: '/ProfileRefresh',    //请求发送到TestServlet处
        data: {},
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            //请求成功时执行该函数内容，result即为服务器返回的json对象
            if (result) {
                $("#profile-table").children().eq(0).children().eq(0).siblings().remove();
                for (var i = 0; i < result.length; i++) {
                    addPorfileItem(result[i].name,result[i].dir,result[i].hands,result[i].openPrice,result[i].offPrice,result[i].interest,result[i].rebate,result[i].profile,result[i].doneID,result[i].handsID,result[i].openTime,result[i].doneTime)
                }
                toastr.success("盈亏信息加载成功！");
            }
            else{
                toastr.error("盈亏信息加载失败！请确认是否已经登陆！");
            }
        },
        error: function (errorMsg) {
            //请求失败时执行该函数
            toastr.error("盈亏信息请求失败！请确认网络是否畅通，可以尝试刷新！");
            console.log("当日盈亏信息加载失败！");
        }
    });
}
function addPorfileItem(name,dir,hands,openPrice,offPrice,interest,rebate,profile,doneID,handsID,openTime,doneTime) {
    $("#profile-table").append("<tr><td>"
        + name + "</td><td>"
        + dir + "</td><td>"
        + hands + "</td><td>"
        + openPrice + "</td><td>"
        + offPrice + "</td><td>"
        + interest + "</td><td>"
        + rebate + "</td><td style='color:" + (profile < 0 ? "red" : "green") +"'>"
        + profile + "</td><td>"
        + doneID + "</td><td>"
        + handsID + "</td><td>"
        + openTime + "</td><td>"
        + doneTime + "</td><td>");


    var num = $("#done-table tr").length;
    if(num > 8){
        $("#dv-done-table").css("width","calc(100% + 10px)");
    }
}

/*账户信息刷新*/
function AccountRefresh(){
    toastr.info("正在加载账户信息...");
    $.ajax({
        type: "post",
        async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: '/AccountRefresh',    //请求发送到TestServlet处
        data: {},
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            //请求成功时执行该函数内容，result即为服务器返回的json对象
            if (result) {
                if(result == null) return;
                $("#account-basic-info").children().eq(1).text(result.account);
                $("#account-basic-info").children().eq(3).text(result.balance);
                $("#account-basic-info").children().eq(5).text(result.netWorth);
                $("#account-basic-info").children().eq(7).text(result.handsMargin);
                $("#account-basic-info").children().eq(9).text(result.occupyMargin);
                $("#account-basic-info").children().eq(11).text(result.usableBalance);
                $("#account-basic-info").children().eq(13).text(result.totalProfile);
                $("#account-basic-info").children().eq(15).text(result.marginLevel);

                $("#account-basic-info").children().eq(5).css("color",result.netWorthColor);
                $("#account-basic-info").children().eq(13).css("color",result.totalProfile < 0 ? "red" : "green");
                toastr.success("账户信息加载成功！");
            }
            else{
                toastr.error("账户信息加载失败！请确认是否登陆！");
            }
        },
        error: function (errorMsg) {
            console.log(errorMsg);
            //请求失败时执行该函数
            toastr.error("账户信息请求失败！请确认网络是否畅通！");
            console.log("用户信息加载失败！");
        }
    });
}




/******************************************************/
/*              用户相关操作                */
/****************************************************/
/*平仓*/
function offHands(name,hands,order,dir){
    var sell = $("#contract-op-button-sell .price").text();
    var buy = $("#contract-op-button-buy .price").text();
    var price = dir == "卖出" ? buy : sell;
    showmask(tradeWaitImg,"Handing . . .","Time：wait",name,"deal ",hands,price,"handing");
    $.ajax({
        type: "post",
        async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: '/OffHands?order=' + order + '&price=' + price,    //请求发送到TestServlet处
        data: {},
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            //请求成功时执行该函数内容，result即为服务器返回的json对象
            if (result) {
                if(result.success == false){
                    showmask(tradeWaitImg,"Deal Fail","Reason：" + result.msg,name,"Deal",hands,price,"");
                    return;
                }
            }
            showmask(tradeSuccImg,"Deal Success",result.time,name,"Deal",hands,price,order);
            HandsRefresh();
            AccountRefresh();
        },
        error: function (errorMsg) {
            //请求失败时执行该函数
            showmask(tradeWaitImg,"Deal Fail","Time：",name,"Deal",hands,price,"");
            return;
        }
    });
}

/*买卖按钮效果*/
function setSellBtn(){
    $("#contract-op-button-sell").click(function(){
        var price = $("#contract-op-sell-price").text();
        var hands = $("#config-hands-text").val();
        showmask(tradeWaitImg,"Handing","Time：wait",nowContract,"sell",hands,price,"handing");
        $.ajax({
            type: "post",
            async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
            url: '/Sell?price=' + price + '&name=' + nowContract+'&hands=' + hands,    //请求发送到TestServlet处
            data: {},
            dataType: "json",        //返回数据形式为json
            success: function (result) {
                if(result == null){
                    showmask(tradeWaitImg,"Open Fail","Reason：get null!",nowContract,"sell",hands,price,"");
                    return;
                }
                //请求成功时执行该函数内容，result即为服务器返回的json对象
                if (result) {
                    if(result.success == false){
                        showmask(tradeWaitImg,"Open Fail","Reason：" + result.msg,nowContract,"sell",hands,price,"");
                        return;
                    }
                    showmask(tradeSuccImg,"Open Success",result.time,nowContract,"sell",hands,price,result.order);
                    HandsRefresh();
                    AccountRefresh();
                }
            },
            error: function (errorMsg) {
                //请求失败时执行该函数
                showmask(tradeWaitImg,"Open Fail","Reason：connect fail",nowContract,"sell",hands,price,"");
                return;
            }
        });
    });
}
function setBuyBtn(){
    $("#contract-op-button-buy").click(function(){
        var price = $("#contract-op-button-buy .price").text();
        var hands = $("#config-hands-text").val();
        showmask(tradeWaitImg,"Handing","Time：wait",nowContract,"buy",hands,price,"handing");
        $.ajax({
            type: "post",
            async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
            url: '/Buy?price=' + price + '&name=' + nowContract+'&hands=' + hands,    //请求发送到TestServlet处
            data: {},
            dataType: "json",        //返回数据形式为json
            success: function (result) {
                //请求成功时执行该函数内容，result即为服务器返回的json对象
                if(result.success == false){
                    showmask(tradeWaitImg,"Open Fail","Reason：" + result.msg,nowContract,"buy",hands,price,"");
                    return;
                }
                showmask(tradeSuccImg,"Open Success",result.time,nowContract,"buy",hands,price,result.order);
                AccountRefresh();
                HandsRefresh();
            },
            error: function (errorMsg) {
                //请求失败时执行该函数
                showmask(tradeWaitImg,"Open Fail","Time：",nowContract,"buy",hands,price,"");
                //alert("交易失败!");
                return;
            }
        });
    });
}

/*设置合约历史记录记录周期时间*/
function setCircleClick(){
    $("#min-5").click(function () {
        klineType = "mini";
        klineCircle = 5;
        x_data = [];
        trade_data = [];

        /*重新加载k线图*/
        clearTimeout(KlineTimeOut);
        KlineInit("contract-kline");
    });
    $("#min-15").click(function () {
        klineType = "mini";
        klineCircle = 15;
        x_data = [];
        trade_data = [];

        /*重新加载k线图*/
        clearTimeout(KlineTimeOut);
        KlineInit("contract-kline");
    });
    $("#min-30").click(function () {
        klineType = "mini";
        klineCircle = 30;
        x_data = [];
        trade_data = [];

        /*重新加载k线图*/
        clearTimeout(KlineTimeOut);
        KlineInit("contract-kline");
    });
    $("#min-60").click(function () {
        klineType = "mini";
        klineCircle = 60;
        x_data = [];
        trade_data = [];

        /*重新加载k线图*/
        clearTimeout(KlineTimeOut);
        KlineInit("contract-kline");
    });
    $("#day").click(function () {
        klineType = "day";
        klineCircle = 1;
        x_data = [];
        trade_data = [];

        /*重新加载k线图*/
        clearTimeout(KlineTimeOut);
        KlineInit("contract-kline");
    });
    $("#kline").click(function () {
        if($(this).text() == "k线"){
            $(this).text("分析");
            x_data = [];
            trade_data = [];

            /*重新加载k线图*/
            clearTimeout(KlineTimeOut);
            KlineInit("contract-kline");
        }
        else if($(this).text() == "分析"){
            $(this).text("k线");
            analyzeX = [];
            analyzeY = [];
            analyzeY0 = [];
        }
    });
}

/*登陆注册*/
function setLoginClick(){
    $(".form-control").focusin(function(){
        $(this).css("border","none");
        $(this).css("border-bottom","1px solid gray");
    });
    $(".form-control").focusout(function(){
        var val = $(this).val();
        if(val == null || val == "")$(this).css("border-bottom","1px solid red");
    });
    $(".btn-login").click(function(){
        var name = $("#login-username").val();
        var password = $("#login-password").val();
        if(name == null || name == "")$("#login-username").css("border-bottom","1px solid red");
        else if(password == null || password == "")$("#login-password").css("border-bottom","1px solid red");
        else {
            toastr.info("正在登陆...请稍等...");
            $.ajax({
                type: "get",
                async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
                url: '/Login?username=' + name + "&password=" + password,    //请求发送到TestServlet处
                data: {},
                dataType: "json",        //返回数据形式为json
                success: function (result) {
                    if(result.status == 3) toastr.error("账户或密码错误！");
                    else {
                        $("#login-dialog").css("display","none");
                        $(".btns").html("<label class='username-label register' style='line-height: 50px;'>" + name + "</label><label class='username-label register' onclick='logout()' style='line-height: 50px;'>logout</label>");
                        AccountRefresh();
                        HandsRefresh();
                        DoneRefresh();
                        ProfileRefresh();
                        toastr.success("恭喜您！登陆成功！");
                        console.log("Login successful!")
                    }
                },
                error: function (errorMsg) {
                    //请求失败时执行该函数
                    toastr.error("服务器请求失败");
                    console.log("Faile to login!")
                }
            });
        }
    });
}
function setRegisterClick(){
    $(".form-control").focusin(function(){
        $(this).css("border","none");
        $(this).css("border-bottom","1px solid gray");
    });
    $(".form-control").focusout(function(){
        var val = $(this).val();
        if(val == null || val == "")$(this).css("border-bottom","1px solid red");
    });
    $(".btn-register").click(function(){
        var name            = $("#register_username").val();
        var password        = $("#register_password").val();
        var comfirmPassword = $("#confirm_password").val();
        var email           = $("#register_email").val();
        var age             = $("#register_age").val();

        if(name == null || name == "")$("#register_username").css("border-bottom","1px solid red");
        else if(password == null || password == "")$("#register_password").css("border-bottom","1px solid red");
        else if(password != comfirmPassword)$("#confirm_password").css("border-bottom","1px solid red");
        else if(email == null || email == "")$("#register_email").css("border-bottom","1px solid red");
        else if(age == null || age == "")$("#register_age").css("border-bottom","1px solid red");
        else {
            toastr.info("正在注册...请稍等...");
            $.ajax({
                type: "post",
                async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
                url: '/Register?username=' + name + "&password=" + password + "&email=" + email + "&age=" + age,    //请求发送到TestServlet处
                data: {},
                dataType: "json",        //返回数据形式为json
                success: function (result) {
                    if(result.status == 3) toastr.error("邮箱已存在");
                    else {
                        $("#register-dialog").css("display","none");
                        $(".btns").html("<label class='username-label register' style='line-height: 50px;'>" + email + "</label><label class='username-label register' onclick='logout()' style='line-height: 50px;'>logout</label>")
                        HandsRefresh();
                        AccountRefresh();
                        DoneRefresh();
                        ProfileRefresh();
                        toastr.success("恭喜您！注册成功！");
                    }
                },
                error: function (errorMsg) {
                    //请求失败时执行该函数
                    toastr.error("服务器请求失败");
                }
            });
        }
    });
}
function logout(){
    toastr.info("正在登出...请稍等...");
    $.ajax({
        type: "get",
        async: true,            //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: '/Logout',    //请求发送到TestServlet处
        data: {},
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            $(".btns").html('<label class="username-label register register-label" data-toggle="modal" data-target="#register-dialog"style="line-height: 50px;">Register</label><label class="username-label login" data-toggle="modal" data-target="#login-dialog" style="line-height: 50px;">Login</label>');
            HandsRefresh();
            AccountRefresh();
            DoneRefresh();
            ProfileRefresh();
            toastr.success("退出成功！");
        },
        error: function (errorMsg) {
            //请求失败时执行该函数
            toastr.error("服务器请求失败");
        }
    });
}


/**********************************************************/
/*                      计时器                            */
/**********************************************************/
function timeRefresh(){
    var currentTime = new Date();

    $(".time").html(currentTime);
    setTimeout(timeRefresh,100);
}