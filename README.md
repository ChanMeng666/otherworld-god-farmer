# 异界神农：从零开始的悠闲田园
# Otherworld God-Farmer: A Leisurely Garden from Scratch

一款2D像素风格的种田、建造、社交模拟游戏。玩家扮演一位拥有"万能农具"神器的异世界来客，在一片荒地上从零开始创造理想村庄。

## 技术栈

- **前端框架:** Angular 19
- **渲染引擎:** Pixi.js 8+
- **编程语言:** TypeScript 5+
- **后端:** Node.js (Express.js)
- **样式:** SCSS

## 项目结构

```
otherworld-god-farmer/
├── src/                    # Angular前端源码
│   ├── app/
│   │   ├── components/     # UI组件
│   │   ├── game/          # 游戏核心组件
│   │   ├── models/        # 数据模型
│   │   └── services/      # 业务服务
│   └── ...
├── server/                # Node.js后端
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── models/        # 数据模型
│   │   └── config/        # 配置文件
│   └── ...
└── package.json

```

## 快速开始

### 前端开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端将运行在 http://localhost:4200

### 后端开发

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

后端API将运行在 http://localhost:3000

## 游戏操作

- **移动:** 使用方向键或 WASD 键控制角色移动
- **工具切换:** 数字键 1-6 切换不同工具
- **使用工具:** 空格键或鼠标左键使用当前工具

## 开发里程碑

- [x] M1: 核心玩法原型 - 基础移动和渲染系统
- [ ] M2: 完整农业循环 - 种植和收获系统
- [ ] M3: 建设与扩展 - 建筑系统
- [ ] M4: 鲜活的世界 - NPC和社交系统
- [ ] M5: 后端与持久化 - 存档系统
- [ ] M6: 打磨与优化 - 音效和性能优化

## 当前实现功能

- ✅ Angular 19 + Pixi.js 8 集成
- ✅ 基础游戏画布渲染
- ✅ 玩家角色移动控制
- ✅ 时间系统（游戏内时钟）
- ✅ HUD显示（时间、体力）
- ✅ 游戏状态管理服务
- ✅ 后端API框架（存档/读档）

## 许可证

MIT