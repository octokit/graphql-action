# Octokit Request Action

> A GitHub Action to send queries to GitHub's GraphQL API

[![Build Status](https://github.com/octokit/graphql-action/workflows/Test/badge.svg)](https://github.com/octokit/graphql-action/actions)

## Usage

Minimal example

```yml
name: Log latest release
on:
  push:
    branches:
      - master

jobs:
  logLatestRelease:
    runs-on: ubuntu-latest
    steps:
      - uses: octokit/graphql-action@v2.x
        id: get_latest_release
        with:
          query: |
            query release($owner:String!,$repo:String!) {
              repository(owner:$owner,name:$repo) {
                releases(first:1) {
                  nodes {
                    name
                    createdAt
                    tagName
                    description
                  }
                }
              }
            }
          owner: ${{ github.event.repository.owner.name }}
          repo: ${{ github.event.repository.name }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: "echo 'latest release: ${{ steps.get_latest_release.outputs.data }}'"
```

To access deep values of `outputs.data`, use [`fromJSON()`](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#fromjson).

## Debugging

To see additional debug logs, create a secret with the name: `ACTIONS_STEP_DEBUG` and value `true`.

## How it works

`octokit/graphql-action` is using [`@octokit/graphql`](https://github.com/octokit/graphql.js/) internally with the addition
that requests are automatically authenticated using the `GITHUB_TOKEN` environment variable. It is required to prevent rate limiting, as all anonymous requests from the same origin count against the same low rate.

The actions sets `data` output to the response data. Note that it is a string, you should use [`fromJSON()`](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#fromjson) to access any value of the response. The action also sets `headers` (again, to a JSON string) and `status`.

## License

[MIT](LICENSE)
