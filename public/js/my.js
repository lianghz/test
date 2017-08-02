var MaskUtil = (function () {
    var $mask, $maskMsg;
    var defMsg = '正在处理，请稍待。。。';
    function init() {
        if (!$mask) {
            $mask = $("<div class=\"datagrid-mask mymask\"></div>").appendTo("body");
        }
        if (!$maskMsg) {
            $maskMsg = $("<div class=\"datagrid-mask-msg mymask\">" + defMsg + "</div>")
                .appendTo("body").css({ 'font-size': '12px' });
        }
        $mask.css({ width: "100%", height: $(document).height() });
        $maskMsg.css({
            left: ($(document.body).outerWidth(true) - 190) / 2, top: ($(window).height() - 45) / 2
        });
    }
    return {
        mask: function (msg) {
            init();
            $mask.show();
            $maskMsg.html(msg || defMsg).show();
        }
        , unmask: function () {
            $mask.hide();
            $maskMsg.hide();
        }
    }
}());


Date.prototype.format = function (formatStr) {
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(/MM/, (this.getMonth() + 1) > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    return str;
}

function err(target, message) {
    var t = $(target);
    if (t.hasClass('textbox-text')) {
        t = t.parent();
    }
    var m = t.next('.error-message');
    if (!m.length) {
        m = $('<div class="error-message"></div>').insertAfter(t);
    }
    m.html(message);
}