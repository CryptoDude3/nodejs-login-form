// Require express and create an instance of it
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
const sha256 = require('js-sha256').sha256;
const bodyParser = require('body-parser');
const session = require("express-session");
const cookieParser = require('cookie-parser');
const filestore = require("session-file-store")(session);
const Transform = require('stream').Transform;
const parser = new Transform();
const newLineStream = require('new-line');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    name: "session-id",
    secret: "8ljpEfeW1KYtPknps88n8Jh8i04WMgiPILTXXLeJl69NROIF4I", // Secret key,
    saveUninitialized: false,
    resave: false,
    store: new filestore()
}));
// on the request to root (localhost:3000/)
app.get('/', function (req, res) {
if(!req.session.user){
var file = fs.readFileSync('login.html', 'utf8');
if(file){
if(req.session.err){
var file = file.replace('replaceit',req.session.err);req.session.destroy();
}else{var file = file.replace('replaceit','');}
res.send(file);
}
}
else {res.redirect("/user");}
});
// On localhost:3000/welcome
app.get('/signup',function(req,res){
res.sendFile(path.join(__dirname, '/signup.html'));
});
app.post('/signups',function(req,res){
var accounts = JSON.parse(fs.readFileSync("accounts.json"));
var hash = sha256.hmac('r0CFyl8s3uv5LYEsQQe1YRvlUVg2OvSeeslS07rUk25EkcuhOl', req.body.password);
var ids = req.body.username+"farrtymchargy3141592"+"gIGpgPvPw7wUJsBqOsjTRADvEYfFGhWGeY3NiM8nMLnNoPp4Cx"+"mustusecryptographichashfunctionsm"+req.body.password+"SFEiQSKwJZSVegzQGLfXkoHGyIRvEb2UuiOYnjlLGO30FLKMqP"+(Math.random()*9).toString()+(Math.random()*64).toString();
var id=sha256.hmac('PfaBvnlTwPgUEcfB2G9VK3D2vet8oiDl67tNYK89ce7rUUpL7D', ids);
console.log(req.body);
console.log(hash);
console.log("ID: " + id);
var write = true;
	accounts.forEach(function(i){
    	if(i[0]===req.body.username){
	write = false; res.send("This username is taken!");
	}
	});
	if(write){
accounts.push([req.body.username,hash,id])
fs.writeFileSync("accounts.json",JSON.stringify(accounts));
res.send("Sign up successful! Your id is:<br>" + id);
		}
});
app.post('/logins',function(req,res){
var accounts = JSON.parse(fs.readFileSync("accounts.json"));
if(!accounts.forEach){accounts = [];}
var hash = sha256.hmac('r0CFyl8s3uv5LYEsQQe1YRvlUVg2OvSeeslS07rUk25EkcuhOl', req.body.password);
var err=true;
for (var i = 0;i<accounts.length;i++){
if(accounts[i][0]===req.body.username&accounts[i][1]===hash){
req.session.user=accounts[i][2];
req.session.username=accounts[i][0];
err=false;
res.redirect('/user');
}}
if(err){
req.session.err = "Invalid username/password. Please try again.";
}
res.redirect('/');
});
//sign in with id add feature
app.get('/user',function(req,res){
if(req.session.user){
res.send("<h2>Hi, " + req.session.username + "!</h2><br><a href='/signout'>Log out</a><br>Your id is: "+ req.session.user);
}
else {
res.redirect("/");
}
});
app.get('/signout',function(req,res){
if(req.session.user){
req.session.destroy();
res.clearCookie('session-id');
res.redirect("/");
}
});
// Change the 404 message modifing the middleware
app.use(function(req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
});
app.use(express.static(path.join(__dirname, 'public')));
// start the server in the port 80 !
app.listen(80, function () {
    console.log('Example app listening on port 80.');
});
