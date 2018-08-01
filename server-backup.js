/**
 * Created by monicaz on 2017-Mar-15.
 */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
//var port = process.env.PORT;
var port = 8080;

var index = require('./routes/index');
var profiles = require('./routes/profiles-backup');

var app = express();

// Set Static folder
app.use(express.static(path.join(__dirname, '/public')));

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html',require("ejs").renderFile);

// Body Parser MW
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', index);
app.use('/api', profiles);
/*
 // Connect to the database server running on this machine
 mongoose.Promise = global.Promise;
 mongoose.connect('mongodb://localhost:27017/bears');
 var db = mongoose.connection;
 db.on('error', console.error.bind(console, 'connection error:'));
 db.once('open', function() {
 console.log('1. Connected to database');// we're connected!
 });

 // Define the schema for our database record (row)
 var Schema = mongoose.Schema;

 var User = new Schema({
 name: { type:String, required: true},
 email: { type:String, required: true},
 age: { type: Number, required: false, max:100, min:0},
 gender: { type:String, required: false},
 image:{ type:String, required: false},
 modified: { type: Date, default: Date.now }
 });

 // Create the prototype object that we will use to create all bears
 //var UserModel = mongoose.model('User', User);

 // Error handling function. See http://mongoosejs.com/docs/api.html#model_Model-save for details
 // We declare this separately since we need to use it multiple times.
 function mongoError(err, record) {
 if (err) {
 console.log("2. Could not save " + record.name + ": " + err);
 }
 else {
 console.log("2. Saved " + record.name);
 }
 }

 // REST API
 //app.get('/api',function(req,res){
 //    res.send('User Profile API is running.');
 //});

 //Multer for uploading image
 var multer  = require("multer");
 //upload image and store on disk
 var upload= multer({dest:"./public/uploads/"});

 // POST to create a user
 app.post('/api/users',upload.single('image'),function(req,res){
 var user;
 console.log("Server POST: name="+req.body.name);
 if(req.file)
 {
 console.log("Server POST: filename="+req.file.filename);
 console.log("Server POST: path="+req.file.path);
 console.log("Server POST: size="+req.file.size);
 }
 if (req.body.id == 0) {
 var img = 'TBD';
 if (req.file) {
 img = req.file.filename;
 }

 user = new UserModel({
 name: req.body.name,
 email: req.body.email,
 age: req.body.age,
 gender: req.body.gender,
 image: img
 });

 user.save(function (err) {
 if (!err) {
 console.log("Profile Created in DB.");
 } else {
 console.log(err);
 }
 });
 return res.send(user);
 }else{
 // id != 0 means this is a created user
 console.log("This is an update by POST! req.body.id=",req.body.id );
 UserModel.findById(req.body.id, function (err, user) {
 if (err) {
 console.log("error return: ");
 res.send(err);
 }
 user.name = req.body.name;
 user.email = req.body.email;
 user.age = req.body.age;
 user.gender = req.body.gender;
 user.image = req.file.filename;

 user.save(function (err) {
 if (!err) {
 console.log("Profile Updated in DB.");
 } else {
 console.log(err);
 }
 });
 return res.send(user);
 });
 }
 });

 // PUT to update
 // Single update
 app.put('/api/users/:id',function(req,res){

 console.log("PUT: id="+req.params.id);
 UserModel.findById(req.params.id, function (err, user) {
 if(err){
 console.log("error return: ");
 res.send(err);
 }
 user.name = req.body.name;
 user.email = req.body.email;
 user.age = req.body.age;
 user.gender = req.body.gender;

 return user.save(function (err) {
 if (!err) {
 console.log("Single-Updated");
 } else {
 console.log(err);
 }
 return res.send(user);
 });
 });
 });

 // Bulk update
 app.put('/api/users', function (req, res) {
 var i, len = 0;
 console.log("is Array req.body.users");
 console.log(Array.isArray(req.body.users));
 console.log("PUT: (users)");
 console.log(req.body.users);
 if (Array.isArray(req.body.users)) {
 len = req.body.users.length;
 }
 for (i = 0; i < len; i++) {
 console.log("UPDATE user by id:");
 for (var id in req.body.users[i]) {
 console.log(id);
 }
 UserModel.update({ "_id": id }, req.body.users[i][id], function (err, numAffected) {
 if (err) {
 console.log("Error on update");
 console.log(err);
 } else {
 console.log("updated num: " + numAffected);
 }
 });
 }
 return res.send(req.body.users);
 });

 // GET to read
 // List users
 app.get('/api/users', function (req, res) {

 return UserModel.find(function (err, users) {
 if (!err) {
 console.log("###app.get return. users:",users);
 return res.send(users);
 } else {
 return console.log(err);
 }
 });
 });

 // Single user
 app.get('/api/users/:id', function (req, res) {
 return UserModel.findById(req.params.id, function (err, user) {
 if (!err) {
 return res.send(user);
 } else {
 return console.log(err);
 }
 });
 });

 // DELETE to DESTROY

 // Bulk destroy all users
 app.delete('/api/users', function (req, res) {
 UserModel.remove(function (err) {
 if (!err) {
 console.log("Removed");
 return res.send('');
 } else {
 console.log(err);
 }
 });
 });

 // Remove a single user
 // Also need to remove image from /uploads
 app.delete('/api/users/:id', function (req, res) {
 return UserModel.findById(req.params.id, function (err, user) {
 console.log("remove id:"+req.params.id);
 if(err){
 console.log(err);
 }
 return user.remove(function (err) {
 if (!err) {
 console.log("single-removed");
 return res.send('');
 } else {
 console.log(err);
 }
 });
 });
 });

 */
// START THE SERVER
app.listen(port, function(){
    console.log('Sever start on port ' + port);
});
