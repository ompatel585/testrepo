# TODO: Fix Infrastructure Parameter APIs

## Current State Analysis

### Required APIs:
1. **[POST] /** - ✅ Implemented
2. **[GET] /** - Response format needs transformation
3. **[GET] /?subparameter=true** - ❌ Not implemented
4. **[GET] /brand/:id?subparameter=true** - ❌ Not implemented

## Plan:

### Step 1: Update Controller (infrastructure-parameters.controller.ts)
- Add `@Query('subparameter')` parameter for GET /
- Add new route `@Get('brand/:id')` for brand-based filtering
- Handle query parameter transformation

### Step 2: Update Service (infrastructure-parameters.service.ts)
- Add `findAllWithSubParameters()` method
- Add `findByBrand()` method with optional subParameters
- Transform response to match required format:
  - `brand: {}`
  - `parameterName` (from category name)
  - `category: {}`
  - `subParameters: [{ name, type }, ...]` (when subparameter=true)

## Implementation Steps:
1. Update service methods to return properly formatted response
2. Update controller to handle new routes and query params
3. Test in Postman

