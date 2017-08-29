const program = require("commander");
const path = require("path");
const pkg = require("../package.json");
const _ = require("lodash");
const prettier = require("prettier");
const inquirer = require("inquirer");
const fs = require("fs");
const chalk = require("chalk");

const classComponents = require("./templates/class");
const functional = require("./templates/functional");

program
  .version("0.1.0")
  .option("-c, --component", "Component")
  .option("-C, --container", "Container")
  .option("-d, --directory", "Create Directories for Components/Containers")
  .option("-f, --force", "Overwrite directories/files that exist")
  .parse(process.argv);

const baseDirectory = path.join(__dirname, "..");
const componentsDirectory = _.get(pkg, "cli.components")
  ? path.join(baseDirectory, _.get(pkg, "cli.components"))
  : path.join(baseDirectory, "src", "components");
const containersDirectory = _.get(pkg, "cli.containers")
  ? path.join(baseDirectory, _.get(pkg, "cli.containers"))
  : path.join(baseDirectory, "src", "containers");
const createFolder = program.directory || _.get(pkg, "cli.folders", false);

if (program.component || program.container) {
  const isEs6Class = function(opts) {
    return opts.type === "es6Class";
  };
  const isPure = function(opts) {
    return opts.type === "pure";
  };
  const isFunctional = function(opts) {
    return opts.type === "functional";
  };
  const isAnyClass = function(opts) {
    return isEs6Class(opts) || isPure(opts);
  };
  const outputType = program.component ? "component" : "container";
  inquirer
    .prompt([
      {
        type: "list",
        name: "type",
        message: `choose a ${outputType} type`,
        default: "es6Class",
        choices: [
          {
            name: "class",
            value: "es6Class"
          },
          "pure",
          {
            name: "functional/stateless",
            value: "functional"
          }
        ]
      },
      {
        type: "list",
        name: "propTypes",
        message: "Do you want to use propTypes?",
        choices: ["yes", "no"]
      },
      {
        type: "list",
        name: "contextTypes",
        message: "Do you want to use contextTypes?",
        choices: ["yes", "no"],
        when: isFunctional
      },
      {
        type: "list",
        name: "propTypesLocation",
        message: "should your prop types be inside of your class or outside?",
        choices: [
          {
            name: "inside (static)",
            value: "inside"
          },
          "outside"
        ],
        when: function(opts) {
          return isAnyClass(opts) && opts.propTypes === "yes";
        }
      },
      {
        type: "checkbox",
        name: "options",
        message: `choose your ${outputType} options`,
        choices: ["contextTypes", "childContext", "constructor", "state"],
        when: isAnyClass
      },
      {
        type: "list",
        name: "contextTypesLocation",
        message:
          "should your context types be inside of your class or outside?",
        choices: [
          {
            name: "inside (static)",
            value: "inside"
          },
          "outside"
        ],
        when: function(opts) {
          return (
            isAnyClass(opts) && opts.options.indexOf("contextTypes") !== -1
          );
        }
      },
      {
        type: "checkbox",
        name: "lifecycleMethods",
        message: "which lifecycle methods do you want to include",
        choices: [
          "componentWillMount",
          "componentDidMount",
          "componentWillUnmount",
          "componentWillReceiveProps",
          "shouldComponentUpdate",
          "componentWillUpdate",
          "componentDidUpdate"
        ],
        when: isAnyClass
      }
    ])
    .then(function(answers) {
      let template;
      const componentName = program.args[0];
      const opts = _.assign({ componentName }, _.omit(answers, ["type"]));
      if (isEs6Class(answers)) {
        template = classComponents.component(opts);
      } else if (isPure(answers)) {
        template = classComponents.pure(opts);
      } else if (isFunctional(answers)) {
        template = functional(opts);
      }

      const outputDirectory = program.component
        ? componentsDirectory
        : containersDirectory;

      if (createFolder) {
        if (fs.existsSync(path.join(outputDirectory, componentName))) {
          if (!program.force) {
            console.error(
              chalk.red(
                "Directory already exists, skipping. Use -f to overwrite file"
              )
            );
            process.exit();
          }
        } else {
          fs.mkdirSync(path.join(outputDirectory, componentName));
        }
      } else {
        if (fs.existsSync(path.join(outputDirectory, `${componentName}.js`))) {
          if (!program.force) {
            console.error(
              chalk.red(
                "Component already exists, skipping. Use -f to overwrite file"
              )
            );
            process.exit();
          }
        }
      }

      const componentPath = createFolder
        ? path.join(outputDirectory, componentName, "index.js")
        : path.join(outputDirectory, `${componentName}.js`);
      const generatedFile = prettier.format(template);
      fs.writeFile(componentPath, generatedFile, () => {
        console.log(chalk.green(`Generated ${componentName}!`));
        console.log("");
        console.log(generatedFile);
        console.log("");
        console.log(chalk.cyan(`Saved in ${componentPath}`));
      });
    });
}
