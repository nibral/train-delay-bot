## train delay bot
[Yahoo!運行情報](https://transit.yahoo.co.jp/)をスクレイピングしてSlackに投げるスクリプト。Lambda + DynamoDBで動く。

### DynamoDB scheme
* Description: 運行情報説明文(String)
* Icon: Slackに通知するときのemoji(String, 例えば :railway_car: )
* LastUpdate: 最後にスクレイピングした時間(String)
* RouteName: 路線名(String)
* Status: 運行状態(String)
* Url: 路線情報のURL(String, 山手線なら https://transit.yahoo.co.jp/traininfo/detail/21/0/ )

動かす時はIcon, RouteName, Urlを設定する

### Lambda
* `npm run make` でzipが生成されるのでコンソールからアップロード
* 環境変数 `SLACK_WEBHOOK_URL` にIncoming WebhookのURLを設定

## License
(c) 2017 nibral

Released under MIT License.

http://opensource.org/licenses/mit-license.php
