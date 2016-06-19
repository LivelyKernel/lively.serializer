export default class Plugin {

  getSerializer() { return this.serializer }
  setSerializer(s) { return this.serializer = s }

  /* interface methods that can be reimplemented by subclasses:
  serializeObj(original) {}
  additionallySerialize(original, persistentCopy) {}
  deserializeObj(persistentCopy) {}
  ignoreProp(obj, propName, value, persistentCopy) {}
  ignorePropDeserialization(obj, propName, value) {}
  afterDeserializeObj(obj, persistentCopy) {}
  deserializationDone() {}
  serializationDone(registry) {}
  */
}