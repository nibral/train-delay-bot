"use strict";

const cheerio = require("cheerio-httpcli");

// Yahoo!運行情報 HTMLパーサー
module.exports.fetchAndParseTrainInfo = (routeName, url) => {
    return new Promise((resolve, reject) => {
        cheerio.fetch(url).then(
            result => {
                resolve({
                    routeName: routeName,
                    status: result.$("#mdServiceStatus dt").text().replace(/\[.]/, "").trim(),
                    description: result.$("#mdServiceStatus dd").text().trim()
                });
            },
            error => {
                reject(error);
            });
    });
};

// Yahoo!運行情報 通知色
module.exports.getColorOfStatus = (status) => {
    let color = "good";
    if (status.match(/運転再開|列車遅延|運転状況|交通障害情報|その他/)) {
        color = "warning";
    }
    if (status.match(/運転見合わせ/)) {
        color = "danger";
    }
    if (status.match(/解析失敗/)) {
        color = "danger";
    }
    return color;
};