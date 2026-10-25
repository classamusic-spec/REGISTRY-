# A Sweet Little Hunny — Baby Shower Registry

Honey-and-gingham baby shower registry for Genesis Class. Every gift links to Walmart.
When a guest marks a gift as purchased, it greys out for everyone, so nobody buys it twice.

## How it works

- **Purchase** opens the item on Walmart in a new tab. The guest then taps **Yes, I bought it**.
- The claim is atomic (Redis `HSETNX`): if two guests confirm at the same moment, only the first wins
  and the second is told to pick another gift.
- Guests can **undo** their own mark from the same browser.
- **Diapers, wipes and gift cards** never grey out (the diaper raffle needs lots of packs). Instead they
  show how many guests have sent one.
- **Host view** at `/admin` (needs `ADMIN_KEY`) shows who bought what, with their notes, for thank-you
  cards. The host can un-mark items there.

## Editing the registry

- Items live in `data/registry.json`. Each item has `id`, `category`, `name`, `url`, and optional
  `title` and `image` (a product image URL). Set `"multi": true` for items that should never grey out.
- Shower details (name, date, time) are in `lib/config.js`.

## Deploying on Vercel

1. Import the repo into Vercel (framework: Next.js; no settings to change).
2. **Storage → Create → Upstash Redis** (free tier), then connect it to this project. This adds
   `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Without it, purchases are only kept in memory and are lost.
3. Environment variables:
   - `ADMIN_KEY`: any password, used for `/admin`
   - `NEXT_PUBLIC_INVITATION_URL`: the Canva invitation link (shows the "the invitation" cloud button)
4. Redeploy.

## Linking from the Canva invitation

In Canva, select an element (for example the diaper sign, or a new "Registry" sign), choose **Link**,
and paste the Vercel URL.

## Local development

```bash
npm install
npm run dev
```
