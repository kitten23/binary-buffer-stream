# binary-buffer-stream
Read binary data in a Buffer stream (e.g. Buffers form a Socket) when parsing protocol. 

# Examples

``` js
let buf = new BufferStream();
let buffer1 = Buffer.from([0, 1])
let buffer2 = Buffer.from([2, 3, 4])
let buffer3 = Buffer.from([5, 6, 7])

buf.write(buffer1)
console.log(buf.size)//size=2

buf.write(buffer2)
console.log(buf.size)//size=5

buf.write(buffer3)
console.log(buf.size)//size=8

let data = buf.read(0)//byte at index 0
console.log(data)//0

data = buf.read(7)//byte at index 7
console.log(data)//7

data = buf.readArray(5, 1)//5 bytes at index 1
console.log(data)//Buffer(5) [1,2,3,4,5]

buf.remove(1)//discard some head bytes.
console.log(buf.size)//7

data = buf.readArray(5, 1)
console.log(data)//Buffer(5) [2,3,4,5,6]

buffer2[0] = buffer2[1] = buffer2[2] = buffer3[0] = 0xff
data = buf.readInt32LE(1)//32bit LE int at index 1
console.log(data)//-1 (0xffffffff)
```
