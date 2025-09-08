import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-developer-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Small developer badge in bottom right -->
    <div class="dev-badge" (click)="toggleInfo()">
      <img src="/chan_logo.svg" alt="Chan Meng Logo" class="dev-logo">
      <span class="dev-label">Built by Chan</span>
    </div>

    <!-- Expanded info panel -->
    <div class="dev-info-panel" *ngIf="isExpanded" (click)="$event.stopPropagation()">
      <div class="panel-header">
        <img src="/chan_logo.svg" alt="Chan Meng Logo" class="panel-logo">
        <div class="dev-details">
          <h4>👨‍💻 开发者：Chan Meng</h4>
          <p class="subtitle">专业全栈开发 | 游戏开发专家</p>
        </div>
        <button class="close-btn" (click)="toggleInfo()">✕</button>
      </div>

      <div class="panel-content">
        <div class="project-info">
          <h5>🎮 本项目</h5>
          <p>现代化2D农场模拟游戏，基于Angular 19 + Pixi.js 8打造</p>
          <a href="https://github.com/ChanMeng666/otherworld-god-farmer" target="_blank" class="project-link">
            <span class="icon">📂</span> 查看源码
          </a>
        </div>

        <div class="contact-section">
          <h5>💼 需要网站定制开发？</h5>
          <p class="pitch">专业提供现代化Web应用、游戏开发、企业网站定制服务</p>

          <div class="contact-buttons">
            <a href="mailto:chanmeng.dev@gmail.com" class="contact-btn email">
              <span class="icon">📧</span>
              <span>联系邮箱</span>
            </a>
            <a href="https://github.com/ChanMeng666" target="_blank" class="contact-btn github">
              <span class="icon">🔗</span>
              <span>作品集</span>
            </a>
          </div>
        </div>

        <div class="footer-note">
          <span class="heart">❤️</span> 如果这个项目对您有帮助，欢迎联系定制开发！
        </div>
      </div>
    </div>

    <!-- Background overlay -->
    <div class="overlay" *ngIf="isExpanded" (click)="toggleInfo()"></div>
  `,
  styles: [`
    /* Developer badge - bottom right corner */
    .dev-badge {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      cursor: pointer;
      z-index: 1400;
      font-size: 12px;
      transition: all 0.3s ease;
      border: 1px solid rgba(76, 175, 80, 0.3);
      backdrop-filter: blur(10px);
    }

    .dev-badge:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.05);
      border-color: rgba(76, 175, 80, 0.6);
    }

    .dev-logo {
      width: 20px;
      height: 20px;
      filter: invert(1);
      opacity: 0.9;
    }

    .dev-label {
      font-weight: 500;
      opacity: 0.9;
    }

    /* Info panel */
    .dev-info-panel {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 350px;
      max-height: 70vh;
      background: rgba(20, 20, 20, 0.95);
      border: 2px solid rgba(76, 175, 80, 0.5);
      border-radius: 15px;
      color: white;
      z-index: 1500;
      overflow-y: auto;
      backdrop-filter: blur(15px);
      animation: slideUp 0.3s ease-out;
    }

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

    .panel-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .panel-logo {
      width: 40px;
      height: 40px;
      filter: invert(1);
      opacity: 0.9;
    }

    .dev-details h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #4CAF50;
    }

    .subtitle {
      margin: 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }

    .close-btn {
      margin-left: auto;
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 5px;
      border-radius: 3px;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .panel-content {
      padding: 20px;
    }

    .project-info {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .project-info h5, .contact-section h5 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #8BC34A;
    }

    .project-info p, .contact-section p {
      margin: 0 0 12px 0;
      font-size: 13px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.8);
    }

    .project-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #4CAF50;
      text-decoration: none;
      font-size: 12px;
      padding: 6px 12px;
      border: 1px solid rgba(76, 175, 80, 0.3);
      border-radius: 15px;
      transition: all 0.2s;
    }

    .project-link:hover {
      background: rgba(76, 175, 80, 0.1);
      border-color: rgba(76, 175, 80, 0.6);
    }

    .contact-section {
      margin-bottom: 15px;
    }

    .pitch {
      color: #FFD700 !important;
      font-weight: 500;
      background: rgba(255, 215, 0, 0.1);
      padding: 8px;
      border-radius: 6px;
      border-left: 3px solid #FFD700;
    }

    .contact-buttons {
      display: flex;
      gap: 10px;
      margin-top: 12px;
    }

    .contact-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .contact-btn.email {
      background: rgba(255, 87, 34, 0.2);
      color: #FF5722;
      border: 1px solid rgba(255, 87, 34, 0.3);
    }

    .contact-btn.email:hover {
      background: rgba(255, 87, 34, 0.3);
      border-color: rgba(255, 87, 34, 0.6);
    }

    .contact-btn.github {
      background: rgba(103, 58, 183, 0.2);
      color: #673AB7;
      border: 1px solid rgba(103, 58, 183, 0.3);
    }

    .contact-btn.github:hover {
      background: rgba(103, 58, 183, 0.3);
      border-color: rgba(103, 58, 183, 0.6);
    }

    .footer-note {
      text-align: center;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .heart {
      color: #FF5722;
    }

    .icon {
      font-size: 14px;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1400;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .dev-info-panel {
        right: 10px;
        left: 10px;
        width: auto;
        bottom: 70px;
      }

      .dev-badge {
        bottom: 15px;
        right: 15px;
      }
    }

    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(76, 175, 80, 0.5);
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(76, 175, 80, 0.7);
    }
  `]
})
export class DeveloperInfoComponent {
  isExpanded = false;

  toggleInfo(): void {
    this.isExpanded = !this.isExpanded;
  }
}
