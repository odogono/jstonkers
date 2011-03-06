var fs = require('fs'),
    crypto = require('crypto');

// Our Store is represented by a single JS object in *localStorage*. Create it
// with a meaningful name, like the name you'd give a table.
var FileStorage = function(options) {
  this.path = options.path || 'var/storage';
};

exports.create = function( options ) {
    var storage = new FileStorage();
    options = options || {};
    return storage;
}
exports.info = 'file storage adapter for backbone';
exports.FileStorage = FileStorage;

_.extend(FileStorage.prototype, {
    
    getFilename: function(model) {
        hash = crypto.createHash('md5');
        hash.update(model.id);
        return path.join( this.path, hash.digest('hex') + '.json' );
    },

  // Save the current state of the **Store** to *localStorage*.
    save: function() {
        // JSON.parse( fs.readFileSync( path.join( app_paths.etc, 'config.json' ) ) );  
    
    // localStorage.setItem(this.name, JSON.stringify(this.data));
    },

    // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
    // have an id of it's own.
    create: function(model) {
        if(!model.id) 
            model.id = model.attributes.id = uuid();
        
        filename = this.getFilename(model);
        fs.writeFileSync( filename, JSON.stringify(model) );
        return model;
    },

    // Update a model by replacing its copy in `this.data`.
    update: function(model) {
        filename = this.getFilename(model);
        fs.writeFileSync( filename, JSON.stringify(model) );
        return model;
    },

    // Retrieve a model from `this.data` by id.
    find: function(model) {
        var filename = this.getFilename(model);
        if( path.existsSync(filename) ){
            return JSON.parse( fs.readFileSync( filename ) );
        }
        return null;
    },

    // Return the array of all models currently in storage.
    findAll: function() {
        return fs.readdirSync(this.path).reduce(function(a,filename){
            var fullpath = path.join( dir, filename );
            var stat = fs.statSync(fullpath);
            if( stat.isFile() ) {
                if( /\.json$/.exec(filename) ){
                    return a.concat( JSON.parse( fs.readFileSync( fullpath ) ) );
                    // return a.concat( fullpath );
                }
            }
            return a;
        });
        
        // return _.values(this.data);
        // return null;
    },

    // Delete a model from `this.data`, returning it.
    destroy: function(model) {
        filename = this.getFilename(model);
        fs.unlinkSync( filename );
        return model;
    }
});

exports.FileSync = function(method, model, options) {
    var resp;
    var store = new FileStorage(jstonkers.config.storage);

    switch (method) {
        case 'read':
            resp = store.find(model);
            // resp = model.id ? store.find(model) : store.findAll();
            break;
        case 'create':  resp = store.create(model);                            break;
        case 'update':  resp = store.update(model);                            break;
        case 'delete':  resp = store.destroy(model);                           break;
    }

    if (resp) {
        // log('calling succcesssss!' + options.success);
        options.success(resp);
    } else {
        // log("CALLING FAIL");
        options.error('Record not found');
    }
};

// Override `Backbone.sync` to use delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
Backbone.sync = exports.FileSync;/*function(method, model, options) {

  var resp;
  var store = new FileStorage(jstonkers.config.storage);

  switch (method) {
    case 'read':    resp = model.id ? store.find(model) : store.findAll(); break;
    case 'create':  resp = store.create(model);                            break;
    case 'update':  resp = store.update(model);                            break;
    case 'delete':  resp = store.destroy(model);                           break;
  }

  if (resp) {
    options.success(resp);
  } else {
    options.error('Record not found');
  }
};//*/