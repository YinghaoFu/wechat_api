import * as Boom from 'boom'
import * as async from 'async'
import * as superagent from 'superagent'
import config from '../../../config/config'
const clients = config.clients
declare var models: any;

module.exports.auth = {
    handler: function (request, reply) {
        let callback = request.query.callback
        let rp = request.query.rp
        if (!callback && !rp) {
            return reply(Boom.badRequest('invalid query'))
        }
        request.session.callback = decodeURIComponent(callback)
        var url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${clients['demo'].appid}&redirect_uri=${encodeURIComponent(rp)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
        reply.redirect(url)
    }
}

module.exports.oauthResponse = {
    handler: function (request, reply) {
        let callback = request.session.callback
        let code = request.query.code

        let getAccessTokenByCode = ((cb) => {
            if (!code) {
                return cb('get access_token fail , no code parameter', null)
            }
            let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${clients['demo'].appid}&secret=${clients['demo'].secret}&code=${code}&grant_type=authorization_code`
            let req = superagent.get(url)
            req.timeout(10000)
            req.end((err, res) => {
                if (err) {
                    cb('get access_token fail', null)
                } else if (JSON.parse(res.text).errcode) {
                    cb(JSON.parse(res.text).errmsg, null)
                } else {
                    let access_token = JSON.parse(res.text).access_token
                    let expires_in = JSON.parse(res.text).expires_in
                    let openid = JSON.parse(res.text).openid
                    cb(null, { access_token: access_token, openid: openid })
                }
            })
        })

        let getUserFromWX = ((obj, cb) => {
            if (!obj.access_token || !obj.openid) {
                return cb('get userinfo fail from wx , parameter error', null)
            }
            let url = `https://api.weixin.qq.com/sns/userinfo?access_token=${obj.access_token}&openid=${obj.openid}&lang=zh_CN `
            let req = superagent.get(url)
            req.timeout(3000)
            req.end(async (err, res) => {
                if (err) {
                    cb('get userinfo fail', null)
                } else if (JSON.parse(res.text).errcode) {
                    cb(JSON.parse(res.text).errmsg, null)
                } else {
                    let client = 'demo'
                    if (!client) {
                        return cb('get userinfo fail,parameter error')
                    }
                    let userinfo = JSON.parse(res.text)
                    let data = {
                        ...userinfo,
                        client: client,
                    }
                    
                    let openid = userinfo.openid
                    let name = userinfo.nickname
                    let userid = openid
                    let user = await models.user.findById(userid);
                    if (!user) {
                        await models.user.create({
                            userid: openid,
                            name: name,
                            credits: '100'
                        });
                    } else {
                        await  models.user.upsert({
                            userid: openid,
                            name: name
                        });
                    }

                    data.access_token = obj.access_token
                    cb(null, data)
                }
            })

        })


        let fixcallback = (data, callbackstr) => {
            let gourl_arr = callbackstr.split('#')
            let gourl = callbackstr
            if (gourl_arr.length == 2) {
                if (gourl.indexOf('?') > 0) {
                    gourl = `${gourl_arr[0]}&openid=${data.openid}&access_token=${data.access_token}&nickname=${data.nickname}&headimgurl=${data.headimgurl}#${gourl_arr[1]}`
                } else {
                    gourl = `${gourl_arr[0]}?openid=${data.openid}&access_token=${data.access_token}&nickname=${data.nickname}&headimgurl=${data.headimgurl}#${gourl_arr[1]}`
                }
            } else {
                if (gourl.indexOf('?') > 0) {
                    gourl = `${gourl}&openid=${data.openid}&access_token=${data.access_token}&nickname=${data.nickname}&headimgurl=${data.headimgurl}`
                } else {
                    gourl = `${gourl}?openid=${data.openid}&access_token=${data.access_token}&nickname=${data.nickname}&headimgurl=${data.headimgurl}`
                }
            }
            return gourl
        }
        async.waterfall([getAccessTokenByCode, getUserFromWX], function (err, result) {
            if (err) {
                return reply(Boom.badRequest(err))
            }
            let parms = {
                openid: result.openid,
                nickname: new Buffer(result.nickname).toString('base64'),
                headimgurl: encodeURIComponent(result.headimgurl),
                access_token: result.access_token,
            }
            request.session.user = result
            let url = fixcallback(parms, request.session.callback)
            reply.redirect(url)
        })
    }
}
module.exports.touch = {
    handler: function (request, reply) {
        let user = request.session.user
        if (!user) {
            return reply(Boom.badRequest('not login'))
        }

        return reply(user)
    }
}
