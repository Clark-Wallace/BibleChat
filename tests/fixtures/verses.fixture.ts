export const verseFixtures = {
  john316: {
    id: 1,
    book: 'John',
    chapter: 3,
    verse: 16,
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    translation: 'NIV',
    testament: 'NT',
    created_at: new Date('2024-01-01'),
    reference: 'John 3:16'
  },
  genesis11: {
    id: 2,
    book: 'Genesis',
    chapter: 1,
    verse: 1,
    text: 'In the beginning God created the heaven and the earth.',
    translation: 'KJV',
    testament: 'OT',
    created_at: new Date('2024-01-01'),
    reference: 'Genesis 1:1'
  },
  psalm231: {
    id: 3,
    book: 'Psalms',
    chapter: 23,
    verse: 1,
    text: 'The LORD is my shepherd; I shall not want.',
    translation: 'KJV',
    testament: 'OT',
    created_at: new Date('2024-01-01'),
    reference: 'Psalms 23:1'
  },
  romans828: {
    id: 4,
    book: 'Romans',
    chapter: 8,
    verse: 28,
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    translation: 'NIV',
    testament: 'NT',
    created_at: new Date('2024-01-01'),
    reference: 'Romans 8:28'
  },
  philippians413: {
    id: 5,
    book: 'Philippians',
    chapter: 4,
    verse: 13,
    text: 'I can do all things through Christ which strengtheneth me.',
    translation: 'KJV',
    testament: 'NT',
    created_at: new Date('2024-01-01'),
    reference: 'Philippians 4:13'
  }
};

export const searchResults = {
  love: [
    verseFixtures.john316,
    {
      id: 10,
      book: '1 Corinthians',
      chapter: 13,
      verse: 4,
      text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.',
      translation: 'NIV',
      testament: 'NT',
      created_at: new Date('2024-01-01'),
      reference: '1 Corinthians 13:4',
      rank: 0.9
    },
    {
      id: 11,
      book: '1 John',
      chapter: 4,
      verse: 8,
      text: 'Whoever does not love does not know God, because God is love.',
      translation: 'NIV',
      testament: 'NT',
      created_at: new Date('2024-01-01'),
      reference: '1 John 4:8',
      rank: 0.85
    }
  ],
  faith: [
    {
      id: 20,
      book: 'Hebrews',
      chapter: 11,
      verse: 1,
      text: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
      translation: 'KJV',
      testament: 'NT',
      created_at: new Date('2024-01-01'),
      reference: 'Hebrews 11:1',
      rank: 0.95
    },
    {
      id: 21,
      book: 'Romans',
      chapter: 10,
      verse: 17,
      text: 'So then faith cometh by hearing, and hearing by the word of God.',
      translation: 'KJV',
      testament: 'NT',
      created_at: new Date('2024-01-01'),
      reference: 'Romans 10:17',
      rank: 0.9
    }
  ]
};

export const invalidReferences = [
  'NotABook 1:1',
  'Genesis 100:1',
  'John 50:100',
  'Invalid',
  '',
  '3:16',
  'Hesitations 3:14'
];

export const validReferences = [
  'John 3:16',
  'Genesis 1:1',
  'Psalm 23:1',
  'Romans 8:28',
  '1 Corinthians 13:4',
  '2 Timothy 3:16',
  'Revelation 22:21'
];

export const mockApiResponses = {
  chatResponse: {
    response: 'God loves us unconditionally. As John 3:16 tells us, God loved the world so much that He gave His only Son for our salvation.',
    confidence: 0.95,
    tokensUsed: 150,
    followUpQuestions: [
      'What does it mean to believe in Jesus?',
      'How can we show God\'s love to others?'
    ],
    relatedTopics: ['Salvation', 'Grace', 'Faith']
  },
  explanation: {
    simple: 'This verse tells us that God loves everyone in the world so much that He sent Jesus to save us.',
    moderate: 'John 3:16 is often called the Gospel in a nutshell. It reveals God\'s motivation (love), His action (gave His Son), and the result (eternal life for believers).',
    scholarly: 'The Greek word for "loved" (ἠγάπησεν) is in the aorist tense, indicating a definitive act of love. The term "world" (κόσμος) refers to humanity in its fallen state, emphasizing the breadth of God\'s redemptive plan.'
  },
  counselResponse: {
    counsel: 'When dealing with anxiety, remember that God cares for you deeply. Cast all your anxiety on Him because He cares for you (1 Peter 5:7).',
    verses: [
      verseFixtures.philippians413,
      {
        book: 'Matthew',
        chapter: 6,
        verse: 26,
        text: 'Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?'
      }
    ],
    prayer: 'Heavenly Father, we come before You with anxious hearts, seeking Your peace that surpasses all understanding...'
  }
};