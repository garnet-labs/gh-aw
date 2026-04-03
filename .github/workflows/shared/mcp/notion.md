---
mcp-scripts:
  notion-search:
    description: "Search Notion pages and databases using a text query. Returns matching pages and databases."
    inputs:
      query:
        type: string
        description: "The search query text"
        required: true
      filter:
        type: string
        description: "Filter by object type: 'page' or 'database'. If omitted, returns both."
        required: false
        enum: ["page", "database"]
      sort_direction:
        type: string
        description: "Sort direction by last edited time: 'ascending' or 'descending' (default: descending)"
        required: false
        default: "descending"
      page_size:
        type: number
        description: "Number of results to return (max 100, default 10)"
        required: false
        default: 10
    env:
      NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
    script: |
      const apiKey = process.env.NOTION_API_KEY;
      if (!apiKey) throw new Error('NOTION_API_KEY secret is not configured');

      const body = {
        query: query || '',
        sort: { direction: sort_direction || 'descending', timestamp: 'last_edited_time' },
        page_size: Math.min(Number(page_size) || 10, 100),
      };
      if (filter) {
        body.filter = { value: filter, property: 'object' };
      }

      const response = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Notion API error (${response.status}): ${error}`);
      }

      return await response.json();

  notion-get-page:
    description: "Retrieve a Notion page by its ID, including all its properties."
    inputs:
      page_id:
        type: string
        description: "The Notion page ID (UUID format, e.g. 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')"
        required: true
    env:
      NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
    script: |
      const apiKey = process.env.NOTION_API_KEY;
      if (!apiKey) throw new Error('NOTION_API_KEY secret is not configured');
      if (!page_id) throw new Error('page_id is required');

      const response = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Notion API error (${response.status}): ${error}`);
      }

      return await response.json();

  notion-get-database:
    description: "Retrieve a Notion database schema by its ID, including its property definitions."
    inputs:
      database_id:
        type: string
        description: "The Notion database ID (UUID format, e.g. 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')"
        required: true
    env:
      NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
    script: |
      const apiKey = process.env.NOTION_API_KEY;
      if (!apiKey) throw new Error('NOTION_API_KEY secret is not configured');
      if (!database_id) throw new Error('database_id is required');

      const response = await fetch(`https://api.notion.com/v1/databases/${database_id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Notion API error (${response.status}): ${error}`);
      }

      return await response.json();

  notion-query-database:
    description: "Query a Notion database to retrieve rows, with optional filters and sorting."
    inputs:
      database_id:
        type: string
        description: "The Notion database ID (UUID format)"
        required: true
      filter:
        type: object
        description: "Notion filter object. Example: {property: 'Status', select: {equals: 'Done'}}"
        required: false
      sorts:
        type: array
        description: "Array of sort objects. Example: [{property: 'Created', direction: 'descending'}]"
        required: false
      page_size:
        type: number
        description: "Number of results per page (max 100, default 20)"
        required: false
        default: 20
      start_cursor:
        type: string
        description: "Pagination cursor from a previous response's next_cursor field"
        required: false
    env:
      NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
    script: |
      const apiKey = process.env.NOTION_API_KEY;
      if (!apiKey) throw new Error('NOTION_API_KEY secret is not configured');
      if (!database_id) throw new Error('database_id is required');

      const body = {
        page_size: Math.min(Number(page_size) || 20, 100),
      };
      if (filter) body.filter = filter;
      if (sorts) body.sorts = sorts;
      if (start_cursor) body.start_cursor = start_cursor;

      const response = await fetch(`https://api.notion.com/v1/databases/${database_id}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Notion API error (${response.status}): ${error}`);
      }

      return await response.json();

  notion-get-block-children:
    description: "Retrieve the child blocks of a Notion page or block. Use this to read the actual content of a page."
    inputs:
      block_id:
        type: string
        description: "The Notion block or page ID (UUID format)"
        required: true
      page_size:
        type: number
        description: "Number of child blocks to return per page (max 100, default 50)"
        required: false
        default: 50
      start_cursor:
        type: string
        description: "Pagination cursor from a previous response's next_cursor field"
        required: false
    env:
      NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
    script: |
      const apiKey = process.env.NOTION_API_KEY;
      if (!apiKey) throw new Error('NOTION_API_KEY secret is not configured');
      if (!block_id) throw new Error('block_id is required');

      const params = new URLSearchParams();
      params.set('page_size', String(Math.min(Number(page_size) || 50, 100)));
      if (start_cursor) params.set('start_cursor', start_cursor);

      const response = await fetch(`https://api.notion.com/v1/blocks/${block_id}/children?${params}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Notion API error (${response.status}): ${error}`);
      }

      return await response.json();
---
<!--
## Notion Read-Only MCP Integration (mcp-scripts)

This shared configuration provides read-only Notion integration via mcp-scripts that call
the Notion REST API directly using JavaScript. No Docker container is required.

### Configuration

Set the `NOTION_API_KEY` secret in the repository settings with a Notion integration token
that has read access to the relevant pages and databases.

### Available Tools (Read-Only)

- **notion-search**: Search for pages and databases by text query
- **notion-get-page**: Retrieve a page and its properties by ID
- **notion-get-database**: Retrieve a database schema by ID
- **notion-query-database**: Query database rows with optional filters and sorting
- **notion-get-block-children**: Read the content blocks of a page or block

### Usage

Import this shared workflow to gain access to all Notion read tools:

```yaml
imports:
  - shared/mcp/notion.md
```

### Example Tool Calls

**Search for pages:**
```
notion-search with query: "project roadmap", filter: "page"
```

**Read a page's content:**
```
notion-get-page with page_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
notion-get-block-children with block_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Query a database:**
```
notion-query-database with database_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", page_size: 50
```

**Query with filter:**
```
notion-query-database with database_id: "...", filter: {"property": "Status", "select": {"equals": "In Progress"}}
```

### Pagination

Tools that return lists (`notion-search`, `notion-query-database`, `notion-get-block-children`)
support pagination via the `start_cursor` input using the `next_cursor` value from the previous response.
-->