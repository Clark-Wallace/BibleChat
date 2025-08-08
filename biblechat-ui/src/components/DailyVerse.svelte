<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../lib/api';
  
  interface DailyContent {
    verse: {
      reference: string;
      text: string;
      book: string;
      chapter: number;
      verse: number;
      translation: string;
    };
    reflection: string;
    prayer: string;
    application: string;
  }
  
  let dailyContent: DailyContent | null = null;
  let isLoading = true;
  let error: string | null = null;
  let selectedDate = new Date().toDateString();
  
  onMount(() => {
    loadDailyVerse();
  });
  
  async function loadDailyVerse() {
    isLoading = true;
    error = null;
    
    try {
      const response = await api.getDailyVerse();
      dailyContent = response;
    } catch (err) {
      console.error('Failed to load daily verse:', err);
      error = 'Unable to load today\'s blessing. Please try again later.';
      
      // Fallback content for demo
      dailyContent = {
        verse: {
          reference: 'Philippians 4:13',
          text: 'I can do all things through Christ which strengtheneth me.',
          book: 'Philippians',
          chapter: 4,
          verse: 13,
          translation: 'KJV'
        },
        reflection: 'This powerful verse reminds us that our strength comes not from ourselves, but through our connection with Christ. In moments of weakness, doubt, or challenge, we can draw upon divine strength that surpasses our human limitations.',
        prayer: 'Heavenly Father, thank You for being our source of strength. When we face challenges that seem insurmountable, remind us that through Christ, we have access to unlimited power and grace. Help us to rely not on our own understanding, but to trust in Your divine strength. In Jesus\' name, Amen.',
        application: 'Today, identify one challenge you\'re facing and consciously surrender it to God. Instead of relying solely on your own strength, take a moment to pray and ask for divine assistance. Remember that with God, all things are possible.'
      };
    } finally {
      isLoading = false;
    }
  }
  
  function shareVerse() {
    if (!dailyContent) return;
    
    const text = `${dailyContent.verse.text}\n- ${dailyContent.verse.reference}\n\nShared from BibleChat Illuminated Sanctuary`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Daily Bible Verse',
        text: text
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text).then(() => {
        alert('Verse copied to clipboard!');
      }).catch(console.error);
    }
  }
  
  function getTimeOfDayGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
</script>

<div class="daily-container">
  <div class="daily-header divine-card">
    <h2 class="daily-title">
      <span class="title-icon">🕊️</span>
      Daily Blessing
    </h2>
    <p class="daily-subtitle">{getTimeOfDayGreeting()}, child of God</p>
    <p class="date-display">{selectedDate}</p>
  </div>
  
  {#if isLoading}
    <div class="loading-container">
      <div class="loading-spinner">✨</div>
      <p class="loading-text">Receiving divine wisdom...</p>
    </div>
  {:else if dailyContent}
    <div class="daily-content">
      <!-- Main Verse Card -->
      <div class="verse-main divine-card holy-highlight">
        <div class="verse-header">
          <span class="verse-badge">Today's Scripture</span>
          <button class="share-button" on:click={shareVerse}>
            <span class="share-icon">📤</span>
            Share
          </button>
        </div>
        
        <div class="verse-body">
          <p class="verse-text-large">
            "{dailyContent.verse.text}"
          </p>
          <p class="verse-reference-large">
            {dailyContent.verse.reference}
            <span class="translation-badge">{dailyContent.verse.translation}</span>
          </p>
        </div>
      </div>
      
      <!-- Reflection Section -->
      <div class="reflection-card divine-card">
        <div class="section-header">
          <span class="section-icon">💭</span>
          <h3 class="section-title">Divine Reflection</h3>
        </div>
        <p class="reflection-text">
          {dailyContent.reflection}
        </p>
      </div>
      
      <!-- Prayer Section -->
      <div class="prayer-card divine-card">
        <div class="section-header">
          <span class="section-icon">🙏</span>
          <h3 class="section-title">Today's Prayer</h3>
        </div>
        <p class="prayer-text">
          {dailyContent.prayer}
        </p>
      </div>
      
      <!-- Application Section -->
      <div class="application-card divine-card">
        <div class="section-header">
          <span class="section-icon">✨</span>
          <h3 class="section-title">Living the Word</h3>
        </div>
        <p class="application-text">
          {dailyContent.application}
        </p>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn-divine refresh-button" on:click={loadDailyVerse}>
          <span class="button-icon">🔄</span>
          Refresh Blessing
        </button>
        
        <button class="btn-divine meditate-button">
          <span class="button-icon">🧘</span>
          Meditate on This
        </button>
      </div>
    </div>
  {:else if error}
    <div class="error-container divine-card">
      <span class="error-icon">⚠️</span>
      <p class="error-text">{error}</p>
      <button class="btn-divine" on:click={loadDailyVerse}>
        Try Again
      </button>
    </div>
  {/if}
</div>

<style>
  .daily-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }
  
  .daily-header {
    text-align: center;
  }
  
  .daily-title {
    color: var(--text-divine);
    font-size: var(--fs-xl);
    margin: 0 0 var(--space-sm) 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
  }
  
  .title-icon {
    font-size: 28px;
  }
  
  .daily-subtitle {
    color: var(--text-scripture);
    font-size: var(--fs-md);
    font-style: italic;
    margin: 0 0 var(--space-sm) 0;
  }
  
  .date-display {
    color: var(--text-holy);
    font-size: var(--fs-sm);
    margin: 0;
  }
  
  .loading-container {
    text-align: center;
    padding: var(--space-xxl);
  }
  
  .loading-spinner {
    font-size: 48px;
    animation: rotate 3s linear infinite;
    display: inline-block;
    margin-bottom: var(--space-lg);
  }
  
  .loading-text {
    color: var(--text-scripture);
    font-size: var(--fs-md);
  }
  
  .daily-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .verse-main {
    background: linear-gradient(135deg, 
      rgba(255, 215, 0, 0.1), 
      rgba(138, 43, 226, 0.05),
      rgba(30, 144, 255, 0.05));
    border: 2px solid rgba(255, 215, 0, 0.3);
    position: relative;
    overflow: hidden;
  }
  
  .verse-main::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
    animation: shimmer 8s ease-in-out infinite;
  }
  
  .verse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
    position: relative;
    z-index: 1;
  }
  
  .verse-badge {
    background: linear-gradient(135deg, var(--primary-gold), var(--accent-amber));
    color: var(--bg-cathedral);
    padding: var(--space-xs) var(--space-md);
    border-radius: 20px;
    font-size: var(--fs-sm);
    font-weight: var(--fw-semibold);
  }
  
  .share-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    color: var(--text-divine);
    padding: var(--space-xs) var(--space-md);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    transition: all 0.3s ease;
    font-size: var(--fs-sm);
  }
  
  .share-button:hover {
    background: rgba(255, 215, 0, 0.2);
    transform: translateY(-2px);
  }
  
  .verse-body {
    position: relative;
    z-index: 1;
  }
  
  .verse-text-large {
    font-size: var(--fs-xl);
    color: var(--text-divine);
    line-height: 1.6;
    font-style: italic;
    margin: 0 0 var(--space-lg) 0;
    text-align: center;
  }
  
  .verse-reference-large {
    text-align: center;
    font-size: var(--fs-lg);
    color: var(--text-holy);
    font-weight: var(--fw-semibold);
    margin: 0;
  }
  
  .translation-badge {
    display: inline-block;
    margin-left: var(--space-sm);
    font-size: var(--fs-sm);
    background: rgba(138, 43, 226, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    color: var(--text-scripture);
  }
  
  .reflection-card,
  .prayer-card,
  .application-card {
    transition: transform 0.3s ease;
  }
  
  .reflection-card:hover,
  .prayer-card:hover,
  .application-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }
  
  .section-icon {
    font-size: 24px;
  }
  
  .section-title {
    color: var(--text-divine);
    font-size: var(--fs-lg);
    margin: 0;
  }
  
  .reflection-text,
  .prayer-text,
  .application-text {
    color: var(--text-light);
    line-height: 1.8;
    font-size: var(--fs-md);
  }
  
  .prayer-text {
    font-style: italic;
  }
  
  .action-buttons {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
    margin-top: var(--space-lg);
  }
  
  .refresh-button,
  .meditate-button {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  
  .button-icon {
    font-size: 18px;
  }
  
  .error-container {
    text-align: center;
    padding: var(--space-xl);
  }
  
  .error-icon {
    font-size: 48px;
    display: block;
    margin-bottom: var(--space-md);
  }
  
  .error-text {
    color: var(--text-scripture);
    margin-bottom: var(--space-lg);
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    .verse-text-large {
      font-size: var(--fs-lg);
    }
    
    .action-buttons {
      flex-direction: column;
    }
    
    .share-button {
      font-size: var(--fs-xs);
      padding: var(--space-xs) var(--space-sm);
    }
  }
</style>