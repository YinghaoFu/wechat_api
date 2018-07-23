import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.wx.handlers;

        plugin.route([
            // Application Routes
            { method: 'POST', path: '/wx/jsconfig', config: handlers.Admin.jsconfig },
            { method: 'GET', path: '/wx/{client}/ack', config: handlers.Admin.ack },
            { method: 'POST', path: '/wx/{client}/ack', config: handlers.Admin.msg },
            { method: 'POST', path: '/wx/{client}/sendtemplate', config: handlers.Admin.sendtemplate },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'wx'
};
