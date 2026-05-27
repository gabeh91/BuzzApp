import assert from "node:assert/strict";
import test from "node:test";

import { getDefaultConfig } from "../../schema/configSchema.ts";
import { generateRootFiles } from "../rootGenerator.ts";

test("root scaffold configures GraphQL codegen for Apollo hooks", () => {
  const files = generateRootFiles(getDefaultConfig());
  const packageJson = files.find((file) => file.path === "package.json");
  const codegenConfig = files.find((file) => file.path === "codegen.ts");

  assert.ok(packageJson);
  assert.match(packageJson.contents, /"graphql:codegen": "graphql-codegen --config codegen\.ts"/);
  assert.match(packageJson.contents, /"graphql:codegen:watch": "graphql-codegen --config codegen\.ts --watch"/);
  assert.match(packageJson.contents, /"supabase:migrate": "supabase migration up"/);
  assert.match(packageJson.contents, /"supabase:reset": "bash scripts\/db\/reset-local\.sh"/);
  assert.match(packageJson.contents, /"supabase:reset:baseline": "supabase db reset"/);
  assert.match(packageJson.contents, /"supabase:seed:demo": "bash scripts\/db\/seed-demo\.sh"/);
  assert.match(packageJson.contents, /"db:seed:demo": "bash scripts\/db\/seed-demo\.sh"/);
  assert.match(packageJson.contents, /"@graphql-codegen\/cli": "latest"/);
  assert.match(packageJson.contents, /"@graphql-codegen\/typescript-react-apollo": "latest"/);

  assert.ok(codegenConfig);
  assert.match(codegenConfig.contents, /apps\/mobile\/graphql\/generated\.tsx/);
  assert.match(codegenConfig.contents, /apps\/admin\/graphql\/generated\.tsx/);
  assert.match(codegenConfig.contents, /typescript-react-apollo/);
  assert.match(codegenConfig.contents, /apolloReactHooksImportFrom: "@apollo\/client"/);
  assert.match(codegenConfig.contents, /const supabaseSchemaKey =/);
  assert.match(codegenConfig.contents, /process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(codegenConfig.contents, /rootLocalEnv\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(codegenConfig.contents, /mobileLocalEnv\.SUPABASE_SERVICE_ROLE_KEY/);
});
