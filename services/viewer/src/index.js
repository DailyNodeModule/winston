const { MongoClient, ObjectID } = require('mongodb');

/**
 * The method below logs any insertions to the entires collection to the console.
 * In a real-world scenario this could allow for real-time processing of logs.
 * Events can be triggered based on the metadata attached with the message.
 */
(async () => {
    const connection = await MongoClient.connect(process.env.MONGO_URL || 'mongodb://localhost:27017', { useNewUrlParser: true });
    const db = connection.db('logs');

    const entries = await db.createCollection('entries', { capped: true, size: 1024 * 200 });

    let lastDoc = await entries.find({}, { _id: 1 }).sort({ $natural: -1 }).limit(1).next();

    if (!lastDoc) {
        lastDoc = {
            _id: new ObjectID()
        }

        await entries.insertOne(lastDoc);
    }
    
    const stream = entries.find({ _id: { $gt: lastDoc._id } }, { tailable: true, awaitdata: true, numberOfRetries: -1 }).stream();
    
    stream.on('data', console.log);
})();