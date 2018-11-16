const BufferStream = require('../binary-buffer-stream');

testBufferStream();

function testBufferStream() {
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

    let data = buf.read(0)
    console.log(data)//0

    data = buf.read(7)
    console.log(data)//7

    data = buf.readArray(5, 1)
    console.log(data)//Buffer(5) [1,2,3,4,5]

    buf.remove(1)
    console.log(buf.size)//7

    data = buf.readArray(5, 1)
    console.log(data)//Buffer(5) [2,3,4,5,6]

    buffer2[0] = buffer2[1] = buffer2[2] = buffer3[0] = 0xff
    data = buf.readInt32LE(1)
    console.log(data)//-1 (0xffffff)


    let c1 = 0xFFFFFFFF
    let c2 = 0;
    let cc = c2 - c1;

    let b = new BufferStream();

    let b1 = Buffer.alloc(10);
    let b2 = Buffer.alloc(20);
    let b3 = Buffer.alloc(30);

    let n = 0;
    for (let i = 0; i < b1.length; i += 1) {
        b1[i] = n;
        n += 1;
    }
    for (let i = 0; i < b2.length; i += 1) {
        b2[i] = n;
        n += 1;
    }
    for (let i = 0; i < b3.length; i += 1) {
        b3[i] = n;
        n += 1;
    }

    b.write(b1);
    b.write(b2);
    b.write(b3);

    let a;
    a = b.read(8);
    a = b.read(28);
    a = b.read(48);
    a = b.readArray(10, 15);
    a = b.readArray(40, 8);

    b2.writeInt16LE(-3333);
    a = b.readInt16LE(10);
    b2.writeInt16BE(-3334);
    a = b.readInt16BE(10);
    b2.writeUInt16LE(3335);
    a = b.readUInt16LE(10);
    b2.writeUInt16BE(3336);
    a = b.readUInt16BE(10);


    b2.writeInt32LE(-1111);
    a = b.readInt32LE(10);
    b2.writeInt32BE(2147483647);
    a = b.readInt32BE(10);
    b2.writeUInt32LE(0xFFFFFFFF);
    a = b.readUInt32LE(10);
    b2.writeUInt32BE(1234567890);
    a = b.readUInt32BE(10);

    b2.writeInt64LE(-4444, 0);
    a = b.readInt64LE(10);
    b2.writeInt64BE(-4445, 0);
    a = b.readInt64BE(10);
    b2.writeUInt64LE(4446, 0);
    a = b.readUInt64LE(10);
    b2.writeUInt64BE(4447, 0);
    a = b2.readUInt64BE(0);
    a = b.readUInt64BE(10);

    b2[0] = b2[1] = b1[8] = 0
    b1[9] = b2[6] = 0xFF
    a = b.readInt16LE(9);
    a = b.readInt32LE(9);
    a = b.readInt64LE(9);
}