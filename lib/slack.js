"use strict";

const https = require("https");
const url = require("url");

module.exports.post = (webHookUrl, messages) => {
    return new Promise((resolve, reject) => {
        const slackReqOptions = url.parse(webHookUrl);
        slackReqOptions.method = "POST";
        slackReqOptions.headers = {
            "Content-Type": "application/json"
        };

        // リクエスト生成
        const request = https.request(slackReqOptions, (res) => {
            if (res.statusCode === 200) {
                resolve(res.statusCode);
            } else {
                reject(res.statusCode);
            }
        });
        request.on("error", (error) => {
            reject(error);
        });

        // 送信
        request.write(JSON.stringify({
            text: "",
            attachments: messages
        }));
        request.end();
    });
};
