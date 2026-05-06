#!/usr/bin/env node

process.env.BUZZ_STACK_CREATE_ALIAS = "true";

await import("./index.js");
