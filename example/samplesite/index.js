"use strict";

const 
    App = require('express')(),
    Swagger = require('../../index.js');

var SwaggerOptions = {
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
 
Swagger.create(App, __dirname, SwaggerOptions);

App.listen(1234);

module.exports = App;