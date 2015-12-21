
var Canvas = require('canvas'),
    Image = Canvas.Image,
    fs = require('fs'),
    md5 = require('md5'),
    db = require('./db'),
    canvas = new Canvas(293, 190),
    ctx = canvas.getContext('2d');

var config = {
    url: 'https://kyfw.12306.cn/otn/passcodeNew/getPassCodeNew?module=login&rand=sjrand',
    size: 67
};

config.elements = function() {
    var list = [];
    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 4; j++) {
            list.push([5 + j * (config.size + 5), 40 + i * (config.size + 5)]);
        }
    }
    return list;
}();

function cut(img) {
    ctx.drawImage(img, 0, 0);
    return config.elements.map(function(item, i) {
        return ctx.getImageData(
            item[0], item[1], 
            config.size, 
            config.size 
        );
    });
}

function load(src) {
    var img = new Image();
    return new Promise(function(resolve, reject) {
        img.src = src;
        resolve(img);
    });
}

var cutOnce = function() {
    return db.getPassCodeNew()
        .then(function(data) {
            return load(data);
        })
        .then(function(img) {
            return cut(img);
        });
};

var imageData2Image = function(data) {
    var c = document.createElement('canvas');
    c.width = data.width;
    c.height = data.height;
    c.getContext('2d').putImageData(data, 0, 0);
    c.style.marginLeft = '5px';
    document.body.appendChild(c);
    return c;
}

var isSame = function(data1, data2) {
    var i, j, k, 
        diff, 
        totalCount = data1.width * data1.height,
        diffCount = 0,
        sameCount = 0,
        maxDiffCount =  totalCount * 0.3,
        maxSameCount = totalCount - maxDiffCount;

    for (i = 0; i < data1.height; i++) {
        for (j = 0; j < data1.width; j++) {
            k = (data1.width * i + j) * 3;
            diffNull = Math.abs(data1.data[k] - 255)
                +  Math.abs(data1.data[k + 1] - 255)
                +  Math.abs(data1.data[k + 2] - 255);
            if (diffNull < 20) {
                maxDiffCount--;
                maxSameCount--;
                continue;
            }
            diff = Math.abs(data1.data[k] - data2.data[k])
                +  Math.abs(data1.data[k + 1] - data2.data[k + 1])
                +  Math.abs(data1.data[k + 2] - data2.data[k + 2]);
            if (diff > 20) {
                diffCount++;
            } else {
                sameCount++;
            }
            if (diffCount > maxDiffCount) {
                return false;
            }
            if (sameCount > maxSameCount) {
                return true;
            }
        }
    }
    return true;
};

var imagePool = [];

function addToPool(data) {
    if (
        imagePool.every(function(item) {
            if (isSame(data, item)) {
                console.log([imagePool.length, data.i, item.i].join(' : '));
                return false;
            } else {
                return true;
            }
        })
    ) {
        pushToPool(data);
    }
}

function saveToFile(data) {
    var c = new Canvas(data.width, data.height);
    c.getContext('2d').putImageData(data, 0, 0);
    var buf = c.toBuffer();
    fs.writeFileSync(__dirname + '/img/' + md5(buf).slice(0, 8) + '.png', buf);
}

function pushToPool(data) {
    saveToFile(data);
    imagePool.push(data);
}

var taskCount = 0;
function task() {
    if (++taskCount > 1) {
        return;
    }
    cutOnce()
    .then(function(data) {
        data.forEach(function(item, i) {
            item.i = i;
            addToPool(item);
        });
        setTimeout(function() {
            task();
        }, 2000);
    })
    .catch(function(e) {
        console.log(e.stack);
        task();
    });
}

task();

