// Provide top-level namespaces for our javascript.
// $(function(){
// (function() {
  window.jstonkers = { controllers:{}, model:{}, app:{}, view:{}, ui:{} };
// })();
// });

_.mixin({
   format: function( string ){
       var i = arguments.length-1;
       while(i--){
           string = string.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
       }
       return string;
   } 
});

String.prototype.format = function() {
    var s = this, i = arguments.length;
    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

// $(function(){
    window.jstonkers.sprite_data = [
        {
            tank:[ 0,0,16,8],
            supply:[ 0, 8, 16, 8],
            artillery:[ 0, 16, 16, 8],
            ship:[ 0, 24, 16, 8],
            infantry:[ 0, 32, 8, 16 ],
            disbanded:[ 0, 48, 8, 8 ],
            cursor: [16, 48, 8, 8],
            cursor_tank:[0,56,8,8],
            cursor_artillery:[8,56,8,8],
            cursor_infantry:[16,56,8,8],
            cursor_supply:[24,56,8,8],
        },
        {
            tank:[ 0,0,32,16], 
            supply:[ 0, 16, 32,16],
            artillery:[ 0, 32, 32,16],
            ship:[ 0, 48, 32,16],
            infantry:[ 0, 64, 16, 32 ],
            disbanded:[ 0, 96, 16, 16 ],
            cursor: [16, 96, 16, 16],
            cursor_tank:[0,112,16,16],
            cursor_artillery:[16,112,16,16],
            cursor_infantry:[32,112,16,16],
            cursor_supply:[48,112,16,16],
        }
    ];
    
    window.jstonkers.data = {
        
        divisions:[
            { id:"tnk001", type:"tank", position:[1000,1000] },
            { id:"tnk002", type:"tank", position:[1200,1000] },
        ],
        
        teams:[
            { id:"tem001", divisions:[ "tnk001", "tnk002"] },
        ],
        
        players:[
            { id:"ply001", team:"tem001", position:[0,0], zoom:1 },
        ],
        
        world:{
            // current world view position
            position:[1174,842],
            // position and size of the window onto the world
            window:[0,0,0,0],
            // current view zoom level
            zoom:1,
            // world bounds
            bounds:[0,0,2560,1536],
            // view zoom levels
            levels: [
                { bounds:[0,0,1280,768], tile_size:256  },
                { bounds:[0,0,2560,1536], tile_size:256 },
            ],
            image_src:'/img/tiles/{0}/{1}-{2}.png',
        },
        
        match:{
            state:"playing",
        },
    };
// });