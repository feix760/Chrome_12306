/**
 * @file 百度云认证
 *  http://bce.baidu.com/doc/Reference/AuthenticationMechanism.html
 *  需要 access key & secret key
 * @date 2015-12-22
 */
var 
    url = require('url'),
    _ = require('lodash'),
    qs = require('qs'),
    Hashes = require('jshashes'),
    SHA256 = new Hashes.SHA256(),
    sha256hex = SHA256.hex_hmac,

    conf = {},
    expirationPeriodInSeconds = 1800;

/**
 * @param {Object} _conf
 * {
 *      ak: {String}, // access key
 *      sk: {String} // secret key
 * }
 */
exports.config = function(_conf) {
    conf = _.extend({}, _conf || {});
};

/**
 * @param {Object} opt
 * {
 *      ak: '',
 *      sk: '',
 *      url: {String}, // url
 *      method: {String}, // 请求类型 GET|POST|..
 *      qs: {Object}, // 查询参数
 *      headers: {Object} // 需要加密的head
 * }
 * @return {String} authorization header
 */
exports.authorization = function(opt) {
    var urlInfo = url.parse(opt.url);

    opt = _.extend({}, opt, {
        ak: opt.ak || conf.ak,
        sk: opt.sk || conf.sk,
        url: urlInfo.pathname,
        headers: _.extend({}, opt.headers || {}, {
            'x-bce-date': date(),
            host: urlInfo.hostname
        }),
        qs: _.extend(
            {}, opt.qs || {}, 
            qs.parse((urlInfo.search || '').replace(/^\?/, ''))
        )
    });

    if (!opt.ak || !opt.sk) {
        throw new Error('must set ak & sk');
    }

    var canonicalRequestData = canonicalRequest(opt);

    opt.headers.authorization = [
        authStringPrefix(opt),
        canonicalRequestData.signedHeaders,
        signature(opt, canonicalRequestData.canonicalRequestStr)
    ].join('/');

    delete opt.headers.host;
    return opt.headers;
};

/**
 * 返回云所用的iso时间
 * @return {String}
 */
var date = function() {
    return new Date().toISOString().replace(/\.\d+/, '');
};

function canonicalRequest(opt) {
    var canonicalHeadersData = canonicalHeaders(opt.headers);
    return {
        canonicalRequestStr: [
            opt.method.toUpperCase(),
            encodeURIComponent(opt.url).replace(/%2F/g, '/'),
            canonicalQueryString(opt.qs),
            canonicalHeadersData.canonicalHeadersStr
        ].join('\n'),
        signedHeaders: canonicalHeadersData.signedHeaders
    };
}

function canonicalQueryString(data) {
    data = data || {};
    var value = [];
    Object.keys(data).forEach(function(k) {
        value.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]));
    });
    return value.sort().join('&');
}

function canonicalHeaders(headers) {
    var strings = [],
        signedHeaders = [];
    Object.keys(headers).forEach(function(k) {
        var v = headers[k].toString().trim();
        k = k.toString().trim().toLowerCase();
        signedHeaders.push(k);
        strings.push(
            encodeURIComponent(k) + ':' + encodeURIComponent(v)
        );
    });
    return {
         canonicalHeadersStr: strings.sort().join('\n'),
         signedHeaders: signedHeaders.sort().join(';')
    }
}

function authStringPrefix(opt) {
    return [
        'bce-auth-v1', opt.ak, date(), expirationPeriodInSeconds
    ].join('/');
}

function signingKey(opt) {
    return sha256hex(opt.sk, authStringPrefix(opt));
}

function signature(opt, canonicalRequestStr) {
    return sha256hex(signingKey(opt), canonicalRequestStr);
}

