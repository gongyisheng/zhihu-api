const Koa = require('koa');//类
const koabody = require('koa-body');
const koastatic = require('koa-static');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const mongoose = require('mongoose');
const path = require('path');
//实例化
const app = new Koa();
const routing = require('./routes');
const {connectionStr} = require('./config');
mongoose.connect(connectionStr,() => console.log('database connected'));
mongoose.connection.on('error',console.error);

app.use(koastatic(path.join(__dirname,'/public')));
app.use(error({
    postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production'? rest : {stack,...rest}
}));
app.use(koabody({
    multipart: true,//支持文件
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true
    }
}));
app.use(parameter(app));
routing(app);

app.listen(3000,() => console.log("APP started in port 3000"));//监听端口
