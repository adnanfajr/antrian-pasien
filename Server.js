var app = require("express")();
var mysql = require("mysql");
var http = require('http').Server(app);
var io = require("socket.io")(http);

/* Creating POOL MySQL connection.*/

var pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'antrian',
    debug: false
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

/*  This is auto initiated event when Client connects to Your Machine.  */

io.on('connection', function (socket) {
    console.log("A user is connected");

    pool.getConnection(function (err, conn) {
        if (err) {
            console.log('Error connecting to DB');
            io.emit('error');
            return;
        }
        console.log('DB Connection established');

        io.emit('db connect', 'DB Connection established');

        conn.query('SELECT no_urut FROM poli_umum ORDER BY id DESC LIMIT 1', function (err, row_umum) {
            if (err) {
                return console.log('Error1');
            } else if (!row_umum.length) {
                io.emit('data umum', '0');
                return console.log('Data Poli Gigi is empty');
            } else if (!row_umum[0].no_urut) {
                io.emit('data umum', '0');
                return console.log('Data Poli Umum is empty');
            }

            console.log(row_umum[0].no_urut);
            io.emit('data umum', row_umum[0].no_urut);
        });

        conn.query('SELECT no_urut FROM poli_lansia ORDER BY id DESC LIMIT 1', function (err, row_lansia) {
            if (err) {
                return console.log('Error1');
            } else if (!row_lansia.length) {
                io.emit('data lansia', '0');
                return console.log('Data Poli Gigi is empty');
            } else if (!row_lansia[0].no_urut) {
                io.emit('data lansia', '0');
                return console.log('Data Poli Lansia is empty');
            }

            console.log(row_lansia[0].no_urut);
            io.emit('data lansia', row_lansia[0].no_urut);
        });

        conn.query('SELECT no_urut FROM poli_gigi ORDER BY id DESC LIMIT 1', function (err, row_gigi) {
            if (err) {
                return console.log('Error1');
            } else if (!row_gigi.length) {
                io.emit('data gigi', '0');
                return console.log('Data Poli Gigi is empty');
            } else if (!row_gigi[0].no_urut) {
                io.emit('data gigi', '0');
                return console.log('Data Poli Gigi is empty');
            }

            console.log(row_gigi[0].no_urut);
            io.emit('data gigi', row_gigi[0].no_urut);
        });

        conn.query('SELECT no_urut FROM poli_kia ORDER BY id DESC LIMIT 1', function (err, row_kia) {
            if (err) {
                return console.log('Error1');
            } else if (!row_kia.length) {
                io.emit('data kia', '0');
                return console.log('Data Poli KIA is empty');
            } else if (!row_kia[0].no_urut) {
                io.emit('data kia', '0');
                return console.log('Data Poli KIA is empty');
            }

            console.log(row_kia[0].no_urut);
            io.emit('data kia', row_kia[0].no_urut);
        });

        // Youtube ID Video
        conn.query('SELECT isi FROM attribut WHERE kategori = "jumlah" ORDER BY id DESC LIMIT 1', function (err, jumlah) {
            if (err) {
                return console.log('Error1');
            } else if (!jumlah.length) {
                io.emit('data jumlah', '0');
                return console.log('Jumlah Pasien is empty');
            } else if (!jumlah[0].isi) {
                io.emit('data jumlah', '0');
                return console.log('Jumlah Pasien is empty');
            }

            console.log(jumlah[0].isi);
            io.emit('data jumlah', jumlah[0].isi);
        });

        // Youtube ID Video
        conn.query('SELECT isi FROM attribut WHERE kategori = "youtube" ORDER BY id DESC LIMIT 1', function (err, youtube) {
            if (err) {
                return console.log('Error1');
            } else if (!youtube.length) {
                io.emit('data youtube', '0');
                return console.log('Youtube ID is empty');
            } else if (!youtube[0].isi) {
                io.emit('data youtube', '0');
                return console.log('Youtube ID is empty');
            }

            console.log(youtube[0].isi);
            io.emit('data youtube', youtube[0].isi);
        });

        // Running Text
        conn.query('SELECT isi FROM attribut WHERE kategori = "running_text" ORDER BY id DESC LIMIT 1', function (err, runtext) {
            if (err) {
                return console.log('Error1');
            } else if (!runtext.length) {
                io.emit('data kia', '0');
                return console.log('Running Text is empty');
            } else if (!runtext[0].isi) {
                io.emit('data kia', '0');
                return console.log('Running Text is empty');
            }

            console.log(runtext[0].isi);
            io.emit('data runtext', runtext[0].isi);
        });

    });

    socket.on('umum added', function (umum) {
        add_umum(umum, function (res) {
            if (res) {
                io.emit('refresh umum', umum);
            } else {
                io.emit('error');
            }
        });
    });

    socket.on('lansia added', function (lansia) {
        add_lansia(lansia, function (res) {
            if (res) {
                io.emit('refresh lansia', lansia);
            } else {
                io.emit('error');
            }
        });
    });

    socket.on('gigi added', function (gigi) {
        add_gigi(gigi, function (res) {
            if (res) {
                io.emit('refresh gigi', gigi);
            } else {
                io.emit('error');
            }
        });
    });

    socket.on('kia added', function (kia) {
        add_kia(kia, function (res) {
            if (res) {
                io.emit('refresh kia', kia);
            } else {
                io.emit('error');
            }
        });
    });

    socket.on('jumlah added', function (jumlah) {
        update_jumlah(jumlah, function (res) {
            if (res) {
                io.emit('refresh jumlah', jumlah);
            } else {
                io.emit('error');
            }
        });
    });

    socket.on('runtext added', function (runtext) {
        update_runtext(runtext, function (res) {
            if (res) {
                io.emit('refresh runtext', runtext);
            } else {
                io.emit('error');
            }
        });
    });
});

var add_umum = function (umum, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(false);
            return;
        }
        connection.query("INSERT INTO `poli_umum` (`no_urut`) VALUES ('" + umum + "')", function (err, rows) {
            connection.release();
            if (!err) {
                callback(true);
            }
        });
        connection.on('error', function (err) {
            callback(false);
            return;
        });
    });
}

var add_lansia = function (lansia, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(false);
            return;
        }
        connection.query("INSERT INTO `poli_lansia` (`no_urut`) VALUES ('" + lansia + "')", function (err, rows) {
            connection.release();
            if (!err) {
                callback(true);
            }
        });
        connection.on('error', function (err) {
            callback(false);
            return;
        });
    });
}

var add_gigi = function (gigi, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(false);
            return;
        }
        connection.query("INSERT INTO `poli_gigi` (`no_urut`) VALUES ('" + gigi + "')", function (err, rows) {
            connection.release();
            if (!err) {
                callback(true);
            }
        });
        connection.on('error', function (err) {
            callback(false);
            return;
        });
    });
}

var add_kia = function (kia, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(false);
            return;
        }
        connection.query("INSERT INTO `poli_kia` (`no_urut`) VALUES ('" + kia + "')", function (err, rows) {
            connection.release();
            if (!err) {
                callback(true);
            }
        });
        connection.on('error', function (err) {
            callback(false);
            return;
        });
    });
}

var update_jumlah = function (jumlah, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(false);
            return;
        }
        connection.query("UPDATE `attribut` SET `isi`='" + jumlah + "' WHERE kategori='jumlah'", function (err, rows) {
            connection.release();
            if (!err) {
                callback(true);
            }
        });
        connection.on('error', function (err) {
            callback(false);
            return;
        });
    });
}

var update_runtext = function (runtext, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(false);
            return;
        }
        connection.query("UPDATE `attribut` SET `isi`='" + runtext + "' WHERE kategori='running_text'", function (err, rows) {
            connection.release();
            if (!err) {
                callback(true);
            }
        });
        connection.on('error', function (err) {
            callback(false);
            return;
        });
    });
}

http.listen(3000, function () {
    console.log("Listening on 3000");
});