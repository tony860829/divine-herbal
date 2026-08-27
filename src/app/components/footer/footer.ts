import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  template: `
 <footer class="footer">
  <div class="footer-content">
    <div class="footer-logo-badge">
      <img src="images/logo.webp" alt="Divine Herbal Remedies" />
    </div>

    <div class="footer-panel">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>Divine Herbal Remedies</h3>
          <p class="footer-desc">
            Nature has much to teach us. Connect with the natural, live better every day. 
            Start today discovering simple natural remedies for your daily well being.
          </p>
        </div>

        <div class="footer-social">
          <h4>Follow us on our social networks</h4>
          <div class="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <div class="social-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </div>
              <span>facebook account</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <div class="social-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </div>
              <span>instagram account</span>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
              <div class="social-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </div>
              <span>tiktok account</span>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>©2026.Divine Herbal Remedies. All rights reserved.</p>
      </div>
    </div>
  </div>
</footer>
  `,
  styleUrls: ['./footer.scss']
})
export class Footer {}