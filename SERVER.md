# Real applications and recruiter inbox

## Start

Use Node.js 24 or newer (development verification used Node 26). Run npm install,
then npm start. Open http://localhost:3000. The default server listens on all network
interfaces; another device on the same network uses this computer's address and port
3000. A file:// preview or an unrelated static hosting server remains demo mode.

Create a recruiter account from Sign in → Create account. A new company gets its own
server identity. Publish an offer from My account or the existing recruiter form.
Create a separate student account in another browser/device and apply to that offer.

The recruiter opens My account → Received applications → Read message. The full
student message and contact details are available there. Unread counts and inboxes
refresh every four seconds while the page is active. The student can see delivery,
read status and the recruiter's accepted/declined decision in My applications.

Messages are received in the website inbox. This does not send email or SMS.

## Existing sample companies

Sample offers have no real person behind their fictional demo profiles. They do not
report a successful application unless a recruiter account owns the company.

From the project directory, run npm run invite:company -- mis_001 (an offer ID), or
npm run invite:company -- innovdigital (a company ID). The command produces a private,
one-use invitation, valid for 24 hours. Give it only to the intended representative.
They register as a recruiter and enter the code. Ordinary registration cannot claim
an existing company's offers or read its applications.

These commands use the same .data/studentjob.sqlite database as npm start. Invitation
tokens and session tokens are stored as hashes; no default account passwords exist.

## Hosting

For access outside your local network, deploy this Node application on a host with a
persistent writable volume. Serve the website and /api routes from the same hostname.
Set PUBLIC_ORIGIN to the exact public HTTPS origin, and COOKIE_SECURE=true when HTTPS
is enabled. A reverse proxy may terminate HTTPS and forward to the Node process.
PORT and HOST control the listening address. The default port is 3000.

Keep .data private and retain it across restarts/deployments. Do not serve the database
as a static file. Use a SQLite-aware backup process that includes current WAL state.
The supplied server only serves explicitly public files and assets; server source,
tests, private data and environment files are not public routes.

No external hosting account or public domain was configured by this change. The
server can be used immediately on the local computer/network; public delivery uses
the URL of the host where you run it.

## Delivery and permissions

- The server derives applicant identity from the signed-in session and the recipient
  from offer ownership. Browser-supplied recipient, name, email and role overrides
  cannot route an application to another person.
- Passwords use salted asynchronous scrypt. Sessions expire after seven days and use
  HttpOnly/SameSite cookies. Secure cookies are enabled for HTTPS deployments.
- Mutating API requests use a same-origin custom-header guard and origin checks.
- Applications are unique per student/offer. Closed, unknown, unowned and duplicate
  offers do not produce false delivery confirmations.
- Application writes are committed to SQLite before returning delivered: true.
- Each recruiter can list/read/review only their own applications. Students can list
  their own applications and withdraw pending ones. There is no public admin signup.
- Full messages remain plain text in storage and are escaped before display.
- A network error retains the student's draft and allows retry. If the response is
  lost after a commit, duplicate protection and My applications reveal the saved entry.
- Browser-local demo applications remain separate. No old message is automatically
  sent to a newly registered account.

SQLite runs in a dedicated worker to keep database work off the HTTP event loop.
The implementation uses the built-in [Node SQLite API](https://nodejs.org/api/sqlite.html).

## Checks

- npm test: existing browser regressions plus separate-session delivery, routing,
  literal message rendering, persistence, status updates and failed-send retry.
- npm run test:server: Jest API tests with coverage thresholds. Tests cover recipient
  isolation, authentication, permissions, validation, duplicate protection, private
  invitations, restart persistence, static-file boundaries and CSRF/origin rejection.
- npm run lint: checks the server and live client.
- npm run check:i18n: checks the FR/EN/AR dictionaries.

The browser test server uses a separate temporary database on port 3107; it does not
write test accounts or applications into the normal .data database.
