# Swagger-Express-Versioned

A thin wrapper around swagger-jsdoc, and swagger-express-mw to support versioned api's dynamically from JsDoc comments

## Example

For a sample implementation please reference the ```./example/samplesite```

```
Ping has distinct endpoints for v1.0.0 and v2.0.0
curl --header "X-Api-Version: 1.0.0" localhost:1234/ping
1.x
curl --header "X-Api-Version: 2.0.0" localhost:1234/ping
2.x

Ping default to the latest version 2.0.0
curl localhost:1234/ping
2.x

Pong is '*' and will match ALL valid versions
curl --header "X-Api-Version: 1.0.0" localhost:1234/pong
1.x
curl --header "X-Api-Version: 2.0.0" localhost:1234/pong
2.x

Invalid Api's are 404
curl --header "X-Api-Version: 3.0.0" localhost:1234/ping
Cannot GET /ping
curl --header "X-Api-Version: 1.1.1" localhost:1234/ping
Cannot GET /ping
```