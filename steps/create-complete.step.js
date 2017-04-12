module.exports = session => {
    session.send(`Ok, I added ${session.userData.name} to the list`);
};
