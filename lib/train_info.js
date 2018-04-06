const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 運行状況の文字列から通知色を取得
 * @param status
 * @returns {string}
 */
function getColorOfStatus(status) {
    if (status.match(/運転見合わせ|解析失敗/)) {
        return 'danger';
    } else if (status.match(/運転再開|列車遅延|運転状況|交通障害情報|その他/)) {
        return 'warning';
    }
    return 'good';
}

/**
 * 指定した路線の運行情報を取得
 * @param {String} routeName 路線名
 * @param {String} url Yahoo!運行情報のURL
 * @returns {Promise}
 */
module.exports.fetch = async (routeName, url) => {
    // HTMLを解析
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    let status = $('#mdServiceStatus dt').text().replace(/\[.]/, '').trim();
    let description = $('#mdServiceStatus dd').text().trim();

    // 運行状況または説明文が空の場合は解析失敗
    if (status === '' || description === '') {
        status = '解析失敗';
        description = '運行情報の解析に失敗しました。';
    }

    return {
        routeName,
        status,
        description,
        color: getColorOfStatus(status),
    };
};
