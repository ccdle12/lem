var Lem = require('../src/index');
var level = require('level');
var hyperquest = require('hyperquest');
var concat = require('concat-stream');
var through = require('through');
var http = require('http');
var async = require('async');
var wrench = require('wrench');

describe('lem', function(){

  var db;

  before(function(done){
    this.timeout(1000);
    wrench.rmdirSyncRecursive('/tmp/lemtesttempdb', true);
    level('/tmp/lemtesttempdb', {}, function(err, ldb){
      if (err) throw err
      db = ldb
      done();
    });
  })

  describe('constructor', function(){
  
    it('should be a function', function(){
      Lem.should.be.type('function');
    })

    it('should throw if no leveldb or options', function(){
      (function(){
        var lem = new Lem();  
      }).should.throw('db required');
    })

    it('should create a lem server which should be an event emitter', function(done){
      var lem = new Lem(db);

      lem.on('apples', done);
      lem.emit('apples');
    })

  })


  describe('index', function(){
    

    it('should list all the nodes', function(done){
      var lem = new Lem(db);

      async.series([
        function(next){
          lem.indexNode('cars.red5.speed', 10, next);
        },

        function(next){
          lem.indexNode('cars.red5.height', 11, next);
        },

        function(next){
          lem.indexNode('cars.red5.weight', 12, next);
        },

        function(next){
          var nodes = {};
          lem.index('cars.red5').pipe(through(function(data){
            console.log('-------------------------------------------');
            console.log('index');
            console.dir(data);

            nodes[data.key] = data.value;
          }, function(){
            nodes['speed'].should.equal('10');
            nodes['height'].should.equal('11');
            nodes['weight'].should.equal('12');
            Object.keys(nodes).length.should.equal(3);
            done();
          }))
        }
      ], done)
      
    })

  })

  describe('recorder', function(){

    this.timeout(2000);

    it('should save values', function(done){
      var lem = new Lem(db);

      var recorder = lem.recorder('cars.red5.speed');

      var counter = 0;

      function docheck(){
        console.log('-------------------------------------------');
        console.log('cjheck');
        lem.values('cars.red5.speed').pipe(through(function(data){
          console.log('-------------------------------------------');
          console.log('data here');
          console.dir(data);
        }, function(){
          console.log('-------------------------------------------');
          console.log('end');
        }))
      }

      function dorecord(){
        if(counter>10){
          docheck();
          return;
        }
        var speed = 50 + Math.round(Math.random()*50);
        recorder(speed, function(){
          counter++;
          setTimeout(dorecord, 100);
        })

      }
      
      dorecord();
      
    })

  })


  describe('http server', function(){

    var server;
    var lem;

    before(function(done){
      this.timeout(1000);
      lem = new Lem(db);
      server = http.createServer(lem.http());
      server.listen(8080, done)
    })

    it('should save serve the meta data', function(done){
      
      lem.meta('hello lem', function(err){
        if(err) throw err

        hyperquest('http://127.0.0.1:8080/v1/meta')
        .pipe(concat(function(meta){
          meta.should.equal('hello lem');
          done();
        }))
        
      })
    })

  })
	
})


