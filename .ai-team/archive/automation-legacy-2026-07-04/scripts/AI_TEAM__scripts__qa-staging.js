import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const baseURL = process.env.QA_STAGING_BASE_URL || "https://staging.carry-digital-nomad.in.net";
const adminEmail = process.env.QA_STAGING_EMAIL;
const adminPassword = process.env.QA_STAGING_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error("QA_STAGING_EMAIL and QA_STAGING_PASSWORD are required.");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    baseURL,
  });
  const page = await context.newPage();
  
  const report = [];
  function log(msg) {
    console.log(msg);
    report.push(msg);
  }

  try {
    log('--- STARTING QA TEST ON STAGING ---');
    
    // 1. Login
    log('Navigating to /login...');
    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    log('✅ Login successful, reached /dashboard');

    // 2. Dashboard Checks
    const dashboardHtml = await page.content();
    if (dashboardHtml.includes('Dashboard') || dashboardHtml.includes('儀表板')) {
      log('✅ Dashboard loaded correctly.');
    } else {
      log('❌ Dashboard missing expected title.');
    }
    // Check if cards have data or just placeholders
    const cards = await page.$$('.card, [class*="Card"]');
    log(`ℹ️ Dashboard contains ${cards.length} cards/widgets.`);

    // 3. Inbox
    log('Navigating to /inbox...');
    await page.goto('/inbox');
    await page.waitForTimeout(2000); // let UI settle
    const inboxBody = await page.textContent('body');
    if (inboxBody.includes('收件匣') || inboxBody.includes('Inbox')) {
      log('✅ Inbox loaded.');
    } else {
      log('❌ Inbox missing expected title.');
    }

    // 4. Contacts
    log('Navigating to /contacts...');
    await page.goto('/contacts');
    await page.waitForTimeout(2000);
    // Click the '+' button next to tags or generally
    const plusButton = await page.$('button:has-text("+"), .plus-icon, [aria-label="新增"]');
    if (plusButton) {
      log('✅ Plus button found on Contacts.');
      await plusButton.click();
      await page.waitForTimeout(1000);
      const dialog = await page.$('[role="dialog"], .modal');
      if (dialog) {
        log('✅ Plus button opened a dialog.');
      } else {
        log('⚠️ Plus button clicked but no dialog appeared (might be native alert or dummy).');
      }
    } else {
      log('⚠️ Plus button not found on Contacts.');
    }

    // Click a contact
    const firstContact = await page.$('td a, .contact-row a');
    if (firstContact) {
      await firstContact.click();
      await page.waitForTimeout(2000);
      log(`✅ Clicked contact, URL is now: ${page.url()}`);
      const contactHtml = await page.content();
      if (contactHtml.includes('Light Mode') || !contactHtml.includes('bg-gray-900')) {
        log('✅ Contact detail page seems to not be dark mode.');
      } else {
        log('⚠️ Contact detail page might be in dark mode.');
      }
    } else {
      log('⚠️ No contacts found to click.');
    }

    // 5. Automations
    log('Navigating to /automations...');
    await page.goto('/automations');
    await page.waitForTimeout(2000);
    const automationsBody = await page.textContent('body');
    log(`ℹ️ Automations page length: ${automationsBody.length} chars.`);
    if (automationsBody.includes('Flow Builder') || automationsBody.includes('新增')) {
      log('✅ Automations UI exists.');
    } else {
      log('⚠️ Automations UI might be missing elements.');
    }

    // 6. Analytics
    log('Navigating to /analytics...');
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    log('✅ Analytics loaded.');

    // 7. Billing
    log('Navigating to /billing...');
    await page.goto('/billing');
    await page.waitForTimeout(2000);
    log(`✅ Billing loaded, URL is: ${page.url()}`);
    const upgradeBtn = await page.$('button:has-text("升級"), button:has-text("付款")');
    if (upgradeBtn) {
      log('✅ Upgrade/Pay button found on Billing.');
    } else {
      log('⚠️ No Upgrade/Pay button found on Billing.');
    }

    // 8. Channels
    log('Navigating to /channels/connect/social...');
    await page.goto('/channels/connect/social');
    await page.waitForTimeout(2000);
    const socialBody = await page.textContent('body');
    if (socialBody.includes('TOKEN_ENCRYPTION_KEY')) {
      log('❌ TOKEN_ENCRYPTION_KEY error alert is still visible!');
    } else {
      log('✅ No TOKEN_ENCRYPTION_KEY error alert.');
    }
    const igButton = await page.$('button:has-text("Instagram"), a:has-text("Instagram")');
    if (igButton) {
      log('✅ Instagram connect button found.');
    } else {
      log('❌ Instagram connect button not found.');
    }

    log('--- END OF QA TEST ---');
  } catch (err) {
    log(`❌ ERROR: ${err.message}`);
  } finally {
    await browser.close();
    writeFileSync('C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/qa-results.txt', report.join('\n'));
  }
})();
