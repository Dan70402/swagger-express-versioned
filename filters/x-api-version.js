var semver = require("semver");
const XTAG = "x-api-version";

/**
 * Gets the highest version for a versions array
 * @param versions
 * @param override
 * @returns {*}
 */
function _getDefaultVersion(versions, override = null) {
    let res = "0.0.0";
    if (!versions) {
        return res;
    }

    if(versions.length == 0){
        return res
    }

    if (override !== null) {
        if (versions.indexOf(override) <= -1) {
            throw new RangeError("Default version override does not exist in version ")
        }

        return override;
    }
    
    //Default to the latest
    res = versions[0];
    versions.forEach( function(v) {
        if (semver.gt(v, res)) {
            res = v
        }
    });

    return res;
}

/**
 * Quick checker that we haven't already added this name path to the res array
 *
 * @param arr
 * @param name
 * @private
 */
function _routeExists(arr, name) {
    for (let obj of arr) {
        if (obj.hasOwnProperty(name)) {
            return true;
        }
    }

    return false
}

/**
 * Quick checker that throw error for key collision
 * @param arr
 * @param name
 * @private
 */
function _collisionCheck(arr, name) {
    if (_routeExists(arr, name)) {
        throw RangeError("Semver collision on path " + name + ". Check your x-api-version definitions")
    }
}

/**
 * Helper to get the versions array
 *
 * @param options
 * @private
 */
function _getVersions(options) {
    return JSON.parse(options.swaggerDefinition.info.version)
}

/**
 *
 * @param options
 * @returns {*}
 * @private
 */
function _getVersionOverride(options) {
    if (!("x-api-version" in options)) {
        return null
    }

    if ((!"defaultVersion" in options["x-api-version"])) {
        return null
    }

    return options["x-api-version"]["defaultVersion"];
}

/**
 * Preprocessing rules for swaggerJsDocComments
 *
 * @param swaggerJsDocComments
 * @param options
 * @returns {Array}
 */
function filterJsDocComments(swaggerJsDocComments, options) {
    console.log(JSON.stringify(swaggerJsDocComments));
    var versions = _getVersions(options);
    var versionOverride = _getVersionOverride(options);
    var defaultVersion = _getDefaultVersion(versions, versionOverride);

    var result = [];
    versions.forEach( function(v) {
        swaggerJsDocComments.forEach( function(obj) {
            for (var key in obj) {
                //_collisionCheck(result, key);

                let apiVersion = "*";
                if (obj[key].hasOwnProperty(XTAG)) {
                    apiVersion = obj[key][XTAG];
                }

                if (semver.satisfies(v, apiVersion)) {
                    let newKey = "/" + v + key;

                    _collisionCheck(result, newKey);

                    let clone = JSON.parse(JSON.stringify(obj));
                    clone[newKey] = clone[key];
                    delete clone[key];
                    clone[newKey][XTAG] = v;
                    result.push(clone);

                    if (v === defaultVersion) {
                        let clone = JSON.parse(JSON.stringify(obj));
                        clone[key][XTAG] = defaultVersion;
                        result.push(clone);
                    }
                }
            }
        })
    });

    return result;
}


exports.filterJsDocComments = filterJsDocComments;