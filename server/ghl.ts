/**
 * GoHighLevel API v2 helper
 * Docs: https://highlevel.stoplight.io/docs/integrations/
 */

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

export type GHLContactInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  name?: string;
  companyName?: string;
  tags?: string[];
  customFields?: { key: string; field_value: string }[];
  source?: string;
};

/**
 * Look up a contact by email in the GHL location.
 * Returns the first match or null.
 */
export async function ghlFindContactByEmail(email: string): Promise<{ id: string } | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  const url = `${GHL_BASE}/contacts/?locationId=${locationId}&email=${encodeURIComponent(email)}&limit=1`;
  const res = await fetch(url, { headers: ghlHeaders() });
  if (!res.ok) return null;
  const data = (await res.json()) as { contacts?: { id: string }[] };
  return data.contacts?.[0] ?? null;
}

/**
 * Create a new contact in GHL.
 * Returns the created contact object.
 */
export async function ghlCreateContact(input: GHLContactInput): Promise<{ id: string } | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  const body = {
    locationId,
    ...input,
  };
  const res = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("[GHL] createContact failed:", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { contact?: { id: string } };
  return data.contact ?? null;
}

/**
 * Update an existing GHL contact by ID.
 */
export async function ghlUpdateContact(
  contactId: string,
  input: Partial<GHLContactInput>
): Promise<void> {
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
    method: "PUT",
    headers: ghlHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    console.error("[GHL] updateContact failed:", res.status, await res.text());
  }
}

/**
 * Upsert a contact: find by email, update if found, create if not.
 * Returns the contact id.
 */
export async function ghlUpsertContact(input: GHLContactInput): Promise<string | null> {
  if (input.email) {
    const existing = await ghlFindContactByEmail(input.email);
    if (existing) {
      // Update tags on existing contact
      if (input.tags?.length) {
        await ghlAddTags(existing.id, input.tags);
      }
      // Update custom fields and other fields on existing contact
      const updatePayload: Partial<GHLContactInput> = {};
      if (input.customFields?.length) updatePayload.customFields = input.customFields;
      if (input.companyName) updatePayload.companyName = input.companyName;
      if (input.phone) updatePayload.phone = input.phone;
      if (Object.keys(updatePayload).length > 0) {
        await ghlUpdateContact(existing.id, updatePayload);
      }
      return existing.id;
    }
  }
  const created = await ghlCreateContact(input);
  return created?.id ?? null;
}

/**
 * Add tags to an existing contact.
 */
export async function ghlAddTags(contactId: string, tags: string[]): Promise<void> {
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({ tags }),
  });
  if (!res.ok) {
    console.error("[GHL] addTags failed:", res.status, await res.text());
  }
}

/**
 * Trigger a GHL workflow for a contact by workflow ID.
 * Uses the "Add Contact to Workflow" endpoint.
 */
export async function ghlTriggerWorkflow(contactId: string, workflowId: string): Promise<void> {
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}/workflow/${workflowId}`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    console.error("[GHL] triggerWorkflow failed:", res.status, await res.text());
  }
}

// ── Workflow IDs from GHL ─────────────────────────────────────────────────────
export const GHL_WORKFLOWS = {
  FREE_LISTING_OUTREACH:   "b5a4c67c-18fb-402c-893f-41bbdbbf23cc",
  PREMIUM_UPGRADE_PUSH:    "34745d92-5e27-4f30-af2f-5fac3ce98871",
  SAAS_PUSH:               "c0e61628-e798-4c93-a600-da6db86f954e",
  CLAIM_REQUEST_APPROVED:  "9987c8ad-003e-47b3-9a74-ee6ed7c16431",
  CLAIM_REQUEST_REJECTED:  "7ca68420-b384-43e4-b2be-04b2f661538b",
  CONTACT_FORM_SUBMITTED:  "8f9f2422-3524-4d92-b5bd-669ede0fb974",
  FORGOTTEN_PASSWORD:      "934486ef-8bdb-4067-82ae-04849977683a",
  LISTING_UPGRADED_PREMIUM:"52042d6a-cbf3-4913-b22d-8c5a44c49286",
  NEW_BUSINESS_REQUEST:    "eaadc086-8d88-4930-b3ab-a12fde42adbf",
  NEW_CLAIM_REQUEST:       "8ba7e46e-6312-4fad-b670-cceb5245fcce",
  NEW_LISTING_ADDED:       "4b45199a-0814-48e6-8dea-b1a09fd84587",
  NEW_USER_CREATED:        "f1674a69-441f-4d88-824e-88bd21f55f70",
  RESET_PASSWORD:          "22bbcc3e-7d7a-4671-99f6-c98c07fa627d",
} as const;
