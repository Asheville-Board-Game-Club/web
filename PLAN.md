# Plan: editable meetups (admin page + R2)

Goal: let 2–3 less technical editors change meetups and special events without git or JSON.

## Decisions

- Storage: one R2 bucket holding `meetups.json` and uploaded images (event images, venue maps).
- Site reads the data at runtime (Pages Function `GET /api/meetups`, or a public bucket domain).
- Admin page at `/admin`, protected by Cloudflare Access (one-time email codes, allowlist of editor emails).
- Form-based editing (no JSON) of both meetups and special events, including image upload.
- Saves go live immediately; no draft/publish step.
- A save is validated (same rules as `validate-meetups.ts`) in the admin page and again in the save Function.
- Concurrent edits: conditional write on ETag; a stale save is rejected, not merged.
- History: each save keeps a timestamped copy of the previous data; editors can restore from a History list.
- History retention: 60 days, via an R2 lifecycle rule.
- Venue map: editor uploads a map image with alt text and attribution; without one, the card shows the map link.
- Schedules: weekly on a day, monthly on the nth weekday (e.g. first Saturday, last Friday), and one-off dates.
- Special-event dates must be dates the meetup actually occurs (generalizes today's weekday rule).

## Work

- Extend the data model and validator for the new schedule kinds; update occurrence and schedule-description logic.
- Generalize the special-event date rule to "is an occurrence of the meetup".
- Create the R2 bucket, history lifecycle rule, and Access policy.
- Read Function and switch the site to fetch from it.
- Save Function: validate, back up the previous copy, conditional write.
- Image upload Function; image-exists check against R2 instead of the file system.
- Admin page: meetup editor, special-event editor, image upload, History with restore.
- Migrate the current `src/data/meetups.json` and images to R2; retire them from the repo, the build validation,
  the pre-commit hook, and the GitHub workflow.

## Open questions

- Images: never delete uploaded images (so restores always work), or let editors delete them?
- Who maintains the Access allowlist of editors (confirm: you, in the Cloudflare dashboard)?
- Read path: public bucket domain or a Pages Function?
- Past special events: leave them in the data, or let editors (or the system) clear them out?
- Monthly "nth weekday": which values are allowed (1st–4th and last; is a 5th needed)?
- Can editors create and delete whole meetups, or only edit existing ones?
