import { readFile, writeFile } from "node:fs/promises";

const membershipPath = new URL("../dist/membership/index.html", import.meta.url);
let html = await readFile(membershipPath, "utf8");

const styleId = "membership-review-v2-styles";
const previousStyles = new RegExp(`<style id="${styleId}">[\\s\\S]*?<\\/style>`);
html = html.replace(previousStyles, "");

const styles = `<style id="${styleId}">
.section_header76,
.section_faq1 {
  display: none;
}

.membership-review-v2 {
  background: #f7f8fa;
  color: #172033;
  padding: 6.5rem 0 5rem;
}

.mrv2-shell {
  margin: 0 auto;
  max-width: 80rem;
  padding: 0 2rem;
}

.mrv2-review-bar {
  align-items: center;
  border-bottom: 1px solid #d8dde5;
  color: #5d6675;
  display: flex;
  font-size: .875rem;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
}

.mrv2-review-label {
  color: #8d1736;
  font-weight: 700;
}

.mrv2-intro {
  align-items: end;
  display: grid;
  gap: 2rem;
  grid-template-columns: minmax(0, 1.35fr) minmax(18rem, .65fr);
  margin-bottom: 2.5rem;
}

.mrv2-eyebrow,
.mrv2-kicker {
  color: #005da8;
  font-size: .8rem;
  font-weight: 700;
  margin: 0 0 .5rem;
  text-transform: uppercase;
}

.mrv2-title {
  color: #121a2a;
  font-size: 4rem;
  line-height: 1.05;
  margin: 0 0 1rem;
}

.mrv2-lead {
  color: #505b6d;
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0;
  max-width: 44rem;
}

.mrv2-availability {
  background: #ffffff;
  border: 1px solid #d8dde5;
  border-radius: 8px;
  display: grid;
  gap: .75rem;
  padding: 1.25rem;
}

.mrv2-availability-row {
  align-items: center;
  display: flex;
  gap: .75rem;
  justify-content: space-between;
}

.mrv2-availability-row + .mrv2-availability-row {
  border-top: 1px solid #e7eaf0;
  padding-top: .75rem;
}

.mrv2-availability-status {
  color: #005da8;
  font-size: .875rem;
  font-weight: 700;
}

.mrv2-nonmember {
  align-items: center;
  background: #172033;
  border-radius: 8px;
  color: #ffffff;
  display: grid;
  gap: 2rem;
  grid-template-columns: minmax(0, 1fr) minmax(24rem, 1.25fr);
  margin-bottom: 3.5rem;
  padding: 1.75rem 2rem;
}

.mrv2-nonmember .mrv2-kicker {
  color: #9dcff5;
}

.mrv2-nonmember h2 {
  color: #ffffff;
  font-size: 1.75rem;
  margin: 0 0 .35rem;
}

.mrv2-nonmember p {
  color: #d7dde8;
  margin-bottom: 0;
}

.mrv2-baseline-list {
  display: grid;
  gap: .75rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
}

.mrv2-baseline-list li {
  border-left: 2px solid #5ca9e6;
  color: #ffffff;
  font-size: .95rem;
  line-height: 1.35;
  padding-left: .75rem;
}

.mrv2-section-heading {
  align-items: end;
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.mrv2-section-heading h2 {
  color: #121a2a;
  font-size: 2rem;
  margin: 0;
}

.mrv2-section-heading p {
  color: #667085;
  margin: 0;
  max-width: 31rem;
}

.mrv2-plans {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.mrv2-plan {
  background: #ffffff;
  border: 1px solid #cfd6e1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 25rem;
  padding: 1.75rem;
}

.mrv2-plan.is-featured {
  border-color: #9e1b3c;
  border-top-width: 4px;
  padding-top: calc(1.75rem - 3px);
}

.mrv2-plan-name {
  color: #121a2a;
  font-size: 1.75rem;
  margin: 0 0 1.5rem;
}

.mrv2-price-slot {
  border-bottom: 1px solid #e1e5eb;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
}

.mrv2-price-label {
  color: #8d1736;
  font-size: .8rem;
  font-weight: 700;
  margin-bottom: .25rem;
  text-transform: uppercase;
}

.mrv2-price-pending {
  color: #303a4d;
  font-size: 1.2rem;
  font-weight: 700;
}

.mrv2-plan-copy {
  color: #5b6575;
  line-height: 1.55;
  margin: 0 0 1.5rem;
}

.mrv2-plan-status {
  background: #f0f3f7;
  border: 1px solid #d6dce5;
  border-radius: 6px;
  color: #5b6575;
  font-weight: 700;
  margin-top: auto;
  padding: .8rem 1rem;
  text-align: center;
}

.mrv2-benefits {
  background: #005da8;
  border-radius: 8px;
  color: #ffffff;
  margin-top: 1rem;
  padding: 2rem;
}

.mrv2-benefits-header {
  align-items: end;
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.mrv2-benefits h2 {
  color: #ffffff;
  font-size: 1.75rem;
  margin: 0;
}

.mrv2-benefits-header p {
  color: #d8ebfa;
  margin: 0;
  max-width: 31rem;
}

.mrv2-benefit-list {
  display: grid;
  gap: .75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
}

.mrv2-benefit-list li {
  background: #ffffff;
  border-radius: 6px;
  color: #172033;
  font-weight: 700;
  line-height: 1.35;
  min-height: 6.5rem;
  padding: 1rem;
}

.mrv2-benefit-list li::before {
  color: #9e1b3c;
  content: "\\2713";
  display: block;
  font-size: 1.15rem;
  margin-bottom: .65rem;
}

@media screen and (max-width: 991px) {
  .membership-review-v2 {
    padding-top: 5.5rem;
  }

  .mrv2-intro,
  .mrv2-nonmember {
    grid-template-columns: 1fr;
  }

  .mrv2-title {
    font-size: 3.25rem;
  }

  .mrv2-plans {
    grid-template-columns: 1fr;
  }

  .mrv2-plan {
    min-height: 0;
  }

  .mrv2-benefit-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (max-width: 600px) {
  .membership-review-v2 {
    padding: 5rem 0 3rem;
  }

  .mrv2-shell {
    padding: 0 1rem;
  }

  .mrv2-review-bar,
  .mrv2-section-heading,
  .mrv2-benefits-header {
    align-items: flex-start;
    flex-direction: column;
    gap: .5rem;
  }

  .mrv2-title {
    font-size: 2.4rem;
  }

  .mrv2-nonmember,
  .mrv2-benefits {
    padding: 1.25rem;
  }

  .mrv2-baseline-list,
  .mrv2-benefit-list {
    grid-template-columns: 1fr;
  }

  .mrv2-benefit-list li {
    min-height: 0;
  }
}
</style>`;

const section = `<section class="membership-review-v2">
  <div class="mrv2-shell">
    <div class="mrv2-review-bar">
      <span class="mrv2-review-label">Staff review draft</span>
      <span>Not published to the live website</span>
    </div>
    <div class="mrv2-intro">
      <div>
        <p class="mrv2-eyebrow">Membership</p>
        <h1 class="mrv2-title">Choose how you play</h1>
        <p class="mrv2-lead">Compare membership options first, then choose the plan that fits how often and where you play.</p>
      </div>
      <div class="mrv2-availability" aria-label="Membership availability by location">
        <div class="mrv2-availability-row"><strong>Middleton</strong><span class="mrv2-availability-status">Memberships available</span></div>
        <div class="mrv2-availability-row"><strong>Rye</strong><span class="mrv2-availability-status">Waitlist only</span></div>
      </div>
    </div>

    <section class="mrv2-nonmember" aria-labelledby="nonmember-heading">
      <div>
        <p class="mrv2-kicker">Start without a membership</p>
        <h2 id="nonmember-heading">Non-Member</h2>
        <p>Create a free account and pay as you play.</p>
      </div>
      <ul class="mrv2-baseline-list">
        <li>No annual dues</li>
        <li>Book courts and events</li>
        <li>Access academy classes</li>
      </ul>
    </section>

    <div class="mrv2-section-heading">
      <h2>Paid memberships</h2>
      <p>The layout is ready for the approved pricing, billing cadence, court fees, booking windows, and location rules.</p>
    </div>
    <div class="mrv2-plans">
      <article class="mrv2-plan">
        <h3 class="mrv2-plan-name">Blue</h3>
        <div class="mrv2-price-slot">
          <div class="mrv2-price-label">Pricing update</div>
          <div class="mrv2-price-pending">Exact terms pending</div>
        </div>
        <p class="mrv2-plan-copy">The approved dues and plan-specific benefits will replace this review placeholder.</p>
        <div class="mrv2-plan-status" aria-disabled="true">Purchase link held for final pricing</div>
      </article>
      <article class="mrv2-plan is-featured">
        <h3 class="mrv2-plan-name">Burgundy</h3>
        <div class="mrv2-price-slot">
          <div class="mrv2-price-label">Pricing update</div>
          <div class="mrv2-price-pending">Exact terms pending</div>
        </div>
        <p class="mrv2-plan-copy">The approved dues and plan-specific benefits will replace this review placeholder.</p>
        <div class="mrv2-plan-status" aria-disabled="true">Purchase link held for final pricing</div>
      </article>
      <article class="mrv2-plan">
        <h3 class="mrv2-plan-name">Blue Partners</h3>
        <div class="mrv2-price-slot">
          <div class="mrv2-price-label">Pricing update</div>
          <div class="mrv2-price-pending">Exact terms pending</div>
        </div>
        <p class="mrv2-plan-copy">The approved dues, household eligibility, and plan-specific benefits will replace this review placeholder.</p>
        <div class="mrv2-plan-status" aria-disabled="true">Purchase link held for final pricing</div>
      </article>
    </div>

    <section class="mrv2-benefits" aria-labelledby="shared-benefits-heading">
      <div class="mrv2-benefits-header">
        <h2 id="shared-benefits-heading">Included with every paid membership</h2>
        <p>Shared across Blue, Burgundy, and Blue Partners. Exact discounts and eligibility rules remain subject to review.</p>
      </div>
      <ul class="mrv2-benefit-list">
        <li>Discounted private facility rentals</li>
        <li>Discounted private parties</li>
        <li>Discounted glow events</li>
        <li>Referral bonus when a friend attends their first club event</li>
      </ul>
    </section>
  </div>
</section>`;

const existingReviewStart = html.indexOf('<section class="membership-review-v2">');
const sectionStart = existingReviewStart === -1
  ? html.indexOf('<section class="section_layout396">')
  : existingReviewStart;
const faqStart = html.indexOf('<section class="section_faq1', sectionStart);

if (sectionStart === -1 || faqStart === -1) {
  throw new Error("Could not find the membership options and FAQ section boundaries.");
}

html = html.slice(0, sectionStart) + section + html.slice(faqStart);
html = html.replace("</head>", `${styles}</head>`);

await writeFile(membershipPath, html, "utf8");
console.log("Built membership review draft v2 in dist/membership/index.html");
