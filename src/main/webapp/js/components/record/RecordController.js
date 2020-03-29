'use strict';

import React from 'react';
import {injectIntl} from "react-intl";
import withI18n from '../../i18n/withI18n';
import Record from './Record';
import Routes from "../../constants/RoutesConstants";
import {transitionTo, transitionToWithOpts} from '../../utils/Routing';
import {ACTION_FLAG, ACTION_STATUS} from "../../constants/DefaultConstants";
import {loadFormgen, unloadSavedRecord} from "../../actions/RecordActions";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {createRecord, loadRecord, unloadRecord, updateRecord} from "../../actions/RecordActions";
import * as EntityFactory from "../../utils/EntityFactory";
import RecordValidator from "../../validation/RecordValidator";
import * as RecordState from "../../model/RecordState";
import omit from 'lodash/omit';

class RecordController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            record: this._isNew() ? EntityFactory.initNewPatientRecord() : null,
            saved: false,
            showAlert: false
        };
    }

    componentDidMount() {
        const recordKey = this.props.match.params.key;

        if (!this.state.record) {
            this.props.loadRecord(recordKey);
        }
        if (this.props.recordSaved.actionFlag === ACTION_FLAG.CREATE_ENTITY && this.props.recordSaved.status === ACTION_STATUS.SUCCESS) {
            this.setState({showAlert: true});
            this.props.unloadSavedRecord();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {recordLoaded, recordSaved} = this.props;

        if (this.state.saved && recordLoaded.status !== ACTION_STATUS.PENDING
            && recordSaved.status === ACTION_STATUS.SUCCESS) {
            if (recordSaved.actionFlag === ACTION_FLAG.CREATE_ENTITY) {
                this.props.transitionToWithOpts(Routes.editRecord, {
                    params: {key: recordSaved.record.key},
                    handlers: {
                        onCancel: Routes.records
                    }
                });
            } else {
                this.setState({saved: false});
                this.props.loadRecord(this.state.record.key);
            }
        }

        if (prevProps.recordLoaded.status === ACTION_STATUS.PENDING && recordLoaded.status === ACTION_STATUS.SUCCESS) {
            const record = recordLoaded.record;
            record.state = RecordState.createRecordState();
            this.setState({record: record});
        }
    }

    componentWillUnmount() {
        this.props.unloadRecord();
    }

    _isNew() {
        return !this.props.match.params.key;
    }

    _onSave = () => {
        const currentUser = this.props.currentUser;
        const record = this.state.record;
        this.setState({saved: true, showAlert: true});
        record.question = this.recordComponent.refs.wrappedInstance.getWrappedComponent().getFormData();
        if (record.isNew) {
            this.props.createRecord(omit(record, 'isNew'), currentUser);
        } else {
            this.props.updateRecord(record, currentUser);
        }
    };

    _onCancel = () => {
        const handlers = this.props.viewHandlers[Routes.editRecord.name];
        if (handlers) {
            transitionTo(handlers.onCancel);
        } else {
            transitionTo(Routes.records);
        }
    };

    _onChange = (change) => {
        const update = {...this.state.record, ...change};
        if (RecordValidator.isComplete(update)) {
            update.state.recordComplete();
        } else {
            update.state.recordIncomplete();
        }
        this.setState({record: update});
    };

    render() {
        const {recordLoaded, recordSaved, currentUser, formgen, loadFormgen} = this.props;
        if (!currentUser) {
            return null;
        }
        const handlers = {
            onSave: this._onSave,
            onCancel: this._onCancel,
            onChange: this._onChange
        };
        return <Record ref={(c) => this.recordComponent = c} handlers={handlers} record={this.state.record}
                       recordLoaded={recordLoaded} recordSaved={recordSaved} showAlert={this.state.showAlert}
                       formgen={formgen} loadFormgen={loadFormgen}/>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps, undefined, {forwardRef: true})(injectIntl(withI18n(RecordController, {forwardRef: true})));

function mapStateToProps(state) {
    return {
        status: state.auth.status,
        currentUser: state.auth.user,
        recordLoaded: state.record.recordLoaded,
        recordSaved: state.record.recordSaved,
        viewHandlers: state.router.viewHandlers,
        formgen: state.record.formgen
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loadRecord: bindActionCreators(loadRecord, dispatch),
        unloadRecord: bindActionCreators(unloadRecord, dispatch),
        createRecord: bindActionCreators(createRecord, dispatch),
        updateRecord: bindActionCreators(updateRecord, dispatch),
        unloadSavedRecord: bindActionCreators(unloadSavedRecord, dispatch),
        loadFormgen: bindActionCreators(loadFormgen, dispatch),
        transitionToWithOpts: bindActionCreators(transitionToWithOpts, dispatch)
    }
}