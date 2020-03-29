'use strict';

import React from "react";
import Routes from "../../constants/RoutesConstants";
import {transitionToWithOpts} from "../../utils/Routing";
import Institutions from "./Institutions";
import {injectIntl} from "react-intl";
import withI18n from "../../i18n/withI18n";
import {connect} from "react-redux";
import {ROLE} from "../../constants/DefaultConstants";
import {loadInstitutions} from "../../actions/InstitutionsActions";
import {bindActionCreators} from "redux";
import {deleteInstitution} from "../../actions/InstitutionActions";

class InstitutionsController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAlert: false
        };
    }

    componentDidMount() {
        this.props.loadInstitutions();
    }

    _onEditInstitution = (institution) => {
        this.props.transitionToWithOpts(Routes.editInstitution, {
            params: {key: institution.key},
            handlers: {
                onCancel: Routes.institutions
            }
        });
    };

    _onAddInstitution = () => {
        this.props.transitionToWithOpts(Routes.createInstitution, {
            handlers: {
                onSuccess: Routes.institutions,
                onCancel: Routes.institutions
            }
        });
    };

    _onDeleteInstitution = (institution) => {
        this.props.deleteInstitution(institution);
        this.setState({showAlert: true});
    };

    render() {
        const {currentUser, institutionsLoaded, institutionDeleted} = this.props;
        if (!currentUser || currentUser.role !== ROLE.ADMIN) {
            return null;
        }
        const handlers = {
            onEdit: this._onEditInstitution,
            onCreate: this._onAddInstitution,
            onDelete: this._onDeleteInstitution
        };
        return <Institutions institutionsLoaded={institutionsLoaded} showAlert={this.state.showAlert}
                             handlers={handlers} institutionDeleted={institutionDeleted}/>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(withI18n(InstitutionsController)));

function mapStateToProps(state) {
    return {
        institutionsLoaded: state.institutions.institutionsLoaded,
        institutionDeleted: state.institution.institutionDeleted,
        currentUser: state.auth.user
    };
}

function mapDispatchToProps(dispatch) {
    return {
        deleteInstitution: bindActionCreators(deleteInstitution, dispatch),
        loadInstitutions: bindActionCreators(loadInstitutions, dispatch),
        transitionToWithOpts: bindActionCreators(transitionToWithOpts, dispatch)
    }
}