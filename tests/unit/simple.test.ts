describe('Simple Test Suite', () => {
  it('should perform basic math', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle strings', () => {
    expect('John 3:16').toContain('John');
  });

  it('should handle arrays', () => {
    const verses = ['Genesis 1:1', 'John 3:16', 'Psalm 23:1'];
    expect(verses).toHaveLength(3);
    expect(verses).toContain('John 3:16');
  });

  it('should handle objects', () => {
    const verse = {
      book: 'John',
      chapter: 3,
      verse: 16,
      text: 'For God so loved the world...'
    };
    
    expect(verse.book).toBe('John');
    expect(verse.chapter).toBe(3);
  });

  it('should handle async operations', async () => {
    const fetchVerse = () => Promise.resolve('John 3:16');
    const result = await fetchVerse();
    expect(result).toBe('John 3:16');
  });
});