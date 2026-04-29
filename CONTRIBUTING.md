# Contributing to CyberInk

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/cyber-ink.git
cd cyber-ink

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add your API keys to .env

# Start dev server
pnpm dev
```

## Making Changes

1. Fork the repo and create a branch from `main`.
2. Make your changes.
3. Run `pnpm lint` and `pnpm build` to verify nothing is broken.
4. Submit a pull request.

## Code Style

- All code, comments, variable names, and UI copy in English.
- Markdown files use YAML frontmatter (parsed with gray-matter).
- Follow existing patterns in the codebase.

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests.
- Include steps to reproduce for bugs.
- Check existing issues before opening a new one.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
