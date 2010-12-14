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
    window.jstonkers.sprite_data = {
        offsets:[
            [
                [ 0,0 ],
                [ 0, 0 ]
            ],
            [
                [ 32, 0 ],
                [ 64, 0 ]
            ]
        ],
        uvs:[
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
        ]
    };
    
    window.jstonkers.data = {
        
        units:[
            { id:"tnk001", type:"tank", position:[2000,200] },
            { id:"tnk002", type:"tank", position:[2100,200] },
            { id:"tnk003", type:"tank", position:[2200,200] },
            { id:"tnk004", type:"tank", position:[2300,200] },
            { id:"art001", type:"artillery", position:[2000,300] },
            { id:"art002", type:"artillery", position:[2100,300] },
            { id:"art003", type:"artillery", position:[2200,300] },
            { id:"art004", type:"artillery", position:[2300,300] },
            { id:"sup001", type:"supply", position:[2000,400] },
            { id:"sup002", type:"supply", position:[2100,400] },
            { id:"sup003", type:"supply", position:[2200,400] },
            { id:"sup004", type:"supply", position:[2300,400] },
            { id:"inf001", type:"infantry", position:[2000,500] },
            { id:"inf002", type:"infantry", position:[2100,500] },
            { id:"inf003", type:"infantry", position:[2200,500] },
            { id:"inf004", type:"infantry", position:[2300,500] },
            
            { id:"tnk101", type:"tank", position:[100,200] },
            { id:"tnk102", type:"tank", position:[200,200] },
            { id:"tnk103", type:"tank", position:[300,200] },
            { id:"tnk104", type:"tank", position:[400,200] },
            { id:"art101", type:"artillery", position:[100,300] },
            { id:"art102", type:"artillery", position:[200,300] },
            { id:"art103", type:"artillery", position:[300,300] },
            { id:"art104", type:"artillery", position:[400,300] },
            { id:"sup101", type:"supply", position:[100,400] },
            { id:"sup102", type:"supply", position:[200,400] },
            { id:"sup103", type:"supply", position:[300,400] },
            { id:"sup104", type:"supply", position:[400,400] },
            { id:"inf101", type:"infantry", position:[100,500] },
            { id:"inf102", type:"infantry", position:[200,500] },
            { id:"inf103", type:"infantry", position:[300,500] },
            { id:"inf104", type:"infantry", position:[400,500] },
        ],
        
        teams:[
            {   id:"tea001", index:0,
                units:[ "tnk001","tnk002","tnk003","tnk004","art001","art002","art003","art004","sup001","sup002","sup003","sup004","inf001","inf002","inf003","inf004"] },
            {   id:"tea002", index:1,
                units:[ "tnk101","tnk102","tnk103","tnk104","art101","art102","art103","art104","sup101","sup102","sup103","sup104","inf101","inf102","inf103","inf104"] },
        ],
        
        players:[
            { id:"ply001", team:"tea001", type:"hu" },
            { id:"ply002", team:"tea002", type:"ai" },
        ],
        
        world:{
            // current world view position
            position:[2000,342],
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
            type:"normal",
        },
    };
// });