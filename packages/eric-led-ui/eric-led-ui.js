

Meteor.startup(function(){
    
    
    var Engine           = famous.core.Engine;
    var Surface          = famous.core.Surface;
    var Modifier         = famous.core.Modifier;
    var ContainerSurface = famous.surfaces.ContainerSurface
    var Transform      = famous.core.Transform;
    var Timer          = famous.utilities.Timer;
    var Transitionable = famous.transitions.Transitionable;
    mainContext = Engine.createContext();

    container = new ContainerSurface({
        size: [400, 400]
    });
    surfaces = new Meteor.Collection(null);
    memory = {};
    var init = true;
    function reorder(r){
        var radius = r || 150;
        var width = 0, height = 0,
        angle = 0, step = (2*Math.PI) / surfaces.find({transitionable:{$exists:true}}).count();
        surfaces.find({transitionable:{$exists:true}, index:{$exists:true}}, {sort:{index:-1}}).fetch().forEach(function(doc, index){
            var x = Math.round(width/2 + radius * Math.cos(angle) - 0/2);
            var y = Math.round(height/2 + radius * Math.sin(angle) - 0/2);
            angle += step;
            memory[doc._id].transitionable.set([x,y],{curve: "easeInOut", duration: 1000});
        });
    }
    surfaces.find().observeChanges({
        "added":function(id, doc){
            var props = {
                    size: [50, 50],
                    classes: ['led'],
                    content:doc.index,
                    properties: {
                        textAlign: 'center',
                        lineHeight: '50px',
                        border:'1px solid black',
                        borderRadius:'25px',
                        background:"rgb("+doc.color+")"
                    }
                }
            var tmp = {
                surface:new Surface(props),
                transitionable:new Transitionable([0,0]),
                modifier:new Modifier({
                    align: [.5, .5],
                    origin: [.5, .5]
                })
            }
            memory[id] = {
                surface:tmp.surface,
                transitionable:tmp.transitionable,
                Modifier:tmp.transitionable
            }
            surfaces.update(id, {
                $set:{
                    transitionable:(new Date().getTime()),
                    Modifier:(new Date().getTime()),
                    surface:(new Date().getTime()),
                    active:false
                }
            });
            tmp.surface.on("click", function(evt){
                $(evt.target).toggleClass('active');
                surfaces.update(id,{$set:{
                    active:$(evt.target).hasClass('active')
                }})
                console.log(surfaces.findOne(id));
                //tmp.transitionable.set([100,100],{curve: "easeInOut", duration: 1000});
            });
            tmp.modifier.transformFrom(function() {
                return Transform.translate(tmp.transitionable.get()[0], tmp.transitionable.get()[1], 0);
            });
            container.add(tmp.modifier).add(tmp.surface);
            if(!init){
                reorder();
            }
        }
    })
    
    
    
    

    var SnapTransition = famous.transitions.SnapTransition;
    Transitionable.registerMethod("snap", SnapTransition);
    var GenericSync = famous.inputs.GenericSync;
    var MouseSync   = famous.inputs.MouseSync;
    var TouchSync   = famous.inputs.TouchSync;
    var position = new Transitionable([0,0]);
    var DISPLACEMENT_LIMIT = 100;
    var DISPLACEMENT_PEEK = 50;
    var DISPLACEMENT_THRESHOLD = 50;
    var VELOCITY_THRESHOLD = 0.2;
    var SURFACE_SIZE = [undefined, 100];
    GenericSync.register({
      "mouse" : MouseSync,
      "touch" : TouchSync
    });
    var sync = new GenericSync(["mouse", "touch"]);
    
    sync.on('update', function(data){
        var currentPosition = position.get();
        var pos = [
            currentPosition[0] + data.delta[0],
            currentPosition[1] + data.delta[1]
        ];
        surfaces.find({active:true}).fetch().forEach(function(doc, index){
            rgb = [
                Math.round((pos[0]+200)/400 * 255),
                Math.round((pos[1]+200)/400 * 255),
                100
            ];
            memory[doc._id].surface.setProperties({"background":'rgb('+rgb.join(',')+')'});
            //surfaces.update(doc._id, {$set:{color:[$pageX, $pageY, $pageX]}})

            surfaces.update(doc._id, {$set:{color:rgb}});
            
        })
        console.log(pos[0]+200, pos[1]+200);

        //$(document.body).css('background','rgb('+rgb.join(',')+')');
        position.set(pos);
    });
    
    sync.on('end', function(data){
        // bounce-back to [0,0], but this time, taking into account the
        // user's velocity
        var currentPosition = position.get();
        var pos = [
            currentPosition[0] + data.delta[0],
            currentPosition[1] + data.delta[1]
        ];
        var velocity = data.velocity;
        position.set([0, 0], {
            method : 'snap',
            period : 150,
            velocity : velocity
        });
        surfaces.find({active:true}).fetch().forEach(function(doc, index){
            led.update(doc.ledId, {$set:{color:doc.color}});
        });
    });
    
var positionModifier = new Modifier({
    transform : function(){
        var currentPosition = position.get();
        return Transform.translate(currentPosition[0], currentPosition[1], 0);
    }
});
    
    
    
    
    var props = {
        size: [100, 100],
        classes: ['color-pick'],
        properties: {
            textAlign: 'center',
            lineHeight: '50px',
            border:'1px solid black',
            borderRadius:'100px'
        }
    }
    
    
    var modifier = new Modifier({
        align: [.5, .5],
        origin: [.5, .5]
    })
    var colorPick = new Surface(props);
    
    
    colorPick.pipe(sync);
    container.add(modifier).add(positionModifier).add(colorPick);
    
    
    
    
    
    
    
    
    mainContext.add(new Modifier({
        align: [.5, .5],
        origin: [.5, .5]
    })).add(container);
    led.find({index:{$exists:true}}).observeChanges({
        "added":function(id, doc){
            doc.ledId = id;
            surfaces.insert(doc);
        },
        "changed":function(id, doc){
            memory[surfaces.findOne({ledId:id})._id].surface.setProperties({
                "background":"rgb("+doc.color+")"
            });
        }
    });
    setTimeout(function(){
        init = false;
        reorder();
    },3000);

})






    
