const axios = require('axios');

/**
 *
 * @param {String} webHookUrl Slack WebhookのURL
 * @param {array} messages 投稿するメッセージ
 * @returns {Promise}
 */
module.exports.post = (webHookUrl, messages) =>
    axios.post(webHookUrl, {
        text: '',
        attachments: messages,
    });
