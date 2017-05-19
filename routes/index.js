
var express = require('express');
var http = require('http');
var fs = require('fs');
var async = require('async');
var url = require('url');
var request = require('request');

var User = require('../models/user.js');

var router = express.Router();
var test_x = [
  "2013/2/7", "2013/2/8", "2013/2/18", "2013/2/19", "2013/2/20",
   "2013/2/21", "2013/2/22", "2013/2/25", "2013/2/26", "2013/2/27",
   "2013/2/28", "2013/3/1", "2013/3/4", "2013/3/5", "2013/3/6",
   "2013/3/7", "2013/3/8", "2013/3/11", "2013/3/12", "2013/3/13",
   "2013/3/14", "2013/3/15", "2013/3/18", "2013/3/19", "2013/3/20",
   "2013/3/21", "2013/3/22", "2013/3/25", "2013/3/26", "2013/3/27",
   "2013/3/28", "2013/3/29", "2013/4/1", "2013/4/2", "2013/4/3",
   "2013/4/8", "2013/4/9", "2013/4/10", "2013/4/11", "2013/4/12",
   "2013/4/15", "2013/4/16", "2013/4/17", "2013/4/18", "2013/4/19",
   "2013/4/22", "2013/4/23", "2013/4/24", "2013/4/25", "2013/4/26",
   "2013/5/2", "2013/5/3", "2013/5/6", "2013/5/7", "2013/5/8",
   "2013/5/9", "2013/5/10", "2013/5/13", "2013/5/14", "2013/5/15",
   "2013/5/16", "2013/5/17", "2013/5/20", "2013/5/21", "2013/5/22",
   "2013/5/23", "2013/5/24", "2013/5/27", "2013/5/28", "2013/5/29",
   "2013/5/30", "2013/5/31", "2013/6/3", "2013/6/4", "2013/6/5",
   "2013/6/6", "2013/6/7", "2013/6/13"
];
var test_trade = [ // 开盘，收盘，最低，最高
];


var HOSTIP = "http://127.0.0.1:8088";
//support 5/15/30/60/day
var circle = 5;
var SINAURLDAILY = "http://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesDailyKLine?symbol=";
var SINAURLMINI = "http://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesMiniKLine" + circle + "m?symbol=";
var SINAURL = SINAURLMINI;



var last_trade_price = 0;

// module.exports = router;
module.exports = function (app) {

    app.get('/test',function (req,res) {
            res.render("test");
    });

    app.get('/', function(req, res) {
        console.log("its index");

        var newsBasicArr = [];

        /*异步并行处理函数*/
        async.parallel([
                /*获取合约基本信息列表*/
                function (callback) {
                    http.get(HOSTIP + '/news/index', function (res) {
                        var json = '';
                        res.on('data', function (d) {
                            json += d;
                        });
                        res.on('end', function () {
                            console.log("json" + json);
                            newsBasicArr = JSON.parse(json);
                            callback(res);
                        }).on('error', function (e) {
                            console.log(e);
                        });
                    });
                }
            ],
            function (response) {
                console.log("its news" + newsBasicArr);
                var resp = {
                    title: 'index',
                    newsBasicArr: newsBasicArr,
                    user: req.session.user
                };
                res.render('index', resp);
            }
        );
    });

    app.get('/index', function (req, res) {
        console.log("its index");

        var newsBasicArr = [];

        /*异步并行处理函数*/
        async.parallel([
                /*获取合约基本信息列表*/
                function (callback) {
                    http.get(HOSTIP + '/news/index', function (res) {
                        var json = '';
                        res.on('data', function (d) {
                            json += d;
                        });
                        res.on('end', function () {
                            console.log("json" + json);
                            newsBasicArr = JSON.parse(json);
                            callback(res);
                        }).on('error', function (e) {
                            console.log(e);
                        });
                    });
                }
            ],
            function (response) {
                console.log("its news" + newsBasicArr);
                var resp = {
                    title: 'index',
                    newsBasicArr: newsBasicArr,
                    user: req.session.user
                };
                res.render('index', resp);
            }
        );
    });

    app.get('/tradehome', function(req, res) {

        var contractBasicInfoArr = [];

        /*异步并行处理函数*/
        async.parallel([
            /*获取合约基本信息列表*/
            function(callback){
                http.get(HOSTIP + '/contract/contract_basic_list',function (res) {
                    var json = '';
                    res.on('data',function (d) {
                        json+=d;
                    });
                    res.on('end',function () {
                        console.log(json);
                        contractBasicInfoArr = JSON.parse(json);
                        callback(res);
                    }).on('error',function(e){
                        console.log(e);
                    });
                });
            }
        ],
            function(response){
                console.log("its contract" + contractBasicInfoArr);
                var response = {
                    title: 'Express',
                    user: req.session.user,
                    contractBasicInfoArr:contractBasicInfoArr
                };
                res.render('tradeHome',response);
            }
        );
    });

    /*向后端发送买卖和平仓操作*/
    app.post('/Sell',function(req,res){
        console.log("目的：发送卖合约请求，参数：price=" + req.query.price + "&name=" + req.query.name+"&hands=" + req.query.hands);

        if(req.session.user == null){
            result = {
                success:false,
                msg:"您还未登录",
                time:"2015",
                // order: 
            };
            res.end(JSON.stringify(result));
            return ;
        }

        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/user/sell?name=' + req.query.name + "&price=" + req.query.price + "&hands=" + req.query.hands + "&email=" + req.session.user.email,
            method: 'GET',
            json: true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('----info------sell----',data);

                var result;
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else {
                    result = {
                        success:data.success,
                        msg:data.msg,
                        time:data.time,
                        order:data.order
                    };
                }
                res.end(JSON.stringify(result));
            }
            else{
                console.log('----info------sell----error');
                var result;
                res.end(JSON.stringify(result));
            }
        }

        request(options, callback);
    });
    app.post('/Buy',function(req,res){
        if(req.session.user == null){
            result = {
                success:false,
                msg:"您还未登录",
                time:"2015",
                // order: 
            };
            res.end(JSON.stringify(result));
            return ;
        }
        console.log("目的：发送买合约请求，参数：price=" + req.query.price + "&name=" + req.query.name+"&hands=" + req.query.hands);

        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/user/buy?name=' + req.query.name + "&price=" + req.query.price + "&hands=" + req.query.hands + "&email=" + req.session.user.email,
            method: 'GET',
            json: true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('----info------buy----',data);

                var result;
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else {
                    result = {
                        success:data.success,
                        msg:data.msg,
                        time:data.time,
                        order:data.order
                    };
                }
                res.end(JSON.stringify(result));
            }
            else{
                console.log('----info------sell----error');
                var result;
                res.end(JSON.stringify(result));
            }
        }

        request(options, callback);
    });
    app.post('/OffHands',function (req,res) {

        if(req.session.user == null){
            result = {
                success:false,
                msg:"您还未登录",
                time:"2015",
                // order: 
            };
            res.end(JSON.stringify(result));
            return ;
        }

        console.log("目的：发送平仓请求，参数：price=" + req.query.price + "&order=" + req.query.order);

        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/user/offhands?order=' + req.query.order + "&price=" + req.query.price + "&email=" + req.session.user.email,
            method: 'GET',
            json: true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('----info------offhands----',data);

                var result;
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else {
                    result = {
                        success:data.success,
                        msg:data.msg,
                        time:data.time,
                        order:data.order
                    };
                }
                res.end(JSON.stringify(result));
            }
            else{
                console.log('----info------offhands----error');
                var result;
                res.end(JSON.stringify(result));
            }
        }

        request(options, callback);
    });

    /*请求后端获取账户信息*/
    app.post('/AccountRefresh',function (req,res) {
        console.log("目的：加载账户信息，参数：无");
         if(req.session.user == null){
            return ;
        }
        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/user/accountrefresh?email=' + req.session.user.email,
            method: 'GET',
            json: true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('----info------account----',data);

                var result;
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else {
                    result = {
                        account: data.account,
                        balance: data.balance,
                        netWorth: data.netWorth,
                        netWorthColor: data.netWorthColor,
                        handsMargin: data.handsMargin,
                        occupyMargin: data.occupyMargin,
                        usableBalance: data.usableBalance,
                        totalProfile: data.totalProfile,
                        marginLevel: data.marginLevel
                    };
                }
                res.end(JSON.stringify(result));
            }
        }

        request(options, callback);
    });

    /*请求后端获取当日盈亏*/
    app.post('/ProfileRefresh',function (req,res) {
        console.log("目的：加载当日盈亏，参数：无");
         if(req.session.user == null){
            return ;
        }
        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/user/profilerefresh?email='+req.session.user.email,
            method: 'GET',
            json: true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('----info------profile----',data);

                var result = [];
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else{
                    for(var i = data.length-1 ; i >= 0 ; i--) {
                        result.push({
                            name: data[i].name,
                            dir: data[i].dir,
                            hands: data[i].hands,
                            tradeType: data[i].tradeType,
                            openPrice: data[i].openPrice,
                            offPrice: data[i].offPrice,
                            interest: data[i].interest,
                            rebate: data[i].rebate,
                            profile: data[i].profile,
                            doneID: data[i].doneID,
                            handsID: data[i].handsID,
                            openTime: data[i].openTime,
                            openTime: data[i].openTime,
                            doneTime: data[i].doneTime
                        });
                    }
                }
                res.end(JSON.stringify(result));
            }
        }
        request(options, callback);
    });

    /*请求后端获取当日成交*/
    app.post('/DoneRefresh',function (req,res) {
        console.log("目的：加载当日成交，参数：无");
         if(req.session.user == null){
            return ;
        }
        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/user/donerefresh?email=' + req.session.user.email,
            method:'GET',
            json: true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('----info------done----',data);

                var result = [];
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else{
                    for(var i = data.length-1 ; i >= 0 ; i--) {
                        result.push({
                            doneID: data[i].doneID,
                            orderID: data[i].orderID,
                            name: data[i].name,
                            tradeType: data[i].tradeType,
                            opType: data[i].opType,
                            dir: data[i].dir,
                            hands: data[i].hands,
                            rebate: data[i].rebate,
                            donePrice: data[i].donePrice,
                            profit: data[i].profit,
                            time: data[i].time,
                            note: data[i].note
                        });
                    }
                }
                res.end(JSON.stringify(result));
            }
        }
        request(options, callback);
    });

    /*请求后端获取持仓列表*/
    app.post('/HandsRefresh',function (req,res) {
         if(req.session.user == null){
            return ;
        }
        console.log("目的：加载持仓列表，参数：无");
        if(req.session.user == null){
            return ;
        }
        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/user/handsRefresh?email=' + req.session.user.email,
            method: 'GET',
            json: true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('----info------hands----',data);

                var result = [];
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else{
                    for(var i = data.length-1 ; i >= 0 ; i--) {
                        result.push({
                            name: data[i].name,
                            dir: data[i].dir,
                            hands: data[i].hands,
                            openPrice: data[i].openPrice,
                            closePrice: data[i].closePrice,
                            stopLoss: data[i].stopLoss,
                            stopWin: data[i].stopWin,
                            rebate: data[i].rebate,
                            interest: data[i].interest,
                            profit: data[i].profit,
                            time: data[i].time,
                            order: data[i].order
                        });
                    }
                }
                res.end(JSON.stringify(result));
            }
        }

        request(options, callback);
    });

    /*请求后端获取合约详情*/
    app.post('/ContractDetailRefresh',function(req,res){
        console.log("目的：加载历史交易信息，参数：" + req.query.name);

        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/contract/item?name=' + req.query.name,
            method: 'GET',
            json:true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('----info------detail----',data);

                var result = [];
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else{
                    result.push({
                        name:req.query.name,
                        contMultUnit:data.contMultNum + data.contMultUnit,
                        priceUnit:data.priceUnit,
                        minChgPriceUnit:data.minChgPriceNum + data.minChgPriceUnit,
                        limitUpUnit:data.limitUpNum + data.limitUpUnit,
                        deliMonth:data.deliMonth,
                        tradingTime:"每周一至周五上午9:00～11:30，下午13:30～15:00",
                        lastTradeDate:data.lastTradeDate,
                        lastDeliDate:data.lastDeliDate,
                        deliGrade:data.deliGrade,
                        tradeMarginRatio:"合约价值的" + data.tradeMarginRatio + "%",
                        tradeCommi:data.tradeCommiNum + data.tradeCommiUnit,
                        deliMethod:data.deliMethod,
                        contractObject:data.contractObject,
                        exchangeCD:data.exchangeCD

                    });
                }
                res.end(JSON.stringify(result));
            }
        }

        request(options, callback);
    });

    /*请求后端获取合约实时交易信息*/
    app.post('/ContractRefresh',function (req,res) {
        console.log("目的：获取合约列表的实时交易信息，参数：" + req.query.names);

        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/contract/trade_refresh?names=' + req.query.names,
            method: 'GET',
            json:true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                //console.log('----info------',data);

                var result = [];
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else{
                    for(var i = data.length-1 ; i >= 0 ; i--){
                        result.push({id:i,name:data[i].name,sell:data[i].sell,buy:data[i].buy,point:data[i].point,highest:data[i].highest,lowest:data[i].lowest,open:data[i].open,closed:data[i].closed,buyRate:data[i].open_Interest,sellRate:data[i].volume});
                    }
                }
                res.end(JSON.stringify(result));
            }
        }
        request(options, callback);
    });

    /*请求新浪财经获取k线图数据*/
    app.get('/KLineInit',function(req,res){
    });
    app.post('/KLineInit',function(req,res){
        console.log('----info------k线图加载');
        var type = req.query.type;
        var req_circle = req.query.circle;
        if(type == "day"){
            SINAURL = SINAURLDAILY;
        }
        else{
            circle = req_circle;
            SINAURL = "http://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesMiniKLine" + circle + "m?symbol=";
        }
        console.log("SINAURL:" + SINAURL);

        var options = {
            headers: {"Connection": "close"},
            url: SINAURL+req.query.name,
            method: 'POST',
            json:true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                //console.log('----info------',data);
                var result = [];
                if(data == null){ //如果获取到的数据为空，就返回空数组
                    res.end(JSON.stringify(result));
                }
                else{
                    for(var i = data.length-1 ; i >= 0 ; i--){
                        result.push({x_data: data[i][0],trade_data:[data[i][1],data[i][4],data[i][3],data[i][2]]});
                    }
                }
                res.end(JSON.stringify(result));
            }
        }
        request(options, callback);
  });

    /*请求后端获得分析信息*/
    app.post('/analyzeInit',function(req,res){

        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/contract/predict_price?name=' + req.query.name + '&type=' + req.query.type,
            method: 'POST',
            json:true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                //console.log('----info------',data);

                var result = [];
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else{
                    for(var i = data.length-1 ; i >= 0 ; i--){
                        result.push({x: data[i].time, y: data[i].price,y0:data[i].predict});
                    }
                }
                res.end(JSON.stringify(result));
            }
        }
        request(options, callback);
    });

    /*请求后端获取推荐新闻*/
    app.post('/RelativeNewsRefresh',function(req,res){

        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/contract/relate_news?name=' + req.query.name,
            method: 'POST',
            json:true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                //console.log('----info------',data);

                var result = [];
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else{
                    for(var i = data.length-1 ; i >= 0 ; i--){
                        result.push({title:data[i].title,url:data[i].url,related:data[i].related,id:data[i].id});
                    }
                }
                res.end(JSON.stringify(result));
            }
        }
        request(options, callback);
    });

    /*此路由作废*/
    app.get('/KLineRefresh',function () {

  });
    app.post('/KLineRefresh',function(req,res){
        console.log("目的：刷新k线图初始数据，参数：" + req.query.name);

        var result = [];

        if(test_x.length <= 0 || test_trade.length <= 0)res.end(JSON.stringify(result));

        result.push({x_data: test_x.shift(),trade_data:test_trade.shift()});

        res.end(JSON.stringify(result));
  });













    app.get('/TradeInfo',function(req,res){
        console.log("目的：获取合约列表的实时交易信息，参数：" + req.query.names);

        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/contract/trade_info',
            method: 'GET',
            json:true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('----info------',data);

                var result = [];
                if(data == null){
                    res.end(JSON.stringify(result));
                }
                else{
                    for(var i = data.length-1 ; i >= 0 ; i--){
                        result.push({id:data.length - i,
                            name:data[i].name,
                            sell:data[i].ask,
                            buy:data[i].bid,
                            point:data[i].point,
                            highest:data[i].highest_price,
                            lowest:data[i].lowest_price,
                            open:data[i].opening_price,
                            closed:data[i].yesterday_closing_price,
                            buyRate:data[i].open_Interest,
                            sellRate:data[i].volume,
                            latest_price:data[i].latest_price,
                            settlement_price:data[i].settlement_Price,
                            yesterday_settlement_price:data[i].yesterday_settlement_price,
                            date:data[i].date});
                    }
                }
                res.end(JSON.stringify(result));
            }
        }
        request(options, callback);

    });

    app.post('/Register',function(req,res){
        console.log('目的：用户注册，参数：username=' + req.query.username + '&password=' + req.query.password + '&email=' + req.query.email + '&age=' + req.query.age);

        var newUser = new User({
            name: req.query.username,
            password: req.query.password,
            email: req.query.email,
            age: req.query.age
        });

        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/user/register?username=' + req.query.username + '&password=' + req.query.password + '&email=' + req.query.email + '&age=' + req.query.age,
            method: 'GET',
            json:true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('----info------',data);
                if(data.status == 0){
                    req.session.user = newUser;
                }
                console.log('----info------',req.session.user);
                var result = null;
                if(data == null){
                    res.end(JSON.stringify(result));
                    res.redirect('/');
                }
                else{

                    result = {
                        status:data.status
                    }
                }
                res.end(JSON.stringify(data));
            }
        }
        request(options, callback);

    });

    app.get('/Login',function(req,res){
        console.log('目的：用户登陆，参数：username=' + req.query.username + '&password=' + req.query.password);
        var newUser = new User({
            email: req.query.username,
            password: req.query.password,
        });
        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/user/login?email=' + req.query.username + '&password=' + req.query.password,
            method: 'GET',
            json:true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                if(data.status == 0){
                    console.log('----info------',data);
                    req.session.user = newUser;
                    console.log('----info------',req.session.user);
                    var result = null;
                    if(data == null){
                        res.end(JSON.stringify(result));
                    }
                    else{
                        result = {
                            status:data.status
                        }
                    }
                    res.end(JSON.stringify(data));
                }else{
                    var result = null;
                    result = {
                            status:data.status
                    }
                    res.end(JSON.stringify(data));
                }
                
            }
        }
        request(options, callback);

    });

    app.get('/Logout', function(req, res){
        req.session.user = null;
        res.end(JSON.stringify({}));
    });

    app.get('/userinfo',function(req,res){
        console.log("its userinfo");

        var userinfo = [];
        /*异步并行处理函数*/
        async.parallel([
                /*获取合约基本信息列表*/
                function (callback) {
                    http.get(HOSTIP + '/user/user_info?email=' + req.session.user.email, function (res) {
                        var json = '';
                        res.on('data', function (d) {
                            json += d;
                        });
                        res.on('end', function () {
                            console.log("json" + json);
                            // userinfo = json;
                            userinfo = JSON.parse(json);
                            callback(res);
                        }).on('error', function (e) {
                            console.log(e);
                        });
                    });
                }
            ],
            function (response) {
                console.log("its userinfo" + userinfo);
                var resp = {
                    userinfo: userinfo,
                    user: req.session.user,
                };
                res.render('user_info', resp);
            }
        );
    });

    /*向后端申请补助*/
    app.get('/ApplyAids',function(req,res){
        var result = {
          status:0
        };

        res.end(JSON.stringify(result));
    });

    app.get('/editUserInfo',function(req,res){
        console.log('目的：修改账户信息，参数：username=' + req.query.username);
        var options = {
            headers: {"Connection": "close"},
            url: HOSTIP + '/user/editUserInfo?email=' + req.session.user.email + '&age=' + req.query.age + '&sex=' + req.query.sex + '&username=' + req.query.username,
            method: 'GET',
            json:true,
            body: {}
        };
        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                if(data.status == 0){
                    console.log('----info------',data);
                    var result = null;
                    if(data == null){
                        res.end(JSON.stringify(result));
                    }
                    else{
                        result = {
                            status:data.status
                        }
                    }
                    res.end(JSON.stringify(data));
                }else{
                    var result = null;
                    result = {
                        status:data.status
                    }
                    res.end(JSON.stringify(data));
                }
                
            }
        }
        request(options, callback);
    });

    app.get('/accountInfo',function (req,res) {
        console.log("its accountInfo");

        var accountInfo = [];
        /*异步并行处理函数*/
        async.parallel([
                /*获取合约基本信息列表*/
                function (callback) {
                    http.get(HOSTIP + '/user/account_info?email=' + req.session.user.email, function (res) {
                        var json = '';
                        res.on('data', function (d) {
                            json += d;
                        });
                        res.on('end', function () {
                            console.log("json" + json);
                            // userinfo = json;
                            accountInfo = JSON.parse(json);
                            callback(res);
                        }).on('error', function (e) {
                            console.log(e);
                        });
                    });
                }
            ],
            function (response) {
                console.log("its accountInfo" + accountInfo);
                var resp = {
                    accountInfo: accountInfo,
                    user:req.session.user
                };
                res.render('account_info', resp);
            }
        );
    });

    app.get('/tradeRecord',function(req,res){
        console.log("its tradeRecord");

        var tradeRecord = [];
        /*异步并行处理函数*/
        async.parallel([
                /*获取合约基本信息列表*/
                function (callback) {
                    http.get(HOSTIP + '/user/trade_record?email=' + req.session.user.email, function (res) {
                        var json = '';
                        res.on('data', function (d) {
                            json += d;
                        });
                        res.on('end', function () {
                            console.log("json" + json);
                            // userinfo = json;
                            tradeRecord = JSON.parse(json);
                            callback(res);
                        }).on('error', function (e) {
                            console.log(e);
                        });
                    });
                }
            ],
            function (response) {
                console.log("its accountInfo" + tradeRecord);
                var resp = {
                    tradeRecord: tradeRecord,
                    user:req.session.user
                };
                res.render('trade_record', resp);
            }
        );
    });


    /*新闻板块*/
    app.get('/newshome', function (req, res) {
        console.log("its newshome");

        var newsBasicArr = [];

        /*异步并行处理函数*/
        async.parallel([
                /*获取合约基本信息列表*/
                function (callback) {
                    http.get(HOSTIP + '/news/index', function (res) {
                        var json = '';
                        res.on('data', function (d) {
                            json += d;
                        });
                        res.on('end', function () {
                            console.log("json" + json);
                            newsBasicArr = JSON.parse(json);
                            callback(res);
                        }).on('error', function (e) {
                            console.log(e);
                        });
                    });
                }
            ],
            function (response) {
                console.log("its news" + newsBasicArr);
                var resp = {
                    title: 'nwesHome',
                    newsBasicArr: newsBasicArr,
                    user:req.session.user
                };
                res.render('news', resp);
            }
        );
    });

    app.get('/newsdetail', function (req, res) {
        console.log("its newsdetail");

        var newsDetail = [];
        /*异步并行处理函数*/
        async.parallel([
                /*获取合约基本信息列表*/
                function (callback) {
                    http.get(HOSTIP + '/news/details?id=' + req.query.id, function (res) {
                        var json = '';
                        res.on('data', function (d) {
                            json += d;
                        });
                        res.on('end', function () {
                            console.log("json" + json);
                            newsDetail = JSON.parse(json);
                            callback(res);
                        }).on('error', function (e) {
                            console.log(e);
                        });
                    });
                }
            ],
            function (response) {
                console.log("its newsDetail" + newsDetail);
                var resp = {
                    title: 'nwesHome',
                    newsDetail: newsDetail,
                    user:req.session.user
                };
                res.render('news_detail', resp);
            }
        );
    });

    app.get('/newssearch', function (req, res) {
        console.log("its newssearch");
        var newsArr = [];

        /*异步并行处理函数*/
        async.parallel([
                /*获取合约基本信息列表*/
                function (callback) {
                    http.get(HOSTIP + '/news/search?page=' + req.query.page + '&keyword=' + req.query.keyword, function (res) {
                        var json = '';
                        res.on('data', function (d) {
                            json += d;
                        });
                        res.on('end', function () {
                            console.log("json" + json);
                            newsArr = JSON.parse(json);
                            callback(res);
                        }).on('error', function (e) {
                            console.log(e);
                        });
                    });
                }
            ],
            function (response) {
                console.log("its newsArr" + newsArr);
                var resp = {
                    title: 'nwesHome',
                    newsArr: newsArr,
                    keyword:req.query.keyword,
                    user:req.session.user
                };
                res.render('news_search', resp);
            }
        );
    });

};
