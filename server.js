var port = process.env.PORT || 8080,
    portB = port + 1 ;


var mongo = require('mongodb').MongoClient ,
    express = require('express'),
    app = express(),
    client = require('socket.io').listen(app.listen(port)).sockets,
    router = express.Router(),
    path   = require('path');






// settings
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));



//middle ware
app.use(express.static(path.join(__dirname,'bower_components')));



mongo.connect('mongodb://bash_edu:1rightman@ds041643.mongolab.com:41643/chat',function(err,db){
     if(err) throw err;
    
    
     client.on('connection',function(socket){
         
         var col = db.collection('messages'),
             sendStatus = function(s){
                 socket.emit('status',s);
             }; 
         
         
         // emit all the messages
         col.find().limit(100).sort({_id : 1}).toArray(function(err,res){
             if(err) throw err;
             
             socket.emit('output', res);
         });
         
         
         //wait for input
         socket.on('input', function(data){
             var name = data.name,
                 message = data.message ,
                 whiteSpacePattern = /^\s*$/;
             
             if(whiteSpacePattern.test(name) || whiteSpacePattern.test(message))
             {
                 sendStatus('Name and message is required.');
             }
             else{
             col.insert({name:name,message:message},function(){
                 
                 client.emit('output',[data]);
                 
                 sendStatus({
                     message: 'Message sent',
                     clear  : true
                 });
             }); 
                 
             }
             
             
         });
     });
    
});


//-----------------------------------------------------------------------

app.get('/',function(req,res){
    res.render('index',{
        port : (portB).toString()
    });
});


// listen for connection
app.listen(portB, function(){
    console.log(portB);
});

