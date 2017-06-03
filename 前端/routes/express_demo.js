/**
 * Created by Administrator on 2016/12/2.
 */
var express = require("express");
var http = require("http")
var app = express();
var bodyParser = require('body-parser')
var fs = require("fs")
var multer = require("multer")
var cookieParser = require('cookie-parser')

//创建application/x-www-form-urlencoded编码解析
var urlencodedParser = bodyParser.urlencoded({extended:false})

//路由访问静态文件：http://127.0.0.1:8081/images/logo.png
app.use(express.static('public'))

app.use(multer({dest:'/tmp/'}).array('image'))
app.use(cookieParser());



/**********************************************************************************************************************************/
/********************************************************get and post**************************************************************/
/**********************************************************************************************************************************/

//处理get请求
app.get("/",function(req,res){
    console.log("来自主页的GET请求")
    console.log("Cookies:",req.cookies)


    http.get("http://127.0.0.1:8081/del_user", function(res) {

    });

    var p1=new

    res.send("Hello Get");
})

//处理Post请求
app.post("/",function (req,res) {
    console.log("来自主页的POST请求")


    http.get("http://www.google.com/index.html", function(res) {
        console.log("Got response: " + res.statusCode);
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });




    res.send("Hello Post")
})



// /del_user 页面响应
app.get("/del_user",function(req,res){
    console.log("来自del_user的Get请求")
    var response = {
        first_name:2,
        last_name:3
    };
    console.log(response);
    res.end(JSON.stringify(response));
    res.send("删除页面")
})

// /list_user页面的Get请求
app.get("/list_user",function(req,res){
    console.log("来自list_user的Get请求")
    res.send("用户列表页面")
})

//对 页面 abcd,abxcd,ab123cd等响应Get请求
app.get("/ab*cd" ,function(req,res) {
    console.log("/ab*cd Get 请求")
    res.send("正则匹配")
})

//对 index.html页面响应
app.get("/index.html",function (req,res) {
    res.sendFile(__dirname+"/"+"index.html")
})

//处理process_on页面
app.get('/process_get', function (req, res) {

    // 输出 JSON 格式
    var response = {
        first_name:req.query.first_name,
        last_name:req.query.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
})
app.post('/process_post',urlencodedParser, function (req, res) {

    // 输出 JSON 格式
    var response = {
        first_name:req.body.first_name,
        last_name:req.body.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
})
/*file POST*/
app.post('/file_upload',urlencodedParser, function (req, res) {

    console.log(req.files[0]);  // 上传的文件信息

    var des_file = __dirname + "/" + req.files[0].originalname;
    fs.readFile( req.files[0].path, function (err, data) {
        fs.writeFile(des_file, data, function (err) {
            if( err ){
                console.log( err );
            }else{
                var response = {
                    message:'File uploaded successfully',
                    filename:req.files[0].originalname
                };
            }
            console.log( response );
            res.end( JSON.stringify( response ) );
        });
    });
})
/**********************************************************************************************************************************/
/**********************************************************************************************************************************/





var server = app.listen(8081,function(){
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s",host,port)
})
