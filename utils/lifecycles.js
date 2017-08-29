const _ = require("lodash");

module.exports = methods => {
  const componentWillMount = _.includes(methods, "componentWillMount")
    ? `componentWillMount() {}`
    : "";
  const componentDidMount = _.includes(methods, "componentDidMount")
    ? `componentDidMount() {}`
    : "";
  const componentWillUnmount = _.includes(methods, "componentWillUnmount")
    ? `componentWillUnmount() {}`
    : "";
  const componentWillReceiveProps = _.includes(
    methods,
    "componentWillReceiveProps"
  )
    ? `componentWillReceiveProps(nextProps) {}`
    : "";
  const shouldComponentUpdate = _.includes(methods, "shouldComponentUpdate")
    ? `shouldComponentUpdate(nextProps, nextState) {}`
    : "";
  const componentWillUpdate = _.includes(methods, "componentWillUpdate")
    ? `componentWillUpdate(nextProps, nextState) {}`
    : "";
  const componentDidUpdate = _.includes(methods, "componentDidUpdate")
    ? `componentDidUpdate(prevProps, prevState) {}`
    : "";

  return {
    componentWillMount,
    componentDidMount,
    componentWillUnmount,
    componentWillReceiveProps,
    shouldComponentUpdate,
    componentWillUpdate,
    componentDidUpdate
  };
};

