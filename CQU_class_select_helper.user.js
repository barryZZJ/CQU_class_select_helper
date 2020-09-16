// ==UserScript==
// @name         重庆大学抢课微辅助local
// @namespace    https://greasyfork.org/zh-CN/scripts/397063-%E9%87%8D%E5%BA%86%E5%A4%A7%E5%AD%A6%E6%8A%A2%E8%AF%BE%E5%BE%AE%E8%BE%85%E5%8A%A9
// @version      1.3.0
// @description  💛 发生了提交失败（比如提交完显示Service unavailable）的情况时，勾选上该选项，即可自动选择上次的老师，然后点提交即可。（可在适配的网址内跨网页、跨域名共用，支持的网址见代码里的 @match）💚 进入选课页面后自动点击检索按钮; 🧡 点击“提交”时不会弹出确认提示; 💙 弹出选老师窗口中添加"快速选择"按钮，一键选择老师;
// @author       Barry ZZJ
// @icon         http://www.cqu.edu.cn/favicon.ico
// @match        *://202.202.1.41/*
// @match        *://jxgl.cqu.edu.cn/*
// @match        *://222.198.128.126/*
// @match        *://202.202.1.176/*
// @require      https://cdn.staticfile.org/jquery/2.1.4/jquery.min.js
// @license      GPL License
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

//TODO 重复上次提交可以改成直接ajax上次的post，然后渲染返回的内容
//TODO 添加打开/home.aspx时自动点击登陆
//TODO 非限和通识每次点检索时尝试自动输入验证码
//TODO 如果能识别了尝试一下训练

const SCR_HEADER = "🐛重大抢课微辅助"; // 用于debug
const version = "1.3.0";
const configs = []; //* [各个功能的名字, 开关情况] 放在字典里用于生成下拉菜单时遍历
//* 各个功能的类，key为GM存储中的key, caption为在下拉菜单中显示的文字
class Config {
    constructor(key, enabled, caption) {
        this.key = key;
        this.enabled = enabled;
        this.caption = caption;
    }
};
//* 各种功能开关 -------------------------------------------
//* I. 删除提交时的确认提示 ----------------------------------
var Delete_Submit_Prompt = new Config("Del_Sub_Prmpt", GM_getValue("Del_Sub_Prmpt") == null ? true : GM_getValue("Del_Sub_Prmpt"), "删除提交时的确认提示"); // 默认值为true
configs.push(Delete_Submit_Prompt);

//* II. 添加"重试上次提交"按钮 ----------------------------------
var Append_Resubmit_Button = new Config("App_Resub_Btn", GM_getValue("App_Resub_Btn") == null ? true : GM_getValue("App_Resub_Btn"), "一键重试上次提交"); // 默认值为true
configs.push(Append_Resubmit_Button);

//* 存frmRpt的整个html，如果502就直接修改html内容为上次提交时的内容
const frmRptHTML_Key = {
    'xk': 'frmRptHTML_xk',
    'yy': 'frmRptHTML_yy',
    'fx': 'frmRptHTML_fx',
    'ts': 'frmRptHTML_ts'
}

//* 存课程前面复选框(chkKC#)的checked、input(课程代号，hidden，chkSKBJ#, 如E6T0001160K000568-016B）input（老师名字 chkSKBJstr#）的value信息到JSON，key是元素的id
const Last_Submit_DOM_Storage_Key = 
{
    'xk': 'DOMInfo_xk',
    'yy': 'DOMInfo_yy',
    'fx': 'DOMInfo_fx',
    'ts': 'DOMInfo_ts'
};

//* III. 弹出窗口中添加"快速选择"按钮 ---------------------------
var Append_Fast_Choose_Button = new Config("App_Fast_Chs_Btn", GM_getValue("App_Fast_Chs_Btn") == null ? true : GM_getValue("App_Fast_Chs_Btn"), "一键选择老师"); // 默认值为true
configs.push(Append_Fast_Choose_Button);

//* IV. 自动点击检索按钮 -------------------------------------
var Auto_Click_Search = new Config("Auto_Search", GM_getValue("Auto_Search") == null ? true : GM_getValue("Auto_Search"), "自动点击检索按钮"); // 默认值为true
configs.push(Auto_Click_Search);

//* -----------------------------
//* 开启Debug功能后会在console输出信息
var DEBUG_MODE = new Config("Debug_Mode", GM_getValue("Debug_Mode") == null ? true : GM_getValue("Debug_Mode"), "控制台输出debug信息"); // 默认值为true
configs.push(DEBUG_MODE);

//* ------------------------------------------------------
//* 根据当前功能开关情况生成插件下拉菜单，并添加对应修改函数 ---------------------
var menuIds = []; //所有下拉菜单的id

drawMenu();

// 每次按下按钮后就重绘一遍menu
function drawMenu () {
    // 重绘新菜单，只有在最父层frame且没有id的时候才重绘，避免内层frame加载时重复多次调用
    if (window == top) {
        // debugger;
        menuIds = [];
        for (const config of configs) {
            var pre = config.enabled ? "【✔️已启用】" : "【❌已禁用】";
            var id = GM_registerMenuCommand(pre + config.caption, changeEnabled(config));
            menuIds.push(id);
        }
    }
}

function changeEnabled (config) {
    return () => {
        // debugger;
        config.enabled = !config.enabled;
        GM_setValue(config.key, config.enabled);

        // 修改功能开关后重绘下拉菜单
        for (const id of menuIds) {
            GM_unregisterMenuCommand(id);
        }
        drawMenu();
    };
}

//* 需要前面的prefix才能用，如 input.button
const BTN_CLASS = "ZZJBtn";
const BTN_CSS =
    `input.${BTN_CLASS} {
    font-family: "宋体";
    font-size: 12px;
    cursor: pointer;
    height: 20px;
    margin-left: 10px;
}
`;
const CHK_CLASS = "ZZJChk";
const CHK_CSS =
    `input.${CHK_CLASS} {
    font-family: "宋体";
    font-size: 12px;
    vertical-align: middle;
    margin-left: 10px;
}
`;

function log (msg) {
    if (DEBUG_MODE.enabled) {
        let d = new Date();
        console.log("[" + SCR_HEADER + "] " + msg + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
    }
};

function error (msg) {
    if (DEBUG_MODE.enabled) {
        let d = new Date();
        console.error("[" + SCR_HEADER + "] " + msg + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
    }
};



//* 清空脚本存储的记录，
function clearResubmitStorage () {
    // GM_deleteValue(Last_Submit_oTable_Storage_Key['xk']);
    // GM_deleteValue(Last_Submit_oTable_Storage_Key['yy']);
    // GM_deleteValue(Last_Submit_oTable_Storage_Key['fx']);
    // GM_deleteValue(Last_Submit_oTable_Storage_Key['ts']);
    GM_deleteValue(Last_Submit_DOM_Storage_Key['xk']);
    GM_deleteValue(Last_Submit_DOM_Storage_Key['yy']);
    GM_deleteValue(Last_Submit_DOM_Storage_Key['fx']);
    GM_deleteValue(Last_Submit_DOM_Storage_Key['ts']);
    GM_deleteValue(frmRptHTML_Key['xk']);
    GM_deleteValue(frmRptHTML_Key['yy']);
    GM_deleteValue(frmRptHTML_Key['fx']);
    GM_deleteValue(frmRptHTML_Key['ts']);
}

(function () {
    'use strict'; // 严格模式下使用未定义的变量会报错
    // if (name = 'frmMain') {
    //     console.log(SCR_HEADER + this.location.pathname);
    // }
    // if (name == 'frmRpt'){
    //     console.log(SCR_HEADER + this.location.pathname);
    // }
    //* I. 删除提交时的提示 -------------------------------------------------
    if (Delete_Submit_Prompt.enabled && name == 'frmRpt') {

        //* 删掉frmRpt(/wsxk/stu_btx_rpt.aspx)里的ChkValue(theObj)里的 
        //* str: if (!confirm('是否提交记录？'))return false;
        //* regEx: /if \(!confirm\('是否提交记录？'\)\)return false;/
        //* 即可
        //* 专业课 frmRpt(/wsxk/stu_btx_rpt.aspx)  对应scripts[1]
        //* 通识 frmRpt(/wsxk/stu_xszx_rpt.aspx))  对应scripts[3]
        //* 英语 frmRpt(/wsxk/stu_btx_rpt.aspx))
        //* 非限 frmRpt(/wsxk/stu_btx_rpt.aspx))
        var flag = null;
        if (self.location.pathname == "/wsxk/stu_btx_rpt.aspx") {
            flag = 1;
        } else if (self.location.pathname == "/wsxk/stu_xszx_rpt.aspx") {
            flag = 1;
        }
        if (flag) {
            // 遍历script元素，如果有关键字符串，就用删掉文字后的<script>标签替换原<script>标签
            for (let i = 0; i < document.scripts.length; i++) {
                const scrOrg = document.scripts[i];
                
                var scrNew = self.document.createElement("script");
                scrNew.innerHTML = scrOrg.innerHTML.replace("if (!confirm('是否提交记录？'))return false;", "");
                
                document.scripts[i].replaceWith(scrNew);                    
            }

            const flagtmp = false;
            for (const scr of document.scripts) {
                if (scr.innerHTML.search("是否提交记录") != -1) {
                    error("未删除提交确认框！");
                    flagtmp = true;
                    break;
                }     
            }
            if(!flagtmp) log("已删除提交确认框！");
        }
    }
    //* -----------------------------------------------------------------

    //* II. "重试上次提交"按钮 ---------------------------------------------
    const RESUB_ID = "ZZJResub";
    if (Append_Resubmit_Button.enabled && name == 'frmMain') {
        // debugger;
        var leixing = null; // 是哪个类型的页面：xk, ts, yy, fx
        switch (window.location.pathname) {
            case "/wsxk/stu_btx.aspx": // 专业课
                leixing = "xk";
                break;
            case "/wsxk/stu_whszk.aspx": // 英语
                leixing = "ts";
                break;
            case "/wsxk/stu_yytgk_bx.aspx": // 通识
                leixing = "yy";
                break;
            case "/wsxk/stu_ggrxk.aspx": // 非限
                leixing = "fx";
                break;
            default:
                break;
        }
        if (leixing) {

            //* 专业课 (frmMain(/wsxk/stu_btx.aspx) frmRpt(/wsxk/stu_btx_rpt.aspx))
            //* 通识(frmMain(/wsxk/stu_whszk.aspx) frmRpt(/wsxk/stu_xszx_rpt.aspx))
            //* 英语(frmMain(/wsxk/stu_yytgk_bx.aspx) frmRpt(/wsxk/stu_btx_rpt.aspx))
            //* 非限(frmMain(/wsxk/stu_ggrxk.aspx) frmRpt(/wsxk/stu_btx_rpt.aspx))

            // console.log(this.location.pathname);
            //* 为了保证多开网页能通用，存在GM storage里。
            //* 不同域名的网站也要通用？--> 利用GM_setValue和GM_getValue, 而不存储在localStorage里
            //* 在提交旁边加上重试上次提交按钮，提交按钮按下时先在 GM storage 存下 frmMain(/wsxk/stu_btx.aspx) -> frmRpt(/wsxk/stu_btx_rpt.aspx) -> id=oTable 的innerHTML，点击重复提交时先从storage里调取覆盖，再执行提交按钮对应的onclick，

            var subBtn = null; // 提交按钮，含提交的窗口加载出来时就会赋值
            //* 找到提交按钮
            for (const btn of document.querySelectorAll(".button")) {
                if (btn.value == "提交") {
                    subBtn = btn;
                    log("frmMain: 获取提交按钮");
                    break;
                }
            }

            //* 找到提交按钮，复选框才能添加
            if (subBtn != null) {
                //* II.1. 设计样式并添加 "重新提交" 复选框 ------------------------------------------
                //* 设置复选框的css
                GM_addStyle(CHK_CSS);

                //* 新建复选框元素
                var resubChk = document.createElement("input");
                resubChk.id = RESUB_ID;
                resubChk.setAttribute("class", CHK_CLASS);
                // resubChk.setAttribute("class", "button");
                resubChk.setAttribute("type", "checkbox");
                resubChk.setAttribute("name", "resub");
                resubChk.setAttribute("value", "重试上次提交");
                resubChk.setAttribute("leixing", leixing); // 确定当前页面类型，用于存储oTable在不同的key里面
                resubChk.checked = false;
                //* 添加复选框到 提交按钮 后面
                insertAfter(resubChk, subBtn);

                //* 修改整体宽度
                subBtn.parentElement.setAttribute("width", 800);

                //* 添加label元素到复选框后面（点文字时也能选中复选框）
                var resubLbl = document.createElement("label");
                resubLbl.setAttribute("for", RESUB_ID);
                resubLbl.textContent = "重试上次提交";
                insertAfter(resubLbl, resubChk);

                log("已添加重试上次提交" + leixing + "复选框。");

                //* 复选框onchange逻辑在II.3

            } else {
                error("未能添加重试上次提交复选框。");
            }
        }


    }
    //* II.2. 改写提交按钮的逻辑，把提交内容存入Storage，并post到其他hosts的相同pathname下 -----------------
    //* 提交按钮按下时先在 Storage 存下 frmMain(/wsxk/stu_btx.aspx) -> frmRpt(/wsxk/stu_btx_rpt.aspx) -> id=oTable 的innerHTML。点击重复提交时先从storage里调取覆盖，再执行提交按钮对应的onclick。
    if (Append_Resubmit_Button.enabled && name == 'frmRpt') {
        // 通识 frmRpt(/wsxk/stu_xszx_rpt.aspx)
        // 英语 frmRpt(/wsxk/stu_btx_rpt.aspx)
        // 非限 frmRpt(/wsxk/stu_btx_rpt.aspx)

        var tpe = null; // 选择修改的内容是scripts几
        if (self.location.pathname == "/wsxk/stu_btx_rpt.aspx") {
            tpe = 1;
        } else if (self.location.pathname == "/wsxk/stu_xszx_rpt.aspx") {
            tpe = 3;
        }
        if (tpe) {

            //* 只在加载出表格网页时才进行
            for (const btn of parent.document.querySelectorAll(".button")) {
                if (btn.value == "提交") {
                    subBtn = btn;
                    log("frmRpt: 获取父页面提交按钮");
                    break;
                }
            }

            if (subBtn != null) {
                
                const leixing = parent.document.querySelector("." + CHK_CLASS).getAttribute("leixing");

                //* 存frmRpt的整个html，
                //* 如果500(Internal Server Error)或503(Service Unavailable)，
                //* 在点击“重试上次提交”后(loadLastTeacherInfos函数内)，修改html内容为上次提交时的内容
                if (document.head.innerText != "") {
                    // 正常加载，存起来
                    GM_setValue(frmRptHTML_Key[leixing], document.documentElement.outerHTML);
                    log("已保存当前frmRpt");
                }

                //* frmRpt(/wsxk/stu_btx_rpt.aspx 对应scripts[1]) (/wsxk/stu_xszx_rpt.aspx 对应scripts[3]) 里的 checkbox 'chkKC' 的checked属性以及后面input 'chkSKBJstr' 的value属性 与 HTML标签里的属性不同步，
                //* 可以单独记录所有chkKC的checked和chkSKBJstr的value，读取的时候也把这些信息读进来。√
                //* 或修改网页的函数openWinDialog, 使得改变chkKC的属性值以及chkSKBJstr的value使修改对应的HTML标签。×

                var oTable = null; // 所有选课内容的表格（全局变量）
                oTable = document.getElementById("oTable");

                //* II.3. 修改复选框切换时，提交按钮的逻辑 ---------------------------------              
                //* 当resubChk的勾选情况发生改变时，就把提交按钮的onclick函数修改成对应的情况（不勾选时提交当前选课信息，勾选时提交上次选课信息）
                var resubChk = parent.document.getElementById(RESUB_ID);
                resubChk.checked = false;
                resubChk.disabled = !GM_getValue(Last_Submit_DOM_Storage_Key[leixing]); // 如果存储器为空就禁用

                subBtn.onclick = submitClassF(resubChk, self, oTable, leixing);
                
                resubChk.onchange = function (resubChk, frmRptWindow, subBtn, oTable, leixing) {
                    return function () {

                        if (!resubChk.checked) {
                            // 清空新选的课程信息（只包括课程前面复选框的checked和input（老师名字）的value）
                            clearLoadedTeacherInfos(oTable, leixing);

                            // 原提交逻辑
                            subBtn.onclick = submitClassF(resubChk, frmRptWindow, oTable, leixing);
                            log("修改提交逻辑为【提交当前选课信息】");

                        } else {
                            //* 如果500(Internal Server Error)或503(Service Unavailable)，
                            //* 在点击“重试上次提交”后(loadLastTeacherInfos函数内)，修改html内容为上次提交时的内容
                            //* 注意执行该函数的上下文应为frmRpt才行。
                            if (document.head.innerText == "") {
                                // 如果frmRpt没有加载出来，并且有记录，就从记录里加载。
                                var frmRptHTML = GM_getValue(frmRptHTML_Key[leixing]);
                                if (frmRptHTML) {
                                    document.open();
                                    document.write(frmRptHTML);
                                    document.close();
                                    oTable = document.getElementById("oTable");
                                    log("已读取上次frmRpt");
                                } else {
                                    log("未能读取上次frmRpt，无法加载上次提交信息");
                                }
                                // 设置100ms延时，等document加载完了再执行，否则获取不到oTable
                                setTimeout(() => {
                                    // 从GM存储里加载上次新选的课程信息（包括课程前面复选框(chkKC#)的checked、input(课程代号，hidden，chkSKBJ#, 如E6T0001160K000568-016B）input（老师名字 chkSKBJstr#）的value信息）
                                    loadLastTeacherInfos(oTable, leixing);

                                    // 重试上次提交
                                    subBtn.onclick = resubmitClassF(resubChk, frmRptWindow, oTable, leixing);
                                    log("修改提交逻辑为【提交上次选课信息】")
                                }, 100);
                            } else {
                                
                                // 从GM存储里加载上次新选的课程信息（包括课程前面复选框(chkKC#)的checked、input(课程代号，hidden，chkSKBJ#, 如E6T0001160K000568-016B）input（老师名字 chkSKBJstr#）的value信息）
                                loadLastTeacherInfos(oTable, leixing);
                                
                                // 重试上次提交
                                subBtn.onclick = resubmitClassF(resubChk, frmRptWindow, oTable, leixing);
                                log("修改提交逻辑为【提交上次选课信息】")
                            }

                        }
                    }
                }(resubChk, self, subBtn, oTable, leixing);

                //* II.4. 当选课成功时，删除存储记录，禁用复选框 ---------------------------
                if (document.body.innerText.search("选课成功的课程") != -1) {
                    log("选课成功，清空上次提交记录");
                    GM_setValue(Last_Submit_DOM_Storage_Key[leixing], "");
                    GM_setValue(frmRptHTML_Key[leixing], "");
                    resubChk.checked = false;
                    resubChk.disabled = true;
                }
            }
        }
    }
    //* --------------------------------------------------------------

    //* III. 弹出窗口增加快速选择选项（选好后自动确定） --------------------------
    if (Append_Fast_Choose_Button.enabled && (location.pathname == "/wsxk/stu_xszx_skbj.aspx" || location.pathname == "/wsxk/stu_xszx_chooseskbj.aspx")) {
        //* 专业课: /wsxk/stu_xszx_skbj.aspx?xxxx=xxxx
        //* 英语: /wsxk/stu_xszx_chooseskbj.aspx?xxx
        //* 非限: /wsxk/stu_xszx_skbj.aspx?xxx
        //* 通识: /wsxk/stu_xszx_skbj.aspx?xxx
        var tab = document.getElementById("pageRpt");
        var sureBtn = document.getElementById("sure"); // 确定按钮

        //* III.1. 最后新加一列
        // 列头
        var tdh = tab.querySelector(".T").insertCell();
        tdh.rowSpan = "2";
        tdh.textContent = "快选";
        tdh.align = "center";

        //* III.2. 每一行结尾添加快选按钮
        var trs = tab.querySelectorAll(".B");
        for (const tr of trs) {
            if (tr.lastElementChild.firstElementChild.tagName.toUpperCase() == "INPUT") {
                var rad = tr.lastElementChild.firstElementChild;
                // 含radio的那一行，插入快选按钮

                var inp = document.createElement("input");
                inp.className = "button";
                inp.type = "button";
                inp.value = "快选";
                inp.style.marginTop = "2px";
                inp.style.marginBottom = "2px";
                inp.disabled = rad.disabled; // 快选的按钮disabled与前面的radio相同

                // 每行最后一个格子
                var td = tr.insertCell();
                td.rowSpan = rad.parentElement.rowSpan;
                td.appendChild(inp);

                //* III.3.添加按钮的逻辑
                // 按下时先选中前面的rad，再点击确定按钮

                // 接受参数，返回由参数确定内容的函数指针。
                inp.onclick = function (rad, sureBtn) {
                    return function () {
                        // 按下时先选中前面的rad，再点击确定按钮

                        rad.onclick(); // 选中前面的rad
                        sureBtn.onclick(); // 点击确定

                        log("快速选择了" + rad.id);
                    }
                }(rad, sureBtn);

            }
        }
        log("添加了快选按钮");

    }
    //* --------------------------------------------------------------

})();

// 提交按钮逻辑，在原功能的基础上，保存了两种信息 for Ⅱ
function submitClassF (resubChk, frmRptWindow, oTable, leixing) {
    return function () {

        if (!oTable) {
            oTable = document.getElementById("oTable");
            leixing = parent.document.querySelector("." + CHK_CLASS).getAttribute("leixing");
        }
        
        //* 存课程前面复选框(chkKC#)的checked、input(课程代号，hidden，chkSKBJ#, 如E6T0001160K000568-016B）input（老师名字 chkSKBJstr#）的value信息到JSON，key是元素的id
        //* 这些就是选老师之后有变化的内容
        //* 注意只存新选了老师的那一行的信息（已经选上了的就不存了）
        saveTeacherInfos(oTable, leixing);

        frmRptWindow.document.all.Submit.onclick();

        resubChk.checked = false;

        log("点击提交" + leixing + "_本次选课信息。");

    };

}

//* 先用上次提交时oTable的信息覆盖当前oTable的信息（修改innerHTML），再调用提交按钮的onclick函数
function resubmitClassF (resubChk, frmRptWindow, leixing) {
    return function () {

        //! 已经在点击复选框的时候加载过了
        //! loadLastTeacherInfos(oTable, leixing);

        frmRptWindow.document.all.Submit.onclick();

        resubChk.checked = false;
        
        if (!leixing) {
            leixing = parent.document.querySelector("." + CHK_CLASS).getAttribute("leixing");
        }

        log("点击提交" + leixing + "_上次选课信息。");

    }
}

//* 存课程前面复选框(chkKC#)的checked、input(课程代号，hidden，chkSKBJ#, 如E6T0001160K000568-016B）input（老师名字 chkSKBJstr#）的value信息到JSON，key是元素的id
//* 注意只存新选了老师的那一行的信息（已经选上了的就不存了）
function saveTeacherInfos (oTable, leixing) {

    if (!oTable) {
        oTable = document.getElementById("oTable");
        leixing = parent.document.querySelector("." + CHK_CLASS).getAttribute("leixing");
    }
    
    const chkKCs = oTable.querySelectorAll("input[type='checkbox']");
    //* 注意，既包含hidden的chkSKBJ（偶数下标），也包含老师名字文本框chkSKBJstr（奇数下标）
    const chkSKBJs = oTable.querySelectorAll("input[name*='chkSKBJ']");

    var tmpIndexes = []; // 记录新选了老师的那一行的index
    for (let i = 0; i < chkKCs.length; i++) {
        if (!chkKCs[i].disabled && chkKCs[i].checked)
            tmpIndexes.push(i);
    }

    if (tmpIndexes.length){
        var tmp = {}; // 要存储的JSON：chkKC1: true, ...
        for (const index of tmpIndexes) {
            tmp[chkKCs[index].id] = chkKCs[index].checked;
            tmp[chkSKBJs[index * 2].id] = chkSKBJs[index * 2].value; // hidden
            tmp[chkSKBJs[index * 2 + 1].id] = chkSKBJs[index * 2 + 1].value; // chkSKBJstr文本框
        }


        GM_setValue(Last_Submit_DOM_Storage_Key[leixing],
            JSON.stringify(tmp));

        log("成功保存" + leixing + "_信息");
    }
}

//* 从GM存储里加载上次新选的课程信息（包括课程前面复选框(chkKC#)的checked、input(课程代号，hidden，chkSKBJ#, 如E6T0001160K000568-016B）input（老师名字 chkSKBJstr#）的value信息）
//* 注意只读取新选了老师的那一行的信息（已经选上了的就不读了）
function loadLastTeacherInfos (oTable, leixing) {

        if (!oTable)
            oTable = document.getElementById("oTable");
        if (!oTable) {
            alert("未能读取oTable，重试功能不可用！");
            return;
        }

        var tmp = JSON.parse(GM_getValue(Last_Submit_DOM_Storage_Key[leixing]));
        var chkKCs = oTable.querySelectorAll("input[type='checkbox']");

        for (let i = 0; i < chkKCs.length; i++) {
            if (tmp[chkKCs[i].id])
                chkKCs[i].checked = tmp[chkKCs[i].id];
        }
        //* 注意，既包含hidden的chkSKBJ（偶数下标），也包含老师名字文本框chkSKBJstr（奇数下标）
        const chkSKBJs = oTable.querySelectorAll("input[name*='chkSKBJ']");

        for (let i = 0; i < chkSKBJs.length; i++) {
            if (tmp[chkSKBJs[i].id])
                chkSKBJs[i].value = tmp[chkSKBJs[i].id]; // 两种input都是修改value
        }
        log("成功加载" + leixing + "_信息");
        
}

// 清空新选的课程信息（只包括课程前面复选框的checked和input（老师名字）的value）
function clearLoadedTeacherInfos (oTable, leixing) {

    if (!oTable) {
        oTable = document.getElementById("oTable");
        leixing = parent.document.querySelector("." + CHK_CLASS).getAttribute("leixing");
    }

    var tmp = JSON.parse(GM_getValue(Last_Submit_DOM_Storage_Key[leixing]));
    var chkKCs = oTable.querySelectorAll("input[type='checkbox']");

    for (let i = 0; i < chkKCs.length; i++) {
        if (tmp[chkKCs[i].id])
            chkKCs[i].checked = false;
    }

    //* 注意，既包含hidden的chkSKBJ（偶数下标），也包含老师名字文本框chkSKBJstr（奇数下标）
    const chkSKBJs = oTable.querySelectorAll("input[name*='chkSKBJ']");

    for (let i = 0; i < chkSKBJs.length; i++) {
        if (tmp[chkSKBJs[i].id])
            chkSKBJs[i].value = ""; // 两种input都是修改value
    }
    
    log("成功清除" + leixing + "_信息");
}


//* IV. 自动点击检索按钮 ----------------------------
window.onload = function () {
    //* class为button, value为检索
    if (Auto_Click_Search.enabled && name == 'frmMain') {
        var leixing = null; // 是哪个类型的页面：xk, ts, yy, fx
        switch (self.location.pathname) {
            case "/wsxk/stu_btx.aspx": // 专业课
                leixing = "xk";
                break;
            case "/wsxk/stu_whszk.aspx": // 英语
                leixing = "ts";
                break;
            case "/wsxk/stu_yytgk_bx.aspx": // 通识
                leixing = "yy";
                break;
            case "/wsxk/stu_ggrxk.aspx": // 非限
                leixing = "fx";
                break;
            default:
                break;
        }
        if (leixing) {
            var searchBtn = null;
            for (const btn of document.querySelectorAll(".button")) {
                if (btn.value == "检索") {
                    searchBtn = btn;
                    log("已获取检索按钮");
                    break;
                }
            }
            if (searchBtn) {
                searchBtn.click(); // 模拟点击按钮
                log("已点击检索按钮");
            } else {
                error("未找到检索按钮");
            }
        }
    }
};
//* --------------------------------------------------------------

function insertBefore (newElem, targetElem) {
    var parent = targetElem.parentNode;
    parent.insertBefore(newElem, targetElem);

}

function insertAfter (newElem, targetElem) {

    var parent = targetElem.parentNode;
    if (parent.lastChild == targetElem) {
        // 如果最后的节点是目标元素，则直接添加。因为默认是最后
        parent.appendChild(newElem);
    } else {
        //如果不是，则插入在目标元素的下一个兄弟节点 的前面。也就是目标元素的后面
        parent.insertBefore(newElem, targetElem.nextSibling);
    }
}

// 更新至新版本时需要清空 重试上次提交相关的storage，以使复选框正常使用
function resetGMStorage () {
    if (GM_getValue("version") != version) {
        clearResubmitStorage();
        GM_setValue("version", version);
    }
}