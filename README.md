# 数学与科学教学静态题库站点

一个用于数学和科学教学的纯静态网页小项目，适合部署在 GitHub Pages 或本地浏览器中直接打开使用。  
目前已扩展十余个经典题目，涵盖平均数、分数、周长面积、滑梯角度、杠杆、水循环、磁铁实验等常见知识点。

## 目录结构

```text
.
├── index.html              # 题目列表页（项目首页）
├── assets/
│   ├── css/
│   │   ├── main.css        # 列表页通用样式
│   │   └── pigeonhole.css  # 题目详情页（鸽巢 / 勾股 / 滑梯角度）通用样式
│   └── js/
│       ├── pigeonhole.js       # 鸽巢问题的交互脚本
│       ├── slide-angle.js      # 角度与滑滑梯安全性的交互脚本
│       └── topic-animations.js # 详情页通用动画脚本（跳绳平均、披萨分数等）
└── topics/
    ├── pigeonhole.html     # 鸽巢问题交互式练习详情页
    ├── pythagoras.html     # 勾股定理应用详情页
    ├── slide-angle.html    # 角度与滑滑梯安全性交互详情页
    ├── average-jump.html   # 平均数跳绳动画
    ├── fractions-pizza.html # 分数披萨示例
    ├── rectangle-area.html # 草坪周长面积互动
    ├── lever-balance.html  # 杠杆平衡动画
    ├── water-cycle.html    # 水循环迷你实验
    ├── multiplication-arrays.html # 乘法阵列
    ├── fraction-addition.html     # 分数加法
    ├── time-conversion.html       # 时间换算
    ├── magnet-experiment.html     # 磁铁实验
    └── plant-transpiration.html   # 植物蒸腾
```

## 本地使用方式

- 直接在浏览器中打开 `index.html` 即可查看题目列表并跳转到各详情页；
- 所有链接均使用相对路径，因此无需任何后端或构建步骤。

## 部署到 GitHub Pages

1. 创建一个 GitHub 仓库，将以上所有文件推送到仓库根目录；
2. 在仓库的 **Settings → Pages** 中，将源设置为 `main` 分支的 `/ (root)` 路径；
3. 保存后，稍等片刻即可通过 GitHub Pages 提供的链接访问站点；
4. 访问站点首页时会自动打开仓库根目录下的 `index.html`。

## 如何新增一个教学题目

推荐遵循以下步骤：

1. **复制详情页模板**
   - 在 `topics/` 目录中复制一个现有详情页文件，例如：
     - 复制 `topics/pythagoras.html` 为 `topics/new-topic.html`。
2. **编辑新详情页内容**
   - 修改 `<title>` 与页面头部 `<h1>`；
   - 更新各个 `<section>` 中的内容，如：
     - 题目描述；
     - 相关原理讲解；
     - 示例分析 / 解题步骤；
     - 拓展练习或思考题。
3. **在列表页中挂接新题目**
   - 打开根目录下的 `index.html`；
   - 在 `<div class="problem-list">` 中新增一个 `<article class="problem-card">`；
   - 设置：
     - 题目名称；
     - 分类标签（数学/科学），使用 `problem-tag math` 或 `problem-tag science`；
     - 简短描述；
     - 将卡片中的链接 `href` 指向新建的详情页，如 `href="topics/new-topic.html"`。
4. **本地检查**
   - 本地用浏览器打开 `index.html`，确认能从列表页进入新题目，并能通过详情页顶部的“返回题目列表”回到首页。

## 自定义样式与脚本

- 列表页样式集中在 `assets/css/main.css` 中；
- 题目详情页（当前的鸽巢问题与勾股定理页面）共用 `assets/css/pigeonhole.css`；
- 鸽巢问题的交互逻辑在 `assets/js/pigeonhole.js` 中，如需为其他题目增加交互，可以：
  - 新建脚本文件，例如 `assets/js/your-topic.js`；
  - 在对应的 `topics/your-topic.html` 中通过 `<script src="../assets/js/your-topic.js"></script>` 引入。

欢迎根据课程需要继续扩展新的数学和科学教学题目。
