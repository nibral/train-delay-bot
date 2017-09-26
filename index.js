"use strict";

const cheerio = require("cheerio-httpcli");
const co = require("co");

const dynamodb = require("./lib/dynamodb");
const slack = require("./lib/slack");
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Yahoo!運行情報 HTMLパーサー
const fetchAndParseTrainInfo = url => {
    return new Promise((resolve, reject) => {
        cheerio.fetch(url).then(
            result => {
                resolve({
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
const getColorOfStatus = status => {
    let color = "good";
    if (status.match(/運転再開|列車遅延|運転状況|交通障害情報|その他/)) {
        color = "warning";
    }
    if (status.match(/運転見合わせ/)) {
        color = "danger";
    }
    return color;
};

// entry point
exports.handler = (event, context, callback) => {
    co(function *() {
        const now = new Date();
        console.log(`start:${now.toString()}`);

        // 新しい運行情報を取得する処理をworkerとして追加、全て完了するまで待ち合わせ
        const fetchWorkers = {};
        const oldStatusList = yield dynamodb.scan();
        oldStatusList.forEach(status => {
            fetchWorkers[status.routeName] = fetchAndParseTrainInfo(status.url);
        });
        const newStatusList = yield fetchWorkers;

        // 運行情報の比較
        let updates = [];
        oldStatusList.forEach(oldStatus => {
            const routeName = oldStatus.routeName;
            const newStatus = newStatusList[routeName];

            console.log(routeName);
            console.log(oldStatus);
            console.log(newStatus);

            // DB更新
            dynamodb.update(routeName, newStatus.status, newStatus.description);

            // 運行情報が変化したらメッセージに追加
            if (newStatus.description !== oldStatus.description) {
                updates.push({
                    title: `${oldStatus.icon} ${routeName} ${newStatus.status}`,
                    text: `${routeName}は、${newStatus.description}`,
                    color: getColorOfStatus(newStatus.status)
                });
                console.log(`description changed:${routeName},${oldStatus.description}->${newStatus.description}`);
            }
        });

        // メッセージがなければ終了
        if (updates.length === 0) {
            console.log("nothing to change:");
            callback(null, "nothing to change:");
            return;
        }

        // メッセージをSlackに送信
        const result = yield slack.post(SLACK_WEBHOOK_URL, updates);
        console.log(`post success:${result}`);
        callback(null, `post success:${result}`);
    }).catch(error => {
        console.error(error);
        callback(error);
    });
};
