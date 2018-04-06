const slack = require('./lib/slack');
const store = require('./lib/store');
const yahooTrain = require('./lib/train_info');

const { SLACK_WEBHOOK_URL } = process.env;

// entry point
exports.handler = async (event, context, callback) => {
    try {
        const now = new Date();
        console.log(`INFO: operation started at ${now.toString()}`);

        // 路線ごとに運行情報の取得処理を生成し、全て完了するまで待ち合わせ
        const oldStatusList = await store.getAll();
        const newStatusList = await Promise.all(oldStatusList.map(status =>
            yahooTrain.fetch(status.routeName, status.url)));

        // 運行情報の比較
        const updates = [];
        await Promise.all(oldStatusList.map(async (oldStatus) => {
            const { routeName } = oldStatus;
            const newStatus = newStatusList.find(status => status.routeName === routeName);

            console.log(`INFO: routeName: ${routeName}`);
            console.log(`INFO: oldStatus: ${JSON.stringify(oldStatus)}`);
            console.log(`INFO: newStatus: ${JSON.stringify(newStatus)}`);

            // DB更新
            await store.update(routeName, newStatus.status, newStatus.description);

            // 運行情報が変化したらメッセージに追加
            if (newStatus.description !== oldStatus.description) {
                updates.push({
                    title: `${oldStatus.icon} ${routeName} ${newStatus.status}`,
                    text: `${routeName}は、${newStatus.description}`,
                    color: newStatus.color,
                });
                console.log(`INFO: description changed: ${routeName}, ${oldStatus.description} to ${newStatus.description}`);
            }
        }));

        // メッセージがなければ終了
        if (updates.length === 0) {
            console.log('INFO: nothing to change');
            callback(null, 'INFO: nothing to change');
            return;
        }

        // メッセージをSlackに送信
        const result = await slack.post(SLACK_WEBHOOK_URL, updates);
        console.log(`INFO: post success: ${result.status} ${result.statusText}`);
        callback(null, `INFO: post success: ${result.status} ${result.statusText}`);
    } catch (error) {
        console.error(error);
        callback(error);
    }
};
