---
title: Week 5 - Making a first patch
description: Entry on the second part of contibuting to the linux kernel.
---

### Setting up the branch

We did the first part as described in the second tutorial: cloned the tree on the `testing` branch and created our own branch to isolate
our modifications.

### Developing the patch

To remove the duplicated code, we decided to consolidate the functionality of both `sca3000_read_data()` and `sca3000_read_data_short()` inside
the `sca3000_read_data()` one.

```c
static int sca3000_read_data(struct sca3000_state *st,
                 u8 reg_address_high,
                 int len)
{
    int ret;
    struct spi_transfer xfer[2] = {
        {
            .len = 1,
            .tx_buf = st->tx,
        }, {
            .len = len,
            .rx_buf = st->rx,
        }
    };

    st->tx[0] = SCA3000_READ_REG(reg_address_high);
    ret = spi_sync_transfer(st->us, xfer, ARRAY_SIZE(xfer));
    if (ret) {
        dev_err(&st->us->dev, "problem reading register\n");
        return ret;
    }

    return 0;
}
```

We saw a lot of other points that could be improved in the code, such as refactoring the use of `goto`s to normal returns. But we decided to tackle
just one refactoring at a time.

After making the changes, we compiled the kernel and booted the VM in order to ensure our modification didn't break the building process.

### Commiting the changes

Then we commited our changes. We ensured the name and email configuration was correct, in order to use the `--signoff` option on `git`. We wrote the 
following commit message: 
```
iio: accel: sca3000: remove duplicated code in sca3000_read_data

Remove duplicated code between sca3000_read_data and
sca3000_read_data_short functions.

The common behavior is centralized in just one
sca3000_read_data function and used for every
case.

Signed-off-by: My Name <my@email.com>
Co-developed-by: My Partner Name <mypartner@email.com>
Signed-off-by: My Partner Name <mypartner@email.com>
```

### Checking for code style problems

We ran the `checkpatch` script to ensure our patch didn't introduce code style problems. The output assured it had no problems.

### Configuring git for sending patches

The patches were sent by my partner. We had to configure `git` to use his credentials in order to send the patch by email.

We first tried to configure his institutional email (`@alumni.usp.br`). Our university's provider doesn't allows the use of 
app passwords, so we had to use his personal email.

### Sending contributions for internal review

Before sending the patch to the mailing lists and maintainers, we ran a `dry run` to check if our patch structure was correct,
and then sent it to a temporary email of this course for internal reviews.