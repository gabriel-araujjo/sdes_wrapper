/**
 * Created by gabriel on 10/1/16.
 */
const SDesStream = require('./lib/index');

var enc = new SDesStream.Encrypter({key: 123});
var dec = new SDesStream.Decrypter({key: 123});

enc.pipe(dec);

var clearText = 'ottony';

enc.on('data', (chunk) => {
    console.log(`intermediate data ${chunk.toString('hex')}`);
});

dec.on('data', (chunk) => {
    if (chunk.toString() == clearText) {
        console.log('passed');
    } else {
        console.log('failed');
    }
});

console.log(`initial data = '${clearText}' or '${Buffer.from(clearText).toString('hex')}'`);
enc.write(clearText);