// Shared navigation, footer and contact interactions.
// IMPORTANT: Replace the WhatsApp number below with the business number.
// Use country code 91 for India, without +, spaces or hyphens.
const WHATSAPP_NUMBER = "919359801945"; // Example: 919876543210 for +91 98765 43210

const header = document.getElementById("site-header");
if (header) {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navItems = [
    ["Home", "index.html"], ["About Us", "about.html"], ["Services", "services.html"],
    ["Industries", "industries.html"], ["Projects", "projects.html"], ["Contact", "contact.html"]
  ];
  header.innerHTML = `
    <header class="site-header">
      <div class="container nav-wrap">
        <a class="brand" href="index.html" aria-label="RDS home">
          <img class="brand-logo" src="assets/rds-logo.png" alt="RDS Road Marking &amp; Safety logo">
        </a>
        <button class="menu-toggle" id="menu-toggle" aria-label="Open navigation" aria-expanded="false">☰</button>
        <nav class="nav-links" id="nav-links" aria-label="Main navigation">
          ${navItems.map(([label, url]) => `<a href="${url}" class="${currentPage === url ? "active" : ""}">${label}</a>`).join("")}
        </nav>
      </div>
    </header>`;
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav-links");
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "×" : "☰";
  });
}

const footer = document.getElementById("site-footer");
if (footer) {
  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-about">
            <div class="brand footer-brand"><img class="brand-logo footer-logo" src="assets/rds-logo.png" alt="RDS Road Marking &amp; Safety logo"></div>
            <p>Road marking and safety construction solutions for roadways, industrial facilities and commercial spaces.</p>
          </div>
          <div><div class="footer-title">QUICK LINKS</div><div class="footer-links">
            <a href="about.html">About Us</a><a href="services.html">Our Services</a><a href="industries.html">Industries We Serve</a><a href="projects.html">Projects &amp; Gallery</a><a href="contact.html">Contact Us</a>
          </div></div>
          <div><div class="footer-title">CONTACT</div><div class="footer-links">
            <span>Kedgaon Road, Ahilyanagar, Maharashtra, India</span><a href="tel:+917720940925">7720940925</a><a href="tel:+919359801045">9359801045</a><a href="mailto:rdsroadmarking@gmail.com">rdsroadmarking@gmail.com</a><a href="contact.html">Send an Enquiry</a><a href="https://www.google.com/maps/search/?api=1&query=19.0871983,74.7071762" target="_blank" rel="noopener noreferrer">View Location ↗</a>
          </div></div>
        </div>
        <div class="footer-bottom"><span>© ${new Date().getFullYear()} RDS Road Marking &amp; Safety Construction. All rights reserved.</span><span>Designed for clarity. Built for safety.</span></div>
      </div>
    </footer>
    <a class="whatsapp-float" id="whatsapp-float" href="#" target="_blank" rel="noopener" aria-label="Enquire on WhatsApp">WhatsApp Enquiry</a>`;
}

function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
const floatButton = document.getElementById("whatsapp-float");
if (floatButton) {
  floatButton.href = whatsappUrl("Hello RDS, I would like to enquire about your road marking and safety services.");
}
const contactButton = document.getElementById("whatsapp-contact");
if (contactButton) {
  contactButton.href = whatsappUrl("Hello RDS, I would like to enquire about your services.");
}
const enquiryForm = document.getElementById("enquiry-form");
if (enquiryForm) {
  enquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (WHATSAPP_NUMBER.includes("X")) {
      alert("Please add your real WhatsApp number in js/main.js before using the enquiry form.");
      return;
    }
    const data = new FormData(enquiryForm);
    const message = [
      "Hello RDS, I would like to make an enquiry.",
      `Name: ${data.get("name")}`,
      `Mobile: ${data.get("phone")}`,
      `Service: ${data.get("service")}`,
      `Project details: ${data.get("message") || "Not provided"}`
    ].join("\n");
    window.open(whatsappUrl(message), "_blank", "noopener");
  });
}
