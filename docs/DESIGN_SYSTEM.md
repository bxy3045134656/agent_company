# 🎨 Agent Company - 设计系统文档

**版本**: v1.0  
**日期**: 2026-03-11  
**设计师**: 小前端 🎨  
**项目**: Agent Company - 自动化 AI 公司

---

## 🎯 设计理念

### 品牌价值观

**专业 (Professional)**
- 清晰的信息层级
- 一致的设计语言
- 可靠的数据展示

**高效 (Efficient)**
- 减少操作步骤
- 快捷的功能入口
- 智能的默认配置

**友好 (Friendly)**
- 温暖的色彩搭配
- 清晰的文字提示
- 流畅的交互动画

---

## 🌈 颜色系统

### 主色调

```
┌─────────────────────────────────────┐
│  Primary - 靛蓝色 (专业、可靠)      │
│                                     │
│  ██████████ #4F46E5  (主色)        │
│  ██████████ #818CF8  (浅色)        │
│  ██████████ #3730A3  (深色)        │
│  ██████████ #EEF2FF  (背景)        │
└─────────────────────────────────────┘
```

**使用场景**:
- 主按钮
- 链接文字
- 选中状态
- 品牌标识

---

### 功能色

```
┌─────────────────────────────────────┐
│  Success - 绿色 (成功、完成)        │
│  ██████████ #10B981                 │
│  ██████████ #34D399  (浅)           │
│  ██████████ #059669  (深)           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Warning - 橙色 (警告、注意)        │
│  ██████████ #F59E0B                 │
│  ██████████ #FBBF24  (浅)           │
│  ██████████ #D97706  (深)           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Danger - 红色 (错误、危险)         │
│  ██████████ #EF4444                 │
│  ██████████ #F87171  (浅)           │
│  ██████████ #DC2626  (深)           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Info - 蓝色 (信息、提示)           │
│  ██████████ #3B82F6                 │
│  ██████████ #60A5FA  (浅)           │
│  ██████████ #2563EB  (深)           │
└─────────────────────────────────────┘
```

**使用场景**:
- Success: 成功提示、完成状态、正向数据
- Warning: 警告提示、待处理、注意项
- Danger: 错误提示、删除操作、负向数据
- Info: 信息提示、帮助文本、链接

---

### 中性色

```
┌─────────────────────────────────────┐
│  文字颜色                           │
│  ██████████ #111827  (主要文字)    │
│  ██████████ #374151  (次要文字)    │
│  ██████████ #6B7280  (辅助文字)    │
│  ██████████ #9CA3AF  (禁用文字)    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  背景颜色                           │
│  ██████████ #FFFFFF  (卡片背景)    │
│  ██████████ #F9FAFB  (页面背景)    │
│  ██████████ #F3F4F6  (分组背景)    │
│  ██████████ #E5E7EB  (分割线)      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  边框颜色                           │
│  ██████████ #E5E7EB  (默认边框)    │
│  ██████████ #D1D5DB  (悬停边框)    │
│  ██████████ #9CA3AF  (焦点边框)    │
└─────────────────────────────────────┘
```

---

## 📐 间距系统

### 基础单位

**4px 网格系统**
```
所有间距都是 4 的倍数，确保视觉一致性
```

### 间距等级

```
┌─────────────────────────────────────┐
│  XS   -   4px   (紧凑间距)          │
│  SM   -   8px   (小组件间距)        │
│  MD   -  16px   (标准间距)          │
│  LG   -  24px   (大间距)            │
│  XL   -  32px   (分组间距)          │
│  2XL  -  48px   (区块间距)          │
│  3XL  -  64px   (页面间距)          │
└─────────────────────────────────────┘
```

**使用场景**:
```
组件内部：XS (4px) - SM (8px)
组件之间：MD (16px) - LG (24px)
模块之间：XL (32px) - 2XL (48px)
页面布局：3XL (64px)
```

---

## 🔤 字体系统

### 字体家族

```
Primary Font:
'Inter', -apple-system, BlinkMacSystemFont, 
'Segoe UI', Roboto, 'Helvetica Neue', Arial, 
sans-serif

Code Font:
'Fira Code', 'Courier New', Courier, monospace
```

### 字体大小

```
┌─────────────────────────────────────┐
│  XS   -  12px  -  辅助文字          │
│  SM   -  14px  -  次要文字          │
│  BASE -  16px  -  正文              │
│  LG   -  18px  -  小标题            │
│  XL   -  20px  -  中标题            │
│  2XL  -  24px  -  大标题            │
│  3XL  -  30px  -  超大标题          │
│  4XL  -  36px  -  页面标题          │
└─────────────────────────────────────┘
```

### 字重

```
┌─────────────────────────────────────┐
│  Regular   -  400  -  正文          │
│  Medium    -  500  -  强调文字      │
│  Semibold  -  600  -  小标题        │
│  Bold      -  700  -  大标题        │
└─────────────────────────────────────┘
```

### 行高

```
Tight:   1.25  (标题)
Normal:  1.5   (正文)
Relaxed: 1.75  (长文本)
```

---

## 🔲 圆角系统

```
┌─────────────────────────────────────┐
│  None   -   0px    (无圆角)         │
│  SM     -   4px    (小按钮)         │
│  MD     -   6px    (输入框)         │
│  LG     -   8px    (卡片)           │
│  XL     -  12px    (弹窗)           │
│  2XL    -  16px    (大卡片)         │
│  Full   -  9999px (圆形徽章)        │
└─────────────────────────────────────┘
```

**使用场景**:
- 按钮：SM (4px)
- 输入框：MD (6px)
- 卡片：LG (8px)
- 徽章：Full (圆形)

---

## 🌑 阴影系统

```
┌─────────────────────────────────────┐
│  Shadow XS                          │
│  0 1px 2px 0 rgba(0, 0, 0, 0.05)   │
│  使用：小按钮、徽章                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Shadow SM                          │
│  0 1px 3px 0 rgba(0, 0, 0, 0.1),   │
│  0 1px 2px 0 rgba(0, 0, 0, 0.06)   │
│  使用：卡片、下拉菜单              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Shadow MD                          │
│  0 4px 6px -1px rgba(0, 0, 0, 0.1),│
│  0 2px 4px -1px rgba(0, 0, 0, 0.06)│
│  使用：弹窗、悬浮卡片              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Shadow LG                          │
│  0 10px 15px -3px rgba(0, 0, 0, 0.1),│
│  0 4px 6px -2px rgba(0, 0, 0, 0.05) │
│  使用：大弹窗、模态框              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Shadow XL                          │
│  0 20px 25px -5px rgba(0, 0, 0, 0.1),│
│  0 10px 10px -5px rgba(0, 0, 0, 0.04│
│  使用：全屏弹窗                     │
└─────────────────────────────────────┘
```

---

## 🧩 组件库

### 按钮 (Button)

#### Primary Button
```css
background-color: #4F46E5;
color: #FFFFFF;
padding: 10px 20px;
border-radius: 6px;
font-size: 14px;
font-weight: 500;
height: 40px;

/* Hover */
background-color: #4338CA;

/* Active */
background-color: #3730A3;

/* Disabled */
background-color: #9CA3AF;
cursor: not-allowed;
```

#### Secondary Button
```css
background-color: #FFFFFF;
color: #4F46E5;
border: 1px solid #4F46E5;
padding: 10px 20px;
border-radius: 6px;
font-size: 14px;
font-weight: 500;
height: 40px;

/* Hover */
background-color: #EEF2FF;
```

#### Danger Button
```css
background-color: #EF4444;
color: #FFFFFF;
padding: 10px 20px;
border-radius: 6px;
font-size: 14px;
font-weight: 500;
height: 40px;

/* Hover */
background-color: #DC2626;
```

#### Ghost Button
```css
background-color: transparent;
color: #6B7280;
padding: 10px 20px;
border-radius: 6px;
font-size: 14px;
font-weight: 500;
height: 40px;

/* Hover */
background-color: #F3F4F6;
color: #111827;
```

---

### 输入框 (Input)

#### Text Input
```css
height: 40px;
padding: 8px 12px;
border: 1px solid #E5E7EB;
border-radius: 6px;
font-size: 14px;
color: #111827;
background-color: #FFFFFF;

/* Focus */
border-color: #4F46E5;
box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);

/* Error */
border-color: #EF4444;

/* Disabled */
background-color: #F3F4F6;
color: #9CA3AF;
cursor: not-allowed;
```

#### Textarea
```css
min-height: 120px;
padding: 12px;
border: 1px solid #E5E7EB;
border-radius: 6px;
font-size: 14px;
color: #111827;
background-color: #FFFFFF;
resize: vertical;
```

#### Select
```css
height: 40px;
padding: 8px 36px 8px 12px;
border: 1px solid #E5E7EB;
border-radius: 6px;
font-size: 14px;
color: #111827;
background-color: #FFFFFF;
background-image: url('dropdown-arrow.svg');
background-repeat: no-repeat;
background-position: right 12px center;
```

---

### 卡片 (Card)

#### Standard Card
```css
background-color: #FFFFFF;
border-radius: 8px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
border: 1px solid #E5E7EB;
padding: 16px;
```

#### Interactive Card
```css
background-color: #FFFFFF;
border-radius: 8px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
border: 1px solid #E5E7EB;
padding: 16px;
cursor: pointer;
transition: all 0.2s;

/* Hover */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
transform: translateY(-2px);

/* Selected */
border-color: #4F46E5;
background-color: #EEF2FF;
```

---

### 徽章 (Badge)

#### Success Badge
```css
background-color: #D1FAE5;
color: #065F46;
padding: 4px 12px;
border-radius: 9999px;
font-size: 12px;
font-weight: 500;
display: inline-flex;
align-items: center;
gap: 4px;
```

#### Warning Badge
```css
background-color: #FEF3C7;
color: #92400E;
padding: 4px 12px;
border-radius: 9999px;
font-size: 12px;
font-weight: 500;
```

#### Danger Badge
```css
background-color: #FEE2E2;
color: #991B1B;
padding: 4px 12px;
border-radius: 9999px;
font-size: 12px;
font-weight: 500;
```

#### Info Badge
```css
background-color: #DBEAFE;
color: #1E40AF;
padding: 4px 12px;
border-radius: 9999px;
font-size: 12px;
font-weight: 500;
```

---

### 提示框 (Alert)

#### Success Alert
```css
background-color: #D1FAE5;
border-left: 4px solid #10B981;
padding: 12px 16px;
border-radius: 6px;
color: #065F46;
display: flex;
align-items: flex-start;
gap: 12px;
```

#### Warning Alert
```css
background-color: #FEF3C7;
border-left: 4px solid #F59E0B;
padding: 12px 16px;
border-radius: 6px;
color: #92400E;
```

#### Danger Alert
```css
background-color: #FEE2E2;
border-left: 4px solid #EF4444;
padding: 12px 16px;
border-radius: 6px;
color: #991B1B;
```

#### Info Alert
```css
background-color: #DBEAFE;
border-left: 4px solid #3B82F6;
padding: 12px 16px;
border-radius: 6px;
color: #1E40AF;
```

---

### 加载状态 (Loading)

#### Spinner
```css
width: 24px;
height: 24px;
border: 3px solid #E5E7EB;
border-top-color: #4F46E5;
border-radius: 50%;
animation: spin 1s linear infinite;

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### Skeleton
```css
background: linear-gradient(
  90deg,
  #F3F4F6 25%,
  #E5E7EB 50%,
  #F3F4F6 75%
);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 📱 响应式设计

### 断点

```
┌─────────────────────────────────────┐
│  Mobile     -  320px  -  640px     │
│  Tablet     -  641px  -  1024px    │
│  Desktop    -  1025px -  1440px    │
│  Large      -  1441px+             │
└─────────────────────────────────────┘
```

### 布局规则

#### Mobile (320px - 640px)
- 侧边栏：隐藏（汉堡菜单）
- 主内容：100%
- 卡片布局：单列
- 字体：适当缩小

#### Tablet (641px - 1024px)
- 侧边栏：折叠（图标）
- 主内容：100%
- 卡片布局：双列
- 字体：标准

#### Desktop (1025px - 1440px)
- 侧边栏：展开（240px）
- 主内容：calc(100% - 240px)
- 卡片布局：三列
- 字体：标准

#### Large (1441px+)
- 侧边栏：展开（280px）
- 主内容：calc(100% - 280px)
- 卡片布局：四列
- 字体：适当放大

---

## 🎬 交互动画

### 过渡效果

```css
/* 标准过渡 */
transition: all 0.2s ease-in-out;

/* 快速过渡 */
transition: all 0.15s ease;

/* 慢速过渡 */
transition: all 0.3s ease;
```

### 常用动画

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Scale In
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 📊 数据可视化

### 图表颜色

```
主色：#4F46E5
成功：#10B981
警告：#F59E0B
危险：#EF4444
信息：#3B82F6
辅助：#8B5CF6
粉色：#EC4899
青色：#14B8A6
```

### 图表样式

- 圆角：4px
- 线条宽度：2px
- 网格线：#E5E7EB
- 文字颜色：#6B7280

---

## ♿ 无障碍设计

### 颜色对比度

- 正文文字：至少 4.5:1
- 大标题：至少 3:1
- 图标：至少 3:1

### 键盘导航

- Tab 键顺序清晰
- 焦点状态明显
- 支持快捷键

### 屏幕阅读器

- 所有图标有文字说明
- 表单有标签
- 错误有提示

---

## 📝 使用示例

### 按钮组合

```html
<!-- 主要操作 -->
<button class="btn-primary">保存</button>

<!-- 次要操作 -->
<button class="btn-secondary">取消</button>

<!-- 危险操作 -->
<button class="btn-danger">删除</button>
```

### 表单组合

```html
<!-- 标准表单 -->
<div class="form-group">
  <label>邮箱</label>
  <input type="email" placeholder="name@company.com" />
</div>

<!-- 错误状态 -->
<div class="form-group error">
  <label>邮箱</label>
  <input type="email" value="invalid" />
  <span class="error-message">邮箱格式不正确</span>
</div>
```

### 卡片组合

```html
<!-- 数据卡片 -->
<div class="card">
  <div class="card-header">
    <h3>今日执行</h3>
    <span class="badge success">+12%</span>
  </div>
  <div class="card-body">
    <div class="stat-number">1,234</div>
    <div class="stat-desc">较昨日增加 132 次</div>
  </div>
</div>
```

---

## 🔗 设计资源

### Figma 文件
- 组件库：[链接]
- 页面模板：[链接]
- 图标库：[链接]

### 代码实现
- React 组件库：[链接]
- CSS 变量：[链接]
- Storybook: [链接]

---

## ✅ 检查清单

### 设计一致性
- [ ] 使用统一的颜色系统
- [ ] 使用统一的间距系统
- [ ] 使用统一的字体系统
- [ ] 组件样式一致

### 可用性
- [ ] 颜色对比度达标
- [ ] 焦点状态清晰
- [ ] 错误提示明确
- [ ] 加载状态友好

### 响应式
- [ ] 移动端适配
- [ ] 平板适配
- [ ] 桌面适配
- [ ] 大屏适配

### 性能
- [ ] 动画流畅（60fps）
- [ ] 图片优化
- [ ] 按需加载
- [ ] 缓存策略

---

*持续更新中...*
