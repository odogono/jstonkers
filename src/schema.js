exports.env = JSV.createEnvironment();

exports.register = function( schemaId, path ){
    var data = require( path );
    schema = exports.env.createSchema( data, null, schemaId );
}



exports.validate = function( schemaUri, json ){
    // var schemaUri = 'com.odogono.heroes/schema/heroes.json' + schemaId;    
    var report = exports.env.validate( json, { '$ref' : schemaUri } );

    exports.report = report;
    exports.errors = _.map(report.errors,function(error){
        var result = { attribute:error.attribute, message:error.message, details:error.details };

        // find the property name
        if( error.attribute === 'additionalProperties'){
            return result;
        }

        result._property = error.schemaUri; 
        result.property = error.uri.substring( error.uri.lastIndexOf('/')+1 );

        return result;
    });
    
    return report.errors.length === 0;
}

exports.getTemplates = function( schemaUri ){
    schemaUri = schemaUri.indexOf('urn:') !== 0 ? 'urn:' + schemaUri : schemaUri;
    var schema = exports.env.findSchema(schemaUri);
    var schemaValue = schema.getValue(schemaUri);
    
    var templates = _.filter( schemaValue.properties, function(p){
        return p.template;
    });

    return templates;
}



// 
// 
// 
exports.getSchemaValue = function(schemaUri, referringUri, options){
    var schema;
    if( schemaUri[0] !== '#' && schemaUri.indexOf('urn:') !== 0 )
        schemaUri = 'urn:' + schemaUri;
    var schemaUriComponents = URI.parse(schemaUri);
    // log('finding ' + schemaUri + ' ' + referringUri+ ' ' + schemaUriComponents.reference);

    if( schemaUriComponents.reference === 'uri' ){
        schema = exports.env.findSchema(schemaUri);
    }
    else if( schemaUriComponents.reference === 'same-document' ){
        if( referringUri ){
            referringUri = URI.resolve(referringUri) + schemaUri;
            return exports.getSchemaValue(referringUri);
        }
        else
            return null;
    }
    
    // if( !schema && referringUri ){
    //     var parentSchema = URI.resolve( referringUri );
    //     // var components = URI.resolve(referringUri);//'http://heroes.odogono.com/entity#user');
    //     log('looking at ' + schemaUri + ' ' + inspect(URI.parse(schemaUri)) );//inspect(components) );
    //     // schema = exports.env.findSchema(schemaUri);    
    // }

    // if( options ){
    //     schema = exports.env.findSchema('urn:'+referringUri);
    //     log('found:');
    //     // print_ins( schema._env._schemas['urn:'+referringUri], false, 2, true );
    // }
    return schema ? schema.getValue(schemaUri) : null;
}

// 
// Converts a schema fragment to a form suitable for template rendering
// 
exports.schemaToTemplateData = function(schemaId, entity){
    log('schemaToTemplateData ' + schemaId );
    var result = {};
    var schemaUri = schemaId.indexOf('urn:') !== 0 ? 'urn:' + schemaId : schemaId;
    var schema = exports.env.findSchema(schemaUri);
    if( !schema ){
        log('could not find schema ' + schemaId );
    }
    var keys,vals,val,i,oschema,ref,schemaValue = schema.getValue(schemaId);
    
    result.id = schemaValue.id.substring(1);

    result.fields = _.map(schemaValue.properties, function(prop,propId){
        if( prop['extends'] ){
            ref = prop['extends']['$ref'];
            var oschemaUri = schema.resolveURI( ref );
            oschema = exports.env.findSchema( oschemaUri );
            if( oschema ){
                prop = _.extend( oschema.getValue( ref ), prop );
            }
            
            delete oschema['extends'];
        }
        var out = {name:propId, label:propId};
        var entityValue = entity ? entity.get(propId) : undefined;
        var notEditable = (prop['static']);

        var type = 'type_'+prop.type;

        if( entityValue !== undefined ){
            out.value = entityValue;
        }else{
            if( prop.default )
                out.value = prop.default;
        }
        
        if( prop._com_type )
            type = 'type_'+prop._com_type;
        else if( prop.enum ){
            type = 'type_select';
            out.values = [];
            keys = prop.labels || prop.enum;
            for(i=0;i<prop.enum.length;i++){
                val = { label:keys[i], value:prop.enum[i] };
                if( out.value === val.value )
                    val.selected = true;
                out.values.push( val );
            }
        }

        if( notEditable )
            type = type + '_static';
        out[type] = true;
        return out;
    });

    return result;
}