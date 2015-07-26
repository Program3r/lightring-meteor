
Meteor.publish(null, function(){
    var self = this;
   return led.find()/*.observeChanges({
        "added":function(id,doc){
            self.added("LED", id, doc)
        }
    })*/
});

if(led.find().count() == 0){
    for(var i=0;i < 23; i++){
        led.insert({color:"#FFF", index:i});
    }
}