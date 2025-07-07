---
title: Week 5 - Sending our first patch 
description: Entry on the third part of contibuting to the linux kernel.
---

We received feedback from the internal reviewers of our course. They approved our patch, so we went to send our patch.

First we got the maintainers related to our patch using the `get_maintainer.pl` script. After fetching them, we modified
our `send-email` git command to include them.

```bash
git send-email -1 --suppress-cc=all \
    --to=<maintainer@email.com> \
    --cc=<my@email.com> \
    --cc=<mypartnert@email.com> \
    --cc=<reviewer1@email.com> \
    --cc=<reviewer2@email.com> \
    --cc=<reviewer3@email.com> \
    --cc=<commit_signer1@email.com> \
    --cc=<openlist1@email.com> \
    --cc=<openlist2@email.com>
```

After running this command, the patch was submitted. We sent it on the same day of our pitch, and we're waiting for approval.