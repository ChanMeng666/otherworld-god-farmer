import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="help-toggle" (click)="toggleHelp()">
      <span>❓</span>
    </div>

    <div class="help-panel" *ngIf="isVisible">
      <div class="help-header">
        <h3>🎮 游戏操作指南</h3>
        <button class="close-btn" (click)="toggleHelp()">✕</button>
      </div>

      <div class="help-content">
        <div class="help-section">
          <h4>🖱️ 鼠标操作</h4>
          <ul>
            <li><strong>左键点击空地</strong>：移动到该位置</li>
            <li><strong>左键点击相邻地块</strong>：智能操作
              <ul>
                <li>🌱 草地 → 自动耕地</li>
                <li>🟫 耕地 → 打开种子选择</li>
                <li>💧 干燥作物 → 自动浇水</li>
                <li>🌾 成熟作物 → 自动收获</li>
              </ul>
            </li>
            <li><strong>右键点击</strong>：显示操作菜单</li>
          </ul>
        </div>

        <div class="help-section">
          <h4>⌨️ 键盘操作</h4>
          <ul>
            <li><strong>WASD/方向键</strong>：移动角色</li>
            <li><strong>空格键</strong>：使用当前工具</li>
            <li><strong>E键</strong>：种植/收获</li>
          </ul>
        </div>

        <div class="help-section">
          <h4>🌾 种植流程</h4>
          <ol>
            <li>点击草地耕地（变成🟫）</li>
            <li>点击耕地，选择种子种植</li>
            <li>点击作物浇水（💧）</li>
            <li>等待作物生长（需要每天浇水）</li>
            <li>作物成熟后点击收获</li>
          </ol>
        </div>

        <div class="help-section">
          <h4>🎒 界面说明</h4>
          <ul>
            <li><strong>右侧🎒按钮</strong>：打开背包</li>
            <li><strong>底部工具栏</strong>：点击展开/收起</li>
            <li><strong>右上角</strong>：时间、季节、体力显示</li>
          </ul>
        </div>

        <div class="help-section tip">
          💡 <strong>提示</strong>：作物需要浇水才能生长，每天早晨检查你的农田！
        </div>

        <div class="help-section developer-section">
          <div class="dev-header">
            <img src="/chan_logo.svg" alt="Chan Meng Logo" class="dev-logo-small">
            <div class="dev-info">
              <h4>👨‍💻 开发者：Chan Meng</h4>
              <p class="dev-subtitle">专业全栈开发 | 游戏开发专家</p>
            </div>
          </div>

          <div class="dev-contact">
            <p class="dev-description">需要网站定制开发？专业提供现代化Web应用、游戏开发、企业网站定制服务</p>

            <div class="dev-links">
              <a href="mailto:chanmeng.dev@gmail.com" class="dev-link email">
                📧 chanmeng.dev@gmail.com
              </a>
              <a href="https://github.com/ChanMeng666" target="_blank" class="dev-link github">
                🔗 GitHub作品集
              </a>
              <a href="https://github.com/ChanMeng666/otherworld-god-farmer" target="_blank" class="dev-link project">
                📂 本项目源码
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .help-toggle {
      position: fixed;
      top: 20px;
      left: 20px;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid rgba(76, 175, 80, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 1500;
      font-size: 20px;
      transition: all 0.2s;
    }

    .help-toggle:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.1);
    }

    .help-panel {
      position: fixed;
      top: 70px;
      left: 20px;
      width: 400px;
      max-height: 70vh;
      background: rgba(20, 20, 20, 0.95);
      border: 2px solid rgba(76, 175, 80, 0.5);
      border-radius: 15px;
      padding: 20px;
      z-index: 1500;
      color: white;
      overflow-y: auto;
    }

    .help-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .help-header h3 {
      margin: 0;
      font-size: 20px;
      color: #4CAF50;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
    }

    .help-section {
      margin-bottom: 20px;
    }

    .help-section h4 {
      color: #8BC34A;
      margin-bottom: 10px;
      font-size: 16px;
    }

    .help-section ul, .help-section ol {
      margin-left: 20px;
      line-height: 1.8;
    }

    .help-section li {
      margin-bottom: 5px;
      font-size: 14px;
    }

    .help-section strong {
      color: #FFD700;
    }

    .help-section ul ul {
      margin-top: 5px;
      margin-left: 20px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
    }

    .tip {
      background: rgba(76, 175, 80, 0.1);
      padding: 15px;
      border-radius: 10px;
      border-left: 3px solid #4CAF50;
    }

    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(76, 175, 80, 0.5);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(76, 175, 80, 0.7);
    }

    /* Developer section styles */
    .developer-section {
      background: rgba(76, 175, 80, 0.05);
      border: 1px solid rgba(76, 175, 80, 0.2);
      border-radius: 10px;
      padding: 15px;
      margin-top: 10px;
    }

    .dev-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .dev-logo-small {
      width: 32px;
      height: 32px;
      filter: invert(1);
      opacity: 0.9;
    }

    .dev-info h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #4CAF50;
    }

    .dev-subtitle {
      margin: 0;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
    }

    .dev-description {
      font-size: 12px;
      color: #FFD700;
      margin-bottom: 12px;
      line-height: 1.4;
      background: rgba(255, 215, 0, 0.1);
      padding: 8px;
      border-radius: 6px;
      border-left: 3px solid #FFD700;
    }

    .dev-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .dev-link {
      display: inline-block;
      color: #8BC34A;
      text-decoration: none;
      font-size: 11px;
      padding: 4px 8px;
      border: 1px solid rgba(139, 195, 74, 0.3);
      border-radius: 12px;
      transition: all 0.2s;
      background: rgba(139, 195, 74, 0.1);
    }

    .dev-link:hover {
      background: rgba(139, 195, 74, 0.2);
      border-color: rgba(139, 195, 74, 0.6);
      transform: translateX(2px);
    }

    .dev-link.email:hover {
      background: rgba(255, 87, 34, 0.1);
      border-color: rgba(255, 87, 34, 0.6);
      color: #FF5722;
    }

    .dev-link.github:hover {
      background: rgba(103, 58, 183, 0.1);
      border-color: rgba(103, 58, 183, 0.6);
      color: #673AB7;
    }

    .dev-link.project:hover {
      background: rgba(33, 150, 243, 0.1);
      border-color: rgba(33, 150, 243, 0.6);
      color: #2196F3;
    }
  `]
})
export class HelpPanelComponent {
  isVisible = false;

  toggleHelp(): void {
    this.isVisible = !this.isVisible;
  }
}
