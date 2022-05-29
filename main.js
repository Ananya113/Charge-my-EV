const express = require("express");
const mysql = require("mysql");
const ejs = require("ejs");
const app = express();
const bodyParser = require("body-parser");
const cors=require('cors');
const session = require('express-session');
var temp=[];
var cname="";
var pname="";


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// CONNECTING THE DATABASE TO THE BACKEND (NODE JS)

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql123",
    database: "chargeev",
    port: "3306"
})
app.use(cors());
  
// CONFIRMATION ON SUCCESSFULL CONNECTION OF THE DATABASE

connection.connect((err) => {
    if(err){
        throw err;
    }
    else{
        console.log("Connected!");
    }
})


app.get("/", function(req,res){
    res.render("login_user");
});
app.get("/login_provider", function(req,res){
    res.render("login_provider");
});
app.get("/register_user", function(req,res){
    res.render("register_user");
});
app.get("/register_provider", function(req,res){
    res.render("register_provider");
});

app.get("/home_user",function(req,res){
    connection.query("SELECT registration_provider.name,registration_provider.address,registration_provider.phone, SQRT(POW(69.1 * (registration_provider.lat - (registration_user.lat)), 2) + POW(69.1 * ((registration_user.lng) - registration_provider.lng) * COS(registration_provider.lat / 57.3), 2)) AS distance FROM registration_provider JOIN registration_user HAVING distance < 10 ORDER BY distance;",(err,results,fields) => {
     
        temp=results;
        if(err) throw err;
        //res.send(results);
        res.render("home_user",{items:results});
    
    });
    // connection.query("SELECT name,address,phone FROM registration_provider",(err,results,fields) => {
     
    //   temp=results;
    //   if(err) throw err;
    //   //res.send(results);
    //   res.render("home_user",{items:results});
  
    // }); 
});

app.get("/home_provider",function(req,res){
   // connection.query("INSERT into price(name,units,cost)VALUES(")
    connection.query("SELECT name,pnum,email FROM registration_user",(err,results,fields) => {
     
        temp=results;
        if(err) throw err;
        //res.send(results);
        res.render("home_provider",{items:results});
    
      });
    // connection.query("SELECT cost FROM price",(err,results,fields) => {
     
    //     temp=results;
    //     if(err) throw err;
    //     res.render("home_provider",{items:results});
    
    // });
});

app.post('/', function(request, response) {
   var email = request.body.email;
   const pincode=request.body.pincode;
    const y=pincode.indexOf(",");
    const lat=pincode.slice(0,y);
    const lng=pincode.slice(y+1,);
   const password = request.body.password;
   connection.query('UPDATE registration_user SET lat="'+lat+'",lng="'+lng+'" WHERE email=?',[email]);
   
   if (email && password) {
       connection.query('SELECT * FROM registration_user WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
           if (results.length > 0) {
               request.session.loggedin = true;
               request.session.email = email;
               request.session.password = password;
               
               response.redirect('/home_user');
       
           } else {
               response.send('Incorrect Username and/or Password!');
           }			
           response.end();
       });
   } 
 else {
       response.send('Please enter Username and Password!');
       response.end();
   }

});

app.post('/login_provider', function(request, response) {
    var email = request.body.email;
    const password = request.body.password;
    if (email && password) {
        connection.query('SELECT * FROM registration_provider WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.email = email;
                request.session.password = password;
      
                response.redirect('/home_provider');
        
            } else {
                response.send('Incorrect Username and/or Password!');
            }			
            response.end();
        });
    } 
  else {
        response.send('Please enter Username and Password!');
        response.end();
    }
 });


app.post("/register_user",function(req,res){
    cname=req.body.name;
    var email=req.body.email;
    var pnum=req.body.pnum;
    const password=req.body.password;
    const cpassword=req.body.cpassword;
    connection.query('INSERT into registration_user(name,email,pnum,password,cpassword)VALUES("'+cname+'","'+email+'","'+pnum+'","'+password+'","'+cpassword+'")');
    res.redirect('/');
});
 
app.post("/register_provider",function(req,res){
    pname=req.body.name;
    var address=req.body.address;
    //var gmap=req.body.gmap;
    const pincode=req.body.pincode;
    const y=pincode.indexOf(",");
    var email=req.body.email;
    var phone=req.body.phone;
    const password=req.body.password;
    const cpassword=req.body.cpassword;
    const lat=pincode.slice(0,y);
    const lng=pincode.slice(y+1,);
    connection.query('INSERT into registration_provider(name,address,email,phone,password,cpassword,lat,lng)VALUES("'+pname+'","'+address+'","'+email+'","'+phone+'","'+password+'","'+cpassword+'","'+lat+'","'+lng+'")');
    res.redirect('/login_provider');
});

app.post("/home_provider",function(req,res){
    const units=req.body.units;
    const price=0;
    if(units<200){
        price=(units*7);
    }
    else{
        price=(((units-200)*8)+1400);
    }
    connection.query('INSERT into price(cname,pname,units,price)VALUES("'+cname+'","'+pname+'","'+units+'","'+price+'")');
    //res.redirect('/');
});

// HOSTING THE PROJECT ON PORT 3000 FOR EASY ACCESS.

const port = process.env.PORT || 3000;
app.listen(port);

console.log("App is listening on port "+ port);
