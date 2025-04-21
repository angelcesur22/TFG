exports.panel = (req, res) => {
    res.render('adminPanel', { user: req.session.user });
};