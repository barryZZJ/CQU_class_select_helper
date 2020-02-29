<!-- 空格 &nbsp; -->
# 重庆大学抢课微辅助
方便抢课的微辅助功能，油猴脚本。
[Greasy Fork安装地址](https://greasyfork.org/zh-CN/scripts/397063-%E9%87%8D%E5%BA%86%E5%A4%A7%E5%AD%A6%E6%8A%A2%E8%AF%BE%E5%BE%AE%E8%BE%85%E5%8A%A9)

有建议可以Issue，不定期更新新功能。

# 目前功能：
+ `I.` 删除提交时的确认提示; 
<br>

+ `II.` 添加"重复上次提交"按钮，因延迟提交失败时可以直接重复上次提交的内容（可跨网页、跨域名共用，支持的网址见 `@match`）; 
<br>

  ![重复上次提交](readmepics/II.jpg#pic_center)
<br>

+ `III.` 弹出选老师窗口中添加"快速选择"按钮，一键选择老师; 
<br>

  ![一键选择老师](readmepics/III.jpg#pic_center)

<br>

+ `IV.` 进入选课页面后自动点击检索按钮;

<!-- + `V.` 点击检索按钮时自动输入验证码; -->

# 更新日志 
<!-- > v1.2 &nbsp; 2020.2.?

- 添加功能 `V.` 点击检索按钮时自动输入验证码 (TODO)

  感谢OCR开源库[https://github.com/naptha/tesseract.js#tesseractjs](https://github.com/naptha/tesseract.js#tesseractjs)
-->

> v1.2.1 &nbsp; 2020.2.29

- 添加了namespace、updateURL、favicon等细节，上传了Greasy Fork。

> v1.2 &nbsp; 2020.2.28

- 在油猴插件下拉菜单里添加各个功能的开关 

![下拉菜单](readmepics/menu.jpg#pic_center)

- 改了一个不知道严不严重的bug，就是调用当前窗口时应该使用self而不是this。

<!-- - [deprecated] 显示上次提交的记录作为提示 -->

> v1.1 &nbsp; 2020.2.25 

- 修改 `II.`，把信息存储从localStorage变为GM storage，由此增加了跨网页、跨域名共享。

- 重新整了一下debug模式控制台的记录

> v1.0 &nbsp; 2020.2.24

初次提交
