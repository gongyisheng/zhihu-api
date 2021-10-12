const {db_username,db_password,jwt_secret} = require('./security');

module.exports = {
    secret: `${jwt_secret}`,
    connectionStr: `mongodb+srv://${db_username}:${db_password}@zhihu-api.x0ji2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
}