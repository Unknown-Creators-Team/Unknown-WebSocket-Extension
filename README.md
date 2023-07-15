# Unknown-WebSocket-Extension

## 機能一覧
> **Note**: この拡張機能は、[Unknown-WebSocket](https://github.com/Unknown-Creators-Team/Unknown-WebSocket)と連携して動作します。
- キルログの色を変更
- キルログをUWSに送信

## セットアップ
> **Note**: 初回起動で自動的にセットアップされます。
### 1. `uwse:send_dying_message` UWSにキルログを送信するかどうかを設定します。
キルログを送信するようにします。
```
/scriptevent uwse:send_dying_message true
```
キルログを送信いないようにします。
```
/scriptevent uwse:send_dying_message false
```
現在の設定を確認します。
```
/scriptevent uwse:send_dying_message
```


### 2. `uwse:dying_message_color` キルログの色を設定します。
\<color> の部分を`§`のあとの装飾文字にすることで色を変更できます。
```
/scriptevent uwse:dying_message_color <color>
```
色を赤色にします。
```
/scriptevent uwse:dying_message_color c
```
色を白色にします。
```
/scriptevent uwse:dying_message_color f
```
現在の設定を確認します。
```
/scriptevent uwse:dying_message_color
```