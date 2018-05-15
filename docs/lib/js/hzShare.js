 // 微信分享 && 华住app分享
 window.hzShare =  function share(options) {
    try {
        weixinShare(options,function () {})
    } catch (e) {
        alert('WeiXin Share Error :' + e)
    }

    try {
        huazhuAppShare(options,function () {})
    } catch (e) {
        alert('HuaZhu App Share Error :' + e)
    }
}

// 微信分享
function weixinShare(options,shareSuccess) {
    var shareInfo = {}
    if(typeof wx === 'undefined'){
        return
    }
    ajax({
        url: "https://loginactivity.huazhu.com/AuthService/GetShareInfo",
        jsonp: 'callback',
        data: {
            url: location.href
        },
        async: false,
        success: function(data) {
            if (data.success) {
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: data.data.appId, // 必填，公众号的唯一标识
                    timestamp: data.data.timestamp, // 必填，生成签名的时间戳
                    nonceStr: data.data.noncestr, // 必填，生成签名的随机串
                    signature: data.data.signature, // 必填，签名，见附录1
                    jsApiList: ["onMenuShareAppMessage", "onMenuShareTimeline"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
            }
        }
    })

    wx.ready(()=>{
        // alert(JSON.stringify(shareInfo))
        // console.log('ready');
            // console.log(shareInfo);
        // 分享好友
        wx.onMenuShareAppMessage({
            title: options.title, // 分享标题
            desc: options.desc, // 分享描述
            link: options.link, // 分享链接
            imgUrl: options.imgUrl, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success() {
                shareSuccess();
                // 用户分享成功后执行的回调函数
            },
            cancel() {
                // 用户取消分享后执行的回调函数
            }
        });

        // 分享朋友圈
        wx.onMenuShareTimeline({
            title: shareInfo.desc, // 分享标题
            link: shareInfo.link, // 分享链接
            imgUrl: shareInfo.imgUrl, // 分享图标
            success() {
                shareSuccess();
                // 用户分享成功后执行的回调函数
            },
            cancel() {
                // 用户取消分享后执行的回调函数
            }
        });
    })
}

// 华住app分享
function huazhuAppShare(options,shareSuccess) {
    if (navigator.userAgent.toLowerCase().indexOf("huazhu") > -1) {
        if (navigator.userAgent.toLowerCase().indexOf("ios") > -1) {
            if( window.bridge ){
                window.bridge.send({
                    "title": "分享",
                    "callback": "share",
                    "shareUrl": options.link,
                    "shareTitle": options.title,
                    "shareImageUrl": options.imgUrl,
                    "shareDescription": options.desc
                }, false);
            }
            else{
                document.addEventListener('WebViewJavascriptBridgeReady', function(event) {
                    var bridge = event.bridge;
                    bridge.send({
                        "title": "分享",
                        "callback": "share",
                        "shareUrl": options.link,
                        "shareTitle": options.title,
                        "shareImageUrl": options.imgUrl,
                        "shareDescription": options.desc
                    });
                });
            }
        }
        if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
            window.handler.show(options.title, options.imgUrl, options.desc, options.link,"shareAndroid");
        }
    };
}

// 简单ajax jsonp实现 去除jquery依赖

function ajax(params) {
    params = params || {};
    params.data = params.data || {};
    var json = jsonp(params)
    // jsonp请求
    function jsonp(params) {

        //创建script标签并加入到页面中
        var callbackName = params.jsonp;
        var head = document.getElementsByTagName('head')[0];
        // 设置传递给后台的回调参数名
        params.data['callback'] = callbackName;
        var data = formatParams(params.data);
        var script = document.createElement('script');
        head.appendChild(script);

        //创建jsonp回调函数
        window[callbackName] = function(json) {
            head.removeChild(script);
            clearTimeout(script.timer);
            window[callbackName] = null;
            params.success && params.success(json);
        };

        //发送请求
        script.src = params.url + '?' + data;

        //为了得知此次请求是否成功，设置超时处理
        if(params.time) {
            script.timer = setTimeout(function() {
                window[callbackName] = null;
                head.removeChild(script);
                params.error && params.error({
                    message: '超时'
                });
            }, time);
        }
    };

    //格式化参数
    function formatParams(data) {
        var arr = [];
        for(var name in data) {
            arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        };

        // 添加一个随机数，防止缓存
        arr.push('v=' + random());
        return arr.join('&');
    }

    // 获取随机数
    function random() {
        return Math.floor(Math.random() * 10000 + 500);
    }
}