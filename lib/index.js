const Transform   = require('stream').Transform;
const util        = require('util');
const Buffer      = require('buffer').Buffer;
const sdes = require('./sdes');

function SDesStream(options) {
  if (!(this instanceof SDesStream)) {
    return new SDesStream(options);
  }

  Transform.call(this, options);

  this.keys = sdes.keys(options.key);
}

util.inherits(SDesStream, Transform);

SDesStream.prototype._transform = function (chunk, encoding, callBack) {

  var buf = Buffer.from(chunk, encoding);
  for (var i = 0; i < buf.length; i ++) {
    buf[i] = this.sdes(buf[i]);
  }

  this.push(buf);

  callBack();
};

SDesStream.prototype.sdes = function () {
  throw Error('Unimplemented methid');
};

function Encrypter(options) {
  if (!(this instanceof SDesStream)) {
    return new Encrypter(options);
  }
  Encrypter.super_.apply(this, arguments);
}

util.inherits(Encrypter, SDesStream);
Encrypter.prototype.sdes = function (byte) {
  return sdes.crypt(byte, this.keys);
};

function Decrypter(options) {
  if (!(this instanceof SDesStream)) {
    return new Decrypter(options);
  }
  Decrypter.super_.apply(this, arguments);
}

util.inherits(Decrypter, SDesStream);
Decrypter.prototype.sdes = function (byte) {
  return sdes.decrypt(byte, this.keys);
};

module.exports = {
  SDesStreamEncrypt: Encrypter,
  SDesStreamDecrypt: Decrypter
};
