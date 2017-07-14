// エントリーポイント
function main() {
  // 休日は起動させない
  if (isHoliday()) {
    return;
  }

  var postUrl = "https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XxXxXxXxXxXxXxXx12345678"; // 環境により要設定
  var link = getPinnedItemsLink(); // pinしたリンクを持ってくる
  var jsonData = {
    "channel" : "#bot", // 環境により要設定
    "username" : "Goro",
    "unfurl_links" : true,
    "text" : "<!channel>\r\nお話中すまない。今日昼飯、俺と行く奴いるのか？:goro:\r\nところで今日、こことかはどうだ？ \r\n <" + link + ">"
  };

  var payload = JSON.stringify(jsonData);

  // メッセージを投げる
  postMessage(postUrl, payload);
}

// 今日が休日（土日祝祭日）かどうかを判定
function isHoliday() {
  var todaySt = new Date();
  todaySt.setHours(0, 0, 0, 0);
  if (todaySt.getDay() == 0 || todaySt.getDay() == 6) {
    return 1;
  } else {
    var todayEd = new Date();
    todayEd.setHours(23, 59, 59, 999);
    var cal = CalendarApp.getCalendarById("ja.japanese#holiday@group.v.calendar.google.com");
    var holidays =  cal.getEvents(todaySt, todayEd);
    if (holidays.length != 0) {
      return 1;
    }
  }

  return 0;
}

// Slackにメッセージを投げる
function postMessage(postUrl, payload) {
  var payload_json = JSON.stringify(payload);
  var options = {
    "method" : "post",
    "contentType" : "appliation/json",
    "payload" : payload_json
  };

  UrlFetchApp.fetch(postUrl, options);
}

// pinしたアイテムを取得し、リンクを抜き出す
function getPinnedItemsLink(channelId) {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
  var apiUrl = "https://slack.com/api/pins.list";
  var payload = {
    "token" : token,
    "channel" : channelId
  };

  var options = {
    "method" : "post",
    "payload" : payload
  };

  var response = UrlFetchApp.fetch(apiUrl, options);
  var content = response.getContentText("UTF-8");
  var res = JSON.parse(content);
  var pinnedItems = res["items"];  
  var rand = getRand(pinnedItems.length);
  var message = pinnedItems[rand].message;
  var link = '';

  while (link == null || link == '') {
    rand = getRand(pinnedItems.length);
    message = pinnedItems[rand].message;
    if (message && message.text) {
      // リンク部分だけ抜き出す
      link = message.text.match(/https?:\/\/[a-zA-Z0-9\-_\.:@!~*'\(¥);\/?&=\+$,%#]+/m, "");
    }
    if (link) {
      break;
    }
  }

  return link;
}

// 乱数取得（前回とかぶらない処理も実装）
function getRand(length) {
  var previous_val = PropertiesService.getScriptProperties().getProperty('PREVIOUS_INDEX');
  var rand = Math.floor(Math.random() * length);
  if (previous_val) {
    while (previous_val == rand) {
      rand = Math.floor(Math.random() * length);
      if (previous_val != rand) {
        break;
      }
    }
  }

  PropertiesService.getScriptProperties().setProperty('PREVIOUS_INDEX', rand);
  return rand;
}
