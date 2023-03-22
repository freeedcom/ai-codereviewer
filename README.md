# AI Code Reviewer

AI Code Reviewer is a GitHub Action that leverages OpenAI's GPT-4 API to provide intelligent feedback and suggestions on your pull requests. This powerful tool helps improve code quality and saves developers time by automating the code review process.

## Features

- Reviews pull requests using OpenAI's GPT-4 API.
- Provides intelligent comments and suggestions for improving your code.
- Filters out files that match specified exclude patterns.
- Easy to set up and integrate into your GitHub workflow.

## Setup

1. To use this GitHub Action, you need an OpenAI API key. If you don't have one, sign up for an API key at [OpenAI](https://beta.openai.com/signup).

2. Add the OpenAI API key as a GitHub Secret in your repository with the name `OPENAI_API_KEY`. You can find more information about GitHub Secrets [here](https://docs.github.com/en/actions/reference/encrypted-secrets).

3. The `GITHUB_TOKEN` is automatically made available to the actions environment by GitHub. However, if you need additional permissions or you want to use the action in a private repository, you might need to create a Personal Access Token (PAT) with the appropriate permissions. You can find more information about creating a PAT [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). If you create a PAT, add it as a GitHub Secret in your repository with the name `USER_GITHUB_TOKEN`.

4. Create a `.github/workflows/main.yml` file in your repository and add the following content:

```yaml
name: AI Code Reviewer

on:
  pull_request:
    types:
      - opened
      - synchronize

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2

      - name: AI Code Reviewer
        uses: your-username/ai-code-reviewer@main
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Replace with secrets.USER_GITHUB_TOKEN if using a PAT
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          exclude: "**/*.json, **/*.md" # Optional: exclude patterns separated by commas
```

5. Replace `your-username` with your GitHub username or organization name where the AI Code Reviewer repository is located.

6. Customize the `exclude` input if you want to ignore certain file patterns from being reviewed.

7. Commit the changes to your repository, and AI Code Reviewer will start working on your future pull requests.

## How It Works

The AI Code Reviewer GitHub Action retrieves the pull request diff, filters out excluded files, and sends code chunks to the OpenAI API. It then generates review comments based on the AI's response and adds them to the pull request.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to improve the AI Code Reviewer GitHub Action.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
