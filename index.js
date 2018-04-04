"use strict";

const dynamodb = require("./lib/dynamodb");
const yahooTrain = require("./lib/yahoo_train");
const slack = require("./lib/slack");
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// entry point
exports.handler = async (event, context, callback) => {
    try {
        const now = new Date();
        console.log(`INFO: operation started at ${now.toString()}`);

        // 路線ごとに運行情報の取得処理を生成し全て完了するまで待ち合わせ
        const oldStatusList = await dynamodb.scan();
        const newStatusList = await Promise.all(oldStatusList.map(status => {
            return yahooTrain.fetchAndParseTrainInfo(status.routeName, status.url);
        }));

        // 運行情報の比較
        let updates = [];
        oldStatusList.forEach(oldStatus => {
            const routeName = oldStatus.routeName;
            const newStatus = newStatusList.find(status => status.routeName === routeName);

            console.log(`INFO: routeName: ${routeName}`);
            console.log(`INFO: oldStatus: ${JSON.stringify(oldStatus)}`);
            console.log(`INFO: newStatus: ${JSON.stringify(newStatus)}`);

            // 正しく情報が取得できなかった時は専用メッセージをセット
            if (newStatus.status === '' || newStatus.description === '') {
                console.log('WARN: status or description is empty.');
                newStatus.status = "解析失敗";
                newStatus.description = "運行情報の解析に失敗しました。";
            }

            // DB更新
            dynamodb.update(routeName, newStatus.status, newStatus.description);

            // 運行情報が変化したらメッセージに追加
            if (newStatus.description !== oldStatus.description) {
                updates.push({
                    title: `${oldStatus.icon} ${routeName} ${newStatus.status}`,
                    text: `${routeName}は、${newStatus.description}`,
                    color: yahooTrain.getColorOfStatus(newStatus.status)
                });
                console.log(`INFO: description changed: ${routeName} ${oldStatus.description} to ${newStatus.description}`);
            }
        });

        // メッセージがなければ終了
        if (updates.length === 0) {
            console.log("INFO: nothing to change");
            callback(null, "INFO: nothing to change");
            return;
        }

        // メッセージをSlackに送信
        const result = await slack.post(SLACK_WEBHOOK_URL, updates);
        console.log(`INFO: post success: ${result}`);
        callback(null, `INFO: post success: ${result}`);
    } catch (error) {
        console.error(error);
        callback(error);
    }
};
