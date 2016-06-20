import { arr } from "lively.lang";
import Plugin from "../plugin.js";
import Serializer from "../serializer.js";

const classMetaForSerializationProp = "lively.serializer-class-info",
      moduleMetaInClassProp = Symbol.for("lively-instance-module-meta");

export default class ClassPlugin extends Plugin {

  static get moduleMetaInClassProp() { return moduleMetaInClassProp }
  static get classMetaForSerializationProp() { return classMetaForSerializationProp }

  constructor(options) {
    this.options = Object.assign({
      ignoreClassNotFound: true
    }, options);

    this.isInstanceRestorer = true; // for Class.intializer
    this.classNameProperty = '__LivelyClassName__';
    this.sourceModuleNameProperty = '__SourceModuleName__';
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // plugin interface
  additionallySerialize(original, persistentCopy) {
    this.addClassInfoIfPresent(original, persistentCopy);
  }

  deserializeObj(persistentCopy) {
    return this.restoreIfClassInstance(persistentCopy);
  }

  // ignoreProp(obj, propName) {
  //   return propName == this.classNameProperty
  // }

  // ignorePropDeserialization(regObj, propName) {
  //   return this.classNameProperty === propName
  // }

  afterDeserializeObj(obj) {
    this.removeClassInfoIfPresent(obj);
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // class info persistence

  addClassInfoIfPresent(original, persistentCopy) {
    // store class into persistentCopy if original is an instance
    if (!original || !original.constructor) return;
    
    var className = original.constructor.name,
        persistenceProp = this.constructor.classMetaForSerializationProp,
        classProp = this.constructor.moduleMetaInClassProp;

    if (!className) {
      console.warn(`Cannot serialize class info of anonymous class of instance ${original}`);
      return;
    }

    var meta = {className, module: original.constructor[classProp]}
    persistentCopy[persistenceProp] = meta;
  }

  restoreIfClassInstance(persistentCopy) {
    var persistenceProp = this.constructor.classMetaForSerializationProp;
    if (!persistentCopy.hasOwnProperty(persistenceProp)) return;
    var meta = persistentCopy[persistenceProp];
    if (!meta.className) return;

    var klass = this.locateClass(meta);
    if (!klass || !(klass instanceof Function)) {
      var msg = `ObjectGraphLinearizer is trying to deserialize instance of ${meta.className} but this class cannot be found!`;
      if (!this.options.ignoreClassNotFound) throw new Error(msg);
      console.error(msg);
      return {isClassPlaceHolder: true, className: meta.className};
    }
    return new klass(this);
  }

  removeClassInfoIfPresent(obj) {
    var prop = this.constructor.classMetaForSerializationProp;
    if (obj.hasOwnProperty(prop)) delete obj[prop];
  }

  locateClass(meta) {
    // meta = {className, module: {package, pathInPackage}}
    var module = meta.module;
    if (module.package && module.package.name) {
      var packagePath = System.decanonicalize(module.package.name + "/"),
          moduleId = lively.lang.string.joinPath(packagePath, module.pathInPackage.replace(/^\.\//, "")),
          module = System.get("@lively-env").moduleEnv(moduleId);
      console.warn(`Trying to deserialize instance of class ${meta.className} but the module ${moduleId}  is not yet loaded`);
      return module.recorder[meta.className];
    }

    // is it a global?
    return System.global[meta.className];
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // searching
  static sourceModulesIn(registryObj) {

    var modules = [],
        partsBinRequiredModulesProperty = 'requiredModules',
        classProp = this.classMetaForSerializationProp
    Serializer.allRegisteredObjectsDo(registryObj, (id, value) => {

      if (value && value[classProp])
        modules.push(value[classProp]);
      if (value && value[partsBinRequiredModulesProperty])
        modules.pushAll(value[partsBinRequiredModulesProperty]);
    });

    return arr.uniqBy(modules, (a, b) => {
      var modA = a.module, modB = b.module;
      if ((!modA && !modB) || (modA && !modB) || (!modA && modB))
        return a.className === b.className;
      return a.className === b.className
          && modA.package.name == modB.package.name
          && modA.package.pathInPackage == modB.package.pathInPackage;
    });
  }

}
