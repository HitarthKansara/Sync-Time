const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const moment = require('moment');
let nodeCache = require('node-cache');

const app = express();

const server = http.createServer(app);
const io = socketIO(server);

let cache = new nodeCache();

app.use(express.json());


// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Send the updated time to the client every second
    setInterval(() => {

        socket.emit('time', { time: new Date().toLocaleTimeString() });

        socket.emit('clock1', moment(getUserClockTime('1')).format('HH:mm:ss'));
        socket.emit('clock2', moment(getUserClockTime('2')).format('HH:mm:ss'));

    }, 1000);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


//user_id, clock_time, utc, increment

function setClockIncrement(user_id, clock_time, utc, increment) {
    try {

        let data = {
            clock_time: moment(clock_time, 'HH:mm:ss').format('x'),
            utc: moment.utc().format('x'),
            increment
        };
        cache.set(user_id, JSON.stringify(data));
        return clock_time;

    } catch (err) {
        console.log('Error(setClockIncrement): ', err);
    }
}


function getUserDetails(user_id) {
    try {

        let user = cache.get(user_id);

        if (!user) {
            throw new Error('User not found');
        }

        user = JSON.parse(user);

        user.clock_time = moment(user.clock_time, 'x').format('HH:mm:ss');

        return user;

    } catch (err) {
        console.log('Error(getUserDetails): ', err);
    }
}



function getUserClockTime(userId) {

    try {

        let user = cache.get(userId);

        if (!user) {
            throw new Error('User not found');
        }

        let { utc, increment, clock_time } = JSON.parse(user);

        let utcTimeNow = utc;

        let startTime = moment(clock_time, 'x');
        let endTime = moment(utcTimeNow, 'x');

        let currentTime = moment(moment().format('x'), 'x');

        let timeDuration = moment.duration(currentTime.diff(endTime)).as('milliseconds');

        let timeToAdd = timeDuration / increment;

        return moment(startTime, 'x').add(timeToAdd, 'milliseconds');
    } catch (err) {
        console.log('Error(getUserClockTime): ', err);
    }
}


//Please use this api first to set time and increment of user
// Req Body -> {
//     "user_id": "1",
//     "current_time": "18:00:00",
//     "increment": 5
// }

setClockIncrement("1", "12:00:00", moment().utc(), "2");
setClockIncrement("2", "18:00:00", moment().utc(), "1");


app.post('/set-time', (req, res) => {
    try {

        let { user_id, increment, current_time } = req.body;

        setClockIncrement(user_id, current_time, moment().utc(), increment);

        return res.status(200).send({ message: 'Clock time set successfully', data: current_time });

    } catch (err) {
        console.log('Error(set-time): ', err);
        return res.status(500).send({ message: 'Server is not responding', error: err });
    }
})


// Use this api to view clock time of user
app.get('/get-time', (req, res) => {
    try {

        let { user_id } = req.query;

        let userClockTime = getUserClockTime(user_id);

        if (!userClockTime) return res.status(400).send({ message: 'User data not found' })

        return res.status(200).send({ message: 'Clock time get successfully', data: moment(userClockTime).format('HH:mm:ss') });

    } catch (err) {
        console.log('Error(get-time): ', err);
        return res.status(500).send({ message: 'Server is not responding', error: err });
    }
})



//Req Body -> {
//     "current_user_id": "2",
//     "user_id": "1"
// }

// Use this api to sync time of two users
app.post('/sync-time', (req, res) => {
    try {

        let { current_user_id, user_id } = req.body;

        let anotherUserClockTime = getUserClockTime(user_id);

        let currentUserDetails = getUserDetails(current_user_id);
        let anotherUserDetails = getUserDetails(user_id);

        let currentUtcTime = moment.utc().format('x');

        let currentUserData = {
            clock_time: moment(anotherUserClockTime).format('x'),
            utc: currentUtcTime,
            increment: currentUserDetails.increment
        };

        let anotherUserData = {
            clock_time: moment(anotherUserClockTime).format('x'),
            utc: currentUtcTime,
            increment: anotherUserDetails.increment
        };

        setClockIncrement(current_user_id, moment(currentUserData.clock_time, 'x').format('HH:mm:ss'), currentUserData.utc, currentUserData.increment);
        setClockIncrement(current_user_id == '1' ? '2' : '1', moment(currentUserData.clock_time, 'x').format('HH:mm:ss'), anotherUserData.utc, anotherUserData.increment);

        return res.status(200).send({ message: 'Clock time sync successfully', data: moment(anotherUserClockTime).format('HH:mm:ss') });

    } catch (err) {
        console.log('Error(sync-time): ', err);
        return res.status(500).send({ message: 'Server is not responding', error: err });
    }
});



server.listen(4000, () => console.log('Server running on port: ', 4000));