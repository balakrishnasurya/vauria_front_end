# Pagination handling in Vauria

This document describes the current state of product listing pagination, what to add to the backend response to support proper pagination, and several implementation options (with pros/cons) for both backend and frontend.

## Present version (current behavior)

- Endpoint being used (example):
  - GET `/api/v1/products/?page=2&per_page=20&category_id=2`
- Response shape (current):
  - An array of product objects only (no metadata about total, total pages, cursors, or links).
- Implications:
  - The frontend cannot know how many total items or total pages exist.
  - We cannot render numbered pagination reliably.
  - The only heuristic is: if the array length < `per_page`, then we reached the last page.
  - Results may be filtered by `category_id`, but we still lack pagination metadata.

## What to add to the response for proper pagination

Below are options for enhancing the API response to support robust pagination. Pick ONE primary approach (A, B, or C). Option D can be used in combination.

### Option A — Body-based, offset pagination (simple and explicit)

- Request params: `page`, `per_page`, and filters like `category_id` (already used).
- Response body wraps items with pagination metadata:

```json
{
  "items": [ /* array of products */ ],
  "page": 2,
  "per_page": 20,
  "total": 137,
  "total_pages": 7,
  "has_next": true,
  "has_prev": true
}
```

- Pros:
  - Easiest to consume in the frontend.
  - Explicit and self-contained response (no need to read headers).
- Cons:
  - Slightly larger payload size than returning items only.

### Option B — Headers-based, offset pagination (compact API surface)

- Keep response body as the array of products.
- Add headers:
  - `X-Total-Count: 137` (total matching items)
  - `X-Page: 2`
  - `X-Per-Page: 20`
  - Optional `Content-Range: items 20-39/137`
- Pros:
  - Backward compatible body (still just an array).
  - Smaller response body.
- Cons:
  - Frontend must read headers, which is less obvious and is sometimes constrained by proxies/CDNs.

### Option C — Body-based, cursor pagination (best for large datasets or changing data)

- Request params: `cursor` (e.g., `?cursor=eyJpZCI6MzV9`) and `limit`.
- Response:

```json
{
  "items": [ /* array of products */ ],
  "next_cursor": "eyJpZCI6MzJ9",
  "prev_cursor": null,
  "has_more": true
}
```

- Pros:
  - Stable paging even when new items are inserted (avoids skipping/duplicates).
  - Efficient for infinite scroll.
- Cons:
  - No concept of total pages.
  - Slightly more complex mental model.

### Option D — HTTP Link headers (can be combined with A or B)

- Add standard `Link` header per RFC 5988 with `rel="first"`, `rel="prev"`, `rel="next"`, `rel="last"`.
- Example:

```
Link: <https://api.example.com/products?category_id=2&page=1&per_page=20>; rel="first", 
      <https://api.example.com/products?category_id=2&page=1&per_page=20>; rel="prev",
      <https://api.example.com/products?category_id=2&page=3&per_page=20>; rel="next",
      <https://api.example.com/products?category_id=2&page=7&per_page=20>; rel="last"
```

- Pros:
  - Standardized; works well with generic clients.
- Cons:
  - Frontend needs to parse headers; still need a total count from somewhere if you want numbered pages.

## Recommended approach for Vauria

- If you want classic, numbered pagination in category pages, adopt **Option A (Body-based, offset)**.
  - It’s the most straightforward to implement and integrate with our existing UI components.
- Minimal breaking change alternative: **Option B (Headers)** while continuing to return an array body; the frontend will read headers for totals.

## Backend changes (examples)

### A. Offset pagination body (recommended)

- Request: `GET /api/v1/products/?category_id=2&page=2&per_page=20`
- Response:

```json
{
  "items": [ /* products */ ],
  "page": 2,
  "per_page": 20,
  "total": 137,
  "total_pages": 7,
  "has_next": true,
  "has_prev": true
}
```

### B. Headers with array body (backward compatible)

- Response headers:
  - `X-Total-Count: 137`
  - `X-Page: 2`
  - `X-Per-Page: 20`
  - Optionally: `Content-Range: items 20-39/137`
- Response body:

```json
[ /* products */ ]
```

### C. Cursor pagination body (for infinite scroll)

- Request: `GET /api/v1/products/?category_id=2&limit=20&cursor=eyJpZCI6MzV9`
- Response:

```json
{
  "items": [ /* products */ ],
  "next_cursor": "eyJpZCI6MzJ9",
  "prev_cursor": null,
  "has_more": true
}
```

## Frontend handling (App Router)

Assuming category route is `app/[categorySlug]/page.tsx` and we pass `category_id` via a mapping.

### Reading and using search params

- Use `searchParams` to get `page` and `per_page` (default `page=1`, `per_page=20`).
- Build the request with `category_id`, `page`, and `per_page`.

### Rendering pagination

- If using Option A/B:
  - Compute `totalPages` from `total` and `per_page` (A) or from headers (B).
  - Render a pagination component (`components/general/Pagination.tsx` or `components/ui/pagination.tsx`).
  - Navigate by updating the `page` query param while preserving `categorySlug`.

- If using Option C:
  - Render a "Load more" button or infinite scroll.
  - Keep `next_cursor` in state; on click/scroll, request the next page with `cursor=next_cursor` and append items.

### Graceful fallback (works with current API as-is)

- While backend metadata is being added, we can still provide a basic UX:
  - Keep using `page`/`per_page` in requests.
  - If returned array length `< per_page`, hide the "Next" button.
  - Show only Prev/Next (no page numbers) and/or a "Load more" button.

## API examples (current vs. enhanced)

- Current (array only):

```
GET /api/v1/products/?page=2&per_page=20&category_id=2
=> [ /* products */ ]
```

- Enhanced (recommended):

```
GET /api/v1/products/?page=2&per_page=20&category_id=2
=> {
     "items": [ /* products */ ],
     "page": 2,
     "per_page": 20,
     "total": 137,
     "total_pages": 7,
     "has_next": true,
     "has_prev": true
   }
```

## Edge cases to handle on frontend

- `page` out of range: redirect to last page or page=1.
- Empty category: show empty state, hide pagination.
- Parameter changes (filters/sort): reset to page=1.
- Slow/failed requests: show skeletons/spinners and error toasts.

## Next steps

1. Pick an approach (A recommended, or B for backward compatibility).
2. Update backend endpoint `/api/v1/products/` to return metadata accordingly.
3. Frontend:
   - Read metadata (body or headers).
   - Render pagination controls based on `total`/`total_pages` (A/B) or `has_more`/`next_cursor` (C).
   - Wire up the existing Pagination component to `searchParams`.
