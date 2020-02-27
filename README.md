<!-- 空格 &nbsp; -->
# 重大抢课微辅助
方便抢课的微辅助功能，油猴脚本。

可能会更新新功能。

# 目前功能：
+ `I.` 删除提交时的确认提示; 
<br>

+ `II.` 添加"重复上次提交"按钮，因延迟提交失败时可以直接重复上次提交的内容（可跨网页、跨域名共用，支持的网址见 `@match`）; 
<br>

  ![重复上次提交](readmepics/II.jpg#pic_center)
<br>

+ `III.` 弹出选老师窗口中添加"快速选择"按钮，一键选择，自动点击确定; 
<br>

  ![快速选择](readmepics/III.jpg#pic_center)

<br>

+ `IV.` 选择选课页面后自动点击检索按钮;

<!-- + `V.` 点击检索按钮时自动输入验证码; -->

# 更新日志 
<!-- > v1.2 &nbsp; 2020.2.?

- 添加功能 `V.` 点击检索按钮时自动输入验证码 (TODO)

  感谢OCR开源库[https://github.com/naptha/tesseract.js#tesseractjs](https://github.com/naptha/tesseract.js#tesseractjs)

- 添加插件下拉菜单开关 (在油猴插件图标那里) -->

> v1.1 &nbsp; 2020.2.25 

- 修改 `II.`，把信息存储从localStorage变为GM storage，由此增加了跨网页、跨域名共享。

- 重新整了一下debug模式控制台的记录

> v1.0 &nbsp; 2020.2.24

初次提交
