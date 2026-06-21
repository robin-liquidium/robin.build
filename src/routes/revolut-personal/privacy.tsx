import { createFileRoute } from "@tanstack/react-router";
import { DocumentPage } from "@/src/features/revolut-personal/DocumentPage";

const UPDATED_AT = "June 21, 2026";
const CONTACT_EMAIL = "robin@robin.build";

export const Route = createFileRoute("/revolut-personal/privacy")({
  head: () => ({
    meta: [
      { title: "Revolut Personal CLI Privacy Notice | robin.build" },
      {
        name: "description",
        content: "Privacy notice for Robin's personal Revolut CLI.",
      },
    ],
  }),
  component: PrivacyRoute,
});

/** Displays the privacy notice for the personal Revolut CLI. */
function PrivacyRoute() {
  return (
    <DocumentPage
      eyebrow="Personal finance utility"
      title="Revolut Personal CLI Privacy Notice"
      updatedAt={UPDATED_AT}
    >
      <p>
        This page describes a personal, non-commercial command-line utility used
        by Robin to read Robin&apos;s own Revolut account information through
        Enable Banking.
      </p>

      <h2>What It Accesses</h2>
      <p>
        When Robin explicitly authorizes access, the utility can read linked
        account details, balances, and transactions through Enable Banking. It
        does not initiate payments, transfers, card actions, or account changes.
      </p>

      <h2>Where Data Is Stored</h2>
      <p>
        Financial data fetched by the utility is stored locally on Robin&apos;s
        own machine for personal analysis. This website does not receive, store,
        process, or publish Robin&apos;s banking data.
      </p>

      <h2>Callback Codes</h2>
      <p>
        The authorization callback page may display a short-lived one-time code
        returned by Enable Banking after Robin approves access. That code is
        intended to be copied into the local CLI and exchanged from Robin&apos;s
        machine. It is not useful without the locally stored private key.
      </p>

      <h2>Third Parties</h2>
      <p>
        Enable Banking and Revolut process authorization and account data as
        part of the Open Banking consent flow. Their own terms and privacy
        notices apply to those services.
      </p>

      <h2>Contact</h2>
      <p>
        For data protection questions about this personal utility, contact
        {` ${CONTACT_EMAIL}`}.
      </p>
    </DocumentPage>
  );
}
