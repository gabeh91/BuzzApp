#!/usr/bin/env node

import { Command } from "commander";

import { registerBootstrapCommand } from "./commands/bootstrap.js";
import { registerConfigureCommand } from "./commands/configure.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerEnvCommand } from "./commands/env.js";
import { registerGenerateCommand } from "./commands/generate.js";
import { registerInitCommand } from "./commands/init.js";
import { registerSecretsCommand } from "./commands/secrets.js";
import { isCreateBuzzStackInvocation } from "./utils/invocation.js";

const program = new Command();
const invocation = process.argv[1] ?? "buzz-stack";
const invokedAsCreate = isCreateBuzzStackInvocation(invocation);

program
  .name(invokedAsCreate ? "create-buzz-stack" : "buzz-stack")
  .description("Bootstrap and maintain the Buzz engineering stack.")
  .version("0.1.0");

registerInitCommand(program);
registerBootstrapCommand(program);
registerConfigureCommand(program);
registerDoctorCommand(program);
registerEnvCommand(program);
registerSecretsCommand(program);
registerGenerateCommand(program);

if (invokedAsCreate && process.argv.length <= 2) {
  process.argv.push("init");
}

await program.parseAsync(process.argv);
