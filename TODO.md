# Testing Setup TODO

## Dependencies
- [x] Install jest, jest-environment-jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, ts-jest, @types/jest

## Configuration
- [x] Create jest.config.ts using next/jest transformer
- [x] Set testEnvironment to jsdom
- [x] Configure collectCoverageFrom to include src/**/*.{ts,tsx} but exclude node_modules and .next
- [x] Set coverageThreshold to 80% for lines, branches, and functions

## Setup File
- [x] Create jest.setup.ts
- [x] Mock next/navigation (useRouter, usePathname, useSearchParams)
- [x] Import @testing-library/jest-dom

## Sample Tests
- [x] Create test for date helper in src/utils (formatEventDate)
- [x] Button test already exists
- [x] EventCard test already exists

## Package Scripts
- [x] Add test, test:watch, test:coverage scripts to package.json

## Documentation
- [x] Add README section explaining Testing Pyramid and 80% threshold
