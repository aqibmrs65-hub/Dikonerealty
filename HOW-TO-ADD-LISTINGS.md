# Site pages

- `index.html` is Home (search, listings, developers). The Listing Manager edits this page's data.
- `projects.html` holds the detailed project sections. `process.html` is Our Process. `contact.html` is the contact page and consultation form.
- Consultation form: requests open WhatsApp for Haroon Rasheed or Umesh Nathalal. The numbers are at the top of `contact-form.js`.
- Emails shown on the site: info@dikonerealty.com and sales@dikonerealty.com (in `contact.html` and the footer of every page).
- When uploading to GitHub, never overwrite `content/` or `assets/` with older copies.

---

# Easiest way: the Listing Manager (no GitHub, no login)

1. Unzip this site to a normal folder, e.g. Desktop > dikone-site. Keep a spare copy of the zip as a backup.
2. Open **Dikone-Listing-Manager.html** (a separate file, NOT inside the site folder) in **Google Chrome or Microsoft Edge on a computer**.
3. Click **Choose website folder** and pick the dikone-site folder itself (not Desktop/Documents/Downloads).
4. Add listings, drag rows to reorder, switch Show on/off, edit the homepage headline.
5. Click **Save changes**.
6. In Netlify > your site > **Deploys**, drag the whole dikone-site folder in. Done.

The `/admin` folder is the optional Sveltia dashboard (needs GitHub): see SVELTIA-SETUP-GUIDE.md.
Note: a hidden listing is only hidden visually; its text remains in content/listings.json.

---

# Adding projects to the website

## Easiest: the dashboard
1. Open https://YOUR-SITE/admin/ and sign in (needs the one-time GitHub + Netlify setup).
2. Current opportunities -> Add Listing. Fill in the form.
   - Photo: landscape photos use "Fill the card"; posters use "Show the whole image".
   - Videos: add MP4 files (keep each under about 10 MB). They only download when a visitor opens the project.
   - Detail sections: titles like "Payment plan" with one line per row.
     Write  "Studio — AED 1.7M"  (space, long dash, space) to show a label and a value in two columns.
3. Save -> Publish. The site updates in about a minute.
Drag listings up or down in the list to change their order on the website.
Switch off "Show on website" to hide a listing without deleting it.

## Without the dashboard
Edit content/listings.json, put pictures/videos in assets/listings/, then re-deploy the folder.
Each project can be shared directly with a link like:  https://YOUR-SITE/#project-shahrukhz-residences

## Note
index.html also contains a backup copy of the listings (used only if content/listings.json can't be loaded,
for example when the file is opened by double-click). The live site always uses content/listings.json.

## The homepage headline ("New update" banner)
- In the dashboard open "Homepage headline (news banner)". Change the headline, text, picture, key points and buttons.
- To feature a different project: put that project's ID (shown in content/listings.json, e.g. valia) in "Project to open".
- To hide the banner without deleting it, switch off "Show the headline on the website".
- Without the dashboard: edit content/headline.json (and set "enabled" to false to hide it).
