const users = [];

// Join user to chat
function userJoin(id, username, sessionid) {
    const user = { id, username, sessionid};

    users.push(user);

    return user;
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getUsers() {
    return users;
}

module.exports = {
    userJoin,
    userLeave,
    getUsers
};