## train delay bot
[Yahoo!運行情報](https://transit.yahoo.co.jp/)をスクレイピングしてSlackに投げるスクリプト。Lambda + DynamoDBで動く。

### DynamoDB
以下のカラムを含むテーブルを使用する。

* RouteName: 路線名(String)
* Url: 路線情報のURL(String, 山手線なら https://transit.yahoo.co.jp/traininfo/detail/21/0/ )
* Icon: Slackに通知するときのemoji(String, 例えば`:railway_car:`)
* Status: 運行状態(String)
* Description: 運行情報説明文(String)
* LastUpdate: 最後にスクレイピングした時間(String)

運行情報を通知する路線を追加する時は、テーブルにレコードを追加してRouteName,Url,Iconを設定する。

### Lambda
* `npm run make` でzipが生成されるのでコンソールからアップロード
* 環境変数 `SLACK_WEBHOOK_URL` にSlack Incoming WebhookのURLを設定

## License
(c) 2017 nibral

Released under MIT License.

http://opensource.org/licenses/mit-license.php
