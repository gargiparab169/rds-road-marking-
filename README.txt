RDS ROAD MARKING & SAFETY CONSTRUCTION WEBSITE
================================================

HOW TO OPEN IN VS CODE
1. Extract the ZIP file.
2. Open Visual Studio Code.
3. Select File > Open Folder.
4. Select the extracted "rds-road-safety-website" folder.
5. Open index.html.
6. Recommended: install the "Live Server" extension in VS Code.
7. Right-click index.html and choose "Open with Live Server".

PAGES INCLUDED
- index.html       Home
- about.html       About Us
- services.html    Our Services
- industries.html  Industries We Serve
- projects.html    Projects / Gallery
- contact.html     Contact Us

SHARED FILES
- css/style.css    Website styling and responsive/mobile layout
- js/main.js       Shared navigation, footer, WhatsApp and enquiry form

IMPORTANT CUSTOMISATIONS BEFORE PUBLISHING
1. Open js/main.js.
2. The WhatsApp number is configured in js/main.js as 919359801045.
3. Confirm this is the correct business WhatsApp number before publishing.
4. Add the real mobile number and email address in contact.html.
5. Replace the sample gallery images in projects.html with genuine RDS project photographs.
6. Review all service descriptions and remove any service that RDS does not actually provide.
7. Add the official company logo if available. The current RDS text mark is a temporary logo treatment.

NOTES
- This is a front-end static website. The enquiry form opens WhatsApp with a pre-filled message; it does not save submissions to a database or send email.
- The project gallery includes bundled photographs and can additionally load photos/videos from Supabase.
- Google Maps is an embedded search for Kedgaon Road, Ahilyanagar. Confirm the exact business pin/address before publishing.
- Update page titles and descriptions if you change the business name or service area.

STATIC HOSTING
1. Upload every file and folder to the public directory of your hosting account.
2. Set index.html as the default document.
3. Use HTTPS and configure a custom 404 page if supported.
4. If you deploy to Netlify or Cloudflare Pages, the included netlify.toml/_headers files provide cache and security defaults.
5. Add your live domain to the search engine sitemap and canonical setup before publication.

SECURITY NOTES
- The Supabase browser client is bundled locally from the pinned 2.119.2 release at js/vendor/supabase-2.119.2.js.
- The Supabase anon key is public by design. Keep the service_role key out of this repository and browser code.
- Use HTTPS at the host and review the Supabase RLS policies before allowing public use.


SERVICE IMAGES
The six supplied service images are stored in assets/services/ and used on services.html and the homepage service preview. Keep the assets/services folder when uploading the website.


SERVICE IMAGES
The six service photos supplied by the user are stored in assets/services/ and referenced by index.html and services.html.

CONTACT
Phone: 7720940925 / 9359801045
Email: rdsroadmarking@gmail.com
WhatsApp enquiry button uses 7720940925.

DYNAMIC PROJECT GALLERY (SUPABASE)
- projects.html shows the bundled project photos and clickable full-size previews.
- admin.html is the private admin sign-in and photo upload/delete page.
- Follow SUPABASE-SETUP.md to create the Supabase table, public image bucket, security policies and admin account.
- Add the Supabase Project URL and anon/public key to js/supabase-config.js.
- Do not place a Supabase service_role key in browser code.
