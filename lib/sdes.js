/**
 * Created by gabriel on 10/2/16.
 */

/**
 * permute bits of a number
 * @param {Number} number The source number of permutation
 * @param {Array} lookup The lookup table of the permutation
 * @param {Number} num_length Length of the source number, in bits, default 8
 * @returns {Number}
 */
function permuteBits(number, lookup, num_length) {
    if (!num_length) num_length = 8;
    num_length--;
    return lookup.reduce((permuted, pos) => {
        return (permuted << 1) | ((number >> (num_length - pos)) & 1);
    }, 0);
}

function splitAndShift(key, offset) {
    var l = key >> 5;
    var r = key & 0x1F;

    return leftShift(l, offset) << 5 | leftShift(r, offset);
}

// rotate a number of 5 bits
function leftShift(number, offset) {
    return ((number << offset) | (number >> (5 - offset))) & 0x1F;
}

const s0 = new Uint8Array([
    1, 0, 3, 2,
    3, 2, 1, 0,
    0, 2, 1, 3,
    3, 1, 3, 2
]);

const s1 = new Uint8Array([
    1, 1, 2, 3,
    2, 0, 1, 3,
    3, 0, 1, 0,
    2, 1, 0, 3
]);

const sbox_lookup = new Uint8Array([
    0, 3, // S0 row
    1, 2, // S0 column
    4, 7, // S1 row
    5, 6  // S1 column
]);
function sbox(byte) {
    var coords = permuteBits(byte, sbox_lookup);
    return (s0[coords >> 4] << 4) | s1[coords & 0xf];
}

const ep = new Uint8Array([3, 0, 1, 2, 1, 2, 3, 0]);
const p4 = new Uint8Array([1, 3, 2, 0]);

function fk(byte, key) {
    // expand permute byte following `ep` lookup table
    // only the four least significant bits are used on expansion
    var r = permuteBits(byte, ep, 4) ^ key;
    //permute p4 in result of sbox(r), then xor with first 4 bits of byte
    return (permuteBits(sbox(r), p4, 4) << 4) ^ byte;
}


const ip = [1, 5, 2, 0, 3, 7, 4, 6];
const inverse_ip = [3, 0, 2, 4, 6, 1, 7, 5];

/**
 *
 * @param {Number} byte A byte of message
 * @param {Array} keys
 * @returns {Number} The encrypted byte
 */
function crypt(byte, keys) {

    byte = permuteBits(byte, ip);
    byte = fk(byte, keys[0]);
    // switch
    byte = byte << 4 | byte >> 4;
    byte = fk(byte, keys[1]);

    return permuteBits(byte, inverse_ip);
}

/**
 *
 * @param {Number} byte An encrypted byte
 * @param {Array} keys
 * @returns {Number} The encrypted byte
 */
function decrypt(byte, keys) {

    byte = permuteBits(byte, ip);
    byte = fk(byte, keys[1]);
    byte = byte << 4 | byte >> 4;
    byte = fk(byte, keys[0]);

    return permuteBits(byte, inverse_ip);
}

const p10 = new Uint8Array([2, 4, 1, 6, 3, 9, 0, 8, 7, 5]);
const p8 = new Uint8Array([5, 2, 6, 3, 7, 4, 9, 8]);


/**
 * Return a key pair generate from a 10 bits number
 * @param {Number} key A 10 bits key
 * @returns {Number[]} A pair of 8 bit keys
 */
function keys(key) {
    var p       = permuteBits(key, p10, 10);
    var shift_a = splitAndShift(p, 1);
    var shift_b = splitAndShift(shift_a, 2);

    return [
        permuteBits(shift_a, p8, 10),
        permuteBits(shift_b, p8, 10)
    ]
}

module.exports = {
    keys,
    crypt,
    decrypt
};