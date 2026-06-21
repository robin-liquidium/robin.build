import { createFileRoute } from "@tanstack/react-router";
import { DocumentPage } from "@/src/features/revolut-personal/DocumentPage";

const UPDATED_AT = "June 21, 2026";
const CONTACT_EMAIL = "robin@robin.build";

export const Route = createFileRoute("/revolut-personal/terms")({
  head: () => ({
    meta: [
      { title: "Revolut Personal CLI Terms | robin.build" },
      {
        name: "description",
        content: "Terms for Robin's personal Revolut CLI.",
      },
    ],
  }),
  component: TermsRoute,
});

/** Displays the terms for the personal Revolut CLI. */
function TermsRoute() {
  return (
    <DocumentPage
      eyebrow="Personal finance utility"
      title="Revolut Personal CLI Terms"
      updatedAt={UPDATED_AT}
    >
      <p>
        This utility is a private, non-commercial tool used by Robin to inspect
        Robin&apos;s own personal Revolut account information.
      </p>

      <h2>Scope</h2>
      <p>
        The utility is read-only. It may request access to account information,
        balances, and transactions through Enable Banking. It does not support
        payments, transfers, or any action that moves money.
      </p>

      <h2>Authorization</h2>
      <p>
        Access only happens after Robin explicitly approves the Open Banking
        consent flow with Enable Banking and Revolut. Robin can revoke consent
        through Enable Banking, Revolut, or the local CLI.
      </p>

      <h2>Availability</h2>
      <p>
        This is a personal internal utility. It is provided as-is and is not a
        public financial product, advisory service, accounting service, or
        regulated payment service.
      </p>

      <h2>Security</h2>
      <p>
        The private signing key is stored locally on Robin&apos;s machine. This
        website does not publish the key, receive banking data, or exchange
        authorization codes on Robin&apos;s behalf.
      </p>

      <h2>Contact</h2>
      <p>For questions, contact {CONTACT_EMAIL}.</p>
    </DocumentPage>
  );
}
