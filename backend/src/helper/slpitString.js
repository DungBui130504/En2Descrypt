function splitStringByLength(str, length = 30) {
    const result = [];
    for (let i = 0; i < str.length; i += length) {
        result.push(str.slice(i, i + length));
    }
    return result.join('\n');
}


module.exports = {
    splitStringByLength
}