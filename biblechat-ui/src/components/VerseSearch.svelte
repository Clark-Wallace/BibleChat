<script lang="ts">
  import { api } from '../lib/api';
  
  let searchQuery = '';
  let searchResults: any[] = [];
  let isSearching = false;
  let selectedBook = '';
  let selectedTestament = '';
  let resultCount = 0;
  
  const books = {
    OT: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'],
    NT: ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']
  };
  
  async function searchVerses() {
    if (!searchQuery.trim()) return;
    
    isSearching = true;
    searchResults = [];
    
    try {
      const response = await api.searchVerses(searchQuery, {
        limit: 20,
        book: selectedBook || undefined,
        testament: selectedTestament || undefined
      });
      
      searchResults = response.results;
      resultCount = response.count;
    } catch (error) {
      console.error('Search error:', error);
      searchResults = [];
      resultCount = 0;
    } finally {
      isSearching = false;
    }
  }
  
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      searchVerses();
    }
  }
  
  function clearFilters() {
    selectedBook = '';
    selectedTestament = '';
    searchQuery = '';
    searchResults = [];
    resultCount = 0;
  }
</script>

<div class="search-container">
  <div class="search-header divine-card">
    <h2 class="search-title">
      <span class="title-icon">📖</span>
      Scripture Search
    </h2>
    <p class="search-subtitle">Seek and you will find - Matthew 7:7</p>
    
    <div class="search-controls">
      <div class="search-input-group">
        <input
          type="text"
          class="input-divine search-input"
          placeholder="Search for words, phrases, or topics..."
          bind:value={searchQuery}
          on:keypress={handleKeyPress}
          disabled={isSearching}
        />
        <button 
          class="btn-divine search-button"
          on:click={searchVerses}
          disabled={isSearching || !searchQuery.trim()}
        >
          {#if isSearching}
            <span class="button-icon rotating">✨</span>
            Searching...
          {:else}
            <span class="button-icon">🔍</span>
            Search
          {/if}
        </button>
      </div>
      
      <div class="filter-controls">
        <select 
          class="input-divine filter-select"
          bind:value={selectedTestament}
          disabled={isSearching}
        >
          <option value="">All Testaments</option>
          <option value="OT">Old Testament</option>
          <option value="NT">New Testament</option>
        </select>
        
        <select 
          class="input-divine filter-select"
          bind:value={selectedBook}
          disabled={isSearching}
        >
          <option value="">All Books</option>
          {#if selectedTestament === 'OT' || !selectedTestament}
            <optgroup label="Old Testament">
              {#each books.OT as book}
                <option value={book}>{book}</option>
              {/each}
            </optgroup>
          {/if}
          {#if selectedTestament === 'NT' || !selectedTestament}
            <optgroup label="New Testament">
              {#each books.NT as book}
                <option value={book}>{book}</option>
              {/each}
            </optgroup>
          {/if}
        </select>
        
        <button 
          class="btn-divine clear-button"
          on:click={clearFilters}
          disabled={isSearching}
        >
          <span class="button-icon">✨</span>
          Clear
        </button>
      </div>
    </div>
  </div>
  
  <div class="search-results">
    {#if resultCount > 0}
      <div class="results-header">
        <span class="results-count">Found {resultCount} verses</span>
        {#if resultCount > searchResults.length}
          <span class="results-showing">(showing first {searchResults.length})</span>
        {/if}
      </div>
    {/if}
    
    {#if searchResults.length > 0}
      <div class="results-list">
        {#each searchResults as result}
          <div class="verse-result divine-card">
            <div class="verse-header">
              <span class="verse-reference">{result.reference}</span>
              <span class="verse-translation">{result.translation}</span>
            </div>
            <div class="verse-text">
              "{result.text}"
            </div>
            <div class="verse-meta">
              <span class="verse-book">{result.book}</span>
              <span class="verse-chapter">Chapter {result.chapter}</span>
              <span class="verse-verse">Verse {result.verse}</span>
              {#if result.relevance}
                <span class="verse-relevance">
                  Relevance: {Math.round(result.relevance * 100)}%
                </span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else if !isSearching && searchQuery}
      <div class="no-results">
        <span class="no-results-icon">🕊️</span>
        <p class="no-results-text">No verses found for "{searchQuery}"</p>
        <p class="no-results-hint">Try different keywords or adjust your filters</p>
      </div>
    {:else}
      <div class="search-prompt">
        <span class="prompt-icon">✨</span>
        <p class="prompt-text">Enter keywords to search the Scriptures</p>
        <div class="popular-searches">
          <p class="popular-title">Popular searches:</p>
          <div class="popular-tags">
            <button class="tag-button" on:click={() => { searchQuery = 'love'; searchVerses(); }}>Love</button>
            <button class="tag-button" on:click={() => { searchQuery = 'faith'; searchVerses(); }}>Faith</button>
            <button class="tag-button" on:click={() => { searchQuery = 'hope'; searchVerses(); }}>Hope</button>
            <button class="tag-button" on:click={() => { searchQuery = 'peace'; searchVerses(); }}>Peace</button>
            <button class="tag-button" on:click={() => { searchQuery = 'forgiveness'; searchVerses(); }}>Forgiveness</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .search-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }
  
  .search-header {
    text-align: center;
  }
  
  .search-title {
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
  
  .search-subtitle {
    color: var(--text-scripture);
    font-size: var(--fs-sm);
    font-style: italic;
    margin: 0 0 var(--space-lg) 0;
  }
  
  .search-controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .search-input-group {
    display: flex;
    gap: var(--space-md);
  }
  
  .search-input {
    flex: 1;
  }
  
  .search-button {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  
  .filter-controls {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .filter-select {
    min-width: 150px;
  }
  
  .results-header {
    text-align: center;
    margin-bottom: var(--space-lg);
    color: var(--text-scripture);
  }
  
  .results-count {
    font-size: var(--fs-lg);
    color: var(--text-divine);
    font-weight: var(--fw-semibold);
  }
  
  .results-showing {
    font-size: var(--fs-sm);
    margin-left: var(--space-sm);
  }
  
  .results-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .verse-result {
    transition: transform 0.3s ease;
  }
  
  .verse-result:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
  }
  
  .verse-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-md);
  }
  
  .verse-reference {
    font-size: var(--fs-lg);
    color: var(--text-divine);
    font-weight: var(--fw-semibold);
  }
  
  .verse-translation {
    font-size: var(--fs-sm);
    color: var(--text-scripture);
    background: rgba(138, 43, 226, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
  }
  
  .verse-text {
    color: var(--text-holy);
    font-size: var(--fs-md);
    line-height: 1.6;
    font-style: italic;
    margin-bottom: var(--space-md);
  }
  
  .verse-meta {
    display: flex;
    gap: var(--space-md);
    font-size: var(--fs-sm);
    color: var(--text-scripture);
    flex-wrap: wrap;
  }
  
  .verse-meta span {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 193, 7, 0.05));
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid rgba(255, 215, 0, 0.1);
  }
  
  .verse-relevance {
    margin-left: auto;
    color: var(--text-divine);
  }
  
  .no-results, .search-prompt {
    text-align: center;
    padding: var(--space-xxl);
  }
  
  .no-results-icon, .prompt-icon {
    font-size: 48px;
    display: block;
    margin-bottom: var(--space-lg);
  }
  
  .no-results-text, .prompt-text {
    font-size: var(--fs-lg);
    color: var(--text-holy);
    margin-bottom: var(--space-sm);
  }
  
  .no-results-hint {
    font-size: var(--fs-sm);
    color: var(--text-scripture);
  }
  
  .popular-searches {
    margin-top: var(--space-xl);
  }
  
  .popular-title {
    font-size: var(--fs-sm);
    color: var(--text-scripture);
    margin-bottom: var(--space-md);
  }
  
  .popular-tags {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .tag-button {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(30, 144, 255, 0.1));
    border: 1px solid rgba(255, 215, 0, 0.2);
    color: var(--text-scripture);
    padding: var(--space-sm) var(--space-md);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: var(--fs-sm);
  }
  
  .tag-button:hover {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.2));
    border-color: var(--primary-gold);
    color: var(--text-divine);
    transform: translateY(-2px);
  }
  
  .button-icon.rotating {
    animation: rotate 2s linear infinite;
  }
  
  @media (max-width: 768px) {
    .search-input-group {
      flex-direction: column;
    }
    
    .filter-controls {
      flex-direction: column;
    }
    
    .filter-select {
      width: 100%;
    }
  }
</style>