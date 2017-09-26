"use strict";

const DB_TABLE_NAME = "TrainDelayStatus";

const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "ap-northeast-1"});

module.exports.scan = () => {
    const params = {
        TableName: DB_TABLE_NAME
    };

    return new Promise((resolve, reject) => {
        dynamodb.scan(params).promise().then(data => {
            // データ型の階層を捨てる
            let statuses = [];
            data.Items.forEach(item => {
                statuses.push({
                    routeName: item.RouteName.S,
                    description: item.Description.S,
                    status: item.Status.S,
                    url: item.Url.S,
                    icon: item.Icon.S
                });
            });

            resolve(statuses);
        }).catch(error => {
            reject(error);
        });
    });
};

module.exports.update = (routeName, status, description) => {
    const now = new Date();
    const params = {
        TableName: DB_TABLE_NAME,

        // 更新するレコードのキー
        Key: {
            RouteName: {
                S: routeName
            }
        },

        // 更新内容の定義
        UpdateExpression: "set #Status = :s, Description = :d, LastUpdate = :l",

        // 予約語の置き換え
        ExpressionAttributeNames: {
            "#Status": "Status"
        },

        // 更新する値のセット
        ExpressionAttributeValues: {
            ":s": {
                S: status
            },
            ":d": {
                S: description
            },
            ":l": {
                S: now.toString()
            }
        },

        ReturnValues: "UPDATED_NEW"
    };

    return dynamodb.updateItem(params).promise();
};
