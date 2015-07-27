// Write your package code here!
if(Meteor.isServer){

    ws281x = Npm.require('rpi-ws281x-native');
    pixelData = new Uint32Array(24);
    ws281x.init(24);

    var render = function(){
        var data = led.find({});
        var dataf = data.fetch();
        for (var i = 0; i < data.count(); i++) {

            var nohash = dataf[i].color.replace("#", "");
            var colorLen = (6 - nohash.length);
            for (var j = 0; j < colorLen; j++) {
                nohash += "0";
            }
            nohash = "0x" + nohash;
            pixelData[i] = nohash;
        }
        ws281x.render(pixelData);
    }
    var runtest = function(){
        var offset=0;
        var clear = Meteor.setInterval(function () {
          var count=24;
          for (var i = 0; i < count; i++) {
              pixelData[i] = 0;
          }
          pixelData[offset] = 0xffffff;

          offset = (offset + 1) % 24;
          ws281x.render(pixelData);
        }, 100);
        Meteor.setTimeout(function(){
            Meteor.clearInterval(clear);
        }, 100 * 24)
    }

    var startup = Meteor.setInterval(runtest, 105*24);

    colorstream.on('colorchange', function(message) {
        Meteor.clearInterval(startup);
        render();

    });

    colorstream.on('ledtest', function(message) {
        Meteor.clearInterval(startup);
        runtest();
    });


    process.on('SIGINT', function () {
      ws281x.reset();
      process.nextTick(function () { process.exit(0); });
    });
}