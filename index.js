"use strict";

require('ref')

class BufferContext {
    constructor(buffer) {
        this.buffer = buffer;
        this._next = null;
    }
}

class BufferStream {
    constructor() {
        this.size = 0;
        this.firstCtx = null;
        this.lastCtx = null;
        this.tempBuffer = Buffer.alloc(8);
    }

    clear() {
        this.size = 0;
        this.firstCtx = null;
        this.lastCtx = null;
    }

    write(buffer) {
        let ctx = new BufferContext(buffer);

        this.push(ctx);
    }

    writeSlice(buffer, offset, size) {
        let end;

        if (!offset) {
            offset = 0;
        }

        if (!size) {
            end = buffer.length;
        }

        end += offset;

        if (end > buffer.length) {
            throw new Error(`out of range. buffer length=${buffer.length}, offset add size=${end}`);
        }

        this.push(buffer.slice(offset, end));
    }

    push(ctx) {
        this.size += ctx.buffer.length;

        if (this.firstCtx == null) {
            this.firstCtx = ctx;
        }

        if (this.lastCtx != null) {
            this.lastCtx._next = ctx;
        }

        this.lastCtx = ctx;
    }

    remove(length) {
        if (!length || length <= 0) {
            return;
        }

        if (this.size <= length) {
            this.clear();

            return;
        }

        this.size -= length;

        while (true) {
            //if first ctx's buffer length <= discard length, discard it.
            if (this.firstCtx.buffer.length <= length) {
                length -= this.firstCtx.buffer.length;
                this.firstCtx = this.firstCtx._next;
            } else {
                this.firstCtx.buffer = this.firstCtx.buffer.slice(length);
                break;
            }
        }
    }

    read(index) {
        if (!index || index < 0) {
            index = 0;
        }

        if (index >= this.size) {
            throw new Error(`index out of size. index=${index}, size=${this.size}`);
        }

        let res = this.getCtxBegin(index);

        return res.ctx.buffer[res.index];
    }

    readArray(length, index) {
        if (!length || length <= 0) {
            return;
        }

        if (!index) {
            index = 0;
        }

        if (index + length > this.size) {
            throw new Error('out of range');
        }

        let beginRes = this.getCtxBegin(index);
        let begthisize = beginRes.ctx.buffer.length - beginRes.index;

        if (begthisize >= length) {
            return beginRes.ctx.buffer.slice(beginRes.index, beginRes.index + length);
        }

        let buffer = Buffer.allocUnsafeSlow(length);
        beginRes.ctx.buffer.copy(buffer, 0, beginRes.index, beginRes.ctx.buffer.length);
        let copyIndex = begthisize;
        length -= begthisize;

        let ctx = beginRes.ctx;

        while (true) {
            ctx = ctx._next;

            if (ctx.buffer.length >= length) {
                ctx.buffer.copy(buffer, copyIndex, 0, length);
                return buffer;
            }

            ctx.buffer.copy(buffer, copyIndex);
            copyIndex += ctx.buffer.length;
            length -= ctx.buffer.length;
        }
    }

    readInt16LE(index) {
        return this.readTempArray(2, index).readInt16LE(0);
    }

    readUInt16LE(index) {
        return this.readTempArray(2, index).readUInt16LE(0);
    }

    readInt16BE(index) {
        return this.readTempArray(2, index).readInt16BE(0);
    }

    readUInt16BE(index) {
        return this.readTempArray(2, index).readUInt16BE(0);
    }

    readInt32LE(index) {
        return this.readTempArray(4, index).readInt32LE(0);
    }

    readUInt32LE(index) {
        return this.readTempArray(4, index).readUInt32LE(0);
    }

    readInt32BE(index) {
        return this.readTempArray(4, index).readInt32BE(0);
    }

    readUInt32BE(index) {
        return this.readTempArray(4, index).readUInt32BE(0);
    }

    readInt64LE(index) {
        return this.readTempArray(8, index).readInt64LE(0);
    }

    readUInt64LE(index) {
        return this.readTempArray(8, index).readUInt64LE(0);
    }

    readInt64BE(index) {
        return this.readTempArray(8, index).readInt64BE(0);
    }

    readUInt64BE(index) {
        return this.readTempArray(8, index).readUInt64BE(0);
    }

    readTempArray(length, index) {
        if (!length || length <= 0) {
            return;
        }

        if (!index) {
            index = 0;
        }

        if (index + length > this.size) {
            throw new Error('out of range');
        }

        let beginRes = this.getCtxBegin(index);
        let begthisize = beginRes.ctx.buffer.length - beginRes.index;

        if (begthisize >= length) {
            return beginRes.ctx.buffer.slice(beginRes.index, beginRes.index + length);
        }

        beginRes.ctx.buffer.copy(this.tempBuffer, 0, beginRes.index, beginRes.ctx.buffer.length);
        let copyIndex = begthisize;
        length -= begthisize;
        let ctx = beginRes.ctx;

        while (true) {
            ctx = ctx._next;

            if (ctx.buffer.length >= length) {
                ctx.buffer.copy(this.tempBuffer, copyIndex, 0, length);
                return this.tempBuffer;
            }

            ctx.buffer.copy(this.tempBuffer, copyIndex);
            copyIndex += ctx.buffer.length;
            length -= ctx.buffer.length;
        }
    }

    getCtxBegin(index) {
        let ctx = this.firstCtx;

        while (ctx.buffer.length <= index) {
            index -= ctx.buffer.length;
            ctx = ctx._next;
        }

        return { ctx, index };
    }
}

module.exports = BufferStream;