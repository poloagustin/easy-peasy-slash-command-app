module.exports = (session, results) => {
    session.userData.name = results.response;
    session.endDialog();
};
