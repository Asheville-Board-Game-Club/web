---
title: Newsletter Sign-up
permalink: /newsletter/signup/
---

# Newsletter Sign-up

Keep up with all the meetups and special events.

{# Posts straight to Kit rather than using its embed script, which shows this form as a pop-up. #}
<form class="signup" action="{{ site.newsletterFormUrl }}" method="post">
<input type="email" name="email_address" placeholder="Email address" aria-label="Email address" autocomplete="email" required />
<button class="button secondary" type="submit">Subscribe</button>
</form>

<p class="fine-print">We won't send you spam or sell your email address. Unsubscribe at any time.</p>
