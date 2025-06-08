function checkNumber(num) {
    return typeof num == 'number' && !Number.isNaN(num);
}

export default checkNumber;
