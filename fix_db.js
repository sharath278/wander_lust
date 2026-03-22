const mongoose = require('mongoose');
const Listing = require('./models/listing');
const User = require('./models/user');

mongoose.connect('mongodb://127.0.0.1:27017/wanderlust').then(async () => {
    console.log('Connected to DB');
    const user = await User.findOne({});
    if (!user) {
        console.log('No user found to assign listings to. Please create a user first.');
        process.exit(0);
    }

    const result = await Listing.updateMany(
        { owner: { $exists: false } },
        { $set: { owner: user._id } }
    );

    console.log(`Updated ${result.modifiedCount} listings to be owned by ${user.username}`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
