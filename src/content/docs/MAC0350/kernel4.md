---
title: Week 7 - Discussing the patch 
description: Entry on the fourth part of contibuting to the linux kernel.
---

### [PATCH v1]: style changes

Our first feedback was given by Andy Shevchenko, one of the reviewers.

```diff
> Remove duplicated code between sca3000_read_data and
> sca3000_read_data_short functions.
>
> The common behavior is centralized in just one sca3000_read_data
> function and used for every case.

We refer to the functions as func() (mind the parentheses).

...

> +       ret = spi_sync_transfer(st->us, xfer, ARRAY_SIZE(xfer));
> +       if (ret) {
> +               dev_err(&st->us->dev, "problem reading register\n");

> +               return ret;
> +       }
>
> -       return spi_sync_transfer(st->us, xfer, ARRAY_SIZE(xfer));
> +       return 0;

Simply return ret instead of 4 LoCs we get only one.
```

The first was a minor mistake, but the second was a refactoring change that was a little different from our proposal (as it is present in other parts of code). Nonetheless, 
we worked on a new version to adress this suggestions.

### [PATCH v2]: legacy code

After the patch we received an enlightening review from Jonathan Cameron, the maintainer.

```diff
Look at the helpers that exist for spi sequences like this.
This is an old driver so may not be making full use of newer infrastructure.

In particular a lot of these can probably become spi_w8r8()and
it may make sense to move the SCA3000_READ_REG() to the callers to avoid the
need for these helpers at all.

Note that is not an appropriate change for the large reads though as
spi_write_then_read() bounces all buffers and so would add a copy
to those high(ish) performance paths.
```

So the code we worked on was very old, and he recommended we use already existing iio infrastructure to do the same job. We had to study the code better in order to make the
appropriate changes.

### [PATCH v3]: changing the scope

This patch was in order to address Jonathan's suggestion: `sca3000_read_data_short()` was a function that read 1 byte, and we swapped it to a `spi_w8r8()` call. `sca3000_read_data()` read 2 bytes, so we used `spi_w8r16()` and there was a case that read larger buffers, so we kept the existing function. One example:
```diff
@@ -412,10 +416,11 @@ static int sca3000_read_ctrl_reg(struct sca3000_state *st,
        ret = sca3000_write_reg(st, SCA3000_REG_CTRL_SEL_ADDR, ctrl_reg);
        if (ret)
                goto error_ret;
-       ret = sca3000_read_data_short(st, SCA3000_REG_CTRL_DATA_ADDR, 1);
+
+       ret = spi_w8r8(st->us, SCA3000_READ_REG(SCA3000_REG_CTRL_DATA_ADDR));
        if (ret)
                goto error_ret;
-       return st->rx[0];
+       return ret;
 error_ret:
        return ret;
 }
```

Andy followed with comments like this:
```diff
Suggested-by: ? (IIRC Jonathan suggested this, but ignore if I am mistaken)

...

-                       *val = sign_extend32(be16_to_cpup((__be16 *)st->rx) >>
+                       *val = sign_extend32(be16_to_cpu((__be16) ret) >>

This doesn't look good, can you define a proper __be16 variable on
stack and use it instead of ret?
```

### [PATCH v4]: cleaning it even more

We made a few mistakes in this iteration. First, we forgot to CC every stakeholder in the response, so not everybody saw our work. Also, we didn't reply to every comment
from Andy. It was necessary to acknowledge we seen each and every review; it looked like we ignored his suggestions.

Jonathan made a lot of suggestions, such as using `spi_w8r16be()``to solve one of the problems pointed by Andy, and using other functions to clean up the code.
```diff
This shows the age of the code.  Just return in error paths above rather
than a error_ret: label

Might be a good idea to do a precursor patch tidying up any cases of this
before the one doin gthe spi changes in ehre.

> @@ -432,13 +434,13 @@ static int sca3000_print_rev(struct iio_dev *indio_dev)
>       struct sca3000_state *st = iio_priv(indio_dev);
> 
>       mutex_lock(&st->lock);

Another patch to use guard(mutex)(&st->lock); etc would be help clean this
up by allowing direct return in the error path.
```

There were now a lot of changes to be made. So our patch became a patchset: first one to clean up style, such as removing `error_ret` labels, second one to address the infrastructure change 
(using spi functions) and third one to change the way mutexes were used. From here on out the work was mainly done by my partner; i will still document it.

### [PATCH v5 1/3]: removing gotos

In this one he made style changes, like removing `goto`s:

```diff
@@ -577,7 +572,8 @@ static inline int __sca3000_get_base_freq(struct sca3000_state *st,

        ret = sca3000_read_data_short(st, SCA3000_REG_MODE_ADDR, 1);
        if (ret)
-               goto error_ret;
+               return ret;
+
        switch (SCA3000_REG_MODE_MODE_MASK & st->rx[0]) {
        case SCA3000_REG_MODE_MEAS_MODE_NORMAL:
                *base_freq = info->measurement_mode_freq;
@@ -591,7 +587,6 @@ static inline int __sca3000_get_base_freq(struct sca3000_state *st,
        default:
                ret = -EINVAL;
        }
-error_ret:
        return ret;
 }
```

This one was quickly approved and applied:
```diff
Andy Shevchenko <andriy.shevchenko@linux.intel.com> wrote:

> On Wed, Jun 11, 2025 at 04:39:19PM -0300, Andrew Ijano wrote:
> > Replace usage of error_ret labels by returning directly when handling
> > errors. Cases that do a mutex unlock were not changed. 
>
> Reviewed-by: Andy Shevchenko <andriy.shevchenko@linux.intel.com>
Applied this patch to the togreg branch of iio.git which is
initially pushed out as testing.

Thanks,

Jonathan
```

### [PATCH v5 2/3]: using spi helpers
Our initial patch idea, but now using `spi_w8r16be()` for big endian operations.
```diff
@@ -727,25 +706,22 @@ static int sca3000_read_raw(struct iio_dev *indio_dev,
                                return -EBUSY;
                        }
                        address = sca3000_addresses[chan->address][0];
-                       ret = sca3000_read_data_short(st, address, 2);
+                       ret = spi_w8r16be(st->us, SCA3000_READ_REG(address));
                        if (ret < 0) {
                                mutex_unlock(&st->lock);
                                return ret;
                        }
-                       *val = sign_extend32(be16_to_cpup((__be16 *)st->rx) >>
-                                            chan->scan_type.shift,
+                       *val = sign_extend32(ret >> chan->scan_type.shift,
+                                             chan->scan_type.realbits - 1);
```

We received some important comments:
1. Nuno pointed out that our change of sca3000_read_data() seemed out of place;
2. Andy mentioned some style changes that we could make;
3. Andy also mentioned that we should use sysfs_emit_at() instead of sprintf() for sysfs functions.

[PATCH v5 3/3]: using lock guards

For this one, he used the guard() for cleaning up the way we handle mutex locks in functions.
> We later discussed this change together. We didn't know this way of assuring mutexes are unlocked automatically upon its scope being exited, so we were
> excited to learn this new thing!

His implementation looked like this:
```diff
@@ -405,17 +405,14 @@ static int sca3000_print_rev(struct iio_dev *indio_dev)
        int ret;
        struct sca3000_state *st = iio_priv(indio_dev);

-       mutex_lock(&st->lock);
+       guard(mutex)(&st->lock);
        ret = spi_w8r8(st->us, SCA3000_READ_REG(SCA3000_REG_REVID_ADDR));
        if (ret < 0)
-               goto error_ret;
+               return ret;
        dev_info(&indio_dev->dev,
                 "sca3000 revision major=%lu, minor=%lu\n",
                 ret & SCA3000_REG_REVID_MAJOR_MASK,
                 ret & SCA3000_REG_REVID_MINOR_MASK);
-error_ret:
-       mutex_unlock(&st->lock);
-
        return ret;
 }
```

For this, there were two main comments:

1. Nuno suggested using `scoped_guard()`, since I was concerned that some placed were now locking a much larger scope than before;
2. Nuno, David, Jonathan and even the kernel test bot pointed out the use of `guard()` inside a `switch()` case. The solution is just defining a local scope there like this.

### [PATCH v6 1/4]: cleaning change of spi helpers
This patch fixed all remaining style changes and separated the change of `sca3000_read_data()` in a different patch.

### [PATCH v6 2/4]: cleaning the read function
This patch represents the change of `sca3000_read_data()`.

### [PATCH v6 3/4]: fixing lock guards usage
This patch had two main fixes:

- Fixing how we use guard inside switch() cases.
```c
case IIO_CHAN_INFO_SAMP_FREQ: {
        guard(mutex)(&st->lock);
        ret = sca3000_read_raw_samp_freq(st, val);
        return ret ? ret : IIO_VAL_INT;
}
```
- Using scoped_guard() for mutex locks in a small scope
```diff
-       mutex_lock(&st->lock);
-       ret = spi_w8r8(st->us, SCA3000_READ_REG(SCA3000_REG_MODE_ADDR));
-       mutex_unlock(&st->lock);
+       scoped_guard(mutex, &st->lock) {
+               ret = spi_w8r8(st->us, SCA3000_READ_REG(SCA3000_REG_MODE_ADDR));
+       }
```
### [PATCH v6 4/4]: better handling sysfs operations
This was a suggestion from Andy to use sysfs_emit_at() instead of sprintf() for sysfs operations as suggested in the documentation, since it is aware of PAGE_SIZE buffer.

```diff
-- a/drivers/iio/accel/sca3000.c
++ b/drivers/iio/accel/sca3000.c
@@ -423,16 +423,16 @@ sca3000_show_available_3db_freqs(struct device *dev,
 {
        struct iio_dev *indio_dev = dev_to_iio_dev(dev);
        struct sca3000_state *st = iio_priv(indio_dev);
-       int len;
+       unsigned int len = 0;

-       len = sprintf(buf, "%d", st->info->measurement_mode_3db_freq);
+       len = sysfs_emit_at(buf, len, "%d", st->info->measurement_mode_3db_freq);
        if (st->info->option_mode_1)
-               len += sprintf(buf + len, " %d",
+               len += sysfs_emit_at(buf, len, " %d",
                               st->info->option_mode_1_3db_freq);
        if (st->info->option_mode_2)
-               len += sprintf(buf + len, " %d",
+               len += sysfs_emit_at(buf, len, " %d",
                               st->info->option_mode_2_3db_freq);
-       len += sprintf(buf + len, "\n");
+       len += sysfs_emit_at(buf, len, "\n");

        return len;
 }
 ```