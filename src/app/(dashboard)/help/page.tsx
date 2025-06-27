import Link from 'next/link';

export default function DashboardHelpPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">DRAFT --- Using Your Dashboard</h1>
      <nav className="mb-8">
        <ul className="list-disc list-inside space-y-2 text-sky-700">
          <li>
            <a href="#profile">Managing Your Profile</a>
          </li>
          <li>
            <a href="#subscriptions">Subscription Plans &amp; Management</a>
          </li>
          <li>
            <a href="#enhanced-products">Enhanced Products</a>
          </li>
          <li>
            <a href="#agent-info">Agent Confidential Information</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
          <li>
            <a href="#contact">Contact/Support</a>
          </li>
        </ul>
      </nav>
      <section id="profile" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Managing Your Profile</h2>
        <p>
          Update your personal and company information, billing address, and contact details in the
          Profile section. Changes are saved automatically or via the Save button.
        </p>
      </section>
      <section id="subscriptions" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Subscription Plans &amp; Management</h2>
        <p>
          View, upgrade, or cancel your subscription plans. See your current plan, billing cycle,
          and payment history. For more details, visit the Subscriptions page in your dashboard.
        </p>
      </section>
      <section id="enhanced-products" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Enhanced Products</h2>
        <p>
          Search, add, and manage enhanced products linked to your subscription. Click the{' '}
          <b>plus</b> button to add a product, and edit confidential information as needed.
        </p>
      </section>
      <section id="agent-info" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Agent Confidential Information</h2>
        <p>
          Edit and save confidential information for each product using the markdown editor. This
          information is private and only visible to you and authorized agents.
        </p>
      </section>
      <section id="faq" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">FAQ</h2>
        <ul className="list-disc list-inside">
          <li>
            <b>How do I change my subscription?</b> Go to the Subscriptions page and select a new
            plan.
          </li>
          <li>
            <b>How do I add an enhanced product?</b> Use the search bar and click the plus button
            next to the product.
          </li>
          <li>
            <b>Who can see my confidential information?</b> Only you and authorized agents.
          </li>
        </ul>
      </section>
      <section id="contact" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Contact/Support</h2>
        <p>
          If you need help, contact our support team{' '}
          <Link
            href="https://villma.ai/contacts"
            target="_blank"
            className="text-sky-700 underline"
          >
            from our website
          </Link>
        </p>
      </section>
    </div>
  );
}
