
var ak = 'd4485b51b51b4598b61abb764c2e32ad';
var sk = '36004cf529fd4d29b8ef9196751089d0';
var expirationPeriodInSeconds = 1800;

var sha256hex = $.sha256hmachex;

function authStringPrefix() {
    return [
        'bce-auth-v1', ak, new Date().toISOString().replace(/\.\d+/, ''), 
        expirationPeriodInSeconds
    ].join('/');
}

function signingKey() {
    return sha256hex(sk, authStringPrefix());
}

function signature(canonicalRequestStr) {
    return sha256hex(signingKey(), canonicalRequestStr);
}

function authorization(opt) {
    ak = opt.ak || ak;
    sk = opt.sk || sk;

    var canonicalRequestData = canonicalRequest(opt);
    return [
        authStringPrefix(),
        canonicalRequestData.signedHeaders,
        signature(canonicalRequestData.canonicalRequestStr)
    ].join('/');
}

/**
 * {
 *      url: '',
 *      type: '',
 *      data: {
 *
 *      },
 *      headers: {
 *
 *      }
 * }
 */
function canonicalRequest(opt) {
    var canonicalHeadersData = canonicalHeaders(opt.headers);
    return {
        canonicalRequestStr: [
            (opt.type || 'GET').toUpperCase(),
            encodeURIComponent(opt.url.replace(/^http:\/\/[^\/]*\/?/, '/'))
                .replace(/%2F/g, '/'),
            canonicalQueryString(opt.data),
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

function canonicalHeaders(data) {
    data = data || {};
    var value = [],
        signedHeaders = [];
    Object.keys(data).forEach(function(k) {
        var v = data[k].toString().trim();
        k = k.toString().trim().toLowerCase();
        if (k !== 'date') {
            signedHeaders.push(k);
            value.push(
                encodeURIComponent(k) + ':' + encodeURIComponent(v)
            );
        }
    });
    return {
         canonicalHeadersStr: value.sort().join('\n'),
         //signedHeaders: ''
         signedHeaders: signedHeaders.sort().join(';')
    }
}

exports.authorization = authorization;

window.authorization = authorization;

