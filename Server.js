var app     =     require("express")();
var mysql   =     require("mysql");
var http    =     require('http').Server(app);
var io      =     require("socket.io")(http);

/* Creating POOL MySQL connection.*/

var pool    =    mysql.createPool({
      connectionLimit   :   100,
      host              :   'localhost',
      user              :   'root',
      password          :   '',
      database          :   'antrian',
      debug             :   false
});

app.get("/",function(req,res){
    res.sendFile(__dirname + '/index.html');
});

/*  This is auto initiated event when Client connects to Your Machien.  */

io.on('connection',function(socket){  
    console.log("A user is connected");
    socket.on('umum added',function(umum){
      add_umum(umum,function(res){
        if(res){
            io.emit('refresh umum',umum);
        } else {
            io.emit('error');
        }
      });
    });

    socket.on('lansia added',function(lansia){
      add_lansia(lansia,function(res){
        if(res){
            io.emit('refresh lansia',lansia);
        } else {
            io.emit('error');
        }
      });
    });

    socket.on('gigi added',function(gigi){
      add_gigi(gigi,function(res){
        if(res){
            io.emit('refresh gigi',gigi);
        } else {
            io.emit('error');
        }
      });
    });
});

var add_umum = function (umum,callback) {
    pool.getConnection(function(err,connection){
        if (err) {
          callback(false);
          return;
        }
    connection.query("INSERT INTO `poli_umum` (`no_urut`) VALUES ('"+umum+"')",function(err,rows){
            connection.release();
            if(!err) {
              callback(true);
            }
        });
     connection.on('error', function(err) {
              callback(false);
              return;
        });
    });
}

var add_lansia = function (lansia,callback) {
    pool.getConnection(function(err,connection){
        if (err) {
          callback(false);
          return;
        }
    connection.query("INSERT INTO `poli_lansia` (`no_urut`) VALUES ('"+lansia+"')",function(err,rows){
            connection.release();
            if(!err) {
              callback(true);
            }
        });
     connection.on('error', function(err) {
              callback(false);
              return;
        });
    });
}

var add_gigi = function (gigi,callback) {
    pool.getConnection(function(err,connection){
        if (err) {
          callback(false);
          return;
        }
    connection.query("INSERT INTO `poli_gigi` (`no_urut`) VALUES ('"+gigi+"')",function(err,rows){
            connection.release();
            if(!err) {
              callback(true);
            }
        });
     connection.on('error', function(err) {
              callback(false);
              return;
        });
    });
}

http.listen(3000,function(){
    console.log("Listening on 3000");
});