import { arr, obj } from "lively.lang";


// forLively: function() {
//     throw new Error("Deprecated");
//     return this.withPlugins([
//         new DEPRECATEDScriptFilter(),
//         new ClosurePlugin(),
//         new RegExpPlugin(),
//         new IgnoreFunctionsPlugin(),
//         new ClassPlugin(),
//         new LivelyWrapperPlugin(),
//         new DoNotSerializePlugin(),
//         new DoWeakSerializePlugin(),
//         new StoreAndRestorePlugin(),
//         new LayerPlugin(),
//         new lively.persistence.DatePlugin(),
//         new lively.persistence.TypedArrayPlugin(),
//     ]);
// },
// forLivelyCopy: function() {
//     var serializer = this.forLively();
//     var p = new GenericFilter();
//     var world =  lively.morphic.World.current();
//     p.addFilter(function(obj, prop, value) { return value === world })
//     serializer.addPlugins([p]);
//     return serializer;
// },


export default class Serializer {

  static withPlugins(plugins) {
    var serializer = new this();
    serializer.addPlugins(plugins);
    return serializer;
  }

  static allRegisteredObjectsDo(registryObj, func, context) {
    for (var id in registryObj) {
      if (id === 'isSimplifiedRegistry') continue;
      if (!registryObj.hasOwnProperty(id)) continue;
      var registeredObject = registryObj[id];
      if (!registryObj.isSimplifiedRegistry)
        registeredObject = registeredObject.registeredObject;
      func.call(context, id, registeredObject);
    }
  }

  get defaultOptions() {
    return {
      defaultCopyDepth: 10000,
      keepIds: false,
      showLog: false,
      prettyPrint: false,
      plugins: [],
      idProperty: '__SmartId__'
    }
  }

  constructor(options) {
    this.options = Object.assign({}, this.defaultOptions, options);
    this.state = {
      // ids to give to objects being serialized
      idCounter: 0,
      // object to hold serialized representation of objects
      registry: {},
      // the JS path to access the object being (de)serialized
      // starting from the root
      path: [],
      // recursion counter
      copyDepth: 0,
      // path into the tree of the objects that are currently being
      // (de)serialized
      objStack: []
    }
  }

  cleanup(registry) {
    // remove ids from all original objects and the original objects as
    // well as any recreated objects
    for (var id in registry) {
      var entry = registry[id];
      if (!entry) continue;
      if (!this.options.keepIds && entry.originalObject)
        delete entry.originalObject[this.options.idProperty]
      if (!this.options.keepIds && entry.recreatedObject)
        delete entry.recreatedObject[this.options.idProperty]
      delete entry.originalObject;
      delete entry.recreatedObject;
    }
  }



// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// testing
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  isReference(obj) { return obj && obj.__isSmartRef__ }

  isValueObject(obj) {
    if (obj == null) return true;
    if ((typeof obj !== 'object') && (typeof obj !== 'function')) return true;
    if (this.isReference(obj)) return true;
    return false
  }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// accessing
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  newId() { return String(this.state.idCounter++); }


  getIdFromObject(obj) {
    return obj.hasOwnProperty(this.options.idProperty) ? obj[this.options.idProperty] : undefined;
  }

  getRegisteredObjectFromSmartRef(smartRef) {
    return this.getRegisteredObjectFromId(this.getIdFromObject(smartRef))
  }


  getRegisteredObjectFromId(id) {
    return this.state.registry[id] && this.state.registry[id].registeredObject
  }

  getRecreatedObjectFromId(id) {
    return this.state.registry[id] && this.state.registry[id].recreatedObject
  }

  setRecreatedObject(object, id) {
    var registryEntry = this.state.registry[id];
    if (!registryEntry)
      throw new Error('Trying to set recreated object in registry but cannot find registry entry!');
    registryEntry.recreatedObject = object
  }

  getRefFromId(id) {
    return this.state.registry[id] && this.state.registry[id].ref;
  }


  allIdsReferencedBy(registeredObject) {
    var vals = Object.isArray(registeredObject) ?
    registeredObject : Object.values(registeredObject);
    return lively.lang.arr.flatmap(vals, function(ref) {
      if (this.isReference(ref)) return [String(ref.id)];
      if (Object.isArray(ref)) return this.allIdsReferencedBy(ref);
      return [];
    }, this).uniq();
  }

  directReferencePaths(registeredObject) {
    // lists all direct references of registeredObject in a map form like
    // {
    //   1: [["hands", 0], ["submorphs", 1]],
    //   3: [["shape"]],
    //   ...
    // }
    var serializer = this;

    return gatherReferences(registeredObject, []).reduce(function(refMap, ea) {
      var ref = refMap[ea.id] || (refMap[ea.id] = []);
      ref.push(this.state.path);
      return refMap
    }, {});

    function gatherReferences(obj, path) {
      if (!obj || typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") return [];
      if (serializer.isReference(obj)) return [{path: path, id: String(obj.id)}];
      else if (Array.isArray(obj)) return lively.lang.arr.flatmap(obj, function(ea, i) { return gatherReferences(ea, path.concat([i])); })
      else if (Object.isObject(obj)) return lively.lang.arr.flatmap(Object.keys(obj), function(key) { return gatherReferences(obj[key], path.concat([key])); })
      else return [];
    }
  }


  referenceGraph(registry) {
    // creates a mapping ID -> [ID], key - owning object, val - all ids of
    // objects referenced by it
    var formerRegistry = this.state.registry;
    registry = this.state.registry = this.createRealRegistry(registry);
    var refs = {};
    for (var id in registry) {
      refs[id] = this.allIdsReferencedBy(registry[id].registeredObject);
    }
    this.state.registry = formerRegistry;
    return refs;
  }


  referenceGraphWithPaths(registry) {
    // creates a mapping ID -> {ID: [path1, path2, ...], ...}
    var formerRegistry = this.state.registry;
    registry = this.state.registry = this.createRealRegistry(registry);
    var graph = Object.keys(registry).reduce((map, id) => {
        map[id] = this.directReferencePaths(registry[id].registeredObject);
        return map;
    }, {});
    this.state.registry = formerRegistry;
    return graph;
  }


  invertedReferenceGraph(registry) {
    // creates a mapping ID -> [ID], key - an object in the registry, val -
    // all ids pointing to it
    // Useful for reference counting and garbage collection
    var graph = this.referenceGraph(registry), refs = {};
    for (var owningObjId in graph) {
      refs = graph[owningObjId].reduce(function(refs, id) {
        (refs[id] || (refs[id] = [])).pushIfNotIncluded(owningObjId);
        return refs;
      }, refs);
    }
    return refs;
  }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// plugins
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  addPlugin(plugin) {
    this.options.plugins.push(plugin);
    plugin.setSerializer(this);
    return this;
  }

  addPlugins(plugins) {
    plugins.forEach(function(ea) { this.addPlugin(ea) }, this);
    return this;
  }

  somePlugin(methodName, args) {
    // invoke all plugins with methodName and return the first non-undefined result (or null)
    for (var i = 0; i < this.options.plugins.length; i++) {
      var plugin = this.options.plugins[i],
        pluginMethod = plugin[methodName];
      if (!pluginMethod) continue;
      var result = pluginMethod.apply(plugin, args);
      if (result) return result
    }
    return null;
  }

  letAllPlugins(methodName, args) {
    // invoke all plugins with methodName and args
    for (var i = 0; i < this.options.plugins.length; i++) {
      var plugin = this.options.plugins[i],
        pluginMethod = plugin[methodName];
      if (!pluginMethod) continue;
      pluginMethod.apply(plugin, args);
    }
  }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// object registry -- serialization
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  registerWithPath(obj, path) {
    this.state.path.push(path);
    try {
      return this.register(obj);
    } finally {
      this.state.path.pop();
    }
  }

  register(obj) {
    if (this.isValueObject(obj)) return obj;

    if (Object.isArray(obj)) {
      var result = [];
      this.state.objStack.push(result);
      for (var i = 0, len = obj.length; i < len; i++) {
        var item = obj[i];
        if (this.somePlugin('ignoreProp', [obj, i, item, result])) continue;
        result.push(this.registerWithPath(item, i));
      }
      this.state.objStack.pop();
      return result;
    }

    var id = this.addIdAndAddToRegistryIfNecessary(obj);
    return this.state.registry[id].ref;
  }

  addIdAndAddToRegistryIfNecessary(obj) {
    var id = this.getIdFromObject(obj);
    if (this.state.registry[id] && this.state.registry[id].originalObject && this.state.registry[id].originalObject !== obj) {
      // This only happens when something went wrong while serializing and
      // the registry + registeredObjects weren't cleaned up...
      id = undefined;
    }
    if (id === undefined) id = this.addIdToObject(obj);
    if (!this.state.registry[id]) this.addNewRegistryEntry(id, obj)
    return id
  }

  addNewRegistryEntry(id, obj) {
    // copyObjectAndRegisterReferences must be done AFTER setting the registry entry
    // to allow reference cycles
    var entry = this.createRegistryEntry(obj, null/*set registered obj later*/, id);
    this.state.registry[id] = entry;
    entry.registeredObject = this.copyObjectAndRegisterReferences(obj)
    return entry
  }

  createRegistryEntry(realObject, registeredObject, id) {
    return {
      originalObject: realObject || null,
      registeredObject: registeredObject || null, // copy of original with replaced refs
      recreatedObject: null, // new created object with patched refs
      ref: {__isSmartRef__: true, id: id},
    }
  }

  copyPropertiesAndRegisterReferences(source, copy) {
    Object.keys(source).forEach(function(key) {
      if (!source.hasOwnProperty(key) || (key === this.options.idProperty && !this.options.keepIds)) return;
      try {
        var value = source[key];
        if (this.somePlugin('ignoreProp', [source, key, value, copy])) return;
        copy[key] = this.registerWithPath(value, key);
      } catch(e) {
        console.error('Serialization error: %s\n%s', e, e.stack);
      }
    }, this);
  }

  copyObjectAndRegisterReferences(obj) {
    if (this.state.copyDepth > this.defaultCopyDepth) {
      alert("Error in copyObjectAndRegisterReferences, path: " + this.state.path);
      throw new Error('Stack overflow while registering objects? ' + obj)
    }
    this.state.copyDepth++;
    var copy = {},
      source = this.somePlugin('serializeObj', [obj, copy]) || obj;
    this.state.objStack.push(copy);
    // go through references in alphabetical order
    this.copyPropertiesAndRegisterReferences(source, copy);
    this.letAllPlugins('additionallySerialize', [source, copy]);
    this.state.objStack.pop();
    this.state.copyDepth--;
    return copy;
  }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// object registry -- deserialization
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  recreateFromId(id) {
    var recreated = this.getRecreatedObjectFromId(id);
    if (recreated) return recreated;

    // take the registered object (which has unresolveed references) and
    // create a new similiar object with patched references
    var registeredObj = this.getRegisteredObjectFromId(id);
    if (!registeredObj) {
      console.error('Error when trying to deserialize object registered\n'
            + 'with id %s (%s). No object was recorded. The serializer will try to\n'
            + 'fix things but things might end up to be broken.', id, this.state.path.last());
      return null; // oha
    }
    recreated = this.somePlugin('deserializeObj', [registeredObj]) || {};
    this.setRecreatedObject(recreated, id); // important to set recreated before patching refs!
    Object.keys(registeredObj).forEach(function(key) {
      var value = registeredObj[key];
      if (this.somePlugin('ignorePropDeserialization', [registeredObj, key, value])) return;
      this.state.path.push(key); // for debugging
      recreated[key] = this.patchObj(value);
      this.state.path.pop();
    }, this);
    this.letAllPlugins('afterDeserializeObj', [recreated, registeredObj, id]);
    return recreated;
  }

  patchObj(obj) {
    if (this.isReference(obj))
      return this.recreateFromId(obj.id)

    if (Object.isArray(obj))
      return obj.collect(function(item, idx) {
        this.state.path.push(idx); // for debugging
        var result = this.patchObj(item);
        this.state.path.pop();
        return result;
      }, this)

    return obj;
  }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// serializing
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  serialize(obj) {
    return JSON.stringify(this.serializeToJso(obj), null, this.options.prettyPrint ? 2 : undefined);
  }

  serializeToJso(obj) {
    try {
      var start = new Date();
      var ref = this.register(obj);
      this.letAllPlugins('serializationDone', [this.state.registry, [ref.id]/*roots*/]);
      var simplifiedRegistry = this.simplifyRegistry(this.state.registry);
      var root = {id: ref.id, registry: simplifiedRegistry};
      this.log('Serializing done in ' + (new Date() - start) + 'ms');
      return root;
    } catch (e) {
      this.log('Cannot serialize ' + obj + ' because ' + e + '\n' + e.stack);
      return null;
    } finally {
      this.cleanup(this.state.registry);
    }
  }

  simplifyRegistry(registry) {
    var simplified = {isSimplifiedRegistry: true};
    for (var id in registry)
      simplified[id] = this.getRegisteredObjectFromId(id)
    return simplified;
  }

  addIdToObject(obj) {
    return obj[this.options.idProperty] = this.newId();
  }

  reset() {
    this.state.registry = {};
  }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// deserializing
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  deserialize(json) {
    var jso = JSON.parse(json);
    return this.deserializeJso(jso);
  }

  deserializeJso(jsoObj) {
    var start = new Date(),
      id = jsoObj.id;
    this.state.registry = this.createRealRegistry(this.state.registry);
    var result = this.recreateFromId(id);
    this.letAllPlugins('deserializationDone', [jsoObj]);
    this.cleanup(this.state.registry);
    this.log('Deserializing done in ' + (new Date() - start) + 'ms');
    return result;
  }

  createRealRegistry(registry) {
    if (!registry.isSimplifiedRegistry) return registry;
    var realRegistry = {};
    for (var id in registry)
      if (id !== 'isSimplifiedRegistry')
        realRegistry[id] = this.createRegistryEntry(null, registry[id], id);
    return realRegistry;
  }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// copying
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  copy(obj) {
    var rawCopy = this.serializeToJso(obj);
    if (!rawCopy) throw new Error('Cannot copy ' + obj)
    return this.deserializeJso(rawCopy);
  }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// compaction
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


  compactRegistry(registry, objectsToRemove, roots) {
    // kind of a garbage collection on an existing registry object
    // objectsToRemove and roots are optional
    // Take registry, optionally remove objectsToRemove and then repeatedly
    // remove those objects that aren't referenced anymore

    var simplifiedRegistry = this.state.registry ? registry : null;
    registry = this.createRealRegistry(this.state.registry || registry);
    var referenceGraph = this.referenceGraph(registry);
    var invertedReferenceGraph = this.invertedReferenceGraph(registry);
    roots = (roots || []).map(String);
    if (simplifiedRegistry) roots.pushIfNotIncluded(String(simplifiedRegistry.id));
    objectsToRemove = (objectsToRemove || []).map(String).withoutAll(roots);
    var removed = {};
    var step = 0;

    while (objectsToRemove.length && step++ < 10000) {
      // removal
      var toUpdate = objectsToRemove.reduce(function(toUpdate, removeId) {
        if (removeId in removed) return toUpdate;

        removed[removeId] = registry[removeId];
        var refs = referenceGraph[removeId];
        if (refs) {
        toUpdate.pushAll(refs);
        refs.forEach(function(id) {
          if (invertedReferenceGraph[id])
          invertedReferenceGraph[id].remove(removeId);
        });
        }
        delete registry[removeId];
        delete invertedReferenceGraph[removeId];
        delete referenceGraph[removeId];
        return toUpdate;
      }, []);

      // figure out what objects aren't referenced anymore to remove those next
      objectsToRemove = toUpdate.reduce(function(toBeRemoved, id) {
        if (!invertedReferenceGraph[id]
         || !invertedReferenceGraph[id].length
         || !Object.keys(lively.lang.graph.subgraphReachableBy(invertedReferenceGraph, id))
               .some(id => roots.indexOf(id) > -1)) { toBeRemoved.push(id); }
        return toBeRemoved;
      }, []).withoutAll(roots);

    };

    this.cleanup(removed);

    if (step >= 10000) console.error("Endless compaction");

    return simplifiedRegistry ?
      {id: simplifiedRegistry.id, registry: this.simplifyRegistry(registry)} :
      registry;
  }


  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // debugging
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  log(msg) {
    if (!this.options.showLog) return;
    typeof lively !== "undefined" && lively.morphic && lively.morphic.World && lively.morphic.World.current() ?
      lively.morphic.World.current().setStatusMessage(msg, Color.blue, 6) :
      console.log(msg);
  }

  getPath() { return '["' + this.state.path.join('"]["') + '"]' }

}
