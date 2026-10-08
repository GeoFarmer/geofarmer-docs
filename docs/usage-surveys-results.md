---
title: Review survey results and export responses
---

# Review survey results and export responses

Open a survey's Results page with submission-management permission in the relevant
participation channel. Choose a published version and channel, then apply any
additional filters.

## Explore results

**Overview** summarizes processed responses. Numeric questions show statistics;
choice questions show distributions. Questions without a useful aggregate offer
paged answer previews. **Individual responses** lets you inspect a complete saved
response and its attachments.

Submitted responses count without mandatory review. Accepted responses also count.
Rejected responses and drafts are excluded from aggregates. Use the status filter
to find rejected responses or show all statuses in the individual response list.
Responses waiting for results processing remain saved, even before appearing in
statistics. Persistent processing failures require an administrator to investigate.

## Review a response

Open an individual response to see its review panel:

- **Accept** confirms that the response should remain in results.
- **Reject** requires a reason and excludes the response from results. It does not
  delete the answers.
- **Return to submitted** reverses a review decision and returns the response to
  the ordinary, included state.

The panel shows the current status and whether the response is included in results.
Expand **Review history** to see previous decisions, reviewers, dates, reasons and
acknowledged flags. If another person changes the response first, reload it before
making your decision.

Moderation does not edit the respondent's answers. Only the original collector can
propose corrections within the collection workflow. Dashboard review of pending
late/conflicting correction proposals is still planned.

## Needs attention

Use the **Attention** filter to find responses with active flags. Flags are hints
for review and do not automatically reject a response or exclude it from results.

| Flag | What to check |
| --- | --- |
| Possible duplicate | Another response has identical answers for the same target and version. Follow **View matching response** and decide whether both are legitimate. |
| Submission limit exceeded | More active responses exist for this target than the survey permits. Consider whether an extra interview is valid. |
| Suspicious future timestamp | The device reported a time more than five minutes ahead of the server. Check the collection context or device clock. |

Multiple interviews by one collector are normal. Targets are compared independently:
two mapped areas on one place are different targets. When repeat submissions are
allowed, duplicate hints additionally require collection times within five
minutes. Anonymous interviews are not compared. Offline uploads are compared by
collection time, not by when the batch arrives.

Accepting or rejecting acknowledges the active flags, records them in history and
clears the attention badge. Corrected answers are checked again when an edit is
applied. A matching upload retry with the same submission ID does not create a
second response.

Missing-attachment flags are not implemented yet; a file may still be transferring
from an offline device.

## Export CSV

Select **Export CSV** to request the complete export. Page filters do not restrict
it: all versions and saved response statuses in participation channels you may
manage are included. Rejected responses remain in the file, alongside their status
and rejection reason. Responses waiting for result processing are included too.

The export contains one row per answer, with response information, question and
repeat paths, original values and available normalized unit values. It is not an
archive of attachment file contents.

Large exports run in the background. You receive a notification when the download
is ready, plus an email if a verified address is available. An existing current
export may download immediately. Download links expire after seven days. Up to
three new exports per hour can be requested; reusing an active or current export
does not consume that allowance.
