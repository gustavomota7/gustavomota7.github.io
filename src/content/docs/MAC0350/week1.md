---
title: Week 1 - Tutorial 1
description: Entry on week one.
---

This report is about the activities done on the first week; mainly following the tutorial [Setting up a test environment for Linux Kernel Dev using QEMU and libvirt](https://flusp.ime.usp.br/kernel/qemu-libvirt-setup/)

### Setting up the test environment

I had no problems installing the dependencies, so I fast approached creating the "all-in-one" script. There were a few hiccups trying to run it for the first time:
My shell of choice is `fish`, and because of that I thought I would need to adapt some of the commands; the script lauches a `bash` shell, so it shouldn't be a problem.
I still had a problem: my `bash` was configured to launch a `fish` shell at startup. That was dumb, so I decided to remove that behavior. 

### Configuring the VM

The main hiccup in this process was the performance of my work laptop: some operations (such as reading disk image's partitions and modifying it) were very slow.

There was a little problem with enabling the `libvirtd` daemon that took a good amount of time. It was just a typo, but it took a lot of eyes and time to pinpoint
such a little mistake. After following all the tutorial's steps, the VM started up as expected. There were also no problems configuring SSH access to the VM.
