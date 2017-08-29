const imports = require("../utils/imports");

module.exports = answers => {
  const { componentName } = answers;

  const importPropTypes = answers.propTypes === "yes" ? imports.propTypes : "";
  const propTypes =
    answers.propTypes === "yes" ? `${componentName}.propTypes = {};` : "";
  const contextTypes =
    answers.contextTypes === "yes" ? `${componentName}.contextTypes = {};` : "";

  return `
  ${imports.react}
  ${importPropTypes}

  const ${componentName} = props => <div />;

  ${propTypes}
  ${contextTypes}
  
  export default ${componentName};
  `;
};
