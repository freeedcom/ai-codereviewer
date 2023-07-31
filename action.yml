name: "AI Code Review Action"
description: "Perform code reviews and comment on diffs using OpenAI API."
inputs:
  GITHUB_TOKEN:
    description: "GitHub token to interact with the repository."
    required: true
  OPENAI_API_KEY:
    description: "OpenAI API key for GPT."
    required: true
  OPENAI_API_MODEL:
    description: "OpenAI API model."
    required: false
    default: "gpt-4"
  exclude:
    description: "Glob patterns to exclude files from the diff analysis"
    required: false
    default: ""
runs:
  using: "node16"
  main: "dist/index.js"
branding:
  icon: "aperture"
  color: "green"
