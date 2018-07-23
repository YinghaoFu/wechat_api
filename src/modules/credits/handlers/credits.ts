import * as Boom from 'boom'
declare var models: any;

let getShoppingInfo = (userid, request) => {
    return request.getDb().sequelize.query(
        `select g.name,s.count from t_goods g,t_shopping s where s.userid=:userid and g.goodsid=s.goodsid order by g.goodsid`,
        {
            replacements: { userid }, type: request.getDb().sequelize.QueryTypes.SELECT
        }
    );

}

module.exports.minus = {
    handler: async function (request, reply) {
        try {
            let { openid } = request.session.user
            if (!openid) return reply(Boom.badRequest('未认证'))
            let userid = openid;
            let { goodsid } = request.payload;
            let { credits } = await models.user.findById(userid, { attributes: ['credits'] });
            let { credits_price, name } = await models.goods.findById(goodsid, { attributes: ['credits_price', 'name'] });
            if (parseInt(credits) < parseInt(credits_price)) {

                return reply(Boom.badRequest('积分不足,兑换商品失败！'))
            } else {
                let shopping = await models.shopping.findOne({ where: { userid, goodsid } }, {
                    attributes: ['count']
                })
                let result;
                if (shopping) {
                    let { count } = shopping;
                    let newCount = parseInt(shopping.count) + 1
                    result = await request.getDb().sequelize.transaction(async t => {
                        shopping = await models.shopping.update({ count: newCount },
                            {
                                where: {
                                    userid: userid,
                                    goodsid: goodsid,
                                },
                                transation: t
                            });
                        let user = await models.user.update({ credits: parseInt(credits) - parseInt(credits_price) }, {
                            where: {
                                userid: userid
                            },
                            transation: t
                        })
                        let result = {
                            'credits': parseInt(credits) - parseInt(credits_price),
                            'count': newCount,
                            'name': name
                        }
                        return result;
                    })

                } else {
                    let newCount = 1
                    result = await request.getDb().sequelize.transaction(async t => {
                        shopping = await models.shopping.create(
                            {
                                userid: userid,
                                goodsid: goodsid,
                                count: newCount
                            },
                            {
                                transation: t
                            });
                        let user = await models.user.update({ credits: parseInt(credits) - parseInt(credits_price) }, {
                            where: {
                                userid: userid
                            },
                            transation: t
                        })
                        let result = {
                            'credits': parseInt(credits) - parseInt(credits_price),
                            'count': newCount,
                            'name': name
                        }
                        return result;
                    })
                }
                return reply(result)
            }
        }
        catch (err) {
            return reply(Boom.badRequest(err + '兑换商品失败！'))
        }
    }
}

module.exports.getUserInfo = {
    handler: async function (request, reply) {
        try {
            let { openid } = request.session.user
            if (!openid) return reply(Boom.badRequest('未认证'))
            let userid = openid
            let { credits, name } = await models.user.findById(userid, { attributes: ['credits', 'name'] });
            let shoppingInfo = await getShoppingInfo(userid, request);
            let result = {
                shoppingInfo: shoppingInfo,
                credits: credits,
                name: name
            }
            return reply(result);

        } catch (err) {
            return reply(Boom.badRequest('获取用户信息失败！'));
        }
    }
}