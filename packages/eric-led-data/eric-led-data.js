if(Meteor.isServer){
    led = new Meteor.Collection("LED", {connection:null});
}else{
    led = new Meteor.Collection("LED");
}
colorstream = new Meteor.Stream('colorstream');
Meteor.methods({
    "ledupdate":function(id,color){
        led.upsert({_id:id}, {$set:{color:color}});
    },
    "ledactive":function(id,state){
        led.update(id, {$set:{active:state}});
    }
});