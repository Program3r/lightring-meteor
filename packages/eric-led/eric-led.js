// Write your package code here!
if(Meteor.isServer){
    ws281x = Npm.require('/home/pi/node-rpi-ws281x-native/lib/ws281x-native');
    pixelData = new Uint32Array(24);
    ws281x.init(24);
    function rgb2Int(a) {
        
      return ((a[0] & 0xff) << 16) + ((a[1] & 0xff) << 8) + (a[2] & 0xff);
    }
    led.find({tags:{$in:["clode:LED"]}, color:{$exists:true}, index:{$exists:true}}).observeChanges({
        "added":function(id, doc){
            pixelData[doc.index] = rgb2Int(doc.color);
            ws281x.render(pixelData);
        },
        "changed":function(id, doc){
            var org = led.findOne(id);
            pixelData[org.index] = rgb2Int(doc.color);
            ws281x.render(pixelData);
        },
        "removed":function(id, doc){
            var org = led.findOne(id);
            pixelData[org.index] = rgb2Int([0,0,0]);
            ws281x.render(pixelData);
        }
    });
    process.on('SIGINT', function () {
      ws281x.reset();
      process.nextTick(function () { process.exit(0); });
    });
}