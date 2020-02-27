// ==UserScript==
// @name         CQU copy class
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  可以复制现有的老师，粘贴到其他地方并选择
// @author       ZZJ
// @match        *://202.202.1.41/wsxk/stu_xszx_skbj.aspx*
// @match        *://jxgl.cqu.edu.cn/wsxk/stu_xszx_skbj.aspx*
// @match        *://222.198.128.12//wsxk/stu_xszx_skbj.aspx*
// @match        *://202.202.1.176/wsxk/stu_xszx_skbj.aspx*
// @grant        none
// ==/UserScript==

const STORAGE_NAME = "teacherRow";
const SCRIPT_HEADER = "CQU copy class: ";
var trs; //爬下来的tr
var rows = []; //多行tr组成一个老师的row

(function() {

    console.log(SCRIPT_HEADER + "已加载。");

    trs = document.getElementsByClassName("B"); 
    
    // 添加复制按钮 ----------------------------------
    //* 添加位置：先把同一个老师的tr打包成一个row，然后在每个row的第一个tr的第一个td(上课班组)里插入按钮
     // 数组，存一个老师对应的一个或多个tr
    var rads = document.querySelectorAll("[type='radio']");

    var j = 0;
    for (let i = 1; i <= rads.length; i++) {
        let row = [];
        // while 当前tr不包含下一个按钮，或遇到最后一个按钮后剩下的所有行
        while (j < trs.length){
            // debugger;
            if (i == rads.length || i < rads.length && rads[i].parentElement.parentElement != trs[j]) {
                row.push(trs[j]);
                j++;
            }else
                break;
        }
        rows.push(row);
    }
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // row[0]一定是最长的那一行tr
        const td1 = row[0].firstElementChild;

        td1.setAttribute("align", "center");
        if (td1.hasChildNodes()){
            td1.lastChild.replaceWith(newCopyButton(i));
        }else{
            td1.appendChild(newCopyButton(i));
        }
    }
    // 添加粘贴按钮 ---------------------------------------------
    //* 添加位置：最后一个tr之后，或id为hid_skfs的input标签之前
    insertAfter(newPasteButton(), trs[trs.length-1]);
    
}) ();

function newPasteButton() {
    var btn = document.createElement("input");
    btn.setAttribute("class", "button");
    btn.setAttribute("type", "button");

    btn.setAttribute("value", "粘贴");

    //* rID: radio应该改成的id，与tr的角标对应，新插入的rId应为已有的tr最大角标+1，即length
    //* 粘贴后删除这个按钮
    btn.onclick = function(){ pasteRow(trs.length, btn); };

    return btn;
}

function newCopyButton(rowIndex) {

    var btn = document.createElement("input");
    btn.setAttribute("class", "button");
    btn.setAttribute("type", "button");
    
    btn.setAttribute("value", "复制");
    btn.setAttribute("index", rowIndex);
    
    btn.onclick = function(){ if (copyRow(rowIndex)) changeBtnText(btn, "√");};

    return btn;
}

function insertBefore(newElem, targetElem) {
    var parent = targetElem.parentNode;
    parent.insertBefore(newElem, targetElem);
    
}

function insertAfter(newElem, targetElem){

    var parent = targetElem.parentNode;
    if (parent.lastChild == targetElem) {
        // 如果最后的节点是目标元素，则直接添加。因为默认是最后
        parent.appendChild(newElem);
    } else {
        //如果不是，则插入在目标元素的下一个兄弟节点 的前面。也就是目标元素的后面
        parent.insertBefore(newElem, targetElem.nextSibling);
    }
}

function pasteRow(rId, obj) {
    //* rID: radio应该改成的id，与tr的角标对应
    //* obj: 传进来的是粘贴按钮，新的一列插在它前面

    var s = localStorage.getItem(STORAGE_NAME);

    if (s == null){
        console.error(SCRIPT_HEADER + "找不到已复制项");
        alert("错误：找不到已复制项！");
        return false;
    }else{
        s = s.replace(/(id *= *"rad_)[0-9]/, "$1" + rId);

        // 在粘贴按钮前生成
        var tmp = document.createElement('br');
        // debugger;
        insertBefore(tmp, obj);
        tmp.outerHTML = s;

        console.log(SCRIPT_HEADER + "已粘贴。");
        return true;
    }


}

function copyRow(rowIndex) {
    try {
        var tmp = "";
        for (const tr of rows[rowIndex]) {
            tmp += tr.outerHTML;
            tmp += "\n";
        }
        
        localStorage.setItem(STORAGE_NAME, tmp);
        
        console.log(SCRIPT_HEADER + "Successfully copied row of " + rows[rowIndex][0].children[1].textContent);

        console.debug(SCRIPT_HEADER + "localStorage." + STORAGE_NAME + " = " + localStorage.getItem(STORAGE_NAME));

        return true;

    } catch (error) {
        console.error(SCRIPT_HEADER + error);
        return false;
    }
}

function changeBtnText(obj, value){
    obj.setAttribute("value", value);
}
