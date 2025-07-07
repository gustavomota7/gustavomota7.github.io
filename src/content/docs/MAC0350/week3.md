---
title: Week 3 - Tutorial 3
description: Entry on week three.
---

This report is about the activities done on the third week; mainly following the tutorial [Introduction to Linux kernel build configuration and modules](https://flusp.ime.usp.br/kernel/modules-intro/)

### Creating a simple example module

First we created the file `${IIO_TREE}/drivers/misc/simple_mod.c` and added the code in the tutorial. This module simply logs some messages at initialization and exit.

### Creating the kernel configuration symbols and confuguring with menuconfig

We added our new module's config symbols in the `${IIO_TREE}/drivers/misc/Kconfig` file, added our module to the list of build objects with `obj-$(CONFIG_SIMPLE_MOD)		+= simple_mod.o`
and ran the `menuconfig` tool to flag our new module for compilation, making sure it is marked as a module and not as a kernel builtin.

### Building a custom Linux kernel again

After all this configuration we compiled the kernel again. With all succeded, we mounted the VM with the new image, booted it up and connected to it with SSH. We could verify it was
using the correct image.

### Installing Linux kernel modules

We checked info about our test module with `modinfo`. It all checked up, so we then listed all installed modules with `lsmod`. Our module naturally wasn't listed.

We installed our module with `insmod` and checked the kernel logs. Our message was there! So the module was installed and initialized correctly. Removing the module
with `rmmod` also prompted another message in the logs.

We tried this process using `modprobe`, and it also worked.

### Dependencies between kernel features

We modified our modules code to expose some functions to other modules. Then we created another module that used this function. After creating the symbols, enabling them
with `menuconfig`, building and loading the modules in the VM, we verified they were working.