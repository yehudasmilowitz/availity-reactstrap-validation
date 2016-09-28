import React, { PropTypes } from 'react';
import InputContainer from './AvInputContainer';
import AvFeedback from './AvFeedback';
import { FormGroup } from 'reactstrap';

const htmlValidationAttrs = ['required'];

const noop = () => {};

export default class AvRadioGroup extends InputContainer {
  static propTypes = Object.assign({}, FormGroup.propTypes, {
    name: PropTypes.string.isRequired,
  });

  static contextTypes = {
    FormCtrl: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    Group: PropTypes.object.isRequired,
    FormCtrl: PropTypes.object.isRequired,
  };

  state = {
    invalidInputs: {},
    dirtyInputs: {},
    touchedInputs: {},
    badInputs: {},
    validate: {},
    value: '',
  };

  value = '';

  updateValidations(props = this.props) {
    this.validations = Object.assign({}, props.validate);

    Object.keys(props)
      .filter(val => htmlValidationAttrs.indexOf(val) > -1)
      .forEach(attr => {
        if (props[attr]) {
          this.validations[attr] = this.validations[attr] || {value: props[attr]};
        } else {
          delete this.validations[attr];
        }
      });

    this.context.FormCtrl.register(this);
    this.validate();
  }

  componentWillUpdate(nextProps) {
    if (nextProps !== this.props) {
      this.updateValidations(nextProps);
    }
  }

  componentWillMount() {
    super.componentWillMount();
    this.value = this.getDefaultValue().value;
    this.setState({value: this.value});
    this.updateValidations();
  }

  getValue() {
    return this.value;
  }

  componentWillUnmount() {
    this.context.FormCtrl.unregister(this);
  }

  getInputState() {
    return this.context.FormCtrl.getInputState(this.props.name);
  }

  validate() {
    this.context.FormCtrl.validate(this.props.name);
  }

  getDefaultValue() {
    const key = 'defaultValue';

    const value = this.props[key] || this.context.FormCtrl.getDefaultValue(this.props.name) || '';

    return {key, value};
  }

  reset() {
    this.value = this.getDefaultValue().value;
    this.context.FormCtrl.setDirty(this.props.name, false);
    this.context.FormCtrl.setTouched(this.props.name, false);
    this.context.FormCtrl.setBad(this.props.name, false);
    this.setState({value: this.value});
    this.validate();
    this.props.onReset && this.props.onReset(this.value);
  }

  getChildContext() {
    this.FormCtrl = {...this.context.FormCtrl};
    this.FormCtrl.register = noop;
    this.FormCtrl.validate = noop;

    const updateGroup = (value) => {
      this.setState({value});
      this.value = value;
      this.validate();
    };

    return {
      Group: {
        name: this.props.name,
        update: updateGroup,
        inline: this.props.inline,
        value: this.value,
        getInputState: ::this.getInputState,
      },
      FormCtrl: this.FormCtrl,
    };
  }

  renderErrorMessage(validation) {
    if (validation.errorMessage) {
      return (<AvFeedback>{validation.errorMessage}</AvFeedback>);
    }

    return null;
  }

  render() {
    const legend = (this.props.label) ? (<legend>{this.props.label}</legend>) : '';
    const validation = this.getInputState();
    const errorMessage = this.renderErrorMessage(validation);
    const {
      errorMessage: omit1,
      validate: omit2,
      validationEvent: omit3,
      state: omit4,
      label: omit5,
      required: omit6,
      inline,
      children,
      ...attributes,
    } = this.props;

    let radios = children;

    if (inline) {
      radios = <FormGroup>{radios}</FormGroup>;
    }

    return (
      <FormGroup tag="fieldset" {...attributes} color={validation.color}>
        {legend}
        {radios}
        {errorMessage}
      </FormGroup>
    );
  }
}