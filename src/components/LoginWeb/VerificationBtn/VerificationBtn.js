import React, { Component } from 'react';
import { connect } from 'dva';
import { message } from 'antd';
import { getCodeByMsg } from '@/services/login';

import CButton from '@/components/common/BasicWidgets/Widgets/CButton/CButton';

@connect(state => ({
  theme: state.global.theme,
}))
class VerificationBtn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: true,
      verificationTime: 60 //获取验证码周期，默认1分钟
    }
  }
  componentWillMount () {

  }
  componentDidMount () {

  }

  getVerification = () => {//获取验证码
    this.setState({
      verificationTime: 59
    })
    let int = setInterval(() => {
      let currentTime = this.state.verificationTime - 1
      if (currentTime === 0) {
        clearInterval(int)
        currentTime = 60
      }
      this.setState({
        verificationTime: currentTime
      })
    }, 1000)
    getCodeByMsg(this.props.currentTelphone).then(res => {
      message.success('短信已发送')
    })
  }

  render () {
    return (
      <CButton disabled={this.state.verificationTime === 0 || !this.props.currentTelphone} onClick={this.getVerification}>
        {this.state.verificationTime && this.state.verificationTime !== 60 ? `${this.state.verificationTime}s ` : ''}获取验证码
      </CButton>
    )
  }
}

export default VerificationBtn;