const HTTPCodes = {
    // 2XX Codes
    SUCCESS: 200,
    RESOURCE_CREATED: 201,
    // 4XX Codes
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ALLOWED: 406,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    // 5XX Codes
    SERVER_ERROR: 500,
};

const verifyParamsExist = (obj, params) => {
    for (const key of params){
        if (obj[key] === undefined) {
            return false;
        }
    }
    return true;
}

module.exports = {
    HTTPCodes: HTTPCodes,
    verifyParamsExist: verifyParamsExist,
};