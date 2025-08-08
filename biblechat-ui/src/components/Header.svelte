<script lang="ts">
  import { onMount } from 'svelte';
  
  let time = new Date().toLocaleTimeString();
  
  onMount(() => {
    const interval = setInterval(() => {
      time = new Date().toLocaleTimeString();
    }, 1000);
    
    return () => clearInterval(interval);
  });
</script>

<header class="divine-header">
  <div class="header-content">
    <div class="logo-section">
      <span class="logo-icon holy-glow">✝️</span>
      <div class="logo-text">
        <h1 class="site-title">BibleChat: Talk To The Bible</h1>
        <p class="site-tagline">Illuminated Sanctuary</p>
      </div>
    </div>
    
    <div class="header-nav">
      <div class="verse-of-moment">
        <span class="verse-icon">✨</span>
        <span class="verse-text">"For where two or three gather in my name, there am I with them."</span>
        <span class="verse-ref">- Matthew 18:20</span>
      </div>
      
      <div class="divine-time">
        <span class="time-icon">🕊️</span>
        <span class="time-text">{time}</span>
      </div>
    </div>
  </div>
  
  <div class="header-divider"></div>
</header>

<style>
  .divine-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: linear-gradient(180deg, rgba(10, 10, 15, 0.98), rgba(15, 15, 25, 0.95));
    border-bottom: 2px solid;
    border-image: var(--border-divine) 1;
    padding: var(--space-lg) var(--space-xl);
    backdrop-filter: blur(10px);
  }
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-lg);
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }
  
  .logo-icon {
    font-size: 48px;
    display: block;
  }
  
  .logo-text {
    display: flex;
    flex-direction: column;
  }
  
  .site-title {
    font-size: var(--fs-xxl);
    color: var(--text-divine);
    margin: 0;
    font-weight: var(--fw-bold);
    letter-spacing: 2px;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }
  
  .site-tagline {
    font-size: var(--fs-sm);
    color: var(--text-scripture);
    margin: 0;
    font-style: italic;
    letter-spacing: 1px;
  }
  
  .header-nav {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-sm);
  }
  
  .verse-of-moment {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--fs-sm);
    color: var(--text-holy);
    max-width: 400px;
  }
  
  .verse-icon {
    font-size: 16px;
  }
  
  .verse-text {
    font-style: italic;
  }
  
  .verse-ref {
    color: var(--text-scripture);
    font-size: var(--fs-xs);
    white-space: nowrap;
  }
  
  .divine-time {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--text-scripture);
    font-size: var(--fs-sm);
  }
  
  .time-icon {
    font-size: 16px;
  }
  
  .header-divider {
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 215, 0, 0.3), 
      rgba(138, 43, 226, 0.3),
      rgba(30, 144, 255, 0.3),
      transparent);
    margin-top: var(--space-lg);
    animation: shimmer 8s ease-in-out infinite;
  }
  
  @media (max-width: 768px) {
    .divine-header {
      padding: var(--space-md) var(--space-lg);
    }
    
    .header-content {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .header-nav {
      align-items: center;
    }
    
    .verse-of-moment {
      text-align: center;
      flex-direction: column;
    }
    
    .logo-icon {
      font-size: 36px;
    }
    
    .site-title {
      font-size: var(--fs-xl);
    }
  }
</style>