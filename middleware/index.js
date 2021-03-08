const connection = require("connect-ensure-login");

exports.checkAuthenticated = connection.ensureLoggedIn("/");
