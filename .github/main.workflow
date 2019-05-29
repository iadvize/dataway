workflow "Build and test" {
  resolves = ["Test"]
  on = "push"
}

action "Build" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "install"
}

action "Prettier" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680",
  needs = ["Build"],
  args = "prettier-check"
}

action "Test" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Build"]
  args = "test"
}
