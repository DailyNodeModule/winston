const winston = require('winston');
const { MongoClient } = require('mongodb');

(async () => {
    const connection = await MongoClient.connect(process.env.MONGO_URL || 'mongodb://localhost:27017',{ useNewUrlParser: true });
    const db = connection.db('logs');

    // Capped collections in Mongo are great for stuff like logging. 
    // The database will discard the oldest documents once the collection surpasses a predetermined size. 
    await db.createCollection('entries', {
        capped: true,
        size: 1024 * 200,
        // A maximum size (in documents) can be set using the max parameter.
        /* max: 500 */  
    });

    // Each log can have different "levels", which represent the verbosity of the output.
    // The default levels in order of their verbosity are: silly, debug, verbose, info, warn, and error.
    // By default only levels higher than "info" will be displayed.
    const levels = {
        whisper: 5,
        quiet: 4,
        low: 3,
        normal: 2,
        loud: 1,
        shout: 0
    };

    // Winston really shows its strength with the availability of many different "transports", for stream logs to different destinations. 
    // The community has developed transports for many different logging systems, including Syslog, Papertrail, LogStash, and MongoDB. 
    require('winston-mongodb');

    // Messages can be displayed on the console, sent to a transport, or both.

    // Most of the functionality is centered around the Logger object, which can be configured to handle specific situations.
    const logger = winston.createLogger({
        levels,
        // Multiple transports can be added to a logger
        transports: [
            new winston.transports/* <-- All loaded transports will be added to the transports object */.Console({
                // Only error messages will appear on the console.
                level: 'loud',
                format: winston.format.simple()
                // JSON output can be useful for saving logs to a file, or piping to another application.
                // format: winston.format.json()
            }),
            new winston.transports.MongoDB({
                // All logs will go to mongo
                level: 'whisper',
                db,
                collection: 'entries'
            })
        ]
    });

    var i = 0;
    setInterval(() => {
        switch (i++) {
            case 0: 
                logger.whisper('speaking inaudibly');
                break;
            case 1: 
                logger.quiet('speaking quietly',);
                break;
            case 2: 
                logger.low('speaking with a low voice');
                break;
            case 3: 
                // Metadata can also be included with the message.
                logger.normal('speaking with a normal voice', { foo: 'bar' });
                break;
            case 4: 
                logger.loud(`I think something might be wrong`);
                break;
            case 5: 
                logger.shout(`SOMETHING'S DEFINITELY WRONG!`);
                break;
            default:
                i = 0;
        }
    }, 1000);
})();