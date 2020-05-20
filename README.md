# SharedMemoryDatastructures
## Introduction
This package is intended to speed up the communication time between different JavaScript threads by exposing data structures that internally use a `SharedArrayBuffer` to store all required information. `SharedArrayBuffers` can be transfered and shared by multiple threads without an extra cost, but can only contain binary data.

I developed this package to partially overcome this issue by providing users with rich datastructures that implement the default JavaScript API and that can be (more or less) transparently used.

One downside to these datastructures is that they don't internally store references to objects that are being stored, but rather serialize an object and store it completely. This limitation cannot be overcome since objects themselves cannot be shared amongst threads by design (they can only be copied).

## Installation
This package is available on npm and can be installed using

```
npm install shared-memory-datastructures
```

## Datastructures
### ShareableMap
Partially implements the JavaScript Map interface and tries to adhere to the map principles as good as possible. This map is currently aimed at setting each key, value pair once and reading the afterwards as `delete()` is not supported (and changing a key's value is also not supported).

**Not supported**
* `delete(key: K)`
* `set(key: K, value: V)` when `key` is already present in the map.

The reason for these functions that are not supported is straightforward. By deleting / changing a key's value, it's size changes which could leave empty gaps of space in the data storage array. We should fully support some form of defragmentation in order for memory requirements not to blow up in order to support the deletion and alteration of values.

