'use strict';

import React from "react";
import {Button, Panel} from "react-bootstrap";
import Actions from "../../actions/Actions";
import Authentication from "../../utils/Authentication";
import InstitutionStore from "../../stores/InstitutionStore";
import I18nWrapper from "../../i18n/I18nWrapper";
import injectIntl from "../../utils/injectIntl";
import Input from "../Input";
import HorizontalInput from "../HorizontalInput";
import Mask from "../Mask";
import UserValidator from "../../validation/UserValidator";
import Vocabulary from "../../constants/Vocabulary";
import AlertMessage from "../AlertMessage";
import {ALERT_TYPES} from "../../constants/DefaultConstants";

class User extends React.Component {
    static propTypes = {
        user: React.PropTypes.object,
        handlers: React.PropTypes.object.isRequired,
        backToInstitution: React.PropTypes.bool,
        userSaved: React.PropTypes.object,
        userLoaded: React.PropTypes.object,
        showAlert: React.PropTypes.bool,
        usernameDisabled: React.PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.i18n = this.props.i18n;
        this.formatMessage = this.props.formatMessage;
        this.state = {
            institutions: InstitutionStore.getInstitutions() ? User._processInstitutions(InstitutionStore.getInstitutions()) : []
        };
    }

    componentDidMount() {
        if (this.state.institutions.length === 0 && Authentication.isAdmin()) {
            Actions.loadAllInstitutions();
        }
        this.unsubscribe = InstitutionStore.listen(this._onInstitutionsLoaded);
    }

    _onInstitutionsLoaded = (data) => {
        if (data.action === Actions.loadAllInstitutions) {
            this.setState({
                institutions: User._processInstitutions(data.data)
            });
        }
    };

    static _processInstitutions(institutions) {
        return institutions.map((item) => {
            return {label: item.name, value: item.uri}
        });
    };

    componentWillUnmount() {
        this.unsubscribe();
    }

    _onChange = (e) => {
        let change = {};
        change[e.target.name] = e.target.value;
        this.props.handlers.onChange(change);
    };

    _onInstitutionSelected = (e) => {
        const value = e.target.value,
            institution = InstitutionStore.getInstitutions().find((item) => item.uri === value),
            change = {
                institution: institution
            };
        this.props.handlers.onChange(change);
    };

    _onAdminStatusChange = (e) => {
        const isAdmin = e.target.checked;
        let types = this.props.user.types.slice();
        if (isAdmin) {
            types.push(Vocabulary.ADMIN_TYPE);
        } else {
            types.splice(types.indexOf(Vocabulary.ADMIN_TYPE), 1);
        }
        this.props.handlers.onChange({types: types});
    };

    _generateInstitutionsOptions = () => {
        let options = [];
        const len = this.state.institutions.length;
        for (let i = 0; i < len; i++) {
            let option = this.state.institutions[i];
            options.push(<option key={'opt_' + option.value} value={option.value}>{option.label}</option>);
        }
        options.unshift(<option key='opt_default' value='' disabled style={{display: 'none'}}>
            {this.i18n('select.default')}
        </option>);
        return options;
    };

    render() {
        const {userSaved, userLoaded, showAlert, user, handlers} = this.props;
        if (this.props.loading) {
            return <Mask text={this.i18n('please-wait')}/>;
        }
        if (userLoaded.error) {
            return <AlertMessage type={ALERT_TYPES.DANGER}
                 message={this.props.formatMessage('user.load-error', {error: this.props.userLoaded.error.message})}/>;
        }
        return <Panel header={<h3>{this.i18n('user.panel-title')}</h3>} bsStyle='primary'>
            <form className='form-horizontal' style={{margin: '0.5em 0 0 0'}}>
                <div className='row'>
                    <div className='col-xs-6'>
                        <HorizontalInput type='text' name='firstName' label={this.i18n('user.first-name')}
                               value={user.firstName}
                               labelWidth={3} inputWidth={8} onChange={this._onChange}/>
                    </div>
                    <div className='col-xs-6'>
                        <HorizontalInput type='text' name='lastName' label={this.i18n('user.last-name')}
                               value={user.lastName}
                               labelWidth={3} inputWidth={8} onChange={this._onChange}/>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-xs-6'>
                        <HorizontalInput type='text' name='username' label={this.i18n('user.username')}
                               disabled={userLoaded.success}
                               value={user.username} labelWidth={3} inputWidth={8} onChange={this._onChange}/>
                    </div>
                    <div className='col-xs-6'>
                        <HorizontalInput type='email' name='emailAddress' label={this.i18n('users.email')}
                               value={user.emailAddress}
                               labelWidth={3} inputWidth={8} onChange={this._onChange}/>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-xs-6'>
                        <HorizontalInput type='text' name='password' label={this.i18n('user.password')}
                               readOnly={true} value={user.password}
                               labelWidth={3} inputWidth={8}/>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-xs-6'>
                        <HorizontalInput type='select' name='institution' label={this.i18n('institution.panel-title')}
                                         onChange={this._onInstitutionSelected}
                                         value={user.institution ? user.institution.uri : ''}
                                         labelWidth={3} inputWidth={8}>
                            {this._generateInstitutionsOptions()}
                        </HorizontalInput>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-xs-4'>
                        <div className='col-xs-4'>&nbsp;</div>
                        <div className='col-xs-8' style={{padding: '0 0 0 25px'}}>
                            <Input type='checkbox' checked={Authentication.isAdmin(user)}
                                   onChange={this._onAdminStatusChange}
                                   label={this.i18n('user.is-admin')} inline={true}
                                   disabled={!Authentication.isAdmin()}/>
                        </div>
                    </div>
                </div>
                <div style={{margin: '1em 0em 0em 0em', textAlign: 'center'}}>
                    <Button bsStyle='success' bsSize='small' ref='submit'
                            disabled={!UserValidator.isValid(user)}
                            onClick={handlers.onSave}>
                        {this.i18n('save')}{userSaved.fetching && <div className="loader"></div>}
                        </Button>
                    <Button bsStyle='link' bsSize='small' onClick={handlers.onCancel}>
                        {this.i18n(this.props.backToInstitution ? 'users.back-to-institution' : 'cancel')}
                    </Button>
                </div>
                {showAlert && userSaved.error &&
                    <AlertMessage type={ALERT_TYPES.DANGER}
                                  message={this.props.formatMessage('user.save-error', {error: this.props.userSaved.error.message})}/>}
                {showAlert && userSaved.success &&
                    <AlertMessage type={ALERT_TYPES.SUCCESS} message={this.props.i18n('user.save-success')}/>}
            </form>
        </Panel>;
    }
}

export default injectIntl(I18nWrapper(User));
