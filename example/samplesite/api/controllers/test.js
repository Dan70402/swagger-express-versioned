/**
 * @swagger
 * /ping:
 *   x-api-version: "1.x"
 *   x-swagger-router-controller: "test"
 *   get:
 *     description: "My first Ping method ever"
 *     operationId: "Ping1"
 *     responses:
 *       200:
 *         description: "Success"
 *       default:
 *         description: "Error"
 */
function Ping1(req, res) {
    console.log("1.x");
    res.send("1.x");
}

/**
* @swagger
* /ping:
*   x-api-version: "2.x"
*   x-swagger-router-controller: "test"
*   get:
*     description: "My second Ping method cause the first was wrong"
*     operationId: "Ping2"
*     responses:
*       200:
*         description: "Success"
*       default:
*         description: "Error"
*/
function Ping2(req, res) {
    console.log("2.x");
    res.send("2.x");
}

/**
 * @swagger
 * /pong:
 *   x-api-version: "*"
 *   x-swagger-router-controller: "test"
 *   get:
 *     description: "My bullet proof PONG message"
 *     operationId: "Pong1"
 *     responses:
 *       200:
 *         description: "Success"
 *       default:
 *         description: "Error"
 */
function Pong1(req, res) {
    console.log("*");
    res.send("*");
}




module.exports = {
    Ping1: Ping1,
    Ping2: Ping2,
    Pong1: Pong1
};
