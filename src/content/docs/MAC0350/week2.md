---
title: Week 2 - Tutorial 2
description: Entry on week two.
---

This report is about the activities done on the second week; mainly following the tutorial [Building and booting a custom Linux kernel for ARM](https://flusp.ime.usp.br/kernel/build-linux-for-arm/)

### Cloning the Linux tree

As suggested in the tutorial, we chose [IIO subsystem tree](https://git.kernel.org/pub/scm/linux/kernel/git/jic23/iio.git/) to clone and work on. We cloned the `testing` branch into a
separate folder and used the `--branch` and `--depth` options to reduce the amount of data we'd download (the trees are very big).

### Configuring the Linux kernel compilation

The tutorial had us familiarized with some tools used in the build process for the Linux kernel. After learning about the `kbuild` tool intricacies we created our own config file, and
booted the VM to fetch its modules list, so that we can compile only the modules needed.

### Building a custom Linux kernel

After changing out config file and giving a custom name to our build, we set up the correct compiler for the build (we were building for ARM) and started the compilation. It was very slow,
mainly because the kernel is a very complex program and because my work laptop is very slow.

### Installing modules and booting the custom-built Linux kernel

With the compilation complete we followed the tutorial to install all the modules we fetched from the VM earlier and to config the VM to boot with our new kernel image. After booting the VM
we checked if it was using out custom kernel running `uname --kernel-release`. It worked!