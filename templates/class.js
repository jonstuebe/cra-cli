const lifecycles = require("../utils/lifecycles");
const imports = require("../utils/imports");
const _ = require("lodash");

const transformOptions = answers => {
  const { componentName } = answers;
  const importPropTypes = answers.propTypes === "yes" ? imports.propTypes : "";
  const propTypes =
    answers.propTypesLocation && answers.propTypesLocation === "inside"
      ? "static propTypes = {};"
      : "";
  const outsidePropTypes =
    answers.propTypesLocation && answers.propTypesLocation === "outside"
      ? `${componentName}.propTypes = {};`
      : "";
  const contextTypes =
    _.includes(answers.options, "contextTypes") &&
    answers.contextTypesLocation === "inside"
      ? `static contextTypes = {};`
      : "";
  let initialState = _.includes(answers.options, "state") ? `state = {};` : "";
  let constructor = "";
  if (_.includes(answers.options, "constructor")) {
    initialState = "";
    const stateInConstructor = _.includes(answers.options, "state")
      ? `this.state = {};`
      : "";
    constructor = `constructor(props) { super(props); ${stateInConstructor} }`;
  }

  const outsideContextTypes =
    answers.contextTypesLocation && answers.contextTypesLocation === "outside"
      ? `${componentName}.contextTypes = {};`
      : "";
  return {
    importPropTypes,
    propTypes,
    outsidePropTypes,
    contextTypes,
    outsideContextTypes,
    initialState,
    constructor
  };
};

const Component = (answers, pure = false) => {
  const { componentName } = answers;

  const {
    componentWillMount,
    componentDidMount,
    componentWillUnmount,
    componentWillReceiveProps,
    shouldComponentUpdate,
    componentWillUpdate,
    componentDidUpdate
  } = lifecycles(answers.lifecycleMethods);

  const {
    importPropTypes,
    propTypes,
    outsidePropTypes,
    contextTypes,
    outsideContextTypes,
    initialState,
    constructor
  } = transformOptions(answers);

  return `
    ${!pure ? imports.reactWithComponent : imports.reactWithPureComponent}
    ${importPropTypes}

    class ${componentName} extends ${!pure ? "Component" : "PureComponent"} {
      ${propTypes}
      ${contextTypes}
      ${initialState}
      ${constructor}
      ${componentWillMount}
      ${componentDidMount}
      ${componentWillUnmount}
      ${componentWillReceiveProps}
      ${shouldComponentUpdate}
      ${componentWillUpdate}
      ${componentDidUpdate}
      render() {
        return <div />;
      }
    }

    ${outsidePropTypes}
    ${outsideContextTypes}

    export default ${componentName};
    `;
};

const Pure = answers => {
  return Component(answers, true);
};

module.exports = {
  component: Component,
  pure: Pure
};
