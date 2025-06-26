import Link from 'next/link';

export default function PublicHelpPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Villma Customer App</h1>
      <nav className="mb-8">
        <ul className="list-disc list-inside space-y-2 text-sky-700">
          <li>
            <a href="#register">How to Register</a>
          </li>
          <li>
            <a href="#login">How to Log In</a>
          </li>
          <li>
            <a href="#troubleshooting">Troubleshooting</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>
      </nav>
      <section id="register" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Register</h2>
        <p>
          To create a new account, click the <b>Register</b> link on the login page. Fill in your
          email, password, and any required information. After submitting, check your email for a
          confirmation link if required.
        </p>
      </section>
      <section id="login" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Log In</h2>
        <p>
          Enter your registered email and password on the login page. If you forgot your password,
          use the <b>Forgot Password</b> link to reset it.
        </p>
      </section>
      <section id="troubleshooting" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Troubleshooting</h2>
        <ul className="list-disc list-inside">
          <li>
            Didn&#39;t receive a confirmation email? Check your spam folder or{' '}
            <Link href="#faq">see FAQ</Link>.
          </li>
          <li>Can&#39;t log in? Double-check your email and password, or reset your password.</li>
          <li>
            Still having issues? <Link href="/contact">Contact support</Link>.
          </li>
        </ul>
      </section>
      <section id="faq" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">FAQ</h2>
        <ul className="list-disc list-inside">
          <li>
            <b>Can I use the same email for multiple accounts?</b> No, each email must be unique.
          </li>
          <li>
            <b>How do I reset my password?</b> Use the <b>Forgot Password</b> link on the login
            page.
          </li>
          <li>
            <b>How do I contact support?</b> Use the <Link href="/contact">Contact</Link> page or
            email support@villma.com.
          </li>
        </ul>
      </section>
    </div>
  );
}
