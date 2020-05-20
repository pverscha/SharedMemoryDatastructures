# SharedMemoryDatastructures
This library is intended to speed up the communication time between different JavaScript threads by exposing data structures that internally use a `SharedArrayBuffer` to store all required information. `SharedArrayBuffers` can be transfered and shared by multiple threads without an extra cost, but can only contain binary data.

I developed this library to partially overcome this issue by providing users with rich datastructures that implement the default JavaScript API and that can be (more or less) transparently used.

One downside to these datastructures is that they don't internally store references to objects that are being stored, but rather serialize an object and store it completely. This limitation cannot be overcome since objects themselves cannot be shared amongst threads by design (they can only be copied).

## Datastructures
### ShareableMap
Partially implements the JavaScript Map interface and tries to adhere to the map principles as good as possible.

