This application tests out the features of [winston](https://github.com/winstonjs/winston), a powerful logging library for node.js.

The emitter service logs dummy data which is saved in a mongodb collection via the [winston-mongodb](https://github.com/winstonjs/winston-mongodb) transport. The viewer service writes any documents added to the collection to the console. 

Run with `docker-compose up`.