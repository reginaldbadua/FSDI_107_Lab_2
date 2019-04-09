
var http = require('http');
var express = require('express');
var app = express();

//CONFIG Section


/* body parse to receive JSON*/
var bparse = require('body-parser');
app.use(bparse.json());

/*enable CORS for testing*/
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//Object constructor for the mongo schema
var Item;
  
app.get('/', function(req,res){
    res.send('<h1>Hello</h1>');
});

app.get('/about', function (req,res){
    res.send('A project from Reggie Badua');
})

app.get('/error', function(req,res){
    res.status(502);
    res.send('A super hard error occurred');
})
/**********API/test for mongo***********/

app.get('/API/test', function(req,res){
    //test endpoint to create and store an object on mongo
    var testItem = new Item({
        name: 'superDuper',
        desc: 'This is just a test',
        price: 42,
        image: 'image.png',
        category:'testingItems',
        user:'Reggie'
    });

    //save the object as a document on the collection
    //                as an entry on the table (in sql terminology)
    testItem.save(function(err, resultObj){
        if(err){
            console.log('Error saving obj');
            res.status(500);
            res.send('Error, could not save the object onto DB');
        }
        // obj saved
        res.send('Object saved!');
    });
});


/****************API/points*************/

app.get('/API/points', function(req,res){
    //read data from DB
    Item.find({}, function(err, data){
        if(err){
            console.log('Error getting data');
            console.log(err);
            res.status(500);
            res.json(err);
        }
         //sends data back to client
        res.json(data);
    }); 
});

app.post('/API/points', function(req,res){
    //the client wants to store a new item
    //console.log('POST received!' + req.body);
    var itemFromClient = req.body; //catch the object from the clent(webapp)

    //create mongo object
    var itemMongo = new Item(itemFromClient);
    itemMongo.save(function(error,itemSaved){
        if(error){
            console.log('Error saving the item');
            res.status(500); //internal server error
            res. json(error);//send error details to client
        }
        //no error
        itemSaved.id = itemSaved._id; //fix because client expects an id attr
        res.status(201); //201: created
        res.json(itemSaved);
    });
});

/* MONGO CONFIG */
var mongoose = require('mongoose');
mongoose.connect('mongodb://ThiIsAPassword:TheRealPassword@cluster0-shard-00-00-euadh.mongodb.net:27017,cluster0-shard-00-01-euadh.mongodb.net:27017,cluster0-shard-00-02-euadh.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',{
    userMongoClient: true
});

var db = mongoose.connection;

db.on('error', function(error){
    console.log('Error: connection to DB not established');
});

db.on('open', function(){
    console.log('DB connection opened');

    // create the schema for the collection(s)
    var itemSchema = mongoose.Schema({
        user: String,
        name: String,
        desc: String,
        price: Number,
        image: String,
        category: String
    });

    Item = mongoose.model('Items107',itemSchema);
});


//ends mongo config//

app.listen(8080,function(){
    console.log('Server started on localhost:8080');
});
/*
var server = http.createServer(function(req,res){
    console.log('A request is received' + req.method);
    //console.log(req);
    if(req.method == 'GET'){
    res.end('<h1>Hello from NodeJs</h1>'); //finishes the request and sends info back
    }
});

server.listen(8080, function(){
    console.log('Server started on port localhost:8080');   
});
*/
