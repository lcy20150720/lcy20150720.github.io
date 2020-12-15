// +--------------------------------------------------------------------------------------
// | JmCalendar.js
// +--------------------------------------------------------------------------------------
// | time：2020-11-20
// +--------------------------------------------------------------------------------------
// | Author: lcy
// +--------------------------------------------------------------------------------------
// | 使用：
// |      引入js文件，调用方法如下：
// |      var calendar = new JmCalendar();
// |      calendar.init({ 
// |         months: n,               //n代表月份个数  
// |         confirmType:'callback',  //回调类型
// |         confirm: function(){},   //确定按钮事件
// |         cancelType:'callback',   //回调类型
// |         cancel: function(){},    //取消按钮事件
// |         selArea: [],             //日期数组 
// |      });
// |
// +---------------------------------------------------------------------------------------


var JmCalendar = (function() {
    function JmCalendar() {};
    JmCalendar.prototype = {
        init: function(opts) {
            this.selArea = opts.selArea || [];
            this._html(opts.months);    //创建html
            this._setDefaultSelArea();  //设置初始化选中事件
            this._selectedEvent();      //日期选中事件
            this._scrollMonth();        //月份滚动事件
            this._bindClickEvt();       //按钮点击事件
            this._confirmType = opts.confirmType || '';
            this._cancelType = opts.cancelType || '';
            this._confirm = opts.confirm || null;
            this._cancel = opts.cancel || null;
        },
        _html: function(months) {
            var popBox = document.createElement('div');
            popBox.classList.add('pop_box');
            popBox.classList.add('calendar_pop');

            var weekbar = document.createElement('div');
            weekbar.classList.add('calendar-top');
            var panels = document.createElement('div');
            panels.classList.add('calendar-panels');

            this.months = months;
            this.panels = panels;

            for (var i = 1; i < months + 1; i++) {

                var d = new Date();
                var yy = d.getFullYear(); //年
                var mm = d.getMonth(); //月
                var dd = d.getDate(); //日
                var dateTmp = '';
                var feb; //二月天数

                var arr = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                if (yy % 4 == 0 && yy & 100 != 0 || yy % 400 == 0) { //判断是否为闰年
                    feb = 29;
                } else {
                    feb = 28;
                }

                var nMonth = mm + i;
                var nYear = yy;

                if (nMonth > 12) {
                    if (nMonth % 12 == 0) {
                        nYear += parseInt(nMonth / 12) - 1;
                        nMonth = 12;
                        nYear = yy + 1;
                    } else {
                        nYear += parseInt(nMonth / 12);
                        nMonth = nMonth % 12;
                    }
                }

                var days = arr[nMonth - 1]; //月份天数
                var week = new Date(nYear + '-' + nMonth + '-1').getDay(); //当月1号星期几

                // 生成日期格子
                var dateNum = 0;
                for (var j = 0; j < 42; j++) {
                    if (j < week) {
                        dateTmp += '<div class="date-box"></div>';
                    } else {
                        if (j < days + week) {

                            dateNum++;

                            var temp = '<p class="date">' + dateNum + '</p>'; //日期
                           
                            if (nYear === new Date().getFullYear() && nMonth === new Date().getMonth() + 1) { //年月判断
                                if (dateNum < new Date().getDate()) { //日期判断是否已过去
                                    dateTmp += '<div class="date-box date-passed" data-date="' + nYear + '-' + nMonth + '-' + dateNum + '">' + temp + '</div>';
                                } else {
                                    dateTmp += '<div class="date-box" data-date="' + nYear + '-' + nMonth + '-' + dateNum + '">' + temp + '</div>';
                                }
                            } else {
                                dateTmp += '<div class="date-box" data-date="' + nYear + '-' + nMonth + '-' + dateNum + '">' + temp + '</div>';
                            }

                        }
                    }
                }

                var monthTitle = '<div class="month-title">2020年11月</div>';
                var barTmp = '<div class="weekbar">'
                barTmp += '<span>日</span>';
                barTmp += '<span>一</span>';
                barTmp += '<span>二</span>';
                barTmp += '<span>三</span>';
                barTmp += '<span>四</span>';
                barTmp += '<span>五</span>';
                barTmp += '<span>六</span>';
                barTmp += '</div>';
                weekbar.innerHTML = monthTitle + barTmp;

                var htm = '<div class="calendar-box">';
                htm += '<div class="calendar-bar">';
                htm += '<span class="yy">' + nYear + '</span>年<span class="mm">' + nMonth + '</span>月';
                htm += '</div>';
                htm += '<div class="calendar-bom">';
                htm += '<div class="dates-wp clearfix bg_m' + nMonth + '">' + dateTmp + '</div>';
                htm += '</div>';
                htm += '</div>';

                var childTmp = document.createElement('div');
                childTmp.classList.add('tab-panel');
                childTmp.innerHTML = htm;
                panels.appendChild(childTmp);

            }

            var popTmp = '<div class="pop_shadow"></div>';
            popTmp += '<div class="pop_inner">';
            popTmp += '<div class="pop_head">';
            popTmp += '<h3>请选择出发时间段</h3>';
            popTmp += '<a href="javascript:;" class="pop_close">';
            popTmp += '<svg class="toast-fail" aria-hidden="true" width=".53rem" height=".53rem">';
            popTmp += '<use xlink:href="#toast-fail" x="0" y="0" fill="#ccc" width=".53rem" height=".53rem"></use>';
            popTmp += '</svg>';
            popTmp += '</a>'
            popTmp += '</div>';
            popTmp += '<div class="pop_con jm-calendar">';
            popTmp += '</div>';
            popTmp += '<div class="pop_foo">';
            popTmp += '<a href="javascript:;" class="cancel_btn">无明确出发日期</a>';
            popTmp += '<a href="javascript:;" class="confirm_btn">确定</a>';
            popTmp += '</div>';
            popTmp += '</div>';
            popBox.innerHTML = popTmp;

            //添加['日','一','二','三','四','五','六']文字版块到容器
            popBox.querySelector('.jm-calendar').appendChild(weekbar);

            //添加所有月份版块到容器
            popBox.querySelector('.jm-calendar').appendChild(panels);
            this.contents = popBox;

            var calendar = document.querySelector('.calendar_pop');
            if (!calendar) {
                document.body.appendChild(popBox);
            }
        },
        setFestText: function(fmonth, fdate) {
            var gregorianFestivals = {
                '0101': '元旦',
                '0214': '情人节',
                '0308': '妇女节',
                '0312': '植树节',
                '0401': '愚人节',
                '0501': '劳动节',
                '0504': '青年节',
                '0512': '护士节',
                '0601': '儿童节',
                '0701': '建党节',
                '0801': '建军节',
                '0910': '教师节',
                '1001': '国庆节',
                '1224': '平安夜',
                '1225': '圣诞节',
            };
            if (fmonth < 10) {
                fmonth = '0' + fmonth;
            }
            if (fdate < 10) {
                fdate = '0' + fdate;
            }
            var str = fmonth + fdate;
            if (gregorianFestivals[str] != undefined) {
                return gregorianFestivals[str];
            } else {
                return '&nbsp';
            }
        },
        _selectedEvent: function() {
            var _this = this;
            var targetList = document.querySelectorAll('.date-box');
            if (targetList.length) {
                for (var k = 0; k < targetList.length; k++) {
                    (function(index) {
                        targetList[index].addEventListener('click', function() {
                            if (targetList[index].innerHTML != '') {

                                var isSelStart = false; //开始日期是否已点击
                                var isSelEnd = false; //结束日期是否已点击

                                for (var m = 0; m < targetList.length; m++) {
                                    if (targetList[m].className.indexOf('selected-start') != -1) {
                                        isSelStart = true;
                                    }
                                    if (targetList[m].className.indexOf('selected-end') != -1) {
                                        isSelEnd = true;
                                    }
                                }

                                if (isSelStart) {
                                    if (isSelEnd) {
                                        //已点击过，查询所有日期移除样式
                                        for (var i = 0; i < targetList.length; i++) {
                                            if (targetList[i].className.indexOf('selected-start') != -1) {
                                                targetList[i].classList.remove('selected-start');
                                            }
                                            if (targetList[i].className.indexOf('selected-pass') != -1) {
                                                targetList[i].classList.remove('selected-pass');
                                            }
                                            if (targetList[i].className.indexOf('selected-end') != -1) {
                                                targetList[i].classList.remove('selected-end');
                                            }
                                            var child = targetList[i].querySelector('p');
                                            if (child != null) {
                                                if (child.className.indexOf('cur') != -1) {
                                                    child.classList.remove('cur');
                                                }
                                            }

                                        }
                                        //点击的日期加开始日期样式
                                        if (targetList[index].className.indexOf('date-passed') == -1) {
                                            targetList[index].classList.add('selected-start');
                                            _this.selArea = [];
                                            _this.selArea[0] = targetList[index].getAttribute('data-date');
                                        }
                                    } else {

                                        //给最后点击的日期加样式
                                        if (targetList[index].className.indexOf('selected-end') == -1) {
                                            if (targetList[index].className.indexOf('selected-start') == -1) {
                                                targetList[index].classList.add('selected-end');
                                                _this.selArea.push(targetList[index].getAttribute('data-date'));
                                            }

                                            var selStInd, selNdInd;
                                            for (var i = 0; i < targetList.length; i++) {
                                                if (targetList[i].className.indexOf('selected-start') != -1) {
                                                    //如果开始日期的下标大于结束日期的下标，互换标签
                                                    if (i > index) {
                                                        selNdInd = i;
                                                        selStInd = index;
                                                        targetList[i].classList.remove('selected-start');
                                                        targetList[i].classList.add('selected-end');
                                                        targetList[index].classList.remove('selected-end');
                                                        targetList[index].classList.add('selected-start');
                                                        _this.selArea[0] = targetList[index].getAttribute('data-date');
                                                        _this.selArea[1] = targetList[i].getAttribute('data-date');

                                                    } else {
                                                        selStInd = i;
                                                    }
                                                    targetList[i].querySelector('p').classList.add('cur');
                                                }
                                                if (targetList[i].className.indexOf('selected-end') != -1) {
                                                    if (targetList[i].className.indexOf('selected-start') == -1) {
                                                        selNdInd = i;
                                                        targetList[i].querySelector('p').classList.add('cur');
                                                    }
                                                }
                                            }

                                            //中间的日期加样式
                                            for (var s = 0; s < targetList.length; s++) {
                                                if (selNdInd < selStInd) {
                                                    if (s > selNdInd && s < selStInd) {
                                                        targetList[s].classList.add('selected-pass');
                                                    }
                                                } else {
                                                    if (s > selStInd && s < selNdInd) {
                                                        targetList[s].classList.add('selected-pass');
                                                    }
                                                }
                                            }
                                            console.log(_this.selArea)
                                        }

                                    }
                                } else {
                                    //未点击过，加开始日期样式
                                    if (targetList[index].className.indexOf('date-passed') == -1) {
                                        targetList[index].classList.add('selected-start');
                                        _this.selArea.push(targetList[index].getAttribute('data-date'));
                                    }
                                }
                            }
                        })
                    })(k)

                }
            }
        },
        _setDefaultSelArea: function(){
            var _this = this;
            var arr = _this.selArea;

            if(arr.length>0){
               var dateList =  _this.contents.querySelectorAll('.date-box');
               var stIndex,ndIndex;

               if(dateList.length>0){
                    for(var i=0; i<dateList.length; i++){
                        (function(j){
                            var dateStr = dateList[j].getAttribute('data-date');
                            if(arr[0] === dateStr){
                                dateList[j].classList.add('selected-start');
                                dateList[j].querySelector('p').classList.add('cur');
                                stIndex = j;
                            }
                            if(arr[1] === dateStr){
                                dateList[j].classList.add('selected-end');
                                dateList[j].querySelector('p').classList.add('cur');
                                ndIndex = j;
                            }
                        })(i)
                    }
                    for(var i=0; i<dateList.length; i++){
                        if(i>stIndex && i<ndIndex){
                            if(dateList[i].innerHTML!=''){
                                dateList[i].classList.add('selected-pass');
                            }
                        }
                    }

               }

            }
        },
        _scrollMonth: function() {
            var _this = this;
            _this.panels.addEventListener('scroll', function(e) {
                var monthPanels = _this.contents.querySelectorAll('.tab-panel');
                var topTitle = _this.contents.querySelector('.month-title');
                var scrollH = e.target.scrollTop;

                monthPanels.forEach(function(el) {
                    var yy = el.querySelector('.yy').innerHTML;
                    var mm = el.querySelector('.mm').innerHTML;

                    if (e.target.scrollTop + 140 > el.offsetTop) {
                        topTitle.innerHTML = yy + '年' + mm + '月';
                    }
                })
            })
        },
        _bindClickEvt: function() {
            var _this = this;
            var closeBtn = this.contents.querySelector('.pop_close');
            var confirmBtn = this.contents.querySelector('.confirm_btn');
            var cancelBtn = this.contents.querySelector('.cancel_btn');

            closeBtn.addEventListener('click', function() {
                _this._hide();
            })

            confirmBtn.addEventListener('click', function() {
                if (_this._confirmType === 'callback') {
                    _this._confirm.call(_this);
                } else {
                    _this._hide();
                }
            });

            cancelBtn.addEventListener('click', function() {
                if (_this._cancelType === 'callback') {
                    _this._cancel.call(_this);
                } else {
                    _this._hide();
                }
            });
        },
        _show: function() {
            this.contents.classList.add('moved');
        },
        _hide: function() {
            this.contents.classList.remove('moved');
        },
    }
    return JmCalendar;
})()