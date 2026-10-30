# EmailJS contact form setup

The portfolio sends contact form submissions directly from the browser using EmailJS. There is no local Node.js backend. The EmailJS public key is expected to be visible in the page; never add a Gmail password, app password, or EmailJS private key to the website.

## Connect Gmail and create a template

1. Create an account at [EmailJS](https://www.emailjs.com/) and add an Email Service connected to the Gmail account where you want to receive messages.
2. In EmailJS, create an email template. Set its recipient to your Gmail address and use these template variables in the message:
   - `{{name}}`
   - `{{email}}`
   - `{{subject}}`
   - `{{message}}`
3. Set the template's Reply-To address to `{{reply_to}}` so you can reply directly to the sender.
4. Copy the Service ID, Template ID, and Public Key from your EmailJS dashboard.
5. In `index.html`, replace the three `YOUR_EMAILJS_...` values on the contact form with those IDs and the public key.
6. In EmailJS, configure allowed origins/domain restrictions for your deployed portfolio. For local testing, serve the site over HTTP using VS Code Live Server.
7. Submit a test message and confirm it arrives in the configured Gmail inbox. Check Spam if it does not appear.

The form displays an explicit setup message until all three EmailJS values have been configured. The client-side public key is not a secret; restrict the EmailJS service to your website and configure the usage limits available in your account.

The EmailJS browser SDK is pinned to version 4.4.1 and protected with Subresource Integrity. If you update the SDK URL, update and verify its integrity hash for the exact file as well.
