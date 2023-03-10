let logintime;
let emotion;
let worknotice;
let Interval;
let openSign = false;

let type = [
    { href: "baidu", type: "work" },
    { href: "juejin", type: "work" },
    { href: "cloud.tencent", type: "work" },
    { href: "192.168", type: "work" },
    { href: "localhost", type: "work" },
    { href: "csdn", type: "work" },
    { href: "bilibili", type: "fun" },
]

chrome.runtime.onInstalled.addListener(() => {
    start();
    monitor();
});

chrome.runtime.onStartup.addListener(() => {
    start();
    monitor();
});

chrome.action.onClicked.addListener(() => {
    start();
    //     chrome.tabs.executeScript({
    //         file: 'content-script.js',
    //     });
    //     chrome.tabs.executeScript({
    //         file: 'echarts/4.3.0/echarts.min.js',
    //     });
});

function checkWindow() {
    chrome.windows.getAll({}, function(windows) {
        let windowCount = windows.length;
        if (windowCount == 0) {
            close();
        }
    });
}

function monitor() {
    if (!Interval) {
        Interval = setInterval(async() => {
            let tab = await getActiveTab();
            if (tab != null) {
                chrome.tabs.sendMessage(
                    tab.id, { type: "gethref" },
                    (response) => {
                        if (!response) return;
                        let href = response.href;
                        type.forEach(o => {
                            if (href.indexOf(o.href) >= 0) {
                                if (o.type == "work") {
                                    emotion = emotion + 1;
                                }
                                if (o.type == "fun") {
                                    emotion = emotion - 1;
                                }
                                if (emotion > 100) emotion = 100;
                                if (emotion < 0) emotion = 0;
                                if (emotion >= 80) {
                                    chrome.tabs.sendMessage(tab.id, { type: "setAngry" }, () => {});
                                    if (!worknotice) {
                                        let week = logintime.getDay();
                                        if (week == "0" || week == "6") {
                                            chrome.notifications.create(null, {
                                                type: 'basic',
                                                iconUrl: 'icon.png',
                                                title: "????????????",
                                                message: "??????????????????????????????????????????",
                                            });
                                        } else {
                                            chrome.notifications.create(null, {
                                                type: 'basic',
                                                iconUrl: 'icon.png',
                                                title: "????????????",
                                                message: "????????????????????????????????????",
                                            });
                                        }
                                        worknotice = true;
                                    }
                                }
                                if (emotion < 60) {
                                    chrome.tabs.sendMessage(tab.id, { type: "setNormal" }, () => {});
                                }
                            }
                        });
                    });
            } else {
                checkWindow();
            }
        }, 60000)
    }
}

function start() {
    logintime = new Date();
    emotion = 50;
    worknotice = false;
    openSign = true;
    chrome.notifications.create(null, {
        type: 'basic',
        iconUrl: 'icon.png',
        title: gettitle(logintime),
        message: getmessage(logintime),
    });
}

function close() {
    if (openSign) {
        if (emotion < 20) {
            chrome.notifications.create(null, {
                type: 'basic',
                iconUrl: 'icon.png',
                title: "????????????",
                message: "??????????????????????????????????????????",
            });
        }
        if (emotion > 80) {
            chrome.notifications.create(null, {
                type: 'basic',
                iconUrl: 'icon.png',
                title: "????????????",
                message: "???????????????????????????????????????",
            });
        }
    }
    openSign = false;
}

function gettitle(date) {
    let hour = date.getHours();
    if (hour < 12 && hour > 5) {
        return "????????????";
    } else if (hour >= 12 && hour < 14) {
        return "????????????";
    } else if (hour >= 14 && hour < 18) {
        return "?????????";
    } else if (hour >= 18 && hour < 24) {
        return "?????????";
    } else {
        return "???????????????";
    }
}

function getmessage(date) {
    let fmtlogintime = dateFormat(date, 'yyyy-MM-dd hh:mm:ss');
    //let week = data.getDay();
    let message = `????????????:${fmtlogintime}`;
    return message;
}

function dateFormat(date, fmt) { // author: meizz
    const o = {
        'M+': date.getMonth() + 1, // ??????
        'd+': date.getDate(), // ???
        'h+': date.getHours(), // ??????
        'm+': date.getMinutes(), // ???
        's+': date.getSeconds(), // ???
        'q+': Math.floor((date.getMonth() + 3) / 3), // ??????
        'S': date.getMilliseconds() // ??????
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
}


// ??????????????? tab???????????????????????????????????????
async function getActiveTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({
                active: true,
                currentWindow: true,
            },
            (tabs) => {
                if (tabs.length > 0) {
                    resolve(tabs[0]);
                } else {
                    resolve(null);
                }
            }
        );
    });
}