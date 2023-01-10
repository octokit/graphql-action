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
      - main

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

To access deep values of `outputs.data`, use [`fromJSON()`](https://docs.github.com/en/actions/learn-github-actions/expressions#fromjson).

## Debugging

To see additional debug logs, create a secret with the name: `ACTIONS_STEP_DEBUG` and value `true`.

## How it works

`octokit/graphql-action` is using [`@octokit/graphql`](https://github.com/octokit/graphql.js/) internally with the addition
that requests are automatically authenticated using the `GITHUB_TOKEN` environment variable. It is required to prevent rate limiting, as all anonymous requests from the same origin count against the same low rate.

The actions sets `data` output to the response data. Note that it is a string, you should use [`fromJSON()`](https://docs.github.com/en/actions/learn-github-actions/expressions#fromjson) to access any value of the response. The action also sets `headers` (again, to a JSON string) and `status`.

## Troubleshooting

### Input variables

It's important to remark `input variables` are converted to lowercase at runtime. This happens with GitHub Actions by design[^1].

### Example

In the following example, the variable `itemId` is casted to `itemid` so, when trying to use it in the `query`, the execution will fail because of a missing variable: `itemId`

```graphql
query release($itemId: String!) {
  ...

# Fails with "Error: Variable $itemId of type String! was provided invalid value"
itemId: "randomId"
```

The recommendation[^1] is to use variables in lowercase to avoid this kind of problems:

```graphql
# The variable name must be lower-case:
query release($itemid: String!) {
  ...

# Both: in the query and action var declaration:
itemid: "randomId"
```

[^1]: https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#inputs

## License

[MIT](LICENSE)
