import * as WechatAPI from 'wechat-api'
import * as Boom from 'boom'
import config from '../../../config/config'
import { auth, message } from 'node-weixin-api'
const messages = message.messages;
const rreply = message.reply
declare var models: any;

const clients = config.clients

declare let cache: any;

let getApi: any = function (client, callback) {

    let api = new WechatAPI(clients[client].appid, clients[client].secret, (cb) => {
        //  读取access_token
        cache.get(`${client}-access_token`, (err, value, cached, log) => {
            if (!err) {
                cb(null, JSON.parse(value))
            }
            cb(null, null)
        });
    }, (token, cb) => {
        //  写入读取access_token 
        cache.set(`${client}-access_token`, JSON.stringify(token), null, (err) => {
        });
    })

    api.registerTicketHandle((type, cb) => {
        // get api ticket
        cache.get(`${client}-api_ticket`, (err, value, cached, log) => {
            if (!err) {
                cb(null, JSON.parse(value))
            }
            cb(null, null)
        });
    }, (type, _ticketToken, cb) => {
        //  set api ticket
        cache.set(`${client}-api_ticket`, JSON.stringify(_ticketToken), null, (err) => {
        });
        cb(null)
    })
    callback(null, api)
}

let getJsConfig = function (api, param) {
    return new Promise((resolve, reject) => {
        api.getJsConfig(param, (err, result) => {
            if (!err) {
                return resolve(result)
            }
            return reject(err)
        })
    })
}


module.exports.jsconfig = {
    handler: function (request, reply) {
        let url = request.payload.url
        let client = request.payload.client
        getApi(client, async (err, api) => {
            let param = {
                debug: false,
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'playVoice',
                    'pauseVoice',
                    'stopVoice',
                    'onVoicePlayEnd',
                    'uploadVoice',
                    'downloadVoice',
                    'chooseImage',
                    'previewImage',
                    'uploadImage',
                    'downloadImage',
                    'translateVoice',
                    'getNetworkType',
                    'openLocation',
                    'getLocation',
                    'hideOptionMenu',
                    'showOptionMenu',
                    'hideMenuItems',
                    'showMenuItems',
                    'hideAllNonBaseMenuItem',
                    'showAllNonBaseMenuItem',
                    'closeWindow',
                    'scanQRCode',
                    'chooseWXPay',
                    'openProductSpecificView',
                    'addCard',
                    'chooseCard',
                    'openCard',
                ],
                url: url
            }
            try {
                let result = await getJsConfig(api, param)
                return reply(result)
            } catch (error) {
                return reply(Boom.badRequest('请求JsConfig失败'))
            }
        })
    }
}

module.exports.ack = {
    handler: function (request, reply) {
        // console.log(request);
        let client = request.params.client
        let conf = config.clients[client]

        let data = auth.extract(request.query);
        // console.log(data);
        auth.ack(conf.token, data, function (error, echoStr) {
            if (!error) {
                reply(echoStr);
                return;
            }
            switch (error) {
                case 1:
                    reply('Input Error!');
                    break;
                case 2:
                    reply('Signature Not Match!');
                    break;
                default:
                    reply('Unknown Error!');
                    break;
            }
        });
    }
}
messages.on.text(function (message, reply, callback, extra) {
    console.log('-->> text');
    console.log(message);
    var text = rreply.text(message.ToUserName, message.FromUserName, 'http://nasawz.com');
    return reply(text)
})

module.exports.msg = {
    handler: function (request, reply) {
        let client = request.params.client
        getApi(client, (err, api) => {
            messages.onXML(request.payload, reply, function callback() {
            }, { client, api })
        })
    }
}

module.exports.sendtemplate = {
    handler: function (request, reply) {
        let client = request.params.client
        let { openid, templateId, url, data } = request.payload
        getApi(client, (err, api) => {
            api.sendTemplate(openid, templateId, url, JSON.parse(data), (err, result) => {
                if (err) {
                    return reply(Boom.badRequest(err))
                }
                return reply(result)
            });
        })
    }
}
