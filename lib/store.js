const AWS = require('aws-sdk');

const store = new AWS.DynamoDB.DocumentClient({ region: 'ap-northeast-1' });
const DB_TABLE_NAME = 'TrainDelayStatus';

/**
 * 運行情報を全て取得
 * @returns {Promise}
 */
module.exports.getAll = async () => {
    const params = {
        TableName: DB_TABLE_NAME,
    };
    const data = await store.scan(params).promise();
    return data.Items.map(item => ({
        routeName: item.RouteName,
        description: item.Description,
        status: item.Status,
        url: item.Url,
        icon: item.Icon,
    }));
};

/**
 * 指定した路線名の運行情報を更新
 * @param {String} routeName 路線名
 * @param {String} status 運行状況
 * @param {String} description 説明
 * @returns {Promise}
 */
module.exports.update = (routeName, status, description) => {
    const now = new Date();
    const params = {
        TableName: DB_TABLE_NAME,

        // 更新するレコードのキー
        Key: {
            RouteName: routeName,
        },

        // 更新内容の定義
        UpdateExpression: 'set #Status = :s, Description = :d, LastUpdate = :l',

        // 予約語の置き換え
        ExpressionAttributeNames: {
            '#Status': 'Status',
        },

        // 更新する値のセット
        ExpressionAttributeValues: {
            ':s': status,
            ':d': description,
            ':l': now.toString(),
        },
    };

    return store.update(params).promise();
};
