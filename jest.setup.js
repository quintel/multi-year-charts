import '@testing-library/jest-dom/extend-expect';

// jsdom doesn't provide these globals, but jose (used for JWT verification in API routes) needs
// them even when only its Node CJS build is loaded under test.
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
