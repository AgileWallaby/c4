# Structurizr DSL Reference

You are answering a question about Structurizr DSL syntax or helping modify `structurizrDslWriter.ts`.

## Step 1: Check for local docs

First, check if local docs are present:

```
Glob pattern="**/*.md" path="docs/structurizr"
```

If files are found, read the relevant ones before answering. Key files to look for:
- `language.md` — full DSL grammar and keyword reference
- `elements.md` or `views.md` — element/view syntax
- `cookbook/` subdirectory — practical examples

## Step 2: Fallback to remote

If `docs/structurizr/` is not populated, fetch directly from GitHub raw URLs:

- Language reference: `https://raw.githubusercontent.com/structurizr/structurizr.github.io/main/dsl/language.md`
- Cookbook index: `https://raw.githubusercontent.com/structurizr/structurizr.github.io/main/dsl/cookbook/README.md`

Use `WebFetch` for any URL you need.

To populate local docs for future use: `pnpm fetch-structurizr-docs`

## Key DSL constructs for `structurizrDslWriter.ts`

Focus on these when relevant:

- **Elements**: `person`, `softwareSystem`, `container`, `component` — properties, descriptions, tags
- **Relationships**: `->` arrow syntax, technology, description, tags
- **Views**: `systemLandscape`, `systemContext`, `container`, `component` — `include *`, `autoLayout`
- **Tags**: `tags` property on elements and relationships; `element` style blocks
- **Groups**: `group "name" { ... }` for logical grouping within views
- **Styles**: `styles { element "tag" { ... } relationship "tag" { ... } }`

## Source file

`libs/c4-model/src/lib/structurizrDslWriter.ts`
