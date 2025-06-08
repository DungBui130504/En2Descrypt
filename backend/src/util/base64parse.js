const pdfParse = require('pdf-parse');

async function extractSignatureBase64(pdfBuffer) {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    const base64Regex = /([A-Za-z0-9+/=]{100,})/g;
    const matches = text.match(base64Regex);

    if (matches && matches.length > 0) {
        let longest = matches.reduce((a, b) => (a.length > b.length ? a : b));
        return longest;
    }

    throw new Error('No signature found in PDF text');
}

module.exports = {
    extractSignatureBase64
}
