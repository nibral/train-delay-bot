"use strict";

const DB_TABLE_NAME = "TrainDelayStatus";

const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "ap-northeast-1"});

module.exports.scan = async () => {
    // テーブル読み込み
    const params = {
        TableName: DB_TABLE_NAME
    };
    const data = await dynamodb.scan(params).promise();

    // データ型の階層を捨てて返却
    return data.Items.map(item => {
        return {
            routeName: item.RouteName.S,
            description: item.Description.S,
            status: item.Status.S,
            url: item.Url.S,
            icon: item.Icon.S
        };
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
