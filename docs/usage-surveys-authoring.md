---
title: Create and publish surveys
---

# Create and publish surveys

Surveys must be enabled for your channel, and you need permission to manage survey
forms. The dashboard lets you create a questionnaire, test it and publish it for
collection. For implementation details, see [Surveys architecture](./architecture-surveys.md).

## Create a draft

Choose one of the three starting points:

| Option | Use it to |
| --- | --- |
| Create from scratch | Build a new questionnaire. |
| Import ODK form | Select an XLSForm workbook and review the imported draft. |
| Clone existing | Search available surveys and create an independent copy. |

Clone sources include eligible surveys from your channel, inherited published
surveys and publicly shared published surveys in other channels in the same portal.
A clone starts private and does not include responses or review history. Changes
to the original do not update the copy.

## Build the questionnaire

Use the question list to select and arrange questions, groups and repeats. Choose
the question type, enter its text and configure the relevant options. Use choice
lists for selection questions and translations where needed.

**Appearance** contains display options and media shown with the question. For
handwritten input, select **Image/photo**, then choose **Signature**, **Drawing**
or **Annotation** as its appearance. These remain image questions.

An annotation question can have a **Default background image** under Values.
Upload an image or select a survey asset. Respondents start with that image and
can choose another. This background is separate from an image displayed alongside
the question text. Save the survey first when an asset picker requires it before
uploading files.

Use conditions, required rules, calculations and validation rules when necessary.
Imported forms may contain settings that are preserved but not supported by the
current collector. The builder reports known issues rather than treating those
settings as working features.

## Configure participation and sharing

Choose who can fill the survey:

- **Current channel only**.
- **Child channels only**, including descendants at every depth.
- **Current and child channels**.

The owning channel retains management access. Public sharing permits other
channels in the portal to find and clone the published questionnaire; it does not
give them access to responses. Changes to participation and sharing on a published
survey take effect when you publish the next draft.

Collection settings specify the target: place, mapped area, respondent reference
or anonymous interview. They also define allowed repeated submissions and the
collector editing window. Submission limits apply to the target, never to the
interviewer. Anonymous interviews cannot have a per-respondent limit.

## Check and publish

1. Save the draft. Drafts may contain errors.
2. Open **Issues** to see known publication problems. Select an issue title to
   open the relevant question or survey settings.
3. Use **Preview** to exercise conditions, repeats, choices, calculations and media.
4. Resolve blocking issues and publish the version.

Previewing is a testing step, not proof of full ODK compatibility. Published
responses remain bound to the version that was answered; later drafts do not
rewrite those historical questions.

**Export XLSForm** downloads the current editable definition, including unsaved
edits. It does not publish the survey or package the referenced media files.
See [compatibility limits](./architecture-surveys-compatibility.md) before relying
on interchange with another collection tool.

Next: [results, review and exports](./usage-surveys-results.md).
