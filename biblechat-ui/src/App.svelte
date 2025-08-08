<script lang="ts">
  import './styles/theme.css';
  import Header from './components/Header.svelte';
  import ChatInterface from './components/ChatInterface.svelte';
  import DailyVerse from './components/DailyVerse.svelte';
  import VerseSearch from './components/VerseSearch.svelte';
  import { onMount } from 'svelte';

  let activeTab: 'chat' | 'search' | 'daily' = 'chat';
  let mounted = false;

  onMount(() => {
    mounted = true;
    // Add light rays effect
    createLightRays();
  });

  function createLightRays() {
    const container = document.getElementById('app');
    if (!container) return;
    
    for (let i = 0; i < 3; i++) {
      const ray = document.createElement('div');
      ray.className = 'light-ray';
      ray.style.left = `${20 + i * 30}%`;
      ray.style.animationDelay = `${i * 7}s`;
      container.appendChild(ray);
    }
  }
</script>

<main id="app">
  <Header />
  
  <div class="sanctuary-container">
    <!-- Tab Navigation -->
    <nav class="divine-tabs">
      <button 
        class="tab-button" 
        class:active={activeTab === 'chat'}
        on:click={() => activeTab = 'chat'}
      >
        <span class="tab-icon">💬</span>
        <span class="tab-label">Divine Conversation</span>
      </button>
      
      <button 
        class="tab-button" 
        class:active={activeTab === 'search'}
        on:click={() => activeTab = 'search'}
      >
        <span class="tab-icon">📖</span>
        <span class="tab-label">Scripture Search</span>
      </button>
      
      <button 
        class="tab-button" 
        class:active={activeTab === 'daily'}
        on:click={() => activeTab = 'daily'}
      >
        <span class="tab-icon">🕊️</span>
        <span class="tab-label">Daily Blessing</span>
      </button>
    </nav>

    <!-- Content Area -->
    <div class="content-area">
      {#if mounted}
        <div class="tab-content" class:active={activeTab === 'chat'}>
          {#if activeTab === 'chat'}
            <ChatInterface />
          {/if}
        </div>

        <div class="tab-content" class:active={activeTab === 'search'}>
          {#if activeTab === 'search'}
            <VerseSearch />
          {/if}
        </div>

        <div class="tab-content" class:active={activeTab === 'daily'}>
          {#if activeTab === 'daily'}
            <DailyVerse />
          {/if}
        </div>
      {/if}
    </div>

    <!-- Decorative Elements -->
    <div class="sanctuary-decoration">
      <div class="cross-decoration">✝️</div>
    </div>
  </div>
</main>

<style>
  .sanctuary-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-xl);
    position: relative;
  }

  .divine-tabs {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
    justify-content: center;
    flex-wrap: wrap;
  }

  .tab-button {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(30, 144, 255, 0.1));
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 12px;
    padding: var(--space-md) var(--space-lg);
    color: var(--text-scripture);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-family: var(--font-secondary);
    font-size: var(--fs-md);
  }

  .tab-button:hover {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(30, 144, 255, 0.2));
    border-color: rgba(255, 215, 0, 0.4);
    transform: translateY(-2px);
  }

  .tab-button.active {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.2));
    border-color: var(--primary-gold);
    color: var(--text-divine);
    box-shadow: var(--glow-gold);
  }

  .tab-icon {
    font-size: 20px;
  }

  .tab-label {
    font-weight: var(--fw-medium);
  }

  .content-area {
    position: relative;
    min-height: 500px;
  }

  .tab-content {
    display: none;
    animation: fadeInIlluminate 0.5s ease-out;
  }

  .tab-content.active {
    display: block;
  }

  .sanctuary-decoration {
    position: fixed;
    bottom: 20px;
    right: 20px;
    pointer-events: none;
    z-index: 10;
  }

  .cross-decoration {
    font-size: 40px;
    opacity: 0.3;
    animation: glow 3s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    .sanctuary-container {
      padding: var(--space-lg);
    }

    .divine-tabs {
      gap: var(--space-sm);
    }

    .tab-button {
      padding: var(--space-sm) var(--space-md);
      font-size: var(--fs-sm);
    }

    .tab-icon {
      font-size: 16px;
    }
  }
</style>