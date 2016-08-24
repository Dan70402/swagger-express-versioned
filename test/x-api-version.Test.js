"use strict";

const
    rewire = require("rewire"),
    sinon = require("sinon"),
    filter = rewire("../filters/x-api-version.js"),
    assert = require("assert"),
    mocha = require("mocha");

describe("Test Default Version Getter", function() {
    var fn = filter.__get__("_getDefaultVersion");

    it('gets the latest', function() {
        let testCases = {
           "1.0.0" : [ "1.0.0" ],
           "2.0.0" : [ "1.0.0", "2.0.0", "1.9.9" ]
        };

        for (let answer in testCases) {
            assert.equal(answer, fn(testCases[answer]))
        }

    });

    it('accepts null arrays as version 0.0.0', function() {
        assert.equal("0.0.0", fn(undefined));
        assert.equal("0.0.0", fn([]));
    });

    it('throws on invalid override', function() {
        assert.throws(() => {
            fn([ "1.0.0", "2.0.0" ], "1.2.3")
        }, RangeError)
    });

    it('returns valid override', function() {
       assert.equal(fn([ "1.0.0", "2.0.0", "1.2.3" ], "1.2.3"), "1.2.3")
    });
});

describe("GetVersionOverride works as expected", function() {
    var fn = filter.__get__("_getVersionOverride");

    it('handles missing options key', function() {
        var options = {
            swaggerDefinition: {
                info: {
                    title: 'Hello World', // Title (required)
                    version: JSON.stringify(['1.0.0', '2.0.0']) // Version (required)
                }
            },
            apis: ['./api/controllers/*.js'] // Path to the API docs
        };

        assert.equal(fn(options), null)
    });

    it('handles missing defaultVersion key', function() {
        var options = {
            swaggerDefinition: {
                info: {
                    title: 'Hello World', // Title (required)
                    version: JSON.stringify(['1.0.0', '2.0.0']) // Version (required)
                }
            },
            "x-api-version" : {
            },
            apis: ['./api/controllers/*.js'] // Path to the API docs
        };

        assert.equal(fn(options), null)
    });
    it('returns expected override version', function() {
        var options = {
            swaggerDefinition: {
                info: {
                    title: 'Hello World', // Title (required)
                    version: JSON.stringify(['1.0.0', '2.0.0']) // Version (required)
                }
            },
            "x-api-version" : {
                defaultVersion : '1.0.0' //Optional override for default version.  Default to latest if absent
            },
            apis: ['./api/controllers/*.js'] // Path to the API docs
        };

        assert.equal(fn(options), '1.0.0')
    });
});

describe("Filter operates as expected", function() {
    var fn = filter.filterJsDocComments;
    var XTAG = "x-api-version";

    it('has matching version and latest default for wildcard with single version', function() {
        let options = {
            swaggerDefinition: {
                info: {
                    title: 'Hello World', // Title (required)
                    version: JSON.stringify(['1.0.0']) // Version (required)
                }
            }
        };

        let testRaw = '[{"/ping":{"x-api-version":"x","x-swagger-router-controller":"test","get":{"description":"I do work","operationId":"Ping1","responses":{"200":{"description":"Success"},"default":{"description":"Error"}}}}}]';''
        let result = fn(JSON.parse(testRaw), options);


        assert.ok("/1.0.0/ping" in result[0]);
        assert.equal("1.0.0", result[0]["/1.0.0/ping"][XTAG]);
        assert.equal("Ping1", result[0]["/1.0.0/ping"]["get"]["operationId"]);

        assert.ok("/ping" in result[1]);
        assert.equal("1.0.0", result[1]["/ping"][XTAG]);
        assert.equal("Ping1", result[1]["/ping"]["get"]["operationId"]);

    });

    it('has matching version and latest default for wildcard with multiple versions', function() {
        let options = {
            swaggerDefinition: {
                info: {
                    title: 'Hello World', // Title (required)
                    version: JSON.stringify(['1.0.0', '2.0.0']) // Version (required)
                }
            }
        };

        let testRaw = '[{"/ping":{"x-api-version":"x","x-swagger-router-controller":"test","get":{"description":"I do work","operationId":"Ping1","responses":{"200":{"description":"Success"},"default":{"description":"Error"}}}}}]';''
        let result = fn(JSON.parse(testRaw), options);


        //v1.0.0 endpoint
        assert.ok("/1.0.0/ping" in result[0]);
        assert.equal("1.0.0", result[0]["/1.0.0/ping"][XTAG]);
        assert.equal("Ping1", result[0]["/1.0.0/ping"]["get"]["operationId"]);

        //v2.0.0 endpoint
        assert.ok("/2.0.0/ping" in result[1]);
        assert.equal("2.0.0", result[1]["/2.0.0/ping"][XTAG]);
        assert.equal("Ping1", result[1]["/2.0.0/ping"]["get"]["operationId"]);

        //v2.0.0 default endpoint
        assert.ok("/ping" in result[2]);
        assert.equal("2.0.0", result[2]["/ping"][XTAG]);
        assert.equal("Ping1", result[2]["/ping"]["get"]["operationId"]);
    });

    it('throws error on collisions', function() {
        let options = {
            swaggerDefinition: {
                info: {
                    title: 'Hello World', // Title (required)
                    version: JSON.stringify(['1.0.0']) // Version (required)
                }
            }
        };

        let testRaw = '[{"/ping":{"x-api-version":"x","x-swagger-router-controller":"test","get":{"description":"Look-up clock prompts for site","operationId":"Ping1","responses":{"200":{"description":"Success"},"default":{"description":"Error"}}}}},{"/ping":{"x-api-version":"1.x","x-swagger-router-controller":"test","get":{"description":"Look-up clock prompts for site","operationId":"Ping2","responses":{"200":{"description":"Success"},"default":{"description":"Error"}}}}}]';
        assert.throws(() => {
            fn(JSON.parse(testRaw), options)
        }, RangeError)
    });

    it('handles multiple versions of the same endpoint', function() {
        let options = {
            swaggerDefinition: {
                info: {
                    title: 'Hello World', // Title (required)
                    version: JSON.stringify(['1.0.0', '2.0.0']) // Version (required)
                }
            }
        };

        let testRaw = '[{"/ping":{"x-api-version":"1.x","x-swagger-router-controller":"test","get":{"description":"Look-up clock prompts for site","operationId":"Ping1","responses":{"200":{"description":"Success"},"default":{"description":"Error"}}}}},{"/ping":{"x-api-version":"2.x","x-swagger-router-controller":"test","get":{"description":"Look-up clock prompts for site","operationId":"Ping2","responses":{"200":{"description":"Success"},"default":{"description":"Error"}}}}}]';
        let result = fn(JSON.parse(testRaw), options);

        //v1.0.0 endpoint
        assert.ok("/1.0.0/ping" in result[0]);
        assert.equal("1.0.0", result[0]["/1.0.0/ping"][XTAG]);
        assert.equal("Ping1", result[0]["/1.0.0/ping"]["get"]["operationId"]);

        //v2.0.0 endpoint
        assert.ok("/2.0.0/ping" in result[1]);
        assert.equal("2.0.0", result[1]["/2.0.0/ping"][XTAG]);
        assert.equal("Ping2", result[1]["/2.0.0/ping"]["get"]["operationId"]);

        //v2.0.0 default endpoint
        assert.ok("/ping" in result[2]);
        assert.equal("2.0.0", result[2]["/ping"][XTAG]);
        assert.equal("Ping2", result[2]["/ping"]["get"]["operationId"]);
    });

    it('does not include out of range versions', function() {
        let options = {
            swaggerDefinition: {
                info: {
                    title: 'Hello World', // Title (required)
                    version: JSON.stringify(['2.0.0']) // Version (required)
                }
            }
        };

        let testRaw = '[{"/ping":{"x-api-version":"1.x","x-swagger-router-controller":"test","get":{"description":"Look-up clock prompts for site","operationId":"Ping1","responses":{"200":{"description":"Success"},"default":{"description":"Error"}}}}},{"/ping":{"x-api-version":"2.x","x-swagger-router-controller":"test","get":{"description":"Look-up clock prompts for site","operationId":"Ping2","responses":{"200":{"description":"Success"},"default":{"description":"Error"}}}}}]';
        let result = fn(JSON.parse(testRaw), options);
        //v1.0.0 endpoint not there
        assert.ok(!("/1.0.0/ping" in result[0]));

        //v2.0.0 endpoint
        assert.ok("/2.0.0/ping" in result[0]);
        assert.equal("2.0.0", result[0]["/2.0.0/ping"][XTAG]);
        assert.equal("Ping2", result[0]["/2.0.0/ping"]["get"]["operationId"]);

        //v2.0.0 default endpoint
        assert.ok("/ping" in result[1]);
        assert.equal("2.0.0", result[1]["/ping"][XTAG]);
        assert.equal("Ping2", result[1]["/ping"]["get"]["operationId"]);
    });

});