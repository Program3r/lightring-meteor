
var FamousEngine = famous.core.FamousEngine;
FamousEngine.init();
ClodeScene = FamousEngine.createScene();

var DOMElement = famous.domRenderables.DOMElement;
var Node = famous.core.Node;

var Center = ClodeScene.addChild()
.setSizeMode(Node.ABSOLUTE_SIZE,Node.ABSOLUTE_SIZE,Node.ABSOLUTE_SIZE)
.setAbsoluteSize(173,156,1)
.setAlign(0.5,0.5,1)
.setPosition(-85,-76)

var CenterDom = new DOMElement(Center, {
});

var tester = Center.addChild()
.setSizeMode(Node.ABSOLUTE_SIZE,Node.ABSOLUTE_SIZE,Node.ABSOLUTE_SIZE)
.setAbsoluteSize(50,50,1)
.setPosition(50,-60);
var TesterDom = new DOMElement(tester, {
    properties:{
        borderRadius:'33px',
        color:'black',
        background:'white',
        border:'1px solid black',
        cursor:'pointer',
        padding:'15px',
        textAlign: 'center'
    },
    classes:["glyphicon"]
})
tester.onReceive = function(){
    if(!Meteor.status().connected){
        Meteor.reconnect();
    }else{
        colorstream.emit('ledtest', {});
    }
}
tester.addUIEvent('click');
uiStatus = function(status){
    TesterDom.removeClass('glyphicon-flash');
    TesterDom.removeClass('glyphicon-signal');
    TesterDom.removeClass('glyphicon-refresh');
    switch(status.status){
        case "connecting":
            TesterDom.addClass('glyphicon-refresh');
            break;
        case "connected":
            TesterDom.addClass('glyphicon-signal');
            break;
        default:
            TesterDom.addClass('glyphicon-flash');
            break;
    }
}

var retryCount = 0;
Tracker.autorun(function(){
    uiStatus(Meteor.status());
    if(Meteor.status().connected && retryCount > 0){
        console.log("RELOADING UI");
        document.location.reload();
    }
    retryCount = Meteor.status().retryCount;
})



var found = false;
var cid = Center.addComponent({
   onUpdate:function(time){
       var nodeId = Center.getLocation();
        var elem = document.querySelector(nodeId.split('/')[0]).querySelectorAll('[data-fa-path]');

        if(elem.length !== 0){
            for(var el=0;el<elem.length;el++){
                if(elem[el].dataset.faPath === nodeId){
                        var div = document.createElement('div');
                        var active = Session.get("clientID");
                        $(elem[el]).append(div);
                        $(div).addClass('colors');
                        $(div).minicolors({
                            change: function(hex) {
                                if(active === Session.get("clientID")){
                                    led.find({active:true}).fetch().forEach(function(doc){
                                        Meteor.call("ledupdate", doc._id, hex);
                                    });
                                    colorstream.emit('colorchange', {});
                                }
                            },
                            control:'wheel',
                            changeDelay:5,
                            inline:true,
                            theme: 'default'
                        });
                    found = true;
                    break;
                }
            }
            if(!found){
                Center.requestUpdate(cid);
            }
        }else{
            Center.requestUpdate(cid);
        }
   }
});
Center.requestUpdate(cid);
leds = {};



function getPosition(index){
    var radius = 180;
    var width = 100, height = -200,
    step = (2*Math.PI) / led.find().count();
    angle = step * index;
    var x = Math.round(width/2 + radius * Math.cos(angle) - 0/2);
    var y = Math.round(height/2 + radius * Math.sin(angle) - 0/2);
    return [x,y]
}



led.find({index:{$exists:true}}, {sort:{index:1}}).observe({
    "added":function(doc){
        leds[doc._id] = {};
        var self = leds[doc._id];
        var Scale = famous.components.Scale;


        self.node = Center.addChild()
        .setSizeMode(Node.ABSOLUTE_SIZE,Node.ABSOLUTE_SIZE,Node.ABSOLUTE_SIZE)
        .setAbsoluteSize(50,50)
        .setOrigin(0.5,0.5)
        self.active = false;
        self.node.addUIEvent('mouseover');

        var ballScale = new Scale(self.node);
        self.ballScale = ballScale;
        ballScale.set(0.7,0.7)

        self.dom = new DOMElement(self.node, {
            properties:{
                border:"1px solid black",
                borderRadius:"50px"
            },
            classes:["ball"]
        });

        var pos = self.node.addComponent({
            'onUpdate':function(time){
                var pos = getPosition(doc.index);
                self.node.setPosition(pos[0], pos[1]);
                var color = led.findOne(doc._id).color;
                self.dom.setProperty("background-color", color);
                self.dom.setAttribute("data-id", doc._id);
                if(self.active !== led.findOne(doc._id).active){
                    if(led.findOne(doc._id).active){
                        ballScale.set(1,1,1,{duration:1000, curve:'outElastic'});
                    }else{
                        ballScale.set(0.7,0.7,1,{duration:1000, curve:'outElastic'});
                    }
                    self.active = led.findOne(doc._id).active;
                }

            },
            'onReceive':function(type,e){
                if(!ballScale.isActive()){
                    if(type === "mouseover"){
                        Meteor.call("ledactive",doc._id,!self.active);
                    }
                }
            }
        })


        setInterval(function(){self.node.requestUpdate(pos)}, 10);

    }
})
