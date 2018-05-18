;(function($){
    $.fn.scrollTo = function(options) {
        var defaults = {
            toT: 90, //滚动目标位置
            durTime: 500, //过渡动画时间
            delay: 30, //定时器时间
            callback: null //回调函数
        };
        var opts = $.extend({},defaults, options),
        timer = null,
        _this = this,
        curTop = _this.scrollTop(), //滚动条当前的位置
        subTop = opts.toT - curTop, //滚动条目标位置和当前位置的差值
        index = 0,
        dur = Math.round(opts.durTime / opts.delay),
        smoothScroll = function(t) {
            index++;
            var per = Math.round(subTop / dur);
            if (index >= dur) {
                _this.scrollTop(t);
                window.clearInterval(timer);
                if (opts.callback && typeof opts.callback == 'function') {
                opts.callback();
                }
                return;
            } else {
                _this.scrollTop(curTop + index * per);
            }
        };
        timer = window.setInterval(function() {
            smoothScroll(opts.toT);
        }, opts.delay);
        return _this;
    }
    $.fn.storage = function(key, value, force, destroy){
        var data;
        data = $.fn.storage._data;
        if (value === void 0) {
          return data[key];
        }
        if (destroy) {
          delete data[key];
          return true;
        }
        if (!force && data.hasOwnProperty(key)) {
          return false;
        }
        return data[key] = value;
    }
    $.fn.storage._data = {};
	$.fn.imgFloat = function(options) {
        var own = this;
        var xD = 0;
        var yD = 0;
        var i = 1;
        var settings = {
            speed: 10,
            xPos: 0,
            yPos: 0
        };
        jQuery.extend(settings, options);
        var ownTop = settings.xPos;
        var ownLeft = settings.yPos;
        own.css({
            position: "absolute",
            cursor: "pointer"
        });
        function imgPosition() {
            var winWidth = $(window).width() - own.width() - 10;
            var winHeight = $(window).height() + $(document).scrollTop() - own.height() - 10;
            if (xD == 0) {
                ownLeft += i;
                own.css({
                    left: ownLeft
                });
                if (ownLeft >= winWidth) {
                    ownLeft = winWidth;
                    xD = 1;
                }
            }
            if (xD == 1) {
                ownLeft -= i;
                own.css({
                    left: ownLeft
                });
                if (ownLeft <= 0) {
                    xD = 0;
                }
            }
            if (yD == 0) {
                ownTop += i;
                own.css({
                    top: ownTop
                });
                if (ownTop >= winHeight) {
                    ownTop = winHeight;
                    yD = 1;
                }
            }
            if (yD == 1) {
                ownTop -= i;
                own.css({
                    top: ownTop
                });
                if (ownTop <= $(document).scrollTop()) {
                    yD = 0;
                }
            }
        }
        var imgHover = setInterval(imgPosition, settings.speed);
        own.hover(function() {
            clearInterval(imgHover);
		},
		function() {
			imgHover = setInterval(imgPosition, settings.speed);
		});
    };
})(jQuery||Zepto);

var gxmJs = { vars: {}, funcs: {}, classes: {}, cache: {}, module: {} };
;(function(gxm){
    (function(cla){
        cla.myLocalStorage = function(keyName){
            var key = keyName; /**闭包 */
            this.get = function() {
                return localStorage.getItem(key);
            };
            this.set = function(value) {
                localStorage.setItem(key, value);
            };
            this.remove = function() {
                localStorage.removeItem(key);
            };
        };
        cla.mySessionStorage = function(keyName) {
            var key = keyName;/*闭包*/
            this.get = function () { 
                return sessionStorage.getItem(key); 
            };
            this.set = function (value) { 
                sessionStorage.setItem(key, value); 
            };
            this.remove = function () { 
                sessionStorage.removeItem(key); 
            };
        };
        cla.Mask = function(loadClass){
            this.loadClass = loadClass;
            this.show = function() {
                this.overlay.show();
            }
            this.close = function() {
                this.overlay.hide();
            }
            this.init = function () {
                this.overlay = $('#gxmJs-dialog-overlay');
                if (this.overlay.length == 0) {/*加笼罩层*/
                    this.overlay = $('<div id="gxmJs-dialog-overlay" class="dialog-overlay"></div>').hide();
                    $('body').append(this.overlay);
                }
            };
            this.init();
        }
        cla.Loading = function(loadClass){
            this.loadClass = loadClass;
            this.show = function() {
                this.overlay.show();
                this.loading.addClass(this.loadClass);
                this.loading.show();
            }
            this.close = function() {
                this.overlay.hide();
                this.loading.hide();
            }
            this.init = function () {
                this.overlay = $('#gxmJs-dialog-overlay');
                if (this.overlay.length == 0) {/*加笼罩层*/
                    this.overlay = $('<div id="gxmJs-dialog-overlay" class="dialog-overlay"></div>').hide();
                    $('body').append(this.overlay);
                }
                this.loading = $('#gxmJs-loading');
                if (this.loading.length == 0) {
                    this.loading = $('<div id="gxmJs-loading"></div>').hide();
                    $('body').append(this.loading);
                }
            };
            this.init();
        }
        cla.Dialog = function(content, options){
            var defaults = {
                title: "",
                showClose: false,
                draggable: false,
                modal: false,
                center: true,
                fixed: true,
                time: 0,             // 自动关闭时间，为0表示不会自动关闭。 
                parent: null,        // fixed为false时，position：absolute，提示框的父亲元素。
                createNew: false,     // 每次是否要生产新的 dialog html元素。
                clickOverlayToClose: false, //点击笼罩层关闭。
                clickDialogToClose: false, //点击消息框关闭。
                speed: 0,
                beforeShow: null,
                afterShow: null,
                beforeClose: null,
                afterClose: null,
                confirm: "确认",            //确定按钮的名称，默认为确认
                callback: null  //如果有回调函数则包含取消按钮
            };
            var timeId = null;  // 自动关闭计时器 
            var isShow = false;
            var self_dialog = this;
            /**
             * 重置对话框的位置。
             * 主要是在需要居中的时候，每次加载完内容，都要重新定位
             * @return void
             */
            var resetPos = function (obj) {
                /* 是否需要居中定位，必需在已经知道了dialog元素大小的情况下，才能正确居中，也就是要先设置dialog的内容。 */
                if (obj.options.center && obj.options.time == 0) {
                    var left = ($(window).width() - obj.dialog.width()) / 2;
                    var top = ($(window).height() - obj.dialog.height()) / 2;
                    obj.dialog.css({ top: top, left: left });
                } else {
                    var left = ($(window).width() - obj.dialog.width()) / 2;
                    var bottom = ($(window).height() - obj.dialog.height()) / 4;
                    obj.dialog.css({ bottom: bottom, left: left });
                }
            };
            /**
             * 获得某一元素的透明度。IE从滤境中获得。
             * @return float
             */
            var getOpacity = function (ele) {
                return $(ele).css('opacity');                
            };
            /**
             * 设置对话框的内容。 
             * @param string c 可以是HTML文本。
             * @return void
             */
            this.setContent = function(c) {
                var div = this.dialog.find('.dialogcontent');
                if (!c) {
                    var msg = '<div style="text-align:center;height:100%;padding-top:20px;">正在努力为您加载...</div>';
                    div.html(msg);
                } else if ('object' == typeof (c)) {
                    switch (c.type.toLowerCase()) {
                        case 'id': // 将ID的内容复制过来，原来的还在。
                            div.html($('#' + c.value).html()); resetPos(this);
                            break;
                        case 'img':
                            div.html('加载中...');
                            $('<img alt="" />').load(function () { div.empty().append($(this)); resetPos(this); })
                                .attr('src', c.value);
                            break;
                        case 'url':
                            div.html('加载中...');
                            $.ajax({
                                url: c.value,
                                success: function (html) { div.html(html); resetPos(this); },
                                error: function (xml, textStatus, error) { div.html('出错啦') }
                            });
                            break;
                        case 'iframe':
                            div.append($('<iframe src="' + c.value + '" />'));
                            resetPos(this);
                            break;
                        case 'text':
                        default:
                            div.html(c.value);
                            resetPos(this);
                            break;
                    }
                }
                else {
                    div.html(c);
                    resetPos(this);
                }
            };
            /**
             * 显示对话框
             */
            this.show = function () {
                if (typeof this.options.beforeShow == 'function' && !this.options.beforeShow()) {
                    return;
                }
                var _self = this;
                /* 是否显示背景遮罩层 */
                if (this.options.modal) {
                    this.overlay.show(_self.options.speed);
                }
                
                this.dialog.show(_self.options.speed, function () {
                    if (typeof _self.options.afterShow == 'function') { _self.options.afterShow(); }
                    isShow = true;
                });
                if (_self.options.time != 0) {
                    _self.dialog.find(".dialogcontent").addClass("show");
                }
                // 自动关闭 
                if (0 != this.options.time) {
                    timeId = setTimeout(_self.close, this.options.time);
                }
                resetPos(this);
            };
            /**
             * 关闭对话框,会移除对话框控件。
             * @return void
             */
            this.close = function () {
                var _self = self_dialog;
                if (typeof _self.options.beforeClose == 'function' && !_self.options.beforeClose()) {
                    return;
                }
                if(_self.options.time != 0){
                    _self.dialog.find(".dialogcontent").removeClass("show");
                } else {
                    _self.dialog.hide(_self.options.speed, function () {
                        if (typeof _self.options.afterClose == 'function') { _self.options.afterClose(); }
                        if (_self.options.createNew) { $(this).remove(); }
                    });
                }
                if (_self.options.modal) {
                    _self.overlay.hide(_self.options.speed);
                }
                isShow = false;
                clearTimeout(timeId);
            };
            this.destroy = function(){
                $("#gxmJs-dialog-content").remove();
                $("#gxmJs-dialog-overlay").remove();
                this.dialog = null;
            };
            this.init = function () {
                var _self = this;
                var dialogId = "gxmJs-dialog-content";
                this.options = $.extend(defaults, options);
                if (this.options.createNew) dialogId += cla.Dialog.__count;
                
                if (this.options.modal) {/*模式对话框，加笼罩层*/
                    this.overlay = $('#gxmJs-dialog-overlay');
                    if (this.overlay.length == 0) {
                        this.overlay = $('<div id="gxmJs-dialog-overlay" class="dialog-overlay"></div>').hide();
                        $('body').append(this.overlay);
                    }
                }
                /* 对话框的布局及标题内容。*/
                this.dialog = $('#' + dialogId);
                if (this.dialog.length == 0) {
                    if (this.options.time > 0) {
                        this.dialog = $('<div id="' + dialogId + '" class="gxmJs_dialog auto-show"><div class="dialogcontent"></div></div>').hide();
                    } else {
                        var titleHtml = this.options.title == '' ? '' : '<div class="dialogtitle">' + this.options.title + '</div>';
                        var closeHtml = this.options.showClose ? '<a href="javascript:;" class="dialogclose"></a>' : '';
                        if(this.options.callback){
                            this.dialog = $('<div id="' + dialogId + '" class="gxmJs_dialog">' + closeHtml + titleHtml + '<div class="dialogcontent"></div><div class="dialog-btn"><a class="dialog-cancel">取消</a><a class="dialog-confirm">'+this.options.confirm+'</a></div></div>').hide();
                        } else {
                            this.dialog = $('<div id="' + dialogId + '" class="gxmJs_dialog">' + closeHtml + titleHtml + '<div class="dialogcontent"></div><div class="dialog-btn"><a class="dialog-confirm">'+this.options.confirm+'</a></div></div>').hide();
                        }
                    }
                    this.dialog.css({ 'z-index': ++cla.Dialog.__zindex, 'position': this.options.fixed ? 'fixed' : 'absolute' });
                    if (!this.options.fixed && this.options.parent != null) {
                        $(this.options.parent).append(this.dialog);
                    } else {
                        $('body').append(this.dialog);
                    }
                } 

                /* 以下代码处理框体是否可以移动 */
                var mouse = { x: 0, y: 0 };
                function moveDialog(event) {
                    var e = window.event || event;
                    var top = parseInt(_self.dialog.css('top')) + (e.clientY - mouse.y);
                    var left = parseInt(_self.dialog.css('left')) + (e.clientX - mouse.x);
                    _self.dialog.css({ top: top, left: left });
                    mouse.x = e.clientX;
                    mouse.y = e.clientY;
                };

                this.dialog.mousedown(function (event) {
                    if (!_self.options.draggable) { return; }

                    var e = window.event || event;
                    mouse.x = e.clientX;
                    mouse.y = e.clientY;
                    $(document).bind('mousemove', moveDialog);
                });
                $(document).mouseup(function (event) {
                    $(document).unbind('mousemove', moveDialog);
                });

                /* 绑定一些相关事件。 */
                this.dialog.find('.dialogclose').bind('click', function () { _self.close(); });
                this.dialog.bind('mousedown', function () { _self.dialog.css('z-index', ++cla.Dialog.__zindex); });
                if (this.options.clickOverlayToClose) {
                    this.overlay.on('click', function () { _self.close(); });
                }
                //clickDialogToClose
                if (this.options.clickDialogToClose) {
                    this.dialog.on('click', function () { _self.close(); });
                }

                if(this.options.callback){
                    this.dialog.find(".dialog-confirm").bind("click", function(){
                        _self.options.callback();
                    })
                    this.dialog.find(".dialog-cancel").bind("click", function(){
                        _self.close();
                    });
                } else {
                    this.dialog.find(".dialog-confirm").bind("click", function(){
                        _self.close();
                    })
                }
            };

            this.init();
            this.setContent(content);
            cla.Dialog.__count++;
            cla.Dialog.__zindex++;
        };
        cla.Dialog.__zindex = 500;
        cla.Dialog.__count = 1;
        cla.Dialog.version = '0.1 beta';

    })(gxm.classes);
    (function (funcs) {
        /**弹框 */
        funcs.showDialog = function (content, options) {
            var dlg = new gxm.classes.Dialog(content, options);
            dlg.show();
            return dlg;
        };
        /*验证中文名称*/
        funcs.isChinaName = function (name) {
            var pattern = /^[\u4E00-\u9FA5]{2,}$/;
            return pattern.test(name);
        };
        /*验证英文名称*/
        funcs.isEnlishName = function (name) {
            var pattern = /^[a-zA-Z]{2,}\/?\s?[a-zA-Z]{2,}$/;
            return pattern.test(name);
        }
        /*验证中英文混合名称*/
        funcs.isCEName = function (name) {
            var pattern = /^[\u4E00-\u9FA5]{1,}[a-zA-Z]{2,}$/;
            return pattern.test(name);
        }
        /*验证手机号*/
        funcs.isPhoneNo = function (phone) {
            var pattern = /^1[34578]\d{9}$/;
            return pattern.test(phone);
        };
        /*验证身份证*/
        funcs.isCardNo = function (card) {
            var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            return pattern.test(card);
        }
        /**短信验证码验证 */
        funcs.isMessgeVal = function(validateCode) {
            var pattern = /^\d{6}$/;
            return pattern.test(validateCode);
        }
        /*验证护照*/
        funcs.isPassPort = function (passport) {
            var pattern = /^(P\d{7})|(G\d{8})$/;
            return pattern.test(passport);
        }
        /*军官证或士兵证*/
        funcs.isSolider = function (passport) {
            var pattern = /^(P\d{7})|(G\d{8})$/;
            return pattern.test(passport);
        }
        /*港澳回归证和台胞证*/
        funcs.isHKCard = function (card) {
            var pattern = /^[a-zA-Z0-9]{5,21}$/;
            return pattern.test(card);
        }
        /*出生证*/
        funcs.isBirthCard = function (card) {
            var pattern = /^[a-zA-Z0-9]{5,21}$/;
            return pattern.test(card);
        }
        /*户口本*/
        funcs.isAccountBook = function (book) {
            var pattern = /^[a-zA-Z0-9]{3,21}$/;
            return pattern.test(book);
        }
        /*其他*/
        funcs.isOther = function (card) {
            if (card.length > 20) {
                return false;
            } else {
                return true;
            }
        }
        /**验证密码 */
        funcs.validatePwd = function(pwd) { 
            if (/^.*?[\d]+.*$/.test(pwd) && /^.*?[A-Za-z]/.test(pwd) && /^.{6,20}$/.test(pwd)) { 
                return true; 
            } else {
                return false; 
            }
        } 
		/** 获取日期 */
		funcs.getDateStr = function(dates) {
			var date, month, year;
			if (dates) {
				year = (new Date(dates)).getFullYear();
				month = (new Date(dates)).getMonth() * 1 + 1;
				date = (new Date(dates)).getDate();
				if (month < 10) {
					month = '0' + month;
				}
				if (date < 10) {
					date = '0' + date;
				}
			} else {
				year = (new Date()).getFullYear();
				month = (new Date()).getMonth() * 1 + 1;
				date = (new Date()).getDate();
				if (month < 10) {
					month = '0' + month;
				}
				if (date < 10) {
					date = '0' + date;
				}
			}
			return year + "-" + month + "-" + date;
		}
		/** 计算日期之差 */
		funcs.getDateDiff = function(startDate, endDate){
			var dates, endTime, startTime;
			startTime = parseISO8601(startDate).getTime();
			endTime = parseISO8601(endDate).getTime();
			if (startTime > endTime) {
				return 0;
			}
			dates = Math.abs(startTime - endTime) / (1000 * 60 * 60 * 24);
			return dates;
		}
		/** 获取一天的毫秒数 */
		funcs.getDaysMounds = function() {
			var days, hours, minutes;
			minutes = 1000 * 60;
			hours = minutes * 60;
			days = hours * 24;
			return days;
		};
		/**判断是否OS系统里 */
        funcs.isOS = function(){
            var ua = navigator.userAgent.toLowerCase();	
            if (/iphone|ipad|ipod/.test(ua)) {
                return 1;
            } else if (/android/.test(ua)) {
                    return -1;
            } else {
                return 0;
            }
        };
        /**判断是否在微信里 */
        funcs.isWeiChat = function(){
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                // console.log("我在微信里呀");
                return true;
            } else {
                // console.log("不在微信里呀");
                return false;
            }
        }
		//{{{{ hack ie7/8 的方法，不需要可以删除
		/** 兼容IE 7/8 new Date() 不能添加字符串的bug */
		funcs.parseISO8601 = function(dateStringInRange) {
			var date, isoExp, month, parts;
			isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/;
			date = new Date(0/0);
			month = '';
			parts = isoExp.exec(dateStringInRange);
			if (parts) {
			  month = +parts[2];
			  date.setFullYear(parts[1], month - 1, parts[3]);
			  if (month !== date.getMonth() + 1) {
				date.setTime(0/0);
			  }
			}
			return date;
		};
		/** 国际日期转换为中间为2000-08-11 为了兼容ie7 */
		funcs.toDate = function(num){
			var date, month, str, week;
			num = num + "";
			date = "";
			month = new Array();
			month["Jan"] = 1;
			month["Feb"] = 2;
			month["Mar"] = 3;
			month["Apr"] = 4;
			month["May"] = 5;
			month["Jun"] = 6;
			month["Jul"] = 7;
			month["Aug"] = 8;
			month["Sep"] = 9;
			month["Oct"] = 10;
			month["Nov"] = 11;
			month["Dec"] = 12;
			week = new Array();
			week["Mon"] = "一";
			week["Tue"] = "二";
			week["Wed"] = "三";
			week["Thu"] = "四";
			week["Fri"] = "五";
			week["Sat"] = "六";
			week["Sun"] = "日";
			str = num.split(" ");
			if (str[5] === 'GMT+0800') {
			  date = str[3] + "-";
			} else {
			  date = str[5] + "-";
			}
			date = date + (month[str[1]] < 10 ? '0' + month[str[1]] : month[str[1]]) + "-" + (str[2] * 1 < 10 ? '0' + (str[2] * 1) : str[2]);
			return date;
		}
		//}}}
    })(gxm.funcs);
})(gxmJs, jQuery);