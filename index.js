"use strict";

const
    SwaggerJsDoc = require('swagger-jsdoc'),
    VersionFilter = require('./filters/x-api-version'),
    YAML = require('json2yaml'),
    Swagger = require('swagger-express-mw');

/**
 *
 * @param app: Express application instance
 * @param options:
 *      {
            swaggerDefinition: {
                info: {
                    title: 'Hello World', // Title (required)
                    version: JSON.stringify(['1.0.0', '2.0.0']) // Version (required)
            }
        },
        apis: ['./api/controllers/*.js'], // Path to the API docs
        jsDocFilters: [ filters.xapiversion ]
        };
 * @returns {*}
 */
function create(app, appRoot, options) {

    options['jsDocFilters'] = [ VersionFilter ];
    var swaggerSpec = SwaggerJsDoc(options);
    console.log(YAML.stringify(swaggerSpec));


    let swaggerConfig = {
        appRoot: appRoot,
        swagger: swaggerSpec
    };

    app.use(function (req, res, next) {
        var header = req.header('X-Api-Version');
        if (typeof(header) !== 'undefined') {
            req.url = "/" + header + req.url;
        }

        next();
    });

    Swagger.create(swaggerConfig, function(err, swagger) {
        if (err) {
            throw err;
        }

        // install middleware
        swagger.register(app);
    });

    return app;
}

module.exports = {
    create: create
};