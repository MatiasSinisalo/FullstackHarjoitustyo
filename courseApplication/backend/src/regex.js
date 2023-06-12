const isValidAsUrl = (value) => {
    const valid = /^([A-Za-z0-9])+((-?)([A-Za-z0-9]+))*$/.test(value)
    return valid;
}

module.exports = {
    isValidAsUrl
}