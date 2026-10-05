---
title: Home
---

<section class="card">

## Next meetup

**Every Wednesday, 5:30&nbsp;PM to 10:00&nbsp;PM**<br />
Well Played Board Game Café

[Meetup details &rarr;](/meetups/)

</section>

{% set latest = collections.news | reverse | first %}
{% if latest %}
<section class="card">

## Latest news

[{{ latest.data.title }}]({{ latest.url }}) &middot; {{ latest.date | readableDate }}

</section>
{% endif %}
