<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../lib/api';
  
  interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    verses?: any[];
  }
  
  let messages: Message[] = [];
  let inputText = '';
  let isLoading = false;
  let chatContainer: HTMLElement;
  
  onMount(() => {
    // Add welcome message
    messages = [{
      id: 'welcome',
      text: 'Peace be with you! I am here to help you explore the wisdom of Scripture. Ask me anything about the Bible, and I will guide you with divine knowledge and understanding.',
      isUser: false,
      timestamp: new Date()
    }];
  });
  
  async function sendMessage() {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    
    messages = [...messages, userMessage];
    const question = inputText;
    inputText = '';
    isLoading = true;
    
    // Scroll to bottom
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
    
    try {
      const response = await api.chat(question);
      
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        verses: response.verses
      };
      
      messages = [...messages, aiMessage];
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: 'I apologize, but I encountered an issue connecting to the divine wisdom. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      
      messages = [...messages, errorMessage];
    } finally {
      isLoading = false;
      
      // Scroll to bottom
      setTimeout(() => {
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }
  }
  
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="chat-container divine-card">
  <div class="chat-header">
    <h2 class="chat-title">
      <span class="title-icon">💬</span>
      Divine Conversation
    </h2>
    <p class="chat-subtitle">Ask and it will be given to you; seek and you will find - Matthew 7:7</p>
  </div>
  
  <div class="chat-messages" bind:this={chatContainer}>
    {#each messages as message (message.id)}
      <div class="message {message.isUser ? 'user-message' : 'ai-message'} divine-message">
        <div class="message-header">
          <span class="message-icon">
            {message.isUser ? '🙏' : '✨'}
          </span>
          <span class="message-sender">
            {message.isUser ? 'You' : 'Divine Guide'}
          </span>
          <span class="message-time">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        <div class="message-content">
          {message.text}
        </div>
        
        {#if message.verses && message.verses.length > 0}
          <div class="message-verses">
            <div class="verses-header">
              <span class="verses-icon">📖</span>
              <span class="verses-title">Referenced Scriptures</span>
            </div>
            {#each message.verses as verse}
              <div class="verse-card prayer-card">
                <div class="verse-reference">{verse.reference}</div>
                <div class="verse-text">"{verse.text}"</div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
    
    {#if isLoading}
      <div class="message ai-message loading-message">
        <div class="message-header">
          <span class="message-icon rotating">✨</span>
          <span class="message-sender">Divine Guide</span>
        </div>
        <div class="message-content">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <div class="chat-input-container">
    <div class="input-wrapper">
      <input
        type="text"
        class="input-divine chat-input"
        placeholder="Ask your question..."
        bind:value={inputText}
        on:keypress={handleKeyPress}
        disabled={isLoading}
      />
      <button 
        class="btn-divine send-button"
        on:click={sendMessage}
        disabled={isLoading || !inputText.trim()}
      >
        <span class="button-icon">🕊️</span>
        Send
      </button>
    </div>
  </div>
</div>

<style>
  .chat-container {
    height: 600px;
    display: flex;
    flex-direction: column;
  }
  
  .chat-header {
    text-align: center;
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
    margin-bottom: var(--space-lg);
  }
  
  .chat-title {
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
  
  .chat-subtitle {
    color: var(--text-scripture);
    font-size: var(--fs-sm);
    font-style: italic;
    margin: 0;
  }
  
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .message {
    padding: var(--space-md);
    border-radius: 12px;
    max-width: 80%;
  }
  
  .user-message {
    align-self: flex-end;
    background: linear-gradient(135deg, rgba(30, 144, 255, 0.1), rgba(138, 43, 226, 0.1));
    border: 1px solid rgba(30, 144, 255, 0.3);
  }
  
  .ai-message {
    align-self: flex-start;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 193, 7, 0.05));
    border: 1px solid rgba(255, 215, 0, 0.2);
  }
  
  .message-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
    font-size: var(--fs-sm);
    color: var(--text-scripture);
  }
  
  .message-icon {
    font-size: 16px;
  }
  
  .message-icon.rotating {
    animation: rotate 2s linear infinite;
  }
  
  .message-sender {
    font-weight: var(--fw-semibold);
    color: var(--text-divine);
  }
  
  .message-time {
    margin-left: auto;
    font-size: var(--fs-xs);
  }
  
  .message-content {
    color: var(--text-light);
    line-height: 1.6;
    white-space: pre-wrap;
  }
  
  .message-verses {
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid rgba(255, 215, 0, 0.1);
  }
  
  .verses-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
    font-size: var(--fs-sm);
    color: var(--text-scripture);
  }
  
  .verses-icon {
    font-size: 16px;
  }
  
  .verse-card {
    margin-top: var(--space-sm);
  }
  
  .verse-reference {
    font-weight: var(--fw-semibold);
    color: var(--text-divine);
    font-size: var(--fs-sm);
    margin-bottom: var(--space-xs);
  }
  
  .verse-text {
    color: var(--text-holy);
    font-style: italic;
    line-height: 1.5;
  }
  
  .loading-message {
    opacity: 0.7;
  }
  
  .loading-dots {
    display: flex;
    gap: 4px;
  }
  
  .loading-dots span {
    width: 8px;
    height: 8px;
    background: var(--primary-gold);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  
  .loading-dots span:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  .loading-dots span:nth-child(2) {
    animation-delay: -0.16s;
  }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
  
  .chat-input-container {
    padding: var(--space-lg);
    border-top: 1px solid rgba(255, 215, 0, 0.2);
  }
  
  .input-wrapper {
    display: flex;
    gap: var(--space-md);
  }
  
  .chat-input {
    flex: 1;
  }
  
  .send-button {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  
  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .button-icon {
    font-size: 18px;
  }
  
  @media (max-width: 768px) {
    .chat-container {
      height: 500px;
    }
    
    .message {
      max-width: 90%;
    }
  }
</style>