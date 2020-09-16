<!-- 空格 &nbsp; -->
# 重庆大学抢课微辅助 - 大佬们进我GitHub点个star吧

方便抢课的微辅助功能，油猴脚本。

[脚本Greasy Fork安装地址](https://greasyfork.org/zh-CN/scripts/397063-%E9%87%8D%E5%BA%86%E5%A4%A7%E5%AD%A6%E6%8A%A2%E8%AF%BE%E5%BE%AE%E8%BE%85%E5%8A%A9)

[项目GitHub地址](https://github.com/barryZZJ/CQU_class_select_helper)

## 🍥 适配的网址<a id="webs"></a>：
- 外网：[202.202.1.41](http://202.202.1.41)，[jxgl.cqu.edu.cn](http://jxgl.cqu.edu.cn)；
- 内网：[222.198.128.126](http://222.198.128.126)，[202.202.1.176](http://222.198.128.126)。

🍉 有意见或建议可以在Greasy Fork里提交[反馈](https://greasyfork.org/zh-CN/scripts/397063-%E9%87%8D%E5%BA%86%E5%A4%A7%E5%AD%A6%E6%8A%A2%E8%AF%BE%E5%BE%AE%E8%BE%85%E5%8A%A9/feedback)，或者在我GitHub里提交[Issue](https://github.com/barryZZJ/CQU_class_select_helper/issues)，不定期更新新功能。

🎈 各位大佬们觉得好用的话别忘了在我[GitHub](https://github.com/barryZZJ/CQU_class_select_helper)里点个star⭐，还有在Greasy Fork里给个[好评](https://greasyfork.org/zh-CN/scripts/397063-%E9%87%8D%E5%BA%86%E5%A4%A7%E5%AD%A6%E6%8A%A2%E8%AF%BE%E5%BE%AE%E8%BE%85%E5%8A%A9/feedback)👍。

## 功能：

#### 💛 重试上次提交

添加“重试上次提交”复选框。

当发生了提交失败（比如提交完显示Service unavailable）的情况时，勾选上该选项，即可自动选择上次的老师，然后点提交即可。（可在适配的网址内跨网页、跨域名共用）
（不过现在流畅多了这个🐮🍺的功能用不上了）

<center><img src="https://s1.ax1x.com/2020/09/17/w2vOmV.jpg" alt="重试上次提交" title = "重试上次提交" width="75%"></img></center>

<br>

#### 💚 自动检索

进入选课页面后自动点击检索按钮。

<img src="https://s1.ax1x.com/2020/09/17/w2xdcn.jpg" alt="自动检索" title = "自动检索" width="20%"></img>

<br>

#### 🧡 禁用确认提示

点击“提交”时不会弹出确认提示。

<img src="https://s1.ax1x.com/2020/09/17/w2xa1s.jpg" alt="禁用提示" title = "禁用提示" width="50%"></img>

<br>

#### 💙 一键选老师

在弹出的选老师窗口中，点击快选即可一键选择该老师。

<center><img src="https://s1.ax1x.com/2020/06/04/tBvJvn.jpg" alt="一键选择老师" title = "一键选择老师" width="75%"></img></center>

<br>

#### 💜 配置界面

点击油猴插件图标弹出配置界面，单击可以开关各种功能

<center><img src="https://s1.ax1x.com/2020/09/17/w2v5Fg.jpg" alt="各种功能" title = "重复上次提交" width="35%"></img></center>


<!-- + `V.` 点击检索按钮时自动输入验证码; -->

## 更新日志 
<!-- > v1.2 &nbsp; 2020.2.?

- 添加功能 `V.` 点击检索按钮时自动输入验证码 (TODO)

  感谢OCR开源库[https://github.com/naptha/tesseract.js#tesseractjs](https://github.com/naptha/tesseract.js#tesseractjs)
-->

> v1.3.0 &nbsp; 2020.9.17

今天花了一天大改了一下”重试上次提交“功能。

1. 把以前的按钮式改成了复选框。防止误触导致已经选上的课又被自己挤掉。

2. 新增了预览功能。选中复选框之后可以预览上一次的选项了。
3. 新增了一些判断逻辑，能保证选成功之后不能再点击”重试上次提交“

4.  扩大使用范围，不用点检索就可以直接重试上次提交

此外看着以前的代码惨不忍睹，稍微修改了一下，也同时修改了readme的内容，看起来更美观。

> v1.2.4 &nbsp; 2020.6.4

稍微改了一下readme。

今天选课，多了11个下载量有点牛的，平时每天也就三四个。我自己用了下害挺好用👏。

> v1.2.3 &nbsp; 2020.3.7

- 添加了GPL许可协议。

> v1.2.2 &nbsp; 2020.3.7

- 因为GitHub更名更新了namespace的网址。

> v1.2.1 &nbsp; 2020.2.29

- 添加了namespace、updateURL、favicon等细节，上传了Greasy Fork。

> v1.2 &nbsp; 2020.2.28

- 在油猴插件下拉菜单里添加各个功能的开关 

- 改了一个不知道严不严重的bug，就是调用当前窗口时应该使用self而不是this。

<!-- - [deprecated] 显示上次提交的记录作为提示 -->

> v1.1 &nbsp; 2020.2.25 

- 修改 `II.`，把信息存储从localStorage变为GM storage，由此增加了跨网页、跨域名共享。

- 重新整了一下debug模式控制台的记录

> v1.0 &nbsp; 2020.2.24

初次提交
