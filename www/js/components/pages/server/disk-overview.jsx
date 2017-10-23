/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2016, Joyent, Inc.
 */

var React = require('react');
var BackboneMixin = require('../../_backbone-mixin');
var ServerDiskUtilizationCircle = require('./disk-utilization-circle');
var utils = require('../../../lib/utils');
var POOL_USABLE_RATIO = 0.94;

var ServerDiskOverview = React.createClass({
    mixins: [BackboneMixin],
    getBackboneModels: function() {
        return [this.props.server];
    },
    render: function() {
        var server = this.props.server.toJSON();
        if (!server.vms) {
            return null;
        }

//      DAPI applies a pool usage ratio in its calculation of provisionable disk.
//      Unfortunately that's named unreserved_disk which is different from what it means
//      in this context. Here "unreserved" means what is not reserved by the system.
        var unreserved = server.disk_pool_size_bytes * POOL_USABLE_RATIO;
        var reserved = server.disk_pool_size_bytes - unreserved;
        var provisionable = server.unreserved_disk * 1048576;
        var provisioned = unreserved - provisionable;
        var total = server.disk_pool_size_bytes;

        if (provisioned < 0 || !provisioned) { provisioned = 0; }
        if (provisionable < 0 || !provisionable) {
            if (!provisionable && server.disk_pool_size_bytes) { provisionable = server.disk_pool_size_bytes; }
            else { provisionable = 0; }
        }
        if (total < 0 || !provisionable) { total = 0; }

        var provisioned = utils.getReadableSize(provisioned);
        var provisionable = utils.getReadableSize(provisionable);
        var reserved = utils.getReadableSize(reserved);
        var unreserved = utils.getReadableSize(unreserved);
        var total = utils.getReadableSize(server.disk_pool_size_bytes);

        return <div className="disk-overview">
            <div className="row">
                <div className="col-sm-12">
                    <h5 className="overview-title">Disk Utilization</h5>
                </div>
            </div>
            <div className="row">
                <div className="server-disk-utilization-container">
                    <ServerDiskUtilizationCircle diameter="120px" inner="38" server={this.props.server} />
                </div>
                <div className="provisionable-disk">
                    <div className="value">{provisionable.value + ' ' + provisionable.measure}</div>
                    <div className="title">
                        <a data-toggle="tooltip" data-placement="bottom" data-trigger="hover"
                            title="Amount of disk currently available for provisioning.">
                            Provisionable
                        </a>
                    </div>
                </div>
                <div className="provisioned-disk">
                    <div className="value">{provisioned.value + ' ' + provisioned.measure}</div>
                    <div className="title">
                        <a data-toggle="tooltip" data-placement="bottom" data-trigger="hover"
                            title="Amount of disk already committed to provisioned instances.">
                            Provisioned
                        </a>
                    </div>
                </div>
                <div className="reserved-disk">
                    <div className="value">{reserved.value + ' ' + reserved.measure}</div>
                    <div className="title">
                        <a data-toggle="tooltip" data-placement="bottom" data-trigger="hover"
                            title="Amount of disk reserved for system use.">
                            Reserved
                        </a>
                    </div>
                </div>
                <div className="unreserved-disk">
                    <div className="value">{unreserved.value + ' ' + unreserved.measure}</div>
                    <div className="title">
                        <a data-toggle="tooltip" data-placement="bottom" data-trigger="hover"
                            title="Total pool size minus disk reserved for system use.">
                            Unreserved
                        </a>
                    </div>
                </div>
                <div className="total-disk">
                    <div className="value">{total.value + ' ' + total.measure}</div>
                    <div className="title">
                        <a data-toggle="tooltip" data-placement="bottom" data-trigger="hover"
                            title="Total disk pool size.">
                            Total
                        </a>
                    </div>
                </div>
            </div>
        </div>;
    }
});

module.exports = ServerDiskOverview;
