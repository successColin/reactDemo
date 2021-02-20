import React, { Component } from 'react';
import { Slider, InputNumber, Row, } from 'antd';

class SliderAndInput extends Component {
  static getDerivedStateFromProps(props, state) {
    const { value } = props;
    if (value !== state.inputValue) {
      return {
        inputValue: value,
      };
    }
    return null;
  }

  state = {
    inputValue: 0,
  };

  // 值的修改
  onChange = (value) => {
    const { onChange } = this.props;
    if (onChange) onChange(value);
  };

  render() {
    const { inputValue } = this.state;
    const { min = 20, max = 40 } = this.props;
    return (
      <Row>
        <Slider
          min={min}
          max={max}
          onChange={this.onChange}
          value={typeof inputValue === 'number' ? inputValue : 25}
        />
        <InputNumber
          min={min}
          max={max}
          // style={{ margin: '0 16px' }}
          value={inputValue}
          onChange={this.onChange}
        />
      </Row>
    );
  }
}

export default SliderAndInput;
