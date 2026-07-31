# ODI draft templates

One folder per AD bank. `src/lib/odi-docs.ts` reads these at request time and
serves a filled copy from `/api/clients/[id]/documents/[bank]`.

**These are the files the app actually uses.** They were copied from the
`<BANK>_ODI drafts/` folders in the repository root, which are kept as the
originals. Updating a draft in the root folder does nothing on its own — copy
it here too, or the app will keep serving the old version.

## What gets filled in

Conservatively, because these are legal submissions to the bank. Anything not
listed stays blank for a human to complete.

| Field | Source |
| --- | --- |
| AD bank name in the body | the bank button that was clicked |
| `For ……………` signature line | client name |
| `Date:` / `Dated:` when blank | today, Asia/Kolkata |
| Form FC — name of IE, contact person, e-mail ID, designated AD bank | client record |
| `{{client_name}}`, `{{contact_person}}`, `{{email}}`, `{{bank_name}}`, `{{date}}` | client record |

Deliberately **not** filled:

- Signature blocks belonging to someone else — the CA firm (`For …… & Co,
  Chartered Accountants`) and the foreign entity (`For ……INC`, or any block
  signed `Co-founder`). A wrong name on a bank submission is worse than a
  blank one.
- Remittance amounts, beneficiary and correspondent bank details, PAN, DPIN,
  UDIN, net worth, shareholding — none of these are in the client record.

`.doc` and `.pdf` drafts cannot be edited programmatically and are bundled
through untouched.

## Adding a bank

Add the folder here, then add an entry to `BANKS` in `src/lib/odi-docs.ts` and
to `BANKS` in `src/components/OdiDocumentsCard.tsx`.
