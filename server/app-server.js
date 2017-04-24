var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var ejs = require('ejs');
var fs = require('fs');

var dbUrl = 'mongodb://localhost:27017/icon';
mongoose.connect(dbUrl);

// models loading
var models_path = path.join(__dirname, 'Models');
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      }
      else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}
walk(models_path)

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../dist'));

app.engine('html', ejs.__express);
app.set('view engine', 'html');

var uploadFolder = path.join(__dirname, '..', 'dist', 'upload');

// console.log(uploadFolder);

// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, file.originalname);  
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ storage: storage })

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../dist')));


// //设置跨域访问
// app.all('*', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     // res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     // res.header("Access-Control-Allow-Headers", "Content-Type");
//     res.header("Access-Control-Allow-Headers", "*");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By",' 3.2.1');
//     // res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });

// app.options('/*', function(req, res, next) {
//   res.json({status:'OK'});
// });

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header("Access-Control-Allow-Headers", "Content-Type");
    // res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.options('/*', function(req, res, next) {
  res.json({status:'OK'});
});

app.post('/api/uploadIcon', upload.single('icon'), function(req, res, next) {
  res.json({status:'OK',file:req.file,body:req.body});
});
// app.post('/api/uploadIcon', function(req, res, next) {
//   res.json({status:'OK',file:req.file,body:req.body});
// });

require('./route/routes')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({error: res.locals.message});
});

module.exports = app;
