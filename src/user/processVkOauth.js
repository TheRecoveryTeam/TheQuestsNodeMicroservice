const statusCodes = require('http-status-codes');
const requester = require('request-promise');
const vkConfig = require('./config/vkConfig');
const backUrls = require('../config/backUrls');

const proxyUserData = async ({ access_token, user_id, nickname, avatarPath }) => {
    try {
        const resp = await requester
            .post({
                uri: `${backUrls.base}${backUrls.proxyUls.userVkOauth2}`,
                method: 'POST',
                json: true,
                body: {
                    oauthToken: access_token,
                    oauthId: user_id,
                    oauthService: 'vk',
                    nickname,
                    avatarPath,
                },
                headers: {
                    'content-type': 'application/json',
                },
            });

        return {
            ...resp,
            nickname,
            avatarPath,
            email: `${user_id}`,
        };
    }
    catch (e) {
        return null;
    }
};

const getUserData = async ({ user_id, access_token }) => {
    const PHOTO_FIELD_NAME = "photo_50";

    try {
        const resp = await requester({
            url: vkConfig.urls.USERS_GET,
            qs: {
                user_ids: user_id,
                v: vkConfig.v,
                access_token,
                fields: PHOTO_FIELD_NAME,
            },
        });

        const {
            first_name,
            last_name,
            photo_50,
        } = JSON.parse(resp).response[0];

        return {
            nickname: `${first_name} ${last_name}`,
            avatarPath: photo_50,
        };
    }
    catch (e) {
        return null;
    }
};

const getToken = async (code, redirect_uri) => {
    const { CLIENT_ID, SECRET } = process.env;

    try {
        const resp = await requester({
            url: vkConfig.urls.GET_TOKEN,
            qs: {
                client_id: CLIENT_ID,
                client_secret: SECRET,
                redirect_uri,
                code,
            },
        });

        return JSON.parse(resp);
    }

    catch (e) {
        return null;
    }
};

module.exports = async (ctx, next) => {
    const { code } = ctx.query;

    if (!code) {
        ctx.status = statusCodes.BAD_REQUEST;
        return await next();
    }

    const { request: { origin }, _matchedRoute: matchedRoute } = ctx;
    const redirectUri = `${origin}${matchedRoute}`;
    const tokenData = await getToken(code, redirectUri);

    if (!tokenData) {
        ctx.status = statusCodes.NOT_FOUND;
        return await next();
    }

    const userData = await getUserData(tokenData);
    if (!userData) {
        ctx.status = statusCodes.NOT_FOUND;
        return await next();
    }

    const userFinalData = await proxyUserData({ ...userData, ...tokenData });
    if (!userFinalData) {
        ctx.status = statusCodes.UNAUTHORIZED;
        return await next();
    }

    ctx.status = statusCodes.OK;
    ctx.body = userFinalData;
};
