---
title: News
---

# News

{% set posts = collections.news | reverse %}
{% if posts.length %}
<ul class="post-list">
{% for post in posts %}
<li><a href="{{ post.url }}">{{ post.data.title }}</a> <time datetime="{{ post.date.toISOString() }}">{{ post.date | readableDate }}</time></li>
{% endfor %}
</ul>
{% else %}
No news yet.
{% endif %}
