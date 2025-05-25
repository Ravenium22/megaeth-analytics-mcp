# Contributing to MegaETH Analytics MCP Server

Thank you for your interest in contributing to MegaETH Analytics! 🎉

## 🤝 How to Contribute

### 🟢 Welcomed Contributions

- **Bug fixes** with clear reproduction steps
- **Feature enhancements** that improve analytics capabilities
- **Documentation improvements** and clarifications
- **Performance optimizations** and code efficiency
- **Test coverage** additions
- **New contract analysis methods**
- **Additional MCP tools** for blockchain insights

### 🔴 Contribution Restrictions

- **Commercial derivatives** require explicit permission
- **Competing products** using this codebase are not permitted
- **License modifications** are not allowed
- **Copyright removal** is prohibited
- **Brand/attribution changes** without consent

## 📋 Contribution Process

1. **Check existing issues** to avoid duplicates
2. **Open an issue** to discuss major changes
3. **Fork** the repository
4. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
5. **Make your changes** with clear, tested code
6. **Add/update tests** as needed
7. **Update documentation** if applicable
8. **Commit** with descriptive messages
9. **Push** to your fork
10. **Create a Pull Request** with detailed description

## 🧪 Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/megaeth-analytics-mcp.git
cd megaeth-analytics-mcp

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

## ✅ Code Standards

- **TypeScript** for all new code
- **ESLint** compliance required
- **Meaningful variable names** and functions
- **Comprehensive comments** for complex logic
- **Error handling** for all external API calls
- **Rate limiting** considerations for RPC calls

## 🧪 Testing

```bash
# Run existing tests
npm test

# Add tests for new features
# Tests should be in __tests__ directory
```

## 📝 Commit Messages

Use conventional commit format:
- `feat: add new contract analysis method`
- `fix: resolve rate limiting issue`
- `docs: update API documentation`
- `perf: optimize contract discovery`

## 🏷️ Pull Request Guidelines

- **Clear title** describing the change
- **Detailed description** of what and why
- **Link to related issues**
- **Screenshots** for UI changes (if applicable)
- **Testing notes** for reviewers

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked appropriately)
```

## 🚀 Release Process

Maintainers handle releases:
1. Version bump in package.json
2. Update CHANGELOG.md
3. Create GitHub release
4. Deploy to npm (if applicable)

## 📞 Questions?

- **GitHub Issues**: Technical questions and bugs
- **Twitter**: [@RaveniumNFT](https://twitter.com/RaveniumNFT)
- **Discord**: Join MegaETH community

## 🙏 Recognition

Contributors will be acknowledged in:
- README.md contributors section
- CHANGELOG.md for their contributions
- GitHub releases

Thank you for helping make MegaETH Analytics better! 🚀