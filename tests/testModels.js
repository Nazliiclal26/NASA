// testModels.js
require('../config/loadEnv')();

const User = require('../models/user');
const Group = require('../models/Group');
const UserWatchlist = require('../models/UserWatchlist');
const GroupWatchlist = require('../models/GroupWatchlist');
const Votes = require('../models/Votes');

(async () => {
    try {
        // Test creating a user
        console.log('Creating a new user...');
        const newUser = await User.create('john_doe', 'securepassword', ['Fantasy', 'Thriller']);
        console.log('New user created:', newUser);

        // Test finding a user by username
        console.log('Finding user by username...');
        const foundUser = await User.findByUsername('john_doe');
        console.log('User found:', foundUser);

        // Test creating a group
        console.log('Creating a new group...');
        const newGroup = await Group.create('Book Club 1', newUser.id, 'book', 'public');
        console.log('New group created:', newGroup);

        // Test finding a group by ID
        console.log('Finding group by ID...');
        const foundGroup = await Group.findById(newGroup.id);
        console.log('Group found:', foundGroup);

        // Test adding an item to the user's watchlist
        console.log('Adding item to user watchlist...');
        const newWatchlistItem = await UserWatchlist.addItem(newUser.id, 'book123', 'book');
        console.log('Item added to user watchlist:', newWatchlistItem);

        // Test casting a vote
        console.log('Casting a vote...');
        const newVote = await Votes.castVote('BK01', 'The Great Gatsby');
        console.log('Vote casted:', newVote);

        // Test retrieving all votes for a group
        console.log('Retrieving all votes for a group...');
        const tempGroup = 'BK01';
        const groupVotes = await Votes.getVotesByGroup(tempGroup);
        console.log('Votes for group:', groupVotes);

        console.log('All tests completed successfully.');
    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        require('../config/db').end();
    }
})();
