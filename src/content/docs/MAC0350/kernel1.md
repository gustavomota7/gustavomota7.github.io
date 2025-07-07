---
title: Finding patch candidates
description: Entry on the first part of contibuting to the linux kernel.
---

For this first task I teamed up with [Andrew Ijano](https://andrewijano.github.io/). We scoured the
provided [list](https://pad.riseup.net/p/MAC0470-iio-patch-keep) after a suitable candidate.

The first candidate I put my eyes on was `Suggestion 3.2: Add prefix to DC functions to improve the debug with ftrace`. I even found
a valid spot for refactoring, but we then decided to work on removing code duplication (Suggestion 4), as it seemed more interesting than the former.

From the list, we searched for good candidates. We settled on three:
1. Duplicated code in `magnetometer/bmc150_magn.c` between functions `bmc150_magn_compensate_x` and `bmc150_magn_compensate_y`;
2. Duplicated code in `accel/sca3000.c` between functions `sca3000_read_data` and `sca3000_read_data_short`;
3. Duplicated code in `chemical/sunrise_co2.c` between functions `sunrise_cal_background_write` and `sunrise_cal_factory_write`.

We decided to work on the second, since both functions seemed to have almost identical behavior:
```
// accel/sca3000.c
static int sca3000_read_data_short(struct sca3000_state *st,
                   u8 reg_address_high,
                   int len)
{
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

    return spi_sync_transfer(st->us, xfer, ARRAY_SIZE(xfer));
}
// ...
static int sca3000_read_data(struct sca3000_state *st,
                 u8 reg_address_high,
                 u8 *rx,
                 int len)
{
    int ret;
    struct spi_transfer xfer[2] = {
        {
            .len = 1,
            .tx_buf = st->tx,
        }, {
            .len = len,
            .rx_buf = rx,
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