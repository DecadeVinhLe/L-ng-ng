/**
 * Admin lock. This is a convenience lock for a site that keeps all its data in the visitor's own
 * browser; it is NOT real security (anyone can read this file or the browser storage).
 * Real protection needs a server with a login.
 *
 * The value is the SHA-256 of the passcode. Default passcode: lang2026
 * To change it:  echo -n "your-new-passcode" | sha256sum   then paste the result below.
 */
const ADMIN_PASSCODE_SHA256 = 'd0eb37208e680a2b926f1120a4452ebe475a259aae90d89551984cac888ea75b';

export { ADMIN_PASSCODE_SHA256 };
