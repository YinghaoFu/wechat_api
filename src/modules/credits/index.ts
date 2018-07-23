import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.credits.handlers;

        plugin.route([
            // Application Routes
            { method: 'POST', path: '/credits/minus', config: handlers.Credits.minus },
            { method: 'GET', path: '/credits/getUserInfo', config: handlers.Credits.getUserInfo },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'credits'
};
