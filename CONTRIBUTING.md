# Contributing to BibleChat

First off, thank you for considering contributing to BibleChat! It's people like you that make BibleChat such a great tool for the spiritual community.

## 🙏 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and considerate in all interactions.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps which reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots if relevant

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Describe the current behavior and explain which behavior you expected to see instead
- Explain why this enhancement would be useful

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 📋 Development Process

1. **Setup your environment**
   ```bash
   git clone https://github.com/yourusername/biblechat-api.git
   cd biblechat-api
   npm install
   cp .env.example .env
   # Configure your .env file
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

4. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation only
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**

## 🧪 Testing Guidelines

- Write unit tests for new functions
- Write integration tests for new endpoints
- Ensure all tests pass before submitting PR
- Aim for >70% code coverage

Example test:
```typescript
describe('ChatController', () => {
  it('should return biblical response with verses', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .send({ message: 'What is love?' })
      .expect(200);
    
    expect(response.body).toHaveProperty('verses');
    expect(response.body.verses).toBeArray();
  });
});
```

## 📝 Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update API documentation for new endpoints
- Include examples for new features

## 🎨 Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define interfaces for data structures
- Use proper types, avoid `any`

### Code Style
- 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Max line length: 100 characters

### Git Commit Messages
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## 🚀 Areas for Contribution

### High Priority
- [ ] Multi-language Bible translations
- [ ] Voice integration
- [ ] Mobile SDKs
- [ ] Performance optimizations
- [ ] Additional test coverage

### Good First Issues
- [ ] Documentation improvements
- [ ] Bug fixes
- [ ] Adding more Bible translations
- [ ] UI enhancements
- [ ] Example implementations

### Feature Ideas
- [ ] Bible study plans
- [ ] Group study features
- [ ] Prayer request system
- [ ] Daily devotional generator
- [ ] Original language support (Greek/Hebrew)

## 📚 Resources

- [Project Documentation](./README.md)
- [API Documentation](http://localhost:3000/api-docs)
- [Deployment Guide](./DEPLOYMENT.md)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Supabase Docs](https://supabase.com/docs)

## 💬 Questions?

Feel free to open an issue with the tag "question" or start a discussion in the GitHub Discussions tab.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Thank you for your interest in contributing to BibleChat! Your efforts help make biblical wisdom more accessible to everyone.

---

**"Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace in its various forms." - 1 Peter 4:10**